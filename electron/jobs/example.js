const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');
const Utils = require('ee-core/module/utils');
const test = Loader.requireJobsModule('./test');

// logger.info("[renderer] process: ", process);
Log.info("[child-process] process type: ", Utils.processType());
Log.info("[child-process] process cwd: ", process.cwd());

test.hello();
test.utilsMod();
