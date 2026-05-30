/**
 * @module utils
 * @description 工具模块入口。统一导出所有子模块的公共 API，供框架其他模块
 * 和业务代码通过 `import { xxx } from 'ee-core/utils'` 引用。
 *
 * 导出来源：
 * - extend：对象深度合并
 * - is：Electron 运行环境检测（进程类型、操作系统、架构）
 * - json：JSON 文件同步/异步读写
 * - pargv：命令行参数解析
 * - wrap：文件路径到属性路径转换
 * - helper：通用工具函数（防抖、休眠、版本比较等）
 * - port：TCP 端口分配
 * - ip：公网 IP 查询
 */
export * from './extend.js';
export * from './is.js';
export * from './json.js';
export * from './pargv.js';
export * from './wrap.js';
export * from './helper.js';
export * from './port/index.js';
export { publicIpv4, publicIpv6 } from './ip.js';

import os from 'os';
import path from 'path';
import fs from 'fs';
import { exec, execSync } from 'child_process';
import { createHash } from 'crypto';
import { getBaseDir } from '../ps/index.js';
import { readSync } from './json.js';
import * as is from './is.js';

const { platform } = process;

/** Windows 注册表二进制路径（区分 32 位和 64 位架构） */
const win32RegBinPath: Record<string, string> = {
  /** 原生架构（64 位系统上的 64 位 Node） */
  native: '%windir%\\System32',
  /** 混合架构（64 位系统上的 32 位 Node，需通过 sysnative 重定向） */
  mixed: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32',
};

/**
 * 各平台获取机器唯一标识的命令
 *
 * - macOS：通过 ioreg 读取 IOPlatformUUID
 * - Windows：通过注册表读取 MachineGuid
 * - Linux：读取 /var/lib/dbus/machine-id 或 /etc/machine-id
 * - FreeBSD：通过 kenv 或 sysctl 读取 UUID
 */
const MachineGuid: Record<string, string> = {
  darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
  win32: `${win32RegBinPath[_isWindowsProcessMixedOrNativeArchitecture()]}\\REG.exe ` +
    'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
    '/v MachineGuid',
  linux: '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
  freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid',
};

/**
 * 获取项目根目录的 package.json 内容
 *
 * 读取项目根目录下 package.json 文件并解析为对象，
 * 用于获取应用名称、版本号等元信息。
 *
 * @returns package.json 解析后的对象
 */
export function getPackage(): unknown {
  const json = readSync(path.join(getBaseDir(), 'package.json'));
  return json;
}

/**
 * 获取第一个有效的 MAC 地址
 *
 * 遍历本机网络接口，返回第一个非零 MAC 地址。
 * 零值 MAC（00:00:00:00:00:00）通常表示虚拟接口，会被跳过。
 *
 * @param iface - 指定网络接口名称，不传则遍历所有接口
 * @returns 第一个有效的 MAC 地址字符串
 * @throws Error - 指定接口不存在、无有效 MAC 或全局无有效 MAC 时抛出
 */
export function getMAC(iface?: string): string {
  const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;
  const list = os.networkInterfaces();
  if (iface) {
    // 在指定接口中查找
    const parts = list[iface];
    if (!parts) {
      throw new Error(`interface ${iface} was not found`);
    }
    for (const part of parts) {
      if (zeroRegex.test(part.mac) === false) {
        return part.mac;
      }
    }
    throw new Error(`interface ${iface} had no valid mac addresses`);
  } else {
    // 遍历所有接口查找第一个有效 MAC
    for (const [, parts] of Object.entries(list)) {
      if (!parts) continue;
      for (const part of parts) {
        if (zeroRegex.test(part.mac) === false) {
          return part.mac;
        }
      }
    }
  }
  throw new Error('failed to get the MAC address');
}

/**
 * 检查输入是否为有效的 MAC 地址格式
 *
 * MAC 地址格式：XX:XX:XX:XX:XX:XX 或 XX-XX-XX-XX-XX-XX，
 * 每段 1-2 位十六进制字符。
 *
 * @param macAddress - 待检查的字符串
 * @returns true 表示符合 MAC 地址格式
 */
export function isMAC(macAddress: string): boolean {
  const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
  return macRegex.test(macAddress);
}

/**
 * 检查协议是否为文件协议
 *
 * @param protocol - 协议字符串
 * @returns true 表示是 file:// 协议
 */
export function isFileProtocol(protocol: string): boolean {
  return protocol === 'file://';
}

/**
 * 检查协议是否为 Web 协议（http 或 https）
 *
 * @param protocol - 协议字符串
 * @returns true 表示是 http:// 或 https:// 协议
 */
export function isWebProtocol(protocol: string): boolean {
  return ['http://', 'https://'].includes(protocol);
}

/**
 * 检查项目是否为 JavaScript 项目（非 TypeScript）
 *
 * 通过检查入口文件 main.js 或 index.js 是否存在来判断。
 * TypeScript 项目使用 main.ts 作为入口。
 *
 * @param baseDir - 项目根目录
 * @returns true 表示是 JS 项目
 */
