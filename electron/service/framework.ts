import { logger } from 'ee-core/log';
import { ChildJob, ChildPoolJob } from 'ee-core/jobs';
import type { JobProcess } from 'ee-core/jobs/child/jobProcess';
import type { IpcMainEvent } from 'electron';

/**
 * framework
 * @class
 */
class FrameworkService {
  private myTimer: NodeJS.Timeout | null;
  private myJob: ChildJob;
  private myJobPool: ChildPoolJob;
  private taskForJob: Record<string, JobProcess>;

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
  async test(args: unknown): Promise<{ status: string; params: unknown }> {
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
  bothWayMessage(type: string, content: string, event: IpcMainEvent): string {
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
      clearInterval(this.myTimer!);
      return '停止了'    
    } else {
      return 'ohther'
    }
  }

  /**
   * 执行任务
   */ 
  doJob(jobId: string, action: string, event: IpcMainEvent): Record<string, unknown> {
    let res: Record<string, unknown> = {};
    let oneTask: JobProcess | undefined;
    const channel = 'controller/framework/timerJobProgress';
  
    if (action == 'create') {
      // 执行任务及监听进度
      let eventName = 'job-timer-progress-' + jobId;
      const timerTask = this.myJob.exec('./jobs/example/timer', {jobId});
      timerTask.emitter.on(eventName, (data: unknown) => {
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
  doCreatePool(num: number, event: IpcMainEvent): void {
    const channel = 'controller/framework/createPoolNotice';
    this.myJobPool.create(num).then((pids: string[]) => {
      event.reply(`${channel}`, pids);
    });
  }

  /**
   * 通过进程池执行任务
   */
  async doJobByPool(jobId: string, action: string, event: IpcMainEvent): Promise<Record<string, unknown>> {
    let res: Record<string, unknown> = {};
    const channel = 'controller/framework/timerJobProgress';
    if (action == 'run') {
      // 异步-执行任务及监听进度
      const task = await this.myJobPool.runPromise('./jobs/example/timer', {jobId});

      // 监听器名称唯一，否则会出现重复监听。
      // 任务完成时，需要移除监听器，防止内存泄漏
      let eventName = 'job-timer-progress-' + jobId;
      task.emitter.on(eventName, (data: unknown) => {
        logger.info('[main-process] [ChildPoolJob] timerTask, from TimerJob data:', data);

        // 发送数据到渲染进程
        event.sender.send(`${channel}`, data)

        // 如果收到任务完成的消息，移除监听器
        if (data && typeof data === 'object' && 'end' in data && (data as Record<string, unknown>).end) {
          task.emitter.removeAllListeners(eventName);
        }
      });

      res.pid = task.pid;
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
export const frameworkService = new FrameworkService();  
