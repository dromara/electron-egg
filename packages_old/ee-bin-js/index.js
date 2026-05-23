#!/usr/bin/env node

const { program } = require('commander');
const { move } = require('./tools/move');
const { encrypt, cleanEncrypt } = require('./tools/encrypt');
const { serveProcess } = require('./tools/serve');
const { incrUpdater } = require('./tools/incrUpdater');

/**
 * dev
 */
program
  .command('dev')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--serve <mode>', 'serve mode')
  .action(function() {
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
  .action(function() {
    serveProcess.build(this.opts());
  });

/**
 * start
 */
program
  .command('start')
  .description('preview effect')
  .option('--config <folder>', 'config file')
  .action(function() {
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
  .action(function() {
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
  .action(function() {
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
  .action(function() {
    encrypt(this.opts());
  });

/**
 * clean - Clear the encrypted code
 */
program
  .command('clean')
  .description('Clear the encrypted code')
  .option('-d, --dir <folder>', 'clean directory')
  .action(function() {
    cleanEncrypt(this.opts());
  });

/**
 * icon
 */
program
  .command('icon')
  .description('Generate logo')
  .option('-i, --input <file>', 'image file default /public/images/logo.png')
  .option('-o, --output <folder>', 'output directory default /build/icons/')
  .option('-s, --size <flag>', 'generate size default 16,32,64,256,512')
  .option('-c, --clear', 'clear output directory first')
  .option('-img, --images <flag>', 'Win window icon/tray image generation path default /public/images/')
  .action(function() {
    const iconGen = require('./tools/iconGen');
    iconGen.run();
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
  .action(function() {
    incrUpdater.run(this.opts());
  });

program.parse();