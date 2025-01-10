import { logger } from 'ee-core/log';
import { ChildJob, ChildPoolJob } from 'ee-core/jobs';

// framework service
class FrameworkService {
  myTimer: number;
  myJob: ChildJob;
  myJobPool: ChildPoolJob;
  taskForJob: { [key: string]: any };

  constructor() {
    // 在构造函数中初始化一些变量
    this.myTimer = 0;
    this.myJob = new ChildJob();
    this.myJobPool = new ChildPoolJob();
    this.taskForJob = {};
  }

  /**
   * test
   */
  async test(args: any): Promise<{ status: string; params: any }> {
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
  bothWayMessage(type: string, content: any, event: any): string {
    // 前端ipc频道 channel
    const channel = 'controller/framework/ipcSendMsg';

    if (type == 'start') {
      // 每隔1秒，向前端页面发送消息
      // 用定时器模拟
      this.myTimer = setInterval((e: any, c: string, msg: string) => {
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
  doJob(jobId: string, action: string, event: any): any {
    const res = {
      pid: 0,
    };
    let oneTask: any;
    const channel = 'controller/framework/timerJobProgress';
    if (action == 'create') {
      // 执行任务及监听进度
      let eventName = 'job-timer-progress-' + jobId;
      const timerTask = this.myJob.exec('./jobs/example/timer', {jobId});
      timerTask.emitter.on(eventName, (data: any) => {
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
  doCreatePool(num: number, event: any): void {
    const channel = 'controller/framework/createPoolNotice';
    this.myJobPool.create(num).then((pids: any[]) => {
      event.reply(`${channel}`, pids);
    });
  }

  /**
   * 通过进程池执行任务
   */ 
  doJobByPool(jobId: string, action: string, event: any): any {
    let res = {
      pid: 0,
    };
    const channel = 'controller/framework/timerJobProgress';
    if (action == 'run') {
      // 异步-执行任务及监听进度
      this.myJobPool.runPromise('./jobs/example/timer', {jobId}).then((task: any) => {

        // 监听器名称唯一，否则会出现重复监听。
        // 任务完成时，需要移除监听器，防止内存泄漏
        let eventName = 'job-timer-progress-' + jobId;
        task.emitter.on(eventName, (data: any) => {
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
  monitorJob(): void {
    setInterval(() => {
      let jobPids = this.myJob.getPids();
      let jobPoolPids = this.myJobPool.getPids();
      logger.info(`[main-process] [monitorJob] jobPids: ${jobPids}, jobPoolPids: ${jobPoolPids}`);
    }, 5000)
  }
}
FrameworkService.toString = () => '[class FrameworkService]';
const frameworkService = new FrameworkService();

export {
  FrameworkService,
  frameworkService
}