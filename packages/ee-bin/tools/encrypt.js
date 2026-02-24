'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const is = require('is-type-of');
const bytenode = require('bytenode');
const JavaScriptObfuscator = require('javascript-obfuscator');
const globby = require('globby');
const chalk = require('chalk');
const { loadConfig } = require('../lib/utils');
const { extend } = require('../lib/extend');

const EncryptTypes = ['bytecode', 'confusion', 'strict'];

class Encrypt {
  constructor(options = {}) {
    // cli args
    const { config, out, target } = options;
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
    if (!this.patterns) return;

    const files = globby.sync(this.patterns, { cwd: this.basePath });
    return files;
  }

  /**
   * 加密代码
   */
  encrypt() {
    if (EncryptTypes.indexOf(this.type) == -1) return;
    if (this.target == 'frontend' && (this.type == 'bytecode' || this.type == 'strict')) return;

    console.log(chalk.blue('[ee-bin] [encrypt] ') + `start ciphering ${this.target}`);
    for (const file of this.codefiles) {
      const fullpath = path.join(this.encryptDir, file);
      if (!fs.statSync(fullpath).isFile()) continue;

      // 特殊文件处理
      if (this.specFiles.includes(file)) {
        this.generate(fullpath, 'confusion');
        continue;
      }

      this.generate(fullpath);
    } 
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'end ciphering');
  };

  /**
   * 递归
   */
  loop(dirPath) {
    let files = [];
    if (fs.existsSync(dirPath)) {
      files = fs.readdirSync(dirPath);
      files.forEach((file, index) => {
        let curPath = dirPath + '/' + file;        
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
    let encryptType = type ? type : this.type;

    let tips = chalk.blue('[ee-bin] [encrypt] ') + 'file: ' + chalk.green(`${curPath}`) + ' ' + chalk.cyan(`(${encryptType})`);
    console.log(tips);
    if (encryptType == 'strict') {
      this.generateJSConfuseFile(curPath);
      this.generateBytecodeFile(curPath);
    } else if (encryptType == 'bytecode') {
      this.generateBytecodeFile(curPath);
    } else if (encryptType == 'confusion') {
      this.generateJSConfuseFile(curPath);
    } else {
      // none
    }
  }

  /**
   * 使用 javascript-obfuscator 生成压缩/混淆文件
   */  
  generateJSConfuseFile(file) {
    let opt = Object.assign({
      compact: true,
      stringArray: true,
      stringArrayThreshold: 1,
    }, this.cOpt);
    
    let code = fs.readFileSync(file, "utf8");
    let result = JavaScriptObfuscator.obfuscate(code, opt);
    fs.writeFileSync(file, result.getObfuscatedCode(), "utf8"); 
  }

  /**
   * 生成字节码文件
   */
  generateBytecodeFile(curPath) {
    if (path.extname(curPath) !== '.js') {
      return
    }
    //let jscFile = curPath.replace(/.js/g, '.jsc');
    let jscFile = curPath + 'c';
    let opt = Object.assign({
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
    target: 'electron',
  }, options);
  const electronEpt = new Encrypt(electronOpt);
  electronEpt.encrypt();

  const frontendOpt = extend(true, {
    target: 'frontend',
  }, options);
  const frontendEpt = new Encrypt(frontendOpt);
  frontendEpt.encrypt();
}

function cleanEncrypt(options = {}) {
  // [todo] 删除前端和主进程代码
  return;
  let files = options.dir !== undefined ? options.dir : ['./public/electron'];
  files = is.string(files) ? [files] : files;

  files.forEach((file) => {
    const tmpFile = path.join(process.cwd(), file);
    if (fs.existsSync(tmpFile)) {
      fsPro.removeSync(tmpFile);
      console.log(chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk.magenta(`${tmpFile}`));
    }
  })
}

module.exports = {
  encrypt,
  cleanEncrypt,
};