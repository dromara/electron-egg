'use strict';

const { Service } = require('ee-core');
const Log = require('ee-core/log');
const { ChildJob, ChildPoolJob } = require('ee-core/jobs');
const HttpClient = require('ee-core/httpclient');
const Ps = require('ee-core/ps');

/**
 * framework
 * @class
 */
class FrameworkService extends Service {

  constructor(ctx) {
    super(ctx);

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
    Log.info('FrameworkService obj:', obj);
    return obj;
  }

  /**
   * ipc通信(双向)
   */
  bothWayMessage(type, content, event) {
    // 前端ipc频道 channel
    const channel = 'controller.framework.ipcSendMsg';

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
    const channel = 'controller.framework.timerJobProgress';
    if (action == 'create') {
      // 执行任务及监听进度
      let eventName = 'job-timer-progress-' + jobId;
      const timerTask = this.myJob.exec('./jobs/example/timer', {jobId});
      timerTask.emitter.on(eventName, (data) => {
        Log.info('[main-process] timerTask, from TimerJob data:', data);
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

    return res;
  }

  /**
   * 创建pool
   */ 
  doCreatePool(num, event) {
    const channel = 'controller.framework.createPoolNotice';
    this.myJobPool.create(num).then(pids => {
      event.reply(`${channel}`, pids);
    });
  }

  /**
   * 通过进程池执行任务
   */ 
  doJobByPool(jobId, action, event) {
    let res = {};
    const channel = 'controller.framework.timerJobProgress';
    if (action == 'run') {
      // 异步-执行任务及监听进度
      this.myJobPool.runPromise('./jobs/example/timer', {jobId}).then(task => {

        // 监听器名称唯一，否则会出现重复监听。
        // 任务完成时，需要移除监听器，防止内存泄漏
        let eventName = 'job-timer-progress-' + jobId;
        task.emitter.on(eventName, (data) => {
          Log.info('[main-process] [ChildPoolJob] timerTask, from TimerJob data:', data);
  
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
   * test 
   */ 
  monitorJob() {
    setInterval(() => {
      let jobPids = this.myJob.getPids();
      let jobPoolPids = this.myJobPool.getPids();
      Log.info(`[main-process] [monitorJob] jobPids: ${jobPids}, jobPoolPids: ${jobPoolPids}`);
    }, 5000)
  }  

  /**
   * 上传到smms
   */
  async uploadFileToSMMS(tmpFile) {
    const res = {
      code: 1000,
      message: 'unknown error',
    };

    try {
      const headersObj = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'aaaaaaaaaaaaa' // 请修改这个token，用你自己的账号token
      };
      const url = 'https://sm.ms/api/v2/upload';
      const hc = new HttpClient();
      const response = await hc.request(url, {
        method: 'POST',
        headers: headersObj,
        files: {
          smfile: tmpFile,
        },
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      if (Ps.isDev()) {
        Log.info('[FrameworkService] [uploadFileToSMMS]: info result:%j', result);
      }
      if (result.code !== 'success') {
        Log.error('[FrameworkService] [uploadFileToSMMS]: res error result:%j', result);
      }
      return result;
    } catch (e) {
      Log.error('[FrameworkService] [uploadFileToSMMS]:  ERROR ', e);
    }

    return res;
  }

}

FrameworkService.toString = () => '[class FrameworkService]';
module.exports = FrameworkService;  