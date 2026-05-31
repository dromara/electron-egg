import { logger } from 'ee-core/log';
import { isChildJob, exit } from 'ee-core/ps';
import { childMessage } from 'ee-core/message';
import { welcome } from './hello';

/**
 * example - TimerJob
 * @class
 */
class TimerJob {
  static toString() { return '[class TimerJob]'; }
  private timer: NodeJS.Timeout | undefined;
  private timeoutTimer: NodeJS.Timeout | undefined;
  private number: number;
  private countdown: number;

  constructor() {
    this.timer = undefined;
    this.timeoutTimer = undefined;
    this.number = 0;
    this.countdown = 10; // 倒计时
  }

  /**
   * handle()方法是必要的，且会被自动调用
   * params 传递的参数
   */
  async handle(params: { jobId: string }): Promise<void> {
    logger.info("[child-process] TimerJob params: ", params);
    const { jobId } = params;

    // 执行任务
    // 多次运行时，重置倒计时
    this.number = 0;
    this.countdown = 10;
    this.doTimer(jobId);
  }

  /**
   * 暂停任务运行
   */
  async pause(jobId: string): Promise<void> {
    logger.info("[child-process] Pause timerJob, jobId: ", jobId);
    clearInterval(this.timer);
    clearInterval(this.timeoutTimer);
  }

  /**
   * 恢复任务运行
   */
  async resume(jobId: string, pid: number): Promise<void> {
    logger.info("[child-process] Resume timerJob, jobId: ", jobId, ", pid: ", pid);
    this.doTimer(jobId);
  }

  /**
   * 运行任务
   */
  async doTimer(jobId: string): Promise<void> {
    // 计时器模拟任务
    const eventName = 'job-timer-progress-' + jobId;
    this.timer = setInterval(() => {
      welcome();

      childMessage.send(eventName, {jobId, number: this.number, end: false});
      this.number++;
      this.countdown--;
    }, 1000);

    // 用 setTimeout 模拟任务运行时长
    this.timeoutTimer = setTimeout(() => {
      // 关闭计时器模拟任务
      clearInterval(this.timer);

      // 任务结束，重置前端显示
      childMessage.send(eventName, {jobId, number:0, pid:0, end: true});

      // 如果是childJob任务，必须调用 exit() 方法，让进程退出，否则会常驻内存
      // 如果是childPoolJob任务，常驻内存，等待下一个业务
      if (isChildJob()) {
        exit();
      }
    }, this.countdown * 1000)
  }
}

export default TimerJob;
