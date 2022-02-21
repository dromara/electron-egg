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
    let tmpDir = Utils.getLogDir();

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

  /**
   * json数据库操作
   */   
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
