import { logger } from 'ee-core/log';
import { getExtraResourcesDir, getLogDir, getAppUserDataDir } from 'ee-core/ps';
import path from "path";
import axios from 'axios';
import { is } from 'ee-core/utils';
import { cross } from 'ee-core/cross';
import type { CrossTargetConfig } from 'ee-core';

/**
 * OpenHarmony 上 goapp 的启动路径（HNP 方案）
 *
 * 内核 XPM 会拦截未签名二进制的 exec（resfile 里的直接 spawn 报 EACCES）。
 * goapp 经 HNP 打包（script/ohos-hnp.js）后，安装时由系统释放到沙箱并签名：
 *   /data/app/goapp.org/goapp_<version>/bin/goapp/goapp
 * 参考 openharmony-sig/electron 的 hnp-packaging-guide。
 * 注意：<version> 需与 script/ohos-hnp.js 的 HNP_VERSION 保持一致。
 */
function getOhosGoAppCmd(): string {
  const home = process.env.HNP_PRIVATE_HOME || '/data/app';
  return path.join(home, 'goapp.org', 'goapp_1.0', 'bin', 'goapp', 'goapp');
}

/**
 * cross
 * @class
 */
class CrossService {

  info(): string {
    const pids = cross.getPids();
    logger.info('cross pids:', pids);

    let num = 1;
    pids.forEach((pid: string) => {
      let entity = cross.getProc(pid);
      logger.info(`server-${num} name:${entity.name}`);
      logger.info(`server-${num} config:`, entity.config);
      num++;
    })

    return 'hello electron-egg';
  }

  getUrl(name: string): string | undefined {
    const serverUrl = cross.getUrl(name);
    return serverUrl;
  }

  killServer(type: string, name: string): void {
    if (type == 'all') {
      cross.killAll();
    } else {
      cross.killByName(name);
    }
  }  

  /**
   * create go service
   * In the default configuration, services can be started with applications.
   * Developers can turn off the configuration and create it manually.
   */
  async createGoServer(): Promise<void> {
    // method 1: Use the default Settings
    //const entity = await cross.run(serviceName);

    // OpenHarmony 沙箱下 $HOME（/storage/Users/currentUser）不可写，ee-go 的
    // initUserDir() 会在 $HOME/.config 下建目录导致 mkdir 失败、进程退出。
    // ee-core 的 cross-spawn 调用不转发 CrossTargetConfig.env，所以改用应用自己
    // 的可写数据目录覆盖 process.env.HOME（子进程默认继承 process.env）。
    if (is.openharmony()) {
      process.env.HOME = getAppUserDataDir();
    }

    // method 2: Use custom configuration
    const serviceName = "go";
    const opt: CrossTargetConfig = {
      name: 'goapp',
      cmd: is.openharmony() ? getOhosGoAppCmd() : path.join(getExtraResourcesDir(), 'goapp'),
      directory: getExtraResourcesDir(),
      args: ['--port=7073'],
      appExit: false,
      stdio: is.openharmony() ? ['ignore', 'pipe', 'pipe', 'ipc'] : undefined,
    }
    const entity = await cross.run(serviceName, opt);
    logger.info('[go] server name:', entity.name);
    logger.info('[go] server config:', entity.config);
    logger.info('[go] server url:', entity.getUrl());

    if (is.openharmony()) {
      const child = (entity as any).child ?? (entity as any).process ?? (entity as any).cp;
      if (child) {
        child.stdout?.on('data', (d: Buffer) => logger.info('[go][stdout]', d.toString()));
        child.stderr?.on('data', (d: Buffer) => logger.info('[go][stderr]', d.toString()));
        child.on('exit', (code: number, signal: string) => logger.info('[go][exit]', code, signal));
        child.on('error', (err: Error) => logger.info('[go][error]', err.message));
      } else {
        logger.info('[go] no child handle found on entity, keys:', Object.keys(entity as any));
      }
    }

    return;
  }

  /**
   * create java server
   */
  async createJavaServer(): Promise<void> {
    const serviceName = "java";
    const jarPath = path.join(getExtraResourcesDir(), 'java-app.jar');
    const opt: CrossTargetConfig = {
      name: 'javaapp',
      cmd: path.join(getExtraResourcesDir(), 'jre1.8.0_201/bin/javaw.exe'),
      directory: getExtraResourcesDir(),
      args: ['-jar', '-server', '-Xms512M', '-Xmx512M', '-Xss512k', '-Dspring.profiles.active=prod', `-Dserver.port=18080`, `-Dlogging.file.path=${getLogDir()}`, `${jarPath}`],
      appExit: false,
    }
    if (is.macOS()) {
      // Setup Java program
      opt.cmd = path.join(getExtraResourcesDir(), 'jre1.8.0_201.jre/Contents/Home/bin/java');
    }
    if (is.linux()) {
      // Setup Java program
    }

    const entity = await cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', cross.getUrl(entity.name));

    return;
  }  

  /**
   * create python service
   * In the default configuration, services can be started with applications. 
   * Developers can turn off the configuration and create it manually.
   */   
  async createPythonServer(): Promise<void> {
    // method 1: Use the default Settings
    //const entity = await cross.run(serviceName);

    // method 2: Use custom configuration
    const serviceName = "python";
    const opt: CrossTargetConfig = {
      name: 'pyapp',
      cmd: path.join(getExtraResourcesDir(), 'py', 'pyapp'),
      directory: path.join(getExtraResourcesDir(), 'py'),
      args: ['--port=7074'],
      windowsExtname: true,
      appExit: true,
    }
    const entity = await cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', entity.getUrl());

    return;
  }

  async requestApi(name: string, urlPath: string, params?: Record<string, unknown>): Promise<unknown> {
    const serverUrl = cross.getUrl(name);
    if (!serverUrl) return null;
    const apiHello = serverUrl + urlPath;
    console.log('Server Url:', serverUrl);

    const response = await axios({
      method: 'get',
      url: apiHello,
      timeout: 1000,
      params,
      proxy: false,
    });
    if (response.status == 200) {
      const { data } = response;
      return data;
    }

    return null;
  }  
}
export const crossService = new CrossService();  
