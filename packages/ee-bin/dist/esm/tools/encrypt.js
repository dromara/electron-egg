import path from "path";
import fs from "fs";
import fsPro from "fs-extra";
import bytenode from "bytenode";
import JavaScriptObfuscator from "javascript-obfuscator";
import globby from "globby";
import chalk from "chalk";
import { loadConfig } from "../lib/utils";
import { extend } from "../lib/extend";
const EncryptTypes = ["bytecode", "confusion", "strict"];
class Encrypt {
  constructor(options = {}) {
    const { config, out, target = "electron" } = options;
    this.basePath = process.cwd();
    this.target = target;
    const conf = loadConfig(config).encrypt;
    this.config = conf[target];
    const outputFolder = out || this.config.encryptDir;
    this.encryptDir = path.join(this.basePath, outputFolder);
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
    if (!this.patterns) return [];
    const files = globby.sync(this.patterns, { cwd: this.basePath });
    return files;
  }
  /**
   * 加密代码
   */
  encrypt() {
    if (EncryptTypes.indexOf(this.type) === -1) return;
    if (this.target === "frontend" && (this.type === "bytecode" || this.type === "strict")) return;
    console.log(chalk.blue("[ee-bin] [encrypt] ") + `start ciphering ${this.target}`);
    for (const file of this.codefiles) {
      const fullpath = path.join(this.encryptDir, file);
      if (!fs.statSync(fullpath).isFile()) continue;
      if (this.specFiles.includes(file)) {
        this.generate(fullpath, "confusion");
        continue;
      }
      this.generate(fullpath);
    }
    console.log(chalk.blue("[ee-bin] [encrypt] ") + "end ciphering");
  }
  /**
   * 递归
   */
  loop(dirPath) {
    let files = [];
    if (fs.existsSync(dirPath)) {
      files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const curPath = dirPath + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
          this.loop(curPath);
        } else {
          const extname = path.extname(curPath);
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
    const tips = chalk.blue("[ee-bin] [encrypt] ") + "file: " + chalk.green(`${curPath}`) + " " + chalk.cyan(`(${encryptType})`);
    console.log(tips);
    if (encryptType === "strict") {
      this.generateJSConfuseFile(curPath);
      this.generateBytecodeFile(curPath);
    } else if (encryptType === "bytecode") {
      this.generateBytecodeFile(curPath);
    } else if (encryptType === "confusion") {
      this.generateJSConfuseFile(curPath);
    } else {
    }
  }
  /**
   * 使用 javascript-obfuscator 生成压缩/混淆文件
   */
  generateJSConfuseFile(file) {
    const opt = Object.assign({
      compact: true,
      stringArray: true,
      stringArrayThreshold: 1
    }, this.cOpt);
    const code = fs.readFileSync(file, "utf8");
    const result = JavaScriptObfuscator.obfuscate(code, opt);
    fs.writeFileSync(file, result.getObfuscatedCode(), "utf8");
  }
  /**
   * 生成字节码文件
   */
  generateBytecodeFile(curPath) {
    if (path.extname(curPath) !== ".js") {
      return;
    }
    const jscFile = curPath + "c";
    const opt = Object.assign({
      filename: curPath,
      output: jscFile,
      electron: true
    }, this.bOpt);
    bytenode.compileFile(opt);
    fsPro.removeSync(curPath);
  }
}
function encrypt(options = {}) {
  const electronOpt = extend(true, {
    target: "electron"
  }, options);
  const electronEpt = new Encrypt(electronOpt);
  electronEpt.encrypt();
  const frontendOpt = extend(true, {
    target: "frontend"
  }, options);
  const frontendEpt = new Encrypt(frontendOpt);
  frontendEpt.encrypt();
}
function cleanEncrypt(options = {}) {
  return;
  const dirOption = options.dir;
  if (dirOption && typeof dirOption === "string") {
    const tmpFile = path.join(process.cwd(), dirOption);
    if (fs.existsSync(tmpFile)) {
      fsPro.removeSync(tmpFile);
      console.log(chalk.blue("[ee-bin] [encrypt] ") + "clean up tmp files: " + chalk.magenta(`${tmpFile}`));
    }
  } else if (dirOption && Array.isArray(dirOption)) {
    const arrayDirOption = dirOption;
    arrayDirOption.forEach((file) => {
      if (typeof file === "string") {
        const tmpFile = path.join(process.cwd(), file);
        if (fs.existsSync(tmpFile)) {
          fsPro.removeSync(tmpFile);
          console.log(chalk.blue("[ee-bin] [encrypt] ") + "clean up tmp files: " + chalk.magenta(`${tmpFile}`));
        }
      }
    });
  } else {
    const defaultDir = "./public/electron";
    const tmpFile = path.join(process.cwd(), defaultDir);
    if (fs.existsSync(tmpFile)) {
      fsPro.removeSync(tmpFile);
      console.log(chalk.blue("[ee-bin] [encrypt] ") + "clean up tmp files: " + chalk.magenta(`${tmpFile}`));
    }
  }
}
export {
  cleanEncrypt,
  encrypt
};
