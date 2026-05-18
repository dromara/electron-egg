const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
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
  deep: boolean,
  target: T,
  ...sources: Array<Record<string, unknown> | undefined | null>
): T {
  let result: Record<string, unknown> = { ...target };

  for (const options of sources) {
    if (!options) continue;

    for (const name of Object.keys(options)) {
      if (name === '__proto__') continue;

      const src = result[name];
      const copy = options[name];

      if (result === copy) continue;

      if (deep && copy && isPlainObject(copy)) {
        const clone = src && isPlainObject(src) ? src : {};
        result[name] = extend(true, clone, copy);
      } else if (typeof copy !== 'undefined') {
        result[name] = copy;
      }
    }
  }

  return result as T;
}
