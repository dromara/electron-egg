/**
 * @module log/logger
 * @description Logger creator. Creates three log instances based on the pino logging library:
 * - logger: Application log (ee.log), records business code logs
 * - coreLogger: Framework core log (ee-core.log), records framework internal logs
 * - errorLogger: Error log (ee-error.log), only records error level and above
 *
 * Features:
 * - Log file rotation based on pino-roll (daily/hourly)
 * - pino-pretty colorized output in development environment
 * - Supports field redaction (redact), custom log levels, custom serializers
 * - Safe mode: does not throw exceptions when log write fails
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

/** Collection of three pino log instances */
export interface PinoLoggers {
  /** Application log instance */
  logger: pino.Logger;
  /** Framework core log instance */
  coreLogger: pino.Logger;
  /** Error log instance (error level and above only) */
  errorLogger: pino.Logger;
}

/** Log level name mapping (case-insensitive) */
const LEVEL_MAP: Record<string, string> = {
  DEBUG: 'debug', INFO: 'info', WARN: 'warn',
  ERROR: 'error', FATAL: 'fatal', TRACE: 'trace',
};

/**
 * Normalize log level name
 *
 * Converts uppercase level names to lowercase, case-insensitive input.
 */
function normalizeLevel(level: string): string {
  return LEVEL_MAP[level.toUpperCase()] || level.toLowerCase();
}

/**
 * Build a pino timestamp function that emits wall-clock time in a specific IANA timezone.
 *
 * pino's built-in isoTime always emits UTC (e.g. '...Z'); this preserves that exact behavior for
 * 'UTC' (fast path via Date.toISOString()), and for any other IANA zone emits a full ISO string
 * carrying the zone offset (e.g. '2026-06-01T21:42:24.123+08:00'), so file logs read as the
 * configured timezone regardless of the host machine's TZ. The returned function follows pino's
 * contract: it returns a string beginning with `,"time":...` to be concatenated into the JSON line.
 *
 * @param timeZone - IANA timezone name (e.g. 'Asia/Shanghai'), or 'UTC' for standard 'Z' output
 */
function buildTimezoneTimeFn(timeZone: string): () => string {
  // UTC fast path: standard ISO 'Z' suffix, identical to pino's stdTimeFunctions.isoTime
  if (timeZone === 'UTC') {
    return function utcTime(): string {
      return `,"time":"${new Date().toISOString()}"`;
    };
  }
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZoneName: 'longOffset',
  });
  return function timezoneTime(): string {
    const now = new Date();
    const parts: Record<string, string> = {};
    for (const p of dtf.formatToParts(now)) parts[p.type] = p.value;
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    // longOffset yields 'GMT+08:00' (or plain 'GMT' for UTC)
    const raw = parts.timeZoneName || 'GMT';
    const offset = raw === 'GMT' ? '+00:00' : raw.replace('GMT', '');
    // Some engines emit '24' for midnight hour; normalize to '00'
    const hour = parts.hour === '24' ? '00' : parts.hour;
    return `,"time":"${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}:${parts.second}.${ms}${offset}"`;
  };
}

/**
 * Build pino transport target list
 *
 * At minimum includes one pino-roll file output target;
 * in development environment, additionally adds pino-pretty terminal output target.
 *
 * @param logDir - Log directory
 * @param logFileBase - Log file base name (without extension)
 * @param logFileExt - Log file extension
 * @param level - Log level
 * @param prettyPrint - Whether to enable terminal colorized output
 * @param frequency - Rotation frequency (daily/hourly)
 * @param maxSize - Maximum single file size
 * @param dateFormat - File name date format
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

  // File output target: uses pino-roll for log rotation
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

  // Development environment: terminal colorized output
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
 * Parse log file name, separating base name and extension
 *
 * @param fileName - Log file name (e.g., 'ee.log')
 * @returns { base: base name, ext: extension }
 */
function parseLogFileName(fileName: string): { base: string; ext: string } {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  return { base, ext: ext || '.log' };
}

/**
 * Map the rotator value from config to pino-roll supported frequency
 *
 * @param rotator - Rotation strategy config value
 * @returns 'daily' or 'hourly'
 */
function mapRotatorToFrequency(rotator: string): string {
  if (rotator === 'day' || rotator === 'daily') return 'daily';
  if (rotator === 'hour' || rotator === 'hourly') return 'hourly';
  return 'daily';
}

/**
 * Create a single pino log instance
 *
 * @param opts - pino LoggerOptions
 * @param logDir - Log directory
 * @param logFileBase - Log file base name
 * @param logFileExt - Log file extension
 * @param level - Log level
 * @param prettyPrint - Whether to enable colorized output
 * @param frequency - Rotation frequency
 * @param maxSize - Maximum single file size
 * @param dateFormat - File name date format
 * @returns pino Logger instance
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
 * Create three log instances (logger / coreLogger / errorLogger)
 *
 * Merges default configuration and user configuration, creating independent pino instances for each log file.
 * errorLogger level is fixed to error; others use the configured level.
 *
 * @param config - Custom log configuration (optional, overrides system configuration)
 * @returns PinoLoggers object containing three log instances
 */
export function create(config: Partial<LoggerConfig> = {}): PinoLoggers {
  const defaults = defaultConfig().logger;
  let loggerConf: LoggerConfig;

  if (Object.keys(config).length === 0) {
    // No custom configuration: use system configuration to override defaults
    const sysConfig = getConfig();
    loggerConf = extend(true, { ...defaults } as unknown as Record<string, unknown>, sysConfig.logger as unknown as Record<string, unknown>) as unknown as LoggerConfig;
  } else {
    // Has custom configuration: use custom configuration to override defaults
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
  // Default 'UTC' keeps file logs machine-readable (standard ISO 'Z'); set an IANA zone
  // (e.g. 'Asia/Shanghai') to emit wall-clock time with offset instead.
  const timezone = loggerConf.timezone || 'UTC';
  // Unify maxSize to string format supported by pino-roll (e.g., '10m')
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

  // Build pino base configuration
  const baseOpts: pino.LoggerOptions = {
    level,
    name,
    timestamp: timestamp ? buildTimezoneTimeFn(timezone) : false,
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

  // Parse log file names
  const appParsed = parseLogFileName(appLogName);
  const coreParsed = parseLogFileName(coreLogName);
  const errorParsed = parseLogFileName(errorLogName);

  // Create three independent log instances
  const loggerInstance = createLoggerInstance(baseOpts, logDir, appParsed.base, appParsed.ext, level, prettyPrint, frequency, maxSize, dateFormat);
  const coreLoggerInstance = createLoggerInstance({ ...baseOpts, name: `${name}-core` }, logDir, coreParsed.base, coreParsed.ext, level, prettyPrint, frequency, maxSize, dateFormat);
  // errorLogger is fixed to error level
  const errorLoggerInstance = createLoggerInstance({ ...baseOpts, level: 'error', name: `${name}-error` }, logDir, errorParsed.base, errorParsed.ext, 'error', prettyPrint, frequency, maxSize, dateFormat);

  debugLog('[create] level: %s, dir: %s, frequency: %s', level, logDir, frequency);

  return {
    logger: loggerInstance,
    coreLogger: coreLoggerInstance,
    errorLogger: errorLoggerInstance,
  };
}
