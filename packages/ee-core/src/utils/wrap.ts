import is from 'is-type-of';

// convert file path to an array of properties
// a/b/c.js => ['a', 'b', 'c']
export function getProperties(filepath: string, { caseStyle }: { caseStyle: string | ((filepath: string) => string[]) }): string[] {
  // if caseStyle is function, return the result of function
  if (is.function_(caseStyle)) {
    const result = (caseStyle as (filepath: string) => string[])(filepath);
    if (!Array.isArray(result)) {
      throw new Error(`caseStyle expect an array, but got ${result}`);
    }
    return result;
  }
  // use default camelize
  return defaultCamelize(filepath, caseStyle as string);
}

export function defaultCamelize(filepath: string, caseStyle: string): string[] {
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map((property) => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }

    // use default camelize, will capitalize the first letter
    // foo_bar.js > FooBar
    // fooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > fooBar
    const normalized = property.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    const first = normalized[0];
    if (!first) return normalized;

    let firstChar = first;
    switch (caseStyle) {
      case 'lower':
        firstChar = first.toLowerCase();
        break;
      case 'upper':
        firstChar = first.toUpperCase();
        break;
      case 'camel':
      default:
        break;
    }
    return firstChar + normalized.substring(1);
  });
}
