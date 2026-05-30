/**
 * @module log/logger
 * @description 日志创建器。基于 pino 日志库创建三个日志实例：
 * - logger：应用日志（ee.log），记录业务代码日志
 * - coreLogger：框架核心日志（ee-core.log），记录框架内部日志
 * - errorLogger：错误日志（ee-error.log），仅记录 error 级别及以上
 *
 * 特性：
 * - 基于 pino-roll 实现日志文件轮转（按天/按小时）
 * - 开发环境支持 pino-pretty 彩色格式化输出
 * - 支持字段脱敏（redact）、自定义日志级别、自定义序列化器
 * - 安全模式：日志写入失败时不抛异常
 */
import pino from 'pino';
import path from 'path';
import debug from 'debug';
import { getConfig } from '../config/index.js';
import defaultConfig from '../config/default_config.js';
import { extend } from '../utils/extend.js';
import { getLogDir, isDev } from '../ps/index.js';
import type { LoggerConfig } from '../types/index.js';

const debugLog = debug('ee-core:log:logger');

/** 三个 pino 日志实例的集合 */
export interface PinoLoggers {
  /** 应用日志实例 */
  logger: pino.Logger;
  /** 框架核心日志实例 */
  coreLogger: pino.Logger;
  /** 错误日志实例（仅 error 级别及以上） */
  errorLogger: pino.Logger;
}

/** 日志级别名映射（兼容大小写） */
const LEVEL_MAP: Record<string, string> = {
  DEBUG: 'debug', INFO: 'info', WARN: 'warn',
  ERROR: 'error', FATAL: 'fatal', TRACE: 'trace',
};

/**
 * 标准化日志级别名称
 *
 * 将大写级别名转为小写，不区分大小写输入。
 */
function normalizeLevel(level: string): string {
  return LEVEL_MAP[level.toUpperCase()] || level.toLowerCase();
}

/**
 * 构建 pino transport 目标列表
 *
 * 至少包含一个 pino-roll 文件输出目标，
 * 开发环境下额外添加 pino-pretty 终端输出目标。
 *
 * @param logDir - 日志目录
 * @param logFileBase - 日志文件基本名（不含扩展名）
 * @param logFileExt - 日志文件扩展名
 * @param level - 日志级别
 * @param prettyPrint - 是否启用终端彩色输出
 * @param frequency - 轮转频率（daily/hourly）
 * @param maxSize - 单文件最大大小
 * @param dateFormat - 文件名日期格式
 */
function buildTransportTargets(
  logDir: string,
  logFileBase: string,
  logFileExt: string,
  level: string,
  prettyPrint: boolean,
  frequency: string,
  maxSize: string,
  dateFormat: string,
): pino.TransportTargetOptions[] {
  const targets: pino.TransportTargetOptions[] = [];

  // 文件输出目标：使用 pino-roll 实现日志轮转
  targets.push({
    target: 'pino-roll',
    level,
    options: {
      file: path.join(logDir, logFileBase),
      extension: logFileExt,
      frequency,
      dateFormat,
      size: maxSize,
      mkdir: true,
    },
  });

  // 开发环境：终端彩色输出
  if (prettyPrint) {
    targets.push({
      target: 'pino-pretty',
      level,
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    });
  }

  return targets;
}

/**
 * 解析日志文件名，分离基本名和扩展名
 *
 * @param fileName - 日志文件名（如 'ee.log'）
 * @returns { base: 基本名, ext: 扩展名 }
 */
function parseLogFileName(fileName: string): { base: string; ext: string } {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  return { base, ext: ext || '.log' };
}

/**
 * 将配置中的 rotator 值映射为 pino-roll 支持的 frequency
 *
 * @param rotator - 轮转策略配置值
 * @returns 'daily' 或 'hourly'
 */
function mapRotatorToFrequency(rotator: string): string {
  if (rotator === 'day' || rotator === 'daily') return 'daily';
  if (rotator === 'hour' || rotator === 'hourly') return 'hourly';
  return 'daily';
}

/**
 * 创建单个 pino 日志实例
 *
 * @param opts - pino LoggerOptions
 * @param logDir - 日志目录
 * @param logFileBase - 日志文件基本名
 * @param logFileExt - 日志文件扩展名
 * @param level - 日志级别
 * @param prettyPrint - 是否启用彩色输出
 * @param frequency - 轮转频率
 * @param maxSize - 单文件最大大小
 * @param dateFormat - 文件名日期格式
 * @returns pino Logger 实例
 */
