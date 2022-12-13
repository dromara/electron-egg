"use strict";

const _ = require("lodash");
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");
const Utils = require("ee-core").Utils;
const ps = require("./ps");

function getCoreDB() {
  const Storage = require("ee-core").Storage;
  return Storage.JsonDB.connection("system");
}

function getJavaPort() {
  const cdb = getCoreDB();
  const port = cdb.getItem("config").javaServer.port;
  return port;
}

function getJarName() {
  const cdb = getCoreDB();
  return cdb.getItem("config").javaServer.name;
}

function getOpt(port, path) {
  const cdb = getCoreDB();
  const opt = cdb.getItem("config").javaServer.opt;
  let javaOpt = _.replace(opt, "${port}", port);
  return _.replace(javaOpt, "${path}", path);
}

function getJreVersion() {
  const cdb = getCoreDB();
  return cdb.getItem("config").javaServer.jreVersion;
}

async function start(app) {
  const options = app.config.javaServer;
  if (!options.enable) {
    return;
  }

  let port = process.env.EE_JAVA_PORT ? parseInt(process.env.EE_JAVA_PORT) : parseInt(getJavaPort());
  assert(typeof port === "number", "java port required, and must be a number");
  app.logger.info("[javaServer] java server port is:", port);

  const jarName = getJarName();
  let softwarePath = path.join(Utils.getExtraResourcesDir(), jarName);
  app.logger.info("[javaServer] jar存放路径:", softwarePath);

  const logPath = Utils.getLogDir()

  // 检查程序是否存在
  if (!fs.existsSync(softwarePath)) {
    app.logger.info("[javaServer] java程序不存在", softwarePath);
  }

  const JAVA_OPT = getOpt(port, logPath);
  if (os.platform() === "win32") {
    let jrePath = path.join(
      Utils.getExtraResourcesDir(),
      getJreVersion(),
      "bin",
      "javaw.exe"
    );
    // 命令行字符串 并 执行
    let cmdStr = `start ${jrePath} -jar ${JAVA_OPT} ${softwarePath}`;
    app.logger.info("[javaServer] cmdStr:", cmdStr);
    await execSync(cmdStr);
  } else {
    // 不受信任请执行：  sudo spctl --master-disable
    let jrePath = path.join(
      Utils.getExtraResourcesDir(),
      getJreVersion(),
      "Contents",
      "Home",
      "bin",
      "java"
    );
    // 命令行字符串 并 执行
    // let cmdStr = `${jrePath} -jar ${JAVA_OPT} ${softwarePath} > /Users/tangyh/Downloads/app.log`;
    let cmdStr = `nohup ${jrePath} -jar ${JAVA_OPT} ${softwarePath} >/dev/null 2>&1 &`;
    app.logger.info("[javaServer] cmdStr:", cmdStr);
    await execSync(cmdStr);
  }
}

async function kill(app) {
  const port = getJavaPort();
  const jarName = getJarName();
  app.logger.info("[javaServer] kill port: ", port);

  if (os.platform() === "win32") {
    const resultList = ps.lookup({
      command: "java",
      where: 'caption="javaw.exe"',
      arguments: jarName,
    });

    app.logger.info("[javaServer] resultList:", resultList);
    resultList.forEach((item) => {
      ps.kill(item.pid, "SIGKILL", (err) => {
        if (err) {
          throw new Error(err);
        }
        app.logger.info("[javaServer] 已经退出后台程序: %O", item);
      });
    });

    //   const cmd = `for /f "tokens=1-5" %i in ('netstat -ano ^| findstr ":${port}"') do taskkill /F /T /PID %m`;
    //   const a = await execSync(cmd, {encoding: 'utf-8'});
    //   app.logger.info("[javaServer] kill:", a);
  } else {
    const cmd = `ps -ef | grep java | grep ${jarName} | grep -v grep | awk '{print $2}' | xargs kill -9`;
    const result = await execSync(cmd);
    app.logger.info("[javaServer] kill:", result != null ? result.toString(): '');
  }
}

module.exports.start = start;
module.exports.kill = kill;
