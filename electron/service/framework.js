'use strict';

const { logger } = require('ee-core/log');
const { ChildJob, ChildPoolJob } = require('ee-core/jobs');

/**
 * framework
 * @class
 */
class FrameworkService {

  constructor() {
    // 在构造函数中初始化一些变量
    this.myTimer = null;
    this.myJob = new ChildJob();
    this.myJobPool = new ChildPoolJob();
    this.taskForJob = {};
  }

  /**
   * test
   */
  async test(args) {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('FrameworkService obj:', obj);
    return obj;
  }

  /**
   * ipc通信(双向)
   */
  bothWayMessage(type, content, event) {
    // 前端ipc频道 channel
    const channel = 'controller/framework/ipcSendMsg';

    if (type == 'start') {
      // 每隔1秒，向前端页面发送消息
      // 用定时器模拟
      this.myTimer = setInterval(function(e, c, msg) {
        let timeNow = Date.now();
        let data = msg + ':' + timeNow;
        e.reply(`${c}`, data)
      }, 1000, event, channel, content)

      return '开始了'
    } else if (type == 'end') {
      clearInterval(this.myTimer);
      return '停止了'    
    } else {
      return 'ohther'
    }
  }

  /**
   * 执行任务
   */ 
  doJob(jobId, action, event) {
    let res = {};
    let oneTask;
    const channel = 'controller/framework/timerJobProgress';
    if (action == 'create') {
      // 执行任务及监听进度
      let eventName = 'job-timer-progress-' + jobId;
      const timerTask = this.myJob.exec('./jobs/example/timer', {jobId});
      timerTask.emitter.on(eventName, (data) => {
        logger.info('[main-process] timerTask, from TimerJob data:', data);
        // 发送数据到渲染进程
        event.sender.send(`${channel}`, data)
      })
    
      // 执行任务及监听进度 异步
      // myjob.execPromise('./jobs/example/timer', {jobId}).then(task => {
      //   task.emitter.on(eventName, (data) => {
      //     Log.info('[main-process] timerTask, from TimerJob data:', data);
      //     // 发送数据到渲染进程
      //     event.sender.send(`${channel}`, data)
      //   })
      // });

      res.pid = timerTask.pid; 
      this.taskForJob[jobId] = timerTask;
    }
    if (action == 'close') {
      oneTask = this.taskForJob[jobId];
      oneTask.kill();
      event.sender.send(`${channel}`, {jobId, number:0, pid:0});
    }
    if (action == 'pause') {
      oneTask = this.taskForJob[jobId];
      oneTask.callFunc('./jobs/example/timer', 'pause', jobId);
    }
    if (action == 'resume') {
      oneTask = this.taskForJob[jobId];
      oneTask.callFunc('./jobs/example/timer', 'resume', jobId, oneTask.pid);
    }

    return res;
  }



  /**
   * 创建pool
   */ 
  doCreatePool(num, event) {
    const channel = 'controller/framework/createPoolNotice';
    this.myJobPool.create(num).then(pids => {
      event.reply(`${channel}`, pids);
    });
  }

  /**
   * 通过进程池执行任务
   */ 
  doJobByPool(jobId, action, event) {
    let res = {};
    const channel = 'controller/framework/timerJobProgress';
    if (action == 'run') {
      // 异步-执行任务及监听进度
      this.myJobPool.runPromise('./jobs/example/timer', {jobId}).then(task => {

        // 监听器名称唯一，否则会出现重复监听。
        // 任务完成时，需要移除监听器，防止内存泄漏
        let eventName = 'job-timer-progress-' + jobId;
        task.emitter.on(eventName, (data) => {
          logger.info('[main-process] [ChildPoolJob] timerTask, from TimerJob data:', data);
  
          // 发送数据到渲染进程
          event.sender.send(`${channel}`, data)

          // 如果收到任务完成的消息，移除监听器
          if (data.end) {
            task.emitter.removeAllListeners(eventName);
          }
        });

        res.pid = task.pid; 
      });
    }
    return res;
  }

  /**
   * 获取正在运行的 job 进程 
   */ 
  monitorJob() {
    setInterval(() => {
      let jobPids = this.myJob.getPids();
      let jobPoolPids = this.myJobPool.getPids();
      logger.info(`[main-process] [monitorJob] jobPids: ${jobPids}, jobPoolPids: ${jobPoolPids}`);
    }, 5000)
  }

}
FrameworkService.toString = () => '[class FrameworkService]';

module.exports = {
  FrameworkService,
  frameworkService: new FrameworkService()
};  