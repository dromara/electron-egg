const Job = require('ee-core/jobs/baseJobClass');
const Loader = require('ee-core/loader');
const Log = require('ee-core/log');
const Ps = require('ee-core/ps');
const Message = require('ee-core/message');
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
    let childMessage = Message.childMessage;
    let eventName = 'job-timer-progress';
    let number = 0;
    let jobId = this.params.jobId;
    setInterval(function() {
      Hello.welcome();

      childMessage.sendToMain(eventName, {jobId, number});
      number++;
    }, 1000);

    // 用 setTimeout 模拟任务运行时长
    // 任务完成后，必须调用 Ps.exit() 方法，让进程退出，否则会常驻内存
    setTimeout(function(){
      Ps.exit(1);
    }, 10 * 1000)
  }   
}

TimerJob.toString = () => '[class TimerJob]';
module.exports = TimerJob;
