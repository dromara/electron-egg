import { logger } from 'ee-core/log';
import { isChildJob, exit } from 'ee-core/ps';
import { childMessage } from 'ee-core/message';
import { welcome } from './hello';
import { UserService } from '../../service/job/user';
import { sqlitedbService } from '../../service/database/sqlitedb';

/**
 * example - TimerJob
 * @class
 */
class TimerJob {
  timer: NodeJS.Timeout | undefined;
  timeoutTimer: NodeJS.Timeout | undefined;
  number: number;
  countdown: number;

  constructor() {
    this.timer = undefined;
    this.timeoutTimer = undefined;
    this.number = 0;
    this.countdown = 10; // 倒计时
    sqlitedbService.init();
  }

  /**
   * handle() method is necessary and will be automatically called
   * params transferred parameters
   */
  async handle(params: any): Promise<void> {
    logger.info("[child-process] TimerJob params: ", params);
    const { jobId } = params;

    // Use service in child process
    // 1. Ensure that the service does not have Electron's API or dependencies, as Electron does not support them
    const userService = new UserService();
    userService.hello('job');

    // Execute the task
    this.number = 0;
    this.countdown = 10;
    this.doTimer(jobId);

    // sqlite
    const userList = await sqlitedbService.getAllTestDataSqlite();
    logger.info('[child-process] Sqlite userList:', userList);    
  }
  
  /**
   * Pause the job
   */
  async pause(jobId: string): Promise<void> {
    logger.info("[child-process] Pause timerJob, jobId: ", jobId);
    clearInterval(this.timer);
    clearInterval(this.timeoutTimer);
  }

  /**
   * Resume the job
   */
  async resume(jobId: string, pid: number): Promise<void> {
    logger.info("[child-process] Resume timerJob, jobId: ", jobId, ", pid: ", pid);
    this.doTimer(jobId);
  }  

  /**
   * Run the task
   */
  async doTimer(jobId) {
    //  Timer to simulate the task
    const eventName = 'job-timer-progress-' + jobId;
    this.timer = setInterval(() => {
      welcome();

      childMessage.send(eventName, {jobId, number: this.number, end: false});
      this.number++;
      this.countdown--;
    }, 1000);

    // Use setTimeout to simulate the task duration
    this.timeoutTimer = setTimeout(() => {
      // Stop the timer to simulate the task
      clearInterval(this.timer);

      // Task completed, reset the front-end display
      childMessage.send(eventName, {jobId, number:0, pid:0, end: true});

      // If it is a childJob task, call exit() to exit the process, otherwise it will stay in memory
      // If it is a childPoolJob task, stay in memory and wait for the next business
      if (isChildJob()) {
        exit();
      }
    }, this.countdown * 1000)
  }
}
TimerJob.toString = () => '[class TimerJob]';

export default TimerJob;
