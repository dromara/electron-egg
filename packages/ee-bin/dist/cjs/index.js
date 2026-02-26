#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const move_1 = require("./tools/move");
const encrypt_1 = require("./tools/encrypt");
const serve_1 = require("./tools/serve");
const incrUpdater_1 = require("./tools/incrUpdater");
/**
 * dev
 */
commander_1.program
    .command('dev')
    .description('create frontend-serve and electron-serve')
    .option('--config <folder>', 'config file')
    .option('--serve <mode>', 'serve mode')
    .action(function () {
    serve_1.serveProcess.dev(this.opts());
});
/**
 * build
 */
commander_1.program
    .command('build')
    .description('building multiple resources')
    .option('--config <folder>', 'config file')
    .option('--cmds <flag>', 'custom commands')
    .option('--env <env>', 'environment')
    .action(function () {
    serve_1.serveProcess.build(this.opts());
});
/**
 * start
 */
commander_1.program
    .command('start')
    .description('preview effect')
    .option('--config <folder>', 'config file')
    .action(function () {
    serve_1.serveProcess.start(this.opts());
});
/**
 * exec
 */
commander_1.program
    .command('exec')
    .description('create frontend-serve and electron-serve')
    .option('--config <folder>', 'config file')
    .option('--cmds <flag>', 'custom commands')
    .action(function () {
    serve_1.serveProcess.exec(this.opts());
});
/**
 * move - Moves resources
 */
commander_1.program
    .command('move')
    .description('Move multip resources')
    .option('--config <folder>', 'config file')
    .option('--flag <flag>', 'Custom flag')
    .action(function () {
    (0, move_1.move)(this.opts());
});
/**
 * encrypt - Code encryption
 */
commander_1.program
    .command('encrypt')
    .description('Code encryption')
    .option('--config <folder>', 'config file')
    .option('--out <folder>', 'output directory')
    .action(function () {
    (0, encrypt_1.encrypt)(this.opts());
});
/**
 * clean - Clear the encrypted code
 */
commander_1.program
    .command('clean')
    .description('Clear the encrypted code')
    .option('-d, --dir <folder>', 'clean directory')
    .action(function () {
    (0, encrypt_1.cleanEncrypt)(this.opts());
});
/**
 * updater
 */
commander_1.program
    .command('updater')
    .description('updater commands')
    .option('--config <folder>', 'config file')
    .option('--asar-file <file>', 'asar file path')
    .option('--platform <flag>', 'platform')
    .option('--force <flag>', 'force update full')
    .action(function () {
    incrUpdater_1.incrUpdater.run(this.opts());
});
commander_1.program.parse();
//# sourceMappingURL=index.js.map