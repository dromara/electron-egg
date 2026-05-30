/**
 * @module utils/port
 * @description 端口分配工具。提供 getPort() 函数，在指定范围内查找可用的 TCP 端口，
 * 并通过锁定机制防止同一进程内的并发端口冲突。
 *
 * 端口分配策略：
 * 1. 创建临时 TCP 服务器监听目标端口，验证端口是否可用
 * 2. 检查端口是否在锁定集合中（防止并发分配同一端口）
 * 3. 若端口不可用或已锁定，自动递增端口号继续尝试
 * 4. 端口 0 表示让操作系统自动分配随机可用端口
 *
 * 锁定机制：
 * - 使用 old 和 young 两个 Set 维护已分配端口
 * - 每 15 秒轮转一次：young → old，old 被清空释放
 * - 两级锁确保端口在分配后的短时间内不会被重复分配
 * - 调用 releasePortLocks() 可手动清理所有锁定
 */
import net from 'net';
import os from 'os';

/**
 * 端口锁定错误
 *
 * 当指定端口已被锁定（正在使用中）时抛出此错误。
 */
class Locked extends Error {
  constructor(port: number) {
    super(`${port} is locked`);
  }
}

/** 已锁定端口集合，分 old 和 young 两级 */
const lockedPorts = {
  /** 上一轮锁定的端口，即将被释放 */
  old: new Set<number>(),
  /** 当前轮锁定的端口 */
  young: new Set<number>(),
};

/**
 * 端口锁定轮转间隔（毫秒）
 *
 * 每隔此时间，old 集合被丢弃（端口释放），
 * young 集合移入 old，新的 young 集合创建。
 * 两级轮转确保端口至少被锁定 15 秒。
 */
const releaseOldLockedPortsIntervalMs = 1000 * 15;

/** 轮转定时器引用，延迟创建，避免空载时占用资源 */
let interval: NodeJS.Timeout | undefined;

/**
 * 获取本机所有网络接口地址
 *
 * 收集所有网络接口的 IP 地址，并添加 undefined（表示使用默认主机）
 * 和 '0.0.0.0'（表示监听所有 IPv4 接口）。
 * 当未指定 host 时，需要在所有接口上验证端口可用性。
 *
 * @returns 主机地址集合
 */
const getLocalHosts = (): Set<string | undefined> => {
  const interfaces = os.networkInterfaces();
  // undefined 让 createServer 使用默认主机；
  // '0.0.0.0' 是 IPv4 通配地址，防止 createServer 默认使用 IPv6
  const results = new Set<string | undefined>([undefined, '0.0.0.0']);

  for (const _interface of Object.values(interfaces)) {
    if (!_interface) continue;
    for (const config of _interface) {
      results.add(config.address);
    }
  }

  return results;
};

/**
 * 检查单个端口在指定主机上是否可用
 *
 * 创建临时 TCP 服务器尝试监听，成功则端口可用，失败则端口被占用。
 * 使用 server.unref() 确保临时服务器不会阻止进程退出。
 *
 * @param options - net.ListenOptions，包含 port 和 host
 * @returns 可用端口号
 */
const checkAvailablePort = (options: net.ListenOptions): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    // 不阻止进程退出
    server.unref();
    server.on('error', reject);

    server.listen(options, () => {
      const address = server.address();
      const port = typeof address === 'string' ? 0 : address?.port || 0;
      server.close(() => {
        resolve(port);
      });
    });
  });

/**
 * 在多个主机上验证端口可用性
 *
 * 当未指定 host 时，需要逐一在所有本机网络接口上验证端口可用，
 * 确保端口在所有接口上都未被占用。
 * EADDRNOTAVAIL 和 EINVAL 错误表示该接口不支持此端口，可跳过。
 *
 * @param options - 监听选项
 * @param hosts - 主机地址集合
 * @returns 可用端口号
 */
const getAvailablePort = async (options: net.ListenOptions, hosts: Set<string | undefined>): Promise<number> => {
  // 指定了 host 或端口为 0（系统自动分配）时，只需检查一次
  if (options.host || options.port === 0) {
    return checkAvailablePort(options);
  }

  // 未指定 host 时，在所有接口上逐一验证
  for (const host of hosts) {
    try {
      await checkAvailablePort({ port: options.port, host });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      // 地址不可用或无效：该接口不支持此端口，跳过继续检查
      if (!['EADDRNOTAVAIL', 'EINVAL'].includes(err.code || '')) {
        throw error;
      }
    }
  }

  return options.port || 0;
};

