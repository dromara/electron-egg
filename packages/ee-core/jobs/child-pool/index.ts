import EventEmitter from 'events';
import LoadBalancer from '../load-balancer';
import { getFullpath } from '../../core';
import { JobProcess } from '../child/jobProcess';
import { Events } from '../../const/channel';
import { validValue } from '../../utils/helper';
import { getConfig } from '../../config';

class ChildPoolJob extends EventEmitter {
  private config: any;
  private boundMap: Map<any, any>;
  private children: any;
  private min: number;
  private max: number;
  private strategy: string;
  private weights: number[];
  private LB: any;

  constructor(opt: any = {}) {
    super();
    let options = Object.assign({
      weights: [],
    }, opt);

    this.config = {};
    this.boundMap = new Map();
    this.children = {};
    this.min = 3;
    this.max = 6;
    this.strategy = 'polling';
    this.weights = new Array(this.max).fill(0).map((v, i) => {
      let w = validValue(options.weights[i]) ? options.weights[i] : 1
      return w;
    });

    let lbOpt = {
      algorithm: LoadBalancer.Algorithm.polling,
      targets: [],
    }
    this.LB = new LoadBalancer(lbOpt);

    const cfg = getConfig().jobs;
    if (cfg) {
      this.config = cfg;
    }

    this._initEvents();
  }

  private _initEvents() {
    this.on(Events.childProcessExit, (data: any) => {
      this._removeChild(data.pid);
    });
    this.on(Events.childProcessError, (data: any) => {
      this._removeChild(data.pid);
    });
  }
 
  private _removeChild(pid: string) {
    const length = Object.keys(this.children).length;
    const lbOpt = {
      id: pid,
      weight: this.weights[length - 1],
    }
    this.LB.del(lbOpt);
    delete this.children[pid];
  }
 
  async create(number: number = 3) {
    if (number < 0 || number > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number is invalid !`);
    }
    let currentNumber = Object.keys(this.children).length;
    if (currentNumber > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number of current processes number: ${currentNumber} is greater than the maximum: ${this.max} !`);
    }

    if (number + currentNumber > this.max) {
      number = this.max - currentNumber;
    }

    // args
    let options = Object.assign({
      processArgs: {
        type: 'childPoolJob'
      }
    }, {});
    for (let i = 1; i <= number; i++) {
      let task = new JobProcess(this, options);
      this._childCreated(task);
    }
  
    let pids = Object.keys(this.children);

    return pids;
  }

  //  Post creation processing of child processes
  private _childCreated(childProcess: JobProcess) {
    let pid = childProcess.pid;
    this.children[pid] = childProcess;

    const length = Object.keys(this.children).length;
    let lbTask = {
      id: pid,
      weight: this.weights[length - 1],
    }
    this.LB.add(lbTask);
  }

  // Execute a job file 
  run(filepath: string, params: any = {}) {
    const jobPath = getFullpath(filepath);
    const childProcess = this.getChild();
    childProcess.dispatch('run', jobPath, params);

    return childProcess;
  }

  // Asynchronous execution of a job file
  async runPromise(filepath: string, params: any = {}) {
    return this.run(filepath, params);
  }  

  // Get the bound process object 
  getBoundChild(boundId: any) {
    let proc: any;
    const boundPid = this.boundMap.get(boundId);
    if (boundPid) {
      proc = this.children[boundPid];
      return proc;
    }

    // 获取进程并绑定
    proc = this.getChild();
    this.boundMap.set(boundId, proc.pid);

    return proc;
  }

  // Retrieve a sub process object through PID 
  getChildByPid(pid: string) {
    let proc = this.children[pid] || null;
    return proc;
  }

  // Get a sub process object 
  getChild() {
    let proc: any;
    const currentPids = Object.keys(this.children);

    // 没有则创建
    if (currentPids.length == 0) {
      let subIds = this.create(1);
      proc = this.children[subIds[0]];
    } else {
      // 从池子中获取一个
      let onePid = this.LB.pickOne().id;
      proc = this.children[onePid];
    }
    
    if (!proc) {
      let errorMessage = `[ee-core] [jobs/child-pool] Failed to obtain the child process !`
      throw new Error(errorMessage);
    }

    return proc;
  }

  // Get current pigs 
  getPids() {
    let pids = Object.keys(this.children);
    return pids;
  }   

  // kill all
  // type: sequence | parallel
  killAll(type: string = 'parallel') {
    let i = 1;
    Object.keys(this.children).forEach(key => {
      let proc = this.children[key];
      if (proc) {
        if (type == 'sequence') {
          setTimeout(()=>{
            proc.kill();
          }, i * 1000)
          i++;
        } else {
          proc.kill();
        }
      }
    });
  }
}

export {
  ChildPoolJob
};
