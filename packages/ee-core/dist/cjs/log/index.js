"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreLogger = exports.logger = void 0;
exports.createLog = createLog;
exports.loadLog = loadLog;
const dayjs_1 = __importDefault(require("dayjs"));
const logger_1 = require("./logger");
const Instance = {
    eelog: null,
    logger: {},
    coreLogger: {},
};
let logDate = 0;
const logProperties = ['error', 'warn', 'info', 'debug'];
// define logger/coreLogger properties
defineLoggerProperty();
defineCoreLoggerProperty();
// Create a log instance
function createLog(config) {
    _delCache();
    const eeLog = (0, logger_1.create)(config);
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
    const now = parseInt((0, dayjs_1.default)().format('YYYYMMDD'));
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
exports.logger = Instance.logger;
exports.coreLogger = Instance.coreLogger;
//# sourceMappingURL=index.js.map