process.env.EE_BUNDLED = "true";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/config/config.default.ts
var config_default_exports = {};
__export(config_default_exports, {
  default: () => config_default_default
});
var import_path, import_ps, config_default_default;
var init_config_default = __esm({
  "electron/config/config.default.ts"() {
    import_path = __toESM(require("path"));
    import_ps = require("ee-core/ps");
    config_default_default = () => {
      return {
        openDevTools: false,
        singleLock: true,
        windowsOption: {
          title: "electron-egg",
          width: 980,
          height: 850,
          minWidth: 400,
          minHeight: 300,
          webPreferences: {
            //webSecurity: false,
            contextIsolation: false,
            // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
            nodeIntegration: true
            //preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
          },
          frame: true,
          show: true,
          icon: import_path.default.join((0, import_ps.getBaseDir)(), "public", "images", "logo-32.png")
        },
        logger: {
          level: "info",
          // 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
          rotator: "daily",
          // daily, hourly
          dateFormat: "yyyy-MM-dd",
          maxSize: "100m",
          redact: [],
          redactCensor: "[Redacted]",
          timestamp: true,
          depthLimit: 5,
          timezone: "Asia/Shanghai",
          name: "ee",
          appLogName: "ee.log",
          coreLogName: "ee-core.log",
          errorLogName: "ee-error.log"
        },
        remote: {
          enable: false,
          url: "http://electron-egg.kaka996.com/"
        },
        socketServer: {
          enable: true,
          port: 7070,
          path: "/socket.io/",
          connectTimeout: 45e3,
          pingTimeout: 3e4,
          pingInterval: 25e3,
          maxHttpBufferSize: 1e8,
          transports: ["polling", "websocket"],
          cors: {
            origin: true
          },
          channel: "socket-channel"
        },
        httpServer: {
          enable: true,
          https: {
            enable: false,
            key: "/public/ssl/localhost+1.key",
            cert: "/public/ssl/localhost+1.pem"
          },
          protocol: "http://",
          host: "127.0.0.1",
          port: 7071,
          cors: { origin: "*" },
          body: {
            multipart: false,
            formidable: { keepExtensions: false }
          },
          filterRequest: {
            uris: [],
            returnData: ""
          }
        },
        mainServer: {
          protocol: "file://",
          indexPath: "/public/dist/index.html",
          channelSeparator: "/"
        }
      };
    };
  }
});

// electron/config/config.local.ts
var config_local_exports = {};
__export(config_local_exports, {
  default: () => config_local_default
});
var config_local_default;
var init_config_local = __esm({
  "electron/config/config.local.ts"() {
    config_local_default = () => {
      return {
        openDevTools: {
          mode: "detach"
        },
        jobs: {
          messageLog: false
        }
      };
    };
  }
});

// electron/config/config.prod.ts
var config_prod_exports = {};
__export(config_prod_exports, {
  default: () => config_prod_default
});
var config_prod_default;
var init_config_prod = __esm({
  "electron/config/config.prod.ts"() {
    config_prod_default = () => {
      return {
        openDevTools: false
      };
    };
  }
});

// config-registry:app:config-registry
var require_app_config_registry = __commonJS({
  "config-registry:app:config-registry"() {
    global.__EE_CONFIG_REGISTRY__ = [
      { filename: "config.default", get module() {
        return init_config_default(), __toCommonJS(config_default_exports);
      } },
      { filename: "config.local", get module() {
        return init_config_local(), __toCommonJS(config_local_exports);
      } },
      { filename: "config.prod", get module() {
        return init_config_prod(), __toCommonJS(config_prod_exports);
      } }
    ];
  }
});

// electron/service/cross.ts
var import_log, import_ps2, import_path2, import_axios, import_utils, import_cross, CrossService, crossService;
var init_cross = __esm({
  "electron/service/cross.ts"() {
    import_log = require("ee-core/log");
    import_ps2 = require("ee-core/ps");
    import_path2 = __toESM(require("path"));
    import_axios = __toESM(require("axios"));
    import_utils = require("ee-core/utils");
    import_cross = require("ee-core/cross");
    CrossService = class {
      info() {
        const pids = import_cross.cross.getPids();
        import_log.logger.info("cross pids:", pids);
        let num = 1;
        pids.forEach((pid) => {
          let entity = import_cross.cross.getProc(pid);
          import_log.logger.info(`server-${num} name:${entity.name}`);
          import_log.logger.info(`server-${num} config:`, entity.config);
          num++;
        });
        return "hello electron-egg";
      }
      getUrl(name) {
        const serverUrl = import_cross.cross.getUrl(name);
        return serverUrl;
      }
      killServer(type, name) {
        if (type == "all") {
          import_cross.cross.killAll();
        } else {
          import_cross.cross.killByName(name);
        }
      }
      /**
       * create go service
       * In the default configuration, services can be started with applications. 
       * Developers can turn off the configuration and create it manually.
       */
      async createGoServer() {
        const serviceName = "go";
        const opt = {
          name: "goapp",
          cmd: import_path2.default.join((0, import_ps2.getExtraResourcesDir)(), "goapp"),
          directory: (0, import_ps2.getExtraResourcesDir)(),
          args: ["--port=7073"],
          appExit: true
        };
        const entity = await import_cross.cross.run(serviceName, opt);
        import_log.logger.info("[go] server name:", entity.name);
        import_log.logger.info("[go] server config:", entity.config);
        import_log.logger.info("[go] server url:", entity.getUrl());
        return;
      }
      /**
       * create java server
       */
      async createJavaServer() {
        const serviceName = "java";
        const jarPath = import_path2.default.join((0, import_ps2.getExtraResourcesDir)(), "java-app.jar");
        const opt = {
          name: "javaapp",
          cmd: import_path2.default.join((0, import_ps2.getExtraResourcesDir)(), "jre1.8.0_201/bin/javaw.exe"),
          directory: (0, import_ps2.getExtraResourcesDir)(),
          args: ["-jar", "-server", "-Xms512M", "-Xmx512M", "-Xss512k", "-Dspring.profiles.active=prod", `-Dserver.port=18080`, `-Dlogging.file.path=${(0, import_ps2.getLogDir)()}`, `${jarPath}`],
          appExit: false
        };
        if (import_utils.is.macOS()) {
          opt.cmd = import_path2.default.join((0, import_ps2.getExtraResourcesDir)(), "jre1.8.0_201.jre/Contents/Home/bin/java");
        }
        if (import_utils.is.linux()) {
        }
        const entity = await import_cross.cross.run(serviceName, opt);
        import_log.logger.info("server name:", entity.name);
        import_log.logger.info("server config:", entity.config);
        import_log.logger.info("server url:", import_cross.cross.getUrl(entity.name));
        return;
      }
      /**
       * create python service
       * In the default configuration, services can be started with applications. 
       * Developers can turn off the configuration and create it manually.
       */
      async createPythonServer() {
        const serviceName = "python";
        const opt = {
          name: "pyapp",
          cmd: import_path2.default.join((0, import_ps2.getExtraResourcesDir)(), "py", "pyapp"),
          directory: import_path2.default.join((0, import_ps2.getExtraResourcesDir)(), "py"),
          args: ["--port=7074"],
          windowsExtname: true,
          appExit: true
        };
        const entity = await import_cross.cross.run(serviceName, opt);
        import_log.logger.info("server name:", entity.name);
        import_log.logger.info("server config:", entity.config);
        import_log.logger.info("server url:", entity.getUrl());
        return;
      }
      async requestApi(name, urlPath, params) {
        const serverUrl = import_cross.cross.getUrl(name);
        if (!serverUrl) return null;
        const apiHello = serverUrl + urlPath;
        console.log("Server Url:", serverUrl);
        const response = await (0, import_axios.default)({
          method: "get",
          url: apiHello,
          timeout: 1e3,
          params,
          proxy: false
        });
        if (response.status == 200) {
          const { data } = response;
          return data;
        }
        return null;
      }
    };
    crossService = new CrossService();
  }
});

// electron/controller/cross.ts
var cross_exports = {};
__export(cross_exports, {
  default: () => cross_default
});
var CrossController, cross_default;
var init_cross2 = __esm({
  "electron/controller/cross.ts"() {
    init_cross();
    CrossController = class {
      /**
       * View process service information
       */
      info() {
        crossService.info();
        return "hello electron-egg";
      }
      /**
       * Get service url
       */
      async getUrl(args) {
        const { name } = args;
        const serverUrl = crossService.getUrl(name);
        return serverUrl;
      }
      /**
       * kill service
       * By default (modifiable), killing the process will exit the electron application.
       */
      async killServer(args) {
        const { type, name } = args;
        crossService.killServer(type, name);
        return;
      }
      /**
       * create service
       */
      async createServer(args) {
        const { program } = args;
        if (program == "go") {
          crossService.createGoServer();
        } else if (program == "java") {
          crossService.createJavaServer();
        } else if (program == "python") {
          crossService.createPythonServer();
        }
        return;
      }
      /**
       * Access the api for the cross service
       */
      async requestApi(args) {
        const { name, urlPath, params } = args;
        const data = await crossService.requestApi(name, urlPath, params);
        return data;
      }
    };
    cross_default = CrossController;
  }
});

// electron/controller/effect.ts
var effect_exports = {};
__export(effect_exports, {
  default: () => effect_default
});
var import_electron, import_electron2, EffectController, effect_default;
var init_effect = __esm({
  "electron/controller/effect.ts"() {
    import_electron = require("electron");
    import_electron2 = require("ee-core/electron");
    EffectController = class {
      /**
       * select file
       */
      selectFile() {
        const filePaths = import_electron.dialog.showOpenDialogSync({
          properties: ["openFile"]
        });
        if (!filePaths) {
          return null;
        }
        return filePaths[0];
      }
      /**
       * login window
       */
      loginWindow(args) {
        const { width, height } = args;
        const win = (0, import_electron2.getMainWindow)();
        const size = {
          width: width || 400,
          height: height || 300
        };
        win.setSize(size.width, size.height);
        win.setResizable(true);
        win.center();
        win.show();
        win.focus();
      }
      /**
       * restore window
       */
      restoreWindow(args) {
        const { width, height } = args;
        const win = (0, import_electron2.getMainWindow)();
        const size = {
          width: width || 980,
          height: height || 650
        };
        win.setSize(size.width, size.height);
        win.setResizable(true);
        win.center();
        win.show();
        win.focus();
      }
    };
    effect_default = EffectController;
  }
});

// electron/controller/example.ts
var example_exports = {};
__export(example_exports, {
  default: () => example_default
});
var ExampleController, example_default;
var init_example = __esm({
  "electron/controller/example.ts"() {
    ExampleController = class {
      /**
       * test
       */
      async test() {
        return "hello electron-egg";
      }
    };
    example_default = ExampleController;
  }
});

// electron/service/framework.ts
var import_log2, import_jobs, FrameworkService, frameworkService;
var init_framework = __esm({
  "electron/service/framework.ts"() {
    import_log2 = require("ee-core/log");
    import_jobs = require("ee-core/jobs");
    FrameworkService = class {
      myTimer;
      myJob;
      myJobPool;
      taskForJob;
      constructor() {
        this.myTimer = null;
        this.myJob = new import_jobs.ChildJob();
        this.myJobPool = new import_jobs.ChildPoolJob();
        this.taskForJob = {};
      }
      /**
       * test
       */
      async test(args) {
        let obj = {
          status: "ok",
          params: args
        };
        import_log2.logger.info("FrameworkService obj:", obj);
        return obj;
      }
      /**
       * ipc通信(双向)
       */
      bothWayMessage(type, content, event) {
        const channel = "controller/framework/ipcSendMsg";
        if (type == "start") {
          this.myTimer = setInterval(function(e, c, msg) {
            let timeNow = Date.now();
            let data = msg + ":" + timeNow;
            e.reply(`${c}`, data);
          }, 1e3, event, channel, content);
          return "\u5F00\u59CB\u4E86";
        } else if (type == "end") {
          clearInterval(this.myTimer);
          return "\u505C\u6B62\u4E86";
        } else {
          return "ohther";
        }
      }
      /**
       * 执行任务
       */
      doJob(jobId, action, event) {
        let res = {};
        let oneTask;
        const channel = "controller/framework/timerJobProgress";
        if (action == "create") {
          let eventName = "job-timer-progress-" + jobId;
          const timerTask = this.myJob.exec("./jobs/example/timer", { jobId });
          timerTask.emitter.on(eventName, (data) => {
            import_log2.logger.info("[main-process] timerTask, from TimerJob data:", data);
            event.sender.send(`${channel}`, data);
          });
          res.pid = timerTask.pid;
          this.taskForJob[jobId] = timerTask;
        }
        if (action == "close") {
          oneTask = this.taskForJob[jobId];
          oneTask.kill();
          event.sender.send(`${channel}`, { jobId, number: 0, pid: 0 });
        }
        if (action == "pause") {
          oneTask = this.taskForJob[jobId];
          oneTask.callFunc("./jobs/example/timer", "pause", jobId);
        }
        if (action == "resume") {
          oneTask = this.taskForJob[jobId];
          oneTask.callFunc("./jobs/example/timer", "resume", jobId, oneTask.pid);
        }
        return res;
      }
      /**
       * 创建pool
       */
      doCreatePool(num, event) {
        const channel = "controller/framework/createPoolNotice";
        this.myJobPool.create(num).then((pids) => {
          event.reply(`${channel}`, pids);
        });
      }
      /**
       * 通过进程池执行任务
       */
      async doJobByPool(jobId, action, event) {
        let res = {};
        const channel = "controller/framework/timerJobProgress";
        if (action == "run") {
          const task = await this.myJobPool.runPromise("./jobs/example/timer", { jobId });
          let eventName = "job-timer-progress-" + jobId;
          task.emitter.on(eventName, (data) => {
            import_log2.logger.info("[main-process] [ChildPoolJob] timerTask, from TimerJob data:", data);
            event.sender.send(`${channel}`, data);
            if (data && typeof data === "object" && "end" in data && data.end) {
              task.emitter.removeAllListeners(eventName);
            }
          });
          res.pid = task.pid;
        }
        return res;
      }
      /**
       * 获取正在运行的 job 进程 
       */
      monitorJob() {
        setInterval(() => {
          let jobPids = this.myJob.getPids();
          let jobPoolPids = this.myJobPool.getPids();
          import_log2.logger.info(`[main-process] [monitorJob] jobPids: ${jobPids}, jobPoolPids: ${jobPoolPids}`);
        }, 5e3);
      }
    };
    frameworkService = new FrameworkService();
  }
});

// electron/service/os/auto_updater.ts
var import_electron3, import_electron_updater, import_utils2, import_log3, import_electron4, AutoUpdaterService, autoUpdaterService;
var init_auto_updater = __esm({
  "electron/service/os/auto_updater.ts"() {
    import_electron3 = require("electron");
    import_electron_updater = require("electron-updater");
    import_utils2 = require("ee-core/utils");
    import_log3 = require("ee-core/log");
    import_electron4 = require("ee-core/electron");
    AutoUpdaterService = class {
      config;
      constructor() {
        this.config = {
          windows: false,
          macOS: false,
          linux: false,
          options: {
            provider: "generic",
            url: "http://kodo.qiniu.com/"
          }
        };
      }
      /**
       * 创建
       */
      init() {
        import_log3.logger.info("[autoUpdater] load");
        const cfg = this.config;
        if (import_utils2.is.windows() && cfg.windows || import_utils2.is.macOS() && cfg.macOS || import_utils2.is.linux() && cfg.linux) {
        } else {
          return;
        }
        const status = {
          error: -1,
          available: 1,
          noAvailable: 2,
          downloading: 3,
          downloaded: 4
        };
        const version = import_electron3.app.getVersion();
        import_log3.logger.info("[autoUpdater] current version: ", version);
        let server = cfg.options.url;
        let lastChar = server.substring(server.length - 1);
        server = lastChar === "/" ? server : server + "/";
        const feedOptions = { ...cfg.options, url: server };
        try {
          import_electron_updater.autoUpdater.setFeedURL(feedOptions);
        } catch (error) {
          import_log3.logger.error("[autoUpdater] setFeedURL error : ", error);
        }
        import_electron_updater.autoUpdater.on("checking-for-update", () => {
        });
        import_electron_updater.autoUpdater.on("update-available", () => {
          const data = {
            status: status.available,
            desc: "\u6709\u53EF\u7528\u66F4\u65B0"
          };
          this.sendStatusToWindow(data);
        });
        import_electron_updater.autoUpdater.on("update-not-available", () => {
          const data = {
            status: status.noAvailable,
            desc: "\u6CA1\u6709\u53EF\u7528\u66F4\u65B0"
          };
          this.sendStatusToWindow(data);
        });
        import_electron_updater.autoUpdater.on("error", (err) => {
          const data = {
            status: status.error,
            desc: err
          };
          this.sendStatusToWindow(data);
        });
        import_electron_updater.autoUpdater.on("download-progress", (progressObj) => {
          const percentNumber = Math.floor(progressObj.percent);
          const totalSize = this.bytesChange(progressObj.total);
          const transferredSize = this.bytesChange(progressObj.transferred);
          let text = "\u5DF2\u4E0B\u8F7D " + percentNumber + "%";
          text = text + " (" + transferredSize + "/" + totalSize + ")";
          const data = {
            status: status.downloading,
            desc: text,
            percentNumber,
            totalSize,
            transferredSize
          };
          import_log3.logger.info("[autoUpdater] progress: ", text);
          this.sendStatusToWindow(data);
        });
        import_electron_updater.autoUpdater.on("update-downloaded", () => {
          const data = {
            status: status.downloaded,
            desc: "\u4E0B\u8F7D\u5B8C\u6210"
          };
          this.sendStatusToWindow(data);
          (0, import_electron4.setCloseAndQuit)(true);
          import_electron_updater.autoUpdater.quitAndInstall();
        });
      }
      /**
       * 检查更新
       */
      checkUpdate() {
        import_electron_updater.autoUpdater.checkForUpdates();
      }
      /**
       * 下载更新
       */
      download() {
        import_electron_updater.autoUpdater.downloadUpdate();
      }
      /**
       * 向前端发消息
       */
      sendStatusToWindow(content = {}) {
        const textJson = JSON.stringify(content);
        const channel = "custom/app/updater";
        const win = (0, import_electron4.getMainWindow)();
        win.webContents.send(channel, textJson);
      }
      /**
       * 单位转换
       */
      bytesChange(limit) {
        let size = "";
        if (limit < 0.1 * 1024) {
          size = limit.toFixed(2) + "B";
        } else if (limit < 0.1 * 1024 * 1024) {
          size = (limit / 1024).toFixed(2) + "KB";
        } else if (limit < 0.1 * 1024 * 1024 * 1024) {
          size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        } else {
          size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }
        let sizeStr = size + "";
        let index = sizeStr.indexOf(".");
        let dou = sizeStr.substring(index + 1, index + 3);
        if (dou == "00") {
          return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5);
        }
        return size;
      }
    };
    autoUpdaterService = new AutoUpdaterService();
  }
});