function createLoggerInstance(
  opts: pino.LoggerOptions,
  logDir: string,
  logFileBase: string,
  logFileExt: string,
  level: string,
  prettyPrint: boolean,
  frequency: string,
  maxSize: string,
  dateFormat: string,
): pino.Logger {
  const targets = buildTransportTargets(logDir, logFileBase, logFileExt, level, prettyPrint, frequency, maxSize, dateFormat);
  const transport = pino.transport({ targets });
  return pino(opts, transport);
}

/**
 * 创建三个日志实例（logger / coreLogger / errorLogger）
 *
 * 合并默认配置和用户配置，为每个日志文件创建独立的 pino 实例。
 * errorLogger 的级别固定为 error，其余使用配置中的级别。
 *
 * @param config - 自定义日志配置（可选，覆盖系统配置）
 * @returns 包含三个日志实例的 PinoLoggers 对象
 */
export function create(config: Partial<LoggerConfig> = {}): PinoLoggers {
  const defaults = defaultConfig().logger;
  let loggerConf: LoggerConfig;

  if (Object.keys(config).length === 0) {
    // 无自定义配置：使用系统配置覆盖默认值
    const sysConfig = getConfig();
    loggerConf = extend(true, { ...defaults } as unknown as Record<string, unknown>, sysConfig.logger as unknown as Record<string, unknown>) as unknown as LoggerConfig;
  } else {
    // 有自定义配置：使用自定义配置覆盖默认值
    loggerConf = extend(true, { ...defaults } as unknown as Record<string, unknown>, config as unknown as Record<string, unknown>) as unknown as LoggerConfig;
  }

  const logDir = loggerConf.dir || getLogDir();
  const level = normalizeLevel(loggerConf.level || 'info');
  const prettyPrint = loggerConf.prettyPrint ?? isDev();
  const appLogName = loggerConf.appLogName || 'ee.log';
  const coreLogName = loggerConf.coreLogName || 'ee-core.log';
  const errorLogName = loggerConf.errorLogName || 'ee-error.log';
  const redact = loggerConf.redact || [];
  const redactCensor = loggerConf.redactCensor || '[Redacted]';
  const name = loggerConf.name || 'ee';
  const timestamp = loggerConf.timestamp ?? true;
  // 将 maxSize 统一为 pino-roll 支持的字符串格式（如 '10m'）
  const maxSize = typeof loggerConf.maxSize === 'number'
    ? `${(loggerConf.maxSize as number) / 1024 / 1024}m`
    : (loggerConf.maxSize as string) || '10m';
  const frequency = mapRotatorToFrequency(loggerConf.rotator || 'day');
  const dateFormat = loggerConf.dateFormat || 'yyyy-MM-dd';
  const serializers = loggerConf.serializers;
  const customLevels = loggerConf.customLevels;
  const depthLimit = loggerConf.depthLimit ?? 5;
  const safe = loggerConf.safe ?? true;
  const enabled = loggerConf.enabled ?? true;

  // 构建 pino 基础配置
  const baseOpts: pino.LoggerOptions = {
    level,
    name,
    timestamp: timestamp ? pino.stdTimeFunctions.isoTime : false,
    depthLimit,
    safe,
    enabled,
  };
  if (customLevels && Object.keys(customLevels).length > 0) {
    baseOpts.customLevels = customLevels;
  }
  if (serializers && Object.keys(serializers).length > 0) {
    baseOpts.serializers = serializers as { [key: string]: pino.SerializerFn };
  }
  if (redact.length > 0) {
    baseOpts.redact = { paths: redact, censor: redactCensor };
  }

  // 解析日志文件名
  const appParsed = parseLogFileName(appLogName);
  const coreParsed = parseLogFileName(coreLogName);
  const errorParsed = parseLogFileName(errorLogName);

  // 创建三个独立的日志实例
  const loggerInstance = createLoggerInstance(baseOpts, logDir, appParsed.base, appParsed.ext, level, prettyPrint, frequency, maxSize, dateFormat);
  const coreLoggerInstance = createLoggerInstance({ ...baseOpts, name: `${name}-core` }, logDir, coreParsed.base, coreParsed.ext, level, prettyPrint, frequency, maxSize, dateFormat);
  // errorLogger 固定为 error 级别
  const errorLoggerInstance = createLoggerInstance({ ...baseOpts, level: 'error', name: `${name}-error` }, logDir, errorParsed.base, errorParsed.ext, 'error', prettyPrint, frequency, maxSize, dateFormat);

  debugLog('[create] level: %s, dir: %s, frequency: %s', level, logDir, frequency);

  return {
    logger: loggerInstance,
    coreLogger: coreLoggerInstance,
    errorLogger: errorLoggerInstance,
  };
}
