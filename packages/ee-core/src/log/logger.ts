import pino from 'pino';
import path from 'path';
import debug from 'debug';
import { getConfig } from '../config/index.js';
import defaultConfig from '../config/default_config.js';
import { extend } from '../utils/extend.js';
import { getLogDir, isDev } from '../ps/index.js';
import type { LoggerConfig } from '../types/index.js';

const debugLog = debug('ee-core:log:logger');

export interface PinoLoggers {
  logger: pino.Logger;
  coreLogger: pino.Logger;
  errorLogger: pino.Logger;
}

const LEVEL_MAP: Record<string, string> = {
  DEBUG: 'debug', INFO: 'info', WARN: 'warn',
  ERROR: 'error', FATAL: 'fatal', TRACE: 'trace',
};

function normalizeLevel(level: string): string {
  return LEVEL_MAP[level.toUpperCase()] || level.toLowerCase();
}

function buildTransportTargets(
  logDir: string,
  logFileBase: string,
  logFileExt: string,
  level: string,
  prettyPrint: boolean,
  frequency: string,
  maxSize: string,
): pino.TransportTargetOptions[] {
  const targets: pino.TransportTargetOptions[] = [];

  targets.push({
    target: 'pino-roll',
    level,
    options: {
      file: path.join(logDir, logFileBase),
      extension: logFileExt,
      frequency,
      size: maxSize,
      mkdir: true,
    },
  });

  if (prettyPrint) {
    targets.push({
      target: 'pino-pretty',
      level,
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-MM-dd HH:mm:ss',
        ignore: 'pid,hostname',
      },
    });
  }

  return targets;
}

function parseLogFileName(fileName: string): { base: string; ext: string } {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  return { base, ext: ext || '.log' };
}

function mapRotatorToFrequency(rotator: string): string {
  if (rotator === 'day' || rotator === 'daily') return 'daily';
  if (rotator === 'hour' || rotator === 'hourly') return 'hourly';
  return 'daily';
}

function createLoggerInstance(
  opts: pino.LoggerOptions,
  logDir: string,
  logFileBase: string,
  logFileExt: string,
  level: string,
  prettyPrint: boolean,
  frequency: string,
  maxSize: string,
): pino.Logger {
  const targets = buildTransportTargets(logDir, logFileBase, logFileExt, level, prettyPrint, frequency, maxSize);
  const transport = pino.transport({ targets });
  return pino(opts, transport);
}

export function create(config: Partial<LoggerConfig> = {}): PinoLoggers {
  const defaults = defaultConfig().logger;
  let loggerConf: LoggerConfig;

  if (Object.keys(config).length === 0) {
    const sysConfig = getConfig();
    loggerConf = extend(true, { ...defaults } as unknown as Record<string, unknown>, sysConfig.logger as unknown as Record<string, unknown>) as unknown as LoggerConfig;
  } else {
    loggerConf = extend(true, { ...defaults } as unknown as Record<string, unknown>, config as unknown as Record<string, unknown>) as unknown as LoggerConfig;
  }

  const logDir = loggerConf.dir || getLogDir();
  const level = normalizeLevel(loggerConf.level || 'info');
  const outputJSON = loggerConf.outputJSON ?? false;
  const prettyPrint = outputJSON ? false : (loggerConf.prettyPrint ?? isDev());
  const appLogName = loggerConf.appLogName || 'ee.log';
  const coreLogName = loggerConf.coreLogName || 'ee-core.log';
  const errorLogName = loggerConf.errorLogName || 'ee-error.log';
  const redact = loggerConf.redact || [];
  const redactCensor = loggerConf.redactCensor || '[Redacted]';
  const name = loggerConf.name || 'ee';
  const timestamp = loggerConf.timestamp ?? true;
  const maxSize = typeof loggerConf.maxSize === 'number'
    ? `${(loggerConf.maxSize as number) / 1024 / 1024}m`
    : (loggerConf.maxSize as string) || '10m';
  const frequency = mapRotatorToFrequency(loggerConf.rotator || 'day');
  const serializers = loggerConf.serializers;
  const customLevels = loggerConf.customLevels;
  const depthLimit = loggerConf.depthLimit ?? 5;
  const safe = loggerConf.safe ?? true;
  const enabled = loggerConf.enabled ?? true;

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

  const appParsed = parseLogFileName(appLogName);
  const coreParsed = parseLogFileName(coreLogName);
  const errorParsed = parseLogFileName(errorLogName);

  const loggerInstance = createLoggerInstance(baseOpts, logDir, appParsed.base, appParsed.ext, level, prettyPrint, frequency, maxSize);
  const coreLoggerInstance = createLoggerInstance({ ...baseOpts, name: `${name}-core` }, logDir, coreParsed.base, coreParsed.ext, level, prettyPrint, frequency, maxSize);
  const errorLoggerInstance = createLoggerInstance({ ...baseOpts, level: 'error', name: `${name}-error` }, logDir, errorParsed.base, errorParsed.ext, 'error', prettyPrint, frequency, maxSize);

  debugLog('[create] level: %s, dir: %s, frequency: %s', level, logDir, frequency);

  return {
    logger: loggerInstance,
    coreLogger: coreLoggerInstance,
    errorLogger: errorLoggerInstance,
  };
}