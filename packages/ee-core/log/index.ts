import dayjs from 'dayjs';
import { create } from './logger';

interface EELog {
  logger: any;
  coreLogger: any;
}

const Instance = {
  eelog: null as EELog | null,
  logger: {} as any,
  coreLogger: {} as any,
};
let logDate = 0;
const logProperties = ['error', 'warn', 'info', 'debug'];

// define logger/coreLogger properties
defineLoggerProperty();
defineCoreLoggerProperty();

// Create a log instance
function createLog(config?: any) {
  _delCache();
  const eeLog = create(config);

  return eeLog;
}

function loadLog() {
  Instance.eelog = createLog();
  return Instance.eelog;
}

function defineLoggerProperty() {
  for (const property of logProperties) {
    Object.defineProperty(Instance.logger, property, {
      get() {
        //console.log('emit logger property: ', property);
        let log = getLogger();
        let val = log[property].bind(log);
        return val;
      },
    });
  }
}

function defineCoreLoggerProperty() {
  for (const property of logProperties) {
    Object.defineProperty(Instance.coreLogger, property, {
      get() {
        let log = getCoreLogger();
        let val = log[property].bind(log);
        return val;
      },
    });
  }
}

function _delCache() {
  const now = parseInt(dayjs().format('YYYYMMDD'));
  if (logDate != now) {
    logDate = now;
    Instance.eelog = null;
  }
}

function getLogger() {
  _delCache();
  if (!Instance.eelog) {
    loadLog();
  }
  
  return Instance.eelog!.logger;
}

function getCoreLogger() {
  _delCache();
  if (!Instance.eelog) {
    loadLog();
  }
  return Instance.eelog!.coreLogger;
}

export {
  createLog,
  loadLog
};

export const logger = Instance.logger;
export const coreLogger = Instance.coreLogger;
