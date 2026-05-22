export function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return typeof val === 'function';
}

export function isClass(val: unknown): val is new (...args: unknown[]) => unknown {
  return typeof val === 'function' && /^\s*class\b/.test(val.toString());
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

export function isPrimitive(val: unknown): boolean {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

export function isGeneratorFunction(val: unknown): boolean {
  return typeof val === 'function' && val.constructor?.name === 'GeneratorFunction';
}

export function isAsyncFunction(val: unknown): boolean {
  return typeof val === 'function' && val.constructor?.name === 'AsyncFunction';
}