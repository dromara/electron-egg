'use strict';

const { logger } = require('ee-core/log');
const { getExtraResourcesDir } = require('ee-core/ps');
const path = require("path");
const Is = require('ee-core/utils/is');

/**
 * cross
 * @class
 */
class CrossService {

  /**
   * create go service
   * In the default configuration, services can be started with applications. 
   * Developers can turn off the configuration and create it manually.
   */   
  async createGoServer() {
    // method 1: Use the default Settings
    //const entity = await Cross.run(serviceName);

    // method 2: Use custom configuration
    const serviceName = "go";
    const opt = {
      name: 'goapp',
      cmd: path.join(getExtraResourcesDir(), 'goapp'),
      directory: getExtraResourcesDir(),
      args: ['--port=7073'],
      appExit: true,
    }
    const entity = await Cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', entity.getUrl());

    return;
  }

  /**
   * create java server
   */
  async createJavaServer() {
    const serviceName = "java";
    const jarPath = path.join(getExtraResourcesDir(), 'java-app.jar');
    const opt = {
      name: 'javaapp',
      cmd: path.join(getExtraResourcesDir(), 'jre1.8.0_201/bin/javaw.exe'),
      directory: getExtraResourcesDir(),
      args: ['-jar', '-server', '-Xms512M', '-Xmx512M', '-Xss512k', '-Dspring.profiles.active=prod', `-Dserver.port=18080`, `-Dlogging.file.path=${Ps.getLogDir()}`, `${jarPath}`],
      appExit: false,
    }
    if (Is.macOS()) {
      // Setup Java program
      opt.cmd = path.join(Ps.getExtraResourcesDir(), 'jre1.8.0_201.jre/Contents/Home/bin/java');
    }
    if (Is.linux()) {
      // Setup Java program
    }

    const entity = await Cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', Cross.getUrl(entity.name));

    return;
  }  

  /**
   * create python service
   * In the default configuration, services can be started with applications. 
   * Developers can turn off the configuration and create it manually.
   */   
  async createPythonServer() {
    // method 1: Use the default Settings
    //const entity = await Cross.run(serviceName);

    // method 2: Use custom configuration
    const serviceName = "python";
    const opt = {
      name: 'pyapp',
      cmd: path.join(getExtraResourcesDir(), 'py', 'pyapp'),
      directory: path.join(getExtraResourcesDir(), 'py'),
      args: ['--port=7074'],
      windowsExtname: true,
      appExit: true,
    }
    const entity = await Cross.run(serviceName, opt);
    logger.info('server name:', entity.name);
    logger.info('server config:', entity.config);
    logger.info('server url:', entity.getUrl());

    return;
  }
}

CrossService.toString = () => '[class CrossService]';
module.exports = {
  CrossService,
  crossService: new CrossService()
};  