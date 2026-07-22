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
        openDevTools: true
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
        return serverUrl || "";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIiwgIi4uLy4uL2VsZWN0cm9uL2NvbmZpZy9jb25maWcubG9jYWwudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5wcm9kLnRzIiwgImNvbmZpZy1yZWdpc3RyeTphcHA6Y29uZmlnLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2UvY3Jvc3MudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9jcm9zcy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2VmZmVjdC50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2V4YW1wbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy9hdXRvX3VwZGF0ZXIudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy93aW5kb3cudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9vcy50cyIsICJjb250cm9sbGVyLXJlZ2lzdHJ5OmFwcDpjb250cm9sbGVyLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3ByZWxvYWQvbGlmZWN5Y2xlLnRzIiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2Uvb3MvdHJheS50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL3NlY3VyaXR5LnRzIiwgIi4uLy4uL2VsZWN0cm9uL3ByZWxvYWQvaW5kZXgudHMiLCAiLi4vLi4vZWxlY3Ryb24vbWFpbi50cyIsICJidW5kbGUtZW50cnk6YXBwOmJ1bmRsZS1lbnRyeSJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRCYXNlRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IGZhbHNlLFxuICAgIHNpbmdsZUxvY2s6IHRydWUsXG4gICAgd2luZG93c09wdGlvbjoge1xuICAgICAgdGl0bGU6ICdlbGVjdHJvbi1lZ2cnLFxuICAgICAgd2lkdGg6IDk4MCxcbiAgICAgIGhlaWdodDogODUwLFxuICAgICAgbWluV2lkdGg6IDQwMCxcbiAgICAgIG1pbkhlaWdodDogMzAwLFxuICAgICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgICAgLy93ZWJTZWN1cml0eTogZmFsc2UsXG4gICAgICAgIGNvbnRleHRJc29sYXRpb246IGZhbHNlLCAvLyBmYWxzZSAtPiBcdTUzRUZcdTU3MjhcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcdTRFMkRcdTRGN0ZcdTc1MjhlbGVjdHJvblx1NzY4NGFwaVx1RkYwQ3RydWUtPlx1OTcwMFx1ODk4MWJyaWRnZS5qcyhjb250ZXh0QnJpZGdlKVxuICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgICAgIC8vcHJlbG9hZDogcGF0aC5qb2luKGdldEVsZWN0cm9uRGlyKCksICdwcmVsb2FkJywgJ2JyaWRnZS5qcycpLFxuICAgICAgfSxcbiAgICAgIGZyYW1lOiB0cnVlLFxuICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgIGljb246IHBhdGguam9pbihnZXRCYXNlRGlyKCksICdwdWJsaWMnLCAnaW1hZ2VzJywgJ2xvZ28tMzIucG5nJyksXG4gICAgfSxcbiAgICBsb2dnZXI6IHtcbiAgICAgIGxldmVsOiAnaW5mbycsIC8vICdmYXRhbCcsICdlcnJvcicsICd3YXJuJywgJ2luZm8nLCAnZGVidWcnLCAndHJhY2UnIG9yICdzaWxlbnQnXG4gICAgICByb3RhdG9yOiAnZGFpbHknLCAvLyBkYWlseSwgaG91cmx5XG4gICAgICBkYXRlRm9ybWF0OiAneXl5eS1NTS1kZCcsXG4gICAgICBtYXhTaXplOiAnMTAwbScsXG4gICAgICByZWRhY3Q6IFtdLFxuICAgICAgcmVkYWN0Q2Vuc29yOiAnW1JlZGFjdGVkXScsXG4gICAgICB0aW1lc3RhbXA6IHRydWUsXG4gICAgICBkZXB0aExpbWl0OiA1LFxuICAgICAgdGltZXpvbmU6ICdBc2lhL1NoYW5naGFpJyxcbiAgICAgIG5hbWU6ICdlZScsXG4gICAgICBhcHBMb2dOYW1lOiAnZWUubG9nJyxcbiAgICAgIGNvcmVMb2dOYW1lOiAnZWUtY29yZS5sb2cnLFxuICAgICAgZXJyb3JMb2dOYW1lOiAnZWUtZXJyb3IubG9nJ1xuICAgIH0sXG4gICAgcmVtb3RlOiB7XG4gICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgdXJsOiAnaHR0cDovL2VsZWN0cm9uLWVnZy5rYWthOTk2LmNvbS8nXG4gICAgfSxcbiAgICBzb2NrZXRTZXJ2ZXI6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIHBvcnQ6IDcwNzAsXG4gICAgICBwYXRoOiBcIi9zb2NrZXQuaW8vXCIsXG4gICAgICBjb25uZWN0VGltZW91dDogNDUwMDAsXG4gICAgICBwaW5nVGltZW91dDogMzAwMDAsXG4gICAgICBwaW5nSW50ZXJ2YWw6IDI1MDAwLFxuICAgICAgbWF4SHR0cEJ1ZmZlclNpemU6IDFlOCxcbiAgICAgIHRyYW5zcG9ydHM6IFtcInBvbGxpbmdcIiwgXCJ3ZWJzb2NrZXRcIl0sXG4gICAgICBjb3JzOiB7XG4gICAgICAgIG9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBjaGFubmVsOiAnc29ja2V0LWNoYW5uZWwnXG4gICAgfSxcbiAgICBodHRwU2VydmVyOiB7XG4gICAgICBlbmFibGU6IHRydWUsXG4gICAgICBodHRwczoge1xuICAgICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgICBrZXk6ICcvcHVibGljL3NzbC9sb2NhbGhvc3QrMS5rZXknLFxuICAgICAgICBjZXJ0OiAnL3B1YmxpYy9zc2wvbG9jYWxob3N0KzEucGVtJ1xuICAgICAgfSxcbiAgICAgIHByb3RvY29sOiAnaHR0cDovLycsXG4gICAgICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgICAgIHBvcnQ6IDcwNzEsXG4gICAgICBjb3JzOiB7IG9yaWdpbjogJyonIH0sXG4gICAgICBib2R5OiB7XG4gICAgICAgIG11bHRpcGFydDogZmFsc2UsXG4gICAgICAgIGZvcm1pZGFibGU6IHsga2VlcEV4dGVuc2lvbnM6IGZhbHNlIH1cbiAgICAgIH0sXG4gICAgICBmaWx0ZXJSZXF1ZXN0OiB7XG4gICAgICAgIHVyaXM6IFtdLFxuICAgICAgICByZXR1cm5EYXRhOiAnJ1xuICAgICAgfSxcbiAgICB9LFxuICAgIG1haW5TZXJ2ZXI6IHtcbiAgICAgIHByb3RvY29sOiAnZmlsZTovLycsXG4gICAgICBpbmRleFBhdGg6ICcvcHVibGljL2Rpc3QvaW5kZXguaHRtbCcsXG4gICAgICBjaGFubmVsU2VwYXJhdG9yOiAnLycsXG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBEZXZlbG9wbWVudCBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uLCBjb3ZlcmFnZSBjb25maWcuZGVmYXVsdC5qc1xuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IHtcbiAgICAgIG1vZGU6ICdkZXRhY2gnXG4gICAgfSxcbiAgICBqb2JzOiB7XG4gICAgICBtZXNzYWdlTG9nOiBmYWxzZVxuICAgIH1cbiAgfTtcbn07XG4iLCAiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiAgY292ZXJhZ2UgY29uZmlnLmRlZmF1bHQuanNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCk6IFBhcnRpYWw8Q29uZmlnPiA9PiB7XG4gIHJldHVybiB7XG4gICAgb3BlbkRldlRvb2xzOiB0cnVlLFxuICB9O1xufTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBjb25maWcgcmVnaXN0cnkgLSBkbyBub3QgZWRpdFxuZ2xvYmFsLl9fRUVfQ09ORklHX1JFR0lTVFJZX18gPSBbXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmRlZmF1bHRcIiwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbmZpZy5kZWZhdWx0LnRzXCIpOyB9IH0sXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmxvY2FsXCIsIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jb25maWcubG9jYWwudHNcIik7IH0gfSxcbiAgeyBmaWxlbmFtZTogXCJjb25maWcucHJvZFwiLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY29uZmlnLnByb2QudHNcIik7IH0gfVxuXTsiLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0RXh0cmFSZXNvdXJjZXNEaXIsIGdldExvZ0RpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgY3Jvc3MgfSBmcm9tICdlZS1jb3JlL2Nyb3NzJztcbmltcG9ydCB0eXBlIHsgQ3Jvc3NUYXJnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBjcm9zc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIENyb3NzU2VydmljZSB7XG5cbiAgaW5mbygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBpZHMgPSBjcm9zcy5nZXRQaWRzKCk7XG4gICAgbG9nZ2VyLmluZm8oJ2Nyb3NzIHBpZHM6JywgcGlkcyk7XG5cbiAgICBsZXQgbnVtID0gMTtcbiAgICBwaWRzLmZvckVhY2goKHBpZDogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgZW50aXR5ID0gY3Jvc3MuZ2V0UHJvYyhwaWQpO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gbmFtZToke2VudGl0eS5uYW1lfWApO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gY29uZmlnOmAsIGVudGl0eS5jb25maWcpO1xuICAgICAgbnVtKys7XG4gICAgfSlcblxuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxuXG4gIGdldFVybChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGNyb3NzLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsO1xuICB9XG5cbiAga2lsbFNlcnZlcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0eXBlID09ICdhbGwnKSB7XG4gICAgICBjcm9zcy5raWxsQWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNyb3NzLmtpbGxCeU5hbWUobmFtZSk7XG4gICAgfVxuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlIGdvIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlR29TZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gbWV0aG9kIDE6IFVzZSB0aGUgZGVmYXVsdCBTZXR0aW5nc1xuICAgIC8vY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lKTtcblxuICAgIC8vIG1ldGhvZCAyOiBVc2UgY3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IFwiZ29cIjtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2dvYXBwJyxcbiAgICAgIGNtZDogcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdnb2FwcCcpLFxuICAgICAgZGlyZWN0b3J5OiBnZXRFeHRyYVJlc291cmNlc0RpcigpLFxuICAgICAgYXJnczogWyctLXBvcnQ9NzA3MyddLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciBuYW1lOicsIGVudGl0eS5uYW1lKTtcbiAgICBsb2dnZXIuaW5mbygnW2dvXSBzZXJ2ZXIgY29uZmlnOicsIGVudGl0eS5jb25maWcpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgamF2YSBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNyZWF0ZUphdmFTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcImphdmFcIjtcbiAgICBjb25zdCBqYXJQYXRoID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdqYXZhLWFwcC5qYXInKTtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2phdmFhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS9iaW4vamF2YXcuZXhlJyksXG4gICAgICBkaXJlY3Rvcnk6IGdldEV4dHJhUmVzb3VyY2VzRGlyKCksXG4gICAgICBhcmdzOiBbJy1qYXInLCAnLXNlcnZlcicsICctWG1zNTEyTScsICctWG14NTEyTScsICctWHNzNTEyaycsICctRHNwcmluZy5wcm9maWxlcy5hY3RpdmU9cHJvZCcsIGAtRHNlcnZlci5wb3J0PTE4MDgwYCwgYC1EbG9nZ2luZy5maWxlLnBhdGg9JHtnZXRMb2dEaXIoKX1gLCBgJHtqYXJQYXRofWBdLFxuICAgICAgYXBwRXhpdDogZmFsc2UsXG4gICAgfVxuICAgIGlmIChpcy5tYWNPUygpKSB7XG4gICAgICAvLyBTZXR1cCBKYXZhIHByb2dyYW1cbiAgICAgIG9wdC5jbWQgPSBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS5qcmUvQ29udGVudHMvSG9tZS9iaW4vamF2YScpO1xuICAgIH1cbiAgICBpZiAoaXMubGludXgoKSkge1xuICAgICAgLy8gU2V0dXAgSmF2YSBwcm9ncmFtXG4gICAgfVxuXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgY3Jvc3MuZ2V0VXJsKGVudGl0eS5uYW1lKSk7XG5cbiAgICByZXR1cm47XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBjcmVhdGUgcHl0aG9uIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlUHl0aG9uU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIG1ldGhvZCAxOiBVc2UgdGhlIGRlZmF1bHQgU2V0dGluZ3NcbiAgICAvL2NvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSk7XG5cbiAgICAvLyBtZXRob2QgMjogVXNlIGN1c3RvbSBjb25maWd1cmF0aW9uXG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcInB5dGhvblwiO1xuICAgIGNvbnN0IG9wdDogQ3Jvc3NUYXJnZXRDb25maWcgPSB7XG4gICAgICBuYW1lOiAncHlhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ3B5JywgJ3B5YXBwJyksXG4gICAgICBkaXJlY3Rvcnk6IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCAncHknKSxcbiAgICAgIGFyZ3M6IFsnLS1wb3J0PTcwNzQnXSxcbiAgICAgIHdpbmRvd3NFeHRuYW1lOiB0cnVlLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3RBcGkobmFtZTogc3RyaW5nLCB1cmxQYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3MuZ2V0VXJsKG5hbWUpO1xuICAgIGlmICghc2VydmVyVXJsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBhcGlIZWxsbyA9IHNlcnZlclVybCArIHVybFBhdGg7XG4gICAgY29uc29sZS5sb2coJ1NlcnZlciBVcmw6Jywgc2VydmVyVXJsKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3Moe1xuICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgIHVybDogYXBpSGVsbG8sXG4gICAgICB0aW1lb3V0OiAxMDAwLFxuICAgICAgcGFyYW1zLFxuICAgICAgcHJveHk6IGZhbHNlLFxuICAgIH0pO1xuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IHJlc3BvbnNlO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0gIFxufVxuZXhwb3J0IGNvbnN0IGNyb3NzU2VydmljZSA9IG5ldyBDcm9zc1NlcnZpY2UoKTsgIFxuIiwgImltcG9ydCB7IGNyb3NzU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvY3Jvc3MnO1xuXG4vKipcbiAqIENyb3NzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQ3Jvc3NDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIFZpZXcgcHJvY2VzcyBzZXJ2aWNlIGluZm9ybWF0aW9uXG4gICAqL1xuICBpbmZvKCk6IHN0cmluZyB7XG4gICAgY3Jvc3NTZXJ2aWNlLmluZm8oKTtcbiAgICByZXR1cm4gJ2hlbGxvIGVsZWN0cm9uLWVnZyc7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNlcnZpY2UgdXJsXG4gICAqLyAgXG4gIGFzeW5jIGdldFVybChhcmdzOiB7IG5hbWU6IHN0cmluZyB9KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7IG5hbWUgfSA9IGFyZ3M7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3NTZXJ2aWNlLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIGtpbGwgc2VydmljZVxuICAgKiBCeSBkZWZhdWx0IChtb2RpZmlhYmxlKSwga2lsbGluZyB0aGUgcHJvY2VzcyB3aWxsIGV4aXQgdGhlIGVsZWN0cm9uIGFwcGxpY2F0aW9uLlxuICAgKi8gIFxuICBhc3luYyBraWxsU2VydmVyKGFyZ3M6IHsgdHlwZTogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgdHlwZSwgbmFtZSB9ID0gYXJncztcbiAgICBjcm9zc1NlcnZpY2Uua2lsbFNlcnZlcih0eXBlLCBuYW1lKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIHNlcnZpY2VcbiAgICovICAgXG4gIGFzeW5jIGNyZWF0ZVNlcnZlcihhcmdzOiB7IHByb2dyYW06IHN0cmluZyB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyBwcm9ncmFtIH0gPSBhcmdzO1xuICAgIGlmIChwcm9ncmFtID09ICdnbycpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVHb1NlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAocHJvZ3JhbSA9PSAnamF2YScpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVKYXZhU2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChwcm9ncmFtID09ICdweXRob24nKSB7XG4gICAgICBjcm9zc1NlcnZpY2UuY3JlYXRlUHl0aG9uU2VydmVyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjY2VzcyB0aGUgYXBpIGZvciB0aGUgY3Jvc3Mgc2VydmljZVxuICAgKi9cbiAgYXN5bmMgcmVxdWVzdEFwaShhcmdzOiB7IG5hbWU6IHN0cmluZzsgdXJsUGF0aDogc3RyaW5nOyBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgeyBuYW1lLCB1cmxQYXRoLCBwYXJhbXN9ID0gYXJncztcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgY3Jvc3NTZXJ2aWNlLnJlcXVlc3RBcGkobmFtZSwgdXJsUGF0aCwgcGFyYW1zKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQ3Jvc3NDb250cm9sbGVyO1xuIiwgImltcG9ydCB7IGRpYWxvZyB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuLyoqXG4gKiBlZmZlY3QgLSBkZW1vXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRWZmZWN0Q29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBzZWxlY3QgZmlsZVxuICAgKi9cbiAgc2VsZWN0RmlsZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXVxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVQYXRoc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2dpbiB3aW5kb3dcbiAgICovXG4gIGxvZ2luV2luZG93KGFyZ3M6IHsgd2lkdGg/OiBudW1iZXI7IGhlaWdodD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBhcmdzO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcblxuICAgIGNvbnN0IHNpemUgPSB7XG4gICAgICB3aWR0aDogd2lkdGggfHwgNDAwLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgMzAwXG4gICAgfVxuICAgIHdpbi5zZXRTaXplKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB3aW4uc2V0UmVzaXphYmxlKHRydWUpO1xuICAgIHdpbi5jZW50ZXIoKTtcbiAgICB3aW4uc2hvdygpO1xuICAgIHdpbi5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgd2luZG93XG4gICAqL1xuICByZXN0b3JlV2luZG93KGFyZ3M6IHsgd2lkdGg/OiBudW1iZXI7IGhlaWdodD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBhcmdzO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcblxuICAgIGNvbnN0IHNpemUgPSB7XG4gICAgICB3aWR0aDogd2lkdGggfHwgOTgwLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgNjUwXG4gICAgfVxuICAgIHdpbi5zZXRTaXplKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB3aW4uc2V0UmVzaXphYmxlKHRydWUpO1xuICAgIHdpbi5jZW50ZXIoKTtcbiAgICB3aW4uc2hvdygpO1xuICAgIHdpbi5mb2N1cygpO1xuICB9ICAgXG59XG5leHBvcnQgZGVmYXVsdCBFZmZlY3RDb250cm9sbGVyO1xuIiwgIi8qKlxuICogZXhhbXBsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEV4YW1wbGVDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIHRlc3RcbiAgICovXG4gIGFzeW5jIHRlc3QgKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuICdoZWxsbyBlbGVjdHJvbi1lZ2cnO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBFeGFtcGxlQ29udHJvbGxlcjtcbiIsICJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBDaGlsZEpvYiwgQ2hpbGRQb29sSm9iIH0gZnJvbSAnZWUtY29yZS9qb2JzJztcbmltcG9ydCB0eXBlIHsgSm9iUHJvY2VzcyB9IGZyb20gJ2VlLWNvcmUvam9icy9jaGlsZC9qb2JQcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgSXBjTWFpbkV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuXG4vKipcbiAqIGZyYW1ld29ya1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZyYW1ld29ya1NlcnZpY2Uge1xuICBwcml2YXRlIG15VGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbDtcbiAgcHJpdmF0ZSBteUpvYjogQ2hpbGRKb2I7XG4gIHByaXZhdGUgbXlKb2JQb29sOiBDaGlsZFBvb2xKb2I7XG4gIHByaXZhdGUgdGFza0ZvckpvYjogUmVjb3JkPHN0cmluZywgSm9iUHJvY2Vzcz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gXHU1NzI4XHU2Nzg0XHU5MDIwXHU1MUZEXHU2NTcwXHU0RTJEXHU1MjFEXHU1OUNCXHU1MzE2XHU0RTAwXHU0RTlCXHU1M0Q4XHU5MUNGXG4gICAgdGhpcy5teVRpbWVyID0gbnVsbDtcbiAgICB0aGlzLm15Sm9iID0gbmV3IENoaWxkSm9iKCk7XG4gICAgdGhpcy5teUpvYlBvb2wgPSBuZXcgQ2hpbGRQb29sSm9iKCk7XG4gICAgdGhpcy50YXNrRm9ySm9iID0ge307XG4gIH1cblxuICAvKipcbiAgICogdGVzdFxuICAgKi9cbiAgYXN5bmMgdGVzdChhcmdzOiB1bmtub3duKTogUHJvbWlzZTx7IHN0YXR1czogc3RyaW5nOyBwYXJhbXM6IHVua25vd24gfT4ge1xuICAgIGxldCBvYmogPSB7XG4gICAgICBzdGF0dXM6J29rJyxcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH1cbiAgICBsb2dnZXIuaW5mbygnRnJhbWV3b3JrU2VydmljZSBvYmo6Jywgb2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIGlwY1x1OTAxQVx1NEZFMShcdTUzQ0NcdTU0MTEpXG4gICAqL1xuICBib3RoV2F5TWVzc2FnZSh0eXBlOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IHN0cmluZyB7XG4gICAgLy8gXHU1MjREXHU3QUVGaXBjXHU5ODkxXHU5MDUzIGNoYW5uZWxcbiAgICBjb25zdCBjaGFubmVsID0gJ2NvbnRyb2xsZXIvZnJhbWV3b3JrL2lwY1NlbmRNc2cnO1xuXG4gICAgaWYgKHR5cGUgPT0gJ3N0YXJ0Jykge1xuICAgICAgLy8gXHU2QkNGXHU5Njk0MVx1NzlEMlx1RkYwQ1x1NTQxMVx1NTI0RFx1N0FFRlx1OTg3NVx1OTc2Mlx1NTNEMVx1OTAwMVx1NkQ4OFx1NjA2RlxuICAgICAgLy8gXHU3NTI4XHU1QjlBXHU2NUY2XHU1NjY4XHU2QTIxXHU2MkRGXG4gICAgICB0aGlzLm15VGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbihlLCBjLCBtc2cpIHtcbiAgICAgICAgbGV0IHRpbWVOb3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBsZXQgZGF0YSA9IG1zZyArICc6JyArIHRpbWVOb3c7XG4gICAgICAgIGUucmVwbHkoYCR7Y31gLCBkYXRhKVxuICAgICAgfSwgMTAwMCwgZXZlbnQsIGNoYW5uZWwsIGNvbnRlbnQpXG5cbiAgICAgIHJldHVybiAnXHU1RjAwXHU1OUNCXHU0RTg2J1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnZW5kJykge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLm15VGltZXIhKTtcbiAgICAgIHJldHVybiAnXHU1MDVDXHU2QjYyXHU0RTg2JyAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdvaHRoZXInXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVxuICAgKi8gXG4gIGRvSm9iKGpvYklkOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBldmVudDogSXBjTWFpbkV2ZW50KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGxldCByZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgbGV0IG9uZVRhc2s6IEpvYlByb2Nlc3MgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay90aW1lckpvYlByb2dyZXNzJztcbiAgXG4gICAgaWYgKGFjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgLy8gXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2XG4gICAgICBsZXQgZXZlbnROYW1lID0gJ2pvYi10aW1lci1wcm9ncmVzcy0nICsgam9iSWQ7XG4gICAgICBjb25zdCB0aW1lclRhc2sgPSB0aGlzLm15Sm9iLmV4ZWMoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSk7XG4gICAgICB0aW1lclRhc2suZW1pdHRlci5vbihldmVudE5hbWUsIChkYXRhOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdbbWFpbi1wcm9jZXNzXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcbiAgICAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pXG4gICAgXG4gICAgICAvLyBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcdTUzQ0FcdTc2RDFcdTU0MkNcdThGREJcdTVFQTYgXHU1RjAyXHU2QjY1XG4gICAgICAvLyBteWpvYi5leGVjUHJvbWlzZSgnLi9qb2JzL2V4YW1wbGUvdGltZXInLCB7am9iSWR9KS50aGVuKHRhc2sgPT4ge1xuICAgICAgLy8gICB0YXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gICAgIExvZy5pbmZvKCdbbWFpbi1wcm9jZXNzXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcbiAgICAgIC8vICAgICAvLyBcdTUzRDFcdTkwMDFcdTY1NzBcdTYzNkVcdTUyMzBcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcbiAgICAgIC8vICAgICBldmVudC5zZW5kZXIuc2VuZChgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICAvLyAgIH0pXG4gICAgICAvLyB9KTtcblxuICAgICAgcmVzLnBpZCA9IHRpbWVyVGFzay5waWQ7IFxuICAgICAgdGhpcy50YXNrRm9ySm9iW2pvYklkXSA9IHRpbWVyVGFzaztcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PSAnY2xvc2UnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2sua2lsbCgpO1xuICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCB7am9iSWQsIG51bWJlcjowLCBwaWQ6MH0pO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uID09ICdwYXVzZScpIHtcbiAgICAgIG9uZVRhc2sgPSB0aGlzLnRhc2tGb3JKb2Jbam9iSWRdO1xuICAgICAgb25lVGFzay5jYWxsRnVuYygnLi9qb2JzL2V4YW1wbGUvdGltZXInLCAncGF1c2UnLCBqb2JJZCk7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gPT0gJ3Jlc3VtZScpIHtcbiAgICAgIG9uZVRhc2sgPSB0aGlzLnRhc2tGb3JKb2Jbam9iSWRdO1xuICAgICAgb25lVGFzay5jYWxsRnVuYygnLi9qb2JzL2V4YW1wbGUvdGltZXInLCAncmVzdW1lJywgam9iSWQsIG9uZVRhc2sucGlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFwb29sXG4gICAqLyBcbiAgZG9DcmVhdGVQb29sKG51bTogbnVtYmVyLCBldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay9jcmVhdGVQb29sTm90aWNlJztcbiAgICB0aGlzLm15Sm9iUG9vbC5jcmVhdGUobnVtKS50aGVuKChwaWRzOiBzdHJpbmdbXSkgPT4ge1xuICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBwaWRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTkwMUFcdThGQzdcdThGREJcdTdBMEJcdTZDNjBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovXG4gIGFzeW5jIGRvSm9iQnlQb29sKGpvYklkOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBldmVudDogSXBjTWFpbkV2ZW50KTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgIGxldCByZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay90aW1lckpvYlByb2dyZXNzJztcbiAgICBpZiAoYWN0aW9uID09ICdydW4nKSB7XG4gICAgICAvLyBcdTVGMDJcdTZCNjUtXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2XG4gICAgICBjb25zdCB0YXNrID0gYXdhaXQgdGhpcy5teUpvYlBvb2wucnVuUHJvbWlzZSgnLi9qb2JzL2V4YW1wbGUvdGltZXInLCB7am9iSWR9KTtcblxuICAgICAgLy8gXHU3NkQxXHU1NDJDXHU1NjY4XHU1NDBEXHU3OUYwXHU1NTJGXHU0RTAwXHVGRjBDXHU1NDI2XHU1MjE5XHU0RjFBXHU1MUZBXHU3M0IwXHU5MUNEXHU1OTBEXHU3NkQxXHU1NDJDXHUzMDAyXG4gICAgICAvLyBcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdTY1RjZcdUZGMENcdTk3MDBcdTg5ODFcdTc5RkJcdTk2NjRcdTc2RDFcdTU0MkNcdTU2NjhcdUZGMENcdTk2MzJcdTZCNjJcdTUxODVcdTVCNThcdTZDQzRcdTZGMEZcbiAgICAgIGxldCBldmVudE5hbWUgPSAnam9iLXRpbWVyLXByb2dyZXNzLScgKyBqb2JJZDtcbiAgICAgIHRhc2suZW1pdHRlci5vbihldmVudE5hbWUsIChkYXRhOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdbbWFpbi1wcm9jZXNzXSBbQ2hpbGRQb29sSm9iXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcblxuICAgICAgICAvLyBcdTUzRDFcdTkwMDFcdTY1NzBcdTYzNkVcdTUyMzBcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcbiAgICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjUzNlx1NTIzMFx1NEVGQlx1NTJBMVx1NUI4Q1x1NjIxMFx1NzY4NFx1NkQ4OFx1NjA2Rlx1RkYwQ1x1NzlGQlx1OTY2NFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgICAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgJ2VuZCcgaW4gZGF0YSAmJiAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuZW5kKSB7XG4gICAgICAgICAgdGFzay5lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycyhldmVudE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmVzLnBpZCA9IHRhc2sucGlkO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODNCN1x1NTNENlx1NkI2M1x1NTcyOFx1OEZEMFx1ODg0Q1x1NzY4NCBqb2IgXHU4RkRCXHU3QTBCIFxuICAgKi8gXG4gIG1vbml0b3JKb2IoKTogdm9pZCB7XG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbGV0IGpvYlBpZHMgPSB0aGlzLm15Sm9iLmdldFBpZHMoKTtcbiAgICAgIGxldCBqb2JQb29sUGlkcyA9IHRoaXMubXlKb2JQb29sLmdldFBpZHMoKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBbbWFpbi1wcm9jZXNzXSBbbW9uaXRvckpvYl0gam9iUGlkczogJHtqb2JQaWRzfSwgam9iUG9vbFBpZHM6ICR7am9iUG9vbFBpZHN9YCk7XG4gICAgfSwgNTAwMClcbiAgfVxuXG59XG5leHBvcnQgY29uc3QgZnJhbWV3b3JrU2VydmljZSA9IG5ldyBGcmFtZXdvcmtTZXJ2aWNlKCk7ICBcbiIsICJpbXBvcnQgeyBhcHAgYXMgZWxlY3Ryb25BcHAgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBhdXRvVXBkYXRlciB9IGZyb20gXCJlbGVjdHJvbi11cGRhdGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb2dyZXNzSW5mbyB9IGZyb20gJ2VsZWN0cm9uLXVwZGF0ZXInO1xuaW1wb3J0IHR5cGUgeyBHZW5lcmljU2VydmVyT3B0aW9ucyB9IGZyb20gJ2J1aWxkZXItdXRpbC1ydW50aW1lJztcbmltcG9ydCB7IGlzIH0gZnJvbSAnZWUtY29yZS91dGlscyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93LCBzZXRDbG9zZUFuZFF1aXQgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuLyoqXG4gKiBcdTgxRUFcdTUyQThcdTUzNDdcdTdFQTdcbiAqIEBjbGFzc1xuICovXG5pbnRlcmZhY2UgVXBkYXRlckNvbmZpZyB7XG4gIHdpbmRvd3M6IGJvb2xlYW47XG4gIG1hY09TOiBib29sZWFuO1xuICBsaW51eDogYm9vbGVhbjtcbiAgb3B0aW9uczogR2VuZXJpY1NlcnZlck9wdGlvbnM7XG59XG5cbmNsYXNzIEF1dG9VcGRhdGVyU2VydmljZSB7XG4gIHByaXZhdGUgY29uZmlnOiBVcGRhdGVyQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgd2luZG93czogZmFsc2UsXG4gICAgICBtYWNPUzogZmFsc2UsXG4gICAgICBsaW51eDogZmFsc2UsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIHByb3ZpZGVyOiAnZ2VuZXJpYycgYXMgY29uc3QsXG4gICAgICAgIHVybDogJ2h0dHA6Ly9rb2RvLnFpbml1LmNvbS8nXG4gICAgICB9LFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcbiAgICovXG4gIGluaXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ1thdXRvVXBkYXRlcl0gbG9hZCcpO1xuICAgIGNvbnN0IGNmZyA9IHRoaXMuY29uZmlnO1xuICAgIGlmICgoaXMud2luZG93cygpICYmIGNmZy53aW5kb3dzKSB8fCAoaXMubWFjT1MoKSAmJiBjZmcubWFjT1MpIHx8IChpcy5saW51eCgpICYmIGNmZy5saW51eCkpIHtcbiAgICAgIC8vIGNvbnRpbnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHN0YXR1cyA9IHtcbiAgICAgIGVycm9yOiAtMSxcbiAgICAgIGF2YWlsYWJsZTogMSxcbiAgICAgIG5vQXZhaWxhYmxlOiAyLFxuICAgICAgZG93bmxvYWRpbmc6IDMsXG4gICAgICBkb3dubG9hZGVkOiA0LFxuICAgIH1cblxuICAgIGNvbnN0IHZlcnNpb24gPSBlbGVjdHJvbkFwcC5nZXRWZXJzaW9uKCk7XG4gICAgbG9nZ2VyLmluZm8oJ1thdXRvVXBkYXRlcl0gY3VycmVudCB2ZXJzaW9uOiAnLCB2ZXJzaW9uKTtcbiAgXG4gICAgLy8gXHU4QkJFXHU3RjZFXHU0RTBCXHU4RjdEXHU2NzBEXHU1MkExXHU1NjY4XHU1NzMwXHU1NzQwXG4gICAgbGV0IHNlcnZlciA9IGNmZy5vcHRpb25zLnVybDtcbiAgICBsZXQgbGFzdENoYXIgPSBzZXJ2ZXIuc3Vic3RyaW5nKHNlcnZlci5sZW5ndGggLSAxKTtcbiAgICBzZXJ2ZXIgPSBsYXN0Q2hhciA9PT0gJy8nID8gc2VydmVyIDogc2VydmVyICsgXCIvXCI7XG4gICAgY29uc3QgZmVlZE9wdGlvbnM6IEdlbmVyaWNTZXJ2ZXJPcHRpb25zID0geyAuLi5jZmcub3B0aW9ucywgdXJsOiBzZXJ2ZXIgfTtcblxuICAgIHRyeSB7XG4gICAgICBhdXRvVXBkYXRlci5zZXRGZWVkVVJMKGZlZWRPcHRpb25zKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdbYXV0b1VwZGF0ZXJdIHNldEZlZWRVUkwgZXJyb3IgOiAnLCBlcnJvcik7XG4gICAgfVxuICBcbiAgICBhdXRvVXBkYXRlci5vbignY2hlY2tpbmctZm9yLXVwZGF0ZScsICgpID0+IHtcbiAgICAgIC8vc2VuZFN0YXR1c1RvV2luZG93KCdcdTZCNjNcdTU3MjhcdTY4QzBcdTY3RTVcdTY2RjRcdTY1QjAuLi4nKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCd1cGRhdGUtYXZhaWxhYmxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuYXZhaWxhYmxlLFxuICAgICAgICBkZXNjOiAnXHU2NzA5XHU1M0VGXHU3NTI4XHU2NkY0XHU2NUIwJ1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbigndXBkYXRlLW5vdC1hdmFpbGFibGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5ub0F2YWlsYWJsZSxcbiAgICAgICAgZGVzYzogJ1x1NkNBMVx1NjcwOVx1NTNFRlx1NzUyOFx1NjZGNFx1NjVCMCdcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLmVycm9yLFxuICAgICAgICBkZXNjOiBlcnJcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ2Rvd25sb2FkLXByb2dyZXNzJywgKHByb2dyZXNzT2JqOiBQcm9ncmVzc0luZm8pID0+IHtcbiAgICAgIGNvbnN0IHBlcmNlbnROdW1iZXIgPSBNYXRoLmZsb29yKHByb2dyZXNzT2JqLnBlcmNlbnQpO1xuICAgICAgY29uc3QgdG90YWxTaXplID0gdGhpcy5ieXRlc0NoYW5nZShwcm9ncmVzc09iai50b3RhbCk7XG4gICAgICBjb25zdCB0cmFuc2ZlcnJlZFNpemUgPSB0aGlzLmJ5dGVzQ2hhbmdlKHByb2dyZXNzT2JqLnRyYW5zZmVycmVkKTtcbiAgICAgIGxldCB0ZXh0ID0gJ1x1NURGMlx1NEUwQlx1OEY3RCAnICsgcGVyY2VudE51bWJlciArICclJztcbiAgICAgIHRleHQgPSB0ZXh0ICsgJyAoJyArIHRyYW5zZmVycmVkU2l6ZSArIFwiL1wiICsgdG90YWxTaXplICsgJyknO1xuICBcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLmRvd25sb2FkaW5nLFxuICAgICAgICBkZXNjOiB0ZXh0LFxuICAgICAgICBwZXJjZW50TnVtYmVyLFxuICAgICAgICB0b3RhbFNpemUsXG4gICAgICAgIHRyYW5zZmVycmVkU2l6ZVxuICAgICAgfVxuICAgICAgbG9nZ2VyLmluZm8oJ1thdXRvVXBkYXRlcl0gcHJvZ3Jlc3M6ICcsIHRleHQpO1xuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbigndXBkYXRlLWRvd25sb2FkZWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5kb3dubG9hZGVkLFxuICAgICAgICBkZXNjOiAnXHU0RTBCXHU4RjdEXHU1QjhDXHU2MjEwJ1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG5cbiAgICAgIC8vIFx1NjI1OFx1NzZEOFx1NjNEMlx1NEVGNlx1OTFDQ1x1OTc2Mlx1OEJCRVx1N0Y2RVx1NEU4Nlx1OTYzQlx1NkI2Mlx1N0E5N1x1NTNFM1x1NTE3M1x1OTVFRFx1RkYwQ1x1OEZEOVx1OTFDQ1x1OEJCRVx1N0Y2RVx1NTE0MVx1OEJCOFx1NTE3M1x1OTVFRFx1N0E5N1x1NTNFM1xuICAgICAgc2V0Q2xvc2VBbmRRdWl0KHRydWUpO1xuICAgICAgXG4gICAgICAvLyBJbnN0YWxsIHVwZGF0ZXMgYW5kIGV4aXQgdGhlIGFwcGxpY2F0aW9uXG4gICAgICBhdXRvVXBkYXRlci5xdWl0QW5kSW5zdGFsbCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NjhDMFx1NjdFNVx1NjZGNFx1NjVCMFxuICAgKi9cbiAgY2hlY2tVcGRhdGUgKCk6IHZvaWQge1xuICAgIGF1dG9VcGRhdGVyLmNoZWNrRm9yVXBkYXRlcygpO1xuICB9XG4gIFxuICAvKipcbiAgICogXHU0RTBCXHU4RjdEXHU2NkY0XHU2NUIwXG4gICAqL1xuICBkb3dubG9hZCAoKTogdm9pZCB7XG4gICAgYXV0b1VwZGF0ZXIuZG93bmxvYWRVcGRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTU0MTFcdTUyNERcdTdBRUZcdTUzRDFcdTZEODhcdTYwNkZcbiAgICovXG4gIHNlbmRTdGF0dXNUb1dpbmRvdyhjb250ZW50OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9KTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgICBjb25zdCBjaGFubmVsID0gJ2N1c3RvbS9hcHAvdXBkYXRlcic7XG4gICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKGNoYW5uZWwsIHRleHRKc29uKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFx1NTM1NVx1NEY0RFx1OEY2Q1x1NjM2MlxuICAgKi9cbiAgYnl0ZXNDaGFuZ2UgKGxpbWl0OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGxldCBzaXplID0gXCJcIjtcbiAgICBpZihsaW1pdCA8IDAuMSAqIDEwMjQpeyAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHNpemUgPSBsaW1pdC50b0ZpeGVkKDIpICsgXCJCXCI7XG4gICAgfWVsc2UgaWYobGltaXQgPCAwLjEgKiAxMDI0ICogMTAyNCl7ICAgICAgICAgICAgXG4gICAgICBzaXplID0gKGxpbWl0LzEwMjQpLnRvRml4ZWQoMikgKyBcIktCXCI7XG4gICAgfWVsc2UgaWYobGltaXQgPCAwLjEgKiAxMDI0ICogMTAyNCAqIDEwMjQpeyAgICAgICAgXG4gICAgICBzaXplID0gKGxpbWl0LygxMDI0ICogMTAyNCkpLnRvRml4ZWQoMikgKyBcIk1CXCI7XG4gICAgfWVsc2V7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHNpemUgPSAobGltaXQvKDEwMjQgKiAxMDI0ICogMTAyNCkpLnRvRml4ZWQoMikgKyBcIkdCXCI7XG4gICAgfVxuXG4gICAgbGV0IHNpemVTdHIgPSBzaXplICsgXCJcIjsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBsZXQgaW5kZXggPSBzaXplU3RyLmluZGV4T2YoXCIuXCIpOyAgICAgICAgICAgICAgICAgICAgXG4gICAgbGV0IGRvdSA9IHNpemVTdHIuc3Vic3RyaW5nKGluZGV4ICsgMSAsIGluZGV4ICsgMyk7ICAgICAgICAgICAgXG4gICAgaWYoZG91ID09IFwiMDBcIil7XG4gICAgICAgIHJldHVybiBzaXplU3RyLnN1YnN0cmluZygwLCBpbmRleCkgKyBzaXplU3RyLnN1YnN0cmluZyhpbmRleCArIDMsIGluZGV4ICsgNSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpemU7XG4gIH0gIFxufVxuZXhwb3J0IGNvbnN0IGF1dG9VcGRhdGVyU2VydmljZSA9IG5ldyBBdXRvVXBkYXRlclNlcnZpY2UoKTtcbiIsICJpbXBvcnQgZGF5anMgZnJvbSAnZGF5anMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwLCBzaGVsbCwgSXBjTWFpbkV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgZ2V0RXh0cmFSZXNvdXJjZXNEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2VlLWNvcmUvY29uZmlnJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5pbXBvcnQgeyBmcmFtZXdvcmtTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9mcmFtZXdvcmsnO1xuLy8gaW1wb3J0IHsgc3FsaXRlZGJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYic7XG4vLyBpbXBvcnQgdHlwZSB7IFVzZXJSb3cgfSBmcm9tICcuLi9zZXJ2aWNlL2RhdGFiYXNlL3NxbGl0ZWRiJztcbmltcG9ydCB7IGF1dG9VcGRhdGVyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3MvYXV0b191cGRhdGVyJztcbmltcG9ydCB0eXBlIHsgQ29udGV4dCB9IGZyb20gJ2tvYSc7XG5cbi8qKlxuICogZnJhbWV3b3JrIC0gZGVtb1xuICogQGNsYXNzXG4gKi9cbmludGVyZmFjZSBTcWxpdGVkYk9wZXJhdGlvbkFyZ3Mge1xuICBhY3Rpb246IHN0cmluZztcbiAgaW5mbz86IHsgbmFtZTogc3RyaW5nOyBhZ2U6IG51bWJlciB9O1xuICBkZWxldGVfbmFtZT86IHN0cmluZztcbiAgdXBkYXRlX25hbWU/OiBzdHJpbmc7XG4gIHVwZGF0ZV9hZ2U/OiBudW1iZXI7XG4gIHNlYXJjaF9hZ2U/OiBudW1iZXI7XG4gIGRhdGFfZGlyPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgU3FsaXRlZGJPcGVyYXRpb25SZXN1bHQge1xuICBhY3Rpb246IHN0cmluZztcbiAgLy8gcmVzdWx0OiBib29sZWFuIHwgc3RyaW5nIHwgVXNlclJvd1tdIHwgbnVsbDtcbiAgLy8gYWxsX2xpc3Q6IFVzZXJSb3dbXTtcbiAgY29kZTogbnVtYmVyO1xufVxuXG5jbGFzcyBGcmFtZXdvcmtDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIFx1NjI0MFx1NjcwOVx1NjVCOVx1NkNENVx1NjNBNVx1NjUzNlx1NEUyNFx1NEUyQVx1NTNDMlx1NjU3MFxuICAgKiBAcGFyYW0gYXJncyBcdTUyNERcdTdBRUZcdTRGMjBcdTc2ODRcdTUzQzJcdTY1NzBcbiAgICogQHBhcmFtIGV2ZW50IC0gaXBjXHU5MDFBXHU0RkUxXHU2NUY2XHU2MjREXHU2NzA5XHU1MDNDXHUzMDAyXHU4QkU2XHU2MEM1XHU4OUMxXHVGRjFBXHU2M0E3XHU1MjM2XHU1NjY4XHU2NTg3XHU2ODYzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBzcWxpdGVcdTY1NzBcdTYzNkVcdTVFOTNcdTY0Q0RcdTRGNUNcbiAgICovICAgXG4gIC8vIGFzeW5jIHNxbGl0ZWRiT3BlcmF0aW9uKGFyZ3M6IFNxbGl0ZWRiT3BlcmF0aW9uQXJncyk6IFByb21pc2U8U3FsaXRlZGJPcGVyYXRpb25SZXN1bHQ+IHtcbiAgLy8gICBjb25zdCB7IGFjdGlvbiwgaW5mbywgZGVsZXRlX25hbWUsIHVwZGF0ZV9uYW1lLCB1cGRhdGVfYWdlLCBzZWFyY2hfYWdlLCBkYXRhX2RpciB9ID0gYXJncztcblxuICAvLyAgIGNvbnN0IGRhdGE6IFNxbGl0ZWRiT3BlcmF0aW9uUmVzdWx0ID0ge1xuICAvLyAgICAgYWN0aW9uLFxuICAvLyAgICAgcmVzdWx0OiBudWxsLFxuICAvLyAgICAgYWxsX2xpc3Q6IFtdLFxuICAvLyAgICAgY29kZTogMFxuICAvLyAgIH07XG5cbiAgLy8gICB0cnkge1xuICAvLyAgICAgLy8gdGVzdFxuICAvLyAgICAgc3FsaXRlZGJTZXJ2aWNlLmdldERhdGFEaXIoKTtcbiAgLy8gICB9IGNhdGNoIChlcnIpIHtcbiAgLy8gICAgIGNvbnNvbGUubG9nKGVycik7XG4gIC8vICAgICBkYXRhLmNvZGUgPSAtMTtcbiAgLy8gICAgIHJldHVybiBkYXRhO1xuICAvLyAgIH1cblxuICAvLyAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gIC8vICAgICBjYXNlICdhZGQnIDpcbiAgLy8gICAgICAgaWYgKGluZm8pIHtcbiAgLy8gICAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5hZGRUZXN0RGF0YVNxbGl0ZShpbmZvKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGNhc2UgJ2RlbCcgOlxuICAvLyAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5kZWxUZXN0RGF0YVNxbGl0ZShkZWxldGVfbmFtZSk7O1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGNhc2UgJ3VwZGF0ZScgOlxuICAvLyAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS51cGRhdGVUZXN0RGF0YVNxbGl0ZSh1cGRhdGVfbmFtZSwgdXBkYXRlX2FnZSk7XG4gIC8vICAgICAgIGJyZWFrO1xuICAvLyAgICAgY2FzZSAnZ2V0JyA6XG4gIC8vICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmdldFRlc3REYXRhU3FsaXRlKHNlYXJjaF9hZ2UpO1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGNhc2UgJ2dldERhdGFEaXInIDpcbiAgLy8gICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZ2V0RGF0YURpcigpO1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGNhc2UgJ3NldERhdGFEaXInIDpcbiAgLy8gICAgICAgaWYgKGRhdGFfZGlyKSB7XG4gIC8vICAgICAgICAgYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLnNldEN1c3RvbURhdGFEaXIoZGF0YV9kaXIpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGJyZWFrOyAgICAgICAgICAgIFxuICAvLyAgIH1cblxuICAvLyAgIGRhdGEuYWxsX2xpc3QgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZ2V0QWxsVGVzdERhdGFTcWxpdGUoKTtcblxuICAvLyAgIHJldHVybiBkYXRhO1xuICAvLyB9ICBcblxuICAvKipcbiAgICogXHU4QzAzXHU3NTI4XHU1MTc2XHU1QjgzXHU3QTBCXHU1RThGXHVGRjA4ZXhlXHUzMDAxYmFzaFx1N0I0OVx1NTNFRlx1NjI2N1x1ODg0Q1x1N0EwQlx1NUU4Rlx1RkYwOVxuICAgKiBcbiAgICovXG4gIG9wZW5Tb2Z0d2FyZShhcmdzOiB7IHNvZnROYW1lOiBzdHJpbmcgfSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgc29mdE5hbWUgfSA9IGFyZ3M7XG4gICAgY29uc3Qgc29mdHdhcmVQYXRoID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksIHNvZnROYW1lKTtcbiAgICBsb2dnZXIuaW5mbygnW29wZW5Tb2Z0d2FyZV0gc29mdHdhcmVQYXRoOicsIHNvZnR3YXJlUGF0aCk7XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTdBMEJcdTVFOEZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc29mdHdhcmVQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBcdTU0N0RcdTRFRTRcdTg4NENcdTVCNTdcdTdCMjZcdTRFMzIgXHU1RTc2IFx1NjI2N1x1ODg0Qywgc3RhcnQgXHU1NDdEXHU0RUU0XHU1NDBFXHU5NzYyXHU3Njg0XHU4REVGXHU1Rjg0XHU4OTgxXHU1MkEwXHU1M0NDXHU1RjE1XHU1M0Y3XG4gICAgY29uc3QgY21kU3RyID0gYHN0YXJ0IFwiJHtzb2Z0d2FyZVBhdGh9XCJgO1xuICAgIGV4ZWMoY21kU3RyKTtcblxuICAgIC8vIFx1NjVCOVx1NkNENVx1NEU4Q1xuICAgIC8vIFx1NEY3Rlx1NzUyOGNyb3NzXHU2QTIxXHU1NzU3XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIFx1NjhDMFx1NkQ0Qmh0dHBcdTY3MERcdTUyQTFcdTY2MkZcdTU0MjZcdTVGMDBcdTU0MkZcbiAgICovIFxuICBhc3luYyBjaGVja0h0dHBTZXJ2ZXIoKTogUHJvbWlzZTx7IGVuYWJsZTogYm9vbGVhbjsgc2VydmVyOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IHsgZW5hYmxlLCBwcm90b2NvbCwgaG9zdCwgcG9ydCB9ID0gKGdldENvbmZpZygpIGFzIENvbmZpZykuaHR0cFNlcnZlcjtcbiAgICBjb25zdCB1cmwgPSBwcm90b2NvbCArIGhvc3QgKyAnOicgKyBwb3J0O1xuICAgIGNvbnNvbGUubG9nKCdbY2hlY2tIdHRwU2VydmVyXSB1cmw6JywgdXJsKTtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgZW5hYmxlOiBlbmFibGUsXG4gICAgICBzZXJ2ZXI6IHVybFxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFMDBcdTRFMkEgaHR0cCBcdThCRjdcdTZDNDJcbiAgICogYXJncyBcdTY2MkYgXHU1MjREXHU3QUVGXHU0RjIwXHU3Njg0XHU1M0MyXHU2NTcwXG4gICAqIGN0eCBcdTY2MkYga29hIFx1NzY4NCBjdHggXHU1QkY5XHU4QzYxXG4gICAqL1xuICBhc3luYyBkb0h0dHBSZXF1ZXN0KGFyZ3M6IHsgaWQ6IHN0cmluZyB9LCBjdHg6IENvbnRleHQgJiB7IHJlcXVlc3Q6IHsgYm9keT86IHVua25vd24gfSB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaHR0cEluZm8gPSB7XG4gICAgICBhcmdzLFxuICAgICAgbWV0aG9kOiBjdHgucmVxdWVzdC5tZXRob2QsXG4gICAgICBxdWVyeTogY3R4LnJlcXVlc3QucXVlcnksXG4gICAgICBib2R5OiBjdHgucmVxdWVzdC5ib2R5XG4gICAgfVxuICAgIGxvZ2dlci5pbmZvKCdodHRwSW5mbzonLCBodHRwSW5mbyk7XG5cbiAgICBjb25zdCB7IGlkIH0gPSBhcmdzO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZGlyID0gZWxlY3Ryb25BcHAuZ2V0UGF0aChpZCBhcyBQYXJhbWV0ZXJzPHR5cGVvZiBlbGVjdHJvbkFwcC5nZXRQYXRoPlswXSk7XG4gICAgc2hlbGwub3BlblBhdGgoZGlyKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NEUwMFx1NEUyQXNvY2tldCBpb1x1OEJGN1x1NkM0Mlx1OEJCRlx1OTVFRVx1NkI2NFx1NjVCOVx1NkNENVxuICAgKi9cbiAgYXN5bmMgZG9Tb2NrZXRSZXF1ZXN0KGFyZ3M6IHsgaWQ6IHN0cmluZyB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGRpciA9IGVsZWN0cm9uQXBwLmdldFBhdGgoaWQgYXMgUGFyYW1ldGVyczx0eXBlb2YgZWxlY3Ryb25BcHAuZ2V0UGF0aD5bMF0pO1xuICAgIHNoZWxsLm9wZW5QYXRoKGRpcik7XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBcdTVGMDJcdTZCNjVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcbiAgICovIFxuICBhc3luYyBpcGNJbnZva2VNc2coYXJnczogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgdGltZU5vdyA9IGRheWpzKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG4gICAgY29uc3QgZGF0YSA9IGFyZ3MgKyAnIC0gJyArIHRpbWVOb3c7XG4gICAgXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdTU0MENcdTZCNjVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcbiAgICovIFxuICBhc3luYyBpcGNTZW5kU3luY01zZyhhcmdzOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCB0aW1lTm93ID0gZGF5anMoKS5mb3JtYXQoJ1lZWVktTU0tREQgSEg6bW06c3MnKTtcbiAgICBjb25zdCBkYXRhID0gYXJncyArICcgLSAnICsgdGltZU5vdztcbiAgICBcbiAgICByZXR1cm4gZGF0YTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIFx1NTNDQ1x1NTQxMVx1NUYwMlx1NkI2NVx1OTAxQVx1NEZFMVxuICAgKi9cbiAgaXBjU2VuZE1zZyhhcmdzOiB7IHR5cGU6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgdHlwZSwgY29udGVudCB9ID0gYXJncztcbiAgICBjb25zdCBkYXRhID0gZnJhbWV3b3JrU2VydmljZS5ib3RoV2F5TWVzc2FnZSh0eXBlLCBjb250ZW50LCBldmVudCk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFRkJcdTUyQTFcbiAgICovXG4gIHNvbWVKb2IoYXJnczogeyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZyB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogeyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZzsgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCB9IHtcbiAgICBjb25zdCB7IGpvYklkLCBhY3Rpb259ID0gYXJncztcbiAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICByZXN1bHQgPSBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7ICAgICAgIFxuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwYXVzZSc6XG4gICAgICAgIGZyYW1ld29ya1NlcnZpY2UuZG9Kb2Ioam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhazsgIFxuICAgICAgY2FzZSAncmVzdW1lJzpcbiAgICAgICAgZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrOyAgIFxuICAgICAgZGVmYXVsdDogIFxuICAgIH1cbiAgICBcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIGpvYklkLFxuICAgICAgYWN0aW9uLFxuICAgICAgcmVzdWx0XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIxQlx1NUVGQVx1NEVGQlx1NTJBMVx1NkM2MFxuICAgKi8gXG4gIGFzeW5jIGNyZWF0ZVBvb2woYXJnczogeyBudW1iZXI6IG51bWJlciB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IG51bSA9IGFyZ3MubnVtYmVyO1xuICAgIGZyYW1ld29ya1NlcnZpY2UuZG9DcmVhdGVQb29sKG51bSwgZXZlbnQpO1xuXG4gICAgLy8gdGVzdCBtb25pdG9yXG4gICAgZnJhbWV3b3JrU2VydmljZS5tb25pdG9ySm9iKCk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogXHU5MDFBXHU4RkM3XHU4RkRCXHU3QTBCXHU2QzYwXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXG4gICAqL1xuICBhc3luYyBzb21lSm9iQnlQb29sKGFyZ3M6IHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmcgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IFByb21pc2U8eyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZzsgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9PiB7XG4gICAgY29uc3QgeyBqb2JJZCwgYWN0aW9uIH0gPSBhcmdzO1xuICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ3J1bic6XG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IGZyYW1ld29ya1NlcnZpY2UuZG9Kb2JCeVBvb2woam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICBqb2JJZCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDlcdTY1QjBcdTcyNDhcdTY3MkNcbiAgICovXG4gIGNoZWNrRm9yVXBkYXRlcigpOiB2b2lkIHsgXG4gICAgYXV0b1VwZGF0ZXJTZXJ2aWNlLmNoZWNrVXBkYXRlKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NEUwQlx1OEY3RFx1NjVCMFx1NzI0OFx1NjcyQ1xuICAgKi9cbiAgZG93bmxvYWRBcHAoKTogdm9pZCB7XG4gICAgYXV0b1VwZGF0ZXJTZXJ2aWNlLmRvd25sb2FkKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NkQ0Qlx1OEJENVx1NjNBNVx1NTNFM1xuICAgKi8gXG4gIGhlbGxvKGFyZ3M6IHVua25vd24pOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnaGVsbG8gJywgYXJncyk7XG4gIH0gICBcbn1cbmV4cG9ydCBkZWZhdWx0IEZyYW1ld29ya0NvbnRyb2xsZXI7XG4iLCAiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBCcm93c2VyV2luZG93LCBCcm93c2VyV2luZG93Q29uc3RydWN0b3JPcHRpb25zLCBOb3RpZmljYXRpb24sIE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucywgSXBjTWFpbkV2ZW50LCBFdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcbmltcG9ydCB7IGlzRGV2LCBpc1Byb2QsIGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2VlLWNvcmUvY29uZmlnJztcbmltcG9ydCB7IGlzRmlsZVByb3RvY29sIH0gZnJvbSAnZWUtY29yZS91dGlscyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIFdpbmRvd1xuICogQGNsYXNzXG4gKi9cbmludGVyZmFjZSBDcmVhdGVXaW5kb3dBcmdzIHtcbiAgdHlwZTogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHdpbmRvd05hbWU6IHN0cmluZztcbiAgd2luZG93VGl0bGU6IHN0cmluZztcbn1cblxuY2xhc3MgV2luZG93U2VydmljZSB7XG4gIHByaXZhdGUgbXlOb3RpZmljYXRpb246IE5vdGlmaWNhdGlvbiB8IG51bGw7XG4gIHByaXZhdGUgd2luZG93czogUmVjb3JkPHN0cmluZywgQnJvd3NlcldpbmRvdz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5teU5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgdGhpcy53aW5kb3dzID0ge31cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTdBOTdcdTUzRTNcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICovXG4gIGluaXQoKSB7XG4gICAgY29uc3QgbWFpbldpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICBtYWluV2luLnNldE1lbnVCYXJWaXNpYmlsaXR5KGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgd2luZG93XG4gICAqL1xuICBjcmVhdGVXaW5kb3coYXJnczogQ3JlYXRlV2luZG93QXJncyk6IG51bWJlciB7XG4gICAgY29uc3QgeyB0eXBlLCBjb250ZW50LCB3aW5kb3dOYW1lLCB3aW5kb3dUaXRsZSB9ID0gYXJncztcbiAgICBsZXQgY29udGVudFVybDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKHR5cGUgPT0gJ2h0bWwnKSB7XG4gICAgICBjb250ZW50VXJsID0gcGF0aC5qb2luKCdmaWxlOi8vJywgZ2V0QmFzZURpcigpLCBjb250ZW50KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnd2ViJykge1xuICAgICAgY29udGVudFVybCA9IGNvbnRlbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlID09ICd2dWUnKSB7XG4gICAgICBsZXQgYWRkciA9ICdodHRwOi8vbG9jYWxob3N0OjgwODAnXG4gICAgICBpZiAoaXNQcm9kKCkpIHtcbiAgICAgICAgY29uc3QgbWFpblNlcnZlciA9IGdldENvbmZpZygpLm1haW5TZXJ2ZXIgYXMgQ29uZmlnWydtYWluU2VydmVyJ10gJiB7IGhvc3Q/OiBzdHJpbmc7IHBvcnQ/OiBudW1iZXIgfTtcbiAgICAgICAgaWYgKGlzRmlsZVByb3RvY29sKG1haW5TZXJ2ZXIucHJvdG9jb2wpKSB7XG4gICAgICAgICAgYWRkciA9IG1haW5TZXJ2ZXIucHJvdG9jb2wgKyBwYXRoLmpvaW4oZ2V0QmFzZURpcigpLCBtYWluU2VydmVyLmluZGV4UGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkciA9IG1haW5TZXJ2ZXIucHJvdG9jb2wgKyAobWFpblNlcnZlci5ob3N0ID8/ICcnKSArIChtYWluU2VydmVyLnBvcnQgPyAnOicgKyBtYWluU2VydmVyLnBvcnQgOiAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29udGVudFVybCA9IGFkZHIgKyBjb250ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzb21lXG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oJ1tjcmVhdGVXaW5kb3ddIHVybDogJywgY29udGVudFVybCk7XG4gICAgY29uc3Qgb3B0OiBCcm93c2VyV2luZG93Q29uc3RydWN0b3JPcHRpb25zID0ge1xuICAgICAgdGl0bGU6IHdpbmRvd1RpdGxlLFxuICAgICAgeDogMTAsXG4gICAgICB5OiAxMCxcbiAgICAgIHdpZHRoOiA5ODAsIFxuICAgICAgaGVpZ2h0OiA2NTAsXG4gICAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgICBjb250ZXh0SXNvbGF0aW9uOiBmYWxzZSxcbiAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3Qgd2luID0gbmV3IEJyb3dzZXJXaW5kb3cob3B0KTtcbiAgICBjb25zdCB3aW5Db250ZW50c0lkID0gd2luLndlYkNvbnRlbnRzLmlkO1xuICAgIGlmIChjb250ZW50VXJsKSB7XG4gICAgICB3aW4ubG9hZFVSTChjb250ZW50VXJsKTtcbiAgICB9XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKTtcbiAgICB9XG5cbiAgICAvLyBzdWIgd2luZG93IFxuICAgIHdpbi5zZXRNZW51QmFyVmlzaWJpbGl0eShmYWxzZSk7XG5cbiAgICB0aGlzLndpbmRvd3Nbd2luZG93TmFtZV0gPSB3aW47XG5cbiAgICByZXR1cm4gd2luQ29udGVudHNJZDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCB3aW5kb3cgY29udGVudHMgaWRcbiAgICovXG4gIGdldFdDaWQoYXJnczogeyB3aW5kb3dOYW1lOiBzdHJpbmcgfSk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IHsgd2luZG93TmFtZSB9ID0gYXJncztcbiAgICBsZXQgd2luOiBCcm93c2VyV2luZG93IHwgbnVsbDtcbiAgICBpZiAod2luZG93TmFtZSA9PSAnbWFpbicpIHtcbiAgICAgIHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICAgIHJldHVybiB3aW4ud2ViQ29udGVudHMuaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbiA9IHRoaXMud2luZG93c1t3aW5kb3dOYW1lXSA/PyBudWxsO1xuICAgICAgaWYgKCF3aW4pIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIHdpbi53ZWJDb250ZW50cy5pZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhbGl6ZSBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHdpbmRvd3MgdGhyb3VnaCB0aGUgdHJhbnNmZXIgb2YgdGhlIG1haW4gcHJvY2Vzc1xuICAgKi9cbiAgY29tbXVuaWNhdGUoYXJnczogeyByZWNlaXZlcjogc3RyaW5nOyBjb250ZW50OiB1bmtub3duIH0pOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlY2VpdmVyLCBjb250ZW50IH0gPSBhcmdzO1xuICAgIGlmIChyZWNlaXZlciA9PSAnbWFpbicpIHtcbiAgICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKCdjb250cm9sbGVyL29zL3dpbmRvdzJUb1dpbmRvdzEnLCBjb250ZW50KTtcbiAgICB9IGVsc2UgaWYgKHJlY2VpdmVyID09ICd3aW5kb3cyJykge1xuICAgICAgY29uc3Qgd2luID0gdGhpcy53aW5kb3dzW3JlY2VpdmVyXTtcbiAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKCdjb250cm9sbGVyL29zL3dpbmRvdzFUb1dpbmRvdzInLCBjb250ZW50KTtcbiAgICB9XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBjcmVhdGVOb3RpZmljYXRpb25cbiAgICovXG4gIGNyZWF0ZU5vdGlmaWNhdGlvbihvcHRpb25zOiBOb3RpZmljYXRpb25Db25zdHJ1Y3Rvck9wdGlvbnMgJiB7IGNsaWNrRXZlbnQ/OiBib29sZWFuOyBjbG9zZUV2ZW50PzogYm9vbGVhbiB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL29zL3NlbmROb3RpZmljYXRpb24nO1xuICAgIHRoaXMubXlOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xpY2tFdmVudCkge1xuICAgICAgdGhpcy5teU5vdGlmaWNhdGlvbi5vbignY2xpY2snLCAoX2U6IEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgdHlwZTogJ2NsaWNrJyxcbiAgICAgICAgICBtc2c6ICdcdTYwQThcdTcwQjlcdTUxRkJcdTRFODZcdTkwMUFcdTc3RTVcdTZEODhcdTYwNkYnXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2VFdmVudCkge1xuICAgICAgdGhpcy5teU5vdGlmaWNhdGlvbi5vbignY2xvc2UnLCAoX2U6IEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICBtc2c6ICdcdTYwQThcdTUxNzNcdTk1RURcdTRFODZcdTkwMUFcdTc3RTVcdTZEODhcdTYwNkYnXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5teU5vdGlmaWNhdGlvbi5zaG93KCk7XG4gIH1cblxufVxuZXhwb3J0IGNvbnN0IHdpbmRvd1NlcnZpY2UgPSBuZXcgV2luZG93U2VydmljZSgpOyAgXG4iLCAiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtcbiAgYXBwIGFzIGVsZWN0cm9uQXBwLCBkaWFsb2csIHNoZWxsLCBOb3RpZmljYXRpb24sIElwY01haW5FdmVudCxcbiAgTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zLFxufSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyB3aW5kb3dTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy93aW5kb3cnO1xuXG4vKipcbiAqIGV4YW1wbGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBPc0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogQWxsIG1ldGhvZHMgcmVjZWl2ZSB0d28gcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0gYXJncyBQYXJhbWV0ZXJzIHRyYW5zbWl0dGVkIGJ5IHRoZSBmcm9udGVuZFxuICAgKiBAcGFyYW0gZXZlbnQgLSBFdmVudCBhcmUgb25seSBhdmFpbGFibGUgZHVyaW5nIElQQyBjb21tdW5pY2F0aW9uLiBGb3IgZGV0YWlscywgcGxlYXNlIHJlZmVyIHRvIHRoZSBjb250cm9sbGVyIGRvY3VtZW50YXRpb25cbiAgICovXG5cbiAgLyoqXG4gICAqIE1lc3NhZ2UgcHJvbXB0IGRpYWxvZyBib3hcbiAgICovXG4gIG1lc3NhZ2VTaG93KCk6IHN0cmluZyB7XG4gICAgZGlhbG9nLnNob3dNZXNzYWdlQm94U3luYyh7XG4gICAgICB0eXBlOiAnaW5mbycsIC8vIFwibm9uZVwiLCBcImluZm9cIiwgXCJlcnJvclwiLCBcInF1ZXN0aW9uXCIgXHU2MjE2XHU4MDA1IFwid2FybmluZ1wiXG4gICAgICB0aXRsZTogJ0N1c3RvbSBUaXRsZScsXG4gICAgICBtZXNzYWdlOiAnQ3VzdG9taXplIG1lc3NhZ2UgY29udGVudCcsXG4gICAgICBkZXRhaWw6ICdPdGhlciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uJ1xuICAgIH0pXG4gIFxuICAgIHJldHVybiAnT3BlbmVkIHRoZSBtZXNzYWdlIGJveCc7XG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnZSBwcm9tcHQgYW5kIGNvbmZpcm1hdGlvbiBkaWFsb2cgYm94XG4gICAqL1xuICBtZXNzYWdlU2hvd0NvbmZpcm0oKTogc3RyaW5nIHtcbiAgICBjb25zdCByZXMgPSBkaWFsb2cuc2hvd01lc3NhZ2VCb3hTeW5jKHtcbiAgICAgIHR5cGU6ICdpbmZvJyxcbiAgICAgIHRpdGxlOiAnQ3VzdG9tIFRpdGxlJyxcbiAgICAgIG1lc3NhZ2U6ICdDdXN0b21pemUgbWVzc2FnZSBjb250ZW50JyxcbiAgICAgIGRldGFpbDogJ090aGVyIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24nLFxuICAgICAgY2FuY2VsSWQ6IDEsIC8vIEluZGV4IG9mIGJ1dHRvbnMgdXNlZCB0byBjYW5jZWwgZGlhbG9nIGJveGVzXG4gICAgICBkZWZhdWx0SWQ6IDAsIC8vIFNldCBkZWZhdWx0IHNlbGVjdGVkIGJ1dHRvblxuICAgICAgYnV0dG9uczogWydjb25maXJtJywgJ2NhbmNlbCddLCBcbiAgICB9KVxuICAgIGxldCBkYXRhID0gKHJlcyA9PT0gMCkgPyAnY2xpY2sgdGhlIGNvbmZpcm0gYnV0dG9uJyA6ICdjbGljayB0aGUgY2FuY2VsIGJ1dHRvbic7XG4gIFxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBEaXJlY3RvcnlcbiAgICovXG4gIHNlbGVjdEZvbGRlcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeScsICdjcmVhdGVEaXJlY3RvcnknXVxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVQYXRoc1swXTtcbiAgfSBcblxuICAvKipcbiAgICogb3BlbiBkaXJlY3RvcnlcbiAgICovXG4gIG9wZW5EaXJlY3RvcnkoYXJnczogeyBpZDogc3RyaW5nIH0pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGlkIH0gPSBhcmdzO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGRpciA9ICcnO1xuICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoaWQpKSB7XG4gICAgICBkaXIgPSBpZDtcbiAgICB9IGVsc2Uge1xuICAgIGRpciA9IGVsZWN0cm9uQXBwLmdldFBhdGgoaWQgYXMgUGFyYW1ldGVyczx0eXBlb2YgZWxlY3Ryb25BcHAuZ2V0UGF0aD5bMF0pO1xuICAgIH1cblxuICAgIHNoZWxsLm9wZW5QYXRoKGRpcik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IFBpY3R1cmVcbiAgICovXG4gIHNlbGVjdFBpYygpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHRpdGxlOiAnc2VsZWN0IHBpYycsXG4gICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJ10sXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ0ltYWdlcycsIGV4dGVuc2lvbnM6IFsnanBnJywgJ3BuZycsICdnaWYnXSB9LFxuICAgICAgXVxuICAgIH0pO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aHNbMF0pO1xuICAgICAgY29uc3QgcGljID0gICdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcgKyBkYXRhLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgIHJldHVybiBwaWM7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0gICBcblxuICAvKipcbiAgICogT3BlbiBhIG5ldyB3aW5kb3dcbiAgICovXG4gIGNyZWF0ZVdpbmRvdyhhcmdzOiB7IHR5cGU6IHN0cmluZzsgY29udGVudDogc3RyaW5nOyB3aW5kb3dOYW1lOiBzdHJpbmc7IHdpbmRvd1RpdGxlOiBzdHJpbmcgfSk6IG51bWJlciB7XG4gICAgY29uc3Qgd2NpZCA9IHdpbmRvd1NlcnZpY2UuY3JlYXRlV2luZG93KGFyZ3MpO1xuICAgIHJldHVybiB3Y2lkO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IFdpbmRvdyBjb250ZW50cyBpZFxuICAgKi9cbiAgZ2V0V0NpZChhcmdzOiB7IHdpbmRvd05hbWU6IHN0cmluZyB9KTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3Qgd2NpZCA9IHdpbmRvd1NlcnZpY2UuZ2V0V0NpZChhcmdzKTtcbiAgICByZXR1cm4gd2NpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFsaXplIGNvbW11bmljYXRpb24gYmV0d2VlbiB0d28gd2luZG93cyB0aHJvdWdoIHRoZSB0cmFuc2ZlciBvZiB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICB3aW5kb3cxVG9XaW5kb3cyKGFyZ3M6IHsgcmVjZWl2ZXI6IHN0cmluZzsgY29udGVudDogdW5rbm93biB9LCBfZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIHdpbmRvd1NlcnZpY2UuY29tbXVuaWNhdGUoYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWxpemUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHR3byB3aW5kb3dzIHRocm91Z2ggdGhlIHRyYW5zZmVyIG9mIHRoZSBtYWluIHByb2Nlc3NcbiAgICovXG4gIHdpbmRvdzJUb1dpbmRvdzEoYXJnczogeyByZWNlaXZlcjogc3RyaW5nOyBjb250ZW50OiB1bmtub3duIH0sIF9ldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgd2luZG93U2VydmljZS5jb21tdW5pY2F0ZShhcmdzKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHN5c3RlbSBub3RpZmljYXRpb25zXG4gICAqL1xuICBzZW5kTm90aWZpY2F0aW9uKGFyZ3M6IHsgdGl0bGU/OiBzdHJpbmc7IHN1YnRpdGxlPzogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBzaWxlbnQ/OiBib29sZWFuIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBib29sZWFuIHwgc3RyaW5nIHtcbiAgICBjb25zdCB7IHRpdGxlLCBzdWJ0aXRsZSwgYm9keSwgc2lsZW50fSA9IGFyZ3M7XG5cbiAgICBpZiAoIU5vdGlmaWNhdGlvbi5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICByZXR1cm4gJ1x1NUY1M1x1NTI0RFx1N0NGQlx1N0VERlx1NEUwRFx1NjUyRlx1NjMwMVx1OTAxQVx1NzdFNSc7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9uczogTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zID0ge307XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvcHRpb25zLnRpdGxlID0gdGl0bGU7XG4gICAgfVxuICAgIGlmIChzdWJ0aXRsZSkge1xuICAgICAgb3B0aW9ucy5zdWJ0aXRsZSA9IHN1YnRpdGxlO1xuICAgIH1cbiAgICBpZiAoYm9keSkge1xuICAgICAgb3B0aW9ucy5ib2R5ID0gYm9keTtcbiAgICB9XG4gICAgaWYgKHNpbGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLnNpbGVudCA9IHNpbGVudDtcbiAgICB9XG4gICAgd2luZG93U2VydmljZS5jcmVhdGVOb3RpZmljYXRpb24ob3B0aW9ucywgZXZlbnQpO1xuXG4gICAgcmV0dXJuIHRydWVcbiAgfSAgIFxufVxuZXhwb3J0IGRlZmF1bHQgT3NDb250cm9sbGVyO1xuIiwgIi8vIEF1dG8tZ2VuZXJhdGVkIGNvbnRyb2xsZXIgcmVnaXN0cnkgLSBkbyBub3QgZWRpdFxuZ2xvYmFsLl9fRUVfQ09OVFJPTExFUl9SRUdJU1RSWV9fID0gW1xuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvY3Jvc3MudHNcIiwgcHJvcGVydGllczogW1wiY3Jvc3NcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jcm9zcy50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvZWZmZWN0LnRzXCIsIHByb3BlcnRpZXM6IFtcImVmZmVjdFwiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2VmZmVjdC50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvZXhhbXBsZS50c1wiLCBwcm9wZXJ0aWVzOiBbXCJleGFtcGxlXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vZXhhbXBsZS50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvZnJhbWV3b3JrLnRzXCIsIHByb3BlcnRpZXM6IFtcImZyYW1ld29ya1wiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2ZyYW1ld29yay50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvb3MudHNcIiwgcHJvcGVydGllczogW1wib3NcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9vcy50c1wiKTsgfSB9XG5dOyIsICJpbXBvcnQgeyBhcHAgYXMgZWxlY3Ryb25BcHAsIHNjcmVlbiB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2VlLWNvcmUvY29uZmlnJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuY2xhc3MgTGlmZWN5Y2xlIHtcbiAgLyoqXG4gICAqIGNvcmUgYXBwIGhhdmUgYmVlbiBsb2FkZWRcbiAgICovXG4gIGFzeW5jIHJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSByZWFkeScpO1xuICB9XG5cbiAgLyoqXG4gICAqIGVsZWN0cm9uIGFwcCByZWFkeVxuICAgKi9cbiAgYXN5bmMgZWxlY3Ryb25BcHBSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbygnW2xpZmVjeWNsZV0gZWxlY3Ryb24tYXBwLXJlYWR5Jyk7XG5cbiAgICAvLyBXaGVuIGRvdWJsZSBjbGlja2luZyB0aGUgaWNvbiwgZGlzcGxheSB0aGUgb3BlbmVkIHdpbmRvd1xuICAgIGVsZWN0cm9uQXBwLm9uKCdzZWNvbmQtaW5zdGFuY2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgICBpZiAod2luLmlzTWluaW1pemVkKCkpIHtcbiAgICAgICAgd2luLnJlc3RvcmUoKTtcbiAgICAgIH1cbiAgICAgIHdpbi5zaG93KCk7XG4gICAgICB3aW4uZm9jdXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBtYWluIHdpbmRvdyBoYXZlIGJlZW4gbG9hZGVkXG4gICAqL1xuICBhc3luYyB3aW5kb3dSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbygnW2xpZmVjeWNsZV0gd2luZG93LXJlYWR5Jyk7XG5cbiAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG5cbiAgICAvLyBUaGUgd2luZG93IGlzIGNlbnRlcmVkIGFuZCBzY2FsZWQgcHJvcG9ydGlvbmFsbHlcbiAgICAvLyBPYnRhaW4gdGhlIHNpemUgaW5mb3JtYXRpb24gb2YgdGhlIG1haW4gc2NyZWVuLCBjYWxjdWxhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHdpbmRvdyBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHNjcmVlbixcbiAgICAvLyBhbmQgY2FsY3VsYXRlIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgdXBwZXIgbGVmdCBjb3JuZXIgd2hlbiB0aGUgd2luZG93IGlzIGNlbnRlcmVkXG4gICAgY29uc3QgbWFpblNjcmVlbiA9IHNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpO1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gbWFpblNjcmVlbi53b3JrQXJlYVNpemU7XG4gICAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLmZsb29yKHdpZHRoICogMC43KTtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIDAuOCk7XG4gICAgY29uc3QgeCA9IE1hdGguZmxvb3IoKHdpZHRoIC0gd2luZG93V2lkdGgpIC8gMik7XG4gICAgY29uc3QgeSA9IE1hdGguZmxvb3IoKGhlaWdodCAtIHdpbmRvd0hlaWdodCkgLyAyKTtcbiAgICB3aW4uc2V0Qm91bmRzKHsgeCwgeSwgd2lkdGg6IHdpbmRvd1dpZHRoLCBoZWlnaHQ6IHdpbmRvd0hlaWdodCB9KVxuXG4gICAgLy8gRGVsYXllZCBsb2FkaW5nLCBubyB3aGl0ZSBzY3JlZW5cbiAgICBjb25zdCB7IHdpbmRvd3NPcHRpb24gfSA9IGdldENvbmZpZygpO1xuICAgIGlmICh3aW5kb3dzT3B0aW9uLnNob3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbi5vbmNlKCdyZWFkeS10by1zaG93JywgKCkgPT4ge1xuICAgICAgICB3aW4uc2hvdygpO1xuICAgICAgICB3aW4uZm9jdXMoKTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGJlZm9yZSBhcHAgY2xvc2VcbiAgICovICBcbiAgYXN5bmMgYmVmb3JlQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIGJlZm9yZS1jbG9zZScpO1xuICB9XG59XG5leHBvcnQge1xuICBMaWZlY3ljbGVcbn07XG4iLCAiaW1wb3J0IHsgVHJheSwgTWVudSwgYXBwIGFzIGVsZWN0cm9uQXBwLCBCcm93c2VyV2luZG93LCBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9ucywgRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3csIGdldENsb3NlQW5kUXVpdCwgc2V0Q2xvc2VBbmRRdWl0IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbi8qKlxuICogXHU2MjU4XHU3NkQ4XG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVHJheVNlcnZpY2Uge1xuICBwcml2YXRlIHRyYXk6IFRyYXkgfCBudWxsO1xuICBwcml2YXRlIGNvbmZpZzogeyB0aXRsZTogc3RyaW5nOyBpY29uOiBzdHJpbmcgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRyYXkgPSBudWxsO1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgdGl0bGU6ICdlbGVjdHJvbi1lZ2cnLFxuICAgICAgaWNvbjogJy9wdWJsaWMvaW1hZ2VzL3RyYXkucG5nJ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcdTYyNThcdTc2RDhcbiAgICovXG4gIGluaXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ1t0cmF5XSBsb2FkJyk7XG5cbiAgICBjb25zdCBjZmcgPSB0aGlzLmNvbmZpZztcbiAgICBjb25zdCBtYWluV2luZG93ID0gZ2V0TWFpbldpbmRvdygpO1xuXG4gICAgLy8gdHJheSBpY29uXG4gICAgY29uc3QgaWNvblBhdGggPSBwYXRoLmpvaW4oZ2V0QmFzZURpcigpLCBjZmcuaWNvbik7XG5cbiAgICAvLyBcdTYyNThcdTc2RDhcdTgzRENcdTUzNTVcdTUyOUZcdTgwRkRcdTUyMTdcdTg4NjhcbiAgICBjb25zdCB0cmF5TWVudVRlbXBsYXRlOiBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9uc1tdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1x1NjYzRVx1NzkzQScsXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbWFpbldpbmRvdy5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnXHU5MDAwXHU1MUZBJyxcbiAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdXG5cbiAgICAvLyBcdThCQkVcdTdGNkVcdTRFMDBcdTRFMkFcdTY4MDdcdThCQzZcdUZGMENcdTcwQjlcdTUxRkJcdTUxNzNcdTk1RURcdUZGMENcdTY3MDBcdTVDMEZcdTUzMTZcdTUyMzBcdTYyNThcdTc2RDhcbiAgICBzZXRDbG9zZUFuZFF1aXQoZmFsc2UpO1xuICAgIG1haW5XaW5kb3cub24oJ2Nsb3NlJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgaWYgKGdldENsb3NlQW5kUXVpdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG1haW5XaW5kb3cuaGlkZSgpO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIC8vIFx1OTY5MFx1ODVDRlx1NUU5NFx1NzUyOFx1ODNEQ1x1NTM1NVx1NjgwRlxuICAgIG1haW5XaW5kb3cuc2V0TWVudUJhclZpc2liaWxpdHkoZmFsc2UpO1xuXG4gICAgLy8gXHU1QjlFXHU0RjhCXHU1MzE2XHU2MjU4XHU3NkQ4XG4gICAgdGhpcy50cmF5ID0gbmV3IFRyYXkoaWNvblBhdGgpO1xuICAgIHRoaXMudHJheS5zZXRUb29sVGlwKGNmZy50aXRsZSk7XG4gICAgY29uc3QgY29udGV4dE1lbnUgPSBNZW51LmJ1aWxkRnJvbVRlbXBsYXRlKHRyYXlNZW51VGVtcGxhdGUpO1xuICAgIHRoaXMudHJheS5zZXRDb250ZXh0TWVudShjb250ZXh0TWVudSk7XG4gICAgLy8gXHU1REU2XHU5NTJFXHU1MzU1XHU1MUZCXHU3Njg0XHU2NUY2XHU1MDE5XHU4MEZEXHU1OTFGXHU2NjNFXHU3OTNBXHU0RTNCXHU3QTk3XHU1M0UzXG4gICAgdGhpcy50cmF5Lm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgIG1haW5XaW5kb3cuc2hvdygpXG4gICAgfSlcbiAgfVxufVxuZXhwb3J0IGNvbnN0IHRyYXlTZXJ2aWNlID0gbmV3IFRyYXlTZXJ2aWNlKCk7XG4iLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwIH0gZnJvbSAnZWxlY3Ryb24nO1xuXG4vKipcbiAqIFx1NUI4OVx1NTE2OFxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFNlY3VyaXR5U2VydmljZSB7XG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcbiAgICovXG4gIGluaXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ1tzZWN1cml0eV0gbG9hZCcpO1xuICAgIGNvbnN0IHJ1bldpdGhEZWJ1ZyA9IHByb2Nlc3MuYXJndi5maW5kKGZ1bmN0aW9uKGU6IHN0cmluZyl7XG4gICAgICBsZXQgaXNIYXNEZWJ1ZyA9IGUuaW5jbHVkZXMoXCItLWluc3BlY3RcIikgfHwgZS5pbmNsdWRlcyhcIi0taW5zcGVjdC1icmtcIikgfHwgZS5pbmNsdWRlcyhcIi0tcmVtb3RlLWRlYnVnZ2luZy1wb3J0XCIpO1xuICAgICAgcmV0dXJuIGlzSGFzRGVidWc7XG4gICAgfSlcblxuICAgIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NEUwRFx1NTE0MVx1OEJCOFx1OEZEQ1x1N0EwQlx1OEMwM1x1OEJENVxuICAgIGlmIChydW5XaXRoRGVidWcgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kJykge1xuICAgICAgbG9nZ2VyLmVycm9yKCdbZXJyb3JdIFJlbW90ZSBkZWJ1Z2dpbmcgaXMgbm90IGFsbG93ZWQsICBydW5XaXRoRGVidWc6JywgcnVuV2l0aERlYnVnKTtcbiAgICAgIGVsZWN0cm9uQXBwLnF1aXQoKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBzZWN1cml0eVNlcnZpY2UgPSBuZXcgU2VjdXJpdHlTZXJ2aWNlKCk7XG4iLCAiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKiBwcmVsb2FkXHU0RTNBXHU5ODg0XHU1MkEwXHU4RjdEXHU2QTIxXHU1NzU3XHVGRjBDXHU4QkU1XHU2NTg3XHU0RUY2XHU1QzA2XHU0RjFBXHU1NzI4XHU3QTBCXHU1RThGXHU1NDJGXHU1MkE4XHU2NUY2XHU1MkEwXHU4RjdEICoqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgdHJheVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL29zL3RyYXknO1xuaW1wb3J0IHsgc2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy9zZWN1cml0eSc7XG4vLyBpbXBvcnQgeyBjcm9zc1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2Nyb3NzJztcbi8vaW1wb3J0IHsgc3FsaXRlZGJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYic7XG5pbXBvcnQgeyB3aW5kb3dTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy93aW5kb3cnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gXHU3OTNBXHU0RjhCXHU1MjlGXHU4MEZEXHU2QTIxXHU1NzU3XHVGRjBDXHU1M0VGXHU5MDA5XHU2MkU5XHU2MDI3XHU0RjdGXHU3NTI4XHU1NDhDXHU0RkVFXHU2NTM5XG4gIGxvZ2dlci5pbmZvKCdbcHJlbG9hZF0gbG9hZCA1Jyk7XG4gIHdpbmRvd1NlcnZpY2UuaW5pdCgpO1xuICB0cmF5U2VydmljZS5pbml0KCk7XG4gIHNlY3VyaXR5U2VydmljZS5pbml0KCk7XG4gIC8vIGluaXQgc3FsaXRlIGRiIChsYXp5IGxvYWRzIGJldHRlci1zcWxpdGUzIG9uIGZpcnN0IHVzZSlcbiAgLy9hd2FpdCBzcWxpdGVkYlNlcnZpY2UuaW5pdCgpO1xuICAvLyBnbyBzZXJ2ZXJcbiAgLy9jcm9zc1NlcnZpY2UuY3JlYXRlR29TZXJ2ZXIoKTtcbn1cblxuXG4iLCAiaW1wb3J0IHsgRWxlY3Ryb25FZ2cgfSBmcm9tICdlZS1jb3JlJztcbmltcG9ydCB7IExpZmVjeWNsZSB9IGZyb20gJy4vcHJlbG9hZC9saWZlY3ljbGUnO1xuaW1wb3J0IHsgcHJlbG9hZCB9IGZyb20gJy4vcHJlbG9hZCc7XG5cbi8vIG5ldyBhcHBcbmNvbnN0IGFwcCA9IG5ldyBFbGVjdHJvbkVnZygpO1xuXG4vLyByZWdpc3RlciBsaWZlY3ljbGVcbmNvbnN0IGxpZmUgPSBuZXcgTGlmZWN5Y2xlKCk7XG5hcHAucmVnaXN0ZXIoXCJyZWFkeVwiLCBsaWZlLnJlYWR5KTtcbmFwcC5yZWdpc3RlcihcImVsZWN0cm9uLWFwcC1yZWFkeVwiLCBsaWZlLmVsZWN0cm9uQXBwUmVhZHkpO1xuYXBwLnJlZ2lzdGVyKFwid2luZG93LXJlYWR5XCIsIGxpZmUud2luZG93UmVhZHkpO1xuYXBwLnJlZ2lzdGVyKFwiYmVmb3JlLWNsb3NlXCIsIGxpZmUuYmVmb3JlQ2xvc2UpO1xuXG4vLyByZWdpc3RlciBwcmVsb2FkXG5hcHAucmVnaXN0ZXIoXCJwcmVsb2FkXCIsIHByZWxvYWQpO1xuXG4vLyBydW5cbmFwcC5ydW4oKTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBidW5kbGUgZW50cnkgLSBkbyBub3QgZWRpdFxucmVxdWlyZSgnYXBwOmNvbmZpZy1yZWdpc3RyeScpO1xucmVxdWlyZSgnYXBwOmNvbnRyb2xsZXItcmVnaXN0cnknKTtcbnJlcXVpcmUoXCIuL21haW4udHNcIik7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFDQSxXQU1PO0FBUFA7QUFBQTtBQUFBLGtCQUFpQjtBQUNqQixnQkFBMkI7QUFNM0IsSUFBTyx5QkFBUSxNQUF1QjtBQUNwQyxhQUFPO0FBQUEsUUFDTCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixlQUFlO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxRQUFRO0FBQUEsVUFDUixVQUFVO0FBQUEsVUFDVixXQUFXO0FBQUEsVUFDWCxnQkFBZ0I7QUFBQTtBQUFBLFlBRWQsa0JBQWtCO0FBQUE7QUFBQSxZQUNsQixpQkFBaUI7QUFBQTtBQUFBLFVBRW5CO0FBQUEsVUFDQSxPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsVUFDTixNQUFNLFlBQUFBLFFBQUssU0FBSyxzQkFBVyxHQUFHLFVBQVUsVUFBVSxhQUFhO0FBQUEsUUFDakU7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLE9BQU87QUFBQTtBQUFBLFVBQ1AsU0FBUztBQUFBO0FBQUEsVUFDVCxZQUFZO0FBQUEsVUFDWixTQUFTO0FBQUEsVUFDVCxRQUFRLENBQUM7QUFBQSxVQUNULGNBQWM7QUFBQSxVQUNkLFdBQVc7QUFB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LEtBR0E7QUFSTjtBQUFBO0FBQUEscUJBQTRCO0FBQzVCO0FBQ0E7QUFHQSxJQUFNLE1BQU0sSUFBSSwyQkFBWTtBQUc1QixJQUFNLE9BQU8sSUFBSSxVQUFVO0FBQzNCLFFBQUksU0FBUyxTQUFTLEtBQUssS0FBSztBQUNoQyxRQUFJLFNBQVMsc0JBQXNCLEtBQUssZ0JBQWdCO0FBQ3hELFFBQUksU0FBUyxnQkFBZ0IsS0FBSyxXQUFXO0FBQzdDLFFBQUksU0FBUyxnQkFBZ0IsS0FBSyxXQUFXO0FBRzdDLFFBQUksU0FBUyxXQUFXLE9BQU87QUFHL0IsUUFBSSxJQUFJO0FBQUE7QUFBQTs7O0FDakJSO0FBQ0E7QUFDQTsiLAogICJuYW1lcyI6IFsicGF0aCIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X3BhdGgiLCAicGF0aCIsICJheGlvcyIsICJpbml0X2Nyb3NzIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfdXRpbHMiLCAiaW1wb3J0X2xvZyIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BzIiwgImltcG9ydF9sb2ciLCAiaW5pdF9mcmFtZXdvcmsiLCAicGF0aCIsICJmcyIsICJlbGVjdHJvbkFwcCIsICJkYXlqcyIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BzIiwgImltcG9ydF9jb25maWciLCAiaW1wb3J0X3V0aWxzIiwgImltcG9ydF9sb2ciLCAicGF0aCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X2VsZWN0cm9uIiwgInBhdGgiLCAiZWxlY3Ryb25BcHAiLCAiZnMiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9sb2ciLCAiaW1wb3J0X2NvbmZpZyIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X3BzIiwgImltcG9ydF9sb2ciLCAicGF0aCIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9lbGVjdHJvbiIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfbG9nIl0KfQo=
