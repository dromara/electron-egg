'use strict';

const BaseService = require('./base');
const path = require('path');
const _ = require('lodash');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const storageKey = require('../const/storageKey');
const fs = require('fs');
const os = require('os');
const storageDir = path.normalize(os.userInfo().homedir + '/electron-egg-storage/');

class StorageService extends BaseService {
  /*
   * instance
   */
  instance(file = null) {
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
  }

  /*
   * getElectronIPCPort
   */
  getElectronIPCPort() {
    const key = storageKey.ELECTRON_IPC + '.port';
    const port = this.instance()
    .get(key)
    .value();
  
    return port;
  }

}

module.exports = StorageService;
