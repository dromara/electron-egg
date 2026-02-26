import debug from "debug";
import assert from "assert";
import fs from "fs";
import path from "path";
import globby from "globby";
import is from "is-type-of";
import { isBytecodeClass, loadFile, filePatterns } from "../utils";
const FULLPATH = Symbol("LOADER_ITEM_FULLPATH");
const EXPORTS = Symbol("LOADER_ITEM_EXPORTS");
const defaults = {
  directory: null,
  target: null,
  match: void 0,
  caseStyle: "camel",
  initializer: null,
  call: true,
  inject: void 0
};
class FileLoader {
  /**
   * @class
   * @param {Object} options - options
   * @param {String|Array} options.directory - directories to be loaded
   * @param {Object} options.target - attach the target object from loaded files
   * @param {String} options.match - match the files when load, support glob, default to all js files
   * @param {Function} options.initializer - custom file exports, receive two parameters, first is the inject object(if not js file, will be content buffer), second is an `options` object that contain `path`
   * @param {Boolean} options.call - determine whether invoke when exports is function
   * @param {Object} options.inject - an object that be the argument when invoke the function
   * @param {String|Function} options.caseStyle - set property's case when converting a filepath to property list.
   */
  constructor(options) {
    assert(options.directory, "options.directory is required");
    this.options = Object.assign({}, defaults, options);
    debug(`[constructor] options: ${JSON.stringify(this.options)}`);
  }
  /**
   * attach items to target object. Mapping the directory to properties.
   * `xxx/group/repository.js` => `target.group.repository`
   * @return {Object} target
   */
  load() {
    const items = this.parse();
    const target = {};
    for (const item of items) {
      item.properties.reduce((target2, property, index) => {
        let obj;
        if (index === item.properties.length - 1) {
          obj = item.exports;
          if (obj && !is.primitive(obj)) {
            obj[FULLPATH] = item.fullpath;
            obj[EXPORTS] = true;
          }
        } else {
          obj = target2[property] || {};
        }
        target2[property] = obj;
        return obj;
      }, target);
    }
    return target;
  }
  /**
   * Parse files from given directories, then return an items list, each item contains properties and exports.
   * For example, parse `controller/group/repository.js`
   * It returns a item
   * ```
   * {
   *   fullpath: '',
   *   properties: [ 'group', 'repository' ],
   *   exports: { ... },
   * }
   * ```
   * `Properties` is an array that contains the directory of a filepath.
   * `Exports` depends on type, if exports is a function, it will be called. if initializer is specified, it will be called with exports for customizing.
   * @return {Array} items
   */
  parse() {
    let files = this.options.match;
    if (!files) {
      files = filePatterns();
    } else {
      files = Array.isArray(files) ? files : [files];
    }
    let directories = this.options.directory;
    if (!Array.isArray(directories)) {
      directories = [directories];
    }
    const items = [];
    debug(`[parse] directories ${JSON.stringify(directories)}`);
    for (const directory of directories) {
      const filepaths = globby.sync(files, { cwd: directory });
      debug(`[parse] filepaths ${JSON.stringify(filepaths)}`);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        if (!fs.statSync(fullpath).isFile()) continue;
        const properties = getProperties(filepath, this.options);
        const pathName = directory.split(/[/\\]/).slice(-1) + "." + properties.join(".");
        let exports = getExports(fullpath, this.options, pathName);
        if (exports == null) continue;
        if (is.class(exports) || isBytecodeClass(exports)) {
          exports.prototype.pathName = pathName;
          exports.prototype.fullPath = fullpath;
        }
        items.push({ fullpath, properties, exports });
      }
    }
    return items;
  }
}
function getProperties(filepath, { caseStyle }) {
  if (is.function(caseStyle)) {
    const result = caseStyle(filepath);
    assert(is.array(result), `caseStyle expect an array, but got ${result}`);
    return result;
  }
  return defaultCamelize(filepath, caseStyle);
}
function getExports(fullpath, { initializer, call, inject }, pathName) {
  let exports = loadFile(fullpath);
  if (initializer) {
    exports = initializer(exports, { path: fullpath, pathName });
  }
  if (is.class(exports) || is.generatorFunction(exports) || is.asyncFunction(exports) || isBytecodeClass(exports)) {
    return exports;
  }
  if (call && is.function(exports)) {
    exports = exports(inject);
    if (exports != null) {
      return exports;
    }
  }
  return exports;
}
function defaultCamelize(filepath, caseStyle) {
  const properties = filepath.substring(0, filepath.lastIndexOf(".")).split("/");
  return properties.map((property) => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }
    property = property.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());
    let first = property[0];
    switch (caseStyle) {
      case "lower":
        first = first.toLowerCase();
        break;
      case "upper":
        first = first.toUpperCase();
        break;
      case "camel":
      default:
    }
    return first + property.substring(1);
  });
}
export {
  EXPORTS,
  FULLPATH,
  FileLoader
};
