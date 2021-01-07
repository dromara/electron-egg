'use strict';

const BaseService = require('./base');
const path = require('path');
const _ = require('lodash');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const storageKey = require('../const/storageKey');
const fs = require('fs');
const os = require('os');
const pkg = require('../../package.json');
const storageDir = path.normalize(os.userInfo().homedir + '/' + pkg.name + '/');
const storageDb = pkg.build.appId + '_db.json';

class StorageService extends BaseService {
  /*
   * instance
   */
  instance(file = null) {
    if (!file) {
        file = path.normalize(storageDir + storageDb);
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

  /*
   * getStorageDir
   */
  getStorageDir() {
    return storageDir;
  }

}

module.exports = StorageService;
