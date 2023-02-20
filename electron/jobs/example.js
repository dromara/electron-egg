
const Utils = require('ee-core/module/utils');
const Loader = require('ee-core/module/loader');
const Log = require('ee-core/module/log');
const test = Loader.requireModule('./test');

// logger.info("[renderer] process: ", process);
Log.info("[child] process: ", process);

let baseDir = Utils.getBaseDir();
Log.info('[example] baseDir -------- ', baseDir);

let helloRes = test.hello();
Log.info('[example] helloRes -------- ', helloRes);