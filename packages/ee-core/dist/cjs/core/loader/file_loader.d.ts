declare const FULLPATH: unique symbol;
declare const EXPORTS: unique symbol;
/**
 * Load files from directory to target object.
 */
declare class FileLoader {
    private options;
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
    constructor(options: any);
    /**
     * attach items to target object. Mapping the directory to properties.
     * `xxx/group/repository.js` => `target.group.repository`
     * @return {Object} target
     */
    load(): any;
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
    parse(): any[];
}
export { FileLoader, EXPORTS, FULLPATH, };
