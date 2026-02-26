import is from 'is-type-of';
import fs from 'fs';
import path from 'path';
import * as CoreUtils from '../core/utils';
import { getElectronDir } from '../ps';

// 加载单个文件(如果是函数，将被执行)
function loadFile(filepath: string, ...inject: any[]) {
  let fullpath: string | undefined = filepath;
  const isAbsolute = path.isAbsolute(fullpath);
  if (!isAbsolute) {
    fullpath = path.join(getElectronDir(), fullpath);
  }

  fullpath = fullpath && resolveModule(fullpath);
  if (!fullpath || !fs.existsSync(fullpath)) {
    let errorMsg = `[ee-core] [loader/index] loadFile ${filepath} does not exist`;
    throw new Error(errorMsg);
  }

  let ret = CoreUtils.loadFile(fullpath);
  if (is.function(ret) && !is.class(ret) && !CoreUtils.isBytecodeClass(ret)) {
    ret = ret(...inject);
  }
  return ret;
}

// requireFile
function requireFile(filepath: string) {
  return CoreUtils.loadFile(filepath);
}

// 加载并运行文件
function execFile(filepath: string, ...inject: any[]) {
  let ret = CoreUtils.loadFile(filepath);
  if (is.class(ret) || CoreUtils.isBytecodeClass(ret)) {
    ret = new ret(inject);
  } else if (is.function(ret)) {
    ret = ret(inject);
  }

  return ret;
}

// 模块的绝对路径
function resolveModule(filepath: string) {
  let fullpath: string | undefined;
  try {
    fullpath = require.resolve(filepath);
  } catch (e) {

    // 特殊后缀处理
    if (filepath && (filepath.endsWith('.defalut') || filepath.endsWith('.prod'))) {
      fullpath = filepath + '.jsc';
    } else if (filepath && filepath.endsWith('.js')) {
      fullpath = filepath + 'c';
    }

    if (!fs.existsSync(filepath) && (!fullpath || !fs.existsSync(fullpath))) {
      let files = { filepath, fullpath };
      console.warn(`[ee-core] [loader] resolveModule unknow filepath: ${JSON.stringify(files)}`);
      return undefined;
    }
  }

  return fullpath;
}

// 获取electron目录下文件的绝对路径
function getFullpath(filepath: string) {
  let fullpath: string | undefined;
  const isAbsolute = path.isAbsolute(filepath);
  if (!isAbsolute) {
    filepath = path.join(getElectronDir(), filepath);
  }

  fullpath = resolveModule(filepath);
  if (!fullpath || !fs.existsSync(fullpath)) {
    throw new Error(`[ee-core] [loader] getFullpath filepath ${filepath} not exists`);
  }

  return fullpath;
}

export {
  loadFile,
  execFile,
  requireFile,
  resolveModule,
  getFullpath,
};
