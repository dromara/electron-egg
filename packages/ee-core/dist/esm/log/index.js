import dayjs from "dayjs";
import { create } from "./logger";
const Instance = {
  eelog: null,
  logger: {},
  coreLogger: {}
};
let logDate = 0;
const logProperties = ["error", "warn", "info", "debug"];
defineLoggerProperty();
defineCoreLoggerProperty();
function createLog(config) {
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
        let log = getLogger();
        let val = log[property].bind(log);
        return val;
      }
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
      }
    });
  }
}
function _delCache() {
  const now = parseInt(dayjs().format("YYYYMMDD"));
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
  return Instance.eelog.logger;
}
function getCoreLogger() {
  _delCache();
  if (!Instance.eelog) {
    loadLog();
  }
  return Instance.eelog.coreLogger;
}
const logger = Instance.logger;
const coreLogger = Instance.coreLogger;
export {
  coreLogger,
  createLog,
  loadLog,
  logger
};
