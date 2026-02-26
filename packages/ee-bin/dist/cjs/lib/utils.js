"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.loadFile = loadFile;
exports.getElectronProgram = getElectronProgram;
exports.compareVersion = compareVersion;
exports.isWindows = isWindows;
exports.isOSX = isOSX;
exports.isMacOS = isMacOS;
exports.isLinux = isLinux;
exports.isx86 = isx86;
exports.isx64 = isx64;
exports.getPlatform = getPlatform;
exports.rm = rm;
exports.getPackage = getPackage;
exports.readJsonSync = readJsonSync;
exports.writeJsonSync = writeJsonSync;
exports.getArgumentByName = getArgumentByName;
exports.getExtraResourcesDir = getExtraResourcesDir;
exports.getModuleNameFromPath = getModuleNameFromPath;
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const is_type_of_1 = __importDefault(require("is-type-of"));
const config_file_ts_1 = require("config-file-ts");
const json5_1 = __importDefault(require("json5"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const os_1 = __importDefault(require("os"));
const bin_default_1 = __importDefault(require("../config/bin_default"));
const extend_1 = require("./extend");
const debugLog = (0, debug_1.default)('ee-bin:lib:utils');
const _basePath = process.cwd();
const userBin = './cmd/bin.js';
function loadConfig(binFile) {
    const binPath = binFile ? binFile : userBin;
    const userConfig = loadFile(binPath);
    const result = (0, extend_1.extend)(true, bin_default_1.default, userConfig);
    debugLog('[loadConfig] bin:%j', result);
    return result;
}
function loadFile(filepath) {
    const configFile = path_1.default.join(_basePath, filepath);
    if (!fs_1.default.existsSync(configFile)) {
        const errorTips = 'file ' + chalk_1.default.blue(`${configFile}`) + ' does not exist !';
        throw new Error(errorTips);
    }
    let result;
    if (configFile.endsWith(".json5") || configFile.endsWith(".json")) {
        const data = fs_1.default.readFileSync(configFile, 'utf8');
        return json5_1.default.parse(data);
    }
    if (configFile.endsWith(".js") || configFile.endsWith(".cjs")) {
        result = require(configFile);
        if (result.default != null) {
            result = result.default;
        }
    }
    else if (configFile.endsWith(".ts")) {
        result = (0, config_file_ts_1.loadTsConfig)(configFile);
    }
    if (is_type_of_1.default.function(result) && !is_type_of_1.default.class(result)) {
        result = result();
    }
    return result || {};
}
/**
 * get electron program
 */
function getElectronProgram() {
    let electronPath;
    const electronModulePath = path_1.default.dirname(require.resolve('electron'));
    const pathFile = path_1.default.join(electronModulePath, 'path.txt');
    const executablePath = fs_1.default.readFileSync(pathFile, 'utf-8');
    if (executablePath) {
        electronPath = path_1.default.join(electronModulePath, 'dist', executablePath);
    }
    else {
        throw new Error('Check that electron is installed!');
    }
    return electronPath;
}
/**
 * 版本号比较
 */
function compareVersion(v1, v2) {
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    const len = Math.max(arr1.length, arr2.length);
    while (arr1.length < len) {
        arr1.push('0');
    }
    while (arr2.length < len) {
        arr2.push('0');
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(arr1[i]);
        const num2 = parseInt(arr2[i]);
        if (num1 > num2) {
            return 1;
        }
        else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}
function isWindows() {
    return process.platform === 'win32';
}
function isOSX() {
    return process.platform === 'darwin';
}
function isMacOS() {
    return isOSX();
}
function isLinux() {
    return process.platform === 'linux';
}
function isx86() {
    return process.arch === 'ia32';
}
function isx64() {
    return process.arch === 'x64';
}
/**
 * Delete a file or folder
 */
function rm(name) {
    // check
    if (!fs_1.default.existsSync(name)) {
        return;
    }
    const nodeVersion = (process.versions && process.versions.node) || null;
    if (nodeVersion && compareVersion(nodeVersion, '14.14.0') === 1) {
        fs_1.default.rmSync(name, { recursive: true });
    }
    else {
        fs_1.default.rmdirSync(name, { recursive: true });
    }
}
/**
 * 获取项目根目录package.json
 */
function getPackage() {
    const content = readJsonSync(path_1.default.join(_basePath, 'package.json'));
    return content;
}
function readJsonSync(filepath, encoding = 'utf8') {
    if (!fs_1.default.existsSync(filepath)) {
        throw new Error(filepath + ' is not found');
    }
    return JSON.parse(fs_1.default.readFileSync(filepath, { encoding }));
}
function writeJsonSync(filepath, str, options = {}) {
    if (!('space' in options)) {
        options.space = 2;
    }
    mkdirp_1.default.sync(path_1.default.dirname(filepath));
    if (typeof str === 'object') {
        str = JSON.stringify(str, options.replacer, options.space) + '\n';
    }
    fs_1.default.writeFileSync(filepath, str);
}
function getPlatform(delimiter = "_", isDiffArch = false) {
    let os = "";
    if (isWindows()) {
        os = "windows";
        if (isDiffArch) {
            const arch = isx64() ? "64" : "32";
            os += delimiter + arch;
        }
    }
    else if (isMacOS()) {
        let isAppleSilicon = false;
        const cpus = os_1.default.cpus();
        for (const cpu of cpus) {
            if (cpu.model.includes('Apple')) {
                isAppleSilicon = true;
                break;
            }
        }
        const core = isAppleSilicon ? "apple" : "intel";
        os = "macos" + delimiter + core;
    }
    else if (isLinux()) {
        os = "linux";
    }
    return os;
}
// Get cmd parameter by name
function getArgumentByName(name, args = process.argv) {
    for (let i = 0; i < args.length; i++) {
        const item = args[i];
        const prefixKey = `--${name}=`;
        if (item.indexOf(prefixKey) !== -1) {
            return item.substring(prefixKey.length);
        }
    }
}
function getExtraResourcesDir() {
    const dir = path_1.default.join(_basePath, "build", "extraResources");
    return dir;
}
function getModuleNameFromPath(modulePath) {
    // 分割路径段（处理不同系统的分隔符）
    const segments = path_1.default.normalize(modulePath).split(path_1.default.sep);
    // 从后往前查找 node_modules
    for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i] === 'node_modules') {
            // 普通模块：node_modules/dayjs
            if (i + 1 < segments.length) {
                return segments[i + 1];
            }
            // 作用域模块：node_modules/@scope/module
            if (i + 2 < segments.length && segments[i + 1].startsWith('@')) {
                return `${segments[i + 1]}/${segments[i + 2]}`;
            }
            break; // 找到 node_modules 但后面没有模块名
        }
    }
    return null;
}
//# sourceMappingURL=utils.js.map