"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFile = loadFile;
exports.execFile = execFile;
exports.requireFile = requireFile;
exports.resolveModule = resolveModule;
exports.getFullpath = getFullpath;
const is_type_of_1 = __importDefault(require("is-type-of"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CoreUtils = __importStar(require("../core/utils"));
const ps_1 = require("../ps");
// 加载单个文件(如果是函数，将被执行)
function loadFile(filepath, ...inject) {
    let fullpath = filepath;
    const isAbsolute = path_1.default.isAbsolute(fullpath);
    if (!isAbsolute) {
        fullpath = path_1.default.join((0, ps_1.getElectronDir)(), fullpath);
    }
    fullpath = fullpath && resolveModule(fullpath);
    if (!fullpath || !fs_1.default.existsSync(fullpath)) {
        let errorMsg = `[ee-core] [loader/index] loadFile ${filepath} does not exist`;
        throw new Error(errorMsg);
    }
    let ret = CoreUtils.loadFile(fullpath);
    if (is_type_of_1.default.function(ret) && !is_type_of_1.default.class(ret) && !CoreUtils.isBytecodeClass(ret)) {
        ret = ret(...inject);
    }
    return ret;
}
// requireFile
function requireFile(filepath) {
    return CoreUtils.loadFile(filepath);
}
// 加载并运行文件
function execFile(filepath, ...inject) {
    let ret = CoreUtils.loadFile(filepath);
    if (is_type_of_1.default.class(ret) || CoreUtils.isBytecodeClass(ret)) {
        ret = new ret(inject);
    }
    else if (is_type_of_1.default.function(ret)) {
        ret = ret(inject);
    }
    return ret;
}
// 模块的绝对路径
function resolveModule(filepath) {
    let fullpath;
    try {
        fullpath = require.resolve(filepath);
    }
    catch (e) {
        // 特殊后缀处理
        if (filepath && (filepath.endsWith('.defalut') || filepath.endsWith('.prod'))) {
            fullpath = filepath + '.jsc';
        }
        else if (filepath && filepath.endsWith('.js')) {
            fullpath = filepath + 'c';
        }
        if (!fs_1.default.existsSync(filepath) && (!fullpath || !fs_1.default.existsSync(fullpath))) {
            let files = { filepath, fullpath };
            console.warn(`[ee-core] [loader] resolveModule unknow filepath: ${JSON.stringify(files)}`);
            return undefined;
        }
    }
    return fullpath;
}
// 获取electron目录下文件的绝对路径
function getFullpath(filepath) {
    let fullpath;
    const isAbsolute = path_1.default.isAbsolute(filepath);
    if (!isAbsolute) {
        filepath = path_1.default.join((0, ps_1.getElectronDir)(), filepath);
    }
    fullpath = resolveModule(filepath);
    if (!fullpath || !fs_1.default.existsSync(fullpath)) {
        throw new Error(`[ee-core] [loader] getFullpath filepath ${filepath} not exists`);
    }
    return fullpath;
}
//# sourceMappingURL=index.js.map