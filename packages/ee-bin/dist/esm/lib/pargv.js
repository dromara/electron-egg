function hasKey(obj, keys) {
  let o = obj;
  keys.slice(0, -1).forEach(function(key2) {
    o = o[key2] || {};
  });
  const key = keys[keys.length - 1];
  return key in o;
}
function isNumber(x) {
  if (typeof x === "number") {
    return true;
  }
  if (/^0x[0-9a-f]+$/i.test(x)) {
    return true;
  }
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}
function isConstructorOrProto(obj, key) {
  return key === "constructor" && typeof obj[key] === "function" || key === "__proto__";
}
function pargv(args, opts = {}) {
  const flags = {
    bools: {},
    strings: {},
    unknownFn: null
  };
  if (typeof opts.unknown === "function") {
    flags.unknownFn = opts.unknown;
  }
  if (typeof opts.boolean === "boolean" && opts.boolean) {
    flags.allBools = true;
  } else {
    [].concat(opts.boolean || []).filter(Boolean).forEach(function(key) {
      flags.bools[key] = true;
    });
  }
  const aliases = {};
  function aliasIsBoolean(key) {
    return aliases[key].some(function(x) {
      return flags.bools[x];
    });
  }
  Object.keys(opts.alias || {}).forEach(function(key) {
    aliases[key] = [].concat(opts.alias[key]);
    aliases[key].forEach(function(x) {
      aliases[x] = [key].concat(aliases[key].filter(function(y) {
        return x !== y;
      }));
    });
  });
  [].concat(opts.string || []).filter(Boolean).forEach(function(key) {
    flags.strings[key] = true;
    if (aliases[key]) {
      [].concat(aliases[key]).forEach(function(k) {
        flags.strings[k] = true;
      });
    }
  });
  const defaults = opts.default || {};
  const argv = { _: [] };
  function argDefined(key, arg) {
    return Boolean(flags.allBools && /^--[^=]+$/.test(arg) || flags.strings[key] || flags.bools[key] || aliases[key]);
  }
  function setKey(obj, keys, value) {
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (isConstructorOrProto(o, key)) {
        return;
      }
      if (o[key] === void 0) {
        o[key] = {};
      }
      if (o[key] === Object.prototype || o[key] === Number.prototype || o[key] === String.prototype) {
        o[key] = {};
      }
      if (o[key] === Array.prototype) {
        o[key] = [];
      }
      o = o[key];
    }
    const lastKey = keys[keys.length - 1];
    if (isConstructorOrProto(o, lastKey)) {
      return;
    }
    if (o === Object.prototype || o === Number.prototype || o === String.prototype) {
      o = {};
    }
    if (o === Array.prototype) {
      o = [];
    }
    if (o[lastKey] === void 0 || flags.bools[lastKey] || typeof o[lastKey] === "boolean") {
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      o[lastKey].push(value);
    } else {
      o[lastKey] = [o[lastKey], value];
    }
  }
  function setArg(key, val, arg) {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) {
        return;
      }
    }
    const value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
    setKey(argv, key.split("."), value);
    (aliases[key] || []).forEach(function(x) {
      setKey(argv, x.split("."), value);
    });
  }
  Object.keys(flags.bools).forEach(function(key) {
    setArg(key, defaults[key] === void 0 ? false : defaults[key]);
  });
  let notFlags = [];
  if (args.indexOf("--") !== -1) {
    notFlags = args.slice(args.indexOf("--") + 1);
    args = args.slice(0, args.indexOf("--"));
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    let key;
    let next;
    if (/^--.+=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      if (m) {
        key = m[1];
        let value = m[2];
        if (flags.bools[key]) {
          value = value !== "false";
        }
        setArg(key, value, arg);
      }
    } else if (/^--no-.+/.test(arg)) {
      const m = arg.match(/^--no-(.+)/);
      if (m) {
        key = m[1];
        setArg(key, false, arg);
      }
    } else if (/^--.+/.test(arg)) {
      const m = arg.match(/^--(.+)/);
      if (m) {
        key = m[1];
        next = args[i + 1];
        if (next !== void 0 && !/^(-|--)[^-]/.test(next) && !flags.bools[key] && !flags.allBools && (aliases[key] ? !aliasIsBoolean(key) : true)) {
          setArg(key, next, arg);
          i += 1;
        } else if (/^(true|false)$/.test(next)) {
          setArg(key, next === "true", arg);
          i += 1;
        } else {
          setArg(key, flags.strings[key] ? "" : true, arg);
        }
      }
    } else if (/^-[^-]+/.test(arg)) {
      const letters = arg.slice(1, -1).split("");
      let broken = false;
      for (let j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2);
        if (next === "-") {
          setArg(letters[j], next, arg);
          continue;
        }
        if (/[A-Za-z]/.test(letters[j]) && next[0] === "=") {
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
          setArg(letters[j], flags.strings[letters[j]] ? "" : true, arg);
        }
      }
      key = arg.slice(-1)[0];
      if (!broken && key !== "-") {
        if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) && !flags.bools[key] && (aliases[key] ? !aliasIsBoolean(key) : true)) {
          setArg(key, args[i + 1], arg);
          i += 1;
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
          setArg(key, args[i + 1] === "true", arg);
          i += 1;
        } else {
          setArg(key, flags.strings[key] ? "" : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
      }
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1));
        break;
      }
    }
  }
  Object.keys(defaults).forEach(function(k) {
    if (!hasKey(argv, k.split("."))) {
      setKey(argv, k.split("."), defaults[k]);
      (aliases[k] || []).forEach(function(x) {
        setKey(argv, x.split("."), defaults[k]);
      });
    }
  });
  if (opts["--"]) {
    argv["--"] = notFlags.slice();
  } else {
    notFlags.forEach(function(k) {
      argv._.push(k);
    });
  }
  return argv;
}
export {
  pargv as default
};
