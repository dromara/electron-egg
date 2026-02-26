"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveProcess = exports.ServeProcess = void 0;
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../lib/utils");
const chalk_1 = __importDefault(require("chalk"));
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const esbuild_1 = require("esbuild");
const chokidar_1 = __importDefault(require("chokidar"));
const tree_kill_1 = __importDefault(require("tree-kill"));
const process_1 = __importDefault(require("process"));
const debugLog = (0, debug_1.default)('ee-bin:serve');
class ServeProcess {
    constructor() {
        process_1.default.env.NODE_ENV = 'prod'; // dev / prod
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
        process_1.default.on('SIGINT', () => {
            console.log(chalk_1.default.blue('[ee-bin] ') + `Received SIGINT. Closing processes...`);
            this._closeProcess();
        });
        // Monitor SIGTERM signal
        process_1.default.on('SIGTERM', () => {
            console.log(chalk_1.default.blue('[ee-bin] ') + `Received SIGTERM. Closing processes...`);
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
            (0, tree_kill_1.default)(p.pid);
            debugLog(`Kill ${chalk_1.default.blue(p.name)} server, pid: ${p.pid}`);
        });
        process_1.default.exit(0);
    }
    /**
     * Start frontend and main process services
     */
    dev(options = {}) {
        // Set an environment variable
        process_1.default.env.NODE_ENV = 'dev';
        const { config, serve } = options;
        const binCfg = (0, utils_1.loadConfig)(config);
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
        };
        // build electron main code 
        const cmds = this._formatCmds(command);
        if (cmds.indexOf("electron") !== -1) {
            const electronConfig = binCmdConfig.electron;
            // Debugging source code
            const args = typeof electronConfig.args === 'string' ? [electronConfig.args] : electronConfig.args;
            const debugging = (0, utils_1.getArgumentByName)('debuger', args) === 'true' ? true : false;
            this._switchPkgMain(debugging);
            // watche electron main code
            if (electronConfig.watch) {
                let debounceTimer = null;
                const cmd = 'electron';
                const watcher = chokidar_1.default.watch([this.electronDir], {
                    persistent: true
                });
                watcher.on('change', async (f) => {
                    console.log(chalk_1.default.blue('[ee-bin] [dev] ') + `File [${chalk_1.default.cyan(f)}] has been changed`);
                    // 防抖
                    if (debounceTimer) {
                        clearTimeout(debounceTimer);
                    }
                    debounceTimer = setTimeout(async () => {
                        // rebuild code
                        console.log(chalk_1.default.blue('[ee-bin] [dev] ') + `Restart ${cmd}`);
                        this.bundle(binCfg.build.electron);
                        const subPorcess = this.execProcess[cmd];
                        (0, tree_kill_1.default)(subPorcess.pid, 'SIGKILL', (err) => {
                            if (err) {
                                console.log(chalk_1.default.red('[ee-bin] [dev] ') + `Restart failed, error: ${err}`);
                                process_1.default.exit(-1);
                            }
                            delete this.execProcess[cmd];
                            // restart electron command
                            const onlyElectronOpt = {
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
    start(options = {}) {
        const { config } = options;
        const binCfg = (0, utils_1.loadConfig)(config);
        const binCmd = 'start';
        const binCmdConfig = {
            start: binCfg[binCmd]
        };
        const opt = {
            binCmd,
            binCmdConfig,
            command: binCmd,
        };
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
        process_1.default.env.NODE_ENV = env;
        const binCfg = (0, utils_1.loadConfig)(config);
        const binCmd = 'build';
        const binCmdConfig = binCfg[binCmd];
        if (!cmds || cmds === "") {
            const tip = chalk_1.default.bgYellow('Warning') + ' Please modify the ' + chalk_1.default.blue('build') + ' property in the bin file';
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
        const opt = {
            binCmd,
            binCmdConfig,
            command: cmds || '',
        };
        this.multiExec(opt);
    }
    /**
     * Execute custom commands
     */
    exec(options = {}) {
        const { config, cmds } = options;
        const binCfg = (0, utils_1.loadConfig)(config);
        const binCmd = 'exec';
        const binCmdConfig = binCfg[binCmd];
        const opt = {
            binCmd,
            binCmdConfig,
            command: cmds || '',
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
                // Running the build electron code separately may be empty
                continue;
            }
            // frontend 如果是 file:// 协议，则不启动
            if (binCmd === 'dev' && cmd === 'frontend' && cfg.protocol === 'file://') {
                continue;
            }
            console.log(chalk_1.default.blue(`[ee-bin] [${binCmd}] `) + `Run ${chalk_1.default.green(cmd)} command`);
            console.log(chalk_1.default.blue(`[ee-bin] [${binCmd}] `) + chalk_1.default.magenta('Config:'), JSON.stringify(cfg));
            const execDir = path_1.default.join(process_1.default.cwd(), cfg.directory);
            let execArgs = [];
            if (typeof cfg.args === 'string') {
                execArgs = [cfg.args];
            }
            else if (Array.isArray(cfg.args)) {
                // Flatten array if it's an array of arrays
                execArgs = cfg.args.flat();
            }
            const stdio = cfg.stdio ? cfg.stdio : 'inherit';
            const handler = cfg.sync ? cross_spawn_1.default.sync : cross_spawn_1.default;
            this.execProcess[cmd] = handler(cfg.cmd, execArgs, { stdio: stdio, cwd: execDir, maxBuffer: 1024 * 1024 * 1024 });
            console.log(chalk_1.default.blue(`[ee-bin] [${binCmd}] `) + 'The ' + chalk_1.default.green(`${cmd}`) + ` command is ${cfg.sync ? 'run completed' : 'running'}`);
            if (!cfg.sync) {
                this.execProcess[cmd].on('exit', () => {
                    if (binCmd === 'dev') {
                        console.log(chalk_1.default.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk_1.default.green(cmd)} process is exiting`);
                        if ((0, utils_1.isWindows)() && cmd === 'electron') {
                            console.log(chalk_1.default.blue(`[ee-bin] [${binCmd}] `) + chalk_1.default.green('Press "CTRL+C" to exit'));
                        }
                        return;
                    }
                    console.log(chalk_1.default.blue(`[ee-bin] [${binCmd}] `) + `The ${chalk_1.default.green(cmd)} command has been executed and exited`);
                });
            }
        }
    }
    // esbuild
    bundle(bundleConfig) {
        const { bundleType } = bundleConfig;
        if (bundleType === 'copy') {
            const srcResource = path_1.default.join(process_1.default.cwd(), this.electronDir);
            const destResource = path_1.default.join(process_1.default.cwd(), this.bundleDir);
            fs_extra_1.default.removeSync(destResource);
            fs_extra_1.default.copySync(srcResource, destResource);
        }
        else {
            const esbuildOptions = bundleConfig[bundleConfig.type];
            debugLog('esbuild options:%O', esbuildOptions);
            (0, esbuild_1.buildSync)(esbuildOptions);
        }
    }
    // format commands
    _formatCmds(command) {
        let cmds;
        const cmdString = command.trim();
        if (cmdString.indexOf(',') !== -1) {
            cmds = cmdString.split(',');
        }
        else {
            cmds = [cmdString];
        }
        return cmds;
    }
    // Modify the main attribute in package.json
    _switchPkgMain(isDebugger = false) {
        let mainFile = 'main.js';
        const pkgPath = path_1.default.join(process_1.default.cwd(), this.pkgPath);
        const pkg = (0, utils_1.readJsonSync)(pkgPath);
        const maints = path_1.default.join(process_1.default.cwd(), this.electronDir, 'main.ts');
        if (fs_extra_1.default.existsSync(maints)) {
            mainFile = 'main.ts';
        }
        // [todo] Currently only supports JS
        // [todo] Do not use path. join() to ensure consistent performance between Windows and macOS
        if (isDebugger && mainFile === 'main.js') {
            pkg.main = this.electronDir + '/' + mainFile;
            (0, utils_1.writeJsonSync)(pkgPath, pkg);
        }
        else {
            // only load main.js file
            const bundleMainPath = this.bundleDir + '/' + 'main.js';
            // Modify when the path is incorrect to reduce unnecessary operations
            if (pkg.main !== bundleMainPath) {
                pkg.main = bundleMainPath;
                (0, utils_1.writeJsonSync)(pkgPath, pkg);
            }
        }
    }
    // env
    isDev() {
        return process_1.default.env.NODE_ENV === 'dev';
    }
}
exports.ServeProcess = ServeProcess;
const serveProcess = new ServeProcess();
exports.serveProcess = serveProcess;
//# sourceMappingURL=serve.js.map