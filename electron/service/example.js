'use strict';

const { Service } = require('ee-core');
const Log = require('ee-core/log');
const { ChildJob, ChildPoolJob } = require('ee-core/jobs');

/**
 * 示例服务（service层为单例）
 * @class
 */
class ExampleService extends Service {

  constructor(ctx) {
    super(ctx);

    // 在构造函数中初始化一些变量
    this.myJob = new ChildJob();
    this.myJobPool = new ChildPoolJob();
    console.log('ddddddddddddddd');
  }

  /**
   * test
   */
  async test(args) {
    let obj = {
      status:'ok',
      params: args
    }

    return obj;
  }

  /**
   * 执行任务
   */ 
  doJob(jobId, type, event) {
    if (type == 'timer') {
      
      // 执行任务及监听进度
      const channel = 'controller.example.timerJobProgress';
      const timerTask = this.myJob.exec('./jobs/example/timer', {jobId});
      timerTask.emitter.on('job-timer-progress', (data) => {
        Log.info('[main-process] timerTask, from TimerJob data:', data);

        // 发送数据到渲染进程
        event.reply(`${channel}`, data)
      })
    
      // 执行任务及监听进度 异步
      // myjob.execPromise('./jobs/example/timer', {jobId}).then(task => {
      //   task.emitter.on('job-timer-progress', (data) => {
      //     Log.info('[main-process] timerTask, from TimerJob data:', data);

      //     // 发送数据到渲染进程
      //     event.reply(`${channel}`, data)
      //   })
      // });
    }
  }

  /**
   * 执行任务
   */ 
  doCreatePool(num, event) {
    const channel = 'controller.example.createPoolNotice';

    // let pids = await myjobPool.create(num);
    this.myJobPool.create(num).then(pids => {
      event.reply(`${channel}`, pids);
    });    
  }

  /**
   * 通过进程池执行任务
   */ 
  doJobByPool(jobId, type, event) {
    if (type == 'timer') {

      // 执行任务及监听进度
      const channel = 'controller.example.timerJobProgress';
      const timerTask = this.myJobPool.run('./jobs/example/timer', {jobId});
      timerTask.emitter.on('job-timer-progress', (data) => {
        Log.info('[main-process] [ChildPoolJob] timerTask, from TimerJob data:', data);

        // 发送数据到渲染进程
        event.reply(`${channel}`, data)
      })
    }
  }

  /**
   * test 
   */ 
  monitorJob() {
    setInterval(() => {
      let jobPids = this.myJobPool.getPids();
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
      const response = await this.app.curl(url, {
        method: 'POST',
        headers: headersObj,
        files: {
          smfile: tmpFile,
        },
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      if (this.app.config.env === 'local') {
        Log.info('[ExampleService] [uploadFileToSMMS]: info result:%j', result);
      }
      if (result.code !== 'success') {
        Log.error('[ExampleService] [uploadFileToSMMS]: res error result:%j', result);
      }
      return result;
    } catch (e) {
      Log.error('[ExampleService] [uploadFileToSMMS]:  ERROR ', e);
    }

    return res;
  }    
}

ExampleService.toString = () => '[class ExampleService]';
module.exports = ExampleService;