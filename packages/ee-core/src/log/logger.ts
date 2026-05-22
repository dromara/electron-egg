import pino from 'pino';
import path from 'path';
import debug from 'debug';
import { getConfig } from '../config/index.js';
import { extend } from '../utils/extend.js';
import { getLogDir, isDev } from '../ps/index.js';

const debugLog = debug('ee-core:log:logger');

export interface PinoLoggers {
  logger: pino.Logger;
  coreLogger: pino.Logger;
  errorLogger: pino.Logger;
}

// Backward-compatible level name mapping (INFO → info, etc.)
const LEVEL_MAP: Record<string, string> = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
  TRACE: 'trace',
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

  // Target 1: file with daily rotation (pino-roll)
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

  // Target 2: console pretty output (dev only)
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

export function create(config: Record<string, unknown> = {}): PinoLoggers {
  let opt: Record<string, unknown> = {};

  if (Object.keys(config).length === 0) {
    const defaultConfig = {
      logger: {
        type: 'application',
        dir: getLogDir(),
        level: 'info',
        outputJSON: false,
        prettyPrint: isDev(),
        appLogName: 'ee.log',
        coreLogName: 'ee-core.log',
        errorLogName: 'ee-error.log',
        rotator: 'day',
        redact: [],
        timestamp: true,
        name: 'ee',
        maxSize: '10m',
      },
    };
    const sysConfig = getConfig();
    opt = extend(true, defaultConfig, { logger: sysConfig.logger });
  } else {
    opt = { logger: config };
  }

  if (Object.keys(opt).length === 0) {
    throw new Error('logger config is null');
  }

  const loggerConf = opt.logger as Record<string, unknown>;
  const logDir = (loggerConf.dir as string) || getLogDir();
  const level = normalizeLevel((loggerConf.level as string) || 'info');
  const outputJSON = (loggerConf.outputJSON as boolean) ?? false;
  // When outputJSON is true, disable prettyPrint (force JSON everywhere)
  const prettyPrint = outputJSON ? false : ((loggerConf.prettyPrint as boolean) ?? isDev());
  const appLogName = (loggerConf.appLogName as string) || 'ee.log';
  const coreLogName = (loggerConf.coreLogName as string) || 'ee-core.log';
  const errorLogName = (loggerConf.errorLogName as string) || 'ee-error.log';
  const redact = (loggerConf.redact as string[]) || [];
  const name = (loggerConf.name as string) || 'ee';
  const timestamp = (loggerConf.timestamp as boolean) ?? true;
  const rotator = (loggerConf.rotator as string) || 'day';
  const maxSize = typeof loggerConf.maxSize === 'number'
    ? `${(loggerConf.maxSize as number) / 1024 / 1024}m`
    : (loggerConf.maxSize as string) || '10m';
  const frequency = mapRotatorToFrequency(rotator);

  // Common pino options
  const baseOpts: pino.LoggerOptions = {
    level,
    name,
    timestamp: timestamp ? pino.stdTimeFunctions.isoTime : false,
  };
  if (redact.length > 0) {
    baseOpts.redact = { paths: redact, censor: '[Redacted]' };
  }

  // Parse file names for pino-roll
  const appParsed = parseLogFileName(appLogName);
  const coreParsed = parseLogFileName(coreLogName);
  const errorParsed = parseLogFileName(errorLogName);

  // Create logger (app)
  const appTargets = buildTransportTargets(logDir, appParsed.base, appParsed.ext, level, prettyPrint, frequency, maxSize);
  const appTransport = pino.transport({ targets: appTargets });
  const loggerInstance = pino(baseOpts, appTransport);

  // Create coreLogger
  const coreOpts = { ...baseOpts, name: `${name}-core` };
  const coreTargets = buildTransportTargets(logDir, coreParsed.base, coreParsed.ext, level, prettyPrint, frequency, maxSize);
  const coreTransport = pino.transport({ targets: coreTargets });
  const coreLoggerInstance = pino(coreOpts, coreTransport);

  // Create errorLogger (error+ level only)
  const errorOpts = { ...baseOpts, level: 'error', name: `${name}-error` };
  const errorTargets = buildTransportTargets(logDir, errorParsed.base, errorParsed.ext, 'error', prettyPrint, frequency, maxSize);
  const errorTransport = pino.transport({ targets: errorTargets });
  const errorLoggerInstance = pino(errorOpts, errorTransport);

  debugLog('[create] level: %s, dir: %s, frequency: %s', level, logDir, frequency);

  return {
    logger: loggerInstance,
    coreLogger: coreLoggerInstance,
    errorLogger: errorLoggerInstance,
  };
}