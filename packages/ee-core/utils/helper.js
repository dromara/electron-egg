const fs = require('fs');
const mkdirp = require('mkdirp');
const convert = require('koa-convert');
const is = require('is-type-of');
const path = require('path');
const chalk = require('chalk');
const { parseArgv } = require('./pargv');

const _basePath = process.cwd();

function fnDebounce() {
  const fnObject = {};
  let timer;

  return (fn, delayTime, isImediate, args) => {
    const setTimer = () => {
      timer = setTimeout(() => {
        fn(args);
        clearTimeout(timer);
        delete fnObject[fn];
      }, delayTime);

      fnObject[fn] = { delayTime, timer };
    };

    if (!delayTime || isImediate) return fn(args);

    if (fnObject[fn]) {
      clearTimeout(timer);
      setTimer(fn, delayTime, args);
    } else {
      setTimer(fn, delayTime, args);
    }
  };
}

// 随机10位字符串
function getRandomString() {
  return Math.random().toString(36).substring(2);
};

// 创建文件夹
function mkdir(filepath, opt = {}) {
  mkdirp.sync(filepath, opt);
  return
}

// 修改文件权限
function chmodPath(path, mode) {
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

// 版本号比较
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

function middleware(fn) {
  return is.generatorFunction(fn) ? convert(fn) : fn;
}

// 序列化对象
function stringify(obj, ignore = []) {
  const result = {};
  Object.keys(obj).forEach(key => {
      if (!ignore.includes(key)) {
      result[key] = obj[key];
      }
  });
  return JSON.stringify(result);
}

// 是否有效值
function validValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== ''
  );
}

function checkConfig(prop) {
  const filepath = path.join(_basePath, prop);
  if (fs.existsSync(filepath)) {
    return true;
  }
  
  return false;
}

function loadConfig(prop) {
  const configFile = prop;
  const filepath = path.join(_basePath, configFile);
  if (!fs.existsSync(filepath)) {
    const errorTips = 'config file ' + chalk.blue(`${filepath}`) + ' does not exist !';
    throw new Error(errorTips)
  }
  const obj = require(filepath);
  if (!obj) return obj;

  let ret = obj;
  if (is.function(obj) && !is.class(obj)) {
    ret = obj();
  }

  return ret || {};
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

function replaceArgsValue(argv, key, value) {
  key = key + "=";
  for (let i = 0; i < argv.length; i++) {
    let item = argv[i];
    let pos = item.indexOf(key);
    if (pos !== -1) {
      pos = pos + key.length;
      let tmpStr = item.substring(0, pos);
      argv[i] = tmpStr + value;
      break;
    }
  }

  return argv;
};

function getValueFromArgv(argv, key) {
  const argvObj = parseArgv(argv);
  if (argvObj.hasOwnProperty(key)) {
    return argvObj[key];
  }

  // match search
  key = key + "=";
  let value;
  for (let i = 0; i < argv.length; i++) {
    let item = argv[i];
    let pos = item.indexOf(key);
    if (pos !== -1) {
      pos = pos + key.length;
      value = item.substring(pos);
      break;
    }
  }

  return value;
};

function fileIsExist(filepath) {
  if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
    return true;
  }
  return false;
};

module.exports = {
  fnDebounce,
  getRandomString,
  mkdir,
  chmodPath,
  compareVersion,
  middleware,
  stringify,
  validValue,
  checkConfig,
  loadConfig,
  sleep,
  replaceArgsValue,
  getValueFromArgv,
  fileIsExist
};