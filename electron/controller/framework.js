'use strict';

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { Controller } = require('ee-core');
const { app: electronApp, shell } = require('electron');
const dayjs = require('dayjs');
const Ps = require('ee-core/ps');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
const Conf = require('ee-core/config');
const Addon = require('ee-core/addon');
const EE = require('ee-core/ee');

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
   * json数据库操作
   */   
  async jsondbOperation(args) {
    const { action, info, delete_name, update_name, update_age, search_age, data_dir } = args;

    const data = {
      action,
      result: null,
      all_list: []
    };
    
    switch (action) {
      case 'add' :
        data.result = await Services.get('database.jsondb').addTestData(info);
        break;
      case 'del' :
        data.result = await Services.get('database.jsondb').delTestData(delete_name);
        break;
      case 'update' :
        data.result = await Services.get('database.jsondb').updateTestData(update_name, update_age);
        break;
      case 'get' :
        data.result = await Services.get('database.jsondb').getTestData(search_age);
        break;
      case 'getDataDir' :
        data.result = await Services.get('database.jsondb').getDataDir();
        break;
      case 'setDataDir' :
        data.result = await Services.get('database.jsondb').setCustomDataDir(data_dir);
        break;          
    }

    data.all_list = await Services.get('database.jsondb').getAllTestData();

    return data;
  }

  /**
   * sqlite数据库操作
   */   
  async sqlitedbOperation(args) {
    const { action, info, delete_name, update_name, update_age, search_age, data_dir } = args;

    const data = {
      action,
      result: null,
      all_list: [],
      code: 0
    };

    try {
      // test
      Services.get('database.sqlitedb').getDataDir();
    } catch (err) {
      console.log(err);
      data.code = -1;
      return data;
    }

    switch (action) {
      case 'add' :
        data.result = await Services.get('database.sqlitedb').addTestDataSqlite(info);;
        break;
      case 'del' :
        data.result = await Services.get('database.sqlitedb').delTestDataSqlite(delete_name);;
        break;
      case 'update' :
        data.result = await Services.get('database.sqlitedb').updateTestDataSqlite(update_name, update_age);
        break;
      case 'get' :
        data.result = await Services.get('database.sqlitedb').getTestDataSqlite(search_age);
        break;
      case 'getDataDir' :
        data.result = await Services.get('database.sqlitedb').getDataDir();
        break;
      case 'setDataDir' :
        data.result = await Services.get('database.sqlitedb').setCustomDataDir(data_dir);
        break;            
    }

    data.all_list = await Services.get('database.sqlitedb').getAllTestDataSqlite();

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
    Addon.get('autoUpdater').checkUpdate();
    return;
  }

  /**
   * 下载新版本
   */
  downloadApp() {
    Addon.get('autoUpdater').download();
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
    const { CoreApp } = EE;
    // http方法
    const method = CoreApp.request.method;
    // http get 参数
    let params = CoreApp.request.query;
    params = (params instanceof Object) ? params : JSON.parse(JSON.stringify(params));
    // http post 参数
    const body = CoreApp.request.body;

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
    const data = await Services.get('framework').bothWayMessage(type, content, event);

    return data;
  }

  /**
   * 上传文件
   * 不建议使用，请使用electron的api来获取文件的本机路径，然后读取并上传
   * 使用http的files属性，实际上多余拷贝一次文件
   */  
  async uploadFile() {
    const { CoreApp } = EE;
    let tmpDir = Ps.getLogDir();
    const files = CoreApp.request.files;
    let file = files.file;
    
    let tmpFilePath = path.join(tmpDir, file.originalFilename);
    try {
      let tmpFile = fs.readFileSync(file.filepath);
      fs.writeFileSync(tmpFilePath, tmpFile);
    } finally {
      await fs.unlink(file.filepath, function(){});
    }
    const fileStream = fs.createReadStream(tmpFilePath);
    const uploadRes = await Services.get('framework').uploadFileToSMMS(fileStream);

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

    await Addon.get('javaServer').createServer();

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

    await Addon.get('javaServer').kill();

    return data;
  }

  /**
   * java运行状态
   */ 
  async runStatus() {
    let data = {
      code: 0,
      msg: '',
      flag: false
    }
    const flag =  await Addon.get('javaServer').check();
    //Log.info("[FrameworkController:runStatus] flag-----------"+flag);
    data.flag = flag;
    
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
        result = Services.get('framework').doJob(jobId, action, event);
        break;       
      case 'close':
        Services.get('framework').doJob(jobId, action, event);
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
    Services.get('framework').doCreatePool(num, event);

    // test monitor
    Services.get('framework').monitorJob();

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
        result = Services.get('framework').doJobByPool(jobId, action, event);
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