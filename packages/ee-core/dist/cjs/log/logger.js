"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const debug_1 = __importDefault(require("debug"));
const dayjs_1 = __importDefault(require("dayjs"));
const path_1 = __importDefault(require("path"));
const extend_1 = require("../utils/extend");
const config_1 = require("../config");
const ps_1 = require("../ps");
// Import egg-logger correctly
const EggLoggers = require('egg-logger');
const debugLog = (0, debug_1.default)('ee-core:log:logger');
let LogDate = 0;
const TmpFileName = {
    appLogName: '',
    coreLogName: '',
    errorLogName: '',
};
// 创建
function create(config = {}) {
    let opt = {};
    if (Object.keys(config).length == 0) {
        const defaultConfig = {
            logger: {
                type: 'application',
                dir: (0, ps_1.getLogDir)(),
                env: (0, ps_1.env)(),
                consoleLevel: 'INFO',
                disableConsoleAfterReady: !(0, ps_1.isDev)(),
                coreLogger: {},
                allowDebugAtProd: false,
                agentLogName: 'ee-agent.log',
                rotator: 'day',
            },
            customLogger: {}
        };
        const sysConfig = (0, config_1.getConfig)();
        opt = (0, extend_1.extend)(true, defaultConfig, {
            logger: sysConfig.logger,
            customLogger: sysConfig.customLogger || {}
        });
    }
    else {
        opt.logger = config.logger;
        opt.customLogger = config.customLogger;
    }
    if (Object.keys(opt).length == 0) {
        throw new Error("logger config is null");
    }
    let rotateType = opt.logger.rotator;
    if (rotateType == 'day') {
        opt = _rotateByDay(opt);
    }
    debugLog('[create] opt:%j', opt);
    const loggers = new EggLoggers(opt);
    return loggers;
}
/**
 * 按天分割
 */
function _rotateByDay(logOpt) {
    const now = parseInt((0, dayjs_1.default)().format('YYYYMMDD'));
    if (LogDate != now) {
        LogDate = now;
        // 保存一个临时文件名，防止文件名按日期累加
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
        const appLogExtname = path_1.default.extname(appLogName);
        const coreLogExtname = path_1.default.extname(coreLogName);
        const errorLogExtname = path_1.default.extname(errorLogName);
        logOpt.logger.appLogName = path_1.default.basename(appLogName, appLogExtname) + '-' + now + appLogExtname;
        logOpt.logger.coreLogName = path_1.default.basename(coreLogName, coreLogExtname) + '-' + now + coreLogExtname;
        logOpt.logger.errorLogName = path_1.default.basename(errorLogName, errorLogExtname) + '-' + now + errorLogExtname;
    }
    return logOpt;
}
//# sourceMappingURL=logger.js.map