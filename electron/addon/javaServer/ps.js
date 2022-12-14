var ChildProcess = require("child_process");
var IS_WIN = process.platform === "win32";
var TableParser = require("table-parser");
/**
 * End of line.
 * Basically, the EOL should be:
 * - windows: \r\n
 * - *nix: \n
 * But i'm trying to get every possibilities covered.
 */
var EOL = /(\r\n)|(\n\r)|\n|\r/;
var SystemEOL = require("os").EOL;

/**
 * Execute child process
 * @type {Function}
 * @param {String[]} args
 * @param {String} where
 * @param {Function} callback
 * @param {Object=null} callback.err
 * @param {Object[]} callback.stdout
 */
var Exec = function (args, where) {
  var spawnSync = ChildProcess.spawnSync;
  var execSync = ChildProcess.execSync;

  // on windows, if use ChildProcess.exec(`wmic process get`), the stdout will gives you nothing
  // that's why I use `cmd` instead
  if (IS_WIN) {
    const cmd = `wmic process where ${where} get ProcessId,ParentProcessId,CommandLine \n`;
    const result = execSync(cmd);
    if (!result) {
      throw new Error(result);
    }

    var stdout = result.toString();

    var beginRow;
    stdout = stdout.split(EOL);

    // Find the line index for the titles
    stdout.forEach(function (out, index) {
      if (
        out &&
        typeof beginRow == "undefined" &&
        out.indexOf("CommandLine") === 0
      ) {
        beginRow = index;
      }
    });

    // get rid of the start (copyright) and the end (current pwd)
    stdout.splice(stdout.length - 1, 1);
    stdout.splice(0, beginRow);

    return stdout.join(SystemEOL) || false;
  } else {
    if (typeof args === "string") {
      args = args.split(/\s+/);
    }
    const result = spawnSync("ps", args);
    if (result.stderr && !!result.stderr.toString()) {
      throw new Error(result.stderr);
    } else {
      return result.stdout.toString();
    }
  }
};

/**
 * Query Process: Focus on pid & cmd
 * @param query
 * @param {String|String[]} query.pid
 * @param {String} query.command RegExp String
 * @param {String} query.arguments RegExp String
 * @param {String|array} query.psargs
 * @param {String|array} query.where where 条件
 * @param {Function} callback
 * @param {Object=null} callback.err
 * @param {Object[]} callback.processList
 * @return {Object}
 */

exports.lookup = function (query) {
  /**
   * add 'lx' as default ps arguments, since the default ps output in linux like "ubuntu", wont include command arguments
   */
  var exeArgs = query.psargs || ["lx"];
  var where = query.where || 'name="javaw.exe"';
  var filter = {};
  var idList;

  // Lookup by PID
  if (query.pid) {
    if (Array.isArray(query.pid)) {
      idList = query.pid;
    } else {
      idList = [query.pid];
    }

    // Cast all PIDs as Strings
    idList = idList.map(function (v) {
      return String(v);
    });
  }

  if (query.command) {
    filter["command"] = new RegExp(query.command, "i");
  }

  if (query.arguments) {
    filter["arguments"] = new RegExp(query.arguments, "i");
  }

  if (query.ppid) {
    filter["ppid"] = new RegExp(query.ppid);
  }

  const result = Exec(exeArgs, where);

  var processList = parseGrid(result);
  var resultList = [];

  processList.forEach(function (p) {
    var flt;
    var type;
    var result = true;

    if (idList && idList.indexOf(String(p.pid)) < 0) {
      return;
    }

    for (type in filter) {
      flt = filter[type];
      result = flt.test(p[type]) ? result : false;
    }

    if (result) {
      resultList.push(p);
    }
  });

  return resultList;
};

/**
 * Kill process
 * @param pid
 * @param {Object|String} signal
 * @param {String} signal.signal
 * @param {number} signal.timeout
 * @param next
 */

exports.kill = function (pid, signal, next) {
  //opts are optional
  if (arguments.length == 2 && typeof signal == "function") {
    next = signal;
    signal = undefined;
  }

  var checkTimeoutSeconds = (signal && signal.timeout) || 30;

  if (typeof signal === "object") {
    signal = signal.signal;
  }

  try {
    process.kill(pid, signal);
  } catch (e) {
    return next && next(e);
  }

  var checkConfident = 0;
  var checkTimeoutTimer = null;
  var checkIsTimeout = false;

  function checkKilled(finishCallback) {
    exports.lookup({ pid: pid }, function (err, list) {
      if (checkIsTimeout) return;

      if (err) {
        clearTimeout(checkTimeoutTimer);
        finishCallback && finishCallback(err);
      } else if (list.length > 0) {
        checkConfident = checkConfident - 1 || 0;
        checkKilled(finishCallback);
      } else {
        checkConfident++;
        if (checkConfident === 5) {
          clearTimeout(checkTimeoutTimer);
          finishCallback && finishCallback();
        } else {
          checkKilled(finishCallback);
        }
      }
    });
  }

  next && checkKilled(next);

  checkTimeoutTimer =
    next &&
    setTimeout(function () {
      checkIsTimeout = true;
      next(new Error("Kill process timeout"));
    }, checkTimeoutSeconds * 1000);
};

/**
 * Parse the stdout into readable object.
 * @param {String} output
 */

function parseGrid(output) {
  if (!output) {
    return [];
  }
  return formatOutput(TableParser.parse(output));
}

/**
 * format the structure, extract pid, command, arguments, ppid
 * @param data
 * @return {Array}
 */

function formatOutput(data) {
  var formatedData = [];
  data.forEach(function (d) {
    var pid =
      (d.PID && d.PID[0]) || (d.ProcessId && d.ProcessId[0]) || undefined;
    var cmd = d.CMD || d.CommandLine || d.COMMAND || undefined;
    var ppid =
      (d.PPID && d.PPID[0]) ||
      (d.ParentProcessId && d.ParentProcessId[0]) ||
      undefined;

    if (pid && cmd) {
      var command = cmd[0];
      var args = "";

      if (cmd.length > 1) {
        args = cmd.slice(1);
      }

      formatedData.push({
        pid: pid,
        command: command,
        arguments: args,
        ppid: ppid,
      });
    }
  });

  return formatedData;
}
