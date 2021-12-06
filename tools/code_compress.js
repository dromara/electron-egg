'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const UglifyJS = require('uglify-js');


console.log('[electron] [code_compress] moving frontend asset to egg public dir');
console.log('[electron] [code_compress] start');

class codeCompress {
  constructor(options = {}) {
    this.dirs = [
      'app',
      'electron'
    ];
  }

  /**
   * 备份 app、electron目录代码
   */
  backup () {
    let backupCodeDir = path.normalize(__dirname + '/../backup_code');
    if (!fs.existsSync(backupCodeDir)) {
      this.mkdir(backupCodeDir);
      this.chmodPath(backupCodeDir, '777');
    }

    for (let i = 0; i < this.dirs.length; i++) {
      // check code dir
      let codeDirPath = path.normalize(__dirname + '/../' + this.dirs[i]);
      if (!this.fileExist(codeDirPath)) {
        console.log('[electron] [code_compress] ERROR %s not exist', codeDirPath);
        return
      }

      // copy
      let targetDir = path.join(backupCodeDir, this.dirs[i]);
      fsPro.copySync(codeDirPath, targetDir);  

    }
  }

  /**
   * 检查文件是否存在
   */
  fileExist (filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  };

  mkdir (dirpath, dirname) {
    // 判断是否是第一次调用
    if (typeof dirname === 'undefined') {
      if (fs.existsSync(dirpath)) {
        return;
      }
      this.mkdir(dirpath, path.dirname(dirpath));
    } else {
      // 判断第二个参数是否正常，避免调用时传入错误参数
      if (dirname !== path.dirname(dirpath)) {
        this.mkdir(dirpath);
        return;
      }
      if (fs.existsSync(dirname)) {
        fs.mkdirSync(dirpath);
      } else {
        this.mkdir(dirname, path.dirname(dirname));
        fs.mkdirSync(dirpath);
      }
    }
  
    console.log('==> dir end', dirpath);
  };

  chmodPath (path, mode) {
    let files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
        const curPath = path + '/' + file;
        if (fs.statSync(curPath).isDirectory()) {
          this.chmodPath(curPath, mode); // 递归删除文件夹
        } else {
          fs.chmodSync(curPath, mode);
        }
      });
      fs.chmodSync(path, mode);
    }
  };
}