// electron/controller/framework.ts
var framework_exports = {};
__export(framework_exports, {
  default: () => framework_default
});
var import_dayjs, import_path3, import_fs, import_child_process, import_electron5, import_ps3, import_log4, import_config, FrameworkController, framework_default;
var init_framework2 = __esm({
  "electron/controller/framework.ts"() {
    import_dayjs = __toESM(require("dayjs"));
    import_path3 = __toESM(require("path"));
    import_fs = __toESM(require("fs"));
    import_child_process = require("child_process");
    import_electron5 = require("electron");
    import_ps3 = require("ee-core/ps");
    import_log4 = require("ee-core/log");
    import_config = require("ee-core/config");
    init_framework();
    init_auto_updater();
    FrameworkController = class {
      /**
       * 所有方法接收两个参数
       * @param args 前端传的参数
       * @param event - ipc通信时才有值。详情见：控制器文档
       */
      /**
       * sqlite数据库操作
       */
      // async sqlitedbOperation(args: SqlitedbOperationArgs): Promise<SqlitedbOperationResult> {
      //   const { action, info, delete_name, update_name, update_age, search_age, data_dir } = args;
      //   const data: SqlitedbOperationResult = {
      //     action,
      //     result: null,
      //     all_list: [],
      //     code: 0
      //   };
      //   try {
      //     // test
      //     sqlitedbService.getDataDir();
      //   } catch (err) {
      //     console.log(err);
      //     data.code = -1;
      //     return data;
      //   }
      //   switch (action) {
      //     case 'add' :
      //       if (info) {
      //         data.result = await sqlitedbService.addTestDataSqlite(info);
      //       }
      //       break;
      //     case 'del' :
      //       data.result = await sqlitedbService.delTestDataSqlite(delete_name);;
      //       break;
      //     case 'update' :
      //       data.result = await sqlitedbService.updateTestDataSqlite(update_name, update_age);
      //       break;
      //     case 'get' :
      //       data.result = await sqlitedbService.getTestDataSqlite(search_age);
      //       break;
      //     case 'getDataDir' :
      //       data.result = await sqlitedbService.getDataDir();
      //       break;
      //     case 'setDataDir' :
      //       if (data_dir) {
      //         await sqlitedbService.setCustomDataDir(data_dir);
      //       }
      //       break;            
      //   }
      //   data.all_list = await sqlitedbService.getAllTestDataSqlite();
      //   return data;
      // }  
      /**
       * 调用其它程序（exe、bash等可执行程序）
       * 
       */
      openSoftware(args) {
        const { softName } = args;
        const softwarePath = import_path3.default.join((0, import_ps3.getExtraResourcesDir)(), softName);
        import_log4.logger.info("[openSoftware] softwarePath:", softwarePath);
        if (!import_fs.default.existsSync(softwarePath)) {
          return false;
        }
        const cmdStr = `start "${softwarePath}"`;
        (0, import_child_process.exec)(cmdStr);
        return true;
      }
      /**
       * 检测http服务是否开启
       */
      async checkHttpServer() {
        const { enable, protocol, host, port } = (0, import_config.getConfig)().httpServer;
        const url = protocol + host + ":" + port;
        console.log("[checkHttpServer] url:", url);
        const data = {
          enable,
          server: url
        };
        return data;
      }
      /**
       * 一个 http 请求
       * args 是 前端传的参数
       * ctx 是 koa 的 ctx 对象
       */
      async doHttpRequest(args, ctx) {
        const httpInfo = {
          args,
          method: ctx.request.method,
          query: ctx.request.query,
          body: ctx.request.body
        };
        import_log4.logger.info("httpInfo:", httpInfo);
        const { id } = args;
        if (!id) {
          return false;
        }
        const dir = import_electron5.app.getPath(id);
        import_electron5.shell.openPath(dir);
        return true;
      }
      /**
       * 一个socket io请求访问此方法
       */
      async doSocketRequest(args) {
        const { id } = args;
        if (!id) {
          return false;
        }
        const dir = import_electron5.app.getPath(id);
        import_electron5.shell.openPath(dir);
        return true;
      }
      /**
       * 异步消息类型
       */
      async ipcInvokeMsg(args) {
        let timeNow = (0, import_dayjs.default)().format("YYYY-MM-DD HH:mm:ss");
        const data = args + " - " + timeNow;
        return data;
      }
      /**
       * 同步消息类型
       */
      async ipcSendSyncMsg(args) {
        let timeNow = (0, import_dayjs.default)().format("YYYY-MM-DD HH:mm:ss");
        const data = args + " - " + timeNow;
        return data;
      }
      /**
       * 双向异步通信
       */
      ipcSendMsg(args, event) {
        const { type, content } = args;
        const data = frameworkService.bothWayMessage(type, content, event);
        return data;
      }
      /**
       * 任务
       */
      someJob(args, event) {
        const { jobId, action } = args;
        let result;
        switch (action) {
          case "create":
            result = frameworkService.doJob(jobId, action, event);
            break;
          case "close":
            frameworkService.doJob(jobId, action, event);
            break;
          case "pause":
            frameworkService.doJob(jobId, action, event);
            break;
          case "resume":
            frameworkService.doJob(jobId, action, event);
            break;
          default:
        }
        let data = {
          jobId,
          action,
          result
        };
        return data;
      }
      /**
       * 创建任务池
       */
      async createPool(args, event) {
        let num = args.number;
        frameworkService.doCreatePool(num, event);
        frameworkService.monitorJob();
        return;
      }
      /**
       * 通过进程池执行任务
       */
      async someJobByPool(args, event) {
        const { jobId, action } = args;
        let result = {};
        switch (action) {
          case "run":
            result = await frameworkService.doJobByPool(jobId, action, event);
            break;
          default:
        }
        let data = {
          jobId,
          action,
          result
        };
        return data;
      }
      /**
       * 检查是否有新版本
       */
      checkForUpdater() {
        autoUpdaterService.checkUpdate();
        return;
      }
      /**
       * 下载新版本
       */
      downloadApp() {
        autoUpdaterService.download();
        return;
      }
      /**
       * 测试接口
       */
      hello(args) {
        import_log4.logger.info("hello ", args);
      }
    };
    framework_default = FrameworkController;
  }
});

// electron/service/os/window.ts
var import_path4, import_electron6, import_electron7, import_ps4, import_config2, import_utils3, import_log5, WindowService, windowService;
var init_window = __esm({
  "electron/service/os/window.ts"() {
    import_path4 = __toESM(require("path"));
    import_electron6 = require("electron");
    import_electron7 = require("ee-core/electron");
    import_ps4 = require("ee-core/ps");
    import_config2 = require("ee-core/config");
    import_utils3 = require("ee-core/utils");
    import_log5 = require("ee-core/log");
    WindowService = class {
      myNotification;
      windows;
      constructor() {
        this.myNotification = null;
        this.windows = {};
      }
      /**
       * 窗口初始化
       */
      init() {
        const mainWin = (0, import_electron7.getMainWindow)();
        mainWin.setMenuBarVisibility(false);
      }
      /**
       * Create a new window
       */
      createWindow(args) {
        const { type, content, windowName, windowTitle } = args;
        let contentUrl = null;
        if (type == "html") {
          contentUrl = import_path4.default.join("file://", (0, import_ps4.getBaseDir)(), content);
        } else if (type == "web") {
          contentUrl = content;
        } else if (type == "vue") {
          let addr = "http://localhost:8080";
          if ((0, import_ps4.isProd)()) {
            const mainServer = (0, import_config2.getConfig)().mainServer;
            if ((0, import_utils3.isFileProtocol)(mainServer.protocol)) {
              addr = mainServer.protocol + import_path4.default.join((0, import_ps4.getBaseDir)(), mainServer.indexPath);
            } else {
              addr = mainServer.protocol + (mainServer.host ?? "") + (mainServer.port ? ":" + mainServer.port : "");
            }
          }
          contentUrl = addr + content;
        } else {
        }
        import_log5.logger.info("[createWindow] url: ", contentUrl);
        const opt = {
          title: windowTitle,
          x: 10,
          y: 10,
          width: 980,
          height: 650,
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
          }
        };
        const win = new import_electron6.BrowserWindow(opt);
        const winContentsId = win.webContents.id;
        if (contentUrl) {
          win.loadURL(contentUrl);
        }
        if ((0, import_ps4.isDev)()) {
          win.webContents.openDevTools();
        }
        win.setMenuBarVisibility(false);
        this.windows[windowName] = win;
        return winContentsId;
      }
      /**
       * Get window contents id
       */
      getWCid(args) {
        const { windowName } = args;
        let win;
        if (windowName == "main") {
          win = (0, import_electron7.getMainWindow)();
          return win.webContents.id;
        } else {
          win = this.windows[windowName] ?? null;
          if (!win) return null;
          return win.webContents.id;
        }
      }
      /**
       * Realize communication between two windows through the transfer of the main process
       */
      communicate(args) {
        const { receiver, content } = args;
        if (receiver == "main") {
          const win = (0, import_electron7.getMainWindow)();
          win.webContents.send("controller/os/window2ToWindow1", content);
        } else if (receiver == "window2") {
          const win = this.windows[receiver];
          win.webContents.send("controller/os/window1ToWindow2", content);
        }
      }
      /**
       * createNotification
       */
      createNotification(options, event) {
        const channel = "controller/os/sendNotification";
        this.myNotification = new import_electron6.Notification(options);
        if (options.clickEvent) {
          this.myNotification.on("click", (_e) => {
            const data = {
              type: "click",
              msg: "\u60A8\u70B9\u51FB\u4E86\u901A\u77E5\u6D88\u606F"
            };
            event.reply(`${channel}`, data);
          });
        }
        if (options.closeEvent) {
          this.myNotification.on("close", (_e) => {
            const data = {
              type: "close",
              msg: "\u60A8\u5173\u95ED\u4E86\u901A\u77E5\u6D88\u606F"
            };
            event.reply(`${channel}`, data);
          });
        }
        this.myNotification.show();
      }
    };
    windowService = new WindowService();
  }
});

// electron/controller/os.ts
var os_exports = {};
__export(os_exports, {
  default: () => os_default
});
var import_fs2, import_path5, import_electron8, OsController, os_default;
var init_os = __esm({
  "electron/controller/os.ts"() {
    import_fs2 = __toESM(require("fs"));
    import_path5 = __toESM(require("path"));
    import_electron8 = require("electron");
    init_window();
    OsController = class {
      /**
       * All methods receive two parameters
       * @param args Parameters transmitted by the frontend
       * @param event - Event are only available during IPC communication. For details, please refer to the controller documentation
       */
      /**
       * Message prompt dialog box
       */
      messageShow() {
        import_electron8.dialog.showMessageBoxSync({
          type: "info",
          // "none", "info", "error", "question" 或者 "warning"
          title: "Custom Title",
          message: "Customize message content",
          detail: "Other additional information"
        });
        return "Opened the message box";
      }
      /**
       * Message prompt and confirmation dialog box
       */
      messageShowConfirm() {
        const res = import_electron8.dialog.showMessageBoxSync({
          type: "info",
          title: "Custom Title",
          message: "Customize message content",
          detail: "Other additional information",
          cancelId: 1,
          // Index of buttons used to cancel dialog boxes
          defaultId: 0,
          // Set default selected button
          buttons: ["confirm", "cancel"]
        });
        let data = res === 0 ? "click the confirm button" : "click the cancel button";
        return data;
      }
      /**
       * Select Directory
       */
      selectFolder() {
        const filePaths = import_electron8.dialog.showOpenDialogSync({
          properties: ["openDirectory", "createDirectory"]
        });
        if (!filePaths) {
          return null;
        }
        return filePaths[0];
      }
      /**
       * open directory
       */
      openDirectory(args) {
        const { id } = args;
        if (!id) {
          return false;
        }
        let dir = "";
        if (import_path5.default.isAbsolute(id)) {
          dir = id;
        } else {
          dir = import_electron8.app.getPath(id);
        }
        import_electron8.shell.openPath(dir);
        return true;
      }
      /**
       * Select Picture
       */
      selectPic() {
        const filePaths = import_electron8.dialog.showOpenDialogSync({
          title: "select pic",
          properties: ["openFile"],
          filters: [
            { name: "Images", extensions: ["jpg", "png", "gif"] }
          ]
        });
        if (!filePaths) {
          return null;
        }
        try {
          const data = import_fs2.default.readFileSync(filePaths[0]);
          const pic = "data:image/jpeg;base64," + data.toString("base64");
          return pic;
        } catch (err) {
          console.error(err);
          return null;
        }
      }
      /**
       * Open a new window
       */
      createWindow(args) {
        const wcid = windowService.createWindow(args);
        return wcid;
      }
      /**
       * Get Window contents id
       */
      getWCid(args) {
        const wcid = windowService.getWCid(args);
        return wcid;
      }
      /**
       * Realize communication between two windows through the transfer of the main process
       */
      window1ToWindow2(args, _event) {
        windowService.communicate(args);
        return;
      }
      /**
       * Realize communication between two windows through the transfer of the main process
       */
      window2ToWindow1(args, _event) {
        windowService.communicate(args);
        return;
      }
      /**
       * Create system notifications
       */
      sendNotification(args, event) {
        const { title, subtitle, body, silent } = args;
        if (!import_electron8.Notification.isSupported()) {
          return "\u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u901A\u77E5";
        }
        const options = {};
        if (title) {
          options.title = title;
        }
        if (subtitle) {
          options.subtitle = subtitle;
        }
        if (body) {
          options.body = body;
        }
        if (silent !== void 0) {
          options.silent = silent;
        }
        windowService.createNotification(options, event);
        return true;
      }
    };
    os_default = OsController;
  }
});

// controller-registry:app:controller-registry
var require_app_controller_registry = __commonJS({
  "controller-registry:app:controller-registry"() {
    global.__EE_CONTROLLER_REGISTRY__ = [
      { fullpath: "controller/cross.ts", properties: ["cross"], get module() {
        return init_cross2(), __toCommonJS(cross_exports);
      } },
      { fullpath: "controller/effect.ts", properties: ["effect"], get module() {
        return init_effect(), __toCommonJS(effect_exports);
      } },
      { fullpath: "controller/example.ts", properties: ["example"], get module() {
        return init_example(), __toCommonJS(example_exports);
      } },
      { fullpath: "controller/framework.ts", properties: ["framework"], get module() {
        return init_framework2(), __toCommonJS(framework_exports);
      } },
      { fullpath: "controller/os.ts", properties: ["os"], get module() {
        return init_os(), __toCommonJS(os_exports);
      } }
    ];
  }
});

