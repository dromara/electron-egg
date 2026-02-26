import debug from "debug";
import dayjs from "dayjs";
import path from "path";
import { extend } from "../utils/extend";
import { getConfig } from "../config";
import { getLogDir, env, isDev } from "../ps";
const EggLoggers = require("egg-logger");
const debugLog = debug("ee-core:log:logger");
let LogDate = 0;
const TmpFileName = {
  appLogName: "",
  coreLogName: "",
  errorLogName: ""
};
function create(config = {}) {
  let opt = {};
  if (Object.keys(config).length == 0) {
    const defaultConfig = {
      logger: {
        type: "application",
        dir: getLogDir(),
        env: env(),
        consoleLevel: "INFO",
        disableConsoleAfterReady: !isDev(),
        coreLogger: {},
        allowDebugAtProd: false,
        agentLogName: "ee-agent.log",
        rotator: "day"
      },
      customLogger: {}
    };
    const sysConfig = getConfig();
    opt = extend(true, defaultConfig, {
      logger: sysConfig.logger,
      customLogger: sysConfig.customLogger || {}
    });
  } else {
    opt.logger = config.logger;
    opt.customLogger = config.customLogger;
  }
  if (Object.keys(opt).length == 0) {
    throw new Error("logger config is null");
  }
  let rotateType = opt.logger.rotator;
  if (rotateType == "day") {
    opt = _rotateByDay(opt);
  }
  debugLog("[create] opt:%j", opt);
  const loggers = new EggLoggers(opt);
  return loggers;
}
function _rotateByDay(logOpt) {
  const now = parseInt(dayjs().format("YYYYMMDD"));
  if (LogDate != now) {
    LogDate = now;
    if (TmpFileName.appLogName.length == 0) {
      TmpFileName.appLogName = logOpt.logger.appLogName;
    }
    if (TmpFileName.coreLogName.length == 0) {
      TmpFileName.coreLogName = logOpt.logger.coreLogName;
    }
    if (TmpFileName.errorLogName.length == 0) {
      TmpFileName.errorLogName = logOpt.logger.errorLogName;
    }
    const { appLogName, coreLogName, errorLogName } = TmpFileName;
    const appLogExtname = path.extname(appLogName);
    const coreLogExtname = path.extname(coreLogName);
    const errorLogExtname = path.extname(errorLogName);
    logOpt.logger.appLogName = path.basename(appLogName, appLogExtname) + "-" + now + appLogExtname;
    logOpt.logger.coreLogName = path.basename(coreLogName, coreLogExtname) + "-" + now + coreLogExtname;
    logOpt.logger.errorLogName = path.basename(errorLogName, errorLogExtname) + "-" + now + errorLogExtname;
  }
  return logOpt;
}
export {
  create
};
