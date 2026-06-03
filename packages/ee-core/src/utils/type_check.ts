/**
 * @module utils/type_check
 * @description Runtime type checking utility. Provides a set of Type Guard functions
 * for determining value types at runtime, used with TypeScript's type narrowing.
 *
 * Difference from utils/is.ts: is.ts detects Electron runtime environment (process type, OS),
 * while this module detects JavaScript value types (functions, classes, objects, etc.).
 */

/**
 * Determine if a value is a function
 *
 * Covers all callable types including regular functions, arrow functions, class constructors, and async functions.
 *
 * @param val - Value to check
 * @returns true if the value is a function type, TypeScript will also narrow val to function type
 */
export function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return typeof val === 'function';
}

/**
 * Determine if a value is an ES6 class
 *
 * Primary check is structural: an ES6 class has a non-writable `prototype`
 * (writable: false), whereas a regular function's prototype is writable, and
 * arrow/async functions have no prototype at all. This reads the runtime object
 * shape rather than source text, so it survives minify and bytecode (.jsc) compilation.
 *
 * Fallback check keeps the previous behavior: sniff the toString() output for a
 * leading `class` keyword, covering any edge case the structural check misses.
 * Note: constructor functions declared with function are not recognized as classes.
 *
 * @param val - Value to check
 * @returns true if the value is a class declared with class
 */
export function isClass(val: unknown): val is new (...args: unknown[]) => unknown {
  if (typeof val !== 'function') return false;
  // Primary: structural check (immune to minify / bytecode compilation)
  const desc = Object.getOwnPropertyDescriptor(val, 'prototype');
  if (desc && desc.writable === false) return true;
  // Fallback: source-string sniffing (preserves prior behavior)
  return /^\s*class\b/.test(val.toString());
}

/**
 * Determine if a value is a string
 *
 * @param val - Value to check
 * @returns true if the value is of type string
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

/**
 * Determine if a value is a plain object
 *
 * A plain object is one created via {} or new Object().
 * Excludes null, arrays, and class instances.
 *
 * @param val - Value to check
 * @returns true if the value is a non-null, non-array ordinary object
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Determine if a value is an array
 *
 * @param val - Value to check
 * @returns true if the value is an Array instance
 */
export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

/**
 * Determine if a value is a primitive type
 *
 * Primitive types include: null, undefined, string, number, boolean, symbol, bigint.
 * That is, values that are neither objects nor functions.
 *
 * @param val - Value to check
 * @returns true if the value is a primitive type
 */
export function isPrimitive(val: unknown): boolean {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

/**
 * Determine if a value is a generator function (function*)
 *
 * Determines by checking if the function constructor's name is 'GeneratorFunction'.
 * Generator functions are declared with function* and return Generator objects.
 *
 * @param val - Value to check
 * @returns true if the value is a generator function
 */
export function isGeneratorFunction(val: unknown): boolean {
  return typeof val === 'function' && val.constructor?.name === 'GeneratorFunction';
}

/**
 * Determine if a value is an async function (async function)
 *
 * Determines by checking if the function constructor's name is 'AsyncFunction'.
 * Async functions are declared with the async keyword and return Promises.
 *
 * @param val - Value to check
 * @returns true if the value is an async function
 */
export function isAsyncFunction(val: unknown): boolean {
  return typeof val === 'function' && val.constructor?.name === 'AsyncFunction';
}
