const Job = require('ee-core/module/jobs/baseJobClass');
const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');
const Ps = require('ee-core/module/ps');
const test = Loader.requireJobsModule('./test');

//tests.hello();

/**
 * 示例服务
 * @class
 */
class ExampleJob extends Job {

  constructor(params) {
    super();
    this.params = params;
  }

  /**
   * Execute the job
   */
  async handle () {
    Log.info("[child-process] job params: ", this.params);
    // setInterval(function() {
    //   console.log('ddddd')
    // }, 1000);

    //test.hello();
    //test.utilsMod();

    setTimeout(function(){
      test.hello();
    }, 3000)

    setTimeout(function(){
      Ps.exit(1);
    }, 10000)
  }   
}

ExampleJob.toString = () => '[class ExampleJob]';
module.exports = ExampleJob;
