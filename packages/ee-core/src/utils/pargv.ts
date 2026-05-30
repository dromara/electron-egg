/**
 * @module utils/pargv
 * @description Lightweight command line argument parser. Provides parseArgv() function that
 * parses a string array into a structured key-value object, supporting short options,
 * long options, aliases, boolean flags, nested properties, and more.
 *
 * Parsing steps:
 * 1. Initialization phase: process boolean/string/alias/default configuration, build flag mappings
 * 2. Split phase: separate arguments into options and non-options parts using '--' as delimiter
 * 3. Item-by-item parsing phase:
 *    - `--key=value`: long option with equals sign assignment
 *    - `--no-key`: long option negation form (boolean false)
 *    - `--key value`: long option followed by value
 *    - `-abc`: short option combination (each letter is a separate option)
 *    - Bare values: stored in argv._ array
 * 4. Default value filling: fill default values for keys that did not appear
 * 5. Non-option argument handling: based on '--' option, store in argv['--'] or argv._
 *
 * Security: automatically skips __proto__ and constructor properties, preventing prototype chain pollution.
 */

/**
 * Check if an object has the specified nested key path
 *
 * Traverses down the key path, only checking key existence at the last level (not retrieving value).
 *
 * @param obj - Target object
 * @param keys - Key path array (e.g. ['a', 'b', 'c'])
 * @returns true if the key path exists
 */
function hasKey(obj: Record<string, unknown>, keys: string[]): boolean {
  let o: Record<string, unknown> = obj;
  // Traverse to second-to-last level, retrieving values
  keys.slice(0, -1).forEach(function (key) {
    o = (o[key] as Record<string, unknown>) || {};
  });

  const key = keys[keys.length - 1];
  if (!key) return false;
  return key in o;
}

/**
 * Determine if a string is in numeric format
 *
 * Supports hexadecimal (0x prefix), decimal integers and decimals, scientific notation.
 *
 * @param x - String to check
 * @returns true if the string is a valid numeric format
 */
