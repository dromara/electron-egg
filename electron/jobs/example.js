// const Exception = require('ee-core/module/exception');
// Exception.start();
const Job = require('ee-core/module/jobs/baseJobClass');
const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');
const Ps = require('ee-core/module/utils/ps');
const test = Loader.requireJobsModule('./test');

//tests.hello();

/**
 * 示例服务
 * @class
 */
class ExampleJob extends Job {

  constructor(params) {
    super();
  }

  /**
   * Execute the job
   */
  async handle () {
    // logger.info("[renderer] process: ", process);
    Log.info("[child-process] process type: ", Ps.processType());
    Log.info("[child-process] process cwd: ", process.cwd());

    tests.hello();
    //test.utilsMod();
  }   
}

ExampleJob.toString = () => '[class ExampleJob]';
module.exports = ExampleJob;
