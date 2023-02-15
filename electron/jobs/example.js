
const path = require('path');
const Utils = require('ee-core/module/utils');
const Loader = require('ee-core/module/loader');
const { logger } = require('ee-core/module/log');
const test = Loader.requireModule('./test');

// let helloRes = test.hello();

// let pt = test.getDir('test.js');

// console.log('[example] helloRes -------- ', helloRes);
// console.log('[example] pt -------- ', pt);

let tp = path.join(__dirname, 'example.js');
console.log('[example] jobs file -------- ', tp);
logger.info('[example] jobs file -------- ', tp);

let baseDir = Utils.getBaseDir();
console.log('[example] baseDir -------- ', baseDir);

// let helloRes = test.hello();
// console.log('[example] helloRes -------- ', helloRes);