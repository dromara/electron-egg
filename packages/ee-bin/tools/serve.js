'use strict';

const debug = require('debug')('ee-bin:serve');
const path = require('path');
const fsPro = require('fs-extra');
const { loadConfig, isWindows, getArgumentByName, readJsonSync, writeJsonSync } = require('../lib/utils');
const is = require('is-type-of');
const chalk = require('chalk');
const crossSpawn = require('cross-spawn');
const { buildSync } = require('esbuild');
const chokidar = require('chokidar');
const kill = require('tree-kill');
const process = require("process");

class ServeProcess {

  constructor() {
    process.env.NODE_ENV = 'prod'; // dev / prod
    this.execProcess = {};
    this.electronDir = './electron';
    this.bundleDir = './public/electron';
    this.pkgPath = './package.json';
    this._init();
  }

  /**
   * init 
   */  
  _init() {
    // process manager
    // Monitor SIGINT signal（Ctrl + C）
    process.on('SIGINT', () => {
      console.log(chalk.blue('[ee-bin] ') + `Received SIGINT. Closing processes...`);
      this._closeProcess();
    });

    // Monitor SIGTERM signal
    process.on('SIGTERM', () => {
      console.log(chalk.blue('[ee-bin] ') + `Received SIGTERM. Closing processes...`);
      this._closeProcess();
    });
  }  

  // Close process
  async _closeProcess() {
    const currentProcess = [];
    const keys = Object.keys(this.execProcess);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const p = this.execProcess[key];
      currentProcess.push({
        name: key,
        pid: p.pid,
      });
    }

