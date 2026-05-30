/**
 * @module log
 * @description 日志模块入口。提供日志的创建、加载和获取功能。
 *
 * 三种日志实例：
 * - logger：应用日志，记录业务代码输出
 * - coreLogger：框架核心日志，记录框架内部运行信息
 * - errorLogger：错误日志，仅记录 error/fatal 级别
 *
 * 使用 Proxy 包装日志方法，兼容多种调用风格：
 * - pino 标准：logger.info({ key: 'value' }, 'message')
 * - pino printf：logger.info('count: %d', 42)
 * - 拼接模式：logger.info('msg:', value) → 自动拼接为 'msg: value'
 */
import pino from 'pino';
import { PinoLoggers, create } from './logger.js';

/**
 * EeLogger 接口
 *
 * 定义框架统一的日志接口，屏蔽 pino 内部实现细节。
 * 支持 trace/debug/info/warn/error/fatal 六个级别和 child() 子日志。
 */
export interface EeLogger {
  trace(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
  child(bindings: pino.Bindings): EeLogger;
}

/** 日志实例集合（启动后赋值） */
let loggers: PinoLoggers | null = null;

/**
 * 创建日志实例
 *
 * @param config - 自定义日志配置（可选）
 * @returns PinoLoggers 对象
 */
export function createLog(config?: Record<string, unknown>): PinoLoggers {
  return create(config ?? {});
}

/**
 * 加载日志系统
 *
 * 使用系统配置创建日志实例。在框架启动流程中由 boot.ts 的 init() 调用。
 */
export function loadLog(): void {
  loggers = create();
}

/**
 * 获取日志实例集合
 *
 * 若日志尚未加载，会自动触发加载。
 *
 * @returns PinoLoggers 对象
 */
export function getLoggers(): PinoLoggers {
  if (!loggers) { loadLog(); }
  return loggers!;
}

/**
 * 按属性名获取 pino 日志实例
 *
 * @param prop - 属性名（logger / coreLogger / errorLogger）
 * @returns pino.Logger 实例
 */
function _getLoggerBy(prop: 'logger' | 'coreLogger' | 'errorLogger'): pino.Logger {
  if (!loggers) { loadLog(); }
  return loggers![prop];
}

/** 支持的日志方法名集合 */
const LOG_METHODS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);

/**
 * 格式化参数为字符串
 *
 * - Error → stack 或 message
 * - 对象 → JSON 字符串
 * - 其他 → String()
 */
function formatArg(a: unknown): string {
  if (a instanceof Error) return a.stack || a.message;
  if (typeof a === 'object' && a !== null) return JSON.stringify(a);
  return String(a);
}

/**
 * 创建日志代理对象
 *
 * 使用 Proxy 拦截方法调用，兼容多种日志调用风格：
 * 1. pino 标准：logger.info({ key: 'val' }, 'msg') — 第一个参数为合并对象
 * 2. pino printf：logger.info('count: %d', 42) — 含 %s/%d 格式化占位符
 * 3. 拼接模式：logger.info('msg:', value) — 多参数自动拼接为字符串
 *
 * child() 方法返回新的代理对象，绑定子日志上下文。
 *
 * @param getter - 延迟获取 pino.Logger 实例的函数
 * @returns EeLogger 代理对象
 */
function createLoggerProxy(getter: () => pino.Logger): EeLogger {
  return new Proxy({} as unknown as EeLogger, {
    get(_target, prop) {
      // child() 返回子日志代理
      if (prop === 'child') {
        return (bindings: pino.Bindings) => createLoggerProxy(() => getter().child(bindings));
      }
      if (!LOG_METHODS.has(prop as string)) return undefined;

      return (...args: unknown[]) => {
        const l = getter();
        const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
        if (!method) return;

        // 单参数直接调用
        if (args.length <= 1) {
          method.call(l, ...args);
          return;
        }

        const first = args[0];
        // pino 标准：第一个参数是普通对象 → (mergeObj, msg, ...args)
        if (typeof first === 'object' && first !== null && !(first instanceof Error)) {
          method.call(l, ...args);
          return;
        }
        // pino printf：第一个参数含 %s/%d 格式化 → 保持原样
        if (typeof first === 'string' && /%[sdijo]/.test(first)) {
          method.call(l, ...args);
          return;
        }
        // 拼接模式：logger.info('msg:', value) → 'msg: value'
        method.call(l, args.map(formatArg).join(' '));
      };
    },
  });
}

/** 应用日志实例（Proxy 代理） */
export const logger: EeLogger = createLoggerProxy(() => _getLoggerBy('logger'));
/** 框架核心日志实例（Proxy 代理） */
export const coreLogger: EeLogger = createLoggerProxy(() => _getLoggerBy('coreLogger'));
/** 错误日志实例（Proxy 代理，仅 error/fatal 级别） */
export const errorLogger: EeLogger = createLoggerProxy(() => _getLoggerBy('errorLogger'));
