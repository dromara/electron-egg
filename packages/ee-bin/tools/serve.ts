

import debug from 'debug';
import path from 'path';
import fsPro from 'fs-extra';
import { loadConfig, isWindows, getArgumentByName, readJsonSync, writeJsonSync } from '../lib/utils';
import is from 'is-type-of';
import chalk from 'chalk';
import crossSpawn from 'cross-spawn';
import { buildSync } from 'esbuild';
import chokidar from 'chokidar';
import kill from 'tree-kill';
import process from "process";

const debugLog = debug('ee-bin:serve');

interface ServeOptions {
  config?: string;
  serve?: string;
  cmds?: string;
  env?: string;
}

interface BinCmdConfig {
  [key: string]: {
    directory: string;
    cmd: string;
    args: string | string[];
    protocol?: string;
    hostname?: string;
    port?: number;
    indexPath?: string;
    force?: boolean;
    sync?: boolean;
    loadingPage?: string;
    watch?: boolean;
    delay?: number;
    stdio?: string;
  };
}

interface BuildConfig {
  electron: {
    type: string;
    bundler: string;
    bundleType: string;
    javascript: any;
    typescript: any;
  };
}

interface MultiExecOptions {
  binCmd: string;
  binCmdConfig: BinCmdConfig;
  command: string;
}

class ServeProcess {
  private execProcess: Record<string, any>;
  private electronDir: string;
  private bundleDir: string;
  private pkgPath: string;

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
  private _init(): void {
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
  private async _closeProcess(): Promise<void> {
    const currentProcess: Array<{ name: string; pid: number }> = [];
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
      debugLog(`Kill ${chalk.blue(p.name)} server, pid: ${p.pid}`);
    });
    process.exit(0);
  }

  /**
   * Start frontend and main process services
   */
  dev(options: ServeOptions = {}): void {
    // Set an environment variable
    process.env.NODE_ENV = 'dev';
    const { config, serve } = options;
    const binCfg = loadConfig(config) as any;
    const binCmd = 'dev';
    const binCmdConfig = binCfg[binCmd] as BinCmdConfig;

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join();
    }
    const opt: MultiExecOptions = {
      binCmd,
      binCmdConfig,
      command,
    };

    // build electron main code 
    const cmds = this._formatCmds(command);
    if (cmds.indexOf("electron") !== -1) {
      const electronConfig = binCmdConfig.electron;

      // Debugging source code
      const args = typeof electronConfig.args === 'string' ? [electronConfig.args] : electronConfig.args;
      const debugging = getArgumentByName('debuger', args) === 'true' ? true : false;
      this._switchPkgMain(debugging);

      // watche electron main code
      if (electronConfig.watch) {
        let debounceTimer: NodeJS.Timeout | null = null;
        const cmd = 'electron';
        const watcher = chokidar.watch([this.electronDir], {
          persistent: true
        });
        watcher.on('change', async (f) => {
          console.log(chalk.blue('[ee-bin] [dev] ') + `File [${chalk.cyan(f)}] has been changed`);

          // 防抖
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            // rebuild code
            console.log(chalk.blue('[ee-bin] [dev] ') + `Restart ${cmd}`);
            this.bundle(binCfg.build.electron);
            const subPorcess = this.execProcess[cmd];
            kill(subPorcess.pid, 'SIGKILL', (err) => {
              if (err) {
                console.log(chalk.red('[ee-bin] [dev] ') + `Restart failed, error: ${err}`);
                process.exit(-1);
              }
              delete this.execProcess[cmd];

              // restart electron command
              const onlyElectronOpt: MultiExecOptions = {
                binCmd,
                binCmdConfig,
                command: cmd,
              };
              this.multiExec(onlyElectronOpt);
            });
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
  start(options: ServeOptions = {}): void {
    const { config } = options;
    const binCfg = loadConfig(config) as any;
    const binCmd = 'start';
    const binCmdConfig: BinCmdConfig = {
      start: binCfg[binCmd]
    };

    const opt: MultiExecOptions = {
      binCmd,
      binCmdConfig,
      command: binCmd,
    };
    this.multiExec(opt);
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * build
   */
  build(options: ServeOptions = {}): void {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env;
    const binCfg = loadConfig(config) as any;
    const binCmd = 'build';
    const binCmdConfig = binCfg[binCmd];

    if (!cmds || cmds === "") {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return;
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
      this._switchPkgMain(false);
    }

    const opt: MultiExecOptions = {
      binCmd,
      binCmdConfig,
      command: cmds || '',
    };
    this.multiExec(opt);
  }

  /**
   * Execute custom commands
   */
  exec(options: ServeOptions = {}): void {
    const { config, cmds } = options;
    const binCfg = loadConfig(config) as any;
    const binCmd = 'exec';
    const binCmdConfig = binCfg[binCmd];

    const opt: MultiExecOptions = {
      binCmd,
      binCmdConfig,
      command: cmds || '',
    };
    this.multiExec(opt);
  }

  /**
   * Support multiple commands
   */
  multiExec(opt: MultiExecOptions): void {
    const { binCmd, binCmdConfig, command } = opt;
    const commands = this._formatCmds(command);

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const cfg = binCmdConfig[cmd];

      if (!cfg) {
        // Running the build electron code separately may be empty
        continue;
      }

      // frontend 如果是 file:// 协议，则不启动
      if (binCmd === 'dev' && cmd === 'frontend' && cfg.protocol === 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk.green(cmd)} command`);
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.magenta('Config:'), JSON.stringify(cfg));

      const execDir = path.join(process.cwd(), cfg.directory);
      let execArgs: string[] = [];
      if (typeof cfg.args === 'string') {
        execArgs = [cfg.args];
      } else if (Array.isArray(cfg.args)) {
        // Flatten array if it's an array of arrays
        execArgs = cfg.args.flat();
      }
      const stdio = cfg.stdio ? cfg.stdio : 'inherit';

      const handler = cfg.sync ? crossSpawn.sync : crossSpawn;

      this.execProcess[cmd] = handler(
        cfg.cmd,
        execArgs,
        { stdio: stdio, cwd: execDir, maxBuffer: 1024 * 1024 * 1024 } as any,
      );
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk.green(`${cmd}`) + ` command is ${cfg.sync ? 'run completed' : 'running'}`);

      if (!cfg.sync) {
        this.execProcess[cmd].on('exit', () => {
          if (binCmd === 'dev') {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} process is exiting`);
            if (isWindows() && cmd === 'electron') {
              console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('Press "CTRL+C" to exit'));
            }
            return;
          }
          console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} command has been executed and exited`);
        });
      }
    }
  }
  
  // esbuild
  bundle(bundleConfig: any): void {
    const { bundleType } = bundleConfig;
    if (bundleType === 'copy') {
      const srcResource = path.join(process.cwd(), this.electronDir);
      const destResource = path.join(process.cwd(), this.bundleDir);
      fsPro.removeSync(destResource);
      fsPro.copySync(srcResource, destResource);
    } else {
      const esbuildOptions = bundleConfig[bundleConfig.type];
      debugLog('esbuild options:%O', esbuildOptions);
      buildSync(esbuildOptions);
    }
  }

  // format commands
  private _formatCmds(command: string): string[] {
    let cmds: string[];
    const cmdString = command.trim();
    if (cmdString.indexOf(',') !== -1) {
      cmds = cmdString.split(',');
    } else {
      cmds = [cmdString];
    }

    return cmds;
  }

  // Modify the main attribute in package.json
  private _switchPkgMain(isDebugger: boolean = false): void {
    let mainFile = 'main.js';
    const pkgPath = path.join(process.cwd(), this.pkgPath);
    const pkg = readJsonSync(pkgPath);
    const maints = path.join(process.cwd(), this.electronDir, 'main.ts');
    if (fsPro.existsSync(maints)) {
      mainFile = 'main.ts';
    }

    // [todo] Currently only supports JS
    // [todo] Do not use path. join() to ensure consistent performance between Windows and macOS
    if (isDebugger && mainFile === 'main.js') {
      pkg.main = this.electronDir + '/' + mainFile;
      writeJsonSync(pkgPath, pkg);
    } else {
      // only load main.js file
      const bundleMainPath = this.bundleDir + '/' + 'main.js';

      // Modify when the path is incorrect to reduce unnecessary operations
      if (pkg.main !== bundleMainPath) {
        pkg.main = bundleMainPath;
        writeJsonSync(pkgPath, pkg);
      }
    }
  }
  
  // env
  isDev(): boolean {
    return process.env.NODE_ENV === 'dev';
  }
}

const serveProcess = new ServeProcess();

export {
  ServeProcess,
  serveProcess
};