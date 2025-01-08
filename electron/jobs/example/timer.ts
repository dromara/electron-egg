import { logger } from 'ee-core/log';
import { isChildJob, exit } from 'ee-core/ps';
import { childMessage } from 'ee-core/message';
import { welcome } from './hello';
import { UserService } from '../../service/job/user';

/**
 * example - TimerJob
 * @class
 */
class TimerJob {
  params: any;
  timer: NodeJS.Timeout | undefined;
  timeoutTimer: NodeJS.Timeout | undefined;
  number: number;
  countdown: number;

  constructor(params: any) {
    this.params = params;
    this.timer = undefined;
    this.timeoutTimer = undefined;
    this.number = 0;
    this.countdown = 10; // 倒计时
  }

  /**
   * handle() method is necessary and will be automatically called
   */
  async handle(): Promise<void> {
    logger.info("[child-process] TimerJob params: ", this.params);
    const { jobId } = this.params;

    // Use service in child process
    // 1. Ensure that the service does not have Electron's API or dependencies, as Electron does not support them
    const userService = new UserService();
    userService.hello('job');

    // Execute the task
    this.doTimer(jobId);
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
