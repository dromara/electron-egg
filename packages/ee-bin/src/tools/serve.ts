/**
 * 开发/构建/启动管理器 — ee-bin 的核心调度器
 *
 * ServeProcess 类管理 dev/build/start/exec 全流程，是 ee-bin CLI 最复杂的模块。
 * 核心职责：
 *   1. dev  — 启动前端开发服务器 + Electron 进程，可选 watch 模式自动重建
 *   2. build — 打包 Electron 代码 + 执行 electron-builder 各平台构建命令
 *   3. start — 以生产模式启动 Electron
 *   4. exec  — 执行用户自定义命令
 *
 * 进程管理策略：
 *   - execProcess 仅跟踪异步 ChildProcess（同步执行的结果不存入，因为进程已结束无需管理）
 *   - SIGINT/SIGTERM 信号时关闭所有子进程并恢复 package.json main 字段
 *   - watch 模式下用 debounce 防抖 + tree-kill 终止旧 Electron 进程再重新启动
 *
 * 打包策略：
 *   - bundle 模式：esbuild 打包为单文件 + 虚拟注册表插件
 *   - copy 模式：直接复制整个 electron/ 目录（适用于不打包的场景）
 *   - 打包后切换 package.json main 字段指向 ./public/electron/main.js
 */

import { createDebug, chalk, copyDirSync, formatCmds } from '../lib/helpers.js';
import path from 'path';
import fs from 'fs';
import { build, BuildOptions } from 'esbuild';
import chokidar from 'chokidar';
import kill from 'tree-kill';
import { ChildProcess } from 'child_process';
import process from 'process';
import crossSpawn, { sync as crossSpawnSync } from 'cross-spawn';
import { loadConfig, readJsonSync, writeJsonSync, rm, toArray } from '../lib/utils.js';
import type { ExecConfig, BundleConfig } from '../types/config.js';
import { bundleRegistryPlugin } from '../plugins/bundle_registry_plugin.js';

const log = createDebug('ee-bin:serve');
/** 子进程最大缓冲区大小（1GB），防止大输出量的构建命令被截断 */
const MAX_BUFFER = 1024 * 1024 * 1024;
const ELECTRON_DIR = './electron';
const BUNDLE_DIR = './public/electron';
const PKG_PATH = './package.json';

/** ServeProcess 方法通用选项 — 对应 Commander CLI 参数 */
interface ServeOptions {
  config?: string;
  serve?: string;
  cmds?: string;
  env?: string;
}

class ServeProcess {
  /** 异步子进程引用表（仅存异步 ChildProcess，同步进程执行完毕无需跟踪） */
  execProcess: Record<string, ChildProcess>;
  /** package.json main 字段的原始值（用于 _restorePkgMain 恢复） */
  private originalPkgMain: string | undefined;

  constructor() {
    this.execProcess = {};
    this.originalPkgMain = undefined;
    this._init();
  }

  /** 注册 SIGINT/SIGTERM 信号处理器，确保退出时关闭子进程并恢复配置 */
  private _init(): void {
    process.on('SIGINT', () => {
      console.log(chalk.blue('[ee-bin] ') + 'Received SIGINT. Closing processes...');
      this._closeProcess();
    });

    process.on('SIGTERM', () => {
      console.log(chalk.blue('[ee-bin] ') + 'Received SIGTERM. Closing processes...');
      this._closeProcess();
    });
  }

  /**
   * 关闭所有子进程并恢复 package.json，然后退出
   *
   * 流程：kill 所有子进程 → 恢复 pkgMain → sleep 500ms → process.exit(0)
   * NOTE: 500ms sleep 是折中方案。理想做法是监听每个子进程的 exit 事件再退出，
   * 但实现复杂度高（多子进程竞争、嵌套进程等）。若子进程关闭超时可能被遗弃。
   */
  private async _closeProcess(): Promise<void> {
    const keys = Object.keys(this.execProcess);
    for (const key of keys) {
      const p = this.execProcess[key];
      if (p && p.pid) {
        kill(p.pid);
        log('Kill %s server, pid: %d', chalk.blue(key), p.pid);
      }
    }

    this._restorePkgMain();

    await this.sleep(500);
    process.exit(0);
  }

