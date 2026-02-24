'use strict';

const debug = require('debug')('ee-core:core:loader:file_loader');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const is = require('is-type-of');
const { isBytecodeClass, loadFile, filePatterns } = require('../utils');
const FULLPATH = Symbol('LOADER_ITEM_FULLPATH');
const EXPORTS = Symbol('LOADER_ITEM_EXPORTS');

const defaults = {
  directory: null,
  target: null,
  match: undefined,
  caseStyle: 'camel',
  initializer: null,
  call: true,
  inject: undefined,
};

/**
 * Load files from directory to target object.
 */
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
    assert(options.directory, 'options.directory is required');
    this.options = Object.assign({}, defaults, options);
    debug("[constructor] options: %o", this.options);
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
      // item { fullpath, properties: [ 'a', 'b', 'c'], exports }
      item.properties.reduce((target, property, index) => {
        let obj;
        // properties is a path slice, only the last value is the file name
        if (index === item.properties.length - 1) {
          obj = item.exports;
          if (obj && !is.primitive(obj)) {
            obj[FULLPATH] = item.fullpath;
            obj[EXPORTS] = true;
          }
        } else {
          obj = target[property] || {};
        }
        
        target[property] = obj;
        // const properties = item.properties.slice(0, index + 1).join('.');
        // debug('[load] properties: %s', properties);
        return obj;
      }, target);
    }
    //debug('[load] target: %O', target);
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
      files = Array.isArray(files) ? files : [ files ];
    }

    let directories = this.options.directory;
    if (!Array.isArray(directories)) {
      directories = [ directories ];
    }

    const items = [];
    debug('[parse] directories %o', directories);
    
    for (const directory of directories) {
      const filepaths = globby.sync(files, { cwd: directory });
      debug('[parse] filepaths %o', filepaths);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        if (!fs.statSync(fullpath).isFile()) continue;
        // get properties
        // controller/foo/bar.js => [ 'foo', 'bar' ]
        const properties = getProperties(filepath, this.options);
        // debug('[parse] properties %o', properties);
        // controller/foo/bar.js => controller.foo.bar
        const pathName = directory.split(/[/\\]/).slice(-1) + '.' + properties.join('.');
        // debug('[parse] pathName %s', pathName);
        // get exports from the file
        let exports = getExports(fullpath, this.options, pathName);
        // ignore exports when it's null or false returned by filter function
        if (exports == null) continue;

        // set properties of class
        if (is.class(exports) || isBytecodeClass(exports)) {
          exports.prototype.pathName = pathName;
          exports.prototype.fullPath = fullpath;
        }
        items.push({ fullpath, properties, exports });
        //debug('[parse] fullpath %s, properties %o, export %o', fullpath, properties, exports);
      }
    }
    //debug('[parse] items %O', items);
    return items;
  }
}

// convert file path to an array of properties
// a/b/c.js => ['a', 'b', 'c']
function getProperties(filepath, { caseStyle }) {
  // if caseStyle is function, return the result of function
  if (is.function(caseStyle)) {
    const result = caseStyle(filepath);
    assert(is.array(result), `caseStyle expect an array, but got ${result}`);
    return result;
  }
  // use default camelize
  return defaultCamelize(filepath, caseStyle);
}

// Get exports from filepath
// If exports is null/undefined, it will be ignored
function getExports(fullpath, { initializer, call, inject }, pathName) {
  let exports = loadFile(fullpath);
  //debug('[getExports] exports %o', exports);
  if (initializer) {
    // exports type is Class or Object
    exports = initializer(exports, { path: fullpath, pathName });
  }

  if (is.class(exports) || is.generatorFunction(exports) || is.asyncFunction(exports) || isBytecodeClass(exports)) {
    return exports;
  }

  // whether to execute the function
  if (call && is.function(exports)) {
    exports = exports(inject);
    if (exports != null) {
      return exports;
    }
  }

  return exports;
}

function defaultCamelize(filepath, caseStyle) {
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map(property => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }

    // use default camelize, will capitalize the first letter
    // foo_bar.js > FooBar
    // fooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > fooBar
    property = property.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
    let first = property[0];
    switch (caseStyle) {
      case 'lower':
        first = first.toLowerCase();
        break;
      case 'upper':
        first = first.toUpperCase();
        break;
      case 'camel':
      default:
    }
    return first + property.substring(1);
  });
}

module.exports = {
  FileLoader,
  EXPORTS,
  FULLPATH,
};