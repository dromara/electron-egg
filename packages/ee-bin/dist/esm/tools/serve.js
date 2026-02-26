import debug from "debug";
import path from "path";
import fsPro from "fs-extra";
import { loadConfig, isWindows, getArgumentByName, readJsonSync, writeJsonSync } from "../lib/utils";
import chalk from "chalk";
import crossSpawn from "cross-spawn";
import { buildSync } from "esbuild";
import chokidar from "chokidar";
import kill from "tree-kill";
import process from "process";
const debugLog = debug("ee-bin:serve");
class ServeProcess {
  constructor() {
    process.env.NODE_ENV = "prod";
    this.execProcess = {};
    this.electronDir = "./electron";
    this.bundleDir = "./public/electron";
    this.pkgPath = "./package.json";
    this._init();
  }
  /**
   * init 
   */
  _init() {
    process.on("SIGINT", () => {
      console.log(chalk.blue("[ee-bin] ") + `Received SIGINT. Closing processes...`);
      this._closeProcess();
    });
    process.on("SIGTERM", () => {
      console.log(chalk.blue("[ee-bin] ") + `Received SIGTERM. Closing processes...`);
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
        pid: p.pid
      });
    }
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
  dev(options = {}) {
    process.env.NODE_ENV = "dev";
    const { config, serve } = options;
    const binCfg = loadConfig(config);
    const binCmd = "dev";
    const binCmdConfig = binCfg[binCmd];
    let command = serve;
    if (!command) {
      command = Object.keys(binCmdConfig).join();
    }
    const opt = {
      binCmd,
      binCmdConfig,
      command
    };
    const cmds = this._formatCmds(command);
    if (cmds.indexOf("electron") !== -1) {
      const electronConfig = binCmdConfig.electron;
      const args = typeof electronConfig.args === "string" ? [electronConfig.args] : electronConfig.args;
      const debugging = getArgumentByName("debuger", args) === "true" ? true : false;
      this._switchPkgMain(debugging);
      if (electronConfig.watch) {
        let debounceTimer = null;
        const cmd = "electron";
        const watcher = chokidar.watch([this.electronDir], {
          persistent: true
        });
        watcher.on("change", async (f) => {
          console.log(chalk.blue("[ee-bin] [dev] ") + `File [${chalk.cyan(f)}] has been changed`);
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            console.log(chalk.blue("[ee-bin] [dev] ") + `Restart ${cmd}`);
            this.bundle(binCfg.build.electron);
            const subPorcess = this.execProcess[cmd];
            kill(subPorcess.pid, "SIGKILL", (err) => {
              if (err) {
                console.log(chalk.red("[ee-bin] [dev] ") + `Restart failed, error: ${err}`);
                process.exit(-1);
              }
              delete this.execProcess[cmd];
              const onlyElectronOpt = {
                binCmd,
                binCmdConfig,
                command: cmd
              };
              this.multiExec(onlyElectronOpt);
            });
          }, electronConfig.delay);
        });
      }
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
    const binCmd = "start";
    const binCmdConfig = {
      start: binCfg[binCmd]
    };
    const opt = {
      binCmd,
      binCmdConfig,
      command: binCmd
    };
    this.multiExec(opt);
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * build
   */
  build(options = {}) {
    const { config, env } = options;
    let { cmds } = options;
    process.env.NODE_ENV = env;
    const binCfg = loadConfig(config);
    const binCmd = "build";
    const binCmdConfig = binCfg[binCmd];
    if (!cmds || cmds === "") {
      const tip = chalk.bgYellow("Warning") + " Please modify the " + chalk.blue("build") + " property in the bin file";
      console.log(tip);
      return;
    }
    const commands = this._formatCmds(cmds);
    if (commands.indexOf("electron") !== -1) {
      this.bundle(binCmdConfig.electron);
      const index = commands.indexOf("electron");
      commands.splice(index, 1);
      cmds = commands.join();
      this._switchPkgMain(false);
    }
    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds || ""
    };
    this.multiExec(opt);
  }
  /**
   * Execute custom commands
   */
  exec(options = {}) {
    const { config, cmds } = options;
    const binCfg = loadConfig(config);
    const binCmd = "exec";
    const binCmdConfig = binCfg[binCmd];
    const opt = {
      binCmd,
      binCmdConfig,
      command: cmds || ""
    };
    this.multiExec(opt);
  }
  /**
   * Support multiple commands
   */
  multiExec(opt) {
    const { binCmd, binCmdConfig, command } = opt;
    const commands = this._formatCmds(command);
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const cfg = binCmdConfig[cmd];
      if (!cfg) {
        continue;
      }
      if (binCmd === "dev" && cmd === "frontend" && cfg.protocol === "file://") {
        continue;
      }
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk.green(cmd)} command`);
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + chalk.magenta("Config:"), JSON.stringify(cfg));
      const execDir = path.join(process.cwd(), cfg.directory);
      let execArgs = [];
      if (typeof cfg.args === "string") {
        execArgs = [cfg.args];
      } else if (Array.isArray(cfg.args)) {
        execArgs = cfg.args.flat();
      }
      const stdio = cfg.stdio ? cfg.stdio : "inherit";
      const handler = cfg.sync ? crossSpawn.sync : crossSpawn;
      this.execProcess[cmd] = handler(
        cfg.cmd,
        execArgs,
        { stdio, cwd: execDir, maxBuffer: 1024 * 1024 * 1024 }
      );
      console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + "The " + chalk.green(`${cmd}`) + ` command is ${cfg.sync ? "run completed" : "running"}`);
      if (!cfg.sync) {
        this.execProcess[cmd].on("exit", () => {
          if (binCmd === "dev") {
            console.log(chalk.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk.green(cmd)} process is exiting`);
            if (isWindows() && cmd === "electron") {
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
  bundle(bundleConfig) {
    const { bundleType } = bundleConfig;
    if (bundleType === "copy") {
      const srcResource = path.join(process.cwd(), this.electronDir);
      const destResource = path.join(process.cwd(), this.bundleDir);
      fsPro.removeSync(destResource);
      fsPro.copySync(srcResource, destResource);
    } else {
      const esbuildOptions = bundleConfig[bundleConfig.type];
      debugLog("esbuild options:%O", esbuildOptions);
      buildSync(esbuildOptions);
    }
  }
  // format commands
  _formatCmds(command) {
    let cmds;
    const cmdString = command.trim();
    if (cmdString.indexOf(",") !== -1) {
      cmds = cmdString.split(",");
    } else {
      cmds = [cmdString];
    }
    return cmds;
  }
  // Modify the main attribute in package.json
  _switchPkgMain(isDebugger = false) {
    let mainFile = "main.js";
    const pkgPath = path.join(process.cwd(), this.pkgPath);
    const pkg = readJsonSync(pkgPath);
    const maints = path.join(process.cwd(), this.electronDir, "main.ts");
    if (fsPro.existsSync(maints)) {
      mainFile = "main.ts";
    }
    if (isDebugger && mainFile === "main.js") {
      pkg.main = this.electronDir + "/" + mainFile;
      writeJsonSync(pkgPath, pkg);
    } else {
      const bundleMainPath = this.bundleDir + "/main.js";
      if (pkg.main !== bundleMainPath) {
        pkg.main = bundleMainPath;
        writeJsonSync(pkgPath, pkg);
      }
    }
  }
  // env
  isDev() {
    return process.env.NODE_ENV === "dev";
  }
}
const serveProcess = new ServeProcess();
export {
  ServeProcess,
  serveProcess
};
