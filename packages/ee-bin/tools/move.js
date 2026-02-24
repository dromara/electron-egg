'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const chalk = require('chalk');
const { loadConfig, rm } = require('../lib/utils');

const homeDir = process.cwd();

// 移动资源
function move(options = {}) {
  console.log('[ee-bin] [move] Start moving resources');
  const { config, flag } = options;
  const binCfg = loadConfig(config);
  const moveConfig = binCfg.move;
  
  let flags;
  const flagString = flag.trim();
  if (flagString.indexOf(',') !== -1) {
    flags = flagString.split(',');
  } else {
    flags = [flagString];
  }

  for (let i = 0; i < flags.length; i++) {
    let f = flags[i];
    let cfg = moveConfig[f];

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config does not exist` ));
      return;
    }

    const { src, dest, dist, target } = cfg;
    const source = dist ? dist : src;
    const destination = target ? target : dest;

    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green(`Move flag: ${f}`));
    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green('config:'), cfg);

    const srcResource = path.join(homeDir, source);
    if (!fs.existsSync(srcResource)) {
      const errorTips = chalk.bgRed('Error') + ` ${source} resource does not exist !`;
      console.error(errorTips);
      return
    }

    // clear the historical resource and copy it to the ee resource directory
    const destResource = path.join(homeDir, destination);
    if (fs.statSync(srcResource).isDirectory() && !fs.existsSync(destResource)) {
      fs.mkdirSync(destResource, {recursive: true, mode: 0o777});
    } else {
      rm(destResource);
      console.log('[ee-bin] [move] Clear history resources:', destResource);
    }

    fsPro.copySync(srcResource, destResource);

    // [todo] go project, special treatment of package.json, reserved only necessary
    console.log(`[ee-bin] [move] Copy ${srcResource} to ${destResource}`);
  }

  console.log('[ee-bin] [move] End');
}

module.exports = {
  move
}