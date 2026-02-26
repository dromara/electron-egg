"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.cleanEncrypt = cleanEncrypt;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const bytenode_1 = __importDefault(require("bytenode"));
const javascript_obfuscator_1 = __importDefault(require("javascript-obfuscator"));
const globby_1 = __importDefault(require("globby"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../lib/utils");
const extend_1 = require("../lib/extend");
const EncryptTypes = ['bytecode', 'confusion', 'strict'];
class Encrypt {
    constructor(options = {}) {
        // cli args
        const { config, out, target = 'electron' } = options;
        this.basePath = process.cwd();
        this.target = target;
        const conf = (0, utils_1.loadConfig)(config).encrypt;
        this.config = conf[target];
        const outputFolder = out || this.config.encryptDir;
        this.encryptDir = path_1.default.join(this.basePath, outputFolder);
        this.filesExt = this.config.fileExt;
        this.type = this.config.type;
        this.bOpt = this.config.bytecodeOptions;
        this.cOpt = this.config.confusionOptions;
        this.cleanFiles = this.config.cleanFiles;
        this.patterns = this.config.files || null;
        this.specFiles = this.config.specificFiles;
        this.codefiles = this._initCodeFiles();
    }
    /**
     * 初始化需要加密的文件列表
     */
    _initCodeFiles() {
        if (!this.patterns)
            return [];
        const files = globby_1.default.sync(this.patterns, { cwd: this.basePath });
        return files;
    }
    /**
     * 加密代码
     */
    encrypt() {
        if (EncryptTypes.indexOf(this.type) === -1)
            return;
        if (this.target === 'frontend' && (this.type === 'bytecode' || this.type === 'strict'))
            return;
        console.log(chalk_1.default.blue('[ee-bin] [encrypt] ') + `start ciphering ${this.target}`);
        for (const file of this.codefiles) {
            const fullpath = path_1.default.join(this.encryptDir, file);
            if (!fs_1.default.statSync(fullpath).isFile())
                continue;
            // 特殊文件处理
            if (this.specFiles.includes(file)) {
                this.generate(fullpath, 'confusion');
                continue;
            }
            this.generate(fullpath);
        }
        console.log(chalk_1.default.blue('[ee-bin] [encrypt] ') + 'end ciphering');
    }
    /**
     * 递归
     */
    loop(dirPath) {
        let files = [];
        if (fs_1.default.existsSync(dirPath)) {
            files = fs_1.default.readdirSync(dirPath);
            files.forEach((file) => {
                const curPath = dirPath + '/' + file;
                if (fs_1.default.statSync(curPath).isDirectory()) {
                    this.loop(curPath);
                }
                else {
                    const extname = path_1.default.extname(curPath);
                    if (this.filesExt.indexOf(extname) !== -1) {
                        this.generate(curPath);
                    }
                }
            });
        }
    }
    /**
     * 生成文件
     */
    generate(curPath, type) {
        const encryptType = type ? type : this.type;
        const tips = chalk_1.default.blue('[ee-bin] [encrypt] ') + 'file: ' + chalk_1.default.green(`${curPath}`) + ' ' + chalk_1.default.cyan(`(${encryptType})`);
        console.log(tips);
        if (encryptType === 'strict') {
            this.generateJSConfuseFile(curPath);
            this.generateBytecodeFile(curPath);
        }
        else if (encryptType === 'bytecode') {
            this.generateBytecodeFile(curPath);
        }
        else if (encryptType === 'confusion') {
            this.generateJSConfuseFile(curPath);
        }
        else {
            // none
        }
    }
    /**
     * 使用 javascript-obfuscator 生成压缩/混淆文件
     */
    generateJSConfuseFile(file) {
        const opt = Object.assign({
            compact: true,
            stringArray: true,
            stringArrayThreshold: 1,
        }, this.cOpt);
        const code = fs_1.default.readFileSync(file, "utf8");
        const result = javascript_obfuscator_1.default.obfuscate(code, opt);
        fs_1.default.writeFileSync(file, result.getObfuscatedCode(), "utf8");
    }
    /**
     * 生成字节码文件
     */
    generateBytecodeFile(curPath) {
        if (path_1.default.extname(curPath) !== '.js') {
            return;
        }
        //let jscFile = curPath.replace(/.js/g, '.jsc');
        const jscFile = curPath + 'c';
        const opt = Object.assign({
            filename: curPath,
            output: jscFile,
            electron: true
        }, this.bOpt);
        bytenode_1.default.compileFile(opt);
        fs_extra_1.default.removeSync(curPath);
    }
}
function encrypt(options = {}) {
    const electronOpt = (0, extend_1.extend)(true, {
        target: 'electron',
    }, options);
    const electronEpt = new Encrypt(electronOpt);
    electronEpt.encrypt();
    const frontendOpt = (0, extend_1.extend)(true, {
        target: 'frontend',
    }, options);
    const frontendEpt = new Encrypt(frontendOpt);
    frontendEpt.encrypt();
}
function cleanEncrypt(options = {}) {
    // [todo] 删除前端和主进程代码
    return;
    const dirOption = options.dir;
    if (dirOption && typeof dirOption === 'string') {
        const tmpFile = path_1.default.join(process.cwd(), dirOption);
        if (fs_1.default.existsSync(tmpFile)) {
            fs_extra_1.default.removeSync(tmpFile);
            console.log(chalk_1.default.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk_1.default.magenta(`${tmpFile}`));
        }
    }
    else if (dirOption && Array.isArray(dirOption)) {
        const arrayDirOption = dirOption;
        arrayDirOption.forEach((file) => {
            if (typeof file === 'string') {
                const tmpFile = path_1.default.join(process.cwd(), file);
                if (fs_1.default.existsSync(tmpFile)) {
                    fs_extra_1.default.removeSync(tmpFile);
                    console.log(chalk_1.default.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk_1.default.magenta(`${tmpFile}`));
                }
            }
        });
    }
    else {
        // 默认清理目录
        const defaultDir = './public/electron';
        const tmpFile = path_1.default.join(process.cwd(), defaultDir);
        if (fs_1.default.existsSync(tmpFile)) {
            fs_extra_1.default.removeSync(tmpFile);
            console.log(chalk_1.default.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk_1.default.magenta(`${tmpFile}`));
        }
    }
}
//# sourceMappingURL=encrypt.js.map