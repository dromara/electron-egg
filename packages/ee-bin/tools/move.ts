

import path from 'path';
import fs from 'fs';
import fsPro from 'fs-extra';
import chalk from 'chalk';
import { loadConfig, rm } from '../lib/utils';

const homeDir = process.cwd();

interface MoveOptions {
  config?: string;
  flag?: string;
}

interface MoveConfigItem {
  src?: string;
  dest?: string;
  dist?: string;
  target?: string;
}

interface MoveConfig {
  [key: string]: MoveConfigItem;
}

// 移动资源
function move(options: MoveOptions = {}) {
  console.log('[ee-bin] [move] Start moving resources');
  const { config, flag } = options;
  const binCfg = loadConfig(config) as any;
  const moveConfig = binCfg.move as MoveConfig;
  
  let flags;
  const flagString = flag ? flag.trim() : '';
  if (flagString.indexOf(',') !== -1) {
    flags = flagString.split(',');
  } else {
    flags = [flagString];
  }

  for (let i = 0; i < flags.length; i++) {
    const f = flags[i];
    const cfg = moveConfig[f];

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config does not exist` ));
      return;
    }

    const { src, dest, dist, target } = cfg;
    const source = dist ? dist : src;
    const destination = target ? target : dest;

    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green(`Move flag: ${f}`));
    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green('config:'), cfg);

    if (!source || !destination) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red('Error: src/dest or dist/target is required'));
      return;
    }

    const srcResource = path.join(homeDir, source);
    if (!fs.existsSync(srcResource)) {
      const errorTips = chalk.bgRed('Error') + ` ${source} resource does not exist !`;
      console.error(errorTips);
      return;
    }

    // clear the historical resource and copy it to the ee resource directory
    const destResource = path.join(homeDir, destination);
    if (fs.statSync(srcResource).isDirectory() && !fs.existsSync(destResource)) {
      fs.mkdirSync(destResource, { recursive: true, mode: 0o777 });
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

export {
  move
};