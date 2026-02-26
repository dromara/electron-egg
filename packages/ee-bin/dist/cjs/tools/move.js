"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = move;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../lib/utils");
const homeDir = process.cwd();
// 移动资源
function move(options = {}) {
    console.log('[ee-bin] [move] Start moving resources');
    const { config, flag } = options;
    const binCfg = (0, utils_1.loadConfig)(config);
    const moveConfig = binCfg.move;
    let flags;
    const flagString = flag ? flag.trim() : '';
    if (flagString.indexOf(',') !== -1) {
        flags = flagString.split(',');
    }
    else {
        flags = [flagString];
    }
    for (let i = 0; i < flags.length; i++) {
        const f = flags[i];
        const cfg = moveConfig[f];
        if (!cfg) {
            console.log(chalk_1.default.blue('[ee-bin] [move] ') + chalk_1.default.red(`Error: ${f} config does not exist`));
            return;
        }
        const { src, dest, dist, target } = cfg;
        const source = dist ? dist : src;
        const destination = target ? target : dest;
        console.log(chalk_1.default.blue('[ee-bin] [move] ') + chalk_1.default.green(`Move flag: ${f}`));
        console.log(chalk_1.default.blue('[ee-bin] [move] ') + chalk_1.default.green('config:'), cfg);
        if (!source || !destination) {
            console.log(chalk_1.default.blue('[ee-bin] [move] ') + chalk_1.default.red('Error: src/dest or dist/target is required'));
            return;
        }
        const srcResource = path_1.default.join(homeDir, source);
        if (!fs_1.default.existsSync(srcResource)) {
            const errorTips = chalk_1.default.bgRed('Error') + ` ${source} resource does not exist !`;
            console.error(errorTips);
            return;
        }
        // clear the historical resource and copy it to the ee resource directory
        const destResource = path_1.default.join(homeDir, destination);
        if (fs_1.default.statSync(srcResource).isDirectory() && !fs_1.default.existsSync(destResource)) {
            fs_1.default.mkdirSync(destResource, { recursive: true, mode: 0o777 });
        }
        else {
            (0, utils_1.rm)(destResource);
            console.log('[ee-bin] [move] Clear history resources:', destResource);
        }
        fs_extra_1.default.copySync(srcResource, destResource);
        // [todo] go project, special treatment of package.json, reserved only necessary
        console.log(`[ee-bin] [move] Copy ${srcResource} to ${destResource}`);
    }
    console.log('[ee-bin] [move] End');
}
//# sourceMappingURL=move.js.map