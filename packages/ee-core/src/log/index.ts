import pino from 'pino';
import { PinoLoggers, create } from './logger.js';

// A permissive logger interface compatible with the existing call patterns
// (e.g., logger.error('msg:', err)) which pino's strict overloads don't accept.
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

// Create log instance with optional config
export function createLog(config?: Record<string, unknown>): PinoLoggers {
  return create(config ?? {});
}

// Load log (called during boot)
export function loadLog(): void {
  loggers = create();
}

export function getLoggers(): PinoLoggers {
  if (!loggers) {
    loadLog();
  }
  return loggers!;
}

function _getLogger(): pino.Logger {
  if (!loggers) {
    loadLog();
  }
  return loggers!.logger;
}

function _getCoreLogger(): pino.Logger {
  if (!loggers) {
    loadLog();
  }
  return loggers!.coreLogger;
}

function _getErrorLogger(): pino.Logger {
  if (!loggers) {
    loadLog();
  }
  return loggers!.errorLogger;
}

// logger proxy — lazy-init, forwards to pino.Logger
export const logger: EeLogger = new Proxy({} as unknown as EeLogger, {
  get(_target, prop) {
    return (...args: unknown[]) => {
      const l = _getLogger();
      const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
      if (method) {
        method.apply(l, args);
      }
    };
  },
});

// coreLogger proxy
export const coreLogger: EeLogger = new Proxy({} as unknown as EeLogger, {
  get(_target, prop) {
    return (...args: unknown[]) => {
      const l = _getCoreLogger();
      const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
      if (method) {
        method.apply(l, args);
      }
    };
  },
});

// errorLogger proxy (error+ level only)
export const errorLogger: EeLogger = new Proxy({} as unknown as EeLogger, {
  get(_target, prop) {
    return (...args: unknown[]) => {
      const l = _getErrorLogger();
      const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop as string];
      if (method) {
        method.apply(l, args);
      }
    };
  },
});