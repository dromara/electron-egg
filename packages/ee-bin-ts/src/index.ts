#!/usr/bin/env node

import { program, Command } from 'commander';
import chalk from 'chalk';
import { serveProcess } from './tools/serve.js';
import { move } from './tools/move.js';
import { encrypt, cleanEncrypt } from './tools/encrypt.js';
import { run as iconGenRun } from './tools/iconGen.js';
import { incrUpdater } from './tools/incrUpdater.js';

program
  .name('ee-bin')
  .description('CLI for ee development')
  .version('5.0.0');

program
  .command('dev')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--serve <mode>', 'serve mode')
  .action(function (this: Command) {
    serveProcess.dev(this.opts());
  });

program
  .command('build')
  .description('building multiple resources')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .option('--env <env>', 'environment')
  .action(function (this: Command) {
    serveProcess.build(this.opts());
  });

program
  .command('start')
  .description('start the main process service')
  .option('--config <folder>', 'config file')
  .action(function (this: Command) {
    serveProcess.start(this.opts());
  });

program
  .command('move')
  .description('move static resources')
  .option('--config <folder>', 'config file')
  .option('--flag <flag>', 'resource flag')
  .action(function (this: Command) {
    move(this.opts());
  });

program
  .command('encrypt')
  .description('code confusion/encryption')
  .option('--config <folder>', 'config file')
  .option('--out <out>', 'output folder')
  .action(function (this: Command) {
    encrypt(this.opts());
  });

program
  .command('clean')
  .description('clean up tmp files')
  .action(function (this: Command) {
    cleanEncrypt(this.opts());
  });

program
  .command('icon')
  .description('generate logo')
  .action(function (this: Command) {
    iconGenRun();
  });

program
  .command('updater')
  .description('generate incremental update package')
  .option('--config <folder>', 'config file')
  .option('--asarFile <asarFile>', 'asar file')
  .option('--platform <platform>', 'platform')
  .option('--force <force>', 'force update')
  .action(function (this: Command) {
    incrUpdater.run(this.opts());
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp((text: string) => {
    console.log(chalk.green(text));
    return text;
  });
}
