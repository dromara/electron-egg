/**
 * 深合并（deep merge）工具 — 替代 lodash.merge
 *
 * 自实现而非使用 lodash 的原因：
 *  1. lodash.merge 会合并数组索引（合并 [a] 和 [b] 得到 [a+b] 而非 [b]），
 *     这不符合配置合并的预期行为——用户配置应完全覆盖默认数组
 *  2. lodash 不内置 prototype pollution 防护，需要额外配置
 *  3. 仅需深合并这一个功能，引入整个 lodash 包不划算
 *
 * 本实现的行为：
 *  - 对象类型属性 → 递归深合并
 *  - 非对象类型属性 → 直接覆盖（数组也是直接覆盖，不做索引合并）
 *  - 安全防护 → 拒绝 __proto__、constructor、prototype 键，防止原型链污染
 */

const toStr = Object.prototype.toString;

/**
 * 判断值是否为纯对象（通过 {} 或 Object.create(null) 创建）
 * 排除数组、Date、RegExp、Map、Set 等具有特殊原型链的对象
 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  const proto = Object.getPrototypeOf(obj as object);
  // Object.create(null) 创建的对象没有原型，视为纯对象
  if (proto === null) return true;

  // 纯对象的构造函数 === Object（排除自定义类实例、Date 等）
  const Ctor = proto.constructor;
  return typeof Ctor === 'function' && Ctor === Object;
}

/**
 * 递归深合并配置对象
 *
 * @param deep - true 表示深合并（对象递归），false 表示浅合并（直接覆盖）
 * @param target - 合并目标（通常为默认配置）
 * @param sources - 合并来源（通常为用户配置），undefined/null 源会被跳过
 * @returns 合并后的新对象（不修改 target 原对象）
 *
 * 关键行为：
 *  - 源中的非对象属性直接覆盖目标属性（包括数组）
 *  - 源中的纯对象属性与目标中的纯对象属性递归合并
 *  - 目标中对应属性不是纯对象时，源对象会完全覆盖（不合并）
 *  - 过滤 __proto__/constructor/prototype 键防止原型链污染攻击
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
      // 阻止原型链污染键：__proto__ 可修改对象原型，
      // constructor 可重写构造函数，prototype 可污染全局原型
      if (name === '__proto__' || name === 'constructor' || name === 'prototype') continue;

      const src = result[name];
      const copy = options[name];

      // 防止循环引用导致无限递归
      if (result === copy) continue;

      if (deep && copy && isPlainObject(copy)) {
        // 深合并：若目标属性也是纯对象则递归合并，
        // 否则用空对象 {} 作为基础（保证源对象属性全部生效）
        const clone = src && isPlainObject(src) ? src : {};
        result[name] = extend(true, clone, copy);
      } else if (typeof copy !== 'undefined') {
        // 非深合并或非纯对象：直接覆盖（数组、字符串、数字等）
        result[name] = copy;
      }
    }
  }

  return result as T;
}