/**
 * @module utils/pargv
 * @description 轻量级命令行参数解析器。提供 parseArgv() 函数，将字符串数组解析为
 * 结构化的键值对象，支持短选项、长选项、别名、布尔标志、嵌套属性等功能。
 *
 * 解析步骤：
 * 1. 初始化阶段：处理 boolean/string/alias/default 配置，构建标志映射
 * 2. 分割阶段：以 '--' 为界将参数分为选项部分和非选项部分
 * 3. 逐项解析阶段：
 *    - `--key=value`：长选项带等号赋值
 *    - `--no-key`：长选项否定形式（布尔 false）
 *    - `--key value`：长选项后跟值
 *    - `-abc`：短选项组合（每个字母为独立选项）
 *    - 裸值：存入 argv._ 数组
 * 4. 默认值填充：对未出现的键填充默认值
 * 5. 非选项参数处理：根据 '--' 选项决定存入 argv['--'] 还是 argv._
 *
 * 安全防护：自动跳过 __proto__ 和 constructor 属性，防止原型链污染。
 */

/**
 * 检查对象是否拥有指定的嵌套键路径
 *
 * 沿键路径逐级深入，最后一层仅检查键是否存在（不取值）。
 *
 * @param obj - 目标对象
 * @param keys - 键路径数组（如 ['a', 'b', 'c']）
 * @returns true 表示键路径存在
 */
function hasKey(obj: Record<string, unknown>, keys: string[]): boolean {
  let o: Record<string, unknown> = obj;
  // 逐级取值到倒数第二层
  keys.slice(0, -1).forEach(function (key) {
    o = (o[key] as Record<string, unknown>) || {};
  });

  const key = keys[keys.length - 1];
  if (!key) return false;
  return key in o;
}

/**
 * 判断字符串是否为数值格式
 *
 * 支持十六进制（0x 前缀）、十进制整数和小数、科学计数法。
 *
 * @param x - 待判断的字符串
 * @returns true 表示是合法的数值格式
 */
