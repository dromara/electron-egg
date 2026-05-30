/**
 * @module utils/extend
 * @description Object deep merge utility. Provides extend() function supporting shallow merge
 * and deep recursive merge, used for framework configuration layer merging
 * (config.default -> config.local -> config.prod) and other object merging scenarios.
 *
 * Deep merge logic:
 * - When deep=true and both target and source properties are plain objects, recursively merge instead of overwrite
 * - Non-undefined source properties overwrite target properties (shallow merge or non-plain-object cases)
 * - Automatically skips __proto__ property, preventing prototype chain pollution attacks
 * - Automatically skips undefined values, will not set target properties to undefined
 * - Detects self-references (target === val), preventing infinite recursion loops
 */
import type { ExtendOptions } from '../types/index.js';

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

/**
 * Determine if a value is a plain object
 *
 * A plain object is one created via {}, new Object(), or Object.create(null).
 * Excludes built-in type instances (Date, RegExp, Buffer, etc.) and custom class instances.
 *
 * Judgment criteria:
 * 1. toString returns '[object Object]'
 * 2. No own constructor or constructor.prototype has isPrototypeOf
 * 3. Last enumerable property is an own property (leveraging JS engine behavior of enumerating own properties first)
 *
 * @param obj - Value to check
 * @returns true if the value is a plain object
 */
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

  // If has constructor but it's not an own property, and no isPrototypeOf on the prototype chain,
  // the constructor comes from prototype chain inheritance, not a plain object
  if (plainObj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // Leverage JS engine behavior of enumerating own properties before inherited ones:
  // If the last enumerable property is own, then all enumerable properties are own
  let key: string | undefined;
  for (key in plainObj) {
    // Iterate to the last item
  }

  return typeof key === 'undefined' || hasOwn.call(plainObj, key);
}

/**
 * Merge object properties
 *
 * Merges properties from multiple source objects into the target object, supporting shallow and deep merge.
 * This is the core implementation for framework configuration layer merging.
 *
 * Merge rules:
 * - Shallow merge (deep=false): source properties directly overwrite target properties
 * - Deep merge (deep=true): plain objects are recursively merged, non-plain-objects are directly overwritten
 * - Skip __proto__ property, preventing prototype chain pollution
 * - Skip undefined values, will not overwrite existing properties with undefined
 * - Detect self-references (target === val), preventing infinite recursion
 *
 * @param deep - Whether to deep merge, can be a boolean or an object with a deep property
 * @param target - Target object, merge result will be written to this object
 * @param sources - One or more source objects, merged into target in order
 * @returns Merged target object
 *
 * @example
 * ```ts
 * // Shallow merge
 * extend(false, { a: 1 }, { a: 2, b: 3 }); // { a: 2, b: 3 }
 *
 * // Deep merge
 * extend(true, { a: { x: 1 } }, { a: { y: 2 } }); // { a: { x: 1, y: 2 } }
 *
 * // Using options object
 * extend({ deep: true }, { a: { x: 1 } }, { a: { y: 2 } }); // { a: { x: 1, y: 2 } }
 * ```
 */
export function extend(
  deep: boolean | ExtendOptions,
  target: Record<string, unknown>,
  ...sources: Array<Record<string, unknown> | undefined | null>
): Record<string, unknown> {
  // Parse deep parameter: boolean used directly, object takes its deep property, defaults to shallow merge
  const isDeep = typeof deep === 'boolean' ? deep : deep?.deep ?? false;

  for (const source of sources) {
    // Skip null and undefined sources
    if (!source) continue;

    for (const key of Object.keys(source)) {
      // Prevent prototype chain pollution: __proto__ property is not merged
      if (key === '__proto__') continue;
      const val = source[key];
      const src = target[key];
      // Detect self-reference: skip when target and val are the same reference, preventing infinite recursion
      if (target === val) continue;
      // Deep merge: when value is a plain object, recursively merge instead of overwrite
      if (isDeep && val && isPlainObject(val)) {
        // If target's corresponding property is also a plain object, recursively merge on the original object; otherwise create a new object
        const clone = src && isPlainObject(src) ? src : {};
        target[key] = extend(true, clone as Record<string, unknown>, val as Record<string, unknown>);
      } else if (typeof val !== 'undefined') {
        // Non-undefined values directly overwrite; undefined values do not overwrite existing properties
        target[key] = val;
      }
    }
  }

  return target;
}
