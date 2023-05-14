'use strict';

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { Controller } = require('ee-core');
const { app: electronApp, shell } = require('electron');
const dayjs = require('dayjs');
const Ps = require('ee-core/ps');
const Log = require('ee-core/log');
const Utils = require('ee-core/utils');
const Conf = require('ee-core/config');

/**
 * electron-egg framework - 功能demo
 * @class
 */
class FrameworkController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test() {
    const result = await this.service.framework.test('electron');

    // let tmpDir = Ps.getLogDir();
    // Log.info('tmpDir:', tmpDir);

    let mid = await Utils.machineIdSync(true);
    Log.info('mid 11111111:', mid);

    Utils.machineId().then((id) => {
      Log.info('mid 222222222:', id);
    });

    return result;
  }

  /**
   * json数据库操作
   */   
  async dbOperation(args) {
    const { service } = this;
    const paramsObj = args;
    //Log.info('eeeee paramsObj:', paramsObj);
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

    return data;
  }

  /**
   * sqlite数据库操作
   */   
  async sqlitedbOperation(args) {
    const { service } = this;
    const paramsObj = args;
    //Log.info('eeeee paramsObj:', paramsObj);
    const data = {
      action: paramsObj.action,
      result: null,
      all_list: []
    };
    
    switch (paramsObj.action) {
      case 'add' :
        data.result = await service.storage.addTestDataSqlite(paramsObj.info);;
        break;
      case 'del' :
        data.result = await service.storage.delTestDataSqlite(paramsObj.delete_name);;
        break;
      case 'update' :
        data.result = await service.storage.updateTestDataSqlite(paramsObj.update_name, paramsObj.update_age);
        break;
      case 'get' :
        data.result = await service.storage.getTestDataSqlite(paramsObj.search_age);
        break;
      case 'getDataDir' :
        data.result = await service.storage.getDataDir();
        break;
      case 'setDataDir' :
        data.result = await service.storage.setCustomDataDir(paramsObj.data_dir);
        break;            
    }

    data.all_list = await service.storage.getAllTestDataSqlite();

    return data;
  }  

  /**
   * 调用其它程序（exe、bash等可执行程序）
   */
  openSoftware(softName) {
    if (!softName) {
      return false;
    }

    let softwarePath = path.join(Ps.getExtraResourcesDir(), softName);
    Log.info('[openSoftware] softwarePath:', softwarePath);

    // 检查程序是否存在
    if (!fs.existsSync(softwarePath)) {
      return false;
    }
    // 命令行字符串 并 执行
    let cmdStr = 'start ' + softwarePath;
    exec(cmdStr);

    return true;
  }  
  
  /**
   * 检查是否有新版本
   */
  checkForUpdater() { 
    const autoUpdaterAddon = this.app.addon.autoUpdater;
    autoUpdaterAddon.checkUpdate();  

    return;
  }

  /**
   * 下载新版本
   */
  downloadApp() {
    const autoUpdaterAddon = this.app.addon.autoUpdater;
    autoUpdaterAddon.download();
    return;
  }

  /**
   * 检测http服务是否开启
   */ 
  async checkHttpServer() {
    const httpServerConfig = Conf.getValue('httpServer');
    const url = httpServerConfig.protocol + httpServerConfig.host + ':' + httpServerConfig.port;

    const data = {
      enable: httpServerConfig.enable,
      server: url
    }
    return data;
  }

  /**
   * 一个http请求访问此方法
   */ 
  async doHttpRequest() {
    // http方法
    const method = this.app.request.method;
    // http get 参数
    let params = this.app.request.query;
    params = (params instanceof Object) ? params : JSON.parse(JSON.stringify(params));
    // http post 参数
    const body = this.app.request.body;

    const httpInfo = {
      method,
      params,
      body
    }
    Log.info('httpInfo:', httpInfo);

    if (!body.id) {
      return false;
    }
    const dir = electronApp.getPath(body.id);
    shell.openPath(dir);
    
    return true;
  } 
 
  /**
   * 一个socket io请求访问此方法
   */ 
  async doSocketRequest(args) {
    if (!args.id) {
      return false;
    }
    const dir = electronApp.getPath(args.id);
    shell.openPath(dir);
    
    return true;
  }
  
  /**
   * 异步消息类型
   */ 
  async ipcInvokeMsg(args, event) {
    let timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const data = args + ' - ' + timeNow;
    
    return data;
  }  

  /**
   * 同步消息类型
   */ 
  async ipcSendSyncMsg(args) {
    let timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const data = args + ' - ' + timeNow;
    
    return data;
  }  

  /**
   * 双向异步通信
   */
  async ipcSendMsg(args, event) {
    const { type, content } = args;
    const data = await this.service.framework.bothWayMessage(type, content, event);

    return data;
  }

  /**
   * 上传文件
   */  
  async uploadFile() {
    let tmpDir = Ps.getLogDir();
    const files = this.app.request.files;
    let file = files.file;
    
    let tmpFilePath = path.join(tmpDir, file.originalFilename);
    try {
      let tmpFile = fs.readFileSync(file.filepath);
      fs.writeFileSync(tmpFilePath, tmpFile);
    } finally {
      await fs.unlink(file.filepath, function(){});
    }
    const fileStream = fs.createReadStream(tmpFilePath);
    const uploadRes = await this.service.framework.uploadFileToSMMS(fileStream);

    return uploadRes;
  }

  /**
   * 启动java项目
   */ 
  async startJavaServer() {
    let data = {
      code: 0,
      msg: '',
      server: ''
    }
    const javaCfg = Conf.getValue('addons.javaServer') || {};
    if (!javaCfg.enable) {
      data.code = -1;
      data.msg = 'addon not enabled!';
      return data;
    }

    const javaServerAddon = this.app.addon.javaServer;
    await javaServerAddon.createServer();

    data.server = 'http://localhost:' + javaCfg.port;

    return data;
  }

  /**
   * 关闭java项目
   */ 
  async closeJavaServer() {
    let data = {
      code: 0,
      msg: '',
    }
    const javaCfg = Conf.getValue('addons.javaServer') || {};
    if (!javaCfg.enable) {
      data.code = -1;
      data.msg = 'addon not enabled!';
      return data;
    }

    const javaServerAddon = this.app.addon.javaServer;
    await javaServerAddon.kill();

    return data;
  }

  /**
   * 任务
   */ 
  someJob(args, event) {
    let jobId = args.id;
    let action = args.action;
    
    let result;
    switch (action) {
      case 'create':
        result = this.service.framework.doJob(jobId, action, event);
        break;       
      case 'close':
        this.service.framework.doJob(jobId, action, event);
        break;
      default:  
    }
    
    let data = {
      jobId,
      action,
      result
    }
    return data;
  }

  /**
   * 创建任务池
   */ 
  async createPool(args, event) {
    let num = args.number;
    this.service.framework.doCreatePool(num, event);

    // test monitor
    this.service.framework.monitorJob();

    return;
  }

  /**
   * 通过进程池执行任务
   */ 
  someJobByPool(args, event) {
    let jobId = args.id;
    let action = args.action;
    
    let result;
    switch (action) {
      case 'run':
        result = this.service.framework.doJobByPool(jobId, action, event);
        break;
      default:  
    }
    
    let data = {
      jobId,
      action,
      result
    }
    return data;
  }

  /**
   * 测试接口
   */ 
  hello(args) {
    Log.info('hello ', args);
  }   
}

FrameworkController.toString = () => '[class FrameworkController]';
module.exports = FrameworkController;  