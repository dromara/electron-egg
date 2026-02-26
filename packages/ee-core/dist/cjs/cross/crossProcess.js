"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossProcess = void 0;
const events_1 = __importDefault(require("events"));
const path_1 = __importDefault(require("path"));
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const log_1 = require("../log");
const ps_1 = require("../ps");
const channel_1 = require("../const/channel");
const helper_1 = require("../utils/helper");
const is_1 = require("../utils/is");
const pargv_1 = require("../utils/pargv");
const electron_1 = require("electron");
const tree_kill_1 = __importDefault(require("tree-kill"));
class CrossProcess {
    get pid() {
        return this._pid;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    constructor(host, opt = {}) {
        this.emitter = new events_1.default();
        this.host = host;
        this.child = undefined;
        this._pid = 0;
        this.port = 0;
        this._name = "";
        this.config = {};
        this._init(opt);
    }
    /**
     * 初始化子进程
     */
    _init(options = {}) {
        const { targetConf, port } = options;
        this.config = targetConf;
        this.port = port;
        // 该名称如果在childrenMap重复，会被重写
        this._name = targetConf.name;
        // Launch executable program
        let cmdPath = '';
        let cmdArgs = targetConf.args;
        let execDir = (0, ps_1.getExtraResourcesDir)();
        let standardOutput = ['inherit', 'inherit', 'inherit', 'ipc'];
        if ((0, ps_1.isPackaged)()) {
            standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
        }
        if (targetConf.stdio) {
            standardOutput = targetConf.stdio;
        }
        const { cmd, directory } = targetConf;
        // use cmd first
        if (cmd) {
            if (!directory) {
                throw new Error(`[ee-core] [cross] The config [directory] attribute does not exist`);
            }
            cmdPath = cmd;
            if (!path_1.default.isAbsolute(cmd) && !(0, ps_1.isDev)()) {
                cmdPath = path_1.default.join((0, ps_1.getExtraResourcesDir)(), cmd);
            }
        }
        else {
            cmdPath = path_1.default.join((0, ps_1.getExtraResourcesDir)(), targetConf.name);
        }
        // windows
        if ((0, is_1.windows)() && path_1.default.extname(cmdPath) != '.exe') {
            // Complete the executable program extension
            // notice: python.exe may bring up the App Store
            if (targetConf.windowsExtname === true || !(0, ps_1.isDev)()) {
                cmdPath += ".exe";
            }
        }
        // executable program directory
        if (directory && path_1.default.isAbsolute(directory)) {
            execDir = directory;
        }
        else if (directory && !path_1.default.isAbsolute(directory)) {
            if ((0, ps_1.isDev)()) {
                execDir = path_1.default.join((0, ps_1.getBaseDir)(), directory);
            }
            else {
                execDir = path_1.default.join((0, ps_1.getExtraResourcesDir)(), directory);
            }
        }
        else {
            execDir = (0, ps_1.getExtraResourcesDir)();
        }
        log_1.coreLogger.info(`[ee-core] [cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);
        const coreProcess = (0, cross_spawn_1.default)(cmdPath, cmdArgs, {
            stdio: standardOutput,
            detached: false,
            cwd: execDir,
            maxBuffer: 1024 * 1024 * 1024
        });
        this.child = coreProcess;
        this._pid = coreProcess.pid;
        coreProcess.on('exit', (code, signal) => {
            let data = {
                pid: this._pid
            };
            this.host.emitter.emit(channel_1.Events.childProcessExit, data);
            // Child process closed: The child process was killed externally or an internal error caused the application to stop, resulting in the application exiting
            log_1.coreLogger.info(`[ee-core] [corss/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this._pid}, cmd:${cmdPath}, args: ${cmdArgs}`);
            this._exitElectron();
        });
        coreProcess.on('error', (err) => {
            let data = {
                pid: this._pid
            };
            this.host.emitter.emit(channel_1.Events.childProcessError, data);
            log_1.coreLogger.error(`[ee-core] [corss/process] received a error from child-process, error: ${err}, pid:${this._pid}`);
            this._exitElectron();
        });
    }
    /**
     * kill
     */
    kill(timeout = 1000) {
        if (this._pid) {
            (0, tree_kill_1.default)(this._pid, 'SIGINT', (err) => {
                if (err) {
                    log_1.coreLogger.error(`[ee-core] [corss/process] kill cross-process, error: ${err}, pid:${this._pid}`);
                    if (this._pid) {
                        (0, tree_kill_1.default)(this._pid, 'SIGKILL');
                    }
                }
                setTimeout(() => {
                    this._exitElectron();
                }, timeout);
            });
        }
    }
    getUrl() {
        const ssl = (0, helper_1.getValueFromArgv)(this.config.args, 'ssl');
        let hostname = (0, helper_1.getValueFromArgv)(this.config.args, 'hostname');
        let protocol = 'http://';
        if (ssl && (ssl == 'true' || ssl == '1')) {
            protocol = 'https://';
        }
        hostname = hostname ? hostname : '127.0.0.1';
        const url = protocol + hostname + ":" + this.port;
        return url;
    }
    getArgsObj() {
        const obj = (0, pargv_1.parseArgv)(this.config.args, {});
        return obj;
    }
    setPort(port) {
        this.port = port;
    }
    _generateId() {
        const rid = (0, helper_1.getRandomString)();
        return `node:${this._pid}:${rid}`;
    }
    /**
     * exit electron
     */
    _exitElectron(timeout = 1000) {
        if (this.config.appExit) {
            setTimeout(() => {
                // 主进程退出
                electron_1.app.quit();
            }, timeout);
        }
    }
}
exports.CrossProcess = CrossProcess;
//# sourceMappingURL=crossProcess.js.map