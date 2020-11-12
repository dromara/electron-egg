/**
 *  全局定义
 * @param app
 */
'use strict';
global.CODE = require('./app/const/statusCode');
const fs = require('fs');
const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const utils = require('./app/utils/utils');

class AppBootHook {
  constructor(app) {
    this.app = app;
    global.OS_PLATFORM = process.platform;
    global.IS_WIN = /^win/.test(process.platform);
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
  }

  configDidLoad() {
    // Config, plugin files have been loaded.
  }

  async didLoad() {
    // All files have loaded, start plugin here.
  }

  async willReady() {
    // All plugins have started, can do some thing before app ready
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.
    // 数据库
    const storageDir = path.normalize('./storage/');
    if (!fs.existsSync(storageDir)) {
      utils.mkdir(storageDir);
      utils.chmodPath(storageDir, '777');
    }
    const file = storageDir + 'db.json';
    const adapter = new FileSync(file);
    const db = lowdb(adapter);
    if (!db.has('default').value()) {
      db.set('default', {}).write();
    }
  }

  async serverDidReady() {
    // Server is listening.
    // const storageFile = './storage';
    // utils.chmodPath(storageFile, '777');
  }

  async beforeClose() {
    // Do some thing before app close.
  }
}

module.exports = AppBootHook;
