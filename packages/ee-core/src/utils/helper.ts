/**
 * @module utils/helper
 * @description 通用工具函数集合。提供防抖、休眠、版本比较、文件操作、
 * 命令行参数处理等常用功能，供框架各模块和业务代码调用。
 */
import fs from 'fs';
import path from 'path';
import { parseArgv } from './pargv.js';

const _basePath = process.cwd();

/**
 * 创建防抖函数工厂
 *
 * 返回一个防抖包装器，该包装器对传入的函数实施防抖控制。
 *
 * 防抖机制说明：
 * - 当 delayTime 为 0 或 isImedite 为 true 时，函数立即执行（无防抖）
 * - 否则，设置定时器延迟执行；若同一函数在定时器触发前再次调用，
 *   则取消前一个定时器并重新计时，确保函数只在最后一次调用后的
 *   delayTime 毫秒后执行一次
 * - 使用 Map 以函数引用为键存储定时器，支持同时对多个不同函数防抖
 * - 定时器触发后自动从 Map 中清理，避免内存泄漏
 *
 * @returns 防抖包装器函数
 * @param fn - 需要防抖的目标函数
 * @param delayTime - 延迟时间（毫秒），0 或不传则立即执行
 * @param isImedite - 是否立即执行，true 时跳过防抖直接调用
 * @param args - 传递给目标函数的参数
 *
 * @example
 * ```ts
 * const debounce = fnDebounce();
 * // 防抖调用：300ms 内重复调用只执行最后一次
 * debounce(myFunction, 300, false, data);
 * // 立即执行：不经过防抖
 * debounce(myFunction, 0, true, data);
 * ```
 */
export function fnDebounce(): (
  fn: (args?: unknown) => void,
  delayTime?: number,
  isImedite?: boolean,
  args?: unknown
) => void {
  const fnMap = new Map<(...args: unknown[]) => void, { delayTime: number; timer: NodeJS.Timeout }>();

  return (fn, delayTime, isImedite, args) => {
    const setTimer = () => {
      const timer = setTimeout(() => {
        fn(args);
        clearTimeout(timer);
        // 定时器执行完毕后从 Map 中移除，释放引用
        fnMap.delete(fn);
      }, delayTime);

      fnMap.set(fn, { delayTime: delayTime || 0, timer });
    };

    // 无延迟或要求立即执行时，直接调用函数不走防抖逻辑
    if (!delayTime || isImedite) return fn(args);

    // 同一函数已有待执行定时器，取消旧的重新计时（防抖核心逻辑）
    const existing = fnMap.get(fn);
    if (existing) {
      clearTimeout(existing.timer);
    }
    setTimer();
  };
}

/**
 * 生成随机字符串
 *
 * 基于 Math.random() 生成约 10 位随机字母数字字符串。
 * 适用于生成临时标识符，不适用于安全场景。
 *
 * @returns 随机字符串（如 'x3k9m2a1b5'）
 */
export function getRandomString(): string {
  return Math.random().toString(36).substring(2);
}

/**
 * 递归创建目录
 *
 * 若目录已存在则不报错，等同于 mkdir -p。
 *
 * @param filepath - 要创建的目录路径
 * @param opt - 可选参数，mode 指定目录权限
 */
export function mkdir(filepath: string, opt: { mode?: number } = {}): void {
  fs.mkdirSync(filepath, { recursive: true, ...opt });
}

/**
 * 递归修改文件和目录权限
 *
 * 遍历指定路径下的所有文件和子目录，递归修改权限。
 * 先修改子文件/子目录的权限，最后修改根目录本身的权限。
 *
 * @param filepath - 目标目录路径
 * @param mode - 权限数值（如 0o755）
 */
export function chmodPath(filepath: string, mode: number): void {
  if (fs.existsSync(filepath)) {
    const files = fs.readdirSync(filepath);
    files.forEach((file) => {
      const curPath = path.join(filepath, file);
      if (fs.statSync(curPath).isDirectory()) {
        // 递归处理子目录
        chmodPath(curPath, mode);
      } else {
        fs.chmodSync(curPath, mode);
      }
    });
    // 最后修改目录本身的权限
    fs.chmodSync(filepath, mode);
  }
}

/**
 * 比较两个语义化版本号的大小
 *
 * 将版本号按 '.' 分割后逐段比较数值大小。
 * 版本段数不足时补 0 对齐。
 *
 * @param v1 - 第一个版本号（如 '1.2.3'）
 * @param v2 - 第二个版本号（如 '1.3.0'）
 * @returns v1 > v2 返回 1，v1 < v2 返回 -1，相等返回 0
 */
export function compareVersion(v1: string, v2: string): number {
  const s1 = v1.split('.');
  const s2 = v2.split('.');
  const len = Math.max(s1.length, s2.length);

  // 短版本号补零对齐，如 '1.2' 补为 '1.2.0'
  while (s1.length < len) {
    s1.push('0');
  }
  while (s2.length < len) {
    s2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(s1[i] || '0');
    const num2 = parseInt(s2[i] || '0');

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

/**
 * 序列化对象为 JSON 字符串
 *
 * 与 JSON.stringify 的区别在于可排除指定字段，用于隐藏敏感信息。
 *
 * @param obj - 要序列化的对象
 * @param ignore - 需要排除的属性名列表
 * @returns 过滤后的 JSON 字符串
 */
export function stringify(obj: Record<string, unknown>, ignore: string[] = []): string {
  const result: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    if (!ignore.includes(key)) {
      result[key] = obj[key];
    }
  });
  return JSON.stringify(result);
}

/**
 * 检查值是否有效
 *
 * 判断值是否为非 null、非 undefined、非空字符串。
 * 常用于配置项校验和参数有效性检查。
 *
 * @param value - 待检查的值
 * @returns true 表示值有效，false 表示值为 null/undefined/空字符串
 */
export function validValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

/**
 * 检查配置文件是否存在
 *
 * 在项目根目录下检查指定路径的文件是否存在，
 * 用于配置加载前的预检。
 *
 * @param prop - 相对于项目根目录的文件路径
 * @returns true 表示文件存在
 */
export function checkConfig(prop: string): boolean {
  const filepath = path.join(_basePath, prop);
  return fs.existsSync(filepath);
}

/**
 * 异步休眠
 *
 * 返回 Promise，在指定毫秒数后 resolve。
 * 休眠期间释放事件循环，允许其他异步任务执行。
 *
 * @param ms - 休眠时间（毫秒）
 * @returns 在 ms 毫秒后 resolve 的 Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 朴素同步休眠实现（轮询等待）
 *
 * 通过 while 循环不断检查时间，CPU 占用率高。
 * 仅在 Atomics.wait 不可用时作为降级方案。
 *
 * @param ms - 休眠时间（毫秒）
 */
const sleepNaive = (ms: number): void => {
  const endTime = Date.now() + ms;
  while (endTime > Date.now()) {
    /* sleeping - 忙等待，CPU 空转 */
  }
};

/**
 * 原子操作同步休眠实现
 *
 * 使用 Atomics.wait 在 SharedArrayBuffer 上阻塞当前线程，
 * 是真正的同步阻塞且不消耗 CPU 的方案。
 * 需要 Node.js 环境支持 SharedArrayBuffer 和 Atomics。
 *
 * @param ms - 休眠时间（毫秒），Atomics.wait 超时后自动解除阻塞
 */
const sleepAtomic = (ms: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

/**
 * 同步阻塞休眠（不释放事件循环）
 *
 * 在需要同步等待的场景下使用，会阻塞当前线程直到指定时间到达。
 * 实现策略：
 * 1. 优先使用 Atomics.wait：零 CPU 占用，通过 SharedArrayBuffer 实现
 *    真正的线程阻塞，Atomics.wait 在超时后自动解除阻塞
 * 2. 降级为 while 循环忙等待：CPU 空转但同样能实现阻塞效果
 *
 * 适用场景：子进程初始化等待、Electron 主进程同步时序控制等
 * 不适用场景：渲染进程（会冻结 UI）
 *
 * @param ms - 休眠时间（毫秒），必须为非负有限数
 * @throws TypeError - ms 不是 number 类型
 * @throws RangeError - ms 不在 [0, Infinity) 范围内
 */
export function systemSleep(ms: number): void {
  if (typeof ms !== 'number') {
    throw new TypeError(`systemSleep: ms is not of type 'number'. Given: ${ms} of type '${typeof ms}'`);
  }
  if (!(ms >= 0 && ms < Infinity)) {
    throw new RangeError(`systemSleep: ms must be in the range [0, Infinity). Given: ${ms}`);
  }
  // 优先使用 Atomics 方案，零 CPU 占用；否则降级为忙等待
  if (typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined') {
    sleepAtomic(ms);
  } else {
    sleepNaive(ms);
  }
}

/**
 * 替换命令行参数中的指定键值
 *
 * 在 argv 数组中查找 `key=value` 格式的参数，替换 value 部分。
 * 常用于启动子进程时动态修改参数值。
 *
 * @param argv - 命令行参数数组
 * @param key - 要替换的参数键名
 * @param value - 新的参数值
 * @returns 修改后的 argv 数组
 *
 * @example
 * ```ts
 * replaceArgsValue(['--port=8080', '--env=dev'], 'port', '9090')
 * // => ['--port=9090', '--env=dev']
 * ```
 */
export function replaceArgsValue(argv: string[], key: string, value: string): string[] {
  const searchKey = key + '=';
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item) continue;
    const pos = item.indexOf(searchKey);
    if (pos !== -1) {
      // 保留 key= 前缀，仅替换后面的值
      argv[i] = item.substring(0, pos + searchKey.length) + value;
      break;
    }
  }
  return argv;
}

/**
 * 从命令行参数数组中获取指定键的值
 *
 * 先通过 pargv 解析标准格式参数（--key value），
 * 若未找到则回退扫描裸键值对（key=value 格式，无 -- 前缀）。
 *
 * @param argv - 命令行参数数组
 * @param key - 要查找的键名
 * @returns 键对应的值，未找到时返回 undefined
 */
export function getValueFromArgv(argv: string[], key: string): unknown {
  const argvObj = parseArgv(argv);
  if (Object.prototype.hasOwnProperty.call(argvObj, key)) {
    return argvObj[key];
  }
  // 回退策略：扫描无 -- 前缀的裸键值对
  const searchKey = key + '=';
  for (const item of argv) {
    if (!item) continue;
    const pos = item.indexOf(searchKey);
    if (pos !== -1) {
      return item.substring(pos + searchKey.length);
    }
  }
  return undefined;
}

/**
 * 检查文件是否存在
 *
 * 通过 fs.statSync 判断路径是否为文件。
 * 任何错误（文件不存在、权限不足等）均返回 false。
 *
 * @param filepath - 文件路径
 * @returns true 表示文件存在，false 表示不存在或不是文件
 */
export function fileIsExist(filepath: string): boolean {
  try {
    return fs.statSync(filepath).isFile();
  } catch {
    return false;
  }
}
