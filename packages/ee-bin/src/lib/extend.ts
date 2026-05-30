/**
 * Deep Merge Utility — replaces lodash.merge
 *
 * Why a custom implementation instead of lodash:
 *  1. lodash.merge merges array indices (merging [a] and [b] yields [a+b] instead of [b]),
 *     which is not the expected behavior for config merging — user config should fully
 *     override default arrays, not merge them element-by-element.
 *  2. lodash does not have built-in prototype pollution protection; extra configuration needed.
 *  3. Only deep merge is needed — importing the entire lodash package is not worth it.
 *
 * Behavior of this implementation:
 *  - Object-type properties → recursively deep merge
 *  - Non-object-type properties → direct override (arrays are also overridden, not index-merged)
 *  - Safety guard → rejects __proto__, constructor, prototype keys to prevent prototype pollution
 */

const toStr = Object.prototype.toString;

/**
 * Check whether a value is a plain object (created via {} or Object.create(null)).
 * Excludes arrays, Date, RegExp, Map, Set, and other objects with special prototype chains.
 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  const proto = Object.getPrototypeOf(obj as object);
  // Objects created via Object.create(null) have no prototype, treat as plain object
  if (proto === null) return true;

  // Plain objects have constructor === Object (excludes custom class instances, Date, etc.)
  const Ctor = proto.constructor;
  return typeof Ctor === 'function' && Ctor === Object;
}

/**
 * Recursively deep merge configuration objects
 *
 * @param deep - true for deep merge (recursive for objects), false for shallow merge (direct override)
 * @param target - Merge target (typically the default config)
 * @param sources - Merge sources (typically the user config); undefined/null sources are skipped
 * @returns A new merged object (does not mutate the original target)
 *
 * Key behaviors:
 *  - Non-object properties in source directly override target properties (including arrays)
 *  - Plain object properties in source are recursively merged with plain object properties in target
 *  - If the target property is not a plain object, the source object completely overrides it (no merge)
 *  - Filters __proto__/constructor/prototype keys to prevent prototype pollution attacks
 */
export function extend<T extends Record<string, unknown>>(
  deep: boolean,
  target: T,
  ...sources: Array<Record<string, unknown> | undefined | null>
): T {
  let result: Record<string, unknown> = { ...target };

  for (const options of sources) {
    if (!options) continue;

    for (const name of Object.keys(options)) {
      // Block prototype pollution keys:
      // __proto__ can modify object prototype,
      // constructor can override the constructor function,
      // prototype can pollute the global prototype chain.
      if (name === '__proto__' || name === 'constructor' || name === 'prototype') continue;

      const src = result[name];
      const copy = options[name];

      // Prevent infinite recursion from circular references
      if (result === copy) continue;

      if (deep && copy && isPlainObject(copy)) {
        // Deep merge: if target property is also a plain object, recursively merge;
        // otherwise use an empty {} as base (ensures all source properties take effect)
        const clone = src && isPlainObject(src) ? src : {};
        result[name] = extend(true, clone, copy);
      } else if (typeof copy !== 'undefined') {
        // Non-deep merge or non-plain-object: direct override (arrays, strings, numbers, etc.)
        result[name] = copy;
      }
    }
  }

  return result as T;
}
