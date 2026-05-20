import { EggLoggers } from 'egg-logger';
import { create } from './logger.js';

let loggers: EggLoggers | null = null;

// 创建日志实例
export function createLog(config?: Record<string, unknown>): EggLoggers {
  return create(config);
}

// 加载日志
export function loadLog(): void {
  loggers = create();
}

export function getLoggers(): EggLoggers {
  if (!loggers) {
    loadLog();
  }
  return loggers!;
}

function getCoreLoggers(): EggLoggers {
  if (!loggers) {
    loadLog();
  }
  const core = (loggers! as unknown as Record<string, EggLoggers>)['coreLogger'];
  if (!core) {
    throw new Error('coreLogger not found');
  }
  return core;
}

// logger 代理对象
export const logger: EggLoggers = new Proxy({} as unknown as EggLoggers, {
  get(_target, prop) {
    return (...args: unknown[]) => {
      const l = getLoggers();
      const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
      if (method) {
        method.apply(l, args);
      }
    };
  },
});

// coreLogger 代理对象
export const coreLogger: EggLoggers = new Proxy({} as unknown as EggLoggers, {
  get(_target, prop) {
    return (...args: unknown[]) => {
      const l = getCoreLoggers();
      const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
      if (method) {
        method.apply(l, args);
      }
    };
  },
});
