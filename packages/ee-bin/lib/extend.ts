

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

function isPlainObject(obj: any): boolean {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  const hasOwnConstructor = hasOwn.call(obj, 'constructor');
  const hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  // Not own constructor property must be Object
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  let key: string | undefined;
  for (key in obj) { /**/ }

  return typeof key === 'undefined' || hasOwn.call(obj, key!);
};

function extend<T>(...args: any[]): T {
  let options: any, name: string, src: any, copy: any, clone: any;
  let target: any = args[0];
  let i = 1;
  const length = args.length;
  let deep = false;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = args[1] || {};
    // skip the boolean and the target
    i = 2;
  } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
    target = {};
  }

  for (; i < length; ++i) {
    options = args[i];
    // Only deal with non-null/undefined values
    if (options == null) continue;

    // Extend the base object
    for (name in options) {
      if (name === '__proto__') continue;

      src = target[name];
      copy = options[name];

      // Prevent never-ending loop
      if (target === copy) continue;

      // Recurse if we're merging plain objects
      if (deep && copy && isPlainObject(copy)) {
        clone = src && isPlainObject(src) ? src : {};
        // Never move original objects, clone them
        target[name] = extend(deep, clone, copy);

      // Don't bring in undefined values
      } else if (typeof copy !== 'undefined') {
        target[name] = copy;
      }
    }
  }

  // Return the modified object
  return target as T;
};

export {
  extend,
  isPlainObject,
};