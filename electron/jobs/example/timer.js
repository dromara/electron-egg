const Job = require('ee-core/jobs/baseJobClass');
const Log = require('ee-core/log');
const Ps = require('ee-core/ps');
const { childMessage } = require('ee-core/message');
const Hello = require('./hello');
const UserService = require('../../service/job/user');

/**
 * example - TimerJob
 * @class
 */
class TimerJob extends Job {

  constructor(params) {
    super();
    this.params = params;
    this.timer = undefined;
    this.timeoutTimer = undefined;
    this.number = 0;
    this.countdown = 10; // 倒计时
  }

  /**
   * handle()方法是必要的，且会被自动调用
   */
  async handle () {
    Log.info("[child-process] TimerJob params: ", this.params);
    const { jobId } = this.params;

    // 子进程中使用service
    // 1. 需要重新实例化，因为子进程中没有ee的上下文
    // 2. 确保引入的 service 中不能有electron 的 api或依赖， electron 不支持
    const userService = new UserService();
    userService.hello('job');

    // 执行任务
    this.doTimer(jobId);
  }
  
  /**
   * 暂停任务运行
   */
  async pause(jobId) {
    Log.info("[child-process] Pause timerJob, jobId: ", jobId);
    clearInterval(this.timer);
    clearInterval(this.timeoutTimer);
  }

  /**
   * 恢复任务运行
   */
  async resume(jobId, pid) {
    Log.info("[child-process] Resume timerJob, jobId: ", jobId, ", pid: ", pid);
    this.doTimer(jobId);
  }  

  /**
   * 运行任务
   */
  async doTimer(jobId) {
    // 计时器模拟任务
    let eventName = 'job-timer-progress-' + jobId;
    this.timer = setInterval(() => {
      Hello.welcome();

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

      // 如果是childJob任务，必须调用 Ps.exit() 方法，让进程退出，否则会常驻内存
      // 如果是childPoolJob任务，常驻内存，等待下一个业务
      if (Ps.isChildJob()) {
        Ps.exit();
      }
    }, this.countdown * 1000)
  }
}

TimerJob.toString = () => '[class TimerJob]';
module.exports = TimerJob;
