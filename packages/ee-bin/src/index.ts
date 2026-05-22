#!/usr/bin/env node

import { program, Command } from 'commander';
import chalk from 'chalk';
import { serveProcess } from './tools/serve.js';
import { move } from './tools/move.js';
import { encrypt, cleanEncrypt } from './tools/encrypt.js';
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
  .description('preview effect')
  .option('--config <folder>', 'config file')
  .action(function (this: Command) {
    serveProcess.start(this.opts());
  });

program
  .command('exec')
  .description('execute custom commands')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .action(function (this: Command) {
    serveProcess.exec(this.opts());
  });

program
  .command('move')
  .description('Move multip resources')
  .option('--config <folder>', 'config file')
  .option('--flag <flag>', 'resource flag')
  .action(function (this: Command) {
    move(this.opts());
  });

program
  .command('encrypt')
  .description('Code encryption')
  .option('--config <folder>', 'config file')
  .option('--out <folder>', 'output directory')
  .action(function (this: Command) {
    encrypt(this.opts());
  });

program
  .command('clean')
  .description('Clear the encrypted code')
  .option('-d, --dir <folder>', 'clean directory')
  .action(function (this: Command) {
    cleanEncrypt(this.opts());
  });

program
  .command('icon')
  .description('Generate logo')
  .option('-i, --input <file>', 'image file default /public/images/logo.png')
  .option('-o, --output <folder>', 'output directory default /build/icons/')
  .option('-s, --size <flag>', 'generate size default 16,32,64,256,512')
  .option('-c, --clear', 'clear output directory first')
  .option('-img, --images <flag>', 'Win window icon/tray image generation path default /public/images/')
  .action(function (this: Command) {
    const { run: iconGenRun } = require('./tools/iconGen.js');
    iconGenRun(this.opts());
  });

program
  .command('updater')
  .description('updater commands')
  .option('--config <folder>', 'config file')
  .option('--asar-file <file>', 'asar file path')
  .option('--platform <flag>', 'platform')
  .option('--force <flag>', 'force update full')
  .action(function (this: Command) {
    incrUpdater.run(this.opts());
  });

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp((text: string) => {
    console.log(chalk.green(text));
    return text;
  });
}
