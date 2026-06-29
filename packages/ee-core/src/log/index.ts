/**
 * @module log
 * @description Log module entry point. Provides log creation, loading, and retrieval functionality.
 *
 * Three log instances:
 * - logger: Application log, records business code output
 * - coreLogger: Framework core log, records framework internal runtime information
 * - errorLogger: Error log, only records error/fatal levels
 *
 * Wraps log methods with Proxy, compatible with multiple calling styles:
 * - pino standard: logger.info({ key: 'value' }, 'message')
 * - pino printf: logger.info('count: %d', 42)
 * - Concatenation mode: logger.info('msg:', value) → auto-concatenates to 'msg: value'
 */
import pino from 'pino';
import { PinoLoggers, create } from './logger.js';

/**
 * EeLogger interface
 *
 * Defines the framework's unified log interface, shielding pino internal implementation details.
 * Supports six levels: trace/debug/info/warn/error/fatal and child() sub-logger.
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

/** Log instance collection (assigned after startup) */
let loggers: PinoLoggers | null = null;

/**
 * Create log instances
 *
 * @param config - Custom log configuration (optional)
 * @returns PinoLoggers object
 */
export function createLog(config?: Record<string, unknown>): PinoLoggers {
  return create(config ?? {});
}

/**
 * Load log system
 *
 * Creates log instances using system configuration. Called by boot.ts init() during framework startup flow.
 */
export function loadLog(): void {
  loggers = create();
}

/**
 * Get log instance collection
 *
 * If logs have not been loaded yet, automatically triggers loading.
 *
 * @returns PinoLoggers object
 */
export function getLoggers(): PinoLoggers {
  if (!loggers) { loadLog(); }
  return loggers!;
}

/**
 * Get pino log instance by property name
 *
 * @param prop - Property name (logger / coreLogger / errorLogger)
 * @returns pino.Logger instance
 */
function _getLoggerBy(prop: 'logger' | 'coreLogger' | 'errorLogger'): pino.Logger {
  if (!loggers) { loadLog(); }
  return loggers![prop];
}

/** Set of supported log method names */
const LOG_METHODS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);

/**
 * Format argument to string
 *
 * - Error → stack or message
 * - Object → JSON string
 * - Other → String()
 */
function formatArg(a: unknown): string {
  if (a instanceof Error) return a.stack || a.message;
  if (typeof a === 'object' && a !== null) return JSON.stringify(a);
  return String(a);
}

/**
 * Create log proxy object
 *
 * Uses Proxy to intercept method calls, compatible with multiple log calling styles:
 * 1. pino standard: logger.info({ key: 'val' }, 'msg') — first argument is merge object
 * 2. pino printf: logger.info('count: %d', 42) — contains %s/%d format placeholders
 * 3. Concatenation mode: logger.info('msg:', value) — multiple arguments auto-concatenated to string
 *
 * child() method returns a new proxy object bound to sub-logger context.
 *
 * @param getter - Deferred function to get pino.Logger instance
 * @returns EeLogger proxy object
 */
/** Log levels that are aggregated into errorLogger (ee-error.log) */
const ERROR_LEVELS = new Set(['error', 'fatal']);

/**
 * Invoke a single pino method, normalizing the multiple supported calling styles.
 *
 * Shared by the direct write and the error/fatal aggregation forward so both
 * paths interpret arguments identically.
 */
function applyLog(l: pino.Logger, prop: string, args: unknown[]): void {
  const method = (l as unknown as Record<string, (...args: unknown[]) => void>)[prop];
  if (!method) return;

  // Single argument, call directly
  if (args.length <= 1) {
    method.call(l, ...args);
    return;
  }

  const first = args[0];
  // pino standard: first argument is a plain object → (mergeObj, msg, ...args)
  if (typeof first === 'object' && first !== null && !(first instanceof Error)) {
    method.call(l, ...args);
    return;
  }
  // pino printf: first argument contains %s/%d formatting → keep as-is
  if (typeof first === 'string' && /%[sdijo]/.test(first)) {
    method.call(l, ...args);
    return;
  }
  // Concatenation mode: logger.info('msg:', value) → 'msg: value'
  method.call(l, args.map(formatArg).join(' '));
}

/**
 * Create log proxy object
 *
 * @param getter - Deferred function to get pino.Logger instance
 * @param source - Origin tag ('app' / 'core'); when set, error/fatal records are
 *   additionally aggregated into errorLogger (ee-error.log) with a `from` binding.
 *   errorLogger itself passes no source, so it never forwards to avoid double writes.
 * @returns EeLogger proxy object
 */
function createLoggerProxy(getter: () => pino.Logger, source?: string): EeLogger {
  return new Proxy({} as unknown as EeLogger, {
    get(_target, prop) {
      // child() returns sub-logger proxy (preserves source so children still aggregate)
      if (prop === 'child') {
        return (bindings: pino.Bindings) => createLoggerProxy(() => getter().child(bindings), source);
      }
      if (!LOG_METHODS.has(prop as string)) return undefined;

      return (...args: unknown[]) => {
        const l = getter();
        applyLog(l, prop as string, args);

        // Aggregate error/fatal into ee-error.log (single writer = errorLogger).
        // Skipped for errorLogger itself (source undefined) to prevent double writes.
        if (source && ERROR_LEVELS.has(prop as string)) {
          applyLog(_getLoggerBy('errorLogger').child({ from: source }), prop as string, args);
        }
      };
    },
  });
}

/** Application log instance (Proxy wrapped) */
export const logger: EeLogger = createLoggerProxy(() => _getLoggerBy('logger'), 'app');
/** Framework core log instance (Proxy wrapped) */
export const coreLogger: EeLogger = createLoggerProxy(() => _getLoggerBy('coreLogger'), 'core');
/** Error log instance (Proxy wrapped, error/fatal level only; sole writer of ee-error.log) */
export const errorLogger: EeLogger = createLoggerProxy(() => _getLoggerBy('errorLogger'));
