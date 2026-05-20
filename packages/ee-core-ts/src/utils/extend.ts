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

export function extend<T extends Record<string, unknown>>(
  deep: boolean | ExtendOptions,
  target: T,
  ...sources: Array<Record<string, unknown> | undefined | null>
): T {
  // Handle a deep copy situation
  const isDeep = typeof deep === 'boolean' ? deep : deep?.deep ?? false;
  let result: Record<string, unknown> = { ...target };

  for (const source of sources) {
    // Only deal with non-null/undefined values
    if (!source) continue;

    // Extend the base object
    for (const key of Object.keys(source)) {
      if (key === '__proto__') continue;
      const val = source[key];
      // Prevent never-ending loop
      if (isDeep && isPlainObject(val) && isPlainObject(result[key])) {
        // Recurse if we're merging plain objects
        // Never move original objects, clone them
        result[key] = extend(true, result[key] as Record<string, unknown>, val);
      } else {
        // Don't bring in undefined values
        result[key] = val;
      }
    }
  }

  // Return the modified object
  return result as T;
}
