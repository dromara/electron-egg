'use strict';
const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');

console.log('moving frontend asset to egg public dir');

// argv
let distDir = '';
for (let i = 0; i < process.argv.length; i++) {
  const tmpArgv = process.argv[i]
  if (tmpArgv.indexOf('--dist_dir=') !== -1) {
    distDir = tmpArgv.substr(11)
  }
}

const sourceDir = path.normalize(distDir);
distDir = path.normalize('./app/public');

// del dir and move
fs.rmdirSync(distDir, {recursive: true});
fsPro.copySync(sourceDir, distDir);

// replace ejs
const sourceFile = path.normalize(distDir + '/index.html');
const distFile = path.normalize( './app/view/index.ejs');
fsPro.copySync(sourceFile, distFile);

console.log('Move over');

