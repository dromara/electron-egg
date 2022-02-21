'use strict';

const BaseController = require('./base');
const fs = require('fs');
const path = require('path');
const Utils = require('ee-core').Utils;

class ExampleController extends BaseController {

  /**
   * test electron api
   */
  async testElectronApi() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    const id = body.id;
    const data = {};

    await service.example.testElectronApi(id);

    this.sendSuccess(data);
  }

  /**
   * test2
   */
  test2() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    console.log('test2 params:', body);
    const data = {
      age: 32
    };

    this.sendSuccess(data);
  }

  async executeJS() {
    const self = this;
    const { ctx, service } = this;
    const body = ctx.request.body;
    const str = body.str;
    let data = await service.example.executeJS(str);
    self.sendSuccess(data);
  }

  /**
   * 上传文件
   */  
  async uploadFile() {
    const self = this;
    const { ctx, service } = this;
    let tmpDir = Utils.getLogDir();
    const file = ctx.request.files[0];

    try {
      let tmpFile = fs.readFileSync(file.filepath)
      fs.writeFileSync(path.join(tmpDir, file.filename), tmpFile)
    } finally {
      await fs.unlink(file.filepath, function(){});
    }
    const fileStream = fs.createReadStream(path.join(tmpDir, file.filename))
    const uploadRes = await service.example.uploadFileToSMMS(fileStream);

    self.sendData(uploadRes);
  }

  async uploadExtension() {
    const self = this;
    const { ctx, service } = this;
    const data = {};
    let tmpDir = service.storage.getStorageDir();

    const file = ctx.request.files[0];
    this.app.logger.info('file:', file);

    try {
      let tmpFile = fs.readFileSync(file.filepath)
      fs.writeFileSync(path.join(tmpDir, file.filename), tmpFile)
    } finally {
      await fs.unlink(file.filepath, function(){});
    }
    
    const filePath = path.join(tmpDir, file.filename);
    await service.example.loadExtension(filePath);

    self.sendData(data);
  }

  async dbOperation() {
    const self = this;
    const { ctx, service } = this;
    const paramsObj = ctx.request.body;
    const data = {
      action: paramsObj.action,
      result: null,
      all_list: []
    };
    
    switch (paramsObj.action) {
      case 'add' :
        data.result = await service.storage.addTestData(paramsObj.info);;
        break;
      case 'del' :
        data.result = await service.storage.delTestData(paramsObj.delete_name);;
        break;
      case 'update' :
        data.result = await service.storage.updateTestData(paramsObj.update_name, paramsObj.update_age);
        break;
      case 'get' :
        data.result = await service.storage.getTestData(paramsObj.search_age);
        break;
    }

    data.all_list = await service.storage.getAllTestData();

    self.sendSuccess(data);
  }

  async addTestData() {
    const self = this;
    const { service } = this;
    const data = {};

    const userInfo = {
      name: 'jame',
      age: 18,
      gender: 'man'
    }
    await service.storage.addTestData(userInfo);

    self.sendSuccess(data);
  }

  async delTestData() {
    const self = this;
    const { service } = this;
    const data = {};
    const name = 'jame';
    await service.storage.delTestData(name);

    self.sendSuccess(data);
  }

  async updateTestData() {
    const self = this;
    const { service } = this;
    const data = {};
    const name = 'jame';
    const age = 20;
    await service.storage.updateTestData(name, age);

    self.sendSuccess(data);
  }

  async getTestData() {
    const self = this;
    const { service } = this;
    const data = {};
    const name = 'jame';
    const user = await service.storage.getTestData(name);
    data.user = user;

    self.sendSuccess(data);
  }

  async autoLaunchEnable() {
    const { service } = this;

    await service.example.autoLaunchEnable();
    const data = {
      isEnabled: true
    };

    this.sendSuccess(data);
  }
  
  async autoLaunchDisable() {
    const { service } = this;
    
    await service.example.autoLaunchDisable();
    const data = {
      isEnabled: false
    };

    this.sendSuccess(data);
  }

  async autoLaunchIsEnabled() {
    const { service } = this;

    const data = {
      isEnabled: null
    };

    const isEnabled = await service.example.autoLaunchIsEnabled();
    data.isEnabled = isEnabled;

    this.sendSuccess(data);
  }

  /**
   * 调用其它程序
   */
  async openSoftware() {
    const { service } = this;
    const data = {};
    const openResult = await service.example.openSoftware('powershell.exe');
    if (!openResult) {
      this.sendFail({}, '程序不存在', 100);
      return;
    }
    this.sendSuccess(data);
  }

  /**
   * 显示消息对话框
   */
  async messageShow() {
    const { service } = this;
    const data = {};
    await service.example.messageShow();

    this.sendSuccess(data);
  }

  /**
   * 显示消息对话框和确认
   */
  async messageShowConfirm() {
    const { service } = this;
    const data = {};
    await service.example.messageShowConfirm();

    this.sendSuccess(data);
  }
}

module.exports = ExampleController;
