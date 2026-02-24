
const is = require('is-type-of');
const { loadException } = require('ee-core/exception');
const { requireFile } = require('ee-core/loader');
const { coreLogger } = require('ee-core/log');
const { isBytecodeClass } = require('ee-core/core/utils');

loadException();
const commands = ['run'];

class ChildApp {
  constructor() {
    this._initEvents();
    this.jobMap = new Map();
  }

  /**
   * 初始化事件监听
   */
  _initEvents() {
    process.on('message', this._handleMessage.bind(this));
    process.once('exit', (code) => {
      coreLogger.info(`[ee-core] [jobs/child] received a exit from main-process, code:${code}, pid:${process.pid}`);
    });
  }

  /**
   * 监听消息
   */
  _handleMessage(m) {
    if (commands.indexOf(m.cmd) == -1) {
      return
    }
    switch (m.cmd) {
      case 'run':
        this.run(m);
        break;
      default:
    }
    coreLogger.info(`[ee-core] [jobs/child] received a message from main-process, message: ${JSON.stringify(m)}`);
  }

  /**
   * 运行脚本
   */  
  run(msg = {}) {
    const {jobPath, jobParams, jobFunc, jobFuncParams} = msg;
    let mod = requireFile(jobPath);
    if (is.class(mod) || isBytecodeClass(mod)) {
      let instance;
      if (!this.jobMap.has(jobPath)) {
        instance = new mod(...jobParams);
        this.jobMap.set(jobPath, instance);
      } else {
        instance = this.jobMap.get(jobPath);
      }

      // 如果指定了函数名，则调用指定的函数
      if (jobFunc) {
        instance[jobFunc](...jobFuncParams);
      } else {
        instance.handle(...jobParams);
      }
    } else if (is.function(mod)) {
      mod(jobParams);
    }
  }
}

new ChildApp();