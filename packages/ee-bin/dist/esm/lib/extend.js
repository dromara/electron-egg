const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== "[object Object]") {
    return false;
  }
  const hasOwnConstructor = hasOwn.call(obj, "constructor");
  const hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }
  let key;
  for (key in obj) {
  }
  return typeof key === "undefined" || hasOwn.call(obj, key);
}
;
function extend(...args) {
  let options, name, src, copy, clone;
  let target = args[0];
  let i = 1;
  const length = args.length;
  let deep = false;
  if (typeof target === "boolean") {
    deep = target;
    target = args[1] || {};
    i = 2;
  } else if (typeof target !== "object" && typeof target !== "function" || target == null) {
    target = {};
  }
  for (; i < length; ++i) {
    options = args[i];
    if (options == null) continue;
    for (name in options) {
      if (name === "__proto__") continue;
      src = target[name];
      copy = options[name];
      if (target === copy) continue;
      if (deep && copy && isPlainObject(copy)) {
        clone = src && isPlainObject(src) ? src : {};
        target[name] = extend(deep, clone, copy);
      } else if (typeof copy !== "undefined") {
        target[name] = copy;
      }
    }
  }
  return target;
}
;
export {
  extend,
  isPlainObject
};
