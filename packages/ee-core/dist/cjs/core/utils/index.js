"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensions = void 0;
exports.loadFile = loadFile;
exports.callFn = callFn;
exports.getResolvedFilename = getResolvedFilename;
exports.isBytecodeClass = isBytecodeClass;
exports.filePatterns = filePatterns;
require("bytenode");
const is_type_of_1 = __importDefault(require("is-type-of"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const module_1 = __importDefault(require("module"));
// Guard against poorly mocked module constructors.
const Module = (module.constructor.length > 1
    ? module.constructor
    /* istanbul ignore next */
    : module_1.default);
// Module._extensions:
// '.js': [Function (anonymous)],
// '.json': [Function (anonymous)],
// '.node': [Function: func],
// '.jsc': [Function (anonymous)]
const extensions = Module._extensions;
exports.extensions = extensions;
function loadFile(filepath) {
    try {
        // if not js module, just return content buffer
        const extname = path_1.default.extname(filepath);
        if (extname && !Module._extensions[extname]) {
            return fs_1.default.readFileSync(filepath);
        }
        // require js module
        const obj = require(filepath);
        if (!obj)
            return obj;
        // it's es module
        if (obj.__esModule)
            return 'default' in obj ? obj.default : obj;
        return obj;
    }
    catch (err) {
        err.message = `[ee-core] load file: ${filepath}, error: ${err.message}`;
        throw err;
    }
}
async function callFn(fn, args, ctx) {
    args = args || [];
    if (!is_type_of_1.default.function(fn))
        return;
    return ctx ? fn.call(ctx, ...args) : fn(...args);
}
function getResolvedFilename(filepath, baseDir) {
    const reg = /[/\\]/g;
    return filepath.replace(baseDir + path_1.default.sep, '').replace(reg, '/');
}
/**
 * 字节码类
 */
function isBytecodeClass(exports) {
    let isClass = false;
    // 标识
    if (exports.toString().indexOf('[class') != -1) {
        isClass = true;
    }
    return isClass;
}
/**
 * 文件类型
 */
function filePatterns() {
    const files = ['**/*.js', '**/*.jsc'];
    return files;
}
//# sourceMappingURL=index.js.map