/**
 * @module utils/extend
 * @description 对象深度合并工具。提供 extend() 函数，支持浅合并和深度递归合并，
 * 用于框架配置层的合并（config.default → config.local → config.prod）以及
 * 其他需要合并对象的场景。
 *
 * 深度合并逻辑：
 * - 当 deep=true 且目标属性和源属性都是纯对象时，递归合并而非覆盖
 * - 非 undefined 的源属性会覆盖目标属性（浅合并或非纯对象情况）
 * - 自动跳过 __proto__ 属性，防止原型链污染攻击
 * - 自动跳过 undefined 值，不会将目标属性设为 undefined
 * - 检测自引用（target === val），防止无限递归循环
 */
import type { ExtendOptions } from '../types/index.js';

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

/**
 * 判断值是否为纯对象（Plain Object）
 *
 * 纯对象指通过 {}、new Object() 或 Object.create(null) 创建的对象。
 * 排除内置类型实例（Date、RegExp、Buffer 等）和自定义类实例。
 *
 * 判断依据：
 * 1. toString 返回 '[object Object]'
 * 2. 没有 own constructor 或 constructor.prototype 上有 isPrototypeOf
 * 3. 最后一个可枚举属性是 own 属性（利用 JS 引擎先枚举 own 属性的特性）
 *
 * @param obj - 待检查的值
 * @returns true 表示是纯对象
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

  // 若有 constructor 但不是 own 属性，且原型链上没有 isPrototypeOf，
  // 说明 constructor 来自原型链继承，不是纯对象
  if (plainObj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // 利用 JS 引擎先枚举 own 属性再枚举继承属性的特性：
  // 如果最后一个可枚举属性是 own 的，说明所有可枚举属性都是 own 的
  let key: string | undefined;
  for (key in plainObj) {
    // 遍历到最后一项
  }

  return typeof key === 'undefined' || hasOwn.call(plainObj, key);
}

/**
 * 合并对象属性
 *
 * 将多个源对象的属性合并到目标对象上，支持浅合并和深度合并。
 * 是框架配置层合并的核心实现。
 *
 * 合并规则：
 * - 浅合并（deep=false）：源属性直接覆盖目标属性
 * - 深度合并（deep=true）：纯对象递归合并，非纯对象直接覆盖
 * - 跳过 __proto__ 属性，防止原型链污染
 * - 跳过 undefined 值，不会用 undefined 覆盖已有属性
 * - 检测自引用（target === val），防止无限递归
 *
 * @param deep - 是否深度合并，可以是布尔值或包含 deep 属性的对象
 * @param target - 目标对象，合并结果将写入此对象
 * @param sources - 一个或多个源对象，按顺序合并到 target
 * @returns 合并后的目标对象
 *
 * @example
 * ```ts
 * // 浅合并
 * extend(false, { a: 1 }, { a: 2, b: 3 }); // { a: 2, b: 3 }
 *
 * // 深度合并
 * extend(true, { a: { x: 1 } }, { a: { y: 2 } }); // { a: { x: 1, y: 2 } }
 *
 * // 使用选项对象
 * extend({ deep: true }, { a: { x: 1 } }, { a: { y: 2 } }); // { a: { x: 1, y: 2 } }
 * ```
 */
export function extend(
  deep: boolean | ExtendOptions,
  target: Record<string, unknown>,
  ...sources: Array<Record<string, unknown> | undefined | null>
): Record<string, unknown> {
  // 解析 deep 参数：布尔值直接使用，对象则取其 deep 属性，默认浅合并
  const isDeep = typeof deep === 'boolean' ? deep : deep?.deep ?? false;

  for (const source of sources) {
    // 跳过 null 和 undefined 源
    if (!source) continue;

    for (const key of Object.keys(source)) {
      // 阻止原型链污染：__proto__ 属性不参与合并
      if (key === '__proto__') continue;
      const val = source[key];
      const src = target[key];
      // 检测自引用：target 和 val 是同一引用时跳过，防止无限递归
      if (target === val) continue;
      // 深度合并：当值是纯对象时递归合并而非覆盖
      if (isDeep && val && isPlainObject(val)) {
        // 若目标对应属性也是纯对象，在原对象上递归合并；否则创建新对象
        const clone = src && isPlainObject(src) ? src : {};
        target[key] = extend(true, clone as Record<string, unknown>, val as Record<string, unknown>);
      } else if (typeof val !== 'undefined') {
        // 非 undefined 值直接覆盖；undefined 值不覆盖已有属性
        target[key] = val;
      }
    }
  }

  return target;
}
