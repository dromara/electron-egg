function hasKey(obj: Record<string, unknown>, keys: string[]): boolean {
  let o: Record<string, unknown> = obj;
  keys.slice(0, -1).forEach(function (key) {
    o = (o[key] as Record<string, unknown>) || {};
  });

  const key = keys[keys.length - 1];
  if (!key) return false;
  return key in o;
}

function isNumber(x: string): boolean {
  if (typeof x === 'number') return true;
  if (/^0x[0-9a-f]+$/i.test(x)) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

function isConstructorOrProto(obj: Record<string, unknown>, key: string): boolean {
  return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

export interface ParseArgvOptions {
  boolean?: boolean | string[];
  alias?: Record<string, string | string[]>;
  string?: string | string[];
  default?: Record<string, unknown>;
  unknown?: (arg: string) => boolean | void;
  stopEarly?: boolean;
  '--'?: boolean;
}

export interface ParsedArgv {
  _: (string | number)[];
  '--'?: string[];
  [key: string]: unknown;
}

export function parseArgv(args: string[], opts?: ParseArgvOptions): ParsedArgv {
  if (!opts) opts = {};

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

  if (typeof opts.boolean === 'boolean' && opts.boolean) {
    flags.allBools = true;
  } else {
    ([] as string[]).concat(opts.boolean || []).filter(Boolean).forEach(function (key) {
      flags.bools[key] = true;
    });
  }

  const aliases: Record<string, string[]> = {};

  function aliasIsBoolean(key: string): boolean {
    return aliases[key]?.some(function (x) {
      return flags.bools[x];
    }) ?? false;
  }

  Object.keys(opts.alias || {}).forEach(function (key) {
    aliases[key] = ([] as string[]).concat(opts.alias![key]);
    aliases[key].forEach(function (x) {
      aliases[x] = [key].concat(
        aliases[key].filter(function (y) {
          return x !== y;
        })
      );
    });
  });

  ([] as string[])
    .concat(opts.string || [])
    .filter(Boolean)
    .forEach(function (key) {
      flags.strings[key] = true;
      if (aliases[key]) {
        ([] as string[]).concat(aliases[key]).forEach(function (k) {
          flags.strings[k] = true;
        });
      }
    });

  const defaults = opts.default || {};

  const argv: ParsedArgv = { _: [] };

  function argDefined(key: string, arg: string): boolean {
    return (
      (!!flags.allBools && /^--[^=]+$/.test(arg)) ||
      !!flags.strings[key] ||
      !!flags.bools[key] ||
      !!aliases[key]
    );
  }

  function setKey(obj: Record<string, unknown>, keys: string[], value: unknown): void {
    let o: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!key || isConstructorOrProto(o, key)) return;
      if (o[key] === undefined) o[key] = {};
      if (
        o[key] === Object.prototype ||
        o[key] === Number.prototype ||
        o[key] === String.prototype
      ) {
        o[key] = {};
      }
      if (o[key] === Array.prototype) o[key] = [];
      o = o[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (!lastKey || isConstructorOrProto(o, lastKey)) return;
    if (o === Object.prototype || o === Number.prototype || o === String.prototype) {
      o = {};
    }
    if (o === Array.prototype) o = [];
    if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      (o[lastKey] as unknown[]).push(value);
    } else {
      o[lastKey] = [o[lastKey], value];
    }
  }

  function setArg(key: string, val: unknown, arg?: string): void {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) return;
    }

    const value = !flags.strings[key] && isNumber(val as string) ? Number(val) : val;
    setKey(argv, key.split('.'), value);

    (aliases[key] || []).forEach(function (x) {
      setKey(argv, x.split('.'), value);
    });
  }

  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, defaults[key] === undefined ? false : defaults[key]);
  });

  let notFlags: string[] = [];

  const dashIndex = args.indexOf('--');
  if (dashIndex !== -1) {
    notFlags = args.slice(dashIndex + 1);
    args = args.slice(0, dashIndex);
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    let key: string;
    let next: string | undefined;

    if (/^--.+?=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      if (!m) continue;
      key = m[1];
      let value = m[2];
      if (flags.bools[key]) {
        value = value !== 'false' ? 'true' : 'false';
      }
      setArg(key, value, arg);
    } else if (/^--no-.+/.test(arg)) {
      const m = arg.match(/^--no-(.+)$/);
      if (!m) continue;
      key = m[1];
      setArg(key, false, arg);
    } else if (/^--.+/.test(arg)) {
      const m = arg.match(/^--(.+)$/);
      if (!m) continue;
      key = m[1];
      next = args[i + 1];
      if (
        next !== undefined &&
        !/^(-|--)[^-]/.test(next) &&
        !flags.bools[key] &&
        !flags.allBools &&
        (aliases[key] ? !aliasIsBoolean(key) : true)
      ) {
        setArg(key, next, arg);
        i += 1;
      } else if (next && /^(true|false)$/.test(next)) {
        setArg(key, next === 'true', arg);
        i += 1;
      } else {
        setArg(key, flags.strings[key] ? '' : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      const letters = arg.slice(1, -1).split('');

      let broken = false;
      for (let j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2);

        if (next === '-') {
          setArg(letters[j], next, arg);
          continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && next[0] === '=') {
          setArg(letters[j], next.slice(1), arg);
          broken = true;
          break;
        }

        if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letters[j], next, arg);
          broken = true;
          break;
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
        }
      }

      key = arg.slice(-1)[0];
      if (!broken && key !== '-') {
        if (
          args[i + 1] &&
          !/^(-|--)[^-]/.test(args[i + 1]) &&
          !flags.bools[key] &&
          (aliases[key] ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, args[i + 1], arg);
          i += 1;
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
          setArg(key, args[i + 1] === 'true', arg);
          i += 1;
        } else {
          setArg(key, flags.strings[key] ? '' : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push((flags.strings._ || !isNumber(arg) ? arg : Number(arg)) as string | number);
      }
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1) as unknown as (string | number)[]);
        break;
      }
    }
  }

  Object.keys(defaults).forEach(function (k) {
    if (!hasKey(argv, k.split('.'))) {
      setKey(argv, k.split('.'), defaults[k]);

      (aliases[k] || []).forEach(function (x) {
        setKey(argv, x.split('.'), defaults[k]);
      });
    }
  });

  if (opts['--']) {
    argv['--'] = notFlags.slice();
  } else {
    notFlags.forEach(function (k) {
      argv._.push(k);
    });
  }

  return argv;
}
