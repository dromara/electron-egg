import debug from 'debug';
import { EggLoggers } from 'egg-logger';
import dayjs from 'dayjs';
import path from 'path';
import { extend } from '../utils/extend.js';
import { getConfig } from '../config/index.js';
import { getLogDir, env, isDev } from '../ps/index.js';

const log = debug('ee-core:log:logger');

let LogDate = 0;
const TmpFileName = {
  appLogName: '',
  coreLogName: '',
  errorLogName: '',
};

// 创建
export function create(config: Record<string, unknown> = {}): EggLoggers {
  let opt: Record<string, unknown> = {};

  if (Object.keys(config).length === 0) {
    const defaultConfig = {
      logger: {
        type: 'application',
        dir: getLogDir(),
        env: env(),
        consoleLevel: 'INFO',
        disableConsoleAfterReady: !isDev(),
        coreLogger: {},
        allowDebugAtProd: false,
        agentLogName: 'ee-agent.log',
        rotator: 'day',
      },
      customLogger: {},
    };
    const sysConfig = getConfig();
    opt = extend(true, defaultConfig, {
      logger: sysConfig.logger,
      customLogger: sysConfig.customLogger || {},
    });
  } else {
    opt.logger = config.logger;
    opt.customLogger = config.customLogger;
  }

  if (Object.keys(opt).length === 0) {
    throw new Error('logger config is null');
  }

  const rotateType = (opt.logger as Record<string, unknown>).rotator;
  if (rotateType === 'day') {
    opt = _rotateByDay(opt);
  }

  log('[create] opt:%j', opt);
  return new EggLoggers(opt as ConstructorParameters<typeof EggLoggers>[0]);
}

/**
 * 按天分割
 */
function _rotateByDay(logOpt: Record<string, unknown>): Record<string, unknown> {
  const now = parseInt(dayjs().format('YYYYMMDD'));
  if (LogDate !== now) {
    LogDate = now;

    const logger = logOpt.logger as Record<string, string>;
    // 保存一个临时文件名，防止文件名按日期累加
    if (TmpFileName.appLogName.length === 0) {
      TmpFileName.appLogName = logger.appLogName || '';
    }
    if (TmpFileName.coreLogName.length === 0) {
      TmpFileName.coreLogName = logger.coreLogName || '';
    }
    if (TmpFileName.errorLogName.length === 0) {
      TmpFileName.errorLogName = logger.errorLogName || '';
    }

    logger.appLogName = path.join(
      (path.dirname(TmpFileName.appLogName) || '.'),
      dayjs().format('YYYY-MM-DD') + '.' + path.basename(TmpFileName.appLogName)
    );
    logger.coreLogName = path.join(
      (path.dirname(TmpFileName.coreLogName) || '.'),
      dayjs().format('YYYY-MM-DD') + '.' + path.basename(TmpFileName.coreLogName)
    );
    logger.errorLogName = path.join(
      (path.dirname(TmpFileName.errorLogName) || '.'),
      dayjs().format('YYYY-MM-DD') + '.' + path.basename(TmpFileName.errorLogName)
    );
  }
  return logOpt;
}
