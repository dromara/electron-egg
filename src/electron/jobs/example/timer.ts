import { logger } from 'ee-core/log';
import { isChildJob, exit } from 'ee-core/ps';
import { childMessage } from 'ee-core/message';
import { welcome } from './hello';
import { UserService } from '../../service/job/user';

/**
 * TimerJob class
 */
class TimerJob {
  params: any;
  timer?: NodeJS.Timeout;
  timeoutTimer?: NodeJS.Timeout;
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
   * handle()方法是必要的，且会被自动调用
   */
  async handle(): Promise<void> {
    logger.info("[child-process] TimerJob params: ", this.params);
    const { jobId } = this.params;

    // 子进程中使用service
    // 1. 确保引入的 service 中不能有electron 的 api或依赖， electron 不支持
    const userService = new UserService();
    userService.hello('job');

    // 执行任务
    this.doTimer(jobId);
  }

  /**
   * 暂停任务运行
   */
  async pause(jobId: string): Promise<void> {
    logger.info("[child-process] Pause timerJob, jobId: ", jobId);
    if (this.timer) clearInterval(this.timer);
    if (this.timeoutTimer) clearInterval(this.timeoutTimer);
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

      childMessage.send(eventName, { jobId, number: this.number, end: false });
      this.number++;
      this.countdown--;
    }, 1000);

    // 用 setTimeout 模拟任务运行时长
    this.timeoutTimer = setTimeout(() => {
      // 关闭计时器模拟任务
      if (this.timer) clearInterval(this.timer);

      // 任务结束，重置前端显示
      childMessage.send(eventName, { jobId, number: 0, pid: 0, end: true });

      // 如果是childJob任务，必须调用 exit() 方法，让进程退出，否则会常驻内存
      // 如果是childPoolJob任务，常驻内存，等待下一个业务
      if (isChildJob()) {
        exit();
      }
    }, this.countdown * 1000);
  }
}

// 设置类的toString方法，虽然在TypeScript中不常见
TimerJob.toString = () => '[class TimerJob]';

export default TimerJob;