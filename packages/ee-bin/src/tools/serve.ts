/**
 * Dev/Build/Start Manager — ee-bin's core dispatcher
 *
 * The ServeProcess class manages the full dev/build/start/exec lifecycle and is the
 * most complex module in ee-bin. Core responsibilities:
 *   1. dev  — Start frontend dev server + Electron process, optional watch mode with auto-rebuild
 *   2. build — Bundle Electron code + execute electron-builder platform build commands
 *   3. start — Start Electron in production mode
 *   4. exec  — Execute user-defined custom commands
 *
 * Process management strategy:
 *   - execProcess only tracks async ChildProcess instances (sync executions are already
 *     complete, so there's no process to manage)
 *   - SIGINT/SIGTERM signal handlers close all child processes and restore package.json main field
 *   - In watch mode, debounce + tree-kill terminate the old Electron process before restarting
 *
 * Bundling strategy:
 *   - bundle mode: esbuild bundles into a single file + virtual registry plugin
 *   - copy mode: directly copies the entire electron/ directory (for non-bundling scenarios)
 *   - After bundling, switches package.json main field to point to ./public/electron/main.js
 */

import { createDebug, chalk, copyDirSync, formatCmds } from '../lib/helpers.js';
import path from 'path';
import fs from 'fs';
import { build, BuildOptions } from 'esbuild';
import globby from 'globby';
import chokidar from 'chokidar';
import kill from 'tree-kill';
import { ChildProcess } from 'child_process';
import process from 'process';
import crossSpawn, { sync as crossSpawnSync } from 'cross-spawn';
import { loadConfig, readJsonSync, writeJsonSync, rm, toArray } from '../lib/utils.js';
import type { ExecConfig, BundleConfig } from '../types/config.js';
import { bundleRegistryPlugin } from '../plugins/bundle_registry_plugin.js';

const log = createDebug('ee-bin:serve');
/** Maximum buffer size for child processes (1GB), prevents large-output build commands from being truncated */
const MAX_BUFFER = 1024 * 1024 * 1024;
const ELECTRON_DIR = './electron';
const BUNDLE_DIR = './public/electron';
const PKG_PATH = './package.json';

/** Common options for ServeProcess methods — corresponds to Commander CLI parameters */
interface ServeOptions {
  config?: string;
  serve?: string;
  cmds?: string;
  env?: string;
}

class ServeProcess {
  /** Async child process reference table (only async ChildProcess instances; sync processes are already complete and don't need tracking) */
  execProcess: Record<string, ChildProcess>;
  /** Original value of package.json main field (used by _restorePkgMain to restore) */
  private originalPkgMain: string | undefined;

  constructor() {
    this.execProcess = {};
    this.originalPkgMain = undefined;
    this._init();
  }

