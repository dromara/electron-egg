'use strict';

const Storage = require('ee-core').Storage;
const Service = require('egg').Service;
const _ = require('lodash');

class StorageService extends Service {

  constructor (ctx) {
    super(ctx);
    this.systemDB = Storage.JsonDB.connection('system').db;
    this.demoDB = Storage.JsonDB.connection('demo').db;  
    this.systemDBKey = {
      cache: 'cache'
    };
    this.demoDBKey = {
      preferences: 'preferences',
      test_data: 'test_data'
    };
  }

  /*
   * 增 Test data
   */
  async addTestData(user) {
    const key = this.demoDBKey.test_data;
    if (!this.demoDB.has(key).value()) {
      this.demoDB.set(key, []).write();
    }
    
    const data = this.demoDB
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
    const data = this.demoDB
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
    const data = this.demoDB
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
    let data = this.demoDB
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
      if (!this.demoDB.has(key).value()) {
        this.demoDB.set(key, []).write();
      }
      let data = this.demoDB
      .get(key)
      .value();
  
      if (_.isEmpty(data)) {
        data = []
      }
  
      return data;
    }
}

module.exports = StorageService;
