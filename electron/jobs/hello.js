const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');
const Ps = require('ee-core/module/utils/ps');
const test = Loader.requireJobsModule('./test');


module.exports = () => {
  Log.info("[child-process] process type: ", Ps.processType());
  Log.info("[child-process] process cwd: ", process.cwd());

  test.hello();
  //test.utilsMod();
};
