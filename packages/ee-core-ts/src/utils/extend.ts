import type { ExtendOptions } from '../types/index.js';

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  const plainObj = obj as Record<string, unknown>;
  const hasOwnConstructor = hasOwn.call(plainObj, 'constructor');
  const hasIsPrototypeOf =
    plainObj.constructor &&
    (plainObj.constructor.prototype as Record<string, unknown>) &&
    hasOwn.call(plainObj.constructor.prototype, 'isPrototypeOf');

  // Not own constructor property must be Object
  if (plainObj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  let key: string | undefined;
  for (key in plainObj) {
    // empty
  }

  return typeof key === 'undefined' || hasOwn.call(plainObj, key);
}

export function extend(
  deep: boolean | ExtendOptions,
  target: Record<string, unknown>,
  ...sources: Array<Record<string, unknown> | undefined | null>
): Record<string, unknown> {
  // Handle a deep copy situation
  const isDeep = typeof deep === 'boolean' ? deep : deep?.deep ?? false;

  for (const source of sources) {
    // Only deal with non-null/undefined values
    if (!source) continue;

    // Extend the base object
    for (const key of Object.keys(source)) {
      if (key === '__proto__') continue;
      const val = source[key];
      const src = target[key];
      // Prevent never-ending loop
      if (target === val) continue;
      // Recurse if we're merging plain objects
      if (isDeep && val && isPlainObject(val)) {
        const clone = src && isPlainObject(src) ? src : {};
        target[key] = extend(true, clone as Record<string, unknown>, val as Record<string, unknown>);
      } else if (typeof val !== 'undefined') {
        // Don't bring in undefined values
        target[key] = val;
      }
    }
  }

  // Return the modified object
  return target;
}