// electron/preload/lifecycle.ts
var import_electron9, import_log6, import_config3, import_electron10, Lifecycle;
var init_lifecycle = __esm({
  "electron/preload/lifecycle.ts"() {
    import_electron9 = require("electron");
    import_log6 = require("ee-core/log");
    import_config3 = require("ee-core/config");
    import_electron10 = require("ee-core/electron");
    Lifecycle = class {
      /**
       * core app have been loaded
       */
      async ready() {
        import_log6.logger.info("[lifecycle] ready");
      }
      /**
       * electron app ready
       */
      async electronAppReady() {
        import_log6.logger.info("[lifecycle] electron-app-ready");
        import_electron9.app.on("second-instance", () => {
          const win = (0, import_electron10.getMainWindow)();
          if (win.isMinimized()) {
            win.restore();
          }
          win.show();
          win.focus();
        });
      }
      /**
       * main window have been loaded
       */
      async windowReady() {
        import_log6.logger.info("[lifecycle] window-ready");
        const win = (0, import_electron10.getMainWindow)();
        const mainScreen = import_electron9.screen.getPrimaryDisplay();
        const { width, height } = mainScreen.workAreaSize;
        const windowWidth = Math.floor(width * 0.7);
        const windowHeight = Math.floor(height * 0.8);
        const x = Math.floor((width - windowWidth) / 2);
        const y = Math.floor((height - windowHeight) / 2);
        win.setBounds({ x, y, width: windowWidth, height: windowHeight });
        const { windowsOption } = (0, import_config3.getConfig)();
        if (windowsOption.show == false) {
          win.once("ready-to-show", () => {
            win.show();
            win.focus();
          });
        }
      }
      /**
       * before app close
       */
      async beforeClose() {
        import_log6.logger.info("[lifecycle] before-close");
      }
    };
  }
});

// electron/service/os/tray.ts
var import_electron11, import_path6, import_ps5, import_log7, import_electron12, TrayService, trayService;
var init_tray = __esm({
  "electron/service/os/tray.ts"() {
    import_electron11 = require("electron");
    import_path6 = __toESM(require("path"));
    import_ps5 = require("ee-core/ps");
    import_log7 = require("ee-core/log");
    import_electron12 = require("ee-core/electron");
    TrayService = class {
      tray;
      config;
      constructor() {
        this.tray = null;
        this.config = {
          title: "electron-egg",
          icon: "/public/images/tray.png"
        };
      }
      /**
       * 创建托盘
       */
      init() {
        import_log7.logger.info("[tray] load");
        const cfg = this.config;
        const mainWindow = (0, import_electron12.getMainWindow)();
        const iconPath = import_path6.default.join((0, import_ps5.getBaseDir)(), cfg.icon);
        const trayMenuTemplate = [
          {
            label: "\u663E\u793A",
            click: function() {
              mainWindow.show();
            }
          },
          {
            label: "\u9000\u51FA",
            click: function() {
              import_electron11.app.quit();
            }
          }
        ];
        (0, import_electron12.setCloseAndQuit)(false);
        mainWindow.on("close", (event) => {
          if ((0, import_electron12.getCloseAndQuit)()) {
            return;
          }
          mainWindow.hide();
          event.preventDefault();
        });
        mainWindow.setMenuBarVisibility(false);
        this.tray = new import_electron11.Tray(iconPath);
        this.tray.setToolTip(cfg.title);
        const contextMenu = import_electron11.Menu.buildFromTemplate(trayMenuTemplate);
        this.tray.setContextMenu(contextMenu);
        this.tray.on("click", () => {
          mainWindow.show();
        });
      }
    };
    trayService = new TrayService();
  }
});

// electron/service/os/security.ts
var import_log8, import_electron13, SecurityService, securityService;
var init_security = __esm({
  "electron/service/os/security.ts"() {
    import_log8 = require("ee-core/log");
    import_electron13 = require("electron");
    SecurityService = class {
      /**
       * 创建
       */
      init() {
        import_log8.logger.info("[security] load");
        const runWithDebug = process.argv.find(function(e) {
          let isHasDebug = e.includes("--inspect") || e.includes("--inspect-brk") || e.includes("--remote-debugging-port");
          return isHasDebug;
        });
        if (runWithDebug && process.env.NODE_ENV === "prod") {
          import_log8.logger.error("[error] Remote debugging is not allowed,  runWithDebug:", runWithDebug);
          import_electron13.app.quit();
        }
      }
    };
    securityService = new SecurityService();
  }
});

// electron/preload/index.ts
async function preload() {
  import_log9.logger.info("[preload] load 5");
  windowService.init();
  trayService.init();
  securityService.init();
}
var import_log9;
var init_preload = __esm({
  "electron/preload/index.ts"() {
    import_log9 = require("ee-core/log");
    init_tray();
    init_security();
    init_window();
  }
});

// electron/main.ts
var main_exports = {};
var import_ee_core, app, life;
var init_main = __esm({
  "electron/main.ts"() {
    import_ee_core = require("ee-core");
    init_lifecycle();
    init_preload();
    app = new import_ee_core.ElectronEgg();
    life = new Lifecycle();
    app.register("ready", life.ready);
    app.register("electron-app-ready", life.electronAppReady);
    app.register("window-ready", life.windowReady);
    app.register("before-close", life.beforeClose);
    app.register("preload", preload);
    app.run();
  }
});

