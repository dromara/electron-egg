'use strict';

const { Service } = require('ee-core');
const Storage = require('ee-core/storage');
const _ = require('lodash');
const path = require('path');

/**
 * json数据存储
 * @class
 */
class JsondbService extends Service {

  constructor (ctx) {
    super(ctx);

    // jsondb数据库
    this.jsonFile = 'demo';
    this.demoDB = Storage.connection(this.jsonFile);  
    this.demoDBKey = {
      test_data: 'test_data'
    };
  }

  /*
   * 增 Test data
   */
  async addTestData(user) {
    const key = this.demoDBKey.test_data;
    if (!this.demoDB.db.has(key).value()) {
      this.demoDB.db.set(key, []).write();
    }
    
    const data = this.demoDB.db
    .get(key)
    .push(user)
    .write();

    return data;
  }

  /*
   * 删 Test data
   */
  async delTestData(name = '') {
    const key = this.demoDBKey.test_data;
    const data = this.demoDB.db
    .get(key)
    .remove({name: name})
    .write();

    return data;
  }

  /*
   * 改 Test data
   */
  async updateTestData(name= '', age = 0) {
    const key = this.demoDBKey.test_data;
    const data = this.demoDB.db
    .get(key)
    .find({name: name}) // 修改找到的第一个数据，貌似无法批量修改 todo
    .assign({age: age})
    .write();

    return data;
  }

  /*
   * 查 Test data
   */
  async getTestData(age = 0) {
    const key = this.demoDBKey.test_data;
    let data = this.demoDB.db
    .get(key)
    //.find({age: age}) 查找单个
    .filter(function(o) {
      let isHas = true;
      isHas = age === o.age ? true : false;
      return isHas;
    })
    //.orderBy(['age'], ['name']) 排序
    //.slice(0, 10) 分页
    .value();

    if (_.isEmpty(data)) {
      data = []
    }

    return data;
  }

  /*
   * all Test data
   */
  async getAllTestData() {
    const key = this.demoDBKey.test_data;
    if (!this.demoDB.db.has(key).value()) {
      this.demoDB.db.set(key, []).write();
    }
    let data = this.demoDB.db
    .get(key)
    .value();

    if (_.isEmpty(data)) {
      data = []
    }

    return data;
  }

  /*
   * get data dir (sqlite)
   */
  async getDataDir() {
    const dir = this.demoDB.getStorageDir();    

    return dir;
  } 

  /*
   * set custom data dir (sqlite)
   */
  async setCustomDataDir(dir) {
    if (_.isEmpty(dir)) {
      return;
    }

    // the absolute path of the db file
    const dbFile = path.join(dir, this.jsonFile);
    this.demoDB = Storage.connection(dbFile);    

    return;
  }  
}

JsondbService.toString = () => '[class JsondbService]';
module.exports = JsondbService;
