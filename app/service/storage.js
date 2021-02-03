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
const storageDb = 'db.json';

class StorageService extends BaseService {
  /*
   * instance
   */
  instance(file = null) {
    if (!file) {
      const storageDir = this.getStorageDir();
      if (!fs.existsSync(storageDir)) {
        utils.mkdir(storageDir);
        utils.chmodPath(storageDir, '777');
      }
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
    const userHomeDir = os.userInfo().homedir;
    const storageDir = path.normalize(userHomeDir + '/' + pkg.name + '/');

    return storageDir;
  }

  /*
   * add Test data
   */
  async addTestData(user) {
    const key = storageKey.TEST_DATA;
    if (!this.instance().has(key).value()) {
      this.instance().set(key, []).write();
    }
    
    const data = this.instance()
    .get(key)
    .push(user)
    .write();

    return data;
  }

  /*
   * del Test data
   */
  async delTestData(name = '') {
    const key = storageKey.TEST_DATA;
    const data = this.instance()
    .get(key)
    .remove({name: name})
    .write();

    return data;
  }

  /*
   * update Test data
   */
  async updateTestData(name= '', age = 0) {
    const key = storageKey.TEST_DATA;
    const data = this.instance()
    .get(key)
    .find({name: name})
    .assign({ age: age})
    .write();

    return data;
  }

  /*
   * get Test data
   */
  async getTestData(name = '') {
    const key = storageKey.TEST_DATA;
    const data = this.instance()
    .get(key)
    .find({name: name})
    .value();

    return data;
  }
}

module.exports = StorageService;
