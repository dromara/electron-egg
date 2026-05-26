import path from 'path';
import fs from 'fs';
import { chalk, copyDirSync, formatCmds } from '../lib/helpers.js';
import { loadConfig, rm } from '../lib/utils.js';

const homeDir = process.cwd();

interface MoveOptions {
  config?: string;
  flag?: string;
}

export function move(options: MoveOptions = {}): void {
  console.log('[ee-bin] [move] Start moving resources');
  const { config, flag } = options;
  const binCfg = loadConfig(config);
  const moveConfig = binCfg.move;

  if (!moveConfig || !flag) {
    console.log(chalk.blue('[ee-bin] [move] ') + chalk.red('Error: move config or flag does not exist'));
    return;
  }

  const flags = formatCmds(flag.trim());

  for (const f of flags) {
    const cfg = moveConfig[f];

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config does not exist`));
      return;
    }

    const { src, dest, dist, target } = cfg;
    const source = dist || src;
    const destination = target || dest;

    if (!source || !destination) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config missing src/dest`));
      return;
    }

    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green(`Move flag: ${f}`));
    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green('config:'), cfg);

    const srcResource = path.join(homeDir, source);
    if (!fs.existsSync(srcResource)) {
      const errorTips = chalk.bgRed('Error') + ` ${source} resource does not exist !`;
      console.error(errorTips);
      return;
    }

    const destResource = path.join(homeDir, destination);
    if (fs.statSync(srcResource).isDirectory() && !fs.existsSync(destResource)) {
      fs.mkdirSync(destResource, { recursive: true, mode: 0o777 });
    } else {
      rm(destResource);
      console.log('[ee-bin] [move] Clear history resources:', destResource);
    }

    copyDirSync(srcResource, destResource);

    console.log(`[ee-bin] [move] Copy ${srcResource} to ${destResource}`);
  }

  console.log('[ee-bin] [move] End');
}