function isNumber(x: string): boolean {
  if (/^0x[0-9a-f]+$/i.test(x)) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

/**
 * 检测键名是否为 constructor 或 __proto__
 *
 * 用于防止原型链污染攻击，这些特殊属性不应被设置。
 *
 * @param obj - 目标对象
 * @param key - 键名
 * @returns true 表示是危险属性
 */
function isConstructorOrProto(obj: Record<string, unknown>, key: string): boolean {
  return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

/** 命令行解析选项 */
export interface ParseArgvOptions {
  /** 声明布尔类型参数。true 时所有 --flag 视为布尔，或指定参数名列表 */
  boolean?: boolean | string[];
  /** 参数别名映射，如 { h: 'help', v: 'version' } */
  alias?: Record<string, string | string[]>;
  /** 声明字符串类型参数，这些参数不会被自动转为数字 */
  string?: string | string[];
  /** 参数默认值映射 */
  default?: Record<string, unknown>;
  /** 未知参数处理函数，返回 false 可阻止该参数被解析 */
  unknown?: (arg: string) => boolean | void;
  /** 遇到第一个非选项参数时停止解析，后续全部放入 _ 数组 */
  stopEarly?: boolean;
  /** 是否将 '--' 后的参数放入 argv['--'] 数组，而非 argv._ */
  '--'?: boolean;
}

/** 解析结果对象 */
export interface ParsedArgv {
  /** 非选项参数列表（裸值和位置参数） */
  _: (string | number)[];
  /** '--' 分隔符后的参数列表（仅当 opts['--'] 为 true 时存在） */
  '--'?: string[];
  /** 解析出的键值对，键名支持点号嵌套（如 'a.b' → { a: { b: ... } }） */
  [key: string]: unknown;
}

/**
 * 解析命令行参数数组
 *
 * 将 process.argv 风格的字符串数组解析为结构化的键值对象。
 *
 * @param args - 参数数组（通常为 process.argv.slice(2)）
 * @param opts - 解析选项
 * @returns 解析结果对象
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

  // 步骤 1：构建标志映射，记录哪些参数是布尔型或字符串型
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

  // boolean 选项为 true 时，所有 --flag 形式的参数都视为布尔
  if (typeof opts.boolean === 'boolean' && opts.boolean) {
    flags.allBools = true;
  } else {
    // 否则只将指定的参数名标记为布尔型
    ([] as string[]).concat(opts.boolean || []).filter(Boolean).forEach(function (key) {
      flags.bools[key] = true;
    });
  }

  // 步骤 2：构建别名双向映射
  const aliases: Record<string, string[]> = {};

  /**
   * 检查指定键的别名中是否有布尔型
   *
   * @param key - 参数键名
   * @returns true 表示该键的某个别名是布尔型
   */
  function aliasIsBoolean(key: string): boolean {
    return aliases[key]?.some(function (x) {
      return flags.bools[x];
    }) ?? false;
  }

  // 构建双向别名映射：每个别名都能映射到所有其他别名和原始键
  const aliasOpts = opts.alias || {};
  Object.keys(aliasOpts).forEach(function (key) {
    const aliasValue = aliasOpts[key];
    if (!aliasValue) return;
    const aliasList = ([] as string[]).concat(aliasValue);
    aliases[key] = aliasList;
    aliasList.forEach(function (x) {
      // 每个别名映射到原始键 + 其他别名（排除自身）
      const filtered = aliasList.filter(function (y) {
        return x !== y;
      });
      aliases[x] = [key].concat(filtered);
    });
  });

  // 步骤 3：将 string 选项标记到标志映射中（别名也需要同步标记）
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

  // 步骤 4：提取默认值，在解析完成后填充
  const defaults = opts.default || {};

  // 初始化结果对象
  const argv: ParsedArgv = { _: [] };

  /**
   * 判断参数键是否已被定义（通过标志或别名）
   *
   * @param key - 参数键名
   * @param arg - 原始参数字符串
   * @returns true 表示该键已声明
   */
  function argDefined(key: string, arg: string): boolean {
    return (
      // allBools 模式下 --flag 形式都视为已定义
      (!!flags.allBools && /^--[^=]+$/.test(arg)) ||
      !!flags.strings[key] ||
      !!flags.bools[key] ||
      !!aliases[key]
    );
  }

  /**
   * 沿嵌套键路径设置值
   *
   * 支持点号分隔的嵌套属性，如 'a.b.c' → obj.a.b.c = value。
   * 若值已存在，相同键的重复参数会被收集为数组。
   *
   * @param obj - 目标对象
   * @param keys - 键路径数组
   * @param value - 要设置的值
   */
  function setKey(obj: Record<string, unknown>, keys: string[], value: unknown): void {
    let o: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // 跳过危险属性，防止原型链污染
      if (!key || isConstructorOrProto(o, key)) return;
      // 中间层级不存在则自动创建对象
      if (o[key] === undefined) o[key] = {};
      const oValue = o[key];
      // 防止覆盖内置原型对象
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
    // 最后一层也检查危险属性
    if (!lastKey || isConstructorOrProto(o, lastKey)) return;
    if ((o as unknown) === Object.prototype || (o as unknown) === Number.prototype || (o as unknown) === String.prototype) {
      o = {};
    }
    if ((o as unknown) === Array.prototype) o = {};
    if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
      // 首次赋值或布尔型参数：直接设置
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      // 已有数组：追加值
      (o[lastKey] as unknown[]).push(value);
    } else {
      // 已有单值：转为数组
      o[lastKey] = [o[lastKey], value];
    }
  }

  /**
   * 设置参数值并同步到所有别名
   *
   * @param key - 参数键名
   * @param val - 参数值
   * @param arg - 原始参数字符串（用于 unknown 检查）
   */
  function setArg(key: string, val: unknown, arg?: string): void {
    // 未知参数检查：如果参数未声明且 unknown 函数返回 false，则跳过
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) return;
    }

    // 非字符串型参数且值为数字格式时自动转换为数值
    const value = !flags.strings[key] && isNumber(val as string) ? Number(val) : val;
    setKey(argv, key.split('.'), value);

    // 同步设置所有别名的值
    (aliases[key] || []).forEach(function (x) {
      setKey(argv, x.split('.'), value);
    });
  }

  // 步骤 5：预设置布尔型参数的默认值（未指定时为 false）
  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, defaults[key] === undefined ? false : defaults[key]);
  });

  let notFlags: string[] = [];

  // 步骤 6：分割 '--' 前后的参数
  const dashIndex = args.indexOf('--');
  if (dashIndex !== -1) {
    // '--' 之后的所有参数视为非选项参数
    notFlags = args.slice(dashIndex + 1);
    args = args.slice(0, dashIndex);
  }

  // 步骤 7：逐项解析参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    let next: string | undefined;

    // 情况 1：--key=value 长选项带等号赋值
    if (/^--.+?=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      if (!m) continue;
      const argKey = m[1];
      if (!argKey) continue;
      let value = m[2];
      // 布尔型参数的值只认 true/false
      if (flags.bools[argKey]) {
        value = value !== 'false' ? 'true' : 'false';
      }
      setArg(argKey, value, arg);
    } else if (/^--no-.+/.test(arg)) {
      // 情况 2：--no-key 否定形式，等价于 --key=false
      const m = arg.match(/^--no-(.+)$/);
      if (!m) continue;
      const argKey = m[1];
      if (!argKey) continue;
      setArg(argKey, false, arg);
    } else if (/^--.+/.test(arg)) {
      // 情况 3：--key [value] 长选项后跟可选值
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
        // 下一个参数是值而非新选项
        setArg(argKey, next, arg);
        i += 1;
      } else if (next && /^(true|false)$/.test(next)) {
        // 显式布尔值
        setArg(argKey, next === 'true', arg);
        i += 1;
      } else {
        // 无值时，字符串型设为空串，布尔型设为 true
        setArg(argKey, flags.strings[argKey] ? '' : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      // 情况 4：-abc 短选项组合
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

        // -a=value 形式
        if (/[A-Za-z]/.test(letter) && next && next[0] === '=') {
          setArg(letter, next.slice(1), arg);
          broken = true;
          break;
        }

        // -a123 形式（字母后跟数字）
        if (/[A-Za-z]/.test(letter) && next && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letter, next, arg);
          broken = true;
          break;
        }

        const nextLetter = letters[j + 1];
        if (nextLetter && nextLetter.match(/\W/)) {
          // 非字母数字字符视为值的开始
          setArg(letter, arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          // 普通短选项标志
          setArg(letter, flags.strings[letter] ? '' : true, arg);
        }
      }

      // 处理短选项组合的最后一个字符，它可能需要取下一个参数作为值
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
      // 情况 5：裸值参数，存入 _ 数组
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push((flags.strings._ || !isNumber(arg) ? arg : Number(arg)) as string | number);
      }
      // stopEarly 模式下，后续参数全部放入 _ 数组
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1) as unknown as (string | number)[]);
        break;
      }
    }
  }

  // 步骤 8：填充默认值（仅对解析中未出现的键）
  Object.keys(defaults).forEach(function (k) {
    if (!hasKey(argv, k.split('.'))) {
      setKey(argv, k.split('.'), defaults[k]);

      (aliases[k] || []).forEach(function (x) {
        setKey(argv, x.split('.'), defaults[k]);
      });
    }
  });

  // 步骤 9：处理 '--' 分隔符后的非选项参数
  if (opts['--']) {
    // 存入专门的 argv['--'] 数组
    argv['--'] = notFlags.slice();
  } else {
    // 追加到 _ 数组
    notFlags.forEach(function (k) {
      argv._.push(k);
    });
  }

  return argv;
}
