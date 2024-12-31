import { logger } from 'ee-core/log';
import { ChildJob, ChildPoolJob } from 'ee-core/jobs';

/**
 * FrameworkService class for framework-related operations
 */
class FrameworkService {
  myTimer: NodeJS.Timeout | null;
  myJob: ChildJob;
  myJobPool: ChildPoolJob;
  taskForJob: { [key: string]: any };

  constructor() {
    // Initialize variables in the constructor
    this.myTimer = null;
    this.myJob = new ChildJob();
    this.myJobPool = new ChildPoolJob();
    this.taskForJob = {};
  }

  /**
   * Test method
   * @param args The arguments passed to the method
   */
  async test(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status: 'ok',
      params: args,
    };
    logger.info('FrameworkService obj:', obj);
    return obj;
  }

  /**
   * IPC communication (two-way)
   */
  bothWayMessage(type: string, content: any, event: any): string {
    // Frontend IPC channel
    const channel = 'controller.framework.ipcSendMsg';

    if (type === 'start') {
      // Send messages to the frontend page every 1 second
      // Simulate with a timer
      this.myTimer = setInterval((e: any, c: string, msg: string) => {
        let timeNow = Date.now();
        let data = msg + ':' + timeNow;
        e.reply(`${c}`, data);
      }, 1000, event, channel, content);

      return 'started';
    } else if (type === 'end') {
      clearInterval(this.myTimer);
      return 'stopped';
    } else {
      return 'other';
    }
  }

  /**
   * Execute a job
   */
  doJob(jobId: string, action: string, event: any): any {
    let res = {};
    let oneTask: any;
    const channel = 'controller.framework.timerJobProgress';
    if (action === 'create') {
      // Execute the job and listen for progress
      let eventName = 'job-timer-progress-' + jobId;
      const timerTask = this.myJob.exec('./jobs/example/timer', { jobId });
      timerTask.emitter.on(eventName, (data: any) => {
        logger.info('[main-process] timerTask, from TimerJob data:', data);
        // Send data to the rendering process
        event.sender.send(`${channel}`, data);
      });

      res.pid = timerTask.pid;
      this.taskForJob[jobId] = timerTask;
    }
    if (action === 'close') {
      oneTask = this.taskForJob[jobId];
      oneTask.kill();
      event.sender.send(`${channel}`, { jobId, number: 0, pid: 0 });
    }
    if (action === 'pause') {
      oneTask = this.taskForJob[jobId];
      oneTask.callFunc('./jobs/example/timer', 'pause', jobId);
    }
    if (action === 'resume') {
      oneTask = this.taskForJob[jobId];
      oneTask.callFunc('./jobs/example/timer', 'resume', jobId, oneTask.pid);
    }

    return res;
  }

  /**
   * Create a pool
   */
  doCreatePool(num: number, event: any): void {
    const channel = 'controller.framework.createPoolNotice';
    this.myJobPool.create(num).then((pids: number[]) => {
      event.reply(`${channel}`, pids);
    });
  }

  /**
   * Execute a job through the job pool
   */
  doJobByPool(jobId: string, action: string, event: any): any {
    let res = {};
    const channel = 'controller.framework.timerJobProgress';
    if (action === 'run') {
      // Asynchronously execute the job and listen for progress
      this.myJobPool.runPromise('./jobs/example/timer', { jobId }).then((task: any) => {
        // Listener name must be unique, otherwise there will be duplicate listeners
        // When the task is completed, the listener should be removed to prevent memory leaks
        let eventName = 'job-timer-progress-' + jobId;
        task.emitter.on(eventName, (data: any) => {
          logger.info('[main-process] [ChildPoolJob] timerTask, from TimerJob data:', data);

          // Send data to the rendering process
          event.sender.send(`${channel}`, data);

          // If the task completion message is received, remove the listener
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
   * Monitor running jobs
   */
  monitorJob(): void {
    setInterval(() => {
      let jobPids = this.myJob.getPids();
      let jobPoolPids = this.myJobPool.getPids();
      logger.info(`[main-process] [monitorJob] jobPids: ${jobPids}, jobPoolPids: ${jobPoolPids}`);
    }, 5000);
  }
}

// Setting the class toString method, which is not common in TypeScript
FrameworkService.toString = () => '[class FrameworkService]';
const frameworkService: FrameworkService = new FrameworkService();
export { 
  FrameworkService,  
  frameworkService
};