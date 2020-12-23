'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const getPort = require('get-port');
const utils = require('../app/utils/utils');
const storageKey = require('../app/const/storageKey');
const os = require('os');
const storageDir = path.normalize(os.homedir() + '/electron-egg-storage/');

exports.setup = function () {
  // console.log('storageDir', storageDir);
  if (!fs.existsSync(storageDir)) {
    utils.mkdir(storageDir);
    utils.chmodPath(storageDir, '777');
  }
  const file = storageDir + 'db.json';
  const adapter = new FileSync(file);
  const db = lowdb(adapter);
  const eggConfigKey = storageKey.EGG_CONFIG;
  if (!db.has(eggConfigKey).value()) {
    db.set(eggConfigKey, {}).write();
  }

  return true;
};

exports.instance = function (file = null) {
  if (!file) {
      file = path.normalize(storageDir +'db.json');
  }
  const isExist = fs.existsSync(file);
  if (!isExist) {
      return null;
  }

  const adapter = new FileSync(file);
  const db = lowdb(adapter);

  return db;
};

exports.getEggConfig = function () {
  const key = storageKey.EGG_CONFIG;
  const res = this.instance()
  .get(key)
  .value();

  return res;
};

exports.setDynamicPort = async function () {
  // const eggConfig = config.get('egg');
  // console.log('setDynamicPort eggConfig:', eggConfig);
  // const dynamicPort = await getPort({port: eggConfig.port})
  const dynamicPort = await getPort();
  const key = storageKey.EGG_CONFIG + '.port';
  const res = this.instance()
    .set(key, dynamicPort)
    .write();
  
  return res;
};

exports.setIpcDynamicPort = async function () {
  const key = storageKey.ELECTRON_IPC + '.port';
  const dynamicPort = await getPort();
  this.instance()
    .set(key, dynamicPort)
    .write();
  
  return dynamicPort;
};

exports = module.exports;