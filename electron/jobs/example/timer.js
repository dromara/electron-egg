const Job = require('ee-core/jobs/baseJobClass');
const Log = require('ee-core/log');
const Ps = require('ee-core/ps');

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

    if (Ps.isChildJob()) {
      Ps.exit();
    }
  }   
}

TimerJob.toString = () => '[class TimerJob]';
module.exports = TimerJob;
