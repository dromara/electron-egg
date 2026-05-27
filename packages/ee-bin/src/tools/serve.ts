import { createDebug, chalk, copyDirSync, formatCmds } from '../lib/helpers.js';
import path from 'path';
import fs from 'fs';
import { build, BuildOptions } from 'esbuild';
import chokidar from 'chokidar';
import kill from 'tree-kill';
import process from 'process';
import crossSpawn, { sync as crossSpawnSync } from 'cross-spawn';
import { loadConfig, getArgumentByName, readJsonSync, writeJsonSync, rm, toArray } from '../lib/utils.js';
import type { ExecConfig, BundleConfig } from '../types/config.js';
import { controllerRegistryPlugin } from '../plugins/controller_registry_plugin.js';
import { esbuildPluginPino } from 'esbuild-plugin-pino';

const log = createDebug('ee-bin:serve');

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

  async dev(options: ServeOptions = {}): Promise<void> {
    process.env.NODE_ENV = 'dev';
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'dev';
    const binCmdConfig = binCfg.dev;

    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join(',');
    }
    const opt = {
      binCmd,
      binCmdConfig,
      command: command || '',
    };

    const cmds = formatCmds(command || '');
    if (cmds.indexOf('electron') !== -1) {
      const electronConfig = binCmdConfig.electron;

      const debugging = getArgumentByName('debuger', toArray(electronConfig?.args)) === 'true';

      // In dev mode with debugging, use copy mode for fast iteration
      if (debugging) {
        const copyConfig = { ...binCfg.build.electron, bundleType: 'copy' as const };
        await this.bundle(copyConfig);
      } else {
        await this.bundle(binCfg.build.electron);
      }

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
            if (debugging) {
              const copyConfig = { ...binCfg.build.electron, bundleType: 'copy' as const };
              await this.bundle(copyConfig);
            } else {
              await this.bundle(binCfg.build.electron);
            }
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
          }, electronConfig.delay);
        });
      }
    }

    this.multiExec(opt);
  }

  async start(options: ServeOptions = {}): Promise<void> {
    process.env.NODE_ENV = 'prod';
    const { config } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'start';
    const binCmdConfig = {
      start: binCfg.start,
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

  async build(options: ServeOptions = {}): Promise<void> {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env || 'prod';
    const binCfg = loadConfig(config);
    const binCmd = 'build';
    // build.electron is BundleConfig, other entries are ExecConfig;
    // 'electron' is always removed from commands before multiExec, so this cast is safe
    const binCmdConfig = binCfg.build as Record<string, ExecConfig>;

    if (!cmds || cmds === '') {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return;
    }

    const commands = formatCmds(cmds);
    if (commands.indexOf('electron') !== -1) {
      await this.bundle(binCfg.build.electron);
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
    const binCmdConfig = binCfg.exec;

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds || '',
    };
    this.multiExec(opt);
  }

  multiExec(opt: { binCmd: string; binCmdConfig: Record<string, ExecConfig>; command: string }): void {
    const { binCmd, binCmdConfig, command } = opt;
    const commands = formatCmds(command || '');

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
      const execArgs = toArray(cfg.args);
      const stdioOpt: 'inherit' | 'pipe' | 'ignore' = cfg.stdio || 'inherit';

      if (cfg.sync) {
        this.execProcess[cmd] = crossSpawnSync(cfg.cmd, execArgs, {
          stdio: stdioOpt,
          cwd: execDir,
          maxBuffer: 1024 * 1024 * 1024,
        }) as unknown as ReturnType<typeof crossSpawn>;
      } else {
        this.execProcess[cmd] = crossSpawn(cfg.cmd, execArgs, {
          stdio: stdioOpt,
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
            if (process.platform === 'win32' && cmd === 'electron') {
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

  async bundle(bundleConfig?: BundleConfig): Promise<void> {
    if (!bundleConfig) return;
    const bundleType = bundleConfig.bundleType;
    if (bundleType === 'copy') {
      const srcResource = path.join(process.cwd(), this.electronDir);
      const destResource = path.join(process.cwd(), this.bundleDir);
      rm(destResource);
      copyDirSync(srcResource, destResource);
    } else {
      await this._bundleWithRegistry(bundleConfig);
    }
  }

  async _bundleWithRegistry(bundleConfig: BundleConfig): Promise<void> {
    const cwd = process.cwd();
    const controllerDir = path.join(cwd, this.electronDir, 'controller');
    const mainJsPath = path.join(cwd, this.electronDir, 'main.js');
    const mainTsPath = path.join(cwd, this.electronDir, 'main.ts');
    const isTypeScript = fs.existsSync(mainTsPath);
    const entryMain = isTypeScript ? mainTsPath : mainJsPath;
    const outdir = path.join(cwd, this.bundleDir);
    const outfile = path.join(outdir, 'main.js');

    // Auto-detect output format: js → CJS, ts → ESM
    const format: 'cjs' | 'esm' = isTypeScript ? 'esm' : 'cjs';

    // Sourcemap: false = auto by environment (dev→inline, prod→off)
    // Developer can override: 'inline' | 'external' | true(=inline)
    const isDev = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local';
    let sourcemap: boolean | 'inline';
    if (bundleConfig.sourcemap === 'inline' || bundleConfig.sourcemap === true) {
      sourcemap = 'inline';
    } else if (bundleConfig.sourcemap === 'external') {
      sourcemap = true;
    } else {
      // false or undefined: auto by environment
      sourcemap = isDev ? 'inline' : false;
    }

    // Clean output directory
    rm(outdir);

    // Framework-internal externals: packages that ee-core depends on but cannot be bundled
    // (native modules, worker-thread transports, Electron runtime)
    const frameworkExternal = [
      'electron',
      'better-sqlite3',
      'proxy-agent',
      'pino-roll',
      'pino-pretty',
    ];

    // Developer-provided externals: packages the app uses that cannot be bundled
    const userExternal = (bundleConfig.external as string[]) || [];

    const plugin = controllerRegistryPlugin(controllerDir, entryMain);
    const pinoPlugin = esbuildPluginPino({ transports: ['pino-roll', 'pino-pretty'] });

    const options: BuildOptions = {
      entryPoints: ['ee-core:bundle-entry'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outdir,
      external: [
        ...frameworkExternal,
        ...userExternal,
      ],
      format,
      minify: false,
      sourcemap,
      plugins: [pinoPlugin, plugin],
      define: {
        'process.env.EE_BUNDLED': "'true'",
      },
      logLevel: 'info',
    };

    log('_bundleWithRegistry options:%O', options);
    await build(options);

    // Rename the main entry file to main.js (esbuild-plugin-pino generates it with the virtual module name)
    const bundleEntryFile = path.join(outdir, 'ee-core:bundle-entry.js');
    if (fs.existsSync(bundleEntryFile)) {
      fs.renameSync(bundleEntryFile, path.join(outdir, 'main.js'));
    }

    // Rename the sourcemap file if it exists (external sourcemap mode)
    const bundleEntryMap = path.join(outdir, 'ee-core:bundle-entry.js.map');
    if (fs.existsSync(bundleEntryMap)) {
      fs.renameSync(bundleEntryMap, path.join(outdir, 'main.js.map'));
    }

    // Copy directories that must remain as separate files
    const copyTargets = ['config', 'jobs'];
    for (const copyTarget of copyTargets) {
      const src = path.join(cwd, this.electronDir, copyTarget);
      const dest = path.join(outdir, copyTarget);
      if (fs.existsSync(src)) {
        copyDirSync(src, dest);
      }
    }

    // Copy preload/bridge.js (BrowserWindow preload script must be a separate file)
    const bridgeSrc = path.join(cwd, this.electronDir, 'preload', 'bridge.js');
    const bridgeDest = path.join(outdir, 'preload', 'bridge.js');
    if (fs.existsSync(bridgeSrc)) {
      const bridgeDestDir = path.dirname(bridgeDest);
      if (!fs.existsSync(bridgeDestDir)) {
        fs.mkdirSync(bridgeDestDir, { recursive: true });
      }
      fs.copyFileSync(bridgeSrc, bridgeDest);
    }

    console.log(chalk.blue('[ee-bin] ') + `Bundle output: ${outfile}`);
  }

  _switchPkgMain(isDebugger = false): void {
    const pkgPath = path.join(process.cwd(), this.pkgPath);
    const pkg = readJsonSync(pkgPath);
    const maints = path.join(process.cwd(), this.electronDir, 'main.ts');
    const mainFile = fs.existsSync(maints) ? 'main.ts' : 'main.js';

    if (isDebugger && mainFile === 'main.js') {
      pkg.main = this.electronDir + '/' + mainFile;
      writeJsonSync(pkgPath, pkg);
    } else {
      // Bundle mode produces main.js
      const bundleMainPath = this.bundleDir + '/main.js';

      if (pkg.main !== bundleMainPath) {
        pkg.main = bundleMainPath;
        writeJsonSync(pkgPath, pkg);
      }
    }
  }

  }

export const serveProcess = new ServeProcess();
export { ServeProcess };