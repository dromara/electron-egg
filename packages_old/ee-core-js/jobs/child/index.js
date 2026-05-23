const EventEmitter = require('events');
const { JobProcess } = require('./jobProcess');
const { getFullpath } = require('../../loader');
const { Events } = require('../../const/channel');
const { getConfig } = require('../../config');
const { extend } = require('../../utils/extend');

class ChildJob extends EventEmitter {

  constructor() {
    super();
    this.jobs = {};
    this.config = {};

    const cfg = getConfig().jobs;
    if (cfg) {
      this.config = cfg;
    }

    this._initEvents();
  }

  /**
   * 初始化监听
   */  
  _initEvents() {
    this.on(Events.childProcessExit, (data) => {
      delete this.jobs[data.pid];
    });
    this.on(Events.childProcessError, (data) => {
      delete this.jobs[data.pid];
    });
  }

  /**
   * 执行一个job文件
   */  
  exec(filepath, params = {}, opt = {}) {
    const jobPath = getFullpath(filepath);
    const proc = this.createProcess(opt);
    const cmd = 'run';
    proc.dispatch(cmd, jobPath, params);
  
    return proc;
  }

  /**
   * 创建子进程
   */  
  createProcess(opt = {}) {
    const options = extend(true, {
      processArgs: {
        type: 'childJob'
      }
    }, opt);
    const proc = new JobProcess(this, options);
    if (!proc) {
      let errorMessage = `[ee-core] [jobs/child] Failed to obtain the child process !`
      throw new Error(errorMessage);
    }
    this.jobs[proc.pid] = proc;

    return proc;
  }

  /**
   * 获取当前pids
   */  
  getPids() {
    let pids = Object.keys(this.jobs);
    return pids;
  }  

  /**
   * 异步执行一个job文件 todo this指向
   */
  async execPromise(filepath, params = {}, opt = {}) {
    return this.exec(filepath, params, opt);
  }

}

module.exports = {
  ChildJob
};
