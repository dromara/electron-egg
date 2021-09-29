'use strict';

const BaseController = require('../base');
const os = require('os');
const fs = require('fs');
const path = require('path');

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

  async openLocalDir() {
    const self = this;
    const { ctx, service } = this;
    const body = ctx.request.body;
    const id = body.id;
    const data = {};
    let dir = '';
    switch (id) {
      case 'download' :
        dir = os.userInfo().homedir + '/Downloads';
        break;
      case 'picture' :
        dir = os.userInfo().homedir + '/Pictures';
        break;
      case 'doc' :
        dir = os.userInfo().homedir + '/Documents';
        break;
      case 'music' :
        dir = os.userInfo().homedir + '/Music';
        break;
    }

    await service.example.openLocalDir(dir);

    self.sendSuccess(data);
  }

  async executeJS() {
    const self = this;
    const { ctx, service } = this;
    const body = ctx.request.body;
    const str = body.str;
    let data = await service.example.executeJS(str);
    self.sendSuccess(data);
  }

  async uploadFile() {
    const self = this;
    const { ctx, service } = this;
    let tmpDir = service.storage.getStorageDir();
    // for (const file of ctx.request.files) {
    //   this.app.logger.info('file:', file);

    //   try {
    //     let tmpFile = fs.readFileSync(file.filepath)
    //     fs.writeFileSync(path.join(tmpDir, file.filename), tmpFile)
    //   } finally {
    //     await fs.unlink(file.filepath, function(){});
    //   }
    //   const fileStream = fs.createReadStream(path.join(tmpDir, file.filename))
    //   const uploadRes = await service.example.uploadFileToSMMS(fileStream);
    // }
    const file = ctx.request.files[0];
    //this.app.logger.info('file:', file);

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

  async setShortcut() {
    const self = this;
    const { ctx, service } = this;
    const shortcutObj = ctx.request.body;
    const data = {};

    if (!shortcutObj['id'] || !shortcutObj['name'] || !shortcutObj['cmd']) {
      self.sendFail({}, 'param error', 100);
      return;
    }

    await service.example.setShortcut(shortcutObj);

    self.sendSuccess(data);
  }

  async getWsUrl() {
    const self = this;
    const { service } = this;
    const data = {};

    const addr = await service.socket.getWsUrl();
    data.url = addr;

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
   * 选择文件夹目录
   */
  async selectFileDir() {
    const { service } = this;

    const data = {
      dir: ''
    };
    const dir = await service.example.selectDir();
    data.dir = dir;

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
