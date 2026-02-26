"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cross = exports.Cross = void 0;
const events_1 = __importDefault(require("events"));
const config_1 = require("../config");
const helper_1 = require("../utils/helper");
const crossProcess_1 = require("./crossProcess");
const channel_1 = require("../const/channel");
const extend_1 = require("../utils/extend");
const port_1 = require("../utils/port");
class Cross {
    constructor() {
        this.emitter = undefined;
        // pid唯一
        // {pid:{name,entity}, pid:{name,entity}, ...}
        this.children = {};
        // name唯一
        // {name:pid, name:pid, ...}
        this.childrenMap = {};
        // eventEmitter
        this._initEventEmitter();
    }
    async create() {
        // boot services
        const crossCfg = (0, config_1.getConfig)().cross;
        //await sleep(5 * 1000);
        for (let key of Object.keys(crossCfg)) {
            let val = crossCfg[key];
            if (val.enable == true) {
                this.run(key);
            }
        }
    }
    // run
    async run(service, opt = {}) {
        const crossConf = (0, config_1.getConfig)().cross;
        const defaultOpt = crossConf[service] || {};
        const targetConf = (0, extend_1.extend)(true, {}, defaultOpt, opt);
        if (Object.keys(targetConf).length == 0) {
            throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
        }
        // format params
        let tmpArgs = targetConf.args;
        let confPort = parseInt((0, helper_1.getValueFromArgv)(tmpArgs, 'port'));
        // 某些程序给它传入不存在的参数时会报错
        if (isNaN(confPort) && targetConf.port > 0) {
            confPort = targetConf.port;
        }
        if (confPort > 0) {
            // 动态生成port，传入的端口必须为int
            confPort = await (0, port_1.getPort)({ port: confPort });
            // 替换port
            targetConf.args = (0, helper_1.replaceArgsValue)(tmpArgs, "port", String(confPort));
        }
        // 创建进程
        const subProcess = new crossProcess_1.CrossProcess(this, { targetConf, port: confPort });
        let uniqueName = targetConf.name;
        const pid = subProcess.pid;
        if (pid) {
            if (this.childrenMap.hasOwnProperty(uniqueName)) {
                uniqueName = uniqueName + "-" + String(pid);
            }
            this.childrenMap[uniqueName] = pid;
            subProcess.name = uniqueName;
            this.children[pid] = {
                name: uniqueName,
                entity: subProcess
            };
        }
        return subProcess;
    }
    killAll() {
        Object.keys(this.children).forEach(pid => {
            this.kill(pid);
        });
    }
    kill(pid) {
        const entity = this.getProc(pid);
        if (entity) {
            entity.kill();
        }
    }
    killByName(name) {
        const entity = this.getProcByName(name);
        if (entity) {
            entity.kill();
        }
    }
    getUrl(name) {
        const entity = this.getProcByName(name);
        const url = entity.getUrl();
        return url;
    }
    // 获取 proc
    getProcByName(name) {
        // [todo] 如果有名字一样的服务，需要加 pid
        const pid = this.childrenMap[name];
        if (!pid) {
            throw new Error(`[ee-core] [cross] The process named [${name}] does not exit`);
        }
        const entity = this.getProc(pid);
        return entity;
    }
    // 获取 proc
    getProc(pid) {
        const child = this.children[pid];
        if (!pid) {
            throw new Error(`[ee-core] [cross] The process pid [${pid}] does not exit`);
        }
        return child.entity;
    }
    // 获取pids  
    getPids() {
        let pids = Object.keys(this.children);
        return pids;
    }
    _initEventEmitter() {
        this.emitter = new events_1.default();
        this.emitter.on(channel_1.Events.childProcessExit, (data) => {
            const child = this.children[data.pid];
            delete this.childrenMap[child.name];
            delete this.children[data.pid];
        });
        this.emitter.on(channel_1.Events.childProcessError, (data) => {
            const child = this.children[data.pid];
            delete this.childrenMap[child.name];
            delete this.children[data.pid];
        });
    }
}
exports.Cross = Cross;
const cross = new Cross();
exports.cross = cross;
//# sourceMappingURL=cross.js.map