export function isJsProject(baseDir: string): boolean {
  const entryFile1 = path.join(baseDir, 'electron', 'main.js');
  const entryFile2 = path.join(baseDir, 'electron', 'index.js');
  return fs.existsSync(entryFile1) || fs.existsSync(entryFile2);
}

/**
 * 同步获取机器唯一标识（哈希值）
 *
 * 通过执行平台特定的命令获取机器标识，默认返回 SHA-256 哈希值。
 * 设置 original 为 true 可返回原始值。
 *
 * @param original - 是否返回原始值而非哈希值，默认 false
 * @returns 机器唯一标识字符串
 * @throws Error - 不支持的操作系统平台
 */
export function machineIdSync(original = false): string {
  const cmd = MachineGuid[platform];
  if (!cmd) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  const id = _expose(execSync(cmd).toString());
  return original ? id : _hash(id);
}

/**
 * 异步获取机器唯一标识（哈希值）
 *
 * 通过异步执行平台特定的命令获取机器标识，默认返回 SHA-256 哈希值。
 * 适用于不希望阻塞事件循环的场景。
 *
 * @param original - 是否返回原始值而非哈希值，默认 false
 * @returns 机器唯一标识字符串的 Promise
 * @throws Error - 不支持的操作系统平台或命令执行失败
 */
export function machineId(original = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = MachineGuid[platform];
    if (!cmd) {
      return reject(new Error(`Unsupported platform: ${platform}`));
    }
    exec(cmd, {}, (err: Error | null, stdout: string | Buffer) => {
      if (err) {
        return reject(new Error(`Error while obtaining machine id: ${err.stack}`));
      }
      const id = _expose(stdout.toString());
      return resolve(original ? id : _hash(id));
    });
  });
}

/**
 * 获取平台标识字符串
 *
 * 返回当前操作系统和架构的组合标识，用于构建产物命名和平台判断。
 *
 * @param delimiter - 分隔符，默认 '_'
 * @param isDiffArch - 是否区分架构位数（仅 Windows 有效），默认 false
 * @returns 平台标识（如 'windows_64'、'macos_apple'、'linux'）
 */
export function getPlatform(delimiter = '_', isDiffArch = false): string {
  if (process.platform === 'win32') {
    let os = 'windows';
    if (isDiffArch) {
      os += delimiter + (process.arch === 'x64' ? '64' : '32');
    }
    return os;
  }
  if (process.platform === 'darwin') {
    // macOS 区分 Intel (x64) 和 Apple Silicon (arm64)
    const core = process.arch === 'arm64' ? 'apple' : 'intel';
    return 'macos' + delimiter + core;
  }
  return 'linux';
}

/**
 * 检测 Windows 下 Node.js 进程架构是否为混合模式
 *
 * 在 64 位 Windows 上运行 32 位 Node.js 时为 'mixed'，
 * 其他情况为 'native'。
 * 用于确定访问注册表的正确系统路径。
 *
 * @returns 'mixed'（32 位 Node on 64 位 Windows）或 'native'
 */
function _isWindowsProcessMixedOrNativeArchitecture(): string {
  if (process.platform !== 'win32') {
    return '';
  }
  // 32 位 Node 在 64 位 Windows 上运行时，环境变量中存在 PROCESSOR_ARCHITEW6432
  if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
    return 'mixed';
  }
  return 'native';
}

/**
 * 对机器标识进行 SHA-256 哈希
 *
 * 将原始标识哈希后返回，避免暴露真实机器信息。
 *
 * @param guid - 原始机器标识字符串
 * @returns SHA-256 哈希后的十六进制字符串
 */
function _hash(guid: string): string {
  return createHash('sha256').update(guid).digest('hex');
}

/**
 * 从命令输出中提取机器标识
 *
 * 各平台命令输出格式不同，此函数负责解析并提取纯标识值。
 *
 * @param result - 命令执行输出字符串
 * @returns 清理后的机器标识字符串
 * @throws Error - 不支持的平台
 */
function _expose(result: string): string {
  switch (platform) {
    case 'darwin': {
      // ioreg 输出中 IOPlatformUUID 后面跟的是 UUID 值
      const parts = result.split('IOPlatformUUID');
      const part = parts[1];
      if (!part) return '';
      const lines = part.split('\n');
      const line = lines[0];
      if (!line) return '';
      return line.replace(/\=|\s+|"/gi, '').toLowerCase();
    }
    case 'win32': {
      // REG QUERY 输出中 REG_SZ 后面跟的是值
      const parts = result.toString().split('REG_SZ');
      const part = parts[1];
      if (!part) return '';
      return part.replace(/\r+|\n+|\s+/gi, '').toLowerCase();
    }
    case 'linux':
      return result.toString().replace(/\r+|\n+|\s+/gi, '').toLowerCase();
    case 'freebsd':
      return result.toString().replace(/\r+|\n+|\s+/gi, '').toLowerCase();
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

/** 导出 is 模块的所有环境检测函数，供外部直接使用 */
export { is };
