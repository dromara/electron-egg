/**
 * @module utils/wrap
 * @description 文件路径到属性路径的转换工具。将目录/文件路径转换为嵌套属性名数组，
 * 供 FileLoader 构建嵌套对象结构使用。
 *
 * 转换示例：
 * ```
 * 'a/b/c.js' → ['a', 'b', 'c']
 * 'user_info.js' → ['userInfo'] （caseStyle='camel'）
 * 'UserInfo.js' → ['userInfo'] （caseStyle='lower'）
 * ```
 */
import { isFunction } from './type_check.js';

/**
 * 将文件路径转换为属性路径数组
 *
 * 根据 caseStyle 配置决定属性名的命名风格。
 * 支持预设风格（lower/upper/camel）和完全自定义的转换函数。
 *
 * @param filepath - 相对文件路径（如 'a/b/c.js'）
 * @param options - 转换选项
 * @param options.caseStyle - 命名风格：'lower'（首字母小写）、'upper'（首字母大写）、
 *   'camel'（驼峰式，默认）或自定义转换函数
 * @returns 属性路径数组（如 ['a', 'b', 'c']）
 * @throws Error - caseStyle 为函数但返回值不是数组时抛出
 */
export function getProperties(filepath: string, { caseStyle }: { caseStyle: string | ((filepath: string) => string[]) }): string[] {
  // caseStyle 为函数时，完全交由调用方自定义转换逻辑
  if (isFunction(caseStyle)) {
    const result = (caseStyle as (filepath: string) => string[])(filepath);
    if (!Array.isArray(result)) {
      throw new Error(`caseStyle expect an array, but got ${result}`);
    }
    return result;
  }
  // 使用内置的驼峰转换规则
  return defaultCamelize(filepath, caseStyle as string);
}

/**
 * 默认的驼峰转换实现
 *
 * 处理流程：
 * 1. 去除文件扩展名，按 '/' 分割为路径段
 * 2. 对每个路径段：将下划线/连字符后的字母大写（如 foo_bar → fooBar）
 * 3. 根据 caseStyle 调整首字母大小写
 *
 * @param filepath - 相对文件路径
 * @param caseStyle - 命名风格
 * @returns 属性路径数组
 * @throws Error - 路径段包含非法字符（非 a-z0-9_-）时抛出
 */
export function defaultCamelize(filepath: string, caseStyle: string): string[] {
  // 去掉扩展名，按路径分隔符拆分
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map((property) => {
    // 校验路径段只包含合法字符
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }

    // 下划线/连字符转驼峰：foo_bar → fooBar，foo-bar → fooBar
    const normalized = property.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    const first = normalized[0];
    if (!first) return normalized;

    // 根据 caseStyle 调整首字母
    let firstChar = first;
    switch (caseStyle) {
      case 'lower':
        // 首字母小写：FooBar → fooBar（控制器使用此风格）
        firstChar = first.toLowerCase();
        break;
      case 'upper':
        // 首字母大写：fooBar → FooBar
        firstChar = first.toUpperCase();
        break;
      case 'camel':
      default:
        // 保持原样（驼峰式）
        break;
    }
    return firstChar + normalized.substring(1);
  });
}
