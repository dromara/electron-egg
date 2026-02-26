"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = void 0;
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const is_type_of_1 = __importDefault(require("is-type-of"));
const ps_1 = require("../ps");
const timing_1 = require("../core/utils/timing");
const file_loader_1 = require("../core/loader/file_loader");
const utils_1 = require("../core/utils");
const debugLog = (0, debug_1.default)('ee-core:controller:controller_loader');
class ControllerLoader {
    constructor() {
        this.timing = new timing_1.Timing();
    }
    /**
     * Load controller/xxx.js
     */
    load() {
        this.timing.start('Load Controller', Date.now());
        const opt = {
            caseStyle: 'lower',
            directory: path_1.default.join((0, ps_1.getElectronDir)(), 'controller'),
            initializer: (obj, opt) => {
                if (is_type_of_1.default.class(obj) || (0, utils_1.isBytecodeClass)(obj)) {
                    obj.prototype.pathName = opt.pathName;
                    obj.prototype.fullPath = opt.path;
                    return wrapClass(obj);
                }
                return obj;
            },
        };
        const target = new file_loader_1.FileLoader(opt).load();
        debugLog("[load] controllers: %o", target);
        this.timing.end('Load Controller');
        return target;
    }
}
exports.ControllerLoader = ControllerLoader;
// wrap the class, yield a object with middlewares
function wrapClass(Controller) {
    let proto = Controller.prototype;
    const ret = {};
    // tracing the prototype chain
    while (proto !== Object.prototype) {
        const keys = Object.getOwnPropertyNames(proto);
        // debug("[wrapClass] keys:", keys);
        for (const key of keys) {
            // getOwnPropertyNames will return constructor
            // that should be ignored
            if (key === 'constructor') {
                continue;
            }
            // skip getter, setter & non-function properties
            const d = Object.getOwnPropertyDescriptor(proto, key);
            // prevent to override sub method
            if (is_type_of_1.default.function(d.value) && !ret.hasOwnProperty(key)) {
                ret[key] = methodToMiddleware(Controller, key);
                ret[key][file_loader_1.FULLPATH] = Controller.prototype.fullPath + '#' + Controller.name + '.' + key + '()';
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    return ret;
}
function methodToMiddleware(Controller, key) {
    return function classControllerMiddleware(...args) {
        const controller = new Controller();
        return (0, utils_1.callFn)(controller[key], args, controller);
    };
}
//# sourceMappingURL=controller_loader.js.map