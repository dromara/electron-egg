import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { app as electronApp, shell } from 'electron';
import { getExtraResourcesDir } from 'ee-core/ps';
import { logger } from 'ee-core/log';
import { getConfig } from 'ee-core/config';
import { frameworkService } from '../service/framework';
import { sqlitedbService } from '../service/database/sqlitedb';
import { autoUpdaterService } from '../service/os/auto_updater';

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
  async sqlitedbOperation(args: {
    action: string;
    info?: any;
    delete_name?: string;
    update_name?: string;
    update_age?: number;
    search_age?: number;
    data_dir?: string;
  }): Promise<{
    action: string;
    result: any;
    all_list: any;
    code: number;
  }> {
    const { action, info, delete_name, update_name, update_age, search_age, data_dir } = args;

    const data = {
      action,
      result: null as any,
      all_list: []as any,
      code: 0
    };

    try {
      // test
      sqlitedbService.getDataDir();
    } catch (err) {
      console.log(err);
      data.code = -1;
      return data;
    }

    switch (action) {
      case 'add' :
        data.result = await sqlitedbService.addTestDataSqlite(info);;
        break;
      case 'del' :
        data.result = await sqlitedbService.delTestDataSqlite(delete_name);;
        break;
      case 'update' :
        data.result = await sqlitedbService.updateTestDataSqlite(update_name, update_age);
        break;
      case 'get' :
        data.result = await sqlitedbService.getTestDataSqlite(search_age);
        break;
      case 'getDataDir' :
        data.result = await sqlitedbService.getDataDir();
        break;
      case 'setDataDir' :
        data.result = await sqlitedbService.setCustomDataDir(data_dir || "");
        break;            
    }

    data.all_list = await sqlitedbService.getAllTestDataSqlite();

    return data;
  }  

  /**
   * 调用其它程序（exe、bash等可执行程序）
   * 
   */
  openSoftware(args: { softName: string }): boolean {
    const { softName } = args;
    const softwarePath = path.join(getExtraResourcesDir(), softName);
    logger.info('[openSoftware] softwarePath:', softwarePath);

    // 检查程序是否存在
    if (!fs.existsSync(softwarePath)) {
      return false;
    }
    // 命令行字符串 并 执行, start 命令后面的路径要加双引号
    const cmdStr = `start "${softwarePath}"`;
    exec(cmdStr);

    // 方法二
    // 使用cross模块

    return true;
  }  

  /**
   * 检测http服务是否开启
   */ 
  async checkHttpServer(): Promise<{ enable: boolean; server: string }>  {
    const httpConfig = getConfig().httpServer;
    if (!httpConfig || !('enable' in httpConfig) || !('protocol' in httpConfig) || !('host' in httpConfig) || !('port' in httpConfig)) {
      return { enable: false, server: '' };
    }
    const { enable, protocol, host, port } = httpConfig;
    const url = `${protocol}${host}:${port}`;
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
  async doHttpRequest(args: any, ctx: any): Promise<boolean> {
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
  async doSocketRequest(args: any): Promise<boolean> {
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
  async ipcInvokeMsg(args: string): Promise<string> {
    let timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const data = args + ' - ' + timeNow;
    
    return data;
  }  

  /**
   * 同步消息类型
   */ 
  async ipcSendSyncMsg(args: string): Promise<string> {
    let timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const data = args + ' - ' + timeNow;
    
    return data;
  }  

  /**
   * 双向异步通信
   */
  ipcSendMsg(args: { type: string; content: any }, event: any): any {
    const { type, content } = args;
    const data = frameworkService.bothWayMessage(type, content, event);

    return data;
  }

  /**
   * 任务
   */ 
  someJob(args: { jobId: string; action: string }, event: any): any {
    const { jobId, action} = args;
    let result = null as any;

    switch (action) {
      case 'create':
        result = frameworkService.doJob(jobId, action, event);
        break;       
      case 'close':
        frameworkService.doJob(jobId, action, event);
        break;
      case 'pause':
        frameworkService.doJob(jobId, action, event);
        break;  
      case 'resume':
        frameworkService.doJob(jobId, action, event);
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
  async createPool(args: { number: number }, event: any): Promise<void> {
    let num = args.number;
    frameworkService.doCreatePool(num, event);

    // test monitor
    frameworkService.monitorJob();

    return;
  }

  /**
   * 通过进程池执行任务
   */ 
  someJobByPool(args: { jobId: string; action: string }, event: any): any {
    const { jobId, action } = args;
    let result = null as any;
    switch (action) {
      case 'run':
        result = frameworkService.doJobByPool(jobId, action, event);
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
   * 检查是否有新版本
   */
  checkForUpdater() { 
    autoUpdaterService.checkUpdate();
    return;
  }

  /**
   * 下载新版本
   */
  downloadApp() {
    autoUpdaterService.download();
    return;
  }

  /**
   * 测试接口
   */ 
  hello(args: any): void {
    logger.info('hello ', args);
  }   
}
FrameworkController.toString = () => '[class FrameworkController]';

export default FrameworkController;  