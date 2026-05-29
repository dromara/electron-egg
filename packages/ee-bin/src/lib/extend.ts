const toStr = Object.prototype.toString;

export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  const proto = Object.getPrototypeOf(obj as object);
  if (proto === null) return true;

  // Object with Object.prototype as direct prototype is plain
  const Ctor = proto.constructor;
  return typeof Ctor === 'function' && Ctor === Object;
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
      // Block prototype pollution keys
      if (name === '__proto__' || name === 'constructor' || name === 'prototype') continue;

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