    // Cleaning work before the end of the process
    await this.sleep(500);
    currentProcess.forEach((p) => {
      kill(p.pid);
      debug(`Kill ${chalk.blue(p.name)} server, pid: ${p.pid}`);
    });
    process.exit(0);
  }

  /**
   * Start frontend and main process services
   */
  dev(options = {}) {
    // Set an environment variable
    process.env.NODE_ENV = 'dev';
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'dev';
    const binCmdConfig = binCfg[binCmd];

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join();
    }
    const opt = {
      binCmd,
      binCmdConfig,
      command,
    }

    // build electron main code 
    const cmds = this._formatCmds(command);
    if (cmds.indexOf("electron") !== -1) {
      const electronConfig = binCmdConfig.electron;

      // Debugging source code
      const debugging = getArgumentByName('debuger', electronConfig.args) == 'true'? true : false;
      this._switchPkgMain(debugging);

      // watche electron main code
      if (electronConfig.watch) {
        let debounceTimer = null;
        const cmd = 'electron';
        const watcher = chokidar.watch([this.electronDir], {
          persistent: true
        });
        watcher.on('change', async (f) => {
          //console.log(chalk.blue('[ee-bin] [dev] ') + 'File ' + chalk.cyan(`[${f}]`) + 'has been changed');
          console.log(chalk.blue('[ee-bin] [dev] ') + `File [${chalk.cyan(f)}] has been changed`);

          // 防抖
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            // rebuild code
            console.log(chalk.blue('[ee-bin] [dev] ') + `Restart ${cmd}`);
            this.bundle(binCfg.build.electron);
            let subPorcess = this.execProcess[cmd];
            kill(subPorcess.pid, 'SIGKILL', (err) => {
              if (err) {
                console.log(chalk.red('[ee-bin] [dev] ') + `Restart failed, error: ${err}`);
                process.exit(-1);
              }
              delete this.execProcess[cmd];

              // restart electron command
              let onlyElectronOpt = {
                binCmd,
                binCmdConfig,
                command: cmd,
              }
              this.multiExec(onlyElectronOpt);
            })                     
          }, electronConfig.delay);  
        });
      }

      // When starting for the first time, build the code for the electron directory
      this.bundle(binCfg.build.electron);
    }

    this.multiExec(opt);
  }

  /**
   * Start the main process service
   */
  start(options = {}) {
    const { config } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'start';
    const binCmdConfig = {
      start: binCfg[binCmd]
    };

    const opt = {
      binCmd,
      binCmdConfig,
      command: binCmd,
    }
    this.multiExec(opt);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * build
   */
  build(options = {}) {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env;
    const binCfg = loadConfig(config);
    const binCmd = 'build';
    const binCmdConfig = binCfg[binCmd];

    if (!cmds || cmds == "") {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return
    }

    // [todo] If there is 'electron' , then execute 'electron' first and recycle other commands
    // should it be placed in multiExec() and maintain the execution order
    const commands = this._formatCmds(cmds);
    if (commands.indexOf("electron") !== -1) {
      this.bundle(binCmdConfig.electron);
      // Remove electron cmd and execute others 
      const index = commands.indexOf("electron");
      commands.splice(index, 1);
      cmds = commands.join(); 

      // switch pkg.main
      this._switchPkgMain(false)
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds,
    }
    this.multiExec(opt);
  }

  /**
   * Execute custom commands
   */
  exec(options = {}) {
    const { config, cmds } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'exec';
    const binCmdConfig = binCfg[binCmd];

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds,
    }
    this.multiExec(opt);
  }

  /**
   * Support multiple commands
   */
  multiExec(opt = {}) {
    //console.log('multiExec opt:', opt)
    const { binCmd, binCmdConfig, command } = opt;
    const commands = this._formatCmds(command);

    for (let i = 0; i < commands.length; i++) {
      let cmd = commands[i];
      const cfg = binCmdConfig[cmd];

      if (!cfg) {
        // Running the build electron code separately may be empty
        //console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.yellow(`Warning: [${cmd}] config does not exist` ));
        continue;
      }

      // frontend 如果是 file:// 协议，则不启动
      if (binCmd == 'dev' && cmd == 'frontend' && cfg.protocol == 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk.green(cmd)} command`);
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.magenta('Config:'), JSON.stringify(cfg));

      const execDir = path.join(process.cwd(), cfg.directory);
      const execArgs = is.string(cfg.args) ? [cfg.args] : cfg.args;
      const stdio = cfg.stdio ? cfg.stdio: 'inherit';

      const handler = cfg.sync ? crossSpawn.sync : crossSpawn;

      this.execProcess[cmd] = handler(
        cfg.cmd,
        execArgs,
        { stdio: stdio, cwd: execDir, maxBuffer: 1024 * 1024 * 1024 },
      );
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`${cmd}`) + ` command is ${cfg.sync ? 'run completed' : 'running'}`);

      if(!cfg.sync) {
        this.execProcess[cmd].on('exit', () => {
          if (binCmd == 'dev') {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} process is exiting`);
            if (isWindows() && cmd == 'electron') {
              console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('Press "CTRL+C" to exit'));
            }
            return
          }
          console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} command has been executed and exited`);
        });
      }
    }
  } 
  
  // esbuild
  bundle(bundleConfig) {
    const { bundleType } = bundleConfig;
    if (bundleType == 'copy') {
      const srcResource = path.join(process.cwd(), this.electronDir);
      const destResource = path.join(process.cwd(), this.bundleDir);
      fsPro.removeSync(destResource);
      fsPro.copySync(srcResource, destResource);
    } else {
      const esbuildOptions = bundleConfig[bundleConfig.type];
      // todo 不压缩
      // if (this.isDev()) {
      //   esbuildOptions.minify = false;
      // }
      debug('esbuild options:%O', esbuildOptions);
      buildSync(esbuildOptions);
    }
  }

  // format commands
  _formatCmds(command) {
    let cmds;
    const cmdString = command.trim();
    if (cmdString.indexOf(',') !== -1) {
      cmds = cmdString.split(',');
    } else {
      cmds = [cmdString];
    }

    return cmds;
  }

  // Modify the main attribute in package.json
  _switchPkgMain(isDebugger = false) {
    let mainFile = 'main.js';
    const pkgPath = path.join(process.cwd(), this.pkgPath);
    const pkg = readJsonSync(pkgPath);
    const maints = path.join(process.cwd(), this.electronDir, 'main.ts');
    if (fsPro.existsSync(maints)) {
      mainFile = 'main.ts'
    }

    // [todo] Currently only supports JS
    // [todo] Do not use path. join() to ensure consistent performance between Windows and macOS
    if (isDebugger && mainFile == 'main.js') {
      //pkg.main = path.join(this.electronDir, mainFile);
      pkg.main =this.electronDir + '/' + mainFile;
      writeJsonSync(pkgPath, pkg);
    } else {
      // only load main.js file
      // const bundleMainPath = path.join(this.bundleDir, 'main.js');
      const bundleMainPath = this.bundleDir + '/' + 'main.js';

      // Modify when the path is incorrect to reduce unnecessary operations
      if (pkg.main != bundleMainPath) {
        pkg.main = bundleMainPath;
        writeJsonSync(pkgPath, pkg);
      }
    }
  }
  
  // env
  isDev() {
    return process.env.NODE_ENV === 'dev';
  }
}

module.exports = {
  ServeProcess,
  serveProcess: new ServeProcess()
}