/**
 * 生成端口检查序列
 *
 * 按用户指定的端口列表顺序逐一尝试，若全部不可用则回退到端口 0
 * （由操作系统自动分配随机可用端口）。
 *
 * @param ports - 用户指定的端口列表
 * @yields 待检查的端口号
 */
function* portCheckSequence(ports?: number[]): Generator<number> {
  if (ports) {
    for (const port of ports) {
      yield port;
    }
  }

  // 所有指定端口都不可用时，回退到系统自动分配
  yield 0;
}

/** getPort 函数选项 */
export interface GetPortOptions {
  /**
   * 首选端口号或端口范围数组。
   * - 数字：尝试指定端口，不可用则递增
   * - 数组：按顺序尝试，全部不可用则系统自动分配
   * - 不指定：系统自动分配随机可用端口
   */
  port?: number | number[];
  /** 绑定的主机地址，不指定则检查所有接口 */
  host?: string;
}

/**
 * 获取一个可用的 TCP 端口
 *
 * 在指定端口范围内查找可用端口，并通过两级锁定机制防止并发分配冲突。
 * 查找流程：
 * 1. 按端口检查序列逐一尝试绑定
 * 2. 检查端口是否在锁定集合中（old 或 young）
 * 3. 锁定冲突时，若指定了端口号则抛出 Locked，否则自动获取新端口
 * 4. 找到可用端口后加入 young 锁定集合并返回
 *
 * @param options - 端口查找选项
 * @returns 可用端口号
 * @throws Error - 所有端口都不可用时抛出
 *
 * @example
 * ```ts
 * // 获取系统自动分配的随机端口
 * const port = await getPort();
 *
 * // 尝试指定端口，不可用时自动寻找下一个
 * const port = await getPort({ port: 3000 });
 *
 * // 尝试多个候选端口
 * const port = await getPort({ port: [3000, 3001, 3002] });
 * ```
 */
export async function getPort(options?: GetPortOptions): Promise<number> {
  let ports: number[] | undefined;

  if (options) {
    ports = typeof options.port === 'number' ? [options.port] : options.port;
  }

  // 延迟创建轮转定时器，首次调用时初始化
  if (interval === undefined) {
    interval = setInterval(() => {
      // 轮转锁定集合：young → old，old 被清空释放
      lockedPorts.old = lockedPorts.young;
      lockedPorts.young = new Set();
    }, releaseOldLockedPortsIntervalMs);

    // unref 确保定时器不会阻止进程退出（Electron/Jest 等环境可能没有 unref）
    if (interval.unref) {
      interval.unref();
    }
  }

  const hosts = getLocalHosts();

  for (const port of portCheckSequence(ports)) {
    try {
      let availablePort = await getAvailablePort({ ...options, port }, hosts);
      // 检查端口是否在锁定集合中，防止并发分配同一端口
      while (lockedPorts.old.has(availablePort) || lockedPorts.young.has(availablePort)) {
        // 指定了端口号但被锁定 → 抛出异常让调用方知道
        if (port !== 0) {
          throw new Locked(port);
        }

        // 系统自动分配的端口被锁定 → 再请求一个新端口
        availablePort = await getAvailablePort({ ...options, port: 0 }, hosts);
      }

      // 找到可用端口，加入 young 锁定集合
      lockedPorts.young.add(availablePort);
      return availablePort;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      // EADDRINUSE（端口被占用）和 EACCES（权限不足）是预期错误，继续尝试下一个端口
      if (!['EADDRINUSE', 'EACCES'].includes(err.code || '') && !(error instanceof Locked)) {
        throw error;
      }
    }
  }

  throw new Error('No available ports found');
}

/**
 * 清理端口锁定资源
 *
 * 清除轮转定时器并释放所有锁定端口。
 * 在应用关闭时调用，确保资源清理干净，避免定时器泄漏。
 */
export function releasePortLocks(): void {
  if (interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
  lockedPorts.old.clear();
  lockedPorts.young.clear();
}
