/**
 * 核心工具函数 — 配置加载、文件 I/O、路径处理
 *
 * 本模块是 ee-bin 配置系统的核心，负责完整的配置加载管道：
 *   loadConfig(binFile) → 加载用户 ./cmd/bin.js
 *     → loadFile(binFile) → 解析 .js/.json/.json5 配置文件
 *     → extend(true, defaultConfig, userConfig) → 与默认配置深合并
 *
 * 另外提供 JSON 文件读写、目录删除、数组规范化等基础 I/O 工具。
 */

import { createDebug } from './helpers.js';
import path from 'path';
import fs from 'fs';
import { chalk } from './helpers.js';
import { is } from './helpers.js';
import JsonLib from 'json5';
import defaultConfig from '../config/bin_default.js';
import { extend } from './extend.js';
import type { BinConfig } from '../types/config.js';

const log = createDebug('ee-bin:lib:utils');
const _basePath = process.cwd();
const userBin = './cmd/bin.js';

/**
 * 加载并合并 ee-bin 配置
 *
 * 两阶段合并策略：
 *   1. 从 ./cmd/bin.js 加载用户配置（支持 .js/.json/.json5 格式）
 *   2. 将用户配置深合并到默认配置之上（用户配置覆盖默认值）
 *
 * @param binFile - 自定义配置文件路径（默认 './cmd/bin.js'）
 * @returns 合并后的完整 BinConfig
 */
export function loadConfig(binFile?: string): BinConfig {
  const binPath = binFile || userBin;
  const userConfig = loadFile(binPath);
  const result = extend(true, { ...defaultConfig } as Record<string, unknown>, userConfig) as unknown as BinConfig;
  log('[loadConfig] bin:%j', result);

  return result;
}

/**
 * 加载配置文件 — 支持 .json5/.json/.js/.cjs 格式
 *
 * 各格式的处理差异：
 *   - .json5/.json: 用 json5 解析器读取文本内容（JSON5 支持注释、尾逗号等扩展语法）
 *   - .js/.cjs: 用 require() 加载模块，提取导出值
 *     - 若导出为普通函数（非 class），视为配置工厂函数并调用它获取配置对象
 *     - 若导出为 class，直接使用类实例作为配置（不调用）
 *     - 若导出为 ESModule（含 default 属性），提取 .default 值
 *
 * @param filepath - 配置文件路径（相对于项目根目录）
 * @returns 配置对象（Record<string, unknown>）
 * @throws 文件不存在时抛出带路径提示的错误
 */
export function loadFile(filepath: string): Record<string, unknown> {
  const configFile = path.join(_basePath, filepath);
  if (!fs.existsSync(configFile)) {
    const errorTips = 'file ' + chalk.blue(`${configFile}`) + ' does not exist !';
    throw new Error(errorTips);
  }

  let result: unknown;
  if (configFile.endsWith('.json5') || configFile.endsWith('.json')) {
    const data = fs.readFileSync(configFile, 'utf8');
    return JsonLib.parse(data) as Record<string, unknown>;
  }
  if (configFile.endsWith('.js') || configFile.endsWith('.cjs')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- 动态用户配置加载
    const mod = require(configFile);
    // 处理 ESM default 导出：require() 加载 ESM 模块时返回 { default: ... }
    result = mod.default != null ? mod.default : mod;
  }
  // 配置工厂模式：若导出为普通函数（非 class），调用它获取配置对象
  // 区分函数和类的原因：class 导出本身就是配置类，不需要再调用
  if (is.function(result) && !is.class(result)) {
    result = (result as () => unknown)();
  }
  return (result as Record<string, unknown>) || {};
}

/** 递归强制删除目录或文件（类似 rm -rf） */
export function rm(name: string): void {
  if (!fs.existsSync(name)) {
    return;
  }
  fs.rmSync(name, { recursive: true, force: true });
}

/**
 * 同步读取 JSON 文件并解析为对象
 * @throws 文件不存在时抛出错误
 */
export function readJsonSync(filepath: string, encoding: BufferEncoding = 'utf8'): Record<string, unknown> {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, { encoding }));
}

/**
 * 同步写入 JSON 文件，自动创建目录和格式化输出
 *
 * @param filepath - 目标文件路径
 * @param str - 要写入的数据（对象自动 JSON.stringify，其他类型转为字符串）
 * @param options - 可选参数：space 控制缩进（默认 2），replacer 控制序列化过滤
 */
export function writeJsonSync(filepath: string, str: unknown, options?: { space?: number; replacer?: (key: string, value: unknown) => unknown }): void {
  const opt = options || {};
  if (!('space' in opt)) {
    opt.space = 2;
  }

  // 自动创建目标目录（避免因目录不存在导致写入失败）
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  let data: string;
  if (typeof str === 'object') {
    data = JSON.stringify(str, opt.replacer, opt.space) + '\n';
  } else {
    data = String(str);
  }

  fs.writeFileSync(filepath, data);
}

/**
 * 将 string | string[] | undefined 规范化为 string[]
 * 用于处理配置中 args 字段的不同格式输入
 */
export function toArray(value?: string[] | string): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value;
  return [];
}