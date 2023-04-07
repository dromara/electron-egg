const Job = require('ee-core/jobs/baseJobClass');
const Loader = require('ee-core/loader');
const Log = require('ee-core/log');
const Ps = require('ee-core/ps');
const { childMessage } = require('ee-core/message');
const Hello = Loader.requireJobsModule('./example/hello');

/**
 * example - TimerJob
 * @class
 */
class TimerJob extends Job {

  constructor(params) {
    super();
    this.params = params;
  }

  /**
   * handle()方法是必要的，且会被自动调用
   */
  async handle () {
    Log.info("[child-process] TimerJob params: ", this.params);

    // 计时器任务
    let eventName = 'job-timer-progress';
    let number = 0;
    let jobId = this.params.jobId;
    let timer = setInterval(function() {
      Hello.welcome();

      childMessage.send(eventName, {jobId, number});
      number++;
    }, 1000);

    // 用 setTimeout 模拟任务运行时长
    setTimeout(() => {
      // 关闭定时器
      clearInterval(timer);

      // 任务结束，重置前端显示
      childMessage.send(eventName, {jobId, number:0, pid:0});

      // 如果是childJob任务，必须调用 Ps.exit() 方法，让进程退出，否则会常驻内存
      // 如果是childPoolJob任务，常驻内存，等待下一个任务
      if (Ps.isChildJob()) {
        Ps.exit();
      }

    }, 20 * 1000)
  }   
}

TimerJob.toString = () => '[class TimerJob]';
module.exports = TimerJob;
