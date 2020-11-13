'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const getPort = require('get-port');
const utils = require('../app/utils/utils');
const config = require('./config');

const storageDir = path.normalize('./storage/');

exports.setup = function () {
  if (!fs.existsSync(storageDir)) {
    utils.mkdir(storageDir);
    utils.chmodPath(storageDir, '777');
  }
  const file = storageDir + 'db.json';
  const adapter = new FileSync(file);
  const db = lowdb(adapter);

  if (!db.has('egg_config').value()) {
    db.set('egg_config', {}).write();
  }

  return true;
};

exports.instance = function (file = null) {
  if (!file) {
      file = path.normalize('./storage/db.json');
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
  const res = this.instance()
  .get('egg_config')
  .value();

  return res;
};

exports.setDynamicPort = async function () {
  // const eggConfig = config.get('egg');
  // console.log('setDynamicPort eggConfig:', eggConfig);
  // const dynamicPort = await getPort({port: eggConfig.port})
  const dynamicPort = await getPort();
  const res = this.instance()
    .set('egg_config.port', dynamicPort)
    .write();
  
  return res;
};

exports = module.exports;