  /** Register SIGINT/SIGTERM signal handlers to ensure child processes are closed and config is restored on exit */
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
   * Close all child processes, restore package.json, then exit
   *
   * Flow: kill all child processes → restore pkgMain → sleep 500ms → process.exit(0)
   * NOTE: The 500ms sleep is a compromise. The ideal approach would be to listen for each
   * child process's exit event before exiting, but that's complex to implement (multi-process
   * racing, nested processes, etc.). If a child process doesn't close in time, it may be orphaned.
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
   * Dev mode — start frontend dev server + Electron process
   *
   * Complete flow:
   *   1. Set NODE_ENV=dev
   *   2. Load config, parse command names to start
   *   3. If electron command is included:
   *      a. First bundle Electron code (via esbuild)
   *      b. Switch package.json main field
   *      c. If electron.watch=true, watch electron/ directory for changes
   *         → on change: debounce → re-bundle → kill old process → re-spawn
   *   4. multiExec starts all commands (frontend + Electron)
   */
  async dev(options: ServeOptions = {}): Promise<void> {
    process.env.NODE_ENV = 'dev';
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = 'dev';
    const binCmdConfig = binCfg.dev;

    // Default to starting all commands defined in dev config when none specified
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

      // Electron process needs bundled code, so bundle first before starting
      await this.bundle(binCfg.build.electron);
      this._switchPkgMain();

      // Watch mode: monitor electron directory for changes, auto-rebuild + restart
      if (electronConfig?.watch) {
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const cmd = 'electron';
        const watcher = chokidar.watch([ELECTRON_DIR], { persistent: true });
        watcher.on('change', async (f: string) => {
          console.log(chalk.blue('[ee-bin] [dev] ') + `File [${chalk.cyan(f)}] has been changed`);

          // Debounce: rapid successive file changes only trigger one rebuild
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            try {
              console.log(chalk.blue('[ee-bin] [dev] ') + `Restart ${cmd}`);
              await this.bundle(binCfg.build.electron);
              const subProcess = this.execProcess[cmd];
              if (subProcess && subProcess.pid) {
                // Kill old Electron process (SIGKILL for forced termination), then re-spawn on success
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
            } catch (e) {
              console.log(chalk.red('[ee-bin] [dev] ') + `Re-bundle failed: ${e instanceof Error ? e.message : e}`);
            }
          }, electronConfig.delay);
        });
      }
    }

    this.multiExec(opt);
  }

  /**
   * Production start — directly run the Electron process (no bundling)
   * Prerequisite: the project has already been built via the build command
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

  /** Helper: sleep for the specified number of milliseconds */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build mode — bundle Electron code + execute platform build commands
   *
   * Complete flow:
   *   1. Set NODE_ENV=prod (or user-specified environment)
   *   2. If cmds includes 'electron': bundle first → remove electron from command list → switch pkgMain
   *   3. multiExec executes remaining commands (e.g. frontend, win64, mac, etc.)
   *   4. After build completes, restore package.json main field
   *
   * The 'electron' command only triggers bundling, not an Electron process launch,
   * so it's removed from the command list and not processed by multiExec
   */
  async build(options: ServeOptions = {}): Promise<void> {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env || 'prod';
    const binCfg = loadConfig(config);
    const binCmd = 'build';
    // build.electron is BundleConfig; other keys are ExecConfig.
    // electron is always removed from commands before passing to multiExec, so this cast is safe
    const binCmdConfig = binCfg.build as Record<string, ExecConfig>;

    if (!cmds || cmds === '') {
      const tip = chalk.bgYellow('Warning') + ' Please modify the ' + chalk.blue('build') + ' property in the bin file';
      console.log(tip);
      return;
    }

    const commands = formatCmds(cmds);
    if (commands.includes('electron')) {
      await this.bundle(binCfg.build.electron);
      // Remove 'electron' from the command list — it only triggers bundling,
      // not a subprocess launch
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
    // Restore package.json after build completes (dev mode restores on SIGINT/SIGTERM)
    this._restorePkgMain();
  }

  /** Execute user-defined custom commands from the "exec" config section */
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
   * Execute multiple commands — iterate the command list and start a subprocess for each
   *
   * Design decisions:
   *   - Frontend file:// protocol is skipped in dev mode (frontend is already served via HTTP)
   *   - sync mode uses crossSpawnSync for blocking execution; result is not stored in execProcess (process already complete)
   *   - async mode uses crossSpawn for non-blocking execution; stored in execProcess for later kill
   *   - async processes listen for exit events; in dev mode, a message is logged when a process exits
   */
  multiExec(opt: { binCmd: string; binCmdConfig: Record<string, ExecConfig>; command: string }): void {
    const { binCmd, binCmdConfig, command } = opt;
    const commands = formatCmds(command || '');

    for (const cmd of commands) {
      const cfg = binCmdConfig[cmd];

      if (!cfg) {
        continue;
      }

      // In dev mode, skip frontend startup when protocol is 'file://'
      // (frontend files are already served via HTTP dev server, no separate file:// process needed)
      if (binCmd === 'dev' && cmd === 'frontend' && cfg.protocol === 'file://') {
        continue;
      }

      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk.green(cmd)} command`);
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.magenta('Config:'), JSON.stringify(cfg));

      const execDir = path.join(process.cwd(), cfg.directory);
      const execArgs = toArray(cfg.args);
      const stdioOpt: 'inherit' | 'pipe' | 'ignore' = cfg.stdio || 'inherit';

      if (cfg.sync) {
        // Sync execution: blocks until the command completes, no process tracking needed
        const syncResult = crossSpawnSync(cfg.cmd, execArgs, {
          stdio: stdioOpt,
          cwd: execDir,
          maxBuffer: MAX_BUFFER,
        });
        if (syncResult.error) {
          throw new Error(`[ee-bin] [${binCmd}] Command "${cfg.cmd}" failed to spawn: ${syncResult.error.message}`);
        }
        if (syncResult.status !== 0 && syncResult.status !== null) {
          throw new Error(`[ee-bin] [${binCmd}] Command "${cfg.cmd} ${execArgs.join(' ')}" exited with code ${syncResult.status}`);
        }
      } else {
        // Async execution: starts a child process and tracks it for SIGINT/SIGTERM kill
        const childProc = crossSpawn(cfg.cmd, execArgs, {
          stdio: stdioOpt,
          cwd: execDir,
          maxBuffer: MAX_BUFFER,
        });
        this.execProcess[cmd] = childProc;

        childProc.on('error', (err) => {
          console.log(chalk.red(`[ee-bin] [${binCmd}] `) + `Command "${cmd}" failed to spawn: ${err.message}`);
          delete this.execProcess[cmd];
        });

        childProc.on('exit', () => {
          if (binCmd === 'dev') {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} process is exiting`);
            // On Windows, Electron exit doesn't always terminate the parent process,
            // so remind the user to press Ctrl+C
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
   * Bundle Electron main process code
   *
   * Two modes:
   *   - 'bundle': Use esbuild + bundleRegistryPlugin to bundle into a single file
   *   - 'copy':   Directly copy the entire electron/ directory to public/electron/
   *
   * Clears the output directory (rm outdir) before bundling to ensure a clean build
   */
  async bundle(bundleConfig?: BundleConfig): Promise<void> {
    if (!bundleConfig) return;
    const cwd = process.cwd();
    const outdir = path.join(cwd, BUNDLE_DIR);

    // Clean output directory to ensure fresh build results
    rm(outdir);

    if (bundleConfig.bundleType === 'copy') {
      copyDirSync(path.join(cwd, ELECTRON_DIR), outdir);
    } else {
      await this._bundleWithRegistry(bundleConfig);
    }
  }

  /**
   * Resolve the esbuild options shared by the main bundle and the per-file copy transpile.
   *
   * Both the bundled main.js and the separately-transpiled jobs/copy files must use identical
   * compilation settings, otherwise main process code and job code would diverge (e.g. main.js
   * minified but jobs not, or different module format / target / define). This method centralizes
   * everything that should be consistent; callers add only the mode-specific keys (bundle,
   * entryPoints/outfile, externals, plugins, banner, logLevel).
   *
   * sourcemap auto mode: dev → inline (debuggable), prod → off (smaller output).
   */
  private _resolveBaseBuildOptions(bundleConfig: BundleConfig): BuildOptions {
    const isDev = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local';
    let sourcemap: boolean | 'inline';
    if (bundleConfig.sourcemap === 'inline' || bundleConfig.sourcemap === true) {
      sourcemap = 'inline';
    } else if (bundleConfig.sourcemap === 'external') {
      sourcemap = true;
    } else {
      sourcemap = isDev ? 'inline' : false;
    }

    const format: 'cjs' | 'esm' = bundleConfig.format || 'cjs';

    return {
      platform: 'node',
      target: 'node20',
      format,
      sourcemap,
      minify: bundleConfig.minify ?? false,
      keepNames: bundleConfig.keepNames ?? false,
      ...(bundleConfig.drop ? { drop: bundleConfig.drop } : {}),
      ...(bundleConfig.legalComments ? { legalComments: bundleConfig.legalComments } : {}),
      define: {
        ...(bundleConfig.define || {}),
      },
    };
  }

  /**
   * Bundle Electron code using esbuild + registry plugin
   *
   * esbuild configuration strategy:
   *   - entryPoints: Virtual module 'app:bundle-entry' (generated by the plugin)
   *   - format: Default cjs (recommended for Electron), optional esm
   *   - sourcemap: Auto-inferred (dev→inline, prod→off), user can override
   *   - external: Framework externals (ee-core/electron/better-sqlite3 etc.) + user-defined
   *   - banner: Injects process.env.EE_BUNDLED = "true" so ee-core detects bundle mode
   *   - packages: 'external' tells esbuild to automatically exclude all node_modules packages
   *
   * Post-bundle steps:
   *   1. Rename output file (app_bundle-entry.js → main.js)
   *   2. Copy non-bundlable files (jobs directory, preload/bridge.js, user-defined copy targets)
   */
  private async _bundleWithRegistry(bundleConfig: BundleConfig): Promise<void> {
    const cwd = process.cwd();
    const controllerDir = path.join(cwd, ELECTRON_DIR, 'controller');
    const configDir = path.join(cwd, ELECTRON_DIR, 'config');
    const mainJsPath = path.join(cwd, ELECTRON_DIR, 'main.js');
    const mainTsPath = path.join(cwd, ELECTRON_DIR, 'main.ts');
    // Detect TypeScript entry (affects esbuild resolution and output format inference)
    const isTypeScript = fs.existsSync(mainTsPath);
    const entryMain = isTypeScript ? mainTsPath : mainJsPath;
    const outdir = path.join(cwd, BUNDLE_DIR);
    const outfile = path.join(outdir, 'main.js');

    // Framework internal externals: these packages must be loaded from node_modules at runtime,
    // not bundled into main.js. Reasons:
    //   - ee-core: child_process.fork() needs its entry point as a real file on disk
    //   - electron/better-sqlite3: native modules that cannot be bundled by esbuild
    //   - pino-roll/pino-pretty: rely on fs operations that don't work after bundling
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
      // Shared compilation settings (format/target/sourcemap/minify/keepNames/drop/legalComments/define)
      // — kept identical to the per-file copy transpile so main.js and jobs/copy code never diverge
      ...this._resolveBaseBuildOptions(bundleConfig),
      // Mode-specific: bundle everything reachable from the virtual entry into a single file
      entryPoints: ['app:bundle-entry'],
      bundle: true,
      // packages: 'external' tells esbuild to treat all npm packages as external
      // (already refined by the explicit external list above)
      packages: 'external',
      outdir,
      external: [
        ...frameworkExternal,
        ...userExternal,
      ],
      // Banner injects EE_BUNDLED marker: ee-core checks this value to use the registry
      // instead of filesystem scanning when in bundle mode
      banner: {
        js: 'process.env.EE_BUNDLED = "true";',
      },
      plugins: [plugin],
      logLevel: 'info',
    };

    log('_bundleWithRegistry options:%O', options);
    await build(options);

    // esbuild replaces ':' in virtual module name 'app:bundle-entry' with '_',
    // so the output file is named 'app_bundle-entry.js' — rename it to 'main.js'
    const bundleEntryFile = path.join(outdir, 'app_bundle-entry.js');
    if (fs.existsSync(bundleEntryFile)) {
      fs.renameSync(bundleEntryFile, path.join(outdir, 'main.js'));
    }

    // Also rename the sourcemap file if it exists
    const bundleEntryMap = path.join(outdir, 'app_bundle-entry.js.map');
    if (fs.existsSync(bundleEntryMap)) {
      fs.renameSync(bundleEntryMap, path.join(outdir, 'main.js.map'));
    }

    // Copy non-bundlable files (child_process.fork and BrowserWindow preload need separate files)
    await this._copyUnbundledFiles(cwd, outdir, bundleConfig);

    console.log(chalk.blue('[ee-bin] ') + `Bundle output: ${outfile}`);
  }

  /**
   * Copy a directory or single file from electron/ to the bundle output WITH per-file transpilation.
   *
   * Script files (.ts/.js/.mts/.cts/.tsx/.jsx) are compiled to Node-loadable .js using
   * esbuild with bundle:false, so their imports stay as runtime require()/import calls:
   *   - relative imports (./foo) resolve to the sibling transpiled .js
   *   - ee-core/* and other packages resolve from node_modules at runtime
   * Non-script files (e.g. .json) are copied verbatim. Directory structure is preserved.
   *
   * @param src        Absolute path to a source directory or file
   * @param dest       Absolute path to the destination directory (for a dir src) or file (for a file src)
   * @param baseOptions Shared esbuild options from _resolveBaseBuildOptions — same compilation
   *                    settings (format/target/minify/define/...) as the main bundle, so copied
   *                    code stays consistent with main.js. bundle:false is forced for per-file output.
   */
  private async _transpileDir(src: string, dest: string, baseOptions: BuildOptions): Promise<void> {
    if (!fs.existsSync(src)) return;

    const scriptExts = new Set(['.ts', '.js', '.mts', '.cts', '.tsx', '.jsx']);

    const transpileFile = async (srcFile: string, destFile: string): Promise<void> => {
      const ext = path.extname(srcFile);
      if (!scriptExts.has(ext)) {
        // Non-script asset (e.g. .json): copy verbatim
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcFile, destFile);
        return;
      }
      // Output as sibling .js, preserving the directory structure. Per-file transpile (bundle:false)
      // so imports stay as runtime require()/import calls resolved on disk.
      await build({
        ...baseOptions,
        entryPoints: [srcFile],
        outfile: destFile.slice(0, -ext.length) + '.js',
        bundle: false,
        logLevel: 'silent',
      });
    };

    // Single file: dest is the target file path
    if (fs.statSync(src).isFile()) {
      await transpileFile(src, dest);
      return;
    }

    // Directory: walk every file, preserving the relative structure under dest
    const entries = globby.sync('**/*', { cwd: src, onlyFiles: true });
    for (const rel of entries) {
      await transpileFile(path.join(src, rel), path.join(dest, rel));
    }
  }

  /**
   * Copy non-bundlable files — two-tier strategy
   *
   * 1. preload/bridge.js (BrowserWindow preload script must be a separate file, loaded directly by Electron)
   * 2. Copy targets: framework defaults (jobs/) + user-defined (bundleConfig.copy), all handled
   *    per-file by _transpileDir — script files transpiled to CJS .js (so Node's require()/
   *    child_process.fork() can load them), other files copied verbatim, structure preserved
   */
  private async _copyUnbundledFiles(cwd: string, outdir: string, bundleConfig: BundleConfig): Promise<void> {
    // Shared esbuild options (format/target/minify/define/...) so unbundled output stays
    // consistent with main.js. Per-file transpile (bundle:false) is forced inside _transpileDir.
    const baseOptions = this._resolveBaseBuildOptions(bundleConfig);

    // preload/bridge.*: BrowserWindow's preload script is loaded directly from disk by Electron.
    // It cannot be bundled into main.js (bundled path would be wrong, and Electron requires
    // preload scripts to be separate files). The source may be .ts/.js/.mts/... — resolve whichever
    // exists and transpile it to bridge.js (a plain copy would break for TypeScript sources).
    const bridgeMatches = globby.sync('preload/bridge.{ts,js,mts,cts,tsx,jsx}', { cwd: path.join(cwd, ELECTRON_DIR) });
    if (bridgeMatches.length > 0) {
      const bridgeRel = bridgeMatches[0]!;
      const bridgeSrc = path.join(cwd, ELECTRON_DIR, bridgeRel);
      // dest mirrors the source basename so _transpileDir derives the sibling .js correctly
      const bridgeDest = path.join(outdir, bridgeRel);
      await this._transpileDir(bridgeSrc, bridgeDest, baseOptions);
    }

    // Copy targets kept out of main.js. jobs/ is a framework default (its files run in forked
    // child processes loaded by ee-core's require()-based loader, which cannot execute .ts), then
    // user-defined entries from bundleConfig.copy. De-duplicated so an explicit 'jobs' won't run twice.
    // Script files are transpiled with the SAME esbuild options as main.js (format/target/minify/
    // define/...), other files (assets, .json) copied verbatim — all handled per-file by _transpileDir.
    const copyTargets = [...new Set(['jobs', ...(bundleConfig.copy || [])])];
    for (const target of copyTargets) {
      const src = path.join(cwd, ELECTRON_DIR, target);
      const dest = path.join(outdir, target);
      if (!fs.existsSync(src)) continue;
      await this._transpileDir(src, dest, baseOptions);
      console.log(chalk.blue('[ee-bin] ') + `Copied: ${dest}`);
    }
  }

  /**
   * Switch package.json main field
   *
   * After bundling, Electron needs to point to ./public/electron/main.js instead of
   * ./electron/main.js, because the bundle output is in the public/electron/ directory.
   * The original value is saved before switching so it can be restored later.
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
   * Restore package.json main field
   *
   * Restores the original main value after build completes or on SIGINT/SIGTERM,
   * preventing package.json from being permanently modified (which would break dev mode)
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
