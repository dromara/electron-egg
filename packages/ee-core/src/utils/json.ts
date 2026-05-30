/**
 * @module utils/json
 * @description JSON 文件读写工具。提供同步和异步的 JSON 文件读写函数，
 * 自动处理目录创建、对象序列化和文件路径检查，简化框架和业务代码中的
 * JSON 文件操作。
 */
import fs from 'fs';
import path from 'path';

/** JSON 写入选项 */
export interface JsonWriteOptions {
  /** 缩进空格数，默认 2 */
  space?: number;
  /** JSON.stringify 的 replacer 函数，用于自定义序列化逻辑 */
  replacer?: (key: string, value: unknown) => unknown;
}

/**
 * 严格解析 JSON 字符串
 *
 * 与 JSON.parse 的区别在于额外校验解析结果必须为对象类型，
 * 防止解析出基本类型值（如字符串、数字）。
 *
 * @param str - JSON 字符串
 * @returns 解析后的对象
 * @throws Error - 解析结果不是对象时抛出异常
 */
export function strictParse(str: string): unknown {
  const obj = JSON.parse(str);
  // 确保解析结果是对象，排除 null、基本类型值和数组
  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON string is not object');
  }
  return obj;
}

/**
 * 同步读取 JSON 文件
 *
 * 读取文件内容并解析为对象，文件不存在时抛出异常。
 *
 * @param filepath - JSON 文件路径
 * @returns 解析后的对象
 * @throws Error - 文件不存在时抛出异常
 */
export function readSync(filepath: string): unknown {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

/**
 * 同步写入 JSON 文件
 *
 * 自动创建目标目录，对象自动序列化为 JSON 字符串，
 * 非对象值转为字符串写入。默认使用 2 空格缩进。
 *
 * @param filepath - 目标文件路径
 * @param str - 要写入的内容，对象会被 JSON.stringify 序列化
 * @param options - 写入选项（缩进、replacer）
 */
export function writeSync(filepath: string, str: unknown, options: JsonWriteOptions = {}): void {
  const opts = { space: 2, ...options };

  // 确保目标目录存在，避免写入时因目录不存在而报错
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  let content: string;
  if (typeof str === 'object') {
    content = JSON.stringify(str, opts.replacer as (key: string, value: unknown) => unknown, opts.space) + '\n';
  } else {
    // 非对象值直接转字符串写入
    content = String(str);
  }

  fs.writeFileSync(filepath, content);
}

/**
 * 异步读取 JSON 文件
 *
 * 先检查文件是否存在且为普通文件，再读取并解析。
 * 使用 fs.promises 异步 API，不阻塞事件循环。
 *
 * @param filepath - JSON 文件路径
 * @returns 解析后的对象的 Promise
 * @throws Error - 文件不存在或不是文件时抛出异常
 */
export function read(filepath: string): Promise<unknown> {
  return fs.promises
    .stat(filepath)
    .then((stats) => {
      // 确保路径指向普通文件而非目录
      if (!stats.isFile()) {
        throw new Error(filepath + ' is not found');
      }
      return fs.promises.readFile(filepath, 'utf8');
    })
    .then((buf) => JSON.parse(buf));
}

/**
 * 异步写入 JSON 文件
 *
 * 自动创建目标目录，对象自动序列化为 JSON 字符串，
 * 非对象值转为字符串写入。默认使用 2 空格缩进。
 * 使用 fs.promises 异步 API，不阻塞事件循环。
 *
 * @param filepath - 目标文件路径
 * @param str - 要写入的内容，对象会被 JSON.stringify 序列化
 * @param options - 写入选项（缩进、replacer）
 * @returns 写入完成的 Promise
 */
export function write(filepath: string, str: unknown, options: JsonWriteOptions = {}): Promise<void> {
  const opts = { space: 2, ...options };

  let content: string;
  if (typeof str === 'object') {
    content = JSON.stringify(str, opts.replacer as (key: string, value: unknown) => unknown, opts.space) + '\n';
  } else {
    content = String(str);
  }

  // 先确保目录存在，再写入文件
  return fs.promises.mkdir(path.dirname(filepath), { recursive: true }).then(() => fs.promises.writeFile(filepath, content));
}
