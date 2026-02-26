#!/usr/bin/env node

import { program } from 'commander';
import { move } from './tools/move';
import { encrypt, cleanEncrypt } from './tools/encrypt';
import { serveProcess } from './tools/serve';
import { incrUpdater } from './tools/incrUpdater';

/**
 * dev
 */
program
  .command('dev')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--serve <mode>', 'serve mode')
  .action(function(this: any) {
    serveProcess.dev(this.opts());
  });

/**
 * build
 */
program
  .command('build')
  .description('building multiple resources')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .option('--env <env>', 'environment')
  .action(function(this: any) {
    serveProcess.build(this.opts());
  });

/**
 * start
 */
program
  .command('start')
  .description('preview effect')
  .option('--config <folder>', 'config file')
  .action(function(this: any) {
    serveProcess.start(this.opts());
  });

/**
 * exec
 */
program
  .command('exec')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .action(function(this: any) {
    serveProcess.exec(this.opts());
  });

/**
 * move - Moves resources
 */
program
  .command('move')
  .description('Move multip resources')
  .option('--config <folder>', 'config file')
  .option('--flag <flag>', 'Custom flag')
  .action(function(this: any) {
    move(this.opts());
  });

/**
 * encrypt - Code encryption
 */
program
  .command('encrypt')
  .description('Code encryption')
  .option('--config <folder>', 'config file')
  .option('--out <folder>', 'output directory')
  .action(function(this: any) {
    encrypt(this.opts());
  });

/**
 * clean - Clear the encrypted code
 */
program
  .command('clean')
  .description('Clear the encrypted code')
  .option('-d, --dir <folder>', 'clean directory')
  .action(function(this: any) {
    cleanEncrypt(this.opts());
  });

/**
 * updater
 */
program
  .command('updater')
  .description('updater commands')
  .option('--config <folder>', 'config file')
  .option('--asar-file <file>', 'asar file path')
  .option('--platform <flag>', 'platform')
  .option('--force <flag>', 'force update full')
  .action(function(this: any) {
    incrUpdater.run(this.opts());
  });

program.parse();