// bundle-entry:app:bundle-entry
require_app_config_registry();
require_app_controller_registry();
init_main();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIiwgIi4uLy4uL2VsZWN0cm9uL2NvbmZpZy9jb25maWcubG9jYWwudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5wcm9kLnRzIiwgImNvbmZpZy1yZWdpc3RyeTphcHA6Y29uZmlnLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2UvY3Jvc3MudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9jcm9zcy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2VmZmVjdC50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2V4YW1wbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy9hdXRvX3VwZGF0ZXIudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy93aW5kb3cudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9vcy50cyIsICJjb250cm9sbGVyLXJlZ2lzdHJ5OmFwcDpjb250cm9sbGVyLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3ByZWxvYWQvbGlmZWN5Y2xlLnRzIiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2Uvb3MvdHJheS50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL3NlY3VyaXR5LnRzIiwgIi4uLy4uL2VsZWN0cm9uL3ByZWxvYWQvaW5kZXgudHMiLCAiLi4vLi4vZWxlY3Ryb24vbWFpbi50cyIsICJidW5kbGUtZW50cnk6YXBwOmJ1bmRsZS1lbnRyeSJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRCYXNlRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IGZhbHNlLFxuICAgIHNpbmdsZUxvY2s6IHRydWUsXG4gICAgd2luZG93c09wdGlvbjoge1xuICAgICAgdGl0bGU6ICdlbGVjdHJvbi1lZ2cnLFxuICAgICAgd2lkdGg6IDk4MCxcbiAgICAgIGhlaWdodDogODUwLFxuICAgICAgbWluV2lkdGg6IDQwMCxcbiAgICAgIG1pbkhlaWdodDogMzAwLFxuICAgICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgICAgLy93ZWJTZWN1cml0eTogZmFsc2UsXG4gICAgICAgIGNvbnRleHRJc29sYXRpb246IGZhbHNlLCAvLyBmYWxzZSAtPiBcdTUzRUZcdTU3MjhcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcdTRFMkRcdTRGN0ZcdTc1MjhlbGVjdHJvblx1NzY4NGFwaVx1RkYwQ3RydWUtPlx1OTcwMFx1ODk4MWJyaWRnZS5qcyhjb250ZXh0QnJpZGdlKVxuICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgICAgIC8vcHJlbG9hZDogcGF0aC5qb2luKGdldEVsZWN0cm9uRGlyKCksICdwcmVsb2FkJywgJ2JyaWRnZS5qcycpLFxuICAgICAgfSxcbiAgICAgIGZyYW1lOiB0cnVlLFxuICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgIGljb246IHBhdGguam9pbihnZXRCYXNlRGlyKCksICdwdWJsaWMnLCAnaW1hZ2VzJywgJ2xvZ28tMzIucG5nJyksXG4gICAgfSxcbiAgICBsb2dnZXI6IHtcbiAgICAgIGxldmVsOiAnaW5mbycsIC8vICdmYXRhbCcsICdlcnJvcicsICd3YXJuJywgJ2luZm8nLCAnZGVidWcnLCAndHJhY2UnIG9yICdzaWxlbnQnXG4gICAgICByb3RhdG9yOiAnZGFpbHknLCAvLyBkYWlseSwgaG91cmx5XG4gICAgICBkYXRlRm9ybWF0OiAneXl5eS1NTS1kZCcsXG4gICAgICBtYXhTaXplOiAnMTAwbScsXG4gICAgICByZWRhY3Q6IFtdLFxuICAgICAgcmVkYWN0Q2Vuc29yOiAnW1JlZGFjdGVkXScsXG4gICAgICB0aW1lc3RhbXA6IHRydWUsXG4gICAgICBkZXB0aExpbWl0OiA1LFxuICAgICAgdGltZXpvbmU6ICdBc2lhL1NoYW5naGFpJyxcbiAgICAgIG5hbWU6ICdlZScsXG4gICAgICBhcHBMb2dOYW1lOiAnZWUubG9nJyxcbiAgICAgIGNvcmVMb2dOYW1lOiAnZWUtY29yZS5sb2cnLFxuICAgICAgZXJyb3JMb2dOYW1lOiAnZWUtZXJyb3IubG9nJ1xuICAgIH0sXG4gICAgcmVtb3RlOiB7XG4gICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgdXJsOiAnaHR0cDovL2VsZWN0cm9uLWVnZy5rYWthOTk2LmNvbS8nXG4gICAgfSxcbiAgICBzb2NrZXRTZXJ2ZXI6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIHBvcnQ6IDcwNzAsXG4gICAgICBwYXRoOiBcIi9zb2NrZXQuaW8vXCIsXG4gICAgICBjb25uZWN0VGltZW91dDogNDUwMDAsXG4gICAgICBwaW5nVGltZW91dDogMzAwMDAsXG4gICAgICBwaW5nSW50ZXJ2YWw6IDI1MDAwLFxuICAgICAgbWF4SHR0cEJ1ZmZlclNpemU6IDFlOCxcbiAgICAgIHRyYW5zcG9ydHM6IFtcInBvbGxpbmdcIiwgXCJ3ZWJzb2NrZXRcIl0sXG4gICAgICBjb3JzOiB7XG4gICAgICAgIG9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBjaGFubmVsOiAnc29ja2V0LWNoYW5uZWwnXG4gICAgfSxcbiAgICBodHRwU2VydmVyOiB7XG4gICAgICBlbmFibGU6IHRydWUsXG4gICAgICBodHRwczoge1xuICAgICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgICBrZXk6ICcvcHVibGljL3NzbC9sb2NhbGhvc3QrMS5rZXknLFxuICAgICAgICBjZXJ0OiAnL3B1YmxpYy9zc2wvbG9jYWxob3N0KzEucGVtJ1xuICAgICAgfSxcbiAgICAgIHByb3RvY29sOiAnaHR0cDovLycsXG4gICAgICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgICAgIHBvcnQ6IDcwNzEsXG4gICAgICBjb3JzOiB7IG9yaWdpbjogJyonIH0sXG4gICAgICBib2R5OiB7XG4gICAgICAgIG11bHRpcGFydDogZmFsc2UsXG4gICAgICAgIGZvcm1pZGFibGU6IHsga2VlcEV4dGVuc2lvbnM6IGZhbHNlIH1cbiAgICAgIH0sXG4gICAgICBmaWx0ZXJSZXF1ZXN0OiB7XG4gICAgICAgIHVyaXM6IFtdLFxuICAgICAgICByZXR1cm5EYXRhOiAnJ1xuICAgICAgfSxcbiAgICB9LFxuICAgIG1haW5TZXJ2ZXI6IHtcbiAgICAgIHByb3RvY29sOiAnZmlsZTovLycsXG4gICAgICBpbmRleFBhdGg6ICcvcHVibGljL2Rpc3QvaW5kZXguaHRtbCcsXG4gICAgICBjaGFubmVsU2VwYXJhdG9yOiAnLycsXG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBEZXZlbG9wbWVudCBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uLCBjb3ZlcmFnZSBjb25maWcuZGVmYXVsdC5qc1xuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IHtcbiAgICAgIG1vZGU6ICdkZXRhY2gnXG4gICAgfSxcbiAgICBqb2JzOiB7XG4gICAgICBtZXNzYWdlTG9nOiBmYWxzZVxuICAgIH1cbiAgfTtcbn07XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiAgY292ZXJhZ2UgY29uZmlnLmRlZmF1bHQuanNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCk6IFBhcnRpYWw8Q29uZmlnPiA9PiB7XG4gIHJldHVybiB7XG4gICAgb3BlbkRldlRvb2xzOiBmYWxzZSxcbiAgfTtcbn07XG4iLCAiLy8gQXV0by1nZW5lcmF0ZWQgY29uZmlnIHJlZ2lzdHJ5IC0gZG8gbm90IGVkaXRcbmdsb2JhbC5fX0VFX0NPTkZJR19SRUdJU1RSWV9fID0gW1xuICB7IGZpbGVuYW1lOiBcImNvbmZpZy5kZWZhdWx0XCIsIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jb25maWcuZGVmYXVsdC50c1wiKTsgfSB9LFxuICB7IGZpbGVuYW1lOiBcImNvbmZpZy5sb2NhbFwiLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY29uZmlnLmxvY2FsLnRzXCIpOyB9IH0sXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLnByb2RcIiwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbmZpZy5wcm9kLnRzXCIpOyB9IH1cbl07IiwgImltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldEV4dHJhUmVzb3VyY2VzRGlyLCBnZXRMb2dEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgaXMgfSBmcm9tICdlZS1jb3JlL3V0aWxzJztcbmltcG9ydCB7IGNyb3NzIH0gZnJvbSAnZWUtY29yZS9jcm9zcyc7XG5pbXBvcnQgdHlwZSB7IENyb3NzVGFyZ2V0Q29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5cbi8qKlxuICogY3Jvc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBDcm9zc1NlcnZpY2Uge1xuXG4gIGluZm8oKTogc3RyaW5nIHtcbiAgICBjb25zdCBwaWRzID0gY3Jvc3MuZ2V0UGlkcygpO1xuICAgIGxvZ2dlci5pbmZvKCdjcm9zcyBwaWRzOicsIHBpZHMpO1xuXG4gICAgbGV0IG51bSA9IDE7XG4gICAgcGlkcy5mb3JFYWNoKChwaWQ6IHN0cmluZykgPT4ge1xuICAgICAgbGV0IGVudGl0eSA9IGNyb3NzLmdldFByb2MocGlkKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBzZXJ2ZXItJHtudW19IG5hbWU6JHtlbnRpdHkubmFtZX1gKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBzZXJ2ZXItJHtudW19IGNvbmZpZzpgLCBlbnRpdHkuY29uZmlnKTtcbiAgICAgIG51bSsrO1xuICAgIH0pXG5cbiAgICByZXR1cm4gJ2hlbGxvIGVsZWN0cm9uLWVnZyc7XG4gIH1cblxuICBnZXRVcmwobmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBzZXJ2ZXJVcmwgPSBjcm9zcy5nZXRVcmwobmFtZSk7XG4gICAgcmV0dXJuIHNlcnZlclVybDtcbiAgfVxuXG4gIGtpbGxTZXJ2ZXIodHlwZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodHlwZSA9PSAnYWxsJykge1xuICAgICAgY3Jvc3Mua2lsbEFsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjcm9zcy5raWxsQnlOYW1lKG5hbWUpO1xuICAgIH1cbiAgfSAgXG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBnbyBzZXJ2aWNlXG4gICAqIEluIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24sIHNlcnZpY2VzIGNhbiBiZSBzdGFydGVkIHdpdGggYXBwbGljYXRpb25zLiBcbiAgICogRGV2ZWxvcGVycyBjYW4gdHVybiBvZmYgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIGNyZWF0ZSBpdCBtYW51YWxseS5cbiAgICovICAgXG4gIGFzeW5jIGNyZWF0ZUdvU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIG1ldGhvZCAxOiBVc2UgdGhlIGRlZmF1bHQgU2V0dGluZ3NcbiAgICAvL2NvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSk7XG5cbiAgICAvLyBtZXRob2QgMjogVXNlIGN1c3RvbSBjb25maWd1cmF0aW9uXG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcImdvXCI7XG4gICAgY29uc3Qgb3B0OiBDcm9zc1RhcmdldENvbmZpZyA9IHtcbiAgICAgIG5hbWU6ICdnb2FwcCcsXG4gICAgICBjbWQ6IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCAnZ29hcHAnKSxcbiAgICAgIGRpcmVjdG9yeTogZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSxcbiAgICAgIGFyZ3M6IFsnLS1wb3J0PTcwNzMnXSxcbiAgICAgIGFwcEV4aXQ6IHRydWUsXG4gICAgfVxuICAgIGNvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSwgb3B0KTtcbiAgICBsb2dnZXIuaW5mbygnW2dvXSBzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ1tnb10gc2VydmVyIGNvbmZpZzonLCBlbnRpdHkuY29uZmlnKTtcbiAgICBsb2dnZXIuaW5mbygnW2dvXSBzZXJ2ZXIgdXJsOicsIGVudGl0eS5nZXRVcmwoKSk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIGphdmEgc2VydmVyXG4gICAqL1xuICBhc3luYyBjcmVhdGVKYXZhU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gXCJqYXZhXCI7XG4gICAgY29uc3QgamFyUGF0aCA9IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCAnamF2YS1hcHAuamFyJyk7XG4gICAgY29uc3Qgb3B0OiBDcm9zc1RhcmdldENvbmZpZyA9IHtcbiAgICAgIG5hbWU6ICdqYXZhYXBwJyxcbiAgICAgIGNtZDogcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdqcmUxLjguMF8yMDEvYmluL2phdmF3LmV4ZScpLFxuICAgICAgZGlyZWN0b3J5OiBnZXRFeHRyYVJlc291cmNlc0RpcigpLFxuICAgICAgYXJnczogWyctamFyJywgJy1zZXJ2ZXInLCAnLVhtczUxMk0nLCAnLVhteDUxMk0nLCAnLVhzczUxMmsnLCAnLURzcHJpbmcucHJvZmlsZXMuYWN0aXZlPXByb2QnLCBgLURzZXJ2ZXIucG9ydD0xODA4MGAsIGAtRGxvZ2dpbmcuZmlsZS5wYXRoPSR7Z2V0TG9nRGlyKCl9YCwgYCR7amFyUGF0aH1gXSxcbiAgICAgIGFwcEV4aXQ6IGZhbHNlLFxuICAgIH1cbiAgICBpZiAoaXMubWFjT1MoKSkge1xuICAgICAgLy8gU2V0dXAgSmF2YSBwcm9ncmFtXG4gICAgICBvcHQuY21kID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdqcmUxLjguMF8yMDEuanJlL0NvbnRlbnRzL0hvbWUvYmluL2phdmEnKTtcbiAgICB9XG4gICAgaWYgKGlzLmxpbnV4KCkpIHtcbiAgICAgIC8vIFNldHVwIEphdmEgcHJvZ3JhbVxuICAgIH1cblxuICAgIGNvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSwgb3B0KTtcbiAgICBsb2dnZXIuaW5mbygnc2VydmVyIG5hbWU6JywgZW50aXR5Lm5hbWUpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgY29uZmlnOicsIGVudGl0eS5jb25maWcpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgdXJsOicsIGNyb3NzLmdldFVybChlbnRpdHkubmFtZSkpO1xuXG4gICAgcmV0dXJuO1xuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlIHB5dGhvbiBzZXJ2aWNlXG4gICAqIEluIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24sIHNlcnZpY2VzIGNhbiBiZSBzdGFydGVkIHdpdGggYXBwbGljYXRpb25zLiBcbiAgICogRGV2ZWxvcGVycyBjYW4gdHVybiBvZmYgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIGNyZWF0ZSBpdCBtYW51YWxseS5cbiAgICovICAgXG4gIGFzeW5jIGNyZWF0ZVB5dGhvblNlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBtZXRob2QgMTogVXNlIHRoZSBkZWZhdWx0IFNldHRpbmdzXG4gICAgLy9jb25zdCBlbnRpdHkgPSBhd2FpdCBjcm9zcy5ydW4oc2VydmljZU5hbWUpO1xuXG4gICAgLy8gbWV0aG9kIDI6IFVzZSBjdXN0b20gY29uZmlndXJhdGlvblxuICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gXCJweXRob25cIjtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ3B5YXBwJyxcbiAgICAgIGNtZDogcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdweScsICdweWFwcCcpLFxuICAgICAgZGlyZWN0b3J5OiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ3B5JyksXG4gICAgICBhcmdzOiBbJy0tcG9ydD03MDc0J10sXG4gICAgICB3aW5kb3dzRXh0bmFtZTogdHJ1ZSxcbiAgICAgIGFwcEV4aXQ6IHRydWUsXG4gICAgfVxuICAgIGNvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSwgb3B0KTtcbiAgICBsb2dnZXIuaW5mbygnc2VydmVyIG5hbWU6JywgZW50aXR5Lm5hbWUpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgY29uZmlnOicsIGVudGl0eS5jb25maWcpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgdXJsOicsIGVudGl0eS5nZXRVcmwoKSk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBhc3luYyByZXF1ZXN0QXBpKG5hbWU6IHN0cmluZywgdXJsUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGNyb3NzLmdldFVybChuYW1lKTtcbiAgICBpZiAoIXNlcnZlclVybCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgYXBpSGVsbG8gPSBzZXJ2ZXJVcmwgKyB1cmxQYXRoO1xuICAgIGNvbnNvbGUubG9nKCdTZXJ2ZXIgVXJsOicsIHNlcnZlclVybCk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zKHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICB1cmw6IGFwaUhlbGxvLFxuICAgICAgdGltZW91dDogMTAwMCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIHByb3h5OiBmYWxzZSxcbiAgICB9KTtcbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09IDIwMCkge1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSByZXNwb25zZTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9ICBcbn1cbmV4cG9ydCBjb25zdCBjcm9zc1NlcnZpY2UgPSBuZXcgQ3Jvc3NTZXJ2aWNlKCk7ICBcbiIsICJpbXBvcnQgeyBjcm9zc1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2Nyb3NzJztcblxuLyoqXG4gKiBDcm9zc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIENyb3NzQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBWaWV3IHByb2Nlc3Mgc2VydmljZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgaW5mbygpOiBzdHJpbmcge1xuICAgIGNyb3NzU2VydmljZS5pbmZvKCk7XG4gICAgcmV0dXJuICdoZWxsbyBlbGVjdHJvbi1lZ2cnO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBzZXJ2aWNlIHVybFxuICAgKi8gIFxuICBhc3luYyBnZXRVcmwoYXJnczogeyBuYW1lOiBzdHJpbmcgfSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgeyBuYW1lIH0gPSBhcmdzO1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGNyb3NzU2VydmljZS5nZXRVcmwobmFtZSk7XG4gICAgcmV0dXJuIHNlcnZlclVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBraWxsIHNlcnZpY2VcbiAgICogQnkgZGVmYXVsdCAobW9kaWZpYWJsZSksIGtpbGxpbmcgdGhlIHByb2Nlc3Mgd2lsbCBleGl0IHRoZSBlbGVjdHJvbiBhcHBsaWNhdGlvbi5cbiAgICovICBcbiAgYXN5bmMga2lsbFNlcnZlcihhcmdzOiB7IHR5cGU6IHN0cmluZzsgbmFtZTogc3RyaW5nIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHR5cGUsIG5hbWUgfSA9IGFyZ3M7XG4gICAgY3Jvc3NTZXJ2aWNlLmtpbGxTZXJ2ZXIodHlwZSwgbmFtZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBzZXJ2aWNlXG4gICAqLyAgIFxuICBhc3luYyBjcmVhdGVTZXJ2ZXIoYXJnczogeyBwcm9ncmFtOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgcHJvZ3JhbSB9ID0gYXJncztcbiAgICBpZiAocHJvZ3JhbSA9PSAnZ28nKSB7XG4gICAgICBjcm9zc1NlcnZpY2UuY3JlYXRlR29TZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKHByb2dyYW0gPT0gJ2phdmEnKSB7XG4gICAgICBjcm9zc1NlcnZpY2UuY3JlYXRlSmF2YVNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAocHJvZ3JhbSA9PSAncHl0aG9uJykge1xuICAgICAgY3Jvc3NTZXJ2aWNlLmNyZWF0ZVB5dGhvblNlcnZlcigpO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY2Nlc3MgdGhlIGFwaSBmb3IgdGhlIGNyb3NzIHNlcnZpY2VcbiAgICovXG4gIGFzeW5jIHJlcXVlc3RBcGkoYXJnczogeyBuYW1lOiBzdHJpbmc7IHVybFBhdGg6IHN0cmluZzsgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHsgbmFtZSwgdXJsUGF0aCwgcGFyYW1zfSA9IGFyZ3M7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGNyb3NzU2VydmljZS5yZXF1ZXN0QXBpKG5hbWUsIHVybFBhdGgsIHBhcmFtcyk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IENyb3NzQ29udHJvbGxlcjtcbiIsICJpbXBvcnQgeyBkaWFsb2cgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbi8qKlxuICogZWZmZWN0IC0gZGVtb1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEVmZmVjdENvbnRyb2xsZXIge1xuICAvKipcbiAgICogc2VsZWN0IGZpbGVcbiAgICovXG4gIHNlbGVjdEZpbGUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nU3luYyh7XG4gICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJ11cbiAgICB9KTtcblxuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHJldHVybiBmaWxlUGF0aHNbMF07XG4gIH1cblxuICAvKipcbiAgICogbG9naW4gd2luZG93XG4gICAqL1xuICBsb2dpbldpbmRvdyhhcmdzOiB7IHdpZHRoPzogbnVtYmVyOyBoZWlnaHQ/OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gYXJncztcbiAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG5cbiAgICBjb25zdCBzaXplID0ge1xuICAgICAgd2lkdGg6IHdpZHRoIHx8IDQwMCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IHx8IDMwMFxuICAgIH1cbiAgICB3aW4uc2V0U2l6ZShzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgd2luLnNldFJlc2l6YWJsZSh0cnVlKTtcbiAgICB3aW4uY2VudGVyKCk7XG4gICAgd2luLnNob3coKTtcbiAgICB3aW4uZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXN0b3JlIHdpbmRvd1xuICAgKi9cbiAgcmVzdG9yZVdpbmRvdyhhcmdzOiB7IHdpZHRoPzogbnVtYmVyOyBoZWlnaHQ/OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gYXJncztcbiAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG5cbiAgICBjb25zdCBzaXplID0ge1xuICAgICAgd2lkdGg6IHdpZHRoIHx8IDk4MCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IHx8IDY1MFxuICAgIH1cbiAgICB3aW4uc2V0U2l6ZShzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgd2luLnNldFJlc2l6YWJsZSh0cnVlKTtcbiAgICB3aW4uY2VudGVyKCk7XG4gICAgd2luLnNob3coKTtcbiAgICB3aW4uZm9jdXMoKTtcbiAgfSAgIFxufVxuZXhwb3J0IGRlZmF1bHQgRWZmZWN0Q29udHJvbGxlcjtcbiIsICIvKipcbiAqIGV4YW1wbGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBFeGFtcGxlQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiB0ZXN0XG4gICAqL1xuICBhc3luYyB0ZXN0ICgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgRXhhbXBsZUNvbnRyb2xsZXI7XG4iLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgQ2hpbGRKb2IsIENoaWxkUG9vbEpvYiB9IGZyb20gJ2VlLWNvcmUvam9icyc7XG5pbXBvcnQgdHlwZSB7IEpvYlByb2Nlc3MgfSBmcm9tICdlZS1jb3JlL2pvYnMvY2hpbGQvam9iUHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IElwY01haW5FdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcblxuLyoqXG4gKiBmcmFtZXdvcmtcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGcmFtZXdvcmtTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBteVRpbWVyOiBOb2RlSlMuVGltZW91dCB8IG51bGw7XG4gIHByaXZhdGUgbXlKb2I6IENoaWxkSm9iO1xuICBwcml2YXRlIG15Sm9iUG9vbDogQ2hpbGRQb29sSm9iO1xuICBwcml2YXRlIHRhc2tGb3JKb2I6IFJlY29yZDxzdHJpbmcsIEpvYlByb2Nlc3M+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIFx1NTcyOFx1Njc4NFx1OTAyMFx1NTFGRFx1NjU3MFx1NEUyRFx1NTIxRFx1NTlDQlx1NTMxNlx1NEUwMFx1NEU5Qlx1NTNEOFx1OTFDRlxuICAgIHRoaXMubXlUaW1lciA9IG51bGw7XG4gICAgdGhpcy5teUpvYiA9IG5ldyBDaGlsZEpvYigpO1xuICAgIHRoaXMubXlKb2JQb29sID0gbmV3IENoaWxkUG9vbEpvYigpO1xuICAgIHRoaXMudGFza0ZvckpvYiA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIHRlc3RcbiAgICovXG4gIGFzeW5jIHRlc3QoYXJnczogdW5rbm93bik6IFByb21pc2U8eyBzdGF0dXM6IHN0cmluZzsgcGFyYW1zOiB1bmtub3duIH0+IHtcbiAgICBsZXQgb2JqID0ge1xuICAgICAgc3RhdHVzOidvaycsXG4gICAgICBwYXJhbXM6IGFyZ3NcbiAgICB9XG4gICAgbG9nZ2VyLmluZm8oJ0ZyYW1ld29ya1NlcnZpY2Ugb2JqOicsIG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBpcGNcdTkwMUFcdTRGRTEoXHU1M0NDXHU1NDExKVxuICAgKi9cbiAgYm90aFdheU1lc3NhZ2UodHlwZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBzdHJpbmcge1xuICAgIC8vIFx1NTI0RFx1N0FFRmlwY1x1OTg5MVx1OTA1MyBjaGFubmVsXG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay9pcGNTZW5kTXNnJztcblxuICAgIGlmICh0eXBlID09ICdzdGFydCcpIHtcbiAgICAgIC8vIFx1NkJDRlx1OTY5NDFcdTc5RDJcdUZGMENcdTU0MTFcdTUyNERcdTdBRUZcdTk4NzVcdTk3NjJcdTUzRDFcdTkwMDFcdTZEODhcdTYwNkZcbiAgICAgIC8vIFx1NzUyOFx1NUI5QVx1NjVGNlx1NTY2OFx1NkEyMVx1NjJERlxuICAgICAgdGhpcy5teVRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oZSwgYywgbXNnKSB7XG4gICAgICAgIGxldCB0aW1lTm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGV0IGRhdGEgPSBtc2cgKyAnOicgKyB0aW1lTm93O1xuICAgICAgICBlLnJlcGx5KGAke2N9YCwgZGF0YSlcbiAgICAgIH0sIDEwMDAsIGV2ZW50LCBjaGFubmVsLCBjb250ZW50KVxuXG4gICAgICByZXR1cm4gJ1x1NUYwMFx1NTlDQlx1NEU4NidcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ2VuZCcpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5teVRpbWVyISk7XG4gICAgICByZXR1cm4gJ1x1NTA1Q1x1NkI2Mlx1NEU4NicgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnb2h0aGVyJ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovIFxuICBkb0pvYihqb2JJZDogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICBsZXQgcmVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGxldCBvbmVUYXNrOiBKb2JQcm9jZXNzIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9mcmFtZXdvcmsvdGltZXJKb2JQcm9ncmVzcyc7XG4gIFxuICAgIGlmIChhY3Rpb24gPT0gJ2NyZWF0ZScpIHtcbiAgICAgIC8vIFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVx1NTNDQVx1NzZEMVx1NTQyQ1x1OEZEQlx1NUVBNlxuICAgICAgbGV0IGV2ZW50TmFtZSA9ICdqb2ItdGltZXItcHJvZ3Jlc3MtJyArIGpvYklkO1xuICAgICAgY29uc3QgdGltZXJUYXNrID0gdGhpcy5teUpvYi5leGVjKCcuL2pvYnMvZXhhbXBsZS90aW1lcicsIHtqb2JJZH0pO1xuICAgICAgdGltZXJUYXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YTogdW5rbm93bikgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnW21haW4tcHJvY2Vzc10gdGltZXJUYXNrLCBmcm9tIFRpbWVySm9iIGRhdGE6JywgZGF0YSk7XG4gICAgICAgIC8vIFx1NTNEMVx1OTAwMVx1NjU3MFx1NjM2RVx1NTIzMFx1NkUzMlx1NjdEM1x1OEZEQlx1N0EwQlxuICAgICAgICBldmVudC5zZW5kZXIuc2VuZChgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICB9KVxuICAgIFxuICAgICAgLy8gXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2IFx1NUYwMlx1NkI2NVxuICAgICAgLy8gbXlqb2IuZXhlY1Byb21pc2UoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSkudGhlbih0YXNrID0+IHtcbiAgICAgIC8vICAgdGFzay5lbWl0dGVyLm9uKGV2ZW50TmFtZSwgKGRhdGEpID0+IHtcbiAgICAgIC8vICAgICBMb2cuaW5mbygnW21haW4tcHJvY2Vzc10gdGltZXJUYXNrLCBmcm9tIFRpbWVySm9iIGRhdGE6JywgZGF0YSk7XG4gICAgICAvLyAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAvLyAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuICAgICAgLy8gICB9KVxuICAgICAgLy8gfSk7XG5cbiAgICAgIHJlcy5waWQgPSB0aW1lclRhc2sucGlkOyBcbiAgICAgIHRoaXMudGFza0ZvckpvYltqb2JJZF0gPSB0aW1lclRhc2s7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gPT0gJ2Nsb3NlJykge1xuICAgICAgb25lVGFzayA9IHRoaXMudGFza0ZvckpvYltqb2JJZF07XG4gICAgICBvbmVUYXNrLmtpbGwoKTtcbiAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwge2pvYklkLCBudW1iZXI6MCwgcGlkOjB9KTtcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PSAncGF1c2UnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2suY2FsbEZ1bmMoJy4vam9icy9leGFtcGxlL3RpbWVyJywgJ3BhdXNlJywgam9iSWQpO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uID09ICdyZXN1bWUnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2suY2FsbEZ1bmMoJy4vam9icy9leGFtcGxlL3RpbWVyJywgJ3Jlc3VtZScsIGpvYklkLCBvbmVUYXNrLnBpZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG5cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBcG9vbFxuICAgKi8gXG4gIGRvQ3JlYXRlUG9vbChudW06IG51bWJlciwgZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9mcmFtZXdvcmsvY3JlYXRlUG9vbE5vdGljZSc7XG4gICAgdGhpcy5teUpvYlBvb2wuY3JlYXRlKG51bSkudGhlbigocGlkczogc3RyaW5nW10pID0+IHtcbiAgICAgIGV2ZW50LnJlcGx5KGAke2NoYW5uZWx9YCwgcGlkcyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHU5MDFBXHU4RkM3XHU4RkRCXHU3QTBCXHU2QzYwXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXG4gICAqL1xuICBhc3luYyBkb0pvYkJ5UG9vbChqb2JJZDogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICBsZXQgcmVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9mcmFtZXdvcmsvdGltZXJKb2JQcm9ncmVzcyc7XG4gICAgaWYgKGFjdGlvbiA9PSAncnVuJykge1xuICAgICAgLy8gXHU1RjAyXHU2QjY1LVx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVx1NTNDQVx1NzZEMVx1NTQyQ1x1OEZEQlx1NUVBNlxuICAgICAgY29uc3QgdGFzayA9IGF3YWl0IHRoaXMubXlKb2JQb29sLnJ1blByb21pc2UoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSk7XG5cbiAgICAgIC8vIFx1NzZEMVx1NTQyQ1x1NTY2OFx1NTQwRFx1NzlGMFx1NTUyRlx1NEUwMFx1RkYwQ1x1NTQyNlx1NTIxOVx1NEYxQVx1NTFGQVx1NzNCMFx1OTFDRFx1NTkwRFx1NzZEMVx1NTQyQ1x1MzAwMlxuICAgICAgLy8gXHU0RUZCXHU1MkExXHU1QjhDXHU2MjEwXHU2NUY2XHVGRjBDXHU5NzAwXHU4OTgxXHU3OUZCXHU5NjY0XHU3NkQxXHU1NDJDXHU1NjY4XHVGRjBDXHU5NjMyXHU2QjYyXHU1MTg1XHU1QjU4XHU2Q0M0XHU2RjBGXG4gICAgICBsZXQgZXZlbnROYW1lID0gJ2pvYi10aW1lci1wcm9ncmVzcy0nICsgam9iSWQ7XG4gICAgICB0YXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YTogdW5rbm93bikgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnW21haW4tcHJvY2Vzc10gW0NoaWxkUG9vbEpvYl0gdGltZXJUYXNrLCBmcm9tIFRpbWVySm9iIGRhdGE6JywgZGF0YSk7XG5cbiAgICAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwgZGF0YSlcblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY1MzZcdTUyMzBcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdTc2ODRcdTZEODhcdTYwNkZcdUZGMENcdTc5RkJcdTk2NjRcdTc2RDFcdTU0MkNcdTU2NjhcbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmICdlbmQnIGluIGRhdGEgJiYgKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmVuZCkge1xuICAgICAgICAgIHRhc2suZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJlcy5waWQgPSB0YXNrLnBpZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTgzQjdcdTUzRDZcdTZCNjNcdTU3MjhcdThGRDBcdTg4NENcdTc2ODQgam9iIFx1OEZEQlx1N0EwQiBcbiAgICovIFxuICBtb25pdG9ySm9iKCk6IHZvaWQge1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCBqb2JQaWRzID0gdGhpcy5teUpvYi5nZXRQaWRzKCk7XG4gICAgICBsZXQgam9iUG9vbFBpZHMgPSB0aGlzLm15Sm9iUG9vbC5nZXRQaWRzKCk7XG4gICAgICBsb2dnZXIuaW5mbyhgW21haW4tcHJvY2Vzc10gW21vbml0b3JKb2JdIGpvYlBpZHM6ICR7am9iUGlkc30sIGpvYlBvb2xQaWRzOiAke2pvYlBvb2xQaWRzfWApO1xuICAgIH0sIDUwMDApXG4gIH1cblxufVxuZXhwb3J0IGNvbnN0IGZyYW1ld29ya1NlcnZpY2UgPSBuZXcgRnJhbWV3b3JrU2VydmljZSgpOyAgXG4iLCAiaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgYXV0b1VwZGF0ZXIgfSBmcm9tIFwiZWxlY3Ryb24tdXBkYXRlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9ncmVzc0luZm8gfSBmcm9tICdlbGVjdHJvbi11cGRhdGVyJztcbmltcG9ydCB0eXBlIHsgR2VuZXJpY1NlcnZlck9wdGlvbnMgfSBmcm9tICdidWlsZGVyLXV0aWwtcnVudGltZSc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0TWFpbldpbmRvdywgc2V0Q2xvc2VBbmRRdWl0IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbi8qKlxuICogXHU4MUVBXHU1MkE4XHU1MzQ3XHU3RUE3XG4gKiBAY2xhc3NcbiAqL1xuaW50ZXJmYWNlIFVwZGF0ZXJDb25maWcge1xuICB3aW5kb3dzOiBib29sZWFuO1xuICBtYWNPUzogYm9vbGVhbjtcbiAgbGludXg6IGJvb2xlYW47XG4gIG9wdGlvbnM6IEdlbmVyaWNTZXJ2ZXJPcHRpb25zO1xufVxuXG5jbGFzcyBBdXRvVXBkYXRlclNlcnZpY2Uge1xuICBwcml2YXRlIGNvbmZpZzogVXBkYXRlckNvbmZpZztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHdpbmRvd3M6IGZhbHNlLFxuICAgICAgbWFjT1M6IGZhbHNlLFxuICAgICAgbGludXg6IGZhbHNlLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBwcm92aWRlcjogJ2dlbmVyaWMnIGFzIGNvbnN0LFxuICAgICAgICB1cmw6ICdodHRwOi8va29kby5xaW5pdS5jb20vJ1xuICAgICAgfSxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXG4gICAqL1xuICBpbml0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbYXV0b1VwZGF0ZXJdIGxvYWQnKTtcbiAgICBjb25zdCBjZmcgPSB0aGlzLmNvbmZpZztcbiAgICBpZiAoKGlzLndpbmRvd3MoKSAmJiBjZmcud2luZG93cykgfHwgKGlzLm1hY09TKCkgJiYgY2ZnLm1hY09TKSB8fCAoaXMubGludXgoKSAmJiBjZmcubGludXgpKSB7XG4gICAgICAvLyBjb250aW51ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXMgPSB7XG4gICAgICBlcnJvcjogLTEsXG4gICAgICBhdmFpbGFibGU6IDEsXG4gICAgICBub0F2YWlsYWJsZTogMixcbiAgICAgIGRvd25sb2FkaW5nOiAzLFxuICAgICAgZG93bmxvYWRlZDogNCxcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gZWxlY3Ryb25BcHAuZ2V0VmVyc2lvbigpO1xuICAgIGxvZ2dlci5pbmZvKCdbYXV0b1VwZGF0ZXJdIGN1cnJlbnQgdmVyc2lvbjogJywgdmVyc2lvbik7XG4gIFxuICAgIC8vIFx1OEJCRVx1N0Y2RVx1NEUwQlx1OEY3RFx1NjcwRFx1NTJBMVx1NTY2OFx1NTczMFx1NTc0MFxuICAgIGxldCBzZXJ2ZXIgPSBjZmcub3B0aW9ucy51cmw7XG4gICAgbGV0IGxhc3RDaGFyID0gc2VydmVyLnN1YnN0cmluZyhzZXJ2ZXIubGVuZ3RoIC0gMSk7XG4gICAgc2VydmVyID0gbGFzdENoYXIgPT09ICcvJyA/IHNlcnZlciA6IHNlcnZlciArIFwiL1wiO1xuICAgIGNvbnN0IGZlZWRPcHRpb25zOiBHZW5lcmljU2VydmVyT3B0aW9ucyA9IHsgLi4uY2ZnLm9wdGlvbnMsIHVybDogc2VydmVyIH07XG5cbiAgICB0cnkge1xuICAgICAgYXV0b1VwZGF0ZXIuc2V0RmVlZFVSTChmZWVkT3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignW2F1dG9VcGRhdGVyXSBzZXRGZWVkVVJMIGVycm9yIDogJywgZXJyb3IpO1xuICAgIH1cbiAgXG4gICAgYXV0b1VwZGF0ZXIub24oJ2NoZWNraW5nLWZvci11cGRhdGUnLCAoKSA9PiB7XG4gICAgICAvL3NlbmRTdGF0dXNUb1dpbmRvdygnXHU2QjYzXHU1NzI4XHU2OEMwXHU2N0U1XHU2NkY0XHU2NUIwLi4uJyk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbigndXBkYXRlLWF2YWlsYWJsZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLmF2YWlsYWJsZSxcbiAgICAgICAgZGVzYzogJ1x1NjcwOVx1NTNFRlx1NzUyOFx1NjZGNFx1NjVCMCdcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1ub3QtYXZhaWxhYmxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMubm9BdmFpbGFibGUsXG4gICAgICAgIGRlc2M6ICdcdTZDQTFcdTY3MDlcdTUzRUZcdTc1MjhcdTY2RjRcdTY1QjAnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5lcnJvcixcbiAgICAgICAgZGVzYzogZXJyXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCdkb3dubG9hZC1wcm9ncmVzcycsIChwcm9ncmVzc09iajogUHJvZ3Jlc3NJbmZvKSA9PiB7XG4gICAgICBjb25zdCBwZXJjZW50TnVtYmVyID0gTWF0aC5mbG9vcihwcm9ncmVzc09iai5wZXJjZW50KTtcbiAgICAgIGNvbnN0IHRvdGFsU2l6ZSA9IHRoaXMuYnl0ZXNDaGFuZ2UocHJvZ3Jlc3NPYmoudG90YWwpO1xuICAgICAgY29uc3QgdHJhbnNmZXJyZWRTaXplID0gdGhpcy5ieXRlc0NoYW5nZShwcm9ncmVzc09iai50cmFuc2ZlcnJlZCk7XG4gICAgICBsZXQgdGV4dCA9ICdcdTVERjJcdTRFMEJcdThGN0QgJyArIHBlcmNlbnROdW1iZXIgKyAnJSc7XG4gICAgICB0ZXh0ID0gdGV4dCArICcgKCcgKyB0cmFuc2ZlcnJlZFNpemUgKyBcIi9cIiArIHRvdGFsU2l6ZSArICcpJztcbiAgXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5kb3dubG9hZGluZyxcbiAgICAgICAgZGVzYzogdGV4dCxcbiAgICAgICAgcGVyY2VudE51bWJlcixcbiAgICAgICAgdG90YWxTaXplLFxuICAgICAgICB0cmFuc2ZlcnJlZFNpemVcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5pbmZvKCdbYXV0b1VwZGF0ZXJdIHByb2dyZXNzOiAnLCB0ZXh0KTtcbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1kb3dubG9hZGVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuZG93bmxvYWRlZCxcbiAgICAgICAgZGVzYzogJ1x1NEUwQlx1OEY3RFx1NUI4Q1x1NjIxMCdcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuXG4gICAgICAvLyBcdTYyNThcdTc2RDhcdTYzRDJcdTRFRjZcdTkxQ0NcdTk3NjJcdThCQkVcdTdGNkVcdTRFODZcdTk2M0JcdTZCNjJcdTdBOTdcdTUzRTNcdTUxNzNcdTk1RURcdUZGMENcdThGRDlcdTkxQ0NcdThCQkVcdTdGNkVcdTUxNDFcdThCQjhcdTUxNzNcdTk1RURcdTdBOTdcdTUzRTNcbiAgICAgIHNldENsb3NlQW5kUXVpdCh0cnVlKTtcbiAgICAgIFxuICAgICAgLy8gSW5zdGFsbCB1cGRhdGVzIGFuZCBleGl0IHRoZSBhcHBsaWNhdGlvblxuICAgICAgYXV0b1VwZGF0ZXIucXVpdEFuZEluc3RhbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTY3RTVcdTY2RjRcdTY1QjBcbiAgICovXG4gIGNoZWNrVXBkYXRlICgpOiB2b2lkIHtcbiAgICBhdXRvVXBkYXRlci5jaGVja0ZvclVwZGF0ZXMoKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFx1NEUwQlx1OEY3RFx1NjZGNFx1NjVCMFxuICAgKi9cbiAgZG93bmxvYWQgKCk6IHZvaWQge1xuICAgIGF1dG9VcGRhdGVyLmRvd25sb2FkVXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogXHU1NDExXHU1MjREXHU3QUVGXHU1M0QxXHU2RDg4XHU2MDZGXG4gICAqL1xuICBzZW5kU3RhdHVzVG9XaW5kb3coY29udGVudDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSk6IHZvaWQge1xuICAgIGNvbnN0IHRleHRKc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjdXN0b20vYXBwL3VwZGF0ZXInO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICB3aW4ud2ViQ29udGVudHMuc2VuZChjaGFubmVsLCB0ZXh0SnNvbik7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBcdTUzNTVcdTRGNERcdThGNkNcdTYzNjJcbiAgICovXG4gIGJ5dGVzQ2hhbmdlIChsaW1pdDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgc2l6ZSA9IFwiXCI7XG4gICAgaWYobGltaXQgPCAwLjEgKiAxMDI0KXsgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBzaXplID0gbGltaXQudG9GaXhlZCgyKSArIFwiQlwiO1xuICAgIH1lbHNlIGlmKGxpbWl0IDwgMC4xICogMTAyNCAqIDEwMjQpeyAgICAgICAgICAgIFxuICAgICAgc2l6ZSA9IChsaW1pdC8xMDI0KS50b0ZpeGVkKDIpICsgXCJLQlwiO1xuICAgIH1lbHNlIGlmKGxpbWl0IDwgMC4xICogMTAyNCAqIDEwMjQgKiAxMDI0KXsgICAgICAgIFxuICAgICAgc2l6ZSA9IChsaW1pdC8oMTAyNCAqIDEwMjQpKS50b0ZpeGVkKDIpICsgXCJNQlwiO1xuICAgIH1lbHNleyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBzaXplID0gKGxpbWl0LygxMDI0ICogMTAyNCAqIDEwMjQpKS50b0ZpeGVkKDIpICsgXCJHQlwiO1xuICAgIH1cblxuICAgIGxldCBzaXplU3RyID0gc2l6ZSArIFwiXCI7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gc2l6ZVN0ci5pbmRleE9mKFwiLlwiKTsgICAgICAgICAgICAgICAgICAgIFxuICAgIGxldCBkb3UgPSBzaXplU3RyLnN1YnN0cmluZyhpbmRleCArIDEgLCBpbmRleCArIDMpOyAgICAgICAgICAgIFxuICAgIGlmKGRvdSA9PSBcIjAwXCIpe1xuICAgICAgICByZXR1cm4gc2l6ZVN0ci5zdWJzdHJpbmcoMCwgaW5kZXgpICsgc2l6ZVN0ci5zdWJzdHJpbmcoaW5kZXggKyAzLCBpbmRleCArIDUpO1xuICAgIH1cblxuICAgIHJldHVybiBzaXplO1xuICB9ICBcbn1cbmV4cG9ydCBjb25zdCBhdXRvVXBkYXRlclNlcnZpY2UgPSBuZXcgQXV0b1VwZGF0ZXJTZXJ2aWNlKCk7XG4iLCAiaW1wb3J0IGRheWpzIGZyb20gJ2RheWpzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCwgc2hlbGwsIElwY01haW5FdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldEV4dHJhUmVzb3VyY2VzRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuaW1wb3J0IHsgZnJhbWV3b3JrU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvZnJhbWV3b3JrJztcbi8vIGltcG9ydCB7IHNxbGl0ZWRiU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvZGF0YWJhc2Uvc3FsaXRlZGInO1xuLy8gaW1wb3J0IHR5cGUgeyBVc2VyUm93IH0gZnJvbSAnLi4vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYic7XG5pbXBvcnQgeyBhdXRvVXBkYXRlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL29zL2F1dG9fdXBkYXRlcic7XG5pbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICdrb2EnO1xuXG4vKipcbiAqIGZyYW1ld29yayAtIGRlbW9cbiAqIEBjbGFzc1xuICovXG5pbnRlcmZhY2UgU3FsaXRlZGJPcGVyYXRpb25BcmdzIHtcbiAgYWN0aW9uOiBzdHJpbmc7XG4gIGluZm8/OiB7IG5hbWU6IHN0cmluZzsgYWdlOiBudW1iZXIgfTtcbiAgZGVsZXRlX25hbWU/OiBzdHJpbmc7XG4gIHVwZGF0ZV9uYW1lPzogc3RyaW5nO1xuICB1cGRhdGVfYWdlPzogbnVtYmVyO1xuICBzZWFyY2hfYWdlPzogbnVtYmVyO1xuICBkYXRhX2Rpcj86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNxbGl0ZWRiT3BlcmF0aW9uUmVzdWx0IHtcbiAgYWN0aW9uOiBzdHJpbmc7XG4gIC8vIHJlc3VsdDogYm9vbGVhbiB8IHN0cmluZyB8IFVzZXJSb3dbXSB8IG51bGw7XG4gIC8vIGFsbF9saXN0OiBVc2VyUm93W107XG4gIGNvZGU6IG51bWJlcjtcbn1cblxuY2xhc3MgRnJhbWV3b3JrQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBcdTYyNDBcdTY3MDlcdTY1QjlcdTZDRDVcdTYzQTVcdTY1MzZcdTRFMjRcdTRFMkFcdTUzQzJcdTY1NzBcbiAgICogQHBhcmFtIGFyZ3MgXHU1MjREXHU3QUVGXHU0RjIwXHU3Njg0XHU1M0MyXHU2NTcwXG4gICAqIEBwYXJhbSBldmVudCAtIGlwY1x1OTAxQVx1NEZFMVx1NjVGNlx1NjI0RFx1NjcwOVx1NTAzQ1x1MzAwMlx1OEJFNlx1NjBDNVx1ODlDMVx1RkYxQVx1NjNBN1x1NTIzNlx1NTY2OFx1NjU4N1x1Njg2M1xuICAgKi9cblxuICAvKipcbiAgICogc3FsaXRlXHU2NTcwXHU2MzZFXHU1RTkzXHU2NENEXHU0RjVDXG4gICAqLyAgIFxuICAvLyBhc3luYyBzcWxpdGVkYk9wZXJhdGlvbihhcmdzOiBTcWxpdGVkYk9wZXJhdGlvbkFyZ3MpOiBQcm9taXNlPFNxbGl0ZWRiT3BlcmF0aW9uUmVzdWx0PiB7XG4gIC8vICAgY29uc3QgeyBhY3Rpb24sIGluZm8sIGRlbGV0ZV9uYW1lLCB1cGRhdGVfbmFtZSwgdXBkYXRlX2FnZSwgc2VhcmNoX2FnZSwgZGF0YV9kaXIgfSA9IGFyZ3M7XG5cbiAgLy8gICBjb25zdCBkYXRhOiBTcWxpdGVkYk9wZXJhdGlvblJlc3VsdCA9IHtcbiAgLy8gICAgIGFjdGlvbixcbiAgLy8gICAgIHJlc3VsdDogbnVsbCxcbiAgLy8gICAgIGFsbF9saXN0OiBbXSxcbiAgLy8gICAgIGNvZGU6IDBcbiAgLy8gICB9O1xuXG4gIC8vICAgdHJ5IHtcbiAgLy8gICAgIC8vIHRlc3RcbiAgLy8gICAgIHNxbGl0ZWRiU2VydmljZS5nZXREYXRhRGlyKCk7XG4gIC8vICAgfSBjYXRjaCAoZXJyKSB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAvLyAgICAgZGF0YS5jb2RlID0gLTE7XG4gIC8vICAgICByZXR1cm4gZGF0YTtcbiAgLy8gICB9XG5cbiAgLy8gICBzd2l0Y2ggKGFjdGlvbikge1xuICAvLyAgICAgY2FzZSAnYWRkJyA6XG4gIC8vICAgICAgIGlmIChpbmZvKSB7XG4gIC8vICAgICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuYWRkVGVzdERhdGFTcWxpdGUoaW5mbyk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgICBjYXNlICdkZWwnIDpcbiAgLy8gICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZGVsVGVzdERhdGFTcWxpdGUoZGVsZXRlX25hbWUpOztcbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgICBjYXNlICd1cGRhdGUnIDpcbiAgLy8gICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UudXBkYXRlVGVzdERhdGFTcWxpdGUodXBkYXRlX25hbWUsIHVwZGF0ZV9hZ2UpO1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGNhc2UgJ2dldCcgOlxuICAvLyAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5nZXRUZXN0RGF0YVNxbGl0ZShzZWFyY2hfYWdlKTtcbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgICBjYXNlICdnZXREYXRhRGlyJyA6XG4gIC8vICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmdldERhdGFEaXIoKTtcbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgICBjYXNlICdzZXREYXRhRGlyJyA6XG4gIC8vICAgICAgIGlmIChkYXRhX2Rpcikge1xuICAvLyAgICAgICAgIGF3YWl0IHNxbGl0ZWRiU2VydmljZS5zZXRDdXN0b21EYXRhRGlyKGRhdGFfZGlyKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgICBicmVhazsgICAgICAgICAgICBcbiAgLy8gICB9XG5cbiAgLy8gICBkYXRhLmFsbF9saXN0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmdldEFsbFRlc3REYXRhU3FsaXRlKCk7XG5cbiAgLy8gICByZXR1cm4gZGF0YTtcbiAgLy8gfSAgXG5cbiAgLyoqXG4gICAqIFx1OEMwM1x1NzUyOFx1NTE3Nlx1NUI4M1x1N0EwQlx1NUU4Rlx1RkYwOGV4ZVx1MzAwMWJhc2hcdTdCNDlcdTUzRUZcdTYyNjdcdTg4NENcdTdBMEJcdTVFOEZcdUZGMDlcbiAgICogXG4gICAqL1xuICBvcGVuU29mdHdhcmUoYXJnczogeyBzb2Z0TmFtZTogc3RyaW5nIH0pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHNvZnROYW1lIH0gPSBhcmdzO1xuICAgIGNvbnN0IHNvZnR3YXJlUGF0aCA9IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCBzb2Z0TmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ1tvcGVuU29mdHdhcmVdIHNvZnR3YXJlUGF0aDonLCBzb2Z0d2FyZVBhdGgpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU3QTBCXHU1RThGXHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHNvZnR3YXJlUGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gXHU1NDdEXHU0RUU0XHU4ODRDXHU1QjU3XHU3QjI2XHU0RTMyIFx1NUU3NiBcdTYyNjdcdTg4NEMsIHN0YXJ0IFx1NTQ3RFx1NEVFNFx1NTQwRVx1OTc2Mlx1NzY4NFx1OERFRlx1NUY4NFx1ODk4MVx1NTJBMFx1NTNDQ1x1NUYxNVx1NTNGN1xuICAgIGNvbnN0IGNtZFN0ciA9IGBzdGFydCBcIiR7c29mdHdhcmVQYXRofVwiYDtcbiAgICBleGVjKGNtZFN0cik7XG5cbiAgICAvLyBcdTY1QjlcdTZDRDVcdTRFOENcbiAgICAvLyBcdTRGN0ZcdTc1Mjhjcm9zc1x1NkEyMVx1NTc1N1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTZENEJodHRwXHU2NzBEXHU1MkExXHU2NjJGXHU1NDI2XHU1RjAwXHU1NDJGXG4gICAqLyBcbiAgYXN5bmMgY2hlY2tIdHRwU2VydmVyKCk6IFByb21pc2U8eyBlbmFibGU6IGJvb2xlYW47IHNlcnZlcjogc3RyaW5nIH0+IHtcbiAgICBjb25zdCB7IGVuYWJsZSwgcHJvdG9jb2wsIGhvc3QsIHBvcnQgfSA9IChnZXRDb25maWcoKSBhcyBDb25maWcpLmh0dHBTZXJ2ZXI7XG4gICAgY29uc3QgdXJsID0gcHJvdG9jb2wgKyBob3N0ICsgJzonICsgcG9ydDtcbiAgICBjb25zb2xlLmxvZygnW2NoZWNrSHR0cFNlcnZlcl0gdXJsOicsIHVybCk7XG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIGVuYWJsZTogZW5hYmxlLFxuICAgICAgc2VydmVyOiB1cmxcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU0RTAwXHU0RTJBIGh0dHAgXHU4QkY3XHU2QzQyXG4gICAqIGFyZ3MgXHU2NjJGIFx1NTI0RFx1N0FFRlx1NEYyMFx1NzY4NFx1NTNDMlx1NjU3MFxuICAgKiBjdHggXHU2NjJGIGtvYSBcdTc2ODQgY3R4IFx1NUJGOVx1OEM2MVxuICAgKi9cbiAgYXN5bmMgZG9IdHRwUmVxdWVzdChhcmdzOiB7IGlkOiBzdHJpbmcgfSwgY3R4OiBDb250ZXh0ICYgeyByZXF1ZXN0OiB7IGJvZHk/OiB1bmtub3duIH0gfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGh0dHBJbmZvID0ge1xuICAgICAgYXJncyxcbiAgICAgIG1ldGhvZDogY3R4LnJlcXVlc3QubWV0aG9kLFxuICAgICAgcXVlcnk6IGN0eC5yZXF1ZXN0LnF1ZXJ5LFxuICAgICAgYm9keTogY3R4LnJlcXVlc3QuYm9keVxuICAgIH1cbiAgICBsb2dnZXIuaW5mbygnaHR0cEluZm86JywgaHR0cEluZm8pO1xuXG4gICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGRpciA9IGVsZWN0cm9uQXBwLmdldFBhdGgoaWQgYXMgUGFyYW1ldGVyczx0eXBlb2YgZWxlY3Ryb25BcHAuZ2V0UGF0aD5bMF0pO1xuICAgIHNoZWxsLm9wZW5QYXRoKGRpcik7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFMDBcdTRFMkFzb2NrZXQgaW9cdThCRjdcdTZDNDJcdThCQkZcdTk1RUVcdTZCNjRcdTY1QjlcdTZDRDVcbiAgICovXG4gIGFzeW5jIGRvU29ja2V0UmVxdWVzdChhcmdzOiB7IGlkOiBzdHJpbmcgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHsgaWQgfSA9IGFyZ3M7XG4gICAgaWYgKCFpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBkaXIgPSBlbGVjdHJvbkFwcC5nZXRQYXRoKGlkIGFzIFBhcmFtZXRlcnM8dHlwZW9mIGVsZWN0cm9uQXBwLmdldFBhdGg+WzBdKTtcbiAgICBzaGVsbC5vcGVuUGF0aChkaXIpO1xuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIFxuICAvKipcbiAgICogXHU1RjAyXHU2QjY1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXG4gICAqLyBcbiAgYXN5bmMgaXBjSW52b2tlTXNnKGFyZ3M6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IHRpbWVOb3cgPSBkYXlqcygpLmZvcm1hdCgnWVlZWS1NTS1ERCBISDptbTpzcycpO1xuICAgIGNvbnN0IGRhdGEgPSBhcmdzICsgJyAtICcgKyB0aW1lTm93O1xuICAgIFxuICAgIHJldHVybiBkYXRhO1xuICB9ICBcblxuICAvKipcbiAgICogXHU1NDBDXHU2QjY1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXG4gICAqLyBcbiAgYXN5bmMgaXBjU2VuZFN5bmNNc2coYXJnczogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgdGltZU5vdyA9IGRheWpzKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG4gICAgY29uc3QgZGF0YSA9IGFyZ3MgKyAnIC0gJyArIHRpbWVOb3c7XG4gICAgXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdTUzQ0NcdTU0MTFcdTVGMDJcdTZCNjVcdTkwMUFcdTRGRTFcbiAgICovXG4gIGlwY1NlbmRNc2coYXJnczogeyB0eXBlOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHR5cGUsIGNvbnRlbnQgfSA9IGFyZ3M7XG4gICAgY29uc3QgZGF0YSA9IGZyYW1ld29ya1NlcnZpY2UuYm90aFdheU1lc3NhZ2UodHlwZSwgY29udGVudCwgZXZlbnQpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU0RUZCXHU1MkExXG4gICAqL1xuICBzb21lSm9iKGFyZ3M6IHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmcgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmc7IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQgfSB7XG4gICAgY29uc3QgeyBqb2JJZCwgYWN0aW9ufSA9IGFyZ3M7XG4gICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG5cbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgcmVzdWx0ID0gZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrOyAgICAgICBcbiAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGF1c2UnOlxuICAgICAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7ICBcbiAgICAgIGNhc2UgJ3Jlc3VtZSc6XG4gICAgICAgIGZyYW1ld29ya1NlcnZpY2UuZG9Kb2Ioam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhazsgICBcbiAgICAgIGRlZmF1bHQ6ICBcbiAgICB9XG4gICAgXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICBqb2JJZCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcdTRFRkJcdTUyQTFcdTZDNjBcbiAgICovIFxuICBhc3luYyBjcmVhdGVQb29sKGFyZ3M6IHsgbnVtYmVyOiBudW1iZXIgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBudW0gPSBhcmdzLm51bWJlcjtcbiAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvQ3JlYXRlUG9vbChudW0sIGV2ZW50KTtcblxuICAgIC8vIHRlc3QgbW9uaXRvclxuICAgIGZyYW1ld29ya1NlcnZpY2UubW9uaXRvckpvYigpO1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1OTAxQVx1OEZDN1x1OEZEQlx1N0EwQlx1NkM2MFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVxuICAgKi9cbiAgYXN5bmMgc29tZUpvYkJ5UG9vbChhcmdzOiB7IGpvYklkOiBzdHJpbmc7IGFjdGlvbjogc3RyaW5nIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBQcm9taXNlPHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmc7IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfT4ge1xuICAgIGNvbnN0IHsgam9iSWQsIGFjdGlvbiB9ID0gYXJncztcbiAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdydW4nOlxuICAgICAgICByZXN1bHQgPSBhd2FpdCBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iQnlQb29sKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIGxldCBkYXRhID0ge1xuICAgICAgam9iSWQsXG4gICAgICBhY3Rpb24sXG4gICAgICByZXN1bHRcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5XHU2NUIwXHU3MjQ4XHU2NzJDXG4gICAqL1xuICBjaGVja0ZvclVwZGF0ZXIoKTogdm9pZCB7IFxuICAgIGF1dG9VcGRhdGVyU2VydmljZS5jaGVja1VwZGF0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFMEJcdThGN0RcdTY1QjBcdTcyNDhcdTY3MkNcbiAgICovXG4gIGRvd25sb2FkQXBwKCk6IHZvaWQge1xuICAgIGF1dG9VcGRhdGVyU2VydmljZS5kb3dubG9hZCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTZENEJcdThCRDVcdTYzQTVcdTUzRTNcbiAgICovIFxuICBoZWxsbyhhcmdzOiB1bmtub3duKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ2hlbGxvICcsIGFyZ3MpO1xuICB9ICAgXG59XG5leHBvcnQgZGVmYXVsdCBGcmFtZXdvcmtDb250cm9sbGVyO1xuIiwgImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQnJvd3NlcldpbmRvdywgQnJvd3NlcldpbmRvd0NvbnN0cnVjdG9yT3B0aW9ucywgTm90aWZpY2F0aW9uLCBOb3RpZmljYXRpb25Db25zdHJ1Y3Rvck9wdGlvbnMsIElwY01haW5FdmVudCwgRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5pbXBvcnQgeyBpc0RldiwgaXNQcm9kLCBnZXRCYXNlRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlL2NvbmZpZyc7XG5pbXBvcnQgeyBpc0ZpbGVQcm90b2NvbCB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBXaW5kb3dcbiAqIEBjbGFzc1xuICovXG5pbnRlcmZhY2UgQ3JlYXRlV2luZG93QXJncyB7XG4gIHR5cGU6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB3aW5kb3dOYW1lOiBzdHJpbmc7XG4gIHdpbmRvd1RpdGxlOiBzdHJpbmc7XG59XG5cbmNsYXNzIFdpbmRvd1NlcnZpY2Uge1xuICBwcml2YXRlIG15Tm90aWZpY2F0aW9uOiBOb3RpZmljYXRpb24gfCBudWxsO1xuICBwcml2YXRlIHdpbmRvd3M6IFJlY29yZDxzdHJpbmcsIEJyb3dzZXJXaW5kb3c+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubXlOb3RpZmljYXRpb24gPSBudWxsO1xuICAgIHRoaXMud2luZG93cyA9IHt9XG4gIH1cblxuICAvKipcbiAgICogXHU3QTk3XHU1M0UzXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAqL1xuICBpbml0KCkge1xuICAgIGNvbnN0IG1haW5XaW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgbWFpbldpbi5zZXRNZW51QmFyVmlzaWJpbGl0eShmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHdpbmRvd1xuICAgKi9cbiAgY3JlYXRlV2luZG93KGFyZ3M6IENyZWF0ZVdpbmRvd0FyZ3MpOiBudW1iZXIge1xuICAgIGNvbnN0IHsgdHlwZSwgY29udGVudCwgd2luZG93TmFtZSwgd2luZG93VGl0bGUgfSA9IGFyZ3M7XG4gICAgbGV0IGNvbnRlbnRVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGlmICh0eXBlID09ICdodG1sJykge1xuICAgICAgY29udGVudFVybCA9IHBhdGguam9pbignZmlsZTovLycsIGdldEJhc2VEaXIoKSwgY29udGVudClcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3dlYicpIHtcbiAgICAgIGNvbnRlbnRVcmwgPSBjb250ZW50O1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAndnVlJykge1xuICAgICAgbGV0IGFkZHIgPSAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJ1xuICAgICAgaWYgKGlzUHJvZCgpKSB7XG4gICAgICAgIGNvbnN0IG1haW5TZXJ2ZXIgPSBnZXRDb25maWcoKS5tYWluU2VydmVyIGFzIENvbmZpZ1snbWFpblNlcnZlciddICYgeyBob3N0Pzogc3RyaW5nOyBwb3J0PzogbnVtYmVyIH07XG4gICAgICAgIGlmIChpc0ZpbGVQcm90b2NvbChtYWluU2VydmVyLnByb3RvY29sKSkge1xuICAgICAgICAgIGFkZHIgPSBtYWluU2VydmVyLnByb3RvY29sICsgcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgbWFpblNlcnZlci5pbmRleFBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZHIgPSBtYWluU2VydmVyLnByb3RvY29sICsgKG1haW5TZXJ2ZXIuaG9zdCA/PyAnJykgKyAobWFpblNlcnZlci5wb3J0ID8gJzonICsgbWFpblNlcnZlci5wb3J0IDogJycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnRVcmwgPSBhZGRyICsgY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc29tZVxuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKCdbY3JlYXRlV2luZG93XSB1cmw6ICcsIGNvbnRlbnRVcmwpO1xuICAgIGNvbnN0IG9wdDogQnJvd3NlcldpbmRvd0NvbnN0cnVjdG9yT3B0aW9ucyA9IHtcbiAgICAgIHRpdGxlOiB3aW5kb3dUaXRsZSxcbiAgICAgIHg6IDEwLFxuICAgICAgeTogMTAsXG4gICAgICB3aWR0aDogOTgwLCBcbiAgICAgIGhlaWdodDogNjUwLFxuICAgICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2UsXG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHdpbiA9IG5ldyBCcm93c2VyV2luZG93KG9wdCk7XG4gICAgY29uc3Qgd2luQ29udGVudHNJZCA9IHdpbi53ZWJDb250ZW50cy5pZDtcbiAgICBpZiAoY29udGVudFVybCkge1xuICAgICAgd2luLmxvYWRVUkwoY29udGVudFVybCk7XG4gICAgfVxuICAgIGlmIChpc0RldigpKSB7XG4gICAgICB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgfVxuXG4gICAgLy8gc3ViIHdpbmRvdyBcbiAgICB3aW4uc2V0TWVudUJhclZpc2liaWxpdHkoZmFsc2UpO1xuXG4gICAgdGhpcy53aW5kb3dzW3dpbmRvd05hbWVdID0gd2luO1xuXG4gICAgcmV0dXJuIHdpbkNvbnRlbnRzSWQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBHZXQgd2luZG93IGNvbnRlbnRzIGlkXG4gICAqL1xuICBnZXRXQ2lkKGFyZ3M6IHsgd2luZG93TmFtZTogc3RyaW5nIH0pOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCB7IHdpbmRvd05hbWUgfSA9IGFyZ3M7XG4gICAgbGV0IHdpbjogQnJvd3NlcldpbmRvdyB8IG51bGw7XG4gICAgaWYgKHdpbmRvd05hbWUgPT0gJ21haW4nKSB7XG4gICAgICB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgICByZXR1cm4gd2luLndlYkNvbnRlbnRzLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW4gPSB0aGlzLndpbmRvd3Nbd2luZG93TmFtZV0gPz8gbnVsbDtcbiAgICAgIGlmICghd2luKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiB3aW4ud2ViQ29udGVudHMuaWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWxpemUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHR3byB3aW5kb3dzIHRocm91Z2ggdGhlIHRyYW5zZmVyIG9mIHRoZSBtYWluIHByb2Nlc3NcbiAgICovXG4gIGNvbW11bmljYXRlKGFyZ3M6IHsgcmVjZWl2ZXI6IHN0cmluZzsgY29udGVudDogdW5rbm93biB9KTogdm9pZCB7XG4gICAgY29uc3QgeyByZWNlaXZlciwgY29udGVudCB9ID0gYXJncztcbiAgICBpZiAocmVjZWl2ZXIgPT0gJ21haW4nKSB7XG4gICAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgICB3aW4ud2ViQ29udGVudHMuc2VuZCgnY29udHJvbGxlci9vcy93aW5kb3cyVG9XaW5kb3cxJywgY29udGVudCk7XG4gICAgfSBlbHNlIGlmIChyZWNlaXZlciA9PSAnd2luZG93MicpIHtcbiAgICAgIGNvbnN0IHdpbiA9IHRoaXMud2luZG93c1tyZWNlaXZlcl07XG4gICAgICB3aW4ud2ViQ29udGVudHMuc2VuZCgnY29udHJvbGxlci9vcy93aW5kb3cxVG9XaW5kb3cyJywgY29udGVudCk7XG4gICAgfVxuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlTm90aWZpY2F0aW9uXG4gICAqL1xuICBjcmVhdGVOb3RpZmljYXRpb24ob3B0aW9uczogTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zICYgeyBjbGlja0V2ZW50PzogYm9vbGVhbjsgY2xvc2VFdmVudD86IGJvb2xlYW4gfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9vcy9zZW5kTm90aWZpY2F0aW9uJztcbiAgICB0aGlzLm15Tm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbihvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zLmNsaWNrRXZlbnQpIHtcbiAgICAgIHRoaXMubXlOb3RpZmljYXRpb24ub24oJ2NsaWNrJywgKF9lOiBFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgIHR5cGU6ICdjbGljaycsXG4gICAgICAgICAgbXNnOiAnXHU2MEE4XHU3MEI5XHU1MUZCXHU0RTg2XHU5MDFBXHU3N0U1XHU2RDg4XHU2MDZGJ1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnJlcGx5KGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNsb3NlRXZlbnQpIHtcbiAgICAgIHRoaXMubXlOb3RpZmljYXRpb24ub24oJ2Nsb3NlJywgKF9lOiBFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgICAgbXNnOiAnXHU2MEE4XHU1MTczXHU5NUVEXHU0RTg2XHU5MDFBXHU3N0U1XHU2RDg4XHU2MDZGJ1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnJlcGx5KGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMubXlOb3RpZmljYXRpb24uc2hvdygpO1xuICB9XG5cbn1cbmV4cG9ydCBjb25zdCB3aW5kb3dTZXJ2aWNlID0gbmV3IFdpbmRvd1NlcnZpY2UoKTsgIFxuIiwgImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIGFwcCBhcyBlbGVjdHJvbkFwcCwgZGlhbG9nLCBzaGVsbCwgTm90aWZpY2F0aW9uLCBJcGNNYWluRXZlbnQsXG4gIE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucyxcbn0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgd2luZG93U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3Mvd2luZG93JztcblxuLyoqXG4gKiBleGFtcGxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgT3NDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIEFsbCBtZXRob2RzIHJlY2VpdmUgdHdvIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIGFyZ3MgUGFyYW1ldGVycyB0cmFuc21pdHRlZCBieSB0aGUgZnJvbnRlbmRcbiAgICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgYXJlIG9ubHkgYXZhaWxhYmxlIGR1cmluZyBJUEMgY29tbXVuaWNhdGlvbi4gRm9yIGRldGFpbHMsIHBsZWFzZSByZWZlciB0byB0aGUgY29udHJvbGxlciBkb2N1bWVudGF0aW9uXG4gICAqL1xuXG4gIC8qKlxuICAgKiBNZXNzYWdlIHByb21wdCBkaWFsb2cgYm94XG4gICAqL1xuICBtZXNzYWdlU2hvdygpOiBzdHJpbmcge1xuICAgIGRpYWxvZy5zaG93TWVzc2FnZUJveFN5bmMoe1xuICAgICAgdHlwZTogJ2luZm8nLCAvLyBcIm5vbmVcIiwgXCJpbmZvXCIsIFwiZXJyb3JcIiwgXCJxdWVzdGlvblwiIFx1NjIxNlx1ODAwNSBcIndhcm5pbmdcIlxuICAgICAgdGl0bGU6ICdDdXN0b20gVGl0bGUnLFxuICAgICAgbWVzc2FnZTogJ0N1c3RvbWl6ZSBtZXNzYWdlIGNvbnRlbnQnLFxuICAgICAgZGV0YWlsOiAnT3RoZXIgYWRkaXRpb25hbCBpbmZvcm1hdGlvbidcbiAgICB9KVxuICBcbiAgICByZXR1cm4gJ09wZW5lZCB0aGUgbWVzc2FnZSBib3gnO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lc3NhZ2UgcHJvbXB0IGFuZCBjb25maXJtYXRpb24gZGlhbG9nIGJveFxuICAgKi9cbiAgbWVzc2FnZVNob3dDb25maXJtKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzID0gZGlhbG9nLnNob3dNZXNzYWdlQm94U3luYyh7XG4gICAgICB0eXBlOiAnaW5mbycsXG4gICAgICB0aXRsZTogJ0N1c3RvbSBUaXRsZScsXG4gICAgICBtZXNzYWdlOiAnQ3VzdG9taXplIG1lc3NhZ2UgY29udGVudCcsXG4gICAgICBkZXRhaWw6ICdPdGhlciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uJyxcbiAgICAgIGNhbmNlbElkOiAxLCAvLyBJbmRleCBvZiBidXR0b25zIHVzZWQgdG8gY2FuY2VsIGRpYWxvZyBib3hlc1xuICAgICAgZGVmYXVsdElkOiAwLCAvLyBTZXQgZGVmYXVsdCBzZWxlY3RlZCBidXR0b25cbiAgICAgIGJ1dHRvbnM6IFsnY29uZmlybScsICdjYW5jZWwnXSwgXG4gICAgfSlcbiAgICBsZXQgZGF0YSA9IChyZXMgPT09IDApID8gJ2NsaWNrIHRoZSBjb25maXJtIGJ1dHRvbicgOiAnY2xpY2sgdGhlIGNhbmNlbCBidXR0b24nO1xuICBcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgRGlyZWN0b3J5XG4gICAqL1xuICBzZWxlY3RGb2xkZXIoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nU3luYyh7XG4gICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknLCAnY3JlYXRlRGlyZWN0b3J5J11cbiAgICB9KTtcblxuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHJldHVybiBmaWxlUGF0aHNbMF07XG4gIH0gXG5cbiAgLyoqXG4gICAqIG9wZW4gZGlyZWN0b3J5XG4gICAqL1xuICBvcGVuRGlyZWN0b3J5KGFyZ3M6IHsgaWQ6IHN0cmluZyB9KTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBkaXIgPSAnJztcbiAgICBpZiAocGF0aC5pc0Fic29sdXRlKGlkKSkge1xuICAgICAgZGlyID0gaWQ7XG4gICAgfSBlbHNlIHtcbiAgICBkaXIgPSBlbGVjdHJvbkFwcC5nZXRQYXRoKGlkIGFzIFBhcmFtZXRlcnM8dHlwZW9mIGVsZWN0cm9uQXBwLmdldFBhdGg+WzBdKTtcbiAgICB9XG5cbiAgICBzaGVsbC5vcGVuUGF0aChkaXIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBQaWN0dXJlXG4gICAqL1xuICBzZWxlY3RQaWMoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nU3luYyh7XG4gICAgICB0aXRsZTogJ3NlbGVjdCBwaWMnLFxuICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZSddLFxuICAgICAgZmlsdGVyczogW1xuICAgICAgICB7IG5hbWU6ICdJbWFnZXMnLCBleHRlbnNpb25zOiBbJ2pwZycsICdwbmcnLCAnZ2lmJ10gfSxcbiAgICAgIF1cbiAgICB9KTtcbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGhzWzBdKTtcbiAgICAgIGNvbnN0IHBpYyA9ICAnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwnICsgZGF0YS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICByZXR1cm4gcGljO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9ICAgXG5cbiAgLyoqXG4gICAqIE9wZW4gYSBuZXcgd2luZG93XG4gICAqL1xuICBjcmVhdGVXaW5kb3coYXJnczogeyB0eXBlOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgd2luZG93TmFtZTogc3RyaW5nOyB3aW5kb3dUaXRsZTogc3RyaW5nIH0pOiBudW1iZXIge1xuICAgIGNvbnN0IHdjaWQgPSB3aW5kb3dTZXJ2aWNlLmNyZWF0ZVdpbmRvdyhhcmdzKTtcbiAgICByZXR1cm4gd2NpZDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCBXaW5kb3cgY29udGVudHMgaWRcbiAgICovXG4gIGdldFdDaWQoYXJnczogeyB3aW5kb3dOYW1lOiBzdHJpbmcgfSk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IHdjaWQgPSB3aW5kb3dTZXJ2aWNlLmdldFdDaWQoYXJncyk7XG4gICAgcmV0dXJuIHdjaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVhbGl6ZSBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHdpbmRvd3MgdGhyb3VnaCB0aGUgdHJhbnNmZXIgb2YgdGhlIG1haW4gcHJvY2Vzc1xuICAgKi9cbiAgd2luZG93MVRvV2luZG93MihhcmdzOiB7IHJlY2VpdmVyOiBzdHJpbmc7IGNvbnRlbnQ6IHVua25vd24gfSwgX2V2ZW50OiBJcGNNYWluRXZlbnQpOiB2b2lkIHtcbiAgICB3aW5kb3dTZXJ2aWNlLmNvbW11bmljYXRlKGFyZ3MpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFsaXplIGNvbW11bmljYXRpb24gYmV0d2VlbiB0d28gd2luZG93cyB0aHJvdWdoIHRoZSB0cmFuc2ZlciBvZiB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICB3aW5kb3cyVG9XaW5kb3cxKGFyZ3M6IHsgcmVjZWl2ZXI6IHN0cmluZzsgY29udGVudDogdW5rbm93biB9LCBfZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIHdpbmRvd1NlcnZpY2UuY29tbXVuaWNhdGUoYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBzeXN0ZW0gbm90aWZpY2F0aW9uc1xuICAgKi9cbiAgc2VuZE5vdGlmaWNhdGlvbihhcmdzOiB7IHRpdGxlPzogc3RyaW5nOyBzdWJ0aXRsZT86IHN0cmluZzsgYm9keT86IHN0cmluZzsgc2lsZW50PzogYm9vbGVhbiB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogYm9vbGVhbiB8IHN0cmluZyB7XG4gICAgY29uc3QgeyB0aXRsZSwgc3VidGl0bGUsIGJvZHksIHNpbGVudH0gPSBhcmdzO1xuXG4gICAgaWYgKCFOb3RpZmljYXRpb24uaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgcmV0dXJuICdcdTVGNTNcdTUyNERcdTdDRkJcdTdFREZcdTRFMERcdTY1MkZcdTYzMDFcdTkwMUFcdTc3RTUnO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucyA9IHt9O1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgb3B0aW9ucy50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgICBpZiAoc3VidGl0bGUpIHtcbiAgICAgIG9wdGlvbnMuc3VidGl0bGUgPSBzdWJ0aXRsZTtcbiAgICB9XG4gICAgaWYgKGJvZHkpIHtcbiAgICAgIG9wdGlvbnMuYm9keSA9IGJvZHk7XG4gICAgfVxuICAgIGlmIChzaWxlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0aW9ucy5zaWxlbnQgPSBzaWxlbnQ7XG4gICAgfVxuICAgIHdpbmRvd1NlcnZpY2UuY3JlYXRlTm90aWZpY2F0aW9uKG9wdGlvbnMsIGV2ZW50KTtcblxuICAgIHJldHVybiB0cnVlXG4gIH0gICBcbn1cbmV4cG9ydCBkZWZhdWx0IE9zQ29udHJvbGxlcjtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBjb250cm9sbGVyIHJlZ2lzdHJ5IC0gZG8gbm90IGVkaXRcbmdsb2JhbC5fX0VFX0NPTlRST0xMRVJfUkVHSVNUUllfXyA9IFtcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2Nyb3NzLnRzXCIsIHByb3BlcnRpZXM6IFtcImNyb3NzXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY3Jvc3MudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2VmZmVjdC50c1wiLCBwcm9wZXJ0aWVzOiBbXCJlZmZlY3RcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9lZmZlY3QudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2V4YW1wbGUudHNcIiwgcHJvcGVydGllczogW1wiZXhhbXBsZVwiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2V4YW1wbGUudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2ZyYW1ld29yay50c1wiLCBwcm9wZXJ0aWVzOiBbXCJmcmFtZXdvcmtcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9mcmFtZXdvcmsudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL29zLnRzXCIsIHByb3BlcnRpZXM6IFtcIm9zXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vb3MudHNcIik7IH0gfVxuXTsiLCAiaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwLCBzY3JlZW4gfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbmNsYXNzIExpZmVjeWNsZSB7XG4gIC8qKlxuICAgKiBjb3JlIGFwcCBoYXZlIGJlZW4gbG9hZGVkXG4gICAqL1xuICBhc3luYyByZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbygnW2xpZmVjeWNsZV0gcmVhZHknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlbGVjdHJvbiBhcHAgcmVhZHlcbiAgICovXG4gIGFzeW5jIGVsZWN0cm9uQXBwUmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIGVsZWN0cm9uLWFwcC1yZWFkeScpO1xuXG4gICAgLy8gV2hlbiBkb3VibGUgY2xpY2tpbmcgdGhlIGljb24sIGRpc3BsYXkgdGhlIG9wZW5lZCB3aW5kb3dcbiAgICBlbGVjdHJvbkFwcC5vbignc2Vjb25kLWluc3RhbmNlJywgKCkgPT4ge1xuICAgICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgICAgaWYgKHdpbi5pc01pbmltaXplZCgpKSB7XG4gICAgICAgIHdpbi5yZXN0b3JlKCk7XG4gICAgICB9XG4gICAgICB3aW4uc2hvdygpO1xuICAgICAgd2luLmZvY3VzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogbWFpbiB3aW5kb3cgaGF2ZSBiZWVuIGxvYWRlZFxuICAgKi9cbiAgYXN5bmMgd2luZG93UmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIHdpbmRvdy1yZWFkeScpO1xuXG4gICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuXG4gICAgLy8gVGhlIHdpbmRvdyBpcyBjZW50ZXJlZCBhbmQgc2NhbGVkIHByb3BvcnRpb25hbGx5XG4gICAgLy8gT2J0YWluIHRoZSBzaXplIGluZm9ybWF0aW9uIG9mIHRoZSBtYWluIHNjcmVlbiwgY2FsY3VsYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSB3aW5kb3cgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSBzY3JlZW4sXG4gICAgLy8gYW5kIGNhbGN1bGF0ZSB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHVwcGVyIGxlZnQgY29ybmVyIHdoZW4gdGhlIHdpbmRvdyBpcyBjZW50ZXJlZFxuICAgIGNvbnN0IG1haW5TY3JlZW4gPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKTtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IG1haW5TY3JlZW4ud29ya0FyZWFTaXplO1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAqIDAuNyk7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgKiAwLjgpO1xuICAgIGNvbnN0IHggPSBNYXRoLmZsb29yKCh3aWR0aCAtIHdpbmRvd1dpZHRoKSAvIDIpO1xuICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKChoZWlnaHQgLSB3aW5kb3dIZWlnaHQpIC8gMik7XG4gICAgd2luLnNldEJvdW5kcyh7IHgsIHksIHdpZHRoOiB3aW5kb3dXaWR0aCwgaGVpZ2h0OiB3aW5kb3dIZWlnaHQgfSlcblxuICAgIC8vIERlbGF5ZWQgbG9hZGluZywgbm8gd2hpdGUgc2NyZWVuXG4gICAgY29uc3QgeyB3aW5kb3dzT3B0aW9uIH0gPSBnZXRDb25maWcoKTtcbiAgICBpZiAod2luZG93c09wdGlvbi5zaG93ID09IGZhbHNlKSB7XG4gICAgICB3aW4ub25jZSgncmVhZHktdG8tc2hvdycsICgpID0+IHtcbiAgICAgICAgd2luLnNob3coKTtcbiAgICAgICAgd2luLmZvY3VzKCk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBiZWZvcmUgYXBwIGNsb3NlXG4gICAqLyAgXG4gIGFzeW5jIGJlZm9yZUNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSBiZWZvcmUtY2xvc2UnKTtcbiAgfVxufVxuZXhwb3J0IHtcbiAgTGlmZWN5Y2xlXG59O1xuIiwgImltcG9ydCB7IFRyYXksIE1lbnUsIGFwcCBhcyBlbGVjdHJvbkFwcCwgQnJvd3NlcldpbmRvdywgTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMsIEV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRCYXNlRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93LCBnZXRDbG9zZUFuZFF1aXQsIHNldENsb3NlQW5kUXVpdCB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuXG4vKipcbiAqIFx1NjI1OFx1NzZEOFxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRyYXlTZXJ2aWNlIHtcbiAgcHJpdmF0ZSB0cmF5OiBUcmF5IHwgbnVsbDtcbiAgcHJpdmF0ZSBjb25maWc6IHsgdGl0bGU6IHN0cmluZzsgaWNvbjogc3RyaW5nIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50cmF5ID0gbnVsbDtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHRpdGxlOiAnZWxlY3Ryb24tZWdnJyxcbiAgICAgIGljb246ICcvcHVibGljL2ltYWdlcy90cmF5LnBuZydcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXHU2MjU4XHU3NkQ4XG4gICAqL1xuICBpbml0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbdHJheV0gbG9hZCcpO1xuXG4gICAgY29uc3QgY2ZnID0gdGhpcy5jb25maWc7XG4gICAgY29uc3QgbWFpbldpbmRvdyA9IGdldE1haW5XaW5kb3coKTtcblxuICAgIC8vIHRyYXkgaWNvblxuICAgIGNvbnN0IGljb25QYXRoID0gcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgY2ZnLmljb24pO1xuXG4gICAgLy8gXHU2MjU4XHU3NkQ4XHU4M0RDXHU1MzU1XHU1MjlGXHU4MEZEXHU1MjE3XHU4ODY4XG4gICAgY29uc3QgdHJheU1lbnVUZW1wbGF0ZTogTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnNbXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdcdTY2M0VcdTc5M0EnLFxuICAgICAgICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1haW5XaW5kb3cuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1x1OTAwMFx1NTFGQScsXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZWxlY3Ryb25BcHAucXVpdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXVxuXG4gICAgLy8gXHU4QkJFXHU3RjZFXHU0RTAwXHU0RTJBXHU2ODA3XHU4QkM2XHVGRjBDXHU3MEI5XHU1MUZCXHU1MTczXHU5NUVEXHVGRjBDXHU2NzAwXHU1QzBGXHU1MzE2XHU1MjMwXHU2MjU4XHU3NkQ4XG4gICAgc2V0Q2xvc2VBbmRRdWl0KGZhbHNlKTtcbiAgICBtYWluV2luZG93Lm9uKCdjbG9zZScsIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgIGlmIChnZXRDbG9zZUFuZFF1aXQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBtYWluV2luZG93LmhpZGUoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTk2OTBcdTg1Q0ZcdTVFOTRcdTc1MjhcdTgzRENcdTUzNTVcdTY4MEZcbiAgICBtYWluV2luZG93LnNldE1lbnVCYXJWaXNpYmlsaXR5KGZhbHNlKTtcblxuICAgIC8vIFx1NUI5RVx1NEY4Qlx1NTMxNlx1NjI1OFx1NzZEOFxuICAgIHRoaXMudHJheSA9IG5ldyBUcmF5KGljb25QYXRoKTtcbiAgICB0aGlzLnRyYXkuc2V0VG9vbFRpcChjZmcudGl0bGUpO1xuICAgIGNvbnN0IGNvbnRleHRNZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZSh0cmF5TWVudVRlbXBsYXRlKTtcbiAgICB0aGlzLnRyYXkuc2V0Q29udGV4dE1lbnUoY29udGV4dE1lbnUpO1xuICAgIC8vIFx1NURFNlx1OTUyRVx1NTM1NVx1NTFGQlx1NzY4NFx1NjVGNlx1NTAxOVx1ODBGRFx1NTkxRlx1NjYzRVx1NzkzQVx1NEUzQlx1N0E5N1x1NTNFM1xuICAgIHRoaXMudHJheS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICBtYWluV2luZG93LnNob3coKVxuICAgIH0pXG4gIH1cbn1cbmV4cG9ydCBjb25zdCB0cmF5U2VydmljZSA9IG5ldyBUcmF5U2VydmljZSgpO1xuIiwgImltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCB9IGZyb20gJ2VsZWN0cm9uJztcblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXG4gICAqL1xuICBpbml0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbc2VjdXJpdHldIGxvYWQnKTtcbiAgICBjb25zdCBydW5XaXRoRGVidWcgPSBwcm9jZXNzLmFyZ3YuZmluZChmdW5jdGlvbihlOiBzdHJpbmcpe1xuICAgICAgbGV0IGlzSGFzRGVidWcgPSBlLmluY2x1ZGVzKFwiLS1pbnNwZWN0XCIpIHx8IGUuaW5jbHVkZXMoXCItLWluc3BlY3QtYnJrXCIpIHx8IGUuaW5jbHVkZXMoXCItLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydFwiKTtcbiAgICAgIHJldHVybiBpc0hhc0RlYnVnO1xuICAgIH0pXG5cbiAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMERcdTUxNDFcdThCQjhcdThGRENcdTdBMEJcdThDMDNcdThCRDVcbiAgICBpZiAocnVuV2l0aERlYnVnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZCcpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignW2Vycm9yXSBSZW1vdGUgZGVidWdnaW5nIGlzIG5vdCBhbGxvd2VkLCAgcnVuV2l0aERlYnVnOicsIHJ1bldpdGhEZWJ1Zyk7XG4gICAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XG4gICAgfVxuICB9XG59XG5leHBvcnQgY29uc3Qgc2VjdXJpdHlTZXJ2aWNlID0gbmV3IFNlY3VyaXR5U2VydmljZSgpO1xuIiwgIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiogcHJlbG9hZFx1NEUzQVx1OTg4NFx1NTJBMFx1OEY3RFx1NkEyMVx1NTc1N1x1RkYwQ1x1OEJFNVx1NjU4N1x1NEVGNlx1NUMwNlx1NEYxQVx1NTcyOFx1N0EwQlx1NUU4Rlx1NTQyRlx1NTJBOFx1NjVGNlx1NTJBMFx1OEY3RCAqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IHRyYXlTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy90cmF5JztcbmltcG9ydCB7IHNlY3VyaXR5U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3Mvc2VjdXJpdHknO1xuLy8gaW1wb3J0IHsgY3Jvc3NTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9jcm9zcyc7XG4vLyBpbXBvcnQgeyBzcWxpdGVkYlNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2RhdGFiYXNlL3NxbGl0ZWRiJztcbmltcG9ydCB7IHdpbmRvd1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL29zL3dpbmRvdyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVsb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAvLyBcdTc5M0FcdTRGOEJcdTUyOUZcdTgwRkRcdTZBMjFcdTU3NTdcdUZGMENcdTUzRUZcdTkwMDlcdTYyRTlcdTYwMjdcdTRGN0ZcdTc1MjhcdTU0OENcdTRGRUVcdTY1MzlcbiAgbG9nZ2VyLmluZm8oJ1twcmVsb2FkXSBsb2FkIDUnKTtcbiAgd2luZG93U2VydmljZS5pbml0KCk7XG4gIHRyYXlTZXJ2aWNlLmluaXQoKTtcbiAgc2VjdXJpdHlTZXJ2aWNlLmluaXQoKTtcbiAgLy8gaW5pdCBzcWxpdGUgZGIgKGxhenkgbG9hZHMgYmV0dGVyLXNxbGl0ZTMgb24gZmlyc3QgdXNlKVxuICAvLyBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuaW5pdCgpO1xuICAvLyBnbyBzZXJ2ZXJcbiAgLy9jcm9zc1NlcnZpY2UuY3JlYXRlR29TZXJ2ZXIoKTtcbn1cblxuXG4iLCAiaW1wb3J0IHsgRWxlY3Ryb25FZ2cgfSBmcm9tICdlZS1jb3JlJztcbmltcG9ydCB7IExpZmVjeWNsZSB9IGZyb20gJy4vcHJlbG9hZC9saWZlY3ljbGUnO1xuaW1wb3J0IHsgcHJlbG9hZCB9IGZyb20gJy4vcHJlbG9hZCc7XG5cbi8vIG5ldyBhcHBcbmNvbnN0IGFwcCA9IG5ldyBFbGVjdHJvbkVnZygpO1xuXG4vLyByZWdpc3RlciBsaWZlY3ljbGVcbmNvbnN0IGxpZmUgPSBuZXcgTGlmZWN5Y2xlKCk7XG5hcHAucmVnaXN0ZXIoXCJyZWFkeVwiLCBsaWZlLnJlYWR5KTtcbmFwcC5yZWdpc3RlcihcImVsZWN0cm9uLWFwcC1yZWFkeVwiLCBsaWZlLmVsZWN0cm9uQXBwUmVhZHkpO1xuYXBwLnJlZ2lzdGVyKFwid2luZG93LXJlYWR5XCIsIGxpZmUud2luZG93UmVhZHkpO1xuYXBwLnJlZ2lzdGVyKFwiYmVmb3JlLWNsb3NlXCIsIGxpZmUuYmVmb3JlQ2xvc2UpO1xuXG4vLyByZWdpc3RlciBwcmVsb2FkXG5hcHAucmVnaXN0ZXIoXCJwcmVsb2FkXCIsIHByZWxvYWQpO1xuXG4vLyBydW5cbmFwcC5ydW4oKTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBidW5kbGUgZW50cnkgLSBkbyBub3QgZWRpdFxucmVxdWlyZSgnYXBwOmNvbmZpZy1yZWdpc3RyeScpO1xucmVxdWlyZSgnYXBwOmNvbnRyb2xsZXItcmVnaXN0cnknKTtcbnJlcXVpcmUoXCIuL21haW4udHNcIik7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFDQSxXQU1PO0FBUFA7QUFBQTtBQUFBLGtCQUFpQjtBQUNqQixnQkFBMkI7QUFNM0IsSUFBTyx5QkFBUSxNQUF1QjtBQUNwQyxhQUFPO0FBQUEsUUFDTCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixlQUFlO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxRQUFRO0FBQUEsVUFDUixVQUFVO0FBQUEsVUFDVixXQUFXO0FBQUEsVUFDWCxnQkFBZ0I7QUFBQTtBQUFBLFlBRWQsa0JBQWtCO0FBQUE7QUFBQSxZQUNsQixpQkFBaUI7QUFBQTtBQUFBLFVBRW5CO0FBQUEsVUFDQSxPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsVUFDTixNQUFNLFlBQUFBLFFBQUssU0FBSyxzQkFBVyxHQUFHLFVBQVUsVUFBVSxhQUFhO0FBQUEsUUFDakU7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLE9BQU87QUFBQTtBQUFBLFVBQ1AsU0FBUztBQUFBO0FBQUEsVUFDVCxZQUFZO0FBQUEsVUFDWixTQUFTO0FBQUEsVUFDVCxRQUFRLENBQUM7QUFBQSxVQUNULGNBQWM7QUFBQSxVQUNkLFdBQVc7QUFBQSxV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TjtBQUFBO0FBQUEscUJBQTRCO0FBQzVCO0FBQ0E7QUFHQSxJQUFNLE1BQU0sSUFBSSwyQkFBWTtBQUc1QixJQUFNLE9BQU8sSUFBSSxVQUFVO0FBQzNCLFFBQUksU0FBUyxTQUFTLEtBQUssS0FBSztBQUNoQyxRQUFJLFNBQVMsc0JBQXNCLEtBQUssZ0JBQWdCO0FBQ3hELFFBQUksU0FBUyxnQkFBZ0IsS0FBSyxXQUFXO0FBQzdDLFFBQUksU0FBUyxnQkFBZ0IsS0FBSyxXQUFXO0FBRzdDLFFBQUksU0FBUyxXQUFXLE9BQU87QUFHL0IsUUFBSSxJQUFJO0FBQUE7QUFBQTs7O0FDakJSO0FBQ0E7QUFDQTsiLAogICJuYW1lcyI6IFsicGF0aCIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X3BhdGgiLCAicGF0aCIsICJheGlvcyIsICJpbml0X2Nyb3NzIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfdXRpbHMiLCAiaW1wb3J0X2xvZyIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BzIiwgImltcG9ydF9sb2ciLCAiaW5pdF9mcmFtZXdvcmsiLCAicGF0aCIsICJmcyIsICJlbGVjdHJvbkFwcCIsICJkYXlqcyIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BzIiwgImltcG9ydF9jb25maWciLCAiaW1wb3J0X3V0aWxzIiwgImltcG9ydF9sb2ciLCAicGF0aCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X2VsZWN0cm9uIiwgInBhdGgiLCAiZWxlY3Ryb25BcHAiLCAiZnMiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9sb2ciLCAiaW1wb3J0X2NvbmZpZyIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X3BzIiwgImltcG9ydF9sb2ciLCAicGF0aCIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9lbGVjdHJvbiIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfbG9nIl0KfQo=