function isNumber(x: string): boolean {
  if (/^0x[0-9a-f]+$/i.test(x)) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

/**
 * Detect if a key name is constructor or __proto__
 *
 * Used to prevent prototype chain pollution attacks; these special properties should not be set.
 *
 * @param obj - Target object
 * @param key - Key name
 * @returns true if the key is a dangerous property
 */
function isConstructorOrProto(obj: Record<string, unknown>, key: string): boolean {
  return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

/** Command line parsing options */
export interface ParseArgvOptions {
  /** Declare boolean-type parameters. When true, all --flags are treated as boolean; or specify a list of parameter names */
  boolean?: boolean | string[];
  /** Parameter alias mapping, e.g. { h: 'help', v: 'version' } */
  alias?: Record<string, string | string[]>;
  /** Declare string-type parameters; these parameters will not be auto-converted to numbers */
  string?: string | string[];
  /** Parameter default value mapping */
  default?: Record<string, unknown>;
  /** Unknown argument handler function; returning false prevents the argument from being parsed */
  unknown?: (arg: string) => boolean | void;
  /** Stop parsing when the first non-option argument is encountered; remaining arguments go into _ array */
  stopEarly?: boolean;
  /** Whether to put arguments after '--' into argv['--'] array instead of argv._ */
  '--'?: boolean;
}

/** Parsed result object */
export interface ParsedArgv {
  /** Non-option argument list (bare values and positional arguments) */
  _: (string | number)[];
  /** Argument list after '--' separator (only present when opts['--'] is true) */
  '--'?: string[];
  /** Parsed key-value pairs; key names support dot notation nesting (e.g. 'a.b' -> { a: { b: ... } }) */
  [key: string]: unknown;
}

/**
 * Parse command line argument array
 *
 * Parses a process.argv-style string array into a structured key-value object.
 *
 * @param args - Argument array (typically process.argv.slice(2))
 * @param opts - Parsing options
 * @returns Parsed result object
 *
 * @example
 * ```ts
 * parseArgv(['--name=foo', '-p', '8080', '--verbose', 'file.txt'], {
 *   boolean: ['verbose'],
 *   alias: { p: 'port' },
 *   string: ['name'],
 * })
 * // => { _: ['file.txt'], name: 'foo', port: 8080, verbose: true }
 * ```
 */
export function parseArgv(args: string[], opts?: ParseArgvOptions): ParsedArgv {
  if (!opts) opts = {};

  // Step 1: Build flag mapping, recording which parameters are boolean or string type
  const flags: {
    bools: Record<string, boolean>;
    strings: Record<string, boolean>;
    unknownFn: ((arg: string) => boolean | void) | null;
    allBools?: boolean;
  } = {
    bools: {},
    strings: {},
    unknownFn: null,
  };

  if (typeof opts.unknown === 'function') {
    flags.unknownFn = opts.unknown;
  }

  // When boolean option is true, all --flag form arguments are treated as boolean
  if (typeof opts.boolean === 'boolean' && opts.boolean) {
    flags.allBools = true;
  } else {
    // Otherwise only mark specified parameter names as boolean
    ([] as string[]).concat(opts.boolean || []).filter(Boolean).forEach(function (key) {
      flags.bools[key] = true;
    });
  }

  // Step 2: Build bidirectional alias mapping
  const aliases: Record<string, string[]> = {};

  /**
   * Check if any alias of the specified key is boolean
   *
   * @param key - Parameter key name
   * @returns true if any alias of the key is boolean
   */
  function aliasIsBoolean(key: string): boolean {
    return aliases[key]?.some(function (x) {
      return flags.bools[x];
    }) ?? false;
  }

  // Build bidirectional alias mapping: each alias can map to all other aliases and the original key
  const aliasOpts = opts.alias || {};
  Object.keys(aliasOpts).forEach(function (key) {
    const aliasValue = aliasOpts[key];
    if (!aliasValue) return;
    const aliasList = ([] as string[]).concat(aliasValue);
    aliases[key] = aliasList;
    aliasList.forEach(function (x) {
      // Each alias maps to the original key + other aliases (excluding itself)
      const filtered = aliasList.filter(function (y) {
        return x !== y;
      });
      aliases[x] = [key].concat(filtered);
    });
  });

  // Step 3: Mark string options in the flag mapping (aliases also need to be synced)
  const stringOpts = opts.string || [];
  const stringList = ([] as string[]).concat(stringOpts).filter(Boolean);
  stringList.forEach(function (key) {
    flags.strings[key] = true;
    if (aliases[key]) {
      ([] as string[]).concat(aliases[key]).forEach(function (k) {
        flags.strings[k] = true;
      });
    }
  });

  // Step 4: Extract default values, fill after parsing is complete
  const defaults = opts.default || {};

  // Initialize result object
  const argv: ParsedArgv = { _: [] };

  /**
   * Determine if a parameter key has been defined (via flags or aliases)
   *
   * @param key - Parameter key name
   * @param arg - Original argument string
   * @returns true if the key has been declared
   */
  function argDefined(key: string, arg: string): boolean {
    return (
      // In allBools mode, --flag form arguments are all considered defined
      (!!flags.allBools && /^--[^=]+$/.test(arg)) ||
      !!flags.strings[key] ||
      !!flags.bools[key] ||
      !!aliases[key]
    );
  }

  /**
   * Set a value along a nested key path
   *
   * Supports dot-separated nested properties, e.g. 'a.b.c' -> obj.a.b.c = value.
   * If the value already exists, repeated arguments with the same key are collected as an array.
   *
   * @param obj - Target object
   * @param keys - Key path array
   * @param value - Value to set
   */
  function setKey(obj: Record<string, unknown>, keys: string[], value: unknown): void {
    let o: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // Skip dangerous properties, preventing prototype chain pollution
      if (!key || isConstructorOrProto(o, key)) return;
      // Auto-create object if intermediate level doesn't exist
      if (o[key] === undefined) o[key] = {};
      const oValue = o[key];
      // Prevent overwriting built-in prototype objects
      if (
        oValue === Object.prototype ||
        oValue === Number.prototype ||
        oValue === String.prototype
      ) {
        o[key] = {};
      }
      if (oValue === Array.prototype) o[key] = {};
      o = o[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    // Last level also checks for dangerous properties
    if (!lastKey || isConstructorOrProto(o, lastKey)) return;
    if ((o as unknown) === Object.prototype || (o as unknown) === Number.prototype || (o as unknown) === String.prototype) {
      o = {};
    }
    if ((o as unknown) === Array.prototype) o = {};
    if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
      // First assignment or boolean parameter: set directly
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      // Existing array: append value
      (o[lastKey] as unknown[]).push(value);
    } else {
      // Existing single value: convert to array
      o[lastKey] = [o[lastKey], value];
    }
  }

  /**
   * Set parameter value and sync to all aliases
   *
   * @param key - Parameter key name
   * @param val - Parameter value
   * @param arg - Original argument string (for unknown check)
   */
  function setArg(key: string, val: unknown, arg?: string): void {
    // Unknown argument check: if argument is undeclared and unknown function returns false, skip it
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) return;
    }

    // Non-string-type parameters with numeric format values are auto-converted to numbers
    const value = !flags.strings[key] && isNumber(val as string) ? Number(val) : val;
    setKey(argv, key.split('.'), value);

    // Sync value to all aliases
    (aliases[key] || []).forEach(function (x) {
      setKey(argv, x.split('.'), value);
    });
  }

  // Step 5: Pre-set default values for boolean parameters (false when unspecified)
  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, defaults[key] === undefined ? false : defaults[key]);
  });

  let notFlags: string[] = [];

  // Step 6: Split arguments before and after '--'
  const dashIndex = args.indexOf('--');
  if (dashIndex !== -1) {
    // All arguments after '--' are treated as non-option arguments
    notFlags = args.slice(dashIndex + 1);
    args = args.slice(0, dashIndex);
  }

  // Step 7: Parse arguments item by item
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    let next: string | undefined;

    // Case 1: --key=value long option with equals sign assignment
    if (/^--.+?=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      if (!m) continue;
      const argKey = m[1];
      if (!argKey) continue;
      let value = m[2];
      // Boolean parameter values only recognize true/false
      if (flags.bools[argKey]) {
        value = value !== 'false' ? 'true' : 'false';
      }
      setArg(argKey, value, arg);
    } else if (/^--no-.+/.test(arg)) {
      // Case 2: --no-key negation form, equivalent to --key=false
      const m = arg.match(/^--no-(.+)$/);
      if (!m) continue;
      const argKey = m[1];
      if (!argKey) continue;
      setArg(argKey, false, arg);
    } else if (/^--.+/.test(arg)) {
      // Case 3: --key [value] long option followed by optional value
      const m = arg.match(/^--(.+)$/);
      if (!m) continue;
      const argKey = m[1];
      if (!argKey) continue;
      next = args[i + 1];
      if (
        next !== undefined &&
        !/^(-|--)[^-]/.test(next) &&
        !flags.bools[argKey] &&
        !flags.allBools &&
        (aliases[argKey] ? !aliasIsBoolean(argKey) : true)
      ) {
        // Next argument is a value, not a new option
        setArg(argKey, next, arg);
        i += 1;
      } else if (next && /^(true|false)$/.test(next)) {
        // Explicit boolean value
        setArg(argKey, next === 'true', arg);
        i += 1;
      } else {
        // No value: string type set to empty string, boolean type set to true
        setArg(argKey, flags.strings[argKey] ? '' : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      // Case 4: -abc short option combination
      const letters = arg.slice(1, -1).split('');

      let broken = false;
      for (let j = 0; j < letters.length; j++) {
        const letter = letters[j];
        if (!letter) continue;
        next = arg.slice(j + 2);

        if (next === '-') {
          setArg(letter, next, arg);
          continue;
        }

        // -a=value form
        if (/[A-Za-z]/.test(letter) && next && next[0] === '=') {
          setArg(letter, next.slice(1), arg);
          broken = true;
          break;
        }

        // -a123 form (letter followed by digits)
        if (/[A-Za-z]/.test(letter) && next && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letter, next, arg);
          broken = true;
          break;
        }

        const nextLetter = letters[j + 1];
        if (nextLetter && nextLetter.match(/\W/)) {
          // Non-alphanumeric character treated as start of value
          setArg(letter, arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          // Regular short option flag
          setArg(letter, flags.strings[letter] ? '' : true, arg);
        }
      }

      // Handle the last character of a short option combination, which may need the next argument as value
      const lastChar = arg.slice(-1);
      const shortKey = lastChar;
      if (!broken && shortKey !== '-') {
        const nextArg = args[i + 1];
        if (
          nextArg &&
          !/^(-|--)[^-]/.test(nextArg) &&
          !flags.bools[shortKey] &&
          (aliases[shortKey] ? !aliasIsBoolean(shortKey) : true)
        ) {
          setArg(shortKey, nextArg, arg);
          i += 1;
        } else if (nextArg && /^(true|false)$/.test(nextArg)) {
          setArg(shortKey, nextArg === 'true', arg);
          i += 1;
        } else {
          setArg(shortKey, flags.strings[shortKey] ? '' : true, arg);
        }
      }
    } else {
      // Case 5: bare value argument, store in _ array
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push((flags.strings._ || !isNumber(arg) ? arg : Number(arg)) as string | number);
      }
      // In stopEarly mode, all subsequent arguments go into _ array
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1) as unknown as (string | number)[]);
        break;
      }
    }
  }

  // Step 8: Fill default values (only for keys not present in parsing)
  Object.keys(defaults).forEach(function (k) {
    if (!hasKey(argv, k.split('.'))) {
      setKey(argv, k.split('.'), defaults[k]);

      (aliases[k] || []).forEach(function (x) {
        setKey(argv, x.split('.'), defaults[k]);
      });
    }
  });

  // Step 9: Handle non-option arguments after '--' separator
  if (opts['--']) {
    // Store in dedicated argv['--'] array
    argv['--'] = notFlags.slice();
  } else {
    // Append to _ array
    notFlags.forEach(function (k) {
      argv._.push(k);
    });
  }

  return argv;
}