  /**
   * 开发模式 — 启动前端开发服务器 + Electron 进程
   *
   * 完整流程：
   *   1. 设置 NODE_ENV=dev
   *   2. 加载配置，解析要启动的命令名
   *   3. 若包含 electron 命令：
   *      a. 先打包 Electron 代码（bundle）
   *      b. 切换 package.json main 字段
   *      c. 若 electron.watch=true，监听 electron/ 目录变化
   *         → 变化时 debounce → 重新 bundle → kill 旧进程 → 重新 spawn
   *   4. multiExec 启动所有命令（前端 + Electron）
   */
  async dev(options: ServeOptions = {}): Promise<void> {
    process.env.NODE_ENV = 'dev';
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'dev';
    const binCmdConfig = binCfg.dev;

    // 未指定命令时默认启动所有 dev 配置中的命令
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
    if (cmds.includes('electron')) {
      const electronConfig = binCmdConfig.electron;

      // Electron 进程需要打包后的代码，所以先 bundle 再启动
      await this.bundle(binCfg.build.electron);
      this._switchPkgMain();

      // watch 模式：监听 electron 目录变化，自动重建+重启
      if (electronConfig?.watch) {
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const cmd = 'electron';
        const watcher = chokidar.watch([ELECTRON_DIR], { persistent: true });
        watcher.on('change', async (f: string) => {
          console.log(chalk.blue('[ee-bin] [dev] ') + `File [${chalk.cyan(f)}] has been changed`);

          // debounce 防抖：短时间内多次文件变动只触发一次重建
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            console.log(chalk.blue('[ee-bin] [dev] ') + `Restart ${cmd}`);
            await this.bundle(binCfg.build.electron);
            const subProcess = this.execProcess[cmd];
            if (subProcess && subProcess.pid) {
              // kill 旧 Electron 进程（SIGKILL 强制终止），成功后重新 spawn
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

  /**
   * 生产模式启动 — 直接运行 Electron 进程（不做打包）
   * 前提：项目已通过 build 命令完成打包
   */
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 构建模式 — 打包 Electron 代码 + 执行各平台构建命令
   *
   * 完整流程：
   *   1. 设置 NODE_ENV=prod（或用户指定环境）
   *   2. 若 cmds 包含 'electron'：先打包 → 从命令列表移除 electron → 切换 pkgMain
   *   3. multiExec 执行剩余命令（如 frontend、win64、mac 等）
   *   4. 构建完成后恢复 package.json main 字段
   *
   * electron 命令仅触发打包，不启动 Electron 进程，
   * 所以从命令列表中移除后不再由 multiExec 处理
   */
  async build(options: ServeOptions = {}): Promise<void> {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env || 'prod';
    const binCfg = loadConfig(config);
    const binCmd = 'build';
    // build.electron 是 BundleConfig，其他键是 ExecConfig；
    // electron 总是从 commands 移除后再传入 multiExec，所以这个 cast 安全
    const binCmdConfig = binCfg.build as Record<string, ExecConfig>;

    if (!cmds || cmds === '') {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return;
    }

    const commands = formatCmds(cmds);
    if (commands.includes('electron')) {
      await this.bundle(binCfg.build.electron);
      const index = commands.indexOf('electron');
      commands.splice(index, 1);
      cmds = commands.join(',');

      this._switchPkgMain();
    }

    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds || '',
    };
    this.multiExec(opt);
    // 构建完成后恢复 package.json（dev 模式在 SIGINT/SIGTERM 时恢复）
    this._restorePkgMain();
  }

  /** 执行用户自定义命令 */
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

  /**
   * 执行多个命令 — 遍历命令列表，为每个命令启动子进程
   *
   * 设计要点：
   *   - 前端 file:// 协议在 dev 模式下跳过（前端已通过 HTTP 服务提供，不需要单独启动）
   *   - sync 模式使用 crossSpawnSync 同步执行，结果不存入 execProcess（进程已结束）
   *   - async 模式使用 crossSpawn 异步启动，存入 execProcess 便于后续 kill
   *   - async 进程监听 exit 事件，dev 模式下输出退出提示
   */
  multiExec(opt: { binCmd: string; binCmdConfig: Record<string, ExecConfig>; command: string }): void {
    const { binCmd, binCmdConfig, command } = opt;
    const commands = formatCmds(command || '');

    for (const cmd of commands) {
      const cfg = binCmdConfig[cmd];

      if (!cfg) {
        continue;
      }

      // dev 模式下，前端配置 protocol='file://' 时跳过启动
      // （前端文件已通过 HTTP 服务器提供，无需额外 file:// 进程）
      if (binCmd === 'dev' && cmd === 'frontend' && cfg.protocol === 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk.green(cmd)} command`);
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.magenta('Config:'), JSON.stringify(cfg));

      const execDir = path.join(process.cwd(), cfg.directory);
      const execArgs = toArray(cfg.args);
      const stdioOpt: 'inherit' | 'pipe' | 'ignore' = cfg.stdio || 'inherit';

      if (cfg.sync) {
        // 同步执行：阻塞直到命令完成，不需要跟踪进程
        crossSpawnSync(cfg.cmd, execArgs, {
          stdio: stdioOpt,
          cwd: execDir,
          maxBuffer: MAX_BUFFER,
        });
      } else {
        // 异步执行：启动子进程并跟踪，便于 SIGINT/SIGTERM 时 kill
        const childProc = crossSpawn(cfg.cmd, execArgs, {
          stdio: stdioOpt,
          cwd: execDir,
          maxBuffer: MAX_BUFFER,
        });
        this.execProcess[cmd] = childProc;

        childProc.on('exit', () => {
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

      console.log(
        chalk.blue(`[ee-bin] [${binCmd}] `) +
          'The ' +
          chalk.green(`${cmd}`) +
          ` command is ${cfg.sync ? 'run completed' : 'running'}`
      );
    }
  }

  /**
   * 打包 Electron 主进程代码
   *
   * 两种模式：
   *   - 'bundle': 使用 esbuild + bundleRegistryPlugin 打包为单文件
   *   - 'copy':   直接复制整个 electron/ 目录到 public/electron/
   *
   * 打包前会清空输出目录（rm outdir），确保每次构建结果干净
   */
  async bundle(bundleConfig?: BundleConfig): Promise<void> {
    if (!bundleConfig) return;
    const cwd = process.cwd();
    const outdir = path.join(cwd, BUNDLE_DIR);

    rm(outdir);

    if (bundleConfig.bundleType === 'copy') {
      copyDirSync(path.join(cwd, ELECTRON_DIR), outdir);
    } else {
      await this._bundleWithRegistry(bundleConfig);
    }
  }

  /**
   * 使用 esbuild + 注册表插件打包 Electron 代码
   *
   * esbuild 配置策略：
   *   - entryPoints: 虚拟模块 'app:bundle-entry'（由插件生成）
   *   - format: 默认 cjs（推荐 Electron），可选 esm
   *   - sourcemap: 自动推断（dev→inline, prod→off），可用户覆盖
   *   - external: 框架 external（ee-core/electron/better-sqlite3 等）+ 用户自定义
   *   - banner: 注入 process.env.EE_BUNDLED = "true"，让 ee-core 检测打包模式
   *   - packages: 'external' 让 esbuild 自动排除所有 node_modules 包
   *
   * 打包后还需：
   *   1. 重命名输出文件（app_bundle-entry.js → main.js）
   *   2. 复制不可打包的文件（jobs 目录、preload/bridge.js、用户自定义 copy）
   */
  private async _bundleWithRegistry(bundleConfig: BundleConfig): Promise<void> {
    const cwd = process.cwd();
    const controllerDir = path.join(cwd, ELECTRON_DIR, 'controller');
    const configDir = path.join(cwd, ELECTRON_DIR, 'config');
    const mainJsPath = path.join(cwd, ELECTRON_DIR, 'main.js');
    const mainTsPath = path.join(cwd, ELECTRON_DIR, 'main.ts');
    // 检测是否为 TypeScript 入口（影响 esbuild 解析和输出格式推断）
    const isTypeScript = fs.existsSync(mainTsPath);
    const entryMain = isTypeScript ? mainTsPath : mainJsPath;
    const outdir = path.join(cwd, BUNDLE_DIR);
    const outfile = path.join(outdir, 'main.js');

    const format: 'cjs' | 'esm' = bundleConfig.format || 'cjs';

    const isDev = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local';
    let sourcemap: boolean | 'inline';
    if (bundleConfig.sourcemap === 'inline' || bundleConfig.sourcemap === true) {
      sourcemap = 'inline';
    } else if (bundleConfig.sourcemap === 'external') {
      sourcemap = true;
    } else {
      sourcemap = isDev ? 'inline' : false;
    }

    // 框架 internal external：这些包必须从 node_modules 加载而非打包进 main.js
    // 原因：ee-core 是 child_process.fork() 入口点需要独立文件；electron/better-sqlite3
    // 是 native 模块；pino-roll/pino-pretty 需要 fs 操作在打包后不可用
    const frameworkExternal = [
      'ee-core',
      'ee-bin',
      'electron',
      'better-sqlite3',
      'proxy-agent',
      'pino-roll',
      'pino-pretty',
    ];

    const userExternal = bundleConfig.external || [];

    const plugin = bundleRegistryPlugin(controllerDir, entryMain, configDir);

    const options: BuildOptions = {
      entryPoints: ['app:bundle-entry'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      // packages: 'external' 让 esbuild 将所有 npm 包视为 external（已通过 explicit external 列表细化）
      packages: 'external',
      outdir,
      external: [
        ...frameworkExternal,
        ...userExternal,
      ],
      format,
      minify: bundleConfig.minify ?? false,
      keepNames: bundleConfig.keepNames ?? false,
      ...(bundleConfig.drop ? { drop: bundleConfig.drop } : {}),
      ...(bundleConfig.legalComments ? { legalComments: bundleConfig.legalComments } : {}),
      sourcemap,
      // banner 注入 EE_BUNDLED 标记，ee-core 检测到此值时使用注册表而非文件系统扫描
      banner: {
        js: 'process.env.EE_BUNDLED = "true";',
      },
      plugins: [plugin],
      define: {
        ...(bundleConfig.define || {}),
      },
      logLevel: 'info',
    };

    log('_bundleWithRegistry options:%O', options);
    await build(options);

    // esbuild 将虚拟模块名 'app:bundle-entry' 中的 ':' 替换为 '_',
    // 所以输出文件名为 'app_bundle-entry.js'，需要重命名为 'main.js'
    const bundleEntryFile = path.join(outdir, 'app_bundle-entry.js');
    if (fs.existsSync(bundleEntryFile)) {
      fs.renameSync(bundleEntryFile, path.join(outdir, 'main.js'));
    }

    const bundleEntryMap = path.join(outdir, 'app_bundle-entry.js.map');
    if (fs.existsSync(bundleEntryMap)) {
      fs.renameSync(bundleEntryMap, path.join(outdir, 'main.js.map'));
    }

    // 复制不可打包的文件（child_process.fork 和 BrowserWindow preload 需要独立文件）
    this._copyUnbundledFiles(cwd, outdir, bundleConfig);

    console.log(chalk.blue('[ee-bin] ') + `Bundle output: ${outfile}`);
  }

  /**
   * 复制不可打包的文件 — 三层复制策略
   *
   * 1. 框架必需复制：jobs/ 目录（child_process.fork() 要求独立文件）
   * 2. preload/bridge.js（BrowserWindow preload 脚本必须为独立文件，由 Electron 直接加载）
   * 3. 用户自定义复制（bundleConfig.copy 中指定的额外资源）
   */
  private _copyUnbundledFiles(cwd: string, outdir: string, bundleConfig: BundleConfig): void {
    // 框架必需：jobs/ 目录（child_process.fork 无法从打包文件中找到子进程入口点）
    const copyTargets = ['jobs'];
    for (const target of copyTargets) {
      const src = path.join(cwd, ELECTRON_DIR, target);
      const dest = path.join(outdir, target);
      if (fs.existsSync(src)) {
        copyDirSync(src, dest);
      }
    }

    // preload/bridge.js：BrowserWindow 的 preload 脚本由 Electron 直接从磁盘加载，
    // 不能打包进 main.js（打包后路径不对且 Electron 要求 preload 为独立文件）
    const bridgeSrc = path.join(cwd, ELECTRON_DIR, 'preload', 'bridge.js');
    const bridgeDest = path.join(outdir, 'preload', 'bridge.js');
    if (fs.existsSync(bridgeSrc)) {
      fs.mkdirSync(path.dirname(bridgeDest), { recursive: true });
      fs.copyFileSync(bridgeSrc, bridgeDest);
    }

    // 用户自定义：额外资源（如 assets 目录、data/db.json 等）
    const userCopyTargets = bundleConfig.copy || [];
    for (const target of userCopyTargets) {
      const src = path.join(cwd, ELECTRON_DIR, target);
      const dest = path.join(outdir, target);
      if (!fs.existsSync(src)) continue;
      if (fs.statSync(src).isDirectory()) {
        copyDirSync(src, dest);
      } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
      }
    }
  }

  /**
   * 切换 package.json main 字段
   *
   * 打包后 Electron 启动需要指向 ./public/electron/main.js 而非 ./electron/main.js，
   * 因为打包产物在 public/electron/ 目录下。切换前保存原始值以便恢复。
   */
  private _switchPkgMain(): void {
    const pkgPath = path.join(process.cwd(), PKG_PATH);
    const pkg = readJsonSync(pkgPath);
    const bundleMainPath = BUNDLE_DIR + '/main.js';

    if (pkg.main !== bundleMainPath) {
      this.originalPkgMain = pkg.main as string | undefined;
      pkg.main = bundleMainPath;
      writeJsonSync(pkgPath, pkg);
    }
  }

  /**
   * 恢复 package.json main 字段
   *
   * 构建完成后或 SIGINT/SIGTERM 时恢复原始 main 值，
   * 避免 package.json 被永久修改影响后续开发
   */
  private _restorePkgMain(): void {
    if (this.originalPkgMain !== undefined) {
      const pkgPath = path.join(process.cwd(), PKG_PATH);
      const pkg = readJsonSync(pkgPath);
      pkg.main = this.originalPkgMain;
      writeJsonSync(pkgPath, pkg);
      this.originalPkgMain = undefined;
    }
  }

}

export const serveProcess = new ServeProcess();
export { ServeProcess };