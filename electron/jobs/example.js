//const test = require('./test');
const path = require('path');
const { Utils } = require('ee-core');

// let helloRes = test.hello();

// let pt = test.getDir('test.js');

// console.log('[example] helloRes -------- ', helloRes);
// console.log('[example] pt -------- ', pt);

let tp = path.join(__dirname, 'example.js');
console.log('[test] jobs file -------- ', tp);

// let baseDir = Utils.getBaseDir();
// console.log('[test] baseDir -------- ', baseDir);