import pino from 'pino';
import { PinoLoggers, create } from './logger.js';

export interface EeLogger {
  trace(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
  child(bindings: pino.Bindings): EeLogger;
}

let loggers: PinoLoggers | null = null;

export function createLog(config?: Record<string, unknown>): PinoLoggers {
  return create(config ?? {});
}

export function loadLog(): void {
  loggers = create();
}

export function getLoggers(): PinoLoggers {
  if (!loggers) { loadLog(); }
  return loggers!;
}

function _getLoggerBy(prop: 'logger' | 'coreLogger' | 'errorLogger'): pino.Logger {
  if (!loggers) { loadLog(); }
  return loggers![prop];
}

const LOG_METHODS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);

function formatArg(a: unknown): string {
  if (a instanceof Error) return a.stack || a.message;
  if (typeof a === 'object' && a !== null) return JSON.stringify(a);
  return String(a);
}

function createLoggerProxy(getter: () => pino.Logger): EeLogger {
  return new Proxy({} as unknown as EeLogger, {
    get(_target, prop) {
      if (prop === 'child') {
        return (bindings: pino.Bindings) => createLoggerProxy(() => getter().child(bindings));
      }
      if (!LOG_METHODS.has(prop as string)) return undefined;

      return (...args: unknown[]) => {
        const l = getter();
        const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
        if (!method) return;

        if (args.length <= 1) {
          method.call(l, ...args);
          return;
        }

        const first = args[0];
        // pino 标准: 第一个参数是普通对象 → (mergeObj, msg, ...args)
        if (typeof first === 'object' && first !== null && !(first instanceof Error)) {
          method.call(l, ...args);
          return;
        }
        // pino printf: 第一个参数含 %s/%d 格式化 → 保持原样
        if (typeof first === 'string' && /%[sdijo]/.test(first)) {
          method.call(l, ...args);
          return;
        }
        // 拼接模式: logger.info('msg:', value) → 'msg: value'
        method.call(l, args.map(formatArg).join(' '));
      };
    },
  });
}

export const logger: EeLogger = createLoggerProxy(() => _getLoggerBy('logger'));
export const coreLogger: EeLogger = createLoggerProxy(() => _getLoggerBy('coreLogger'));
export const errorLogger: EeLogger = createLoggerProxy(() => _getLoggerBy('errorLogger'));