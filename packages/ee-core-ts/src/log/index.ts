import { EggLoggers } from 'egg-logger';
import { create } from './logger.js';

let loggers: EggLoggers | null = null;

export function loadLog(): void {
  loggers = create();
}

export function getLoggers(): EggLoggers {
  if (!loggers) {
    throw new Error('Loggers not initialized. Call loadLog() first.');
  }
  return loggers;
}

export const coreLogger: EggLoggers = new Proxy({} as unknown as EggLoggers, {
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
