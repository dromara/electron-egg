/**
 * @module utils/wrap
 * @description File path to property path conversion utility. Converts directory/file paths
 * to nested property name arrays for use by FileLoader to build nested object structures.
 *
 * Conversion examples:
 * ```
 * 'a/b/c.js' -> ['a', 'b', 'c']
 * 'user_info.js' -> ['userInfo'] (caseStyle='camel')
 * 'UserInfo.js' -> ['userInfo'] (caseStyle='lower')
 * ```
 */
import { isFunction } from './type_check.js';

/**
 * Convert file path to property path array
 *
 * Determines property name naming style based on caseStyle configuration.
 * Supports preset styles (lower/upper/camel) and fully custom conversion functions.
 *
 * @param filepath - Relative file path (e.g. 'a/b/c.js')
 * @param options - Conversion options
 * @param options.caseStyle - Naming style: 'lower' (first letter lowercase), 'upper' (first letter uppercase),
 *   'camel' (camelCase, default) or custom conversion function
 * @returns Property path array (e.g. ['a', 'b', 'c'])
 * @throws Error - Throws when caseStyle is a function but return value is not an array
 */
export function getProperties(filepath: string, { caseStyle }: { caseStyle: string | ((filepath: string) => string[]) }): string[] {
  // When caseStyle is a function, delegate entirely to the caller's custom conversion logic
  if (isFunction(caseStyle)) {
    const result = (caseStyle as (filepath: string) => string[])(filepath);
    if (!Array.isArray(result)) {
      throw new Error(`caseStyle expect an array, but got ${result}`);
    }
    return result;
  }
  // Use built-in camelCase conversion rules
  return defaultCamelize(filepath, caseStyle as string);
}

/**
 * Default camelCase conversion implementation
 *
 * Processing flow:
 * 1. Remove file extension, split by '/' into path segments
 * 2. For each path segment: capitalize letters after underscores/hyphens (e.g. foo_bar -> fooBar)
 * 3. Adjust first letter case based on caseStyle
 *
 * @param filepath - Relative file path
 * @param caseStyle - Naming style
 * @returns Property path array
 * @throws Error - Throws when path segment contains illegal characters (not a-z0-9_-)
 */
export function defaultCamelize(filepath: string, caseStyle: string): string[] {
  // Remove extension, split by path separator
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map((property) => {
    // Validate path segment only contains legal characters
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }

    // Underscore/hyphen to camelCase: foo_bar -> fooBar, foo-bar -> fooBar
    const normalized = property.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    const first = normalized[0];
    if (!first) return normalized;

    // Adjust first letter based on caseStyle
    let firstChar = first;
    switch (caseStyle) {
      case 'lower':
        // First letter lowercase: FooBar -> fooBar (controllers use this style)
        firstChar = first.toLowerCase();
        break;
      case 'upper':
        // First letter uppercase: fooBar -> FooBar
        firstChar = first.toUpperCase();
        break;
      case 'camel':
      default:
        // Keep as-is (camelCase)
        break;
    }
    return firstChar + normalized.substring(1);
  });
}
