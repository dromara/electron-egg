'use strict';

const { Service } = require('ee-core');
const Cross = require('ee-core/cross');
const Log = require('ee-core/log');
const Ps = require('ee-core/ps');
const path = require("path");
const Is = require('ee-core/utils/is');

/**
 * cross（service层为单例）
 * @class
 */
class CrossService extends Service {

  constructor(ctx) {
    super(ctx);
  }

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
      appExit: false,
    }
    const entity = await Cross.run(serviceName, opt);
    Log.info('server name:', entity.name);
    Log.info('server config:', entity.config);
    Log.info('server url:', Cross.getUrl(entity.name));

    return;
  }

  /**
   * create java server
   */
  async createJavaServer() {
    const serviceName = "java";
    const jarPath = path.join(Ps.getExtraResourcesDir(), 'java-app.jar');
    const opt = {
      name: 'javaapp',
      cmd: path.join(Ps.getExtraResourcesDir(), 'jre1.8.0_201/bin/javaw.exe'),
      directory: Ps.getExtraResourcesDir(),
      args: ['-jar', '-server', '-Xms512M', '-Xmx512M', '-Xss512k', '-Dspring.profiles.active=prod', `-Dserver.port=18080`, `-Dlogging.file.path=${Ps.getLogDir()}`, `${jarPath}`],
      appExit: false,
    }
    if (Is.macOS()) {
      // Setup Java program
      opt.cmd = path.join(Ps.getExtraResourcesDir(), 'jre1.8.0_201/Contents/Home/bin/java');
    }
    if (Is.linux()) {
      // Setup Java program
    }

    const entity = await Cross.run(serviceName, opt);
    Log.info('server name:', entity.name);
    Log.info('server config:', entity.config);
    Log.info('server url:', Cross.getUrl(entity.name));

    return;
  }  
}

CrossService.toString = () => '[class CrossService]';
module.exports = CrossService;  