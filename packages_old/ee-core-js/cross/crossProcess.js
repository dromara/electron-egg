'use strict';

const EventEmitter = require('events');
const path = require('path');
const crossSpawn = require('cross-spawn');
const { coreLogger } = require('../log');
const { getExtraResourcesDir, isPackaged, isDev, getBaseDir } = require('../ps');
const { Events } = require('../const/channel');
const { getRandomString, getValueFromArgv } = require('../utils/helper');
const { is } = require('../utils');
const { parseArgv } = require('../utils/pargv');
const { app: electronApp } = require('electron');
const tkill = require('tree-kill');

class CrossProcess {
  constructor(host, opt = {}) {
    this.emitter = new EventEmitter();
    this.host = host;
    this.child = undefined;
    this.pid = 0;
    this.port = 0;
    this.name = "";
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
    this.name = targetConf.name;

    // Launch executable program
    let cmdPath = '';
    let cmdArgs = targetConf.args;
    let execDir = getExtraResourcesDir();
    let standardOutput = ['inherit', 'inherit', 'inherit', 'ipc'];
    if (isPackaged()) {
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
      if (!path.isAbsolute(cmd) && !isDev()) {
        cmdPath = path.join(getExtraResourcesDir(), cmd);
      }
    } else {
      cmdPath = path.join(getExtraResourcesDir(), targetConf.name);
    }

    // windows
    if (is.windows() && path.extname(cmdPath) != '.exe') {
      // Complete the executable program extension
      // notice: python.exe may bring up the App Store
      if (targetConf.windowsExtname === true || !isDev()) {
        cmdPath += ".exe";
      }
    }

    // executable program directory
    if (directory && path.isAbsolute(directory)) {
      execDir = directory;
    } else if (directory && !path.isAbsolute(directory)) {
      if (isDev()) {
        execDir = path.join(getBaseDir(), directory);
      } else {
        execDir = path.join(getExtraResourcesDir(), directory);
      }
    } else {
      execDir = getExtraResourcesDir();
    }

    coreLogger.info(`[ee-core] [cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);
    const coreProcess = crossSpawn(cmdPath, cmdArgs, { 
      stdio: standardOutput, 
      detached: false,
      cwd: execDir, 
      maxBuffer: 1024 * 1024 * 1024
    });
    this.child = coreProcess;
    this.pid = coreProcess.pid;

    coreProcess.on('exit', (code, signal) => {
      let data = {
        pid: this.pid
      }
      this.host.emitter.emit(Events.childProcessExit, data);
      // Child process closed: The child process was killed externally or an internal error caused the application to stop, resulting in the application exiting
      coreLogger.info(`[ee-core] [corss/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}, cmd:${cmdPath}, args: ${cmdArgs}`);
      this._exitElectron();
    });

    coreProcess.on('error', (err) => {
      let data = {
        pid: this.pid
      }
      this.host.emitter.emit(Events.childProcessError, data);
      coreLogger.error(`[ee-core] [corss/process] received a error from child-process, error: ${err}, pid:${this.pid}`);
      this._exitElectron();
    });
  }

  /**
   * kill
   */
  kill(timeout = 1000) {
    tkill(this.pid, 'SIGINT', (err) => {
      if (err) {
        coreLogger.error(`[ee-core] [corss/process] kill cross-process, error: ${err}, pid:${this.pid}`);
        tkill(this.pid, 'SIGKILL');
      }
      setTimeout(() => {
        this._exitElectron();
      }, timeout)
    })
  }

  getUrl() {
    const ssl = getValueFromArgv(this.config.args, 'ssl');
    let hostname = getValueFromArgv(this.config.args, 'hostname')
    let protocol = 'http://';
    if (ssl && (ssl == 'true' || ssl == '1')) {
      protocol = 'https://';
    }
    hostname = hostname ? hostname : '127.0.0.1';
    const url = protocol + hostname + ":" + this.port;

    return url;
  }

  getArgsObj() {
    const obj = parseArgv(this.config.args);
    return obj;
  }

  setPort(port) {
    this.port = parseInt(port);
  }

  _generateId() {
    const rid = getRandomString();
    return `node:${this.pid}:${rid}`;
  }

  /**
   * exit electron
   */
  _exitElectron(timeout = 1000) {
    if (this.config.appExit) {
      setTimeout(() => {
        // 主进程退出
        electronApp.quit();
      }, timeout)
    }
  }
}

module.exports = {
  CrossProcess
};