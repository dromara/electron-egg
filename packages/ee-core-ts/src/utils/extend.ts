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

  if (plainObj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

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
  const isDeep = typeof deep === 'boolean' ? deep : deep?.deep ?? false;
  let result: Record<string, unknown> = { ...target };

  for (const source of sources) {
    if (!source) continue;

    for (const key of Object.keys(source)) {
      if (key === '__proto__') continue;
      const val = source[key];
      if (isDeep && isPlainObject(val) && isPlainObject(result[key])) {
        result[key] = extend(true, result[key] as Record<string, unknown>, val);
      } else {
        result[key] = val;
      }
    }
  }

  return result as T;
}
