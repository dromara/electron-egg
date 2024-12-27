'use strict';

const dayjs = require('dayjs');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { app: electronApp, shell } = require('electron');
const { getExtraResourcesDir } = require('ee-core/ps');
const { logger } = require('ee-core/log');
const { getConfig } = require('ee-core/config');
const { frameworkService } = require('../service/framework');
const { getHttpServer } = require('ee-core/socket');

/**
 * framework - demo
 * @class
 */
class FrameworkController {

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

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
   * 
   */
  openSoftware(softName) {
    if (!softName) {
      return false;
    }

    let softwarePath = path.join(getExtraResourcesDir(), softName);
    logger.info('[openSoftware] softwarePath:', softwarePath);

    // 检查程序是否存在
    if (!fs.existsSync(softwarePath)) {
      return false;
    }
    // 命令行字符串 并 执行, start 命令后面的路径要加双引号
    let cmdStr = `start "${softwarePath}"`;
    exec(cmdStr);

    // 方法二
    // 推荐使用cross模块

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
    const { enable, protocol, host, port } = getConfig().httpServer;
    const url = protocol + host + ':' + port;
    console.log('[checkHttpServer] url:', url);
    const data = {
      enable: enable,
      server: url
    }
    return data;
  }

  /**
   * 一个 http 请求
   * args 是 前端传的参数
   * ctx 是 koa 的 ctx 对象
   */ 
  async doHttpRequest(args, ctx) {
    const httpInfo = {
      args,
      method: ctx.request.method,
      query: ctx.request.query,
      body: ctx.request.body
    }
    logger.info('httpInfo:', httpInfo);

    const { id } = args;
    if (!id) {
      return false;
    }
    const dir = electronApp.getPath(id);
    shell.openPath(dir);
    
    return true;
  } 
 
  /**
   * 一个socket io请求访问此方法
   */ 
  async doSocketRequest(args) {
    const { id } = args;
    if (!id) {
      return false;
    }
    const dir = electronApp.getPath(id);
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
  ipcSendMsg(args, event) {
    const { type, content } = args;
    const data = frameworkService.bothWayMessage(type, content, event);

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
      case 'pause':
        Services.get('framework').doJob(jobId, action, event);
        break;  
      case 'resume':
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
    logger.info('hello ', args);
  }   
}

FrameworkController.toString = () => '[class FrameworkController]';
module.exports = FrameworkController;  