"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FULLPATH = exports.EXPORTS = exports.FileLoader = void 0;
const debug_1 = __importDefault(require("debug"));
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const globby_1 = __importDefault(require("globby"));
const is_type_of_1 = __importDefault(require("is-type-of"));
const utils_1 = require("../utils");
const FULLPATH = Symbol('LOADER_ITEM_FULLPATH');
exports.FULLPATH = FULLPATH;
const EXPORTS = Symbol('LOADER_ITEM_EXPORTS');
exports.EXPORTS = EXPORTS;
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
        (0, assert_1.default)(options.directory, 'options.directory is required');
        this.options = Object.assign({}, defaults, options);
        (0, debug_1.default)(`[constructor] options: ${JSON.stringify(this.options)}`);
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
                    if (obj && !is_type_of_1.default.primitive(obj)) {
                        obj[FULLPATH] = item.fullpath;
                        obj[EXPORTS] = true;
                    }
                }
                else {
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
            files = (0, utils_1.filePatterns)();
        }
        else {
            files = Array.isArray(files) ? files : [files];
        }
        let directories = this.options.directory;
        if (!Array.isArray(directories)) {
            directories = [directories];
        }
        const items = [];
        (0, debug_1.default)(`[parse] directories ${JSON.stringify(directories)}`);
        for (const directory of directories) {
            const filepaths = globby_1.default.sync(files, { cwd: directory });
            (0, debug_1.default)(`[parse] filepaths ${JSON.stringify(filepaths)}`);
            for (const filepath of filepaths) {
                const fullpath = path_1.default.join(directory, filepath);
                if (!fs_1.default.statSync(fullpath).isFile())
                    continue;
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
                if (exports == null)
                    continue;
                // set properties of class
                if (is_type_of_1.default.class(exports) || (0, utils_1.isBytecodeClass)(exports)) {
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
exports.FileLoader = FileLoader;
// convert file path to an array of properties
// a/b/c.js => ['a', 'b', 'c']
function getProperties(filepath, { caseStyle }) {
    // if caseStyle is function, return the result of function
    if (is_type_of_1.default.function(caseStyle)) {
        const result = caseStyle(filepath);
        (0, assert_1.default)(is_type_of_1.default.array(result), `caseStyle expect an array, but got ${result}`);
        return result;
    }
    // use default camelize
    return defaultCamelize(filepath, caseStyle);
}
// Get exports from filepath
// If exports is null/undefined, it will be ignored
function getExports(fullpath, { initializer, call, inject }, pathName) {
    let exports = (0, utils_1.loadFile)(fullpath);
    //debug('[getExports] exports %o', exports);
    if (initializer) {
        // exports type is Class or Object
        exports = initializer(exports, { path: fullpath, pathName });
    }
    if (is_type_of_1.default.class(exports) || is_type_of_1.default.generatorFunction(exports) || is_type_of_1.default.asyncFunction(exports) || (0, utils_1.isBytecodeClass)(exports)) {
        return exports;
    }
    // whether to execute the function
    if (call && is_type_of_1.default.function(exports)) {
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
//# sourceMappingURL=file_loader.js.map