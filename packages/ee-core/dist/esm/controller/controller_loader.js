import debug from "debug";
import path from "path";
import is from "is-type-of";
import { getElectronDir } from "../ps";
import { Timing } from "../core/utils/timing";
import { FileLoader, FULLPATH } from "../core/loader/file_loader";
import { isBytecodeClass, callFn } from "../core/utils";
const debugLog = debug("ee-core:controller:controller_loader");
class ControllerLoader {
  constructor() {
    this.timing = new Timing();
  }
  /**
   * Load controller/xxx.js
   */
  load() {
    this.timing.start("Load Controller", Date.now());
    const opt = {
      caseStyle: "lower",
      directory: path.join(getElectronDir(), "controller"),
      initializer: (obj, opt2) => {
        if (is.class(obj) || isBytecodeClass(obj)) {
          obj.prototype.pathName = opt2.pathName;
          obj.prototype.fullPath = opt2.path;
          return wrapClass(obj);
        }
        return obj;
      }
    };
    const target = new FileLoader(opt).load();
    debugLog("[load] controllers: %o", target);
    this.timing.end("Load Controller");
    return target;
  }
}
function wrapClass(Controller) {
  let proto = Controller.prototype;
  const ret = {};
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    for (const key of keys) {
      if (key === "constructor") {
        continue;
      }
      const d = Object.getOwnPropertyDescriptor(proto, key);
      if (is.function(d.value) && !ret.hasOwnProperty(key)) {
        ret[key] = methodToMiddleware(Controller, key);
        ret[key][FULLPATH] = Controller.prototype.fullPath + "#" + Controller.name + "." + key + "()";
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return ret;
}
function methodToMiddleware(Controller, key) {
  return function classControllerMiddleware(...args) {
    const controller = new Controller();
    return callFn(controller[key], args, controller);
  };
}
export {
  ControllerLoader
};
