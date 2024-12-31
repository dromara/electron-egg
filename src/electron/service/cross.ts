import { logger } from 'ee-core/log';
import { getExtraResourcesDir } from 'ee-core/ps';
import path from 'path';
import axios from 'axios';
import { is } from 'ee-core/utils';
import { cross } from 'ee-core/cross';

/**
 * CrossService class for cross platform service management
 */
class CrossService {
  info(): string {
    const pids = cross.getPids();
    logger.info('cross pids:', pids);

    let num = 1;
    pids.forEach(pid => {
      let entity = cross.getProc(pid);
      logger.info(`server-${num} name: ${entity.name}`);
      logger.info(`server-${num} config:`, entity.config);
      num++;
    });

    return 'hello electron-egg';
  }

  getUrl(name: string): string {
    const serverUrl = cross.getUrl(name);
    return serverUrl;
  }

  killServer(type: string, name: string): void {
    if (type === 'all') {
      cross.killAll();
    } else {
      cross.killByName(name);
    }
  }

  /**
   * Create a go service
   */
  async createGoServer(): Promise<void> {
    const serviceName = "go";
    const opt = {
      name: 'goapp',
      cmd: path.join(getExtraResourcesDir(), 'goapp'),
      directory: getExtraResourcesDir(),
      args: ['--port=7073'],
      appExit: true,
    };
    const entity = await cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', entity.getUrl());
  }

  /**
   * Create a java server
   */
  async createJavaServer(): Promise<void> {
    const serviceName = "java";
    const jarPath = path.join(getExtraResourcesDir(), 'java-app.jar');
    const opt = {
      name: 'javaapp',
      cmd: path.join(getExtraResourcesDir(), 'jre1.8.0_201/bin/javaw.exe'),
      directory: getExtraResourcesDir(),
      args: ['-jar', '-server', '-Xms512M', '-Xmx512M', '-Xss512k', '-Dspring.profiles.active=prod', `-Dserver.port=18080`, `-Dlogging.file.path=${getExtraResourcesDir()}`, `${jarPath}`],
      appExit: false,
    };
    if (is.macOS()) {
      opt.cmd = path.join(getExtraResourcesDir(), 'jre1.8.0_201.jre/Contents/Home/bin/java');
    }
    if (is.linux()) {
      // Setup for Linux
    }

    const entity = await cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', cross.getUrl(entity.name));
  }

  /**
   * Create a python service
   */
  async createPythonServer(): Promise<void> {
    const serviceName = "python";
    const opt = {
      name: 'pyapp',
      cmd: path.join(getExtraResourcesDir(), 'py', 'pyapp'),
      directory: path.join(getExtraResourcesDir(), 'py'),
      args: ['--port=7074'],
      windowsExtname: true,
      appExit: true,
    };
    const entity = await cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', entity.getUrl());
  }

  async requestApi(name: string, urlPath: string, params: any): Promise<any> {
    const serverUrl = cross.getUrl(name);
    const apiHello = serverUrl + urlPath;
    console.log('Server Url:', serverUrl);

    const response = await axios({
      method: 'get',
      url: apiHello,
      timeout: 1000,
      params,
      proxy: false,
    });
    if (response.status === 200) {
      const { data } = response;
      return data;
    }

    return null;
  }
}

// Setting the class toString method, which is not common in TypeScript
CrossService.toString = () => '[class CrossService]';

export { CrossService, new CrossService() as crossService };