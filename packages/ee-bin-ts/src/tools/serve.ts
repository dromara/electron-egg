import debug from 'debug';
import path from 'path';
import fsPro from 'fs-extra';
import is from 'is-type-of';
import chalk from 'chalk';
import crossSpawn from 'cross-spawn';
import { buildSync, BuildOptions } from 'esbuild';
import chokidar from 'chokidar';
import kill from 'tree-kill';
import process from 'process';
import { loadConfig, getArgumentByName, readJsonSync, writeJsonSync } from '../lib/utils.js';

const log = debug('ee-bin:serve');

interface ExecConfig {
  directory: string;
  cmd: string;
  args?: string[] | string;
  stdio?: string;
  sync?: boolean;
  protocol?: string;
  watch?: boolean;
  delay?: number;
  [key: string]: unknown;
}

interface ServeOptions {
  config?: string;
  serve?: string;
  cmds?: string;
  env?: string;
}

class ServeProcess {
  execProcess: Record<string, ReturnType<typeof crossSpawn>>;
  electronDir: string;
  bundleDir: string;
  pkgPath: string;

  constructor() {
    process.env.NODE_ENV = 'prod';
    this.execProcess = {};
    this.electronDir = './electron';
    this.bundleDir = './public/electron';
    this.pkgPath = './package.json';
    this._init();
  }

  _init(): void {
    process.on('SIGINT', () => {
      console.log(chalk.blue('[ee-bin] ') + 'Received SIGINT. Closing processes...');
      this._closeProcess();
    });

    process.on('SIGTERM', () => {
      console.log(chalk.blue('[ee-bin] ') + 'Received SIGTERM. Closing processes...');
      this._closeProcess();
    });
  }

  async _closeProcess(): Promise<void> {
    const currentProcess: Array<{ name: string; pid: number }> = [];
    const keys = Object.keys(this.execProcess);
    for (const key of keys) {
      const p = this.execProcess[key];
      if (p && p.pid) {
        currentProcess.push({ name: key, pid: p.pid });
      }
    }

    await this.sleep(500);
    for (const p of currentProcess) {
      kill(p.pid);
      log('Kill %s server, pid: %d', chalk.blue(p.name), p.pid);
    }
    process.exit(0);
  }

  dev(options: ServeOptions = {}): void {
    process.env.NODE_ENV = 'dev';
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'dev';
    const binCmdConfig = (binCfg[binCmd] || {}) as Record<string, ExecConfig>;

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join(',');
    }
    const opt = {
      binCmd,
      binCmdConfig,
      command: command || '',
    };

    const cmds = this._formatCmds(command || '');
    if (cmds.indexOf('electron') !== -1) {
      const electronConfig = binCmdConfig.electron;

      const debugging = getArgumentByName('debuger', Array.isArray(electronConfig?.args) ? electronConfig.args : undefined) === 'true';
      this._switchPkgMain(debugging);

      if (electronConfig?.watch) {
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const cmd = 'electron';
        const watcher = chokidar.watch([this.electronDir], { persistent: true });
        watcher.on('change', async (f: string) => {
          console.log(chalk.blue('[ee-bin] [dev] ') + `File [${chalk.cyan(f)}] has been changed`);

          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            console.log(chalk.blue('[ee-bin] [dev] ') + `Restart ${cmd}`);
            this.bundle((binCfg.build || {}) as Record<string, unknown>);
            const subProcess = this.execProcess[cmd];
            if (subProcess && subProcess.pid) {
              kill(subProcess.pid, 'SIGKILL', (err) => {
                if (err) {
                  console.log(chalk.red('[ee-bin] [dev] ') + `Restart failed, error: ${err}`);
                  process.exit(-1);
                }
                delete this.execProcess[cmd];

                const onlyElectronOpt = {
                  binCmd,
                  binCmdConfig,
                  command: cmd,
                };
                this.multiExec(onlyElectronOpt);
              });
            }
          }, electronConfig.delay || 1000);
        });
      }

      this.bundle((binCfg.build || {}) as Record<string, unknown>);
    }

    this.multiExec(opt);
  }

  start(options: ServeOptions = {}): void {
    const { config } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'start';
    const binCmdConfig = {
      start: binCfg[binCmd] as ExecConfig,
    };

    const opt = {
      binCmd,
      binCmdConfig,
      command: binCmd,
    };
    this.multiExec(opt);
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  build(options: ServeOptions = {}): void {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env || 'prod';
    const binCfg = loadConfig(config);
    const binCmd = 'build';
    const binCmdConfig = (binCfg[binCmd] || {}) as Record<string, ExecConfig>;

    if (!cmds || cmds === '') {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return;
    }

    const commands = this._formatCmds(cmds);
    if (commands.indexOf('electron') !== -1) {
      this.bundle((binCfg.build || {}) as Record<string, unknown>);
      const index = commands.indexOf('electron');
      commands.splice(index, 1);
      cmds = commands.join(',');

      this._switchPkgMain(false);
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds || '',
    };
    this.multiExec(opt);
  }

  exec(options: ServeOptions = {}): void {
    const { config, cmds } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'exec';
    const binCmdConfig = (binCfg[binCmd] || {}) as Record<string, ExecConfig>;

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds || '',
    };
    this.multiExec(opt);
  }

  multiExec(opt: { binCmd: string; binCmdConfig: Record<string, ExecConfig>; command: string }): void {
    const { binCmd, binCmdConfig, command } = opt;
    const commands = this._formatCmds(command || '');

    for (const cmd of commands) {
      const cfg = binCmdConfig[cmd];

      if (!cfg) {
        continue;
      }

      if (binCmd === 'dev' && cmd === 'frontend' && cfg.protocol === 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk.green(cmd)} command`);
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.magenta('Config:'), JSON.stringify(cfg));

      const execDir = path.join(process.cwd(), cfg.directory);
      const execArgs = is.string(cfg.args) ? [cfg.args] : (cfg.args || []);
      const stdioOpt = cfg.stdio ? cfg.stdio : 'inherit';

      if (cfg.sync) {
        this.execProcess[cmd] = (crossSpawn as unknown as { sync: (command: string, args?: string[], options?: { stdio?: string; cwd?: string; maxBuffer?: number }) => { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number } }).sync(cfg.cmd, execArgs as string[], {
          stdio: stdioOpt,
          cwd: execDir,
          maxBuffer: 1024 * 1024 * 1024,
        }) as unknown as ReturnType<typeof crossSpawn>;
      } else {
        this.execProcess[cmd] = crossSpawn(cfg.cmd, execArgs as string[], {
          stdio: stdioOpt as 'inherit' | 'pipe' | 'ignore',
          cwd: execDir,
          maxBuffer: 1024 * 1024 * 1024,
        });
      }

      console.log(
        chalk.blue(`[ee-bin] [${binCmd}] `) +
          'The ' +
          chalk.green(`${cmd}`) +
          ` command is ${cfg.sync ? 'run completed' : 'running'}`
      );

      if (!cfg.sync) {
        this.execProcess[cmd].on('exit', () => {
          if (binCmd === 'dev') {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} process is exiting`);
            if (this.isWindows() && cmd === 'electron') {
              console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.green('Press "CTRL+C" to exit'));
            }
            return;
          }
          console.log(
            chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} command has been executed and exited`
          );
        });
      }
    }
  }

  bundle(bundleConfig?: Record<string, unknown>): void {
    if (!bundleConfig) return;
    const bundleType = bundleConfig.bundleType as string | undefined;
    if (bundleType === 'copy') {
      const srcResource = path.join(process.cwd(), this.electronDir);
      const destResource = path.join(process.cwd(), this.bundleDir);
      fsPro.removeSync(destResource);
      fsPro.copySync(srcResource, destResource);
    } else {
      const type = (bundleConfig.type as string) || 'javascript';
      const esbuildOptions = bundleConfig[type] as Record<string, unknown> | undefined;
      if (esbuildOptions) {
        log('esbuild options:%O', esbuildOptions);
        buildSync(esbuildOptions as BuildOptions);
      }
    }
  }

  _formatCmds(command: string): string[] {
    const cmdString = command.trim();
    if (cmdString.indexOf(',') !== -1) {
      return cmdString.split(',');
    }
    return [cmdString];
  }

  _switchPkgMain(isDebugger = false): void {
    let mainFile = 'main.js';
    const pkgPath = path.join(process.cwd(), this.pkgPath);
    const pkg = readJsonSync(pkgPath);
    const maints = path.join(process.cwd(), this.electronDir, 'main.ts');
    if (fsPro.existsSync(maints)) {
      mainFile = 'main.ts';
    }

    if (isDebugger && mainFile === 'main.js') {
      (pkg as Record<string, unknown>).main = this.electronDir + '/' + mainFile;
      writeJsonSync(pkgPath, pkg);
    } else {
      const bundleMainPath = this.bundleDir + '/' + 'main.js';

      if (pkg.main !== bundleMainPath) {
        (pkg as Record<string, unknown>).main = bundleMainPath;
        writeJsonSync(pkgPath, pkg);
      }
    }
  }

  isDev(): boolean {
    return process.env.NODE_ENV === 'dev';
  }

  isWindows(): boolean {
    return process.platform === 'win32';
  }
}

export const serveProcess = new ServeProcess();
export { ServeProcess };
