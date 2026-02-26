import debug from 'debug';
import path from 'path';
import is from 'is-type-of';
import { getElectronDir } from '../ps';
import { Timing } from '../core/utils/timing';
import { FileLoader, FULLPATH } from '../core/loader/file_loader';
import { isBytecodeClass, callFn } from '../core/utils';

const debugLog = debug('ee-core:controller:controller_loader');

class ControllerLoader {
  private timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load controller/xxx.js
   */
  load() {
    this.timing.start('Load Controller', Date.now());

    const opt = {
      caseStyle: 'lower',
      directory: path.join(getElectronDir(), 'controller'),
      initializer: (obj: any, opt: any) => {
        if (is.class(obj) || isBytecodeClass(obj)) {
          obj.prototype.pathName = opt.pathName;
          obj.prototype.fullPath = opt.path;
          return wrapClass(obj);
        }
        return obj;
      },
    };
    const target = new FileLoader(opt).load();
    debugLog("[load] controllers: %o", target);
    this.timing.end('Load Controller');
    return target;
  }
}

// wrap the class, yield a object with middlewares
function wrapClass(Controller: any) {
  let proto = Controller.prototype;
  const ret: any = {};
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
      if (is.function(d!.value) && !ret.hasOwnProperty(key)) {
        ret[key] = methodToMiddleware(Controller, key);
        ret[key][FULLPATH] = Controller.prototype.fullPath + '#' + Controller.name + '.' + key + '()';
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return ret;
}

function methodToMiddleware(Controller: any, key: string) {
  return function classControllerMiddleware(...args: any[]) {
    const controller = new Controller();
    return callFn(controller[key], args, controller);
  };
}

export {
  ControllerLoader
};
