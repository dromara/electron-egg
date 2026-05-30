/**
 * @module utils/type_check
 * @description 运行时类型检查工具。提供一组类型守卫（Type Guard）函数，
 * 用于在运行时判断值的类型，配合 TypeScript 的类型窄化使用。
 *
 * 与 utils/is.ts 的区别：is.ts 检测 Electron 运行环境（进程类型、操作系统），
 * 本模块检测 JavaScript 值的类型（函数、类、对象等）。
 */

/**
 * 判断值是否为函数
 *
 * 涵盖普通函数、箭头函数、类构造函数、async 函数等所有可调用类型。
 *
 * @param val - 待检查的值
 * @returns true 表示值是函数类型，同时 TypeScript 会将 val 窄化为函数类型
 */
export function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return typeof val === 'function';
}

/**
 * 判断值是否为 ES6 类（class）
 *
 * 通过检查函数的 toString() 输出是否以 'class' 关键字开头来区分类和普通函数。
 * 注意：通过 function 声明的构造函数不会被识别为类。
 *
 * @param val - 待检查的值
 * @returns true 表示值是 class 声明的类
 */
export function isClass(val: unknown): val is new (...args: unknown[]) => unknown {
  return typeof val === 'function' && /^\s*class\b/.test(val.toString());
}

/**
 * 判断值是否为字符串
 *
 * @param val - 待检查的值
 * @returns true 表示值是 string 类型
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

/**
 * 判断值是否为纯对象
 *
 * 纯对象指通过 {} 或 new Object() 创建的对象。
 * 排除 null、数组和类实例。
 *
 * @param val - 待检查的值
 * @returns true 表示值是非 null、非数组的普通对象
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * 判断值是否为数组
 *
 * @param val - 待检查的值
 * @returns true 表示值是 Array 实例
 */
export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

/**
 * 判断值是否为原始类型
 *
 * 原始类型包括：null、undefined、string、number、boolean、symbol、bigint。
 * 即非对象且非函数的值。
 *
 * @param val - 待检查的值
 * @returns true 表示值是原始类型
 */
export function isPrimitive(val: unknown): boolean {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

/**
 * 判断值是否为生成器函数（function*）
 *
 * 通过检查函数构造器的名称是否为 'GeneratorFunction' 来判断。
 * 生成器函数使用 function* 声明，返回 Generator 对象。
 *
 * @param val - 待检查的值
 * @returns true 表示值是生成器函数
 */
export function isGeneratorFunction(val: unknown): boolean {
  return typeof val === 'function' && val.constructor?.name === 'GeneratorFunction';
}

/**
 * 判断值是否为异步函数（async function）
 *
 * 通过检查函数构造器的名称是否为 'AsyncFunction' 来判断。
 * 异步函数使用 async 关键字声明，返回 Promise。
 *
 * @param val - 待检查的值
 * @returns true 表示值是异步函数
 */
export function isAsyncFunction(val: unknown): boolean {
  return typeof val === 'function' && val.constructor?.name === 'AsyncFunction';
}
