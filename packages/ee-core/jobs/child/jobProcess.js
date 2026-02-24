const path = require('path');
const EventEmitter = require('events');
const serialize = require('serialize-javascript');
const { fork } = require('child_process');
const { coreLogger } = require('../../log');
const { getBaseDir, isPackaged, allEnv } = require('../../ps');
const { Processes, Events, Receiver } = require('../../const/channel');
const { getRandomString } = require('../../utils/helper');
const { getFullpath } = require('../../loader');
const { extend } = require('../../utils/extend');

class JobProcess {
  constructor(host, opt = {}) {
    
    let cwd = getBaseDir();
    const appPath = path.join(__dirname, 'app.js');
    if (isPackaged()) {
      // todo fork的cwd目录为什么要在app.asar外 ？
      cwd = path.join(getBaseDir(), '..');
    }

    const options = extend(true, {
      processArgs: {},
      processOptions: { 
        cwd: cwd,
        env: allEnv(), 
        stdio: 'ignore' // pipe
      }
    }, opt);

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;

    // 传递给子进程的参数
    this.args.push(JSON.stringify(options.processArgs));

    this.child = fork(appPath, this.args, options.processOptions);
    this.pid = this.child.pid;
    this._init();
  }

  _init() {
    const { messageLog } = this.host.config;
    this.child.on('message', (m) => {
      if (messageLog == true) {
        coreLogger.info(`[ee-core] [jobs/child] received a message from child-process, message: ${serialize(m)}`);
      }
      
      if (m.channel == Processes.showException) {
        coreLogger.error(`${m.data}`);
      }

      // 收到子进程消息，转发到 event 
      if (m.channel == Processes.sendToMain) {
        this._eventEmit(m);
      }
    });

    this.child.on('exit', (code, signal) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Events.childProcessExit, data);
      coreLogger.info(`[ee-core] [jobs/child] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });

    this.child.on('error', (err) => {
      let data = {
        pid: this.pid
      }
      this.host.emit(Events.childProcessError, data);
      coreLogger.error(`[ee-core] [jobs/child] received a error from child-process, error: ${err}, pid:${this.pid}`);
    });
  }

  _eventEmit(m) {
    switch (m.eventReceiver) {
      case Receiver.forkProcess:
        this.emitter.emit(m.event, m.data);
        break;
      case Receiver.childJob:
        this.host.emit(m.event, m.data);
        break;    
      default:
        this.host.emit(m.event, m.data);
        this.emitter.emit(m.event, m.data);
        break;
    }
  }
  
  dispatch(cmd, jobPath = '', ...params) {
    // 消息对象
    const mid = getRandomString();
    let msg = {
      mid,
      cmd,
      jobPath,
      jobParams: params
    }

    // todo 是否会发生监听未完成时，接收不到消息？
    // 发消息到子进程
    this.child.send(msg);
  }

  callFunc(jobPath = '', funcName = '', ...params) {
    jobPath = getFullpath(jobPath);

    // 消息对象
    const mid = getRandomString();
    let msg = {
      mid,
      cmd:'run',
      jobPath,
      jobFunc: funcName,
      jobFuncParams: params
    }
    this.child.send(msg);
  }

  kill(timeout = 1000) {
    this.child.kill('SIGINT');
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill('SIGKILL');
    }, timeout)
  }
}

module.exports = {
  JobProcess
};