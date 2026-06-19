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
        if (!win) return;
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
        if (!win) return;
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

// electron/service/database/basedb.ts
var import_storage, import_ps3, import_path3, BasedbService;
var init_basedb = __esm({
  "electron/service/database/basedb.ts"() {
    import_storage = require("ee-core/storage");
    import_ps3 = require("ee-core/ps");
    import_path3 = __toESM(require("path"));
    BasedbService = class {
      dbname;
      db;
      storage;
      constructor(options) {
        const { dbname } = options;
        this.dbname = dbname;
      }
      /*
       * 初始化
       */
      _init() {
        const dbFile = import_path3.default.join((0, import_ps3.getDataDir)(), "db", this.dbname);
        const sqliteOptions = {
          timeout: 6e3,
          verbose: console.log
        };
        this.storage = new import_storage.SqliteStorage(dbFile, sqliteOptions);
        this.db = this.storage.db;
      }
      /*
       * change data dir (sqlite)
       */
      changeDataDir(dir) {
        const dbFile = import_path3.default.join(dir, this.dbname);
        const sqliteOptions = {
          timeout: 6e3,
          verbose: console.log
        };
        this.storage = new import_storage.SqliteStorage(dbFile, sqliteOptions);
        this.db = this.storage.db;
      }
    };
  }
});

// electron/service/database/sqlitedb.ts
var SqlitedbService, sqlitedbService;
var init_sqlitedb = __esm({
  "electron/service/database/sqlitedb.ts"() {
    init_basedb();
    SqlitedbService = class extends BasedbService {
      userTableName;
      constructor() {
        const options = {
          dbname: "sqlite-demo.db"
        };
        super(options);
        this.userTableName = "user";
      }
      /*
       * 初始化
       */
      init() {
        this._init();
        const masterStmt = this.db.prepare("SELECT * FROM sqlite_master WHERE type=? AND name = ?");
        let tableExists = masterStmt.get("table", this.userTableName);
        if (!tableExists) {
          const create_user_table_sql = `CREATE TABLE ${this.userTableName}
      (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name CHAR(50) NOT NULL,
         age INT
      );`;
          this.db.exec(create_user_table_sql);
        }
      }
      /*
       * 增 Test data (sqlite)
       */
      async addTestDataSqlite(data) {
        const insert = this.db.prepare(`INSERT INTO ${this.userTableName} (name, age) VALUES (@name, @age)`);
        insert.run(data);
        return true;
      }
      /*
       * 删 Test data (sqlite)
       */
      async delTestDataSqlite(name = "") {
        const delUser = this.db.prepare(`DELETE FROM ${this.userTableName} WHERE name = ?`);
        delUser.run(name);
        return true;
      }
      /*
       * 改 Test data (sqlite)
       */
      async updateTestDataSqlite(name = "", age = 0) {
        const updateUser = this.db.prepare(`UPDATE ${this.userTableName} SET age = ? WHERE name = ?`);
        updateUser.run(age, name);
        return true;
      }
      /*
       * 查 Test data (sqlite)
       */
      async getTestDataSqlite(age = 0) {
        const selectUser = this.db.prepare(`SELECT * FROM ${this.userTableName} WHERE age = @age`);
        const users = selectUser.all({ age });
        return users;
      }
      /*
       * all Test data (sqlite)
       */
      async getAllTestDataSqlite() {
        const selectAllUser = this.db.prepare(`SELECT * FROM ${this.userTableName} `);
        const allUser = selectAllUser.all();
        return allUser;
      }
      /*
       * get data dir (sqlite)
       */
      async getDataDir() {
        const dir = this.storage.getDbDir();
        return dir;
      }
      /*
       * set custom data dir (sqlite)
       */
      async setCustomDataDir(dir) {
        if (!dir) {
          return;
        }
        this.changeDataDir(dir);
        this.init();
        return;
      }
    };
    sqlitedbService = new SqlitedbService();
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
      create() {
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
        if (!win) return;
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
var import_dayjs, import_path4, import_fs, import_child_process, import_electron5, import_ps4, import_log4, import_config, FrameworkController, framework_default;
var init_framework2 = __esm({
  "electron/controller/framework.ts"() {
    import_dayjs = __toESM(require("dayjs"));
    import_path4 = __toESM(require("path"));
    import_fs = __toESM(require("fs"));
    import_child_process = require("child_process");
    import_electron5 = require("electron");
    import_ps4 = require("ee-core/ps");
    import_log4 = require("ee-core/log");
    import_config = require("ee-core/config");
    init_framework();
    init_sqlitedb();
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
      async sqlitedbOperation(args) {
        const { action, info, delete_name, update_name, update_age, search_age, data_dir } = args;
        const data = {
          action,
          result: null,
          all_list: [],
          code: 0
        };
        try {
          sqlitedbService.getDataDir();
        } catch (err) {
          console.log(err);
          data.code = -1;
          return data;
        }
        switch (action) {
          case "add":
            if (info) {
              data.result = await sqlitedbService.addTestDataSqlite(info);
            }
            break;
          case "del":
            data.result = await sqlitedbService.delTestDataSqlite(delete_name);
            ;
            break;
          case "update":
            data.result = await sqlitedbService.updateTestDataSqlite(update_name, update_age);
            break;
          case "get":
            data.result = await sqlitedbService.getTestDataSqlite(search_age);
            break;
          case "getDataDir":
            data.result = await sqlitedbService.getDataDir();
            break;
          case "setDataDir":
            if (data_dir) {
              await sqlitedbService.setCustomDataDir(data_dir);
            }
            break;
        }
        data.all_list = await sqlitedbService.getAllTestDataSqlite();
        return data;
      }
      /**
       * 调用其它程序（exe、bash等可执行程序）
       * 
       */
      openSoftware(args) {
        const { softName } = args;
        const softwarePath = import_path4.default.join((0, import_ps4.getExtraResourcesDir)(), softName);
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
var import_path5, import_electron6, import_electron7, import_ps5, import_config2, import_utils3, import_log5, WindowService, windowService;
var init_window = __esm({
  "electron/service/os/window.ts"() {
    import_path5 = __toESM(require("path"));
    import_electron6 = require("electron");
    import_electron7 = require("ee-core/electron");
    import_ps5 = require("ee-core/ps");
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
       * Create a new window
       */
      createWindow(args) {
        const { type, content, windowName, windowTitle } = args;
        let contentUrl = null;
        if (type == "html") {
          contentUrl = import_path5.default.join("file://", (0, import_ps5.getBaseDir)(), content);
        } else if (type == "web") {
          contentUrl = content;
        } else if (type == "vue") {
          let addr = "http://localhost:8080";
          if ((0, import_ps5.isProd)()) {
            const mainServer = (0, import_config2.getConfig)().mainServer;
            if ((0, import_utils3.isFileProtocol)(mainServer.protocol)) {
              addr = mainServer.protocol + import_path5.default.join((0, import_ps5.getBaseDir)(), mainServer.indexPath);
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
        if ((0, import_ps5.isDev)()) {
          win.webContents.openDevTools();
        }
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
        } else {
          win = this.windows[windowName];
        }
        if (!win) return null;
        return win.webContents.id;
      }
      /**
       * Realize communication between two windows through the transfer of the main process
       */
      communicate(args) {
        const { receiver, content } = args;
        if (receiver == "main") {
          const win = (0, import_electron7.getMainWindow)();
          if (!win) return;
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
var import_fs2, import_path6, import_electron8, OsController, os_default;
var init_os = __esm({
  "electron/controller/os.ts"() {
    import_fs2 = __toESM(require("fs"));
    import_path6 = __toESM(require("path"));
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
        if (import_path6.default.isAbsolute(id)) {
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
          if (!win) return;
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
        if (!win) return;
        const mainScreen = import_electron9.screen.getPrimaryDisplay();
        const { width, height } = mainScreen.workAreaSize;
        const windowWidth = Math.floor(width * 0.6);
        const windowHeight = Math.floor(height * 0.7);
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
var import_electron11, import_path7, import_ps6, import_log7, import_electron12, TrayService, trayService;
var init_tray = __esm({
  "electron/service/os/tray.ts"() {
    import_electron11 = require("electron");
    import_path7 = __toESM(require("path"));
    import_ps6 = require("ee-core/ps");
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
      create() {
        import_log7.logger.info("[tray] load");
        const cfg = this.config;
        const mainWindow = (0, import_electron12.getMainWindow)();
        if (!mainWindow) return;
        const iconPath = import_path7.default.join((0, import_ps6.getBaseDir)(), cfg.icon);
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
      create() {
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
function preload() {
  import_log9.logger.info("[preload] load 5");
  trayService.create();
  securityService.create();
}
var import_log9;
var init_preload = __esm({
  "electron/preload/index.ts"() {
    import_log9 = require("ee-core/log");
    init_tray();
    init_security();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIiwgIi4uLy4uL2VsZWN0cm9uL2NvbmZpZy9jb25maWcubG9jYWwudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5wcm9kLnRzIiwgImNvbmZpZy1yZWdpc3RyeTphcHA6Y29uZmlnLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2UvY3Jvc3MudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9jcm9zcy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2VmZmVjdC50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2V4YW1wbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9kYXRhYmFzZS9iYXNlZGIudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYi50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL2F1dG9fdXBkYXRlci50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2ZyYW1ld29yay50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL3dpbmRvdy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL29zLnRzIiwgImNvbnRyb2xsZXItcmVnaXN0cnk6YXBwOmNvbnRyb2xsZXItcmVnaXN0cnkiLCAiLi4vLi4vZWxlY3Ryb24vcHJlbG9hZC9saWZlY3ljbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy90cmF5LnRzIiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2Uvb3Mvc2VjdXJpdHkudHMiLCAiLi4vLi4vZWxlY3Ryb24vcHJlbG9hZC9pbmRleC50cyIsICIuLi8uLi9lbGVjdHJvbi9tYWluLnRzIiwgImJ1bmRsZS1lbnRyeTphcHA6YnVuZGxlLWVudHJ5Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5cbi8qKlxuICogXHU5RUQ4XHU4QkE0XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpOiBQYXJ0aWFsPENvbmZpZz4gPT4ge1xuICByZXR1cm4ge1xuICAgIG9wZW5EZXZUb29sczogZmFsc2UsXG4gICAgc2luZ2xlTG9jazogdHJ1ZSxcbiAgICB3aW5kb3dzT3B0aW9uOiB7XG4gICAgICB0aXRsZTogJ2VsZWN0cm9uLWVnZycsXG4gICAgICB3aWR0aDogOTgwLFxuICAgICAgaGVpZ2h0OiA4NTAsXG4gICAgICBtaW5XaWR0aDogNDAwLFxuICAgICAgbWluSGVpZ2h0OiAzMDAsXG4gICAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgICAvL3dlYlNlY3VyaXR5OiBmYWxzZSxcbiAgICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2UsIC8vIGZhbHNlIC0+IFx1NTNFRlx1NTcyOFx1NkUzMlx1NjdEM1x1OEZEQlx1N0EwQlx1NEUyRFx1NEY3Rlx1NzUyOGVsZWN0cm9uXHU3Njg0YXBpXHVGRjBDdHJ1ZS0+XHU5NzAwXHU4OTgxYnJpZGdlLmpzKGNvbnRleHRCcmlkZ2UpXG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgICAgLy9wcmVsb2FkOiBwYXRoLmpvaW4oZ2V0RWxlY3Ryb25EaXIoKSwgJ3ByZWxvYWQnLCAnYnJpZGdlLmpzJyksXG4gICAgICB9LFxuICAgICAgZnJhbWU6IHRydWUsXG4gICAgICBzaG93OiB0cnVlLFxuICAgICAgaWNvbjogcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgJ3B1YmxpYycsICdpbWFnZXMnLCAnbG9nby0zMi5wbmcnKSxcbiAgICB9LFxuICAgIGxvZ2dlcjoge1xuICAgICAgbGV2ZWw6ICdpbmZvJywgLy8gJ2ZhdGFsJywgJ2Vycm9yJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZScgb3IgJ3NpbGVudCdcbiAgICAgIHJvdGF0b3I6ICdkYWlseScsIC8vIGRhaWx5LCBob3VybHlcbiAgICAgIGRhdGVGb3JtYXQ6ICd5eXl5LU1NLWRkJyxcbiAgICAgIG1heFNpemU6ICcxMDBtJyxcbiAgICAgIHJlZGFjdDogW10sXG4gICAgICByZWRhY3RDZW5zb3I6ICdbUmVkYWN0ZWRdJyxcbiAgICAgIHRpbWVzdGFtcDogdHJ1ZSxcbiAgICAgIGRlcHRoTGltaXQ6IDUsXG4gICAgICB0aW1lem9uZTogJ0FzaWEvU2hhbmdoYWknLFxuICAgICAgbmFtZTogJ2VlJyxcbiAgICAgIGFwcExvZ05hbWU6ICdlZS5sb2cnLFxuICAgICAgY29yZUxvZ05hbWU6ICdlZS1jb3JlLmxvZycsXG4gICAgICBlcnJvckxvZ05hbWU6ICdlZS1lcnJvci5sb2cnXG4gICAgfSxcbiAgICByZW1vdGU6IHtcbiAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICB1cmw6ICdodHRwOi8vZWxlY3Ryb24tZWdnLmtha2E5OTYuY29tLydcbiAgICB9LFxuICAgIHNvY2tldFNlcnZlcjoge1xuICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgcG9ydDogNzA3MCxcbiAgICAgIHBhdGg6IFwiL3NvY2tldC5pby9cIixcbiAgICAgIGNvbm5lY3RUaW1lb3V0OiA0NTAwMCxcbiAgICAgIHBpbmdUaW1lb3V0OiAzMDAwMCxcbiAgICAgIHBpbmdJbnRlcnZhbDogMjUwMDAsXG4gICAgICBtYXhIdHRwQnVmZmVyU2l6ZTogMWU4LFxuICAgICAgdHJhbnNwb3J0czogW1wicG9sbGluZ1wiLCBcIndlYnNvY2tldFwiXSxcbiAgICAgIGNvcnM6IHtcbiAgICAgICAgb3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGNoYW5uZWw6ICdzb2NrZXQtY2hhbm5lbCdcbiAgICB9LFxuICAgIGh0dHBTZXJ2ZXI6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIGh0dHBzOiB7XG4gICAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICAgIGtleTogJy9wdWJsaWMvc3NsL2xvY2FsaG9zdCsxLmtleScsXG4gICAgICAgIGNlcnQ6ICcvcHVibGljL3NzbC9sb2NhbGhvc3QrMS5wZW0nXG4gICAgICB9LFxuICAgICAgcHJvdG9jb2w6ICdodHRwOi8vJyxcbiAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgICAgcG9ydDogNzA3MSxcbiAgICAgIGNvcnM6IHsgb3JpZ2luOiAnKicgfSxcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgbXVsdGlwYXJ0OiBmYWxzZSxcbiAgICAgICAgZm9ybWlkYWJsZTogeyBrZWVwRXh0ZW5zaW9uczogZmFsc2UgfVxuICAgICAgfSxcbiAgICAgIGZpbHRlclJlcXVlc3Q6IHtcbiAgICAgICAgdXJpczogW10sXG4gICAgICAgIHJldHVybkRhdGE6ICcnXG4gICAgICB9LFxuICAgIH0sXG4gICAgbWFpblNlcnZlcjoge1xuICAgICAgcHJvdG9jb2w6ICdmaWxlOi8vJyxcbiAgICAgIGluZGV4UGF0aDogJy9wdWJsaWMvZGlzdC9pbmRleC5odG1sJyxcbiAgICAgIGNoYW5uZWxTZXBhcmF0b3I6ICcvJyxcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIERldmVsb3BtZW50IGVudmlyb25tZW50IGNvbmZpZ3VyYXRpb24sIGNvdmVyYWdlIGNvbmZpZy5kZWZhdWx0LmpzXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpOiBQYXJ0aWFsPENvbmZpZz4gPT4ge1xuICByZXR1cm4ge1xuICAgIG9wZW5EZXZUb29sczoge1xuICAgICAgbW9kZTogJ2RldGFjaCdcbiAgICB9LFxuICAgIGpvYnM6IHtcbiAgICAgIG1lc3NhZ2VMb2c6IGZhbHNlXG4gICAgfVxuICB9O1xufTtcbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqICBjb3ZlcmFnZSBjb25maWcuZGVmYXVsdC5qc1xuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IGZhbHNlLFxuICB9O1xufTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBjb25maWcgcmVnaXN0cnkgLSBkbyBub3QgZWRpdFxuZ2xvYmFsLl9fRUVfQ09ORklHX1JFR0lTVFJZX18gPSBbXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmRlZmF1bHRcIiwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbmZpZy5kZWZhdWx0LnRzXCIpOyB9IH0sXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmxvY2FsXCIsIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jb25maWcubG9jYWwudHNcIik7IH0gfSxcbiAgeyBmaWxlbmFtZTogXCJjb25maWcucHJvZFwiLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY29uZmlnLnByb2QudHNcIik7IH0gfVxuXTsiLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0RXh0cmFSZXNvdXJjZXNEaXIsIGdldExvZ0RpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgY3Jvc3MgfSBmcm9tICdlZS1jb3JlL2Nyb3NzJztcbmltcG9ydCB0eXBlIHsgQ3Jvc3NUYXJnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBjcm9zc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIENyb3NzU2VydmljZSB7XG5cbiAgaW5mbygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBpZHMgPSBjcm9zcy5nZXRQaWRzKCk7XG4gICAgbG9nZ2VyLmluZm8oJ2Nyb3NzIHBpZHM6JywgcGlkcyk7XG5cbiAgICBsZXQgbnVtID0gMTtcbiAgICBwaWRzLmZvckVhY2goKHBpZDogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgZW50aXR5ID0gY3Jvc3MuZ2V0UHJvYyhwaWQpO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gbmFtZToke2VudGl0eS5uYW1lfWApO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gY29uZmlnOmAsIGVudGl0eS5jb25maWcpO1xuICAgICAgbnVtKys7XG4gICAgfSlcblxuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxuXG4gIGdldFVybChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGNyb3NzLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsO1xuICB9XG5cbiAga2lsbFNlcnZlcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0eXBlID09ICdhbGwnKSB7XG4gICAgICBjcm9zcy5raWxsQWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNyb3NzLmtpbGxCeU5hbWUobmFtZSk7XG4gICAgfVxuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlIGdvIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlR29TZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gbWV0aG9kIDE6IFVzZSB0aGUgZGVmYXVsdCBTZXR0aW5nc1xuICAgIC8vY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lKTtcblxuICAgIC8vIG1ldGhvZCAyOiBVc2UgY3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IFwiZ29cIjtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2dvYXBwJyxcbiAgICAgIGNtZDogcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdnb2FwcCcpLFxuICAgICAgZGlyZWN0b3J5OiBnZXRFeHRyYVJlc291cmNlc0RpcigpLFxuICAgICAgYXJnczogWyctLXBvcnQ9NzA3MyddLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciBuYW1lOicsIGVudGl0eS5uYW1lKTtcbiAgICBsb2dnZXIuaW5mbygnW2dvXSBzZXJ2ZXIgY29uZmlnOicsIGVudGl0eS5jb25maWcpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgamF2YSBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNyZWF0ZUphdmFTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcImphdmFcIjtcbiAgICBjb25zdCBqYXJQYXRoID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdqYXZhLWFwcC5qYXInKTtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2phdmFhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS9iaW4vamF2YXcuZXhlJyksXG4gICAgICBkaXJlY3Rvcnk6IGdldEV4dHJhUmVzb3VyY2VzRGlyKCksXG4gICAgICBhcmdzOiBbJy1qYXInLCAnLXNlcnZlcicsICctWG1zNTEyTScsICctWG14NTEyTScsICctWHNzNTEyaycsICctRHNwcmluZy5wcm9maWxlcy5hY3RpdmU9cHJvZCcsIGAtRHNlcnZlci5wb3J0PTE4MDgwYCwgYC1EbG9nZ2luZy5maWxlLnBhdGg9JHtnZXRMb2dEaXIoKX1gLCBgJHtqYXJQYXRofWBdLFxuICAgICAgYXBwRXhpdDogZmFsc2UsXG4gICAgfVxuICAgIGlmIChpcy5tYWNPUygpKSB7XG4gICAgICAvLyBTZXR1cCBKYXZhIHByb2dyYW1cbiAgICAgIG9wdC5jbWQgPSBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS5qcmUvQ29udGVudHMvSG9tZS9iaW4vamF2YScpO1xuICAgIH1cbiAgICBpZiAoaXMubGludXgoKSkge1xuICAgICAgLy8gU2V0dXAgSmF2YSBwcm9ncmFtXG4gICAgfVxuXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgY3Jvc3MuZ2V0VXJsKGVudGl0eS5uYW1lKSk7XG5cbiAgICByZXR1cm47XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBjcmVhdGUgcHl0aG9uIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlUHl0aG9uU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIG1ldGhvZCAxOiBVc2UgdGhlIGRlZmF1bHQgU2V0dGluZ3NcbiAgICAvL2NvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSk7XG5cbiAgICAvLyBtZXRob2QgMjogVXNlIGN1c3RvbSBjb25maWd1cmF0aW9uXG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcInB5dGhvblwiO1xuICAgIGNvbnN0IG9wdDogQ3Jvc3NUYXJnZXRDb25maWcgPSB7XG4gICAgICBuYW1lOiAncHlhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ3B5JywgJ3B5YXBwJyksXG4gICAgICBkaXJlY3Rvcnk6IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCAncHknKSxcbiAgICAgIGFyZ3M6IFsnLS1wb3J0PTcwNzQnXSxcbiAgICAgIHdpbmRvd3NFeHRuYW1lOiB0cnVlLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3RBcGkobmFtZTogc3RyaW5nLCB1cmxQYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3MuZ2V0VXJsKG5hbWUpO1xuICAgIGNvbnN0IGFwaUhlbGxvID0gc2VydmVyVXJsICsgdXJsUGF0aDtcbiAgICBjb25zb2xlLmxvZygnU2VydmVyIFVybDonLCBzZXJ2ZXJVcmwpO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcyh7XG4gICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgdXJsOiBhcGlIZWxsbyxcbiAgICAgIHRpbWVvdXQ6IDEwMDAsXG4gICAgICBwYXJhbXMsXG4gICAgICBwcm94eTogZmFsc2UsXG4gICAgfSk7XG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gcmVzcG9uc2U7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSAgXG59XG5leHBvcnQgY29uc3QgY3Jvc3NTZXJ2aWNlID0gbmV3IENyb3NzU2VydmljZSgpOyAgXG4iLCAiaW1wb3J0IHsgY3Jvc3NTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9jcm9zcyc7XG5cbi8qKlxuICogQ3Jvc3NcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBDcm9zc0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogVmlldyBwcm9jZXNzIHNlcnZpY2UgaW5mb3JtYXRpb25cbiAgICovXG4gIGluZm8oKTogc3RyaW5nIHtcbiAgICBjcm9zc1NlcnZpY2UuaW5mbygpO1xuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2VydmljZSB1cmxcbiAgICovICBcbiAgYXN5bmMgZ2V0VXJsKGFyZ3M6IHsgbmFtZTogc3RyaW5nIH0pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHsgbmFtZSB9ID0gYXJncztcbiAgICBjb25zdCBzZXJ2ZXJVcmwgPSBjcm9zc1NlcnZpY2UuZ2V0VXJsKG5hbWUpO1xuICAgIHJldHVybiBzZXJ2ZXJVcmw7XG4gIH1cblxuICAvKipcbiAgICoga2lsbCBzZXJ2aWNlXG4gICAqIEJ5IGRlZmF1bHQgKG1vZGlmaWFibGUpLCBraWxsaW5nIHRoZSBwcm9jZXNzIHdpbGwgZXhpdCB0aGUgZWxlY3Ryb24gYXBwbGljYXRpb24uXG4gICAqLyAgXG4gIGFzeW5jIGtpbGxTZXJ2ZXIoYXJnczogeyB0eXBlOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyB0eXBlLCBuYW1lIH0gPSBhcmdzO1xuICAgIGNyb3NzU2VydmljZS5raWxsU2VydmVyKHR5cGUsIG5hbWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgc2VydmljZVxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlU2VydmVyKGFyZ3M6IHsgcHJvZ3JhbTogc3RyaW5nIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHByb2dyYW0gfSA9IGFyZ3M7XG4gICAgaWYgKHByb2dyYW0gPT0gJ2dvJykge1xuICAgICAgY3Jvc3NTZXJ2aWNlLmNyZWF0ZUdvU2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChwcm9ncmFtID09ICdqYXZhJykge1xuICAgICAgY3Jvc3NTZXJ2aWNlLmNyZWF0ZUphdmFTZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKHByb2dyYW0gPT0gJ3B5dGhvbicpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVQeXRob25TZXJ2ZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogQWNjZXNzIHRoZSBhcGkgZm9yIHRoZSBjcm9zcyBzZXJ2aWNlXG4gICAqL1xuICBhc3luYyByZXF1ZXN0QXBpKGFyZ3M6IHsgbmFtZTogc3RyaW5nOyB1cmxQYXRoOiBzdHJpbmc7IHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCB7IG5hbWUsIHVybFBhdGgsIHBhcmFtc30gPSBhcmdzO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjcm9zc1NlcnZpY2UucmVxdWVzdEFwaShuYW1lLCB1cmxQYXRoLCBwYXJhbXMpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBDcm9zc0NvbnRyb2xsZXI7XG4iLCAiaW1wb3J0IHsgZGlhbG9nIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgZ2V0TWFpbldpbmRvdyB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuXG4vKipcbiAqIGVmZmVjdCAtIGRlbW9cbiAqIEBjbGFzc1xuICovXG5jbGFzcyBFZmZlY3RDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIHNlbGVjdCBmaWxlXG4gICAqL1xuICBzZWxlY3RGaWxlKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZ1N5bmMoe1xuICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZSddXG4gICAgfSk7XG5cbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZVBhdGhzWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIGxvZ2luIHdpbmRvd1xuICAgKi9cbiAgbG9naW5XaW5kb3coYXJnczogeyB3aWR0aD86IG51bWJlcjsgaGVpZ2h0PzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IGFyZ3M7XG4gICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgIGlmICghd2luKSByZXR1cm47XG5cbiAgICBjb25zdCBzaXplID0ge1xuICAgICAgd2lkdGg6IHdpZHRoIHx8IDQwMCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IHx8IDMwMFxuICAgIH1cbiAgICB3aW4uc2V0U2l6ZShzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgd2luLnNldFJlc2l6YWJsZSh0cnVlKTtcbiAgICB3aW4uY2VudGVyKCk7XG4gICAgd2luLnNob3coKTtcbiAgICB3aW4uZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXN0b3JlIHdpbmRvd1xuICAgKi9cbiAgcmVzdG9yZVdpbmRvdyhhcmdzOiB7IHdpZHRoPzogbnVtYmVyOyBoZWlnaHQ/OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gYXJncztcbiAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgaWYgKCF3aW4pIHJldHVybjtcblxuICAgIGNvbnN0IHNpemUgPSB7XG4gICAgICB3aWR0aDogd2lkdGggfHwgOTgwLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgNjUwXG4gICAgfVxuICAgIHdpbi5zZXRTaXplKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB3aW4uc2V0UmVzaXphYmxlKHRydWUpO1xuICAgIHdpbi5jZW50ZXIoKTtcbiAgICB3aW4uc2hvdygpO1xuICAgIHdpbi5mb2N1cygpO1xuICB9ICAgXG59XG5leHBvcnQgZGVmYXVsdCBFZmZlY3RDb250cm9sbGVyO1xuIiwgIi8qKlxuICogZXhhbXBsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEV4YW1wbGVDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIHRlc3RcbiAgICovXG4gIGFzeW5jIHRlc3QgKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuICdoZWxsbyBlbGVjdHJvbi1lZ2cnO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBFeGFtcGxlQ29udHJvbGxlcjtcbiIsICJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBDaGlsZEpvYiwgQ2hpbGRQb29sSm9iIH0gZnJvbSAnZWUtY29yZS9qb2JzJztcbmltcG9ydCB0eXBlIHsgSm9iUHJvY2VzcyB9IGZyb20gJ2VlLWNvcmUvam9icy9jaGlsZC9qb2JQcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgSXBjTWFpbkV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuXG4vKipcbiAqIGZyYW1ld29ya1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZyYW1ld29ya1NlcnZpY2Uge1xuICBwcml2YXRlIG15VGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbDtcbiAgcHJpdmF0ZSBteUpvYjogQ2hpbGRKb2I7XG4gIHByaXZhdGUgbXlKb2JQb29sOiBDaGlsZFBvb2xKb2I7XG4gIHByaXZhdGUgdGFza0ZvckpvYjogUmVjb3JkPHN0cmluZywgSm9iUHJvY2Vzcz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gXHU1NzI4XHU2Nzg0XHU5MDIwXHU1MUZEXHU2NTcwXHU0RTJEXHU1MjFEXHU1OUNCXHU1MzE2XHU0RTAwXHU0RTlCXHU1M0Q4XHU5MUNGXG4gICAgdGhpcy5teVRpbWVyID0gbnVsbDtcbiAgICB0aGlzLm15Sm9iID0gbmV3IENoaWxkSm9iKCk7XG4gICAgdGhpcy5teUpvYlBvb2wgPSBuZXcgQ2hpbGRQb29sSm9iKCk7XG4gICAgdGhpcy50YXNrRm9ySm9iID0ge307XG4gIH1cblxuICAvKipcbiAgICogdGVzdFxuICAgKi9cbiAgYXN5bmMgdGVzdChhcmdzOiB1bmtub3duKTogUHJvbWlzZTx7IHN0YXR1czogc3RyaW5nOyBwYXJhbXM6IHVua25vd24gfT4ge1xuICAgIGxldCBvYmogPSB7XG4gICAgICBzdGF0dXM6J29rJyxcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH1cbiAgICBsb2dnZXIuaW5mbygnRnJhbWV3b3JrU2VydmljZSBvYmo6Jywgb2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIGlwY1x1OTAxQVx1NEZFMShcdTUzQ0NcdTU0MTEpXG4gICAqL1xuICBib3RoV2F5TWVzc2FnZSh0eXBlOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IHN0cmluZyB7XG4gICAgLy8gXHU1MjREXHU3QUVGaXBjXHU5ODkxXHU5MDUzIGNoYW5uZWxcbiAgICBjb25zdCBjaGFubmVsID0gJ2NvbnRyb2xsZXIvZnJhbWV3b3JrL2lwY1NlbmRNc2cnO1xuXG4gICAgaWYgKHR5cGUgPT0gJ3N0YXJ0Jykge1xuICAgICAgLy8gXHU2QkNGXHU5Njk0MVx1NzlEMlx1RkYwQ1x1NTQxMVx1NTI0RFx1N0FFRlx1OTg3NVx1OTc2Mlx1NTNEMVx1OTAwMVx1NkQ4OFx1NjA2RlxuICAgICAgLy8gXHU3NTI4XHU1QjlBXHU2NUY2XHU1NjY4XHU2QTIxXHU2MkRGXG4gICAgICB0aGlzLm15VGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbihlLCBjLCBtc2cpIHtcbiAgICAgICAgbGV0IHRpbWVOb3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBsZXQgZGF0YSA9IG1zZyArICc6JyArIHRpbWVOb3c7XG4gICAgICAgIGUucmVwbHkoYCR7Y31gLCBkYXRhKVxuICAgICAgfSwgMTAwMCwgZXZlbnQsIGNoYW5uZWwsIGNvbnRlbnQpXG5cbiAgICAgIHJldHVybiAnXHU1RjAwXHU1OUNCXHU0RTg2J1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnZW5kJykge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLm15VGltZXIhKTtcbiAgICAgIHJldHVybiAnXHU1MDVDXHU2QjYyXHU0RTg2JyAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdvaHRoZXInXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVxuICAgKi8gXG4gIGRvSm9iKGpvYklkOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBldmVudDogSXBjTWFpbkV2ZW50KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGxldCByZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgbGV0IG9uZVRhc2s6IEpvYlByb2Nlc3MgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay90aW1lckpvYlByb2dyZXNzJztcbiAgXG4gICAgaWYgKGFjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgLy8gXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2XG4gICAgICBsZXQgZXZlbnROYW1lID0gJ2pvYi10aW1lci1wcm9ncmVzcy0nICsgam9iSWQ7XG4gICAgICBjb25zdCB0aW1lclRhc2sgPSB0aGlzLm15Sm9iLmV4ZWMoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSk7XG4gICAgICB0aW1lclRhc2suZW1pdHRlci5vbihldmVudE5hbWUsIChkYXRhOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdbbWFpbi1wcm9jZXNzXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcbiAgICAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pXG4gICAgXG4gICAgICAvLyBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcdTUzQ0FcdTc2RDFcdTU0MkNcdThGREJcdTVFQTYgXHU1RjAyXHU2QjY1XG4gICAgICAvLyBteWpvYi5leGVjUHJvbWlzZSgnLi9qb2JzL2V4YW1wbGUvdGltZXInLCB7am9iSWR9KS50aGVuKHRhc2sgPT4ge1xuICAgICAgLy8gICB0YXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gICAgIExvZy5pbmZvKCdbbWFpbi1wcm9jZXNzXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcbiAgICAgIC8vICAgICAvLyBcdTUzRDFcdTkwMDFcdTY1NzBcdTYzNkVcdTUyMzBcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcbiAgICAgIC8vICAgICBldmVudC5zZW5kZXIuc2VuZChgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICAvLyAgIH0pXG4gICAgICAvLyB9KTtcblxuICAgICAgcmVzLnBpZCA9IHRpbWVyVGFzay5waWQ7IFxuICAgICAgdGhpcy50YXNrRm9ySm9iW2pvYklkXSA9IHRpbWVyVGFzaztcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PSAnY2xvc2UnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2sua2lsbCgpO1xuICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCB7am9iSWQsIG51bWJlcjowLCBwaWQ6MH0pO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uID09ICdwYXVzZScpIHtcbiAgICAgIG9uZVRhc2sgPSB0aGlzLnRhc2tGb3JKb2Jbam9iSWRdO1xuICAgICAgb25lVGFzay5jYWxsRnVuYygnLi9qb2JzL2V4YW1wbGUvdGltZXInLCAncGF1c2UnLCBqb2JJZCk7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gPT0gJ3Jlc3VtZScpIHtcbiAgICAgIG9uZVRhc2sgPSB0aGlzLnRhc2tGb3JKb2Jbam9iSWRdO1xuICAgICAgb25lVGFzay5jYWxsRnVuYygnLi9qb2JzL2V4YW1wbGUvdGltZXInLCAncmVzdW1lJywgam9iSWQsIG9uZVRhc2sucGlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFwb29sXG4gICAqLyBcbiAgZG9DcmVhdGVQb29sKG51bTogbnVtYmVyLCBldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay9jcmVhdGVQb29sTm90aWNlJztcbiAgICB0aGlzLm15Sm9iUG9vbC5jcmVhdGUobnVtKS50aGVuKChwaWRzOiBzdHJpbmdbXSkgPT4ge1xuICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBwaWRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTkwMUFcdThGQzdcdThGREJcdTdBMEJcdTZDNjBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovXG4gIGFzeW5jIGRvSm9iQnlQb29sKGpvYklkOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBldmVudDogSXBjTWFpbkV2ZW50KTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgIGxldCByZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay90aW1lckpvYlByb2dyZXNzJztcbiAgICBpZiAoYWN0aW9uID09ICdydW4nKSB7XG4gICAgICAvLyBcdTVGMDJcdTZCNjUtXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2XG4gICAgICBjb25zdCB0YXNrID0gYXdhaXQgdGhpcy5teUpvYlBvb2wucnVuUHJvbWlzZSgnLi9qb2JzL2V4YW1wbGUvdGltZXInLCB7am9iSWR9KTtcblxuICAgICAgLy8gXHU3NkQxXHU1NDJDXHU1NjY4XHU1NDBEXHU3OUYwXHU1NTJGXHU0RTAwXHVGRjBDXHU1NDI2XHU1MjE5XHU0RjFBXHU1MUZBXHU3M0IwXHU5MUNEXHU1OTBEXHU3NkQxXHU1NDJDXHUzMDAyXG4gICAgICAvLyBcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdTY1RjZcdUZGMENcdTk3MDBcdTg5ODFcdTc5RkJcdTk2NjRcdTc2RDFcdTU0MkNcdTU2NjhcdUZGMENcdTk2MzJcdTZCNjJcdTUxODVcdTVCNThcdTZDQzRcdTZGMEZcbiAgICAgIGxldCBldmVudE5hbWUgPSAnam9iLXRpbWVyLXByb2dyZXNzLScgKyBqb2JJZDtcbiAgICAgIHRhc2suZW1pdHRlci5vbihldmVudE5hbWUsIChkYXRhOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdbbWFpbi1wcm9jZXNzXSBbQ2hpbGRQb29sSm9iXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcblxuICAgICAgICAvLyBcdTUzRDFcdTkwMDFcdTY1NzBcdTYzNkVcdTUyMzBcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcbiAgICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjUzNlx1NTIzMFx1NEVGQlx1NTJBMVx1NUI4Q1x1NjIxMFx1NzY4NFx1NkQ4OFx1NjA2Rlx1RkYwQ1x1NzlGQlx1OTY2NFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgICAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgJ2VuZCcgaW4gZGF0YSAmJiAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuZW5kKSB7XG4gICAgICAgICAgdGFzay5lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycyhldmVudE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmVzLnBpZCA9IHRhc2sucGlkO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODNCN1x1NTNENlx1NkI2M1x1NTcyOFx1OEZEMFx1ODg0Q1x1NzY4NCBqb2IgXHU4RkRCXHU3QTBCIFxuICAgKi8gXG4gIG1vbml0b3JKb2IoKTogdm9pZCB7XG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbGV0IGpvYlBpZHMgPSB0aGlzLm15Sm9iLmdldFBpZHMoKTtcbiAgICAgIGxldCBqb2JQb29sUGlkcyA9IHRoaXMubXlKb2JQb29sLmdldFBpZHMoKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBbbWFpbi1wcm9jZXNzXSBbbW9uaXRvckpvYl0gam9iUGlkczogJHtqb2JQaWRzfSwgam9iUG9vbFBpZHM6ICR7am9iUG9vbFBpZHN9YCk7XG4gICAgfSwgNTAwMClcbiAgfVxuXG59XG5leHBvcnQgY29uc3QgZnJhbWV3b3JrU2VydmljZSA9IG5ldyBGcmFtZXdvcmtTZXJ2aWNlKCk7ICBcbiIsICJpbXBvcnQgeyBTcWxpdGVTdG9yYWdlIH0gZnJvbSAnZWUtY29yZS9zdG9yYWdlJztcbmltcG9ydCB7IGdldERhdGFEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnO1xuXG4vKipcbiAqIHNxbGl0ZVx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEJhc2VkYlNlcnZpY2Uge1xuICBwcm90ZWN0ZWQgZGJuYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBkYiE6IERhdGFiYXNlLkRhdGFiYXNlO1xuICBwcm90ZWN0ZWQgc3RvcmFnZSE6IFNxbGl0ZVN0b3JhZ2U7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogeyBkYm5hbWU6IHN0cmluZyB9KSB7XG4gICAgY29uc3QgeyBkYm5hbWUgfSA9IG9wdGlvbnM7XG4gICAgdGhpcy5kYm5hbWUgPSBkYm5hbWU7XG4gIH1cblxuICAvKlxuICAgKiBcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICovXG4gIF9pbml0KCk6IHZvaWQge1xuICAgIC8vIFx1NUI5QVx1NEU0OVx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlxuICAgIGNvbnN0IGRiRmlsZSA9IHBhdGguam9pbihnZXREYXRhRGlyKCksIFwiZGJcIiwgdGhpcy5kYm5hbWUpO1xuICAgIGNvbnN0IHNxbGl0ZU9wdGlvbnMgPSB7XG4gICAgICB0aW1lb3V0OiA2MDAwLFxuICAgICAgdmVyYm9zZTogY29uc29sZS5sb2dcbiAgICB9XG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFNxbGl0ZVN0b3JhZ2UoZGJGaWxlLCBzcWxpdGVPcHRpb25zKTtcbiAgICB0aGlzLmRiID0gdGhpcy5zdG9yYWdlLmRiO1xuICB9XG5cbiAgLypcbiAgICogY2hhbmdlIGRhdGEgZGlyIChzcWxpdGUpXG4gICAqL1xuICBjaGFuZ2VEYXRhRGlyKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gdGhlIGFic29sdXRlIHBhdGggb2YgdGhlIGRiIGZpbGVcbiAgICBjb25zdCBkYkZpbGUgPSBwYXRoLmpvaW4oZGlyLCB0aGlzLmRibmFtZSk7XG4gICAgY29uc3Qgc3FsaXRlT3B0aW9ucyA9IHtcbiAgICAgIHRpbWVvdXQ6IDYwMDAsXG4gICAgICB2ZXJib3NlOiBjb25zb2xlLmxvZ1xuICAgIH1cbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3FsaXRlU3RvcmFnZShkYkZpbGUsIHNxbGl0ZU9wdGlvbnMpO1xuICAgIHRoaXMuZGIgPSB0aGlzLnN0b3JhZ2UuZGI7ICAgXG4gIH1cbn0gIFxuZXhwb3J0IHsgQmFzZWRiU2VydmljZSB9O1xuIiwgImltcG9ydCB7IEJhc2VkYlNlcnZpY2UgfSBmcm9tICcuL2Jhc2VkYic7XG5cbi8qKlxuICogc3FsaXRlXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVc2VyUm93IHtcbiAgaWQ6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuICBhZ2U6IG51bWJlcjtcbn1cblxuY2xhc3MgU3FsaXRlZGJTZXJ2aWNlIGV4dGVuZHMgQmFzZWRiU2VydmljZSB7XG4gIHByaXZhdGUgdXNlclRhYmxlTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgZGJuYW1lOiAnc3FsaXRlLWRlbW8uZGInLFxuICAgIH1cbiAgICBzdXBlcihvcHRpb25zKTtcbiAgICB0aGlzLnVzZXJUYWJsZU5hbWUgPSAndXNlcic7XG4gIH1cblxuICAvKlxuICAgKiBcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICovXG4gIGluaXQoKTogdm9pZCB7XG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2XHU2NTcwXHU2MzZFXHU1RTkzXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU4ODY4XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgY29uc3QgbWFzdGVyU3RtdCA9IHRoaXMuZGIucHJlcGFyZSgnU0VMRUNUICogRlJPTSBzcWxpdGVfbWFzdGVyIFdIRVJFIHR5cGU9PyBBTkQgbmFtZSA9ID8nKTtcbiAgICBsZXQgdGFibGVFeGlzdHMgPSBtYXN0ZXJTdG10LmdldCgndGFibGUnLCB0aGlzLnVzZXJUYWJsZU5hbWUpO1xuICAgIGlmICghdGFibGVFeGlzdHMpIHtcbiAgICAgIC8vIFx1NTIxQlx1NUVGQVx1ODg2OFxuICAgICAgY29uc3QgY3JlYXRlX3VzZXJfdGFibGVfc3FsID1cbiAgICAgIGBDUkVBVEUgVEFCTEUgJHt0aGlzLnVzZXJUYWJsZU5hbWV9XG4gICAgICAoXG4gICAgICAgICBpZCBJTlRFR0VSIFBSSU1BUlkgS0VZIEFVVE9JTkNSRU1FTlQsXG4gICAgICAgICBuYW1lIENIQVIoNTApIE5PVCBOVUxMLFxuICAgICAgICAgYWdlIElOVFxuICAgICAgKTtgXG4gICAgICB0aGlzLmRiLmV4ZWMoY3JlYXRlX3VzZXJfdGFibGVfc3FsKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBcdTU4OUUgVGVzdCBkYXRhIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBhZGRUZXN0RGF0YVNxbGl0ZShkYXRhOiB7IG5hbWU6IHN0cmluZzsgYWdlOiBudW1iZXIgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGluc2VydCA9IHRoaXMuZGIucHJlcGFyZShgSU5TRVJUIElOVE8gJHt0aGlzLnVzZXJUYWJsZU5hbWV9IChuYW1lLCBhZ2UpIFZBTFVFUyAoQG5hbWUsIEBhZ2UpYCk7XG4gICAgaW5zZXJ0LnJ1bihkYXRhKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qXG4gICAqIFx1NTIyMCBUZXN0IGRhdGEgKHNxbGl0ZSlcbiAgICovXG4gIGFzeW5jIGRlbFRlc3REYXRhU3FsaXRlKG5hbWUgPSAnJyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRlbFVzZXIgPSB0aGlzLmRiLnByZXBhcmUoYERFTEVURSBGUk9NICR7dGhpcy51c2VyVGFibGVOYW1lfSBXSEVSRSBuYW1lID0gP2ApO1xuICAgIGRlbFVzZXIucnVuKG5hbWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLypcbiAgICogXHU2NTM5IFRlc3QgZGF0YSAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgdXBkYXRlVGVzdERhdGFTcWxpdGUobmFtZT0gJycsIGFnZSA9IDApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB1cGRhdGVVc2VyID0gdGhpcy5kYi5wcmVwYXJlKGBVUERBVEUgJHt0aGlzLnVzZXJUYWJsZU5hbWV9IFNFVCBhZ2UgPSA/IFdIRVJFIG5hbWUgPSA/YCk7XG4gICAgdXBkYXRlVXNlci5ydW4oYWdlLCBuYW1lKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAgXG5cbiAgLypcbiAgICogXHU2N0U1IFRlc3QgZGF0YSAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgZ2V0VGVzdERhdGFTcWxpdGUoYWdlID0gMCk6IFByb21pc2U8VXNlclJvd1tdPiB7XG4gICAgY29uc3Qgc2VsZWN0VXNlciA9IHRoaXMuZGIucHJlcGFyZShgU0VMRUNUICogRlJPTSAke3RoaXMudXNlclRhYmxlTmFtZX0gV0hFUkUgYWdlID0gQGFnZWApO1xuICAgIGNvbnN0IHVzZXJzID0gc2VsZWN0VXNlci5hbGwoe2FnZTogYWdlfSkgYXMgVXNlclJvd1tdO1xuICAgIHJldHVybiB1c2VycztcbiAgfSAgXG4gIFxuICAvKlxuICAgKiBhbGwgVGVzdCBkYXRhIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBnZXRBbGxUZXN0RGF0YVNxbGl0ZSgpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgY29uc3Qgc2VsZWN0QWxsVXNlciA9IHRoaXMuZGIucHJlcGFyZShgU0VMRUNUICogRlJPTSAke3RoaXMudXNlclRhYmxlTmFtZX0gYCk7XG4gICAgY29uc3QgYWxsVXNlciA9ICBzZWxlY3RBbGxVc2VyLmFsbCgpO1xuICAgIHJldHVybiBhbGxVc2VyO1xuICB9XG4gIFxuICAvKlxuICAgKiBnZXQgZGF0YSBkaXIgKHNxbGl0ZSlcbiAgICovXG4gIGFzeW5jIGdldERhdGFEaXIoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBkaXIgPSB0aGlzLnN0b3JhZ2UuZ2V0RGJEaXIoKTsgICAgXG4gICAgcmV0dXJuIGRpcjtcbiAgfSBcblxuICAvKlxuICAgKiBzZXQgY3VzdG9tIGRhdGEgZGlyIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBzZXRDdXN0b21EYXRhRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFkaXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZURhdGFEaXIoZGlyKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBzcWxpdGVkYlNlcnZpY2UgPSBuZXcgU3FsaXRlZGJTZXJ2aWNlKCk7XG4iLCAiaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgYXV0b1VwZGF0ZXIgfSBmcm9tIFwiZWxlY3Ryb24tdXBkYXRlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9ncmVzc0luZm8gfSBmcm9tICdlbGVjdHJvbi11cGRhdGVyJztcbmltcG9ydCB0eXBlIHsgR2VuZXJpY1NlcnZlck9wdGlvbnMgfSBmcm9tICdidWlsZGVyLXV0aWwtcnVudGltZSc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0TWFpbldpbmRvdywgc2V0Q2xvc2VBbmRRdWl0IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbi8qKlxuICogXHU4MUVBXHU1MkE4XHU1MzQ3XHU3RUE3XG4gKiBAY2xhc3NcbiAqL1xuaW50ZXJmYWNlIFVwZGF0ZXJDb25maWcge1xuICB3aW5kb3dzOiBib29sZWFuO1xuICBtYWNPUzogYm9vbGVhbjtcbiAgbGludXg6IGJvb2xlYW47XG4gIG9wdGlvbnM6IEdlbmVyaWNTZXJ2ZXJPcHRpb25zO1xufVxuXG5jbGFzcyBBdXRvVXBkYXRlclNlcnZpY2Uge1xuICBwcml2YXRlIGNvbmZpZzogVXBkYXRlckNvbmZpZztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHdpbmRvd3M6IGZhbHNlLFxuICAgICAgbWFjT1M6IGZhbHNlLFxuICAgICAgbGludXg6IGZhbHNlLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBwcm92aWRlcjogJ2dlbmVyaWMnIGFzIGNvbnN0LFxuICAgICAgICB1cmw6ICdodHRwOi8va29kby5xaW5pdS5jb20vJ1xuICAgICAgfSxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXG4gICAqL1xuICBjcmVhdGUgKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbYXV0b1VwZGF0ZXJdIGxvYWQnKTtcbiAgICBjb25zdCBjZmcgPSB0aGlzLmNvbmZpZztcbiAgICBpZiAoKGlzLndpbmRvd3MoKSAmJiBjZmcud2luZG93cykgfHwgKGlzLm1hY09TKCkgJiYgY2ZnLm1hY09TKSB8fCAoaXMubGludXgoKSAmJiBjZmcubGludXgpKSB7XG4gICAgICAvLyBjb250aW51ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXMgPSB7XG4gICAgICBlcnJvcjogLTEsXG4gICAgICBhdmFpbGFibGU6IDEsXG4gICAgICBub0F2YWlsYWJsZTogMixcbiAgICAgIGRvd25sb2FkaW5nOiAzLFxuICAgICAgZG93bmxvYWRlZDogNCxcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gZWxlY3Ryb25BcHAuZ2V0VmVyc2lvbigpO1xuICAgIGxvZ2dlci5pbmZvKCdbYXV0b1VwZGF0ZXJdIGN1cnJlbnQgdmVyc2lvbjogJywgdmVyc2lvbik7XG4gIFxuICAgIC8vIFx1OEJCRVx1N0Y2RVx1NEUwQlx1OEY3RFx1NjcwRFx1NTJBMVx1NTY2OFx1NTczMFx1NTc0MFxuICAgIGxldCBzZXJ2ZXIgPSBjZmcub3B0aW9ucy51cmw7XG4gICAgbGV0IGxhc3RDaGFyID0gc2VydmVyLnN1YnN0cmluZyhzZXJ2ZXIubGVuZ3RoIC0gMSk7XG4gICAgc2VydmVyID0gbGFzdENoYXIgPT09ICcvJyA/IHNlcnZlciA6IHNlcnZlciArIFwiL1wiO1xuICAgIGNvbnN0IGZlZWRPcHRpb25zOiBHZW5lcmljU2VydmVyT3B0aW9ucyA9IHsgLi4uY2ZnLm9wdGlvbnMsIHVybDogc2VydmVyIH07XG5cbiAgICB0cnkge1xuICAgICAgYXV0b1VwZGF0ZXIuc2V0RmVlZFVSTChmZWVkT3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignW2F1dG9VcGRhdGVyXSBzZXRGZWVkVVJMIGVycm9yIDogJywgZXJyb3IpO1xuICAgIH1cbiAgXG4gICAgYXV0b1VwZGF0ZXIub24oJ2NoZWNraW5nLWZvci11cGRhdGUnLCAoKSA9PiB7XG4gICAgICAvL3NlbmRTdGF0dXNUb1dpbmRvdygnXHU2QjYzXHU1NzI4XHU2OEMwXHU2N0U1XHU2NkY0XHU2NUIwLi4uJyk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbigndXBkYXRlLWF2YWlsYWJsZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLmF2YWlsYWJsZSxcbiAgICAgICAgZGVzYzogJ1x1NjcwOVx1NTNFRlx1NzUyOFx1NjZGNFx1NjVCMCdcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1ub3QtYXZhaWxhYmxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMubm9BdmFpbGFibGUsXG4gICAgICAgIGRlc2M6ICdcdTZDQTFcdTY3MDlcdTUzRUZcdTc1MjhcdTY2RjRcdTY1QjAnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5lcnJvcixcbiAgICAgICAgZGVzYzogZXJyXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCdkb3dubG9hZC1wcm9ncmVzcycsIChwcm9ncmVzc09iajogUHJvZ3Jlc3NJbmZvKSA9PiB7XG4gICAgICBjb25zdCBwZXJjZW50TnVtYmVyID0gTWF0aC5mbG9vcihwcm9ncmVzc09iai5wZXJjZW50KTtcbiAgICAgIGNvbnN0IHRvdGFsU2l6ZSA9IHRoaXMuYnl0ZXNDaGFuZ2UocHJvZ3Jlc3NPYmoudG90YWwpO1xuICAgICAgY29uc3QgdHJhbnNmZXJyZWRTaXplID0gdGhpcy5ieXRlc0NoYW5nZShwcm9ncmVzc09iai50cmFuc2ZlcnJlZCk7XG4gICAgICBsZXQgdGV4dCA9ICdcdTVERjJcdTRFMEJcdThGN0QgJyArIHBlcmNlbnROdW1iZXIgKyAnJSc7XG4gICAgICB0ZXh0ID0gdGV4dCArICcgKCcgKyB0cmFuc2ZlcnJlZFNpemUgKyBcIi9cIiArIHRvdGFsU2l6ZSArICcpJztcbiAgXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5kb3dubG9hZGluZyxcbiAgICAgICAgZGVzYzogdGV4dCxcbiAgICAgICAgcGVyY2VudE51bWJlcixcbiAgICAgICAgdG90YWxTaXplLFxuICAgICAgICB0cmFuc2ZlcnJlZFNpemVcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5pbmZvKCdbYXV0b1VwZGF0ZXJdIHByb2dyZXNzOiAnLCB0ZXh0KTtcbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1kb3dubG9hZGVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuZG93bmxvYWRlZCxcbiAgICAgICAgZGVzYzogJ1x1NEUwQlx1OEY3RFx1NUI4Q1x1NjIxMCdcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VuZFN0YXR1c1RvV2luZG93KGRhdGEpO1xuXG4gICAgICAvLyBcdTYyNThcdTc2RDhcdTYzRDJcdTRFRjZcdTkxQ0NcdTk3NjJcdThCQkVcdTdGNkVcdTRFODZcdTk2M0JcdTZCNjJcdTdBOTdcdTUzRTNcdTUxNzNcdTk1RURcdUZGMENcdThGRDlcdTkxQ0NcdThCQkVcdTdGNkVcdTUxNDFcdThCQjhcdTUxNzNcdTk1RURcdTdBOTdcdTUzRTNcbiAgICAgIHNldENsb3NlQW5kUXVpdCh0cnVlKTtcbiAgICAgIFxuICAgICAgLy8gSW5zdGFsbCB1cGRhdGVzIGFuZCBleGl0IHRoZSBhcHBsaWNhdGlvblxuICAgICAgYXV0b1VwZGF0ZXIucXVpdEFuZEluc3RhbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTY3RTVcdTY2RjRcdTY1QjBcbiAgICovXG4gIGNoZWNrVXBkYXRlICgpOiB2b2lkIHtcbiAgICBhdXRvVXBkYXRlci5jaGVja0ZvclVwZGF0ZXMoKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFx1NEUwQlx1OEY3RFx1NjZGNFx1NjVCMFxuICAgKi9cbiAgZG93bmxvYWQgKCk6IHZvaWQge1xuICAgIGF1dG9VcGRhdGVyLmRvd25sb2FkVXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogXHU1NDExXHU1MjREXHU3QUVGXHU1M0QxXHU2RDg4XHU2MDZGXG4gICAqL1xuICBzZW5kU3RhdHVzVG9XaW5kb3coY29udGVudDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSk6IHZvaWQge1xuICAgIGNvbnN0IHRleHRKc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjdXN0b20vYXBwL3VwZGF0ZXInO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICBpZiAoIXdpbikgcmV0dXJuO1xuICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKGNoYW5uZWwsIHRleHRKc29uKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFx1NTM1NVx1NEY0RFx1OEY2Q1x1NjM2MlxuICAgKi9cbiAgYnl0ZXNDaGFuZ2UgKGxpbWl0OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGxldCBzaXplID0gXCJcIjtcbiAgICBpZihsaW1pdCA8IDAuMSAqIDEwMjQpeyAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHNpemUgPSBsaW1pdC50b0ZpeGVkKDIpICsgXCJCXCI7XG4gICAgfWVsc2UgaWYobGltaXQgPCAwLjEgKiAxMDI0ICogMTAyNCl7ICAgICAgICAgICAgXG4gICAgICBzaXplID0gKGxpbWl0LzEwMjQpLnRvRml4ZWQoMikgKyBcIktCXCI7XG4gICAgfWVsc2UgaWYobGltaXQgPCAwLjEgKiAxMDI0ICogMTAyNCAqIDEwMjQpeyAgICAgICAgXG4gICAgICBzaXplID0gKGxpbWl0LygxMDI0ICogMTAyNCkpLnRvRml4ZWQoMikgKyBcIk1CXCI7XG4gICAgfWVsc2V7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHNpemUgPSAobGltaXQvKDEwMjQgKiAxMDI0ICogMTAyNCkpLnRvRml4ZWQoMikgKyBcIkdCXCI7XG4gICAgfVxuXG4gICAgbGV0IHNpemVTdHIgPSBzaXplICsgXCJcIjsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBsZXQgaW5kZXggPSBzaXplU3RyLmluZGV4T2YoXCIuXCIpOyAgICAgICAgICAgICAgICAgICAgXG4gICAgbGV0IGRvdSA9IHNpemVTdHIuc3Vic3RyaW5nKGluZGV4ICsgMSAsIGluZGV4ICsgMyk7ICAgICAgICAgICAgXG4gICAgaWYoZG91ID09IFwiMDBcIil7XG4gICAgICAgIHJldHVybiBzaXplU3RyLnN1YnN0cmluZygwLCBpbmRleCkgKyBzaXplU3RyLnN1YnN0cmluZyhpbmRleCArIDMsIGluZGV4ICsgNSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpemU7XG4gIH0gIFxufVxuZXhwb3J0IGNvbnN0IGF1dG9VcGRhdGVyU2VydmljZSA9IG5ldyBBdXRvVXBkYXRlclNlcnZpY2UoKTtcbiIsICJpbXBvcnQgZGF5anMgZnJvbSAnZGF5anMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwLCBzaGVsbCwgSXBjTWFpbkV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgZ2V0RXh0cmFSZXNvdXJjZXNEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2VlLWNvcmUvY29uZmlnJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5pbXBvcnQgeyBmcmFtZXdvcmtTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9mcmFtZXdvcmsnO1xuaW1wb3J0IHsgc3FsaXRlZGJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYic7XG5pbXBvcnQgdHlwZSB7IFVzZXJSb3cgfSBmcm9tICcuLi9zZXJ2aWNlL2RhdGFiYXNlL3NxbGl0ZWRiJztcbmltcG9ydCB7IGF1dG9VcGRhdGVyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3MvYXV0b191cGRhdGVyJztcbmltcG9ydCB0eXBlIHsgQ29udGV4dCB9IGZyb20gJ2tvYSc7XG5cbi8qKlxuICogZnJhbWV3b3JrIC0gZGVtb1xuICogQGNsYXNzXG4gKi9cbmludGVyZmFjZSBTcWxpdGVkYk9wZXJhdGlvbkFyZ3Mge1xuICBhY3Rpb246IHN0cmluZztcbiAgaW5mbz86IHsgbmFtZTogc3RyaW5nOyBhZ2U6IG51bWJlciB9O1xuICBkZWxldGVfbmFtZT86IHN0cmluZztcbiAgdXBkYXRlX25hbWU/OiBzdHJpbmc7XG4gIHVwZGF0ZV9hZ2U/OiBudW1iZXI7XG4gIHNlYXJjaF9hZ2U/OiBudW1iZXI7XG4gIGRhdGFfZGlyPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgU3FsaXRlZGJPcGVyYXRpb25SZXN1bHQge1xuICBhY3Rpb246IHN0cmluZztcbiAgcmVzdWx0OiBib29sZWFuIHwgc3RyaW5nIHwgVXNlclJvd1tdIHwgbnVsbDtcbiAgYWxsX2xpc3Q6IFVzZXJSb3dbXTtcbiAgY29kZTogbnVtYmVyO1xufVxuXG5jbGFzcyBGcmFtZXdvcmtDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIFx1NjI0MFx1NjcwOVx1NjVCOVx1NkNENVx1NjNBNVx1NjUzNlx1NEUyNFx1NEUyQVx1NTNDMlx1NjU3MFxuICAgKiBAcGFyYW0gYXJncyBcdTUyNERcdTdBRUZcdTRGMjBcdTc2ODRcdTUzQzJcdTY1NzBcbiAgICogQHBhcmFtIGV2ZW50IC0gaXBjXHU5MDFBXHU0RkUxXHU2NUY2XHU2MjREXHU2NzA5XHU1MDNDXHUzMDAyXHU4QkU2XHU2MEM1XHU4OUMxXHVGRjFBXHU2M0E3XHU1MjM2XHU1NjY4XHU2NTg3XHU2ODYzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBzcWxpdGVcdTY1NzBcdTYzNkVcdTVFOTNcdTY0Q0RcdTRGNUNcbiAgICovICAgXG4gIGFzeW5jIHNxbGl0ZWRiT3BlcmF0aW9uKGFyZ3M6IFNxbGl0ZWRiT3BlcmF0aW9uQXJncyk6IFByb21pc2U8U3FsaXRlZGJPcGVyYXRpb25SZXN1bHQ+IHtcbiAgICBjb25zdCB7IGFjdGlvbiwgaW5mbywgZGVsZXRlX25hbWUsIHVwZGF0ZV9uYW1lLCB1cGRhdGVfYWdlLCBzZWFyY2hfYWdlLCBkYXRhX2RpciB9ID0gYXJncztcblxuICAgIGNvbnN0IGRhdGE6IFNxbGl0ZWRiT3BlcmF0aW9uUmVzdWx0ID0ge1xuICAgICAgYWN0aW9uLFxuICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgYWxsX2xpc3Q6IFtdLFxuICAgICAgY29kZTogMFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgLy8gdGVzdFxuICAgICAgc3FsaXRlZGJTZXJ2aWNlLmdldERhdGFEaXIoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICBkYXRhLmNvZGUgPSAtMTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdhZGQnIDpcbiAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5hZGRUZXN0RGF0YVNxbGl0ZShpbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2RlbCcgOlxuICAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5kZWxUZXN0RGF0YVNxbGl0ZShkZWxldGVfbmFtZSk7O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VwZGF0ZScgOlxuICAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS51cGRhdGVUZXN0RGF0YVNxbGl0ZSh1cGRhdGVfbmFtZSwgdXBkYXRlX2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ2V0JyA6XG4gICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmdldFRlc3REYXRhU3FsaXRlKHNlYXJjaF9hZ2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dldERhdGFEaXInIDpcbiAgICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZ2V0RGF0YURpcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NldERhdGFEaXInIDpcbiAgICAgICAgaWYgKGRhdGFfZGlyKSB7XG4gICAgICAgICAgYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLnNldEN1c3RvbURhdGFEaXIoZGF0YV9kaXIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrOyAgICAgICAgICAgIFxuICAgIH1cblxuICAgIGRhdGEuYWxsX2xpc3QgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZ2V0QWxsVGVzdERhdGFTcWxpdGUoKTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9ICBcblxuICAvKipcbiAgICogXHU4QzAzXHU3NTI4XHU1MTc2XHU1QjgzXHU3QTBCXHU1RThGXHVGRjA4ZXhlXHUzMDAxYmFzaFx1N0I0OVx1NTNFRlx1NjI2N1x1ODg0Q1x1N0EwQlx1NUU4Rlx1RkYwOVxuICAgKiBcbiAgICovXG4gIG9wZW5Tb2Z0d2FyZShhcmdzOiB7IHNvZnROYW1lOiBzdHJpbmcgfSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgc29mdE5hbWUgfSA9IGFyZ3M7XG4gICAgY29uc3Qgc29mdHdhcmVQYXRoID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksIHNvZnROYW1lKTtcbiAgICBsb2dnZXIuaW5mbygnW29wZW5Tb2Z0d2FyZV0gc29mdHdhcmVQYXRoOicsIHNvZnR3YXJlUGF0aCk7XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTdBMEJcdTVFOEZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc29mdHdhcmVQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBcdTU0N0RcdTRFRTRcdTg4NENcdTVCNTdcdTdCMjZcdTRFMzIgXHU1RTc2IFx1NjI2N1x1ODg0Qywgc3RhcnQgXHU1NDdEXHU0RUU0XHU1NDBFXHU5NzYyXHU3Njg0XHU4REVGXHU1Rjg0XHU4OTgxXHU1MkEwXHU1M0NDXHU1RjE1XHU1M0Y3XG4gICAgY29uc3QgY21kU3RyID0gYHN0YXJ0IFwiJHtzb2Z0d2FyZVBhdGh9XCJgO1xuICAgIGV4ZWMoY21kU3RyKTtcblxuICAgIC8vIFx1NjVCOVx1NkNENVx1NEU4Q1xuICAgIC8vIFx1NEY3Rlx1NzUyOGNyb3NzXHU2QTIxXHU1NzU3XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIFx1NjhDMFx1NkQ0Qmh0dHBcdTY3MERcdTUyQTFcdTY2MkZcdTU0MjZcdTVGMDBcdTU0MkZcbiAgICovIFxuICBhc3luYyBjaGVja0h0dHBTZXJ2ZXIoKTogUHJvbWlzZTx7IGVuYWJsZTogYm9vbGVhbjsgc2VydmVyOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IHsgZW5hYmxlLCBwcm90b2NvbCwgaG9zdCwgcG9ydCB9ID0gKGdldENvbmZpZygpIGFzIENvbmZpZykuaHR0cFNlcnZlcjtcbiAgICBjb25zdCB1cmwgPSBwcm90b2NvbCArIGhvc3QgKyAnOicgKyBwb3J0O1xuICAgIGNvbnNvbGUubG9nKCdbY2hlY2tIdHRwU2VydmVyXSB1cmw6JywgdXJsKTtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgZW5hYmxlOiBlbmFibGUsXG4gICAgICBzZXJ2ZXI6IHVybFxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFMDBcdTRFMkEgaHR0cCBcdThCRjdcdTZDNDJcbiAgICogYXJncyBcdTY2MkYgXHU1MjREXHU3QUVGXHU0RjIwXHU3Njg0XHU1M0MyXHU2NTcwXG4gICAqIGN0eCBcdTY2MkYga29hIFx1NzY4NCBjdHggXHU1QkY5XHU4QzYxXG4gICAqL1xuICBhc3luYyBkb0h0dHBSZXF1ZXN0KGFyZ3M6IHsgaWQ6IHN0cmluZyB9LCBjdHg6IENvbnRleHQgJiB7IHJlcXVlc3Q6IHsgYm9keT86IHVua25vd24gfSB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaHR0cEluZm8gPSB7XG4gICAgICBhcmdzLFxuICAgICAgbWV0aG9kOiBjdHgucmVxdWVzdC5tZXRob2QsXG4gICAgICBxdWVyeTogY3R4LnJlcXVlc3QucXVlcnksXG4gICAgICBib2R5OiBjdHgucmVxdWVzdC5ib2R5XG4gICAgfVxuICAgIGxvZ2dlci5pbmZvKCdodHRwSW5mbzonLCBodHRwSW5mbyk7XG5cbiAgICBjb25zdCB7IGlkIH0gPSBhcmdzO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZGlyID0gZWxlY3Ryb25BcHAuZ2V0UGF0aChpZCBhcyBQYXJhbWV0ZXJzPHR5cGVvZiBlbGVjdHJvbkFwcC5nZXRQYXRoPlswXSk7XG4gICAgc2hlbGwub3BlblBhdGgoZGlyKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NEUwMFx1NEUyQXNvY2tldCBpb1x1OEJGN1x1NkM0Mlx1OEJCRlx1OTVFRVx1NkI2NFx1NjVCOVx1NkNENVxuICAgKi9cbiAgYXN5bmMgZG9Tb2NrZXRSZXF1ZXN0KGFyZ3M6IHsgaWQ6IHN0cmluZyB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGRpciA9IGVsZWN0cm9uQXBwLmdldFBhdGgoaWQgYXMgUGFyYW1ldGVyczx0eXBlb2YgZWxlY3Ryb25BcHAuZ2V0UGF0aD5bMF0pO1xuICAgIHNoZWxsLm9wZW5QYXRoKGRpcik7XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBcdTVGMDJcdTZCNjVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcbiAgICovIFxuICBhc3luYyBpcGNJbnZva2VNc2coYXJnczogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgdGltZU5vdyA9IGRheWpzKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG4gICAgY29uc3QgZGF0YSA9IGFyZ3MgKyAnIC0gJyArIHRpbWVOb3c7XG4gICAgXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdTU0MENcdTZCNjVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcbiAgICovIFxuICBhc3luYyBpcGNTZW5kU3luY01zZyhhcmdzOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCB0aW1lTm93ID0gZGF5anMoKS5mb3JtYXQoJ1lZWVktTU0tREQgSEg6bW06c3MnKTtcbiAgICBjb25zdCBkYXRhID0gYXJncyArICcgLSAnICsgdGltZU5vdztcbiAgICBcbiAgICByZXR1cm4gZGF0YTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIFx1NTNDQ1x1NTQxMVx1NUYwMlx1NkI2NVx1OTAxQVx1NEZFMVxuICAgKi9cbiAgaXBjU2VuZE1zZyhhcmdzOiB7IHR5cGU6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgdHlwZSwgY29udGVudCB9ID0gYXJncztcbiAgICBjb25zdCBkYXRhID0gZnJhbWV3b3JrU2VydmljZS5ib3RoV2F5TWVzc2FnZSh0eXBlLCBjb250ZW50LCBldmVudCk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFRkJcdTUyQTFcbiAgICovXG4gIHNvbWVKb2IoYXJnczogeyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZyB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogeyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZzsgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCB9IHtcbiAgICBjb25zdCB7IGpvYklkLCBhY3Rpb259ID0gYXJncztcbiAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICByZXN1bHQgPSBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7ICAgICAgIFxuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwYXVzZSc6XG4gICAgICAgIGZyYW1ld29ya1NlcnZpY2UuZG9Kb2Ioam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhazsgIFxuICAgICAgY2FzZSAncmVzdW1lJzpcbiAgICAgICAgZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrOyAgIFxuICAgICAgZGVmYXVsdDogIFxuICAgIH1cbiAgICBcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIGpvYklkLFxuICAgICAgYWN0aW9uLFxuICAgICAgcmVzdWx0XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIxQlx1NUVGQVx1NEVGQlx1NTJBMVx1NkM2MFxuICAgKi8gXG4gIGFzeW5jIGNyZWF0ZVBvb2woYXJnczogeyBudW1iZXI6IG51bWJlciB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IG51bSA9IGFyZ3MubnVtYmVyO1xuICAgIGZyYW1ld29ya1NlcnZpY2UuZG9DcmVhdGVQb29sKG51bSwgZXZlbnQpO1xuXG4gICAgLy8gdGVzdCBtb25pdG9yXG4gICAgZnJhbWV3b3JrU2VydmljZS5tb25pdG9ySm9iKCk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogXHU5MDFBXHU4RkM3XHU4RkRCXHU3QTBCXHU2QzYwXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXG4gICAqL1xuICBhc3luYyBzb21lSm9iQnlQb29sKGFyZ3M6IHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmcgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IFByb21pc2U8eyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZzsgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9PiB7XG4gICAgY29uc3QgeyBqb2JJZCwgYWN0aW9uIH0gPSBhcmdzO1xuICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ3J1bic6XG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IGZyYW1ld29ya1NlcnZpY2UuZG9Kb2JCeVBvb2woam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICBqb2JJZCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDlcdTY1QjBcdTcyNDhcdTY3MkNcbiAgICovXG4gIGNoZWNrRm9yVXBkYXRlcigpOiB2b2lkIHsgXG4gICAgYXV0b1VwZGF0ZXJTZXJ2aWNlLmNoZWNrVXBkYXRlKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NEUwQlx1OEY3RFx1NjVCMFx1NzI0OFx1NjcyQ1xuICAgKi9cbiAgZG93bmxvYWRBcHAoKTogdm9pZCB7XG4gICAgYXV0b1VwZGF0ZXJTZXJ2aWNlLmRvd25sb2FkKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NkQ0Qlx1OEJENVx1NjNBNVx1NTNFM1xuICAgKi8gXG4gIGhlbGxvKGFyZ3M6IHVua25vd24pOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnaGVsbG8gJywgYXJncyk7XG4gIH0gICBcbn1cbmV4cG9ydCBkZWZhdWx0IEZyYW1ld29ya0NvbnRyb2xsZXI7XG4iLCAiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBCcm93c2VyV2luZG93LCBCcm93c2VyV2luZG93Q29uc3RydWN0b3JPcHRpb25zLCBOb3RpZmljYXRpb24sIE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucywgSXBjTWFpbkV2ZW50LCBFdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcbmltcG9ydCB7IGlzRGV2LCBpc1Byb2QsIGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2VlLWNvcmUvY29uZmlnJztcbmltcG9ydCB7IGlzRmlsZVByb3RvY29sIH0gZnJvbSAnZWUtY29yZS91dGlscyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIFdpbmRvd1xuICogQGNsYXNzXG4gKi9cbmludGVyZmFjZSBDcmVhdGVXaW5kb3dBcmdzIHtcbiAgdHlwZTogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHdpbmRvd05hbWU6IHN0cmluZztcbiAgd2luZG93VGl0bGU6IHN0cmluZztcbn1cblxuY2xhc3MgV2luZG93U2VydmljZSB7XG4gIHByaXZhdGUgbXlOb3RpZmljYXRpb246IE5vdGlmaWNhdGlvbiB8IG51bGw7XG4gIHByaXZhdGUgd2luZG93czogUmVjb3JkPHN0cmluZywgQnJvd3NlcldpbmRvdz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5teU5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgdGhpcy53aW5kb3dzID0ge31cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgd2luZG93XG4gICAqL1xuICBjcmVhdGVXaW5kb3coYXJnczogQ3JlYXRlV2luZG93QXJncyk6IG51bWJlciB7XG4gICAgY29uc3QgeyB0eXBlLCBjb250ZW50LCB3aW5kb3dOYW1lLCB3aW5kb3dUaXRsZSB9ID0gYXJncztcbiAgICBsZXQgY29udGVudFVybDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKHR5cGUgPT0gJ2h0bWwnKSB7XG4gICAgICBjb250ZW50VXJsID0gcGF0aC5qb2luKCdmaWxlOi8vJywgZ2V0QmFzZURpcigpLCBjb250ZW50KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnd2ViJykge1xuICAgICAgY29udGVudFVybCA9IGNvbnRlbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlID09ICd2dWUnKSB7XG4gICAgICBsZXQgYWRkciA9ICdodHRwOi8vbG9jYWxob3N0OjgwODAnXG4gICAgICBpZiAoaXNQcm9kKCkpIHtcbiAgICAgICAgY29uc3QgbWFpblNlcnZlciA9IGdldENvbmZpZygpLm1haW5TZXJ2ZXIgYXMgQ29uZmlnWydtYWluU2VydmVyJ10gJiB7IGhvc3Q/OiBzdHJpbmc7IHBvcnQ/OiBudW1iZXIgfTtcbiAgICAgICAgaWYgKGlzRmlsZVByb3RvY29sKG1haW5TZXJ2ZXIucHJvdG9jb2wpKSB7XG4gICAgICAgICAgYWRkciA9IG1haW5TZXJ2ZXIucHJvdG9jb2wgKyBwYXRoLmpvaW4oZ2V0QmFzZURpcigpLCBtYWluU2VydmVyLmluZGV4UGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkciA9IG1haW5TZXJ2ZXIucHJvdG9jb2wgKyAobWFpblNlcnZlci5ob3N0ID8/ICcnKSArIChtYWluU2VydmVyLnBvcnQgPyAnOicgKyBtYWluU2VydmVyLnBvcnQgOiAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29udGVudFVybCA9IGFkZHIgKyBjb250ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzb21lXG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oJ1tjcmVhdGVXaW5kb3ddIHVybDogJywgY29udGVudFVybCk7XG4gICAgY29uc3Qgb3B0OiBCcm93c2VyV2luZG93Q29uc3RydWN0b3JPcHRpb25zID0ge1xuICAgICAgdGl0bGU6IHdpbmRvd1RpdGxlLFxuICAgICAgeDogMTAsXG4gICAgICB5OiAxMCxcbiAgICAgIHdpZHRoOiA5ODAsIFxuICAgICAgaGVpZ2h0OiA2NTAsXG4gICAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgICBjb250ZXh0SXNvbGF0aW9uOiBmYWxzZSxcbiAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3Qgd2luID0gbmV3IEJyb3dzZXJXaW5kb3cob3B0KTtcbiAgICBjb25zdCB3aW5Db250ZW50c0lkID0gd2luLndlYkNvbnRlbnRzLmlkO1xuICAgIGlmIChjb250ZW50VXJsKSB7XG4gICAgICB3aW4ubG9hZFVSTChjb250ZW50VXJsKTtcbiAgICB9XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKTtcbiAgICB9XG5cbiAgICB0aGlzLndpbmRvd3Nbd2luZG93TmFtZV0gPSB3aW47XG5cbiAgICByZXR1cm4gd2luQ29udGVudHNJZDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCB3aW5kb3cgY29udGVudHMgaWRcbiAgICovXG4gIGdldFdDaWQoYXJnczogeyB3aW5kb3dOYW1lOiBzdHJpbmcgfSk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IHsgd2luZG93TmFtZSB9ID0gYXJncztcbiAgICBsZXQgd2luOiBCcm93c2VyV2luZG93IHwgbnVsbDtcbiAgICBpZiAod2luZG93TmFtZSA9PSAnbWFpbicpIHtcbiAgICAgIHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luID0gdGhpcy53aW5kb3dzW3dpbmRvd05hbWVdO1xuICAgIH1cbiAgICBpZiAoIXdpbikgcmV0dXJuIG51bGw7XG4gICAgXG4gICAgcmV0dXJuIHdpbi53ZWJDb250ZW50cy5pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFsaXplIGNvbW11bmljYXRpb24gYmV0d2VlbiB0d28gd2luZG93cyB0aHJvdWdoIHRoZSB0cmFuc2ZlciBvZiB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICBjb21tdW5pY2F0ZShhcmdzOiB7IHJlY2VpdmVyOiBzdHJpbmc7IGNvbnRlbnQ6IHVua25vd24gfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVjZWl2ZXIsIGNvbnRlbnQgfSA9IGFyZ3M7XG4gICAgaWYgKHJlY2VpdmVyID09ICdtYWluJykge1xuICAgICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgICAgaWYgKCF3aW4pIHJldHVybjtcbiAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKCdjb250cm9sbGVyL29zL3dpbmRvdzJUb1dpbmRvdzEnLCBjb250ZW50KTtcbiAgICB9IGVsc2UgaWYgKHJlY2VpdmVyID09ICd3aW5kb3cyJykge1xuICAgICAgY29uc3Qgd2luID0gdGhpcy53aW5kb3dzW3JlY2VpdmVyXTtcbiAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKCdjb250cm9sbGVyL29zL3dpbmRvdzFUb1dpbmRvdzInLCBjb250ZW50KTtcbiAgICB9XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBjcmVhdGVOb3RpZmljYXRpb25cbiAgICovXG4gIGNyZWF0ZU5vdGlmaWNhdGlvbihvcHRpb25zOiBOb3RpZmljYXRpb25Db25zdHJ1Y3Rvck9wdGlvbnMgJiB7IGNsaWNrRXZlbnQ/OiBib29sZWFuOyBjbG9zZUV2ZW50PzogYm9vbGVhbiB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL29zL3NlbmROb3RpZmljYXRpb24nO1xuICAgIHRoaXMubXlOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnMuY2xpY2tFdmVudCkge1xuICAgICAgdGhpcy5teU5vdGlmaWNhdGlvbi5vbignY2xpY2snLCAoX2U6IEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgdHlwZTogJ2NsaWNrJyxcbiAgICAgICAgICBtc2c6ICdcdTYwQThcdTcwQjlcdTUxRkJcdTRFODZcdTkwMUFcdTc3RTVcdTZEODhcdTYwNkYnXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuY2xvc2VFdmVudCkge1xuICAgICAgdGhpcy5teU5vdGlmaWNhdGlvbi5vbignY2xvc2UnLCAoX2U6IEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICBtc2c6ICdcdTYwQThcdTUxNzNcdTk1RURcdTRFODZcdTkwMUFcdTc3RTVcdTZEODhcdTYwNkYnXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5teU5vdGlmaWNhdGlvbi5zaG93KCk7XG4gIH1cblxufVxuZXhwb3J0IGNvbnN0IHdpbmRvd1NlcnZpY2UgPSBuZXcgV2luZG93U2VydmljZSgpOyAgXG4iLCAiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtcbiAgYXBwIGFzIGVsZWN0cm9uQXBwLCBkaWFsb2csIHNoZWxsLCBOb3RpZmljYXRpb24sIElwY01haW5FdmVudCxcbiAgTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zLFxufSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyB3aW5kb3dTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy93aW5kb3cnO1xuXG4vKipcbiAqIGV4YW1wbGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBPc0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogQWxsIG1ldGhvZHMgcmVjZWl2ZSB0d28gcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0gYXJncyBQYXJhbWV0ZXJzIHRyYW5zbWl0dGVkIGJ5IHRoZSBmcm9udGVuZFxuICAgKiBAcGFyYW0gZXZlbnQgLSBFdmVudCBhcmUgb25seSBhdmFpbGFibGUgZHVyaW5nIElQQyBjb21tdW5pY2F0aW9uLiBGb3IgZGV0YWlscywgcGxlYXNlIHJlZmVyIHRvIHRoZSBjb250cm9sbGVyIGRvY3VtZW50YXRpb25cbiAgICovXG5cbiAgLyoqXG4gICAqIE1lc3NhZ2UgcHJvbXB0IGRpYWxvZyBib3hcbiAgICovXG4gIG1lc3NhZ2VTaG93KCk6IHN0cmluZyB7XG4gICAgZGlhbG9nLnNob3dNZXNzYWdlQm94U3luYyh7XG4gICAgICB0eXBlOiAnaW5mbycsIC8vIFwibm9uZVwiLCBcImluZm9cIiwgXCJlcnJvclwiLCBcInF1ZXN0aW9uXCIgXHU2MjE2XHU4MDA1IFwid2FybmluZ1wiXG4gICAgICB0aXRsZTogJ0N1c3RvbSBUaXRsZScsXG4gICAgICBtZXNzYWdlOiAnQ3VzdG9taXplIG1lc3NhZ2UgY29udGVudCcsXG4gICAgICBkZXRhaWw6ICdPdGhlciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uJ1xuICAgIH0pXG4gIFxuICAgIHJldHVybiAnT3BlbmVkIHRoZSBtZXNzYWdlIGJveCc7XG4gIH1cblxuICAvKipcbiAgICogTWVzc2FnZSBwcm9tcHQgYW5kIGNvbmZpcm1hdGlvbiBkaWFsb2cgYm94XG4gICAqL1xuICBtZXNzYWdlU2hvd0NvbmZpcm0oKTogc3RyaW5nIHtcbiAgICBjb25zdCByZXMgPSBkaWFsb2cuc2hvd01lc3NhZ2VCb3hTeW5jKHtcbiAgICAgIHR5cGU6ICdpbmZvJyxcbiAgICAgIHRpdGxlOiAnQ3VzdG9tIFRpdGxlJyxcbiAgICAgIG1lc3NhZ2U6ICdDdXN0b21pemUgbWVzc2FnZSBjb250ZW50JyxcbiAgICAgIGRldGFpbDogJ090aGVyIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24nLFxuICAgICAgY2FuY2VsSWQ6IDEsIC8vIEluZGV4IG9mIGJ1dHRvbnMgdXNlZCB0byBjYW5jZWwgZGlhbG9nIGJveGVzXG4gICAgICBkZWZhdWx0SWQ6IDAsIC8vIFNldCBkZWZhdWx0IHNlbGVjdGVkIGJ1dHRvblxuICAgICAgYnV0dG9uczogWydjb25maXJtJywgJ2NhbmNlbCddLCBcbiAgICB9KVxuICAgIGxldCBkYXRhID0gKHJlcyA9PT0gMCkgPyAnY2xpY2sgdGhlIGNvbmZpcm0gYnV0dG9uJyA6ICdjbGljayB0aGUgY2FuY2VsIGJ1dHRvbic7XG4gIFxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBEaXJlY3RvcnlcbiAgICovXG4gIHNlbGVjdEZvbGRlcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeScsICdjcmVhdGVEaXJlY3RvcnknXVxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVQYXRoc1swXTtcbiAgfSBcblxuICAvKipcbiAgICogb3BlbiBkaXJlY3RvcnlcbiAgICovXG4gIG9wZW5EaXJlY3RvcnkoYXJnczogeyBpZDogc3RyaW5nIH0pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGlkIH0gPSBhcmdzO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGRpciA9ICcnO1xuICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoaWQpKSB7XG4gICAgICBkaXIgPSBpZDtcbiAgICB9IGVsc2Uge1xuICAgIGRpciA9IGVsZWN0cm9uQXBwLmdldFBhdGgoaWQgYXMgUGFyYW1ldGVyczx0eXBlb2YgZWxlY3Ryb25BcHAuZ2V0UGF0aD5bMF0pO1xuICAgIH1cblxuICAgIHNoZWxsLm9wZW5QYXRoKGRpcik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IFBpY3R1cmVcbiAgICovXG4gIHNlbGVjdFBpYygpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHRpdGxlOiAnc2VsZWN0IHBpYycsXG4gICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJ10sXG4gICAgICBmaWx0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ0ltYWdlcycsIGV4dGVuc2lvbnM6IFsnanBnJywgJ3BuZycsICdnaWYnXSB9LFxuICAgICAgXVxuICAgIH0pO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aHNbMF0pO1xuICAgICAgY29uc3QgcGljID0gICdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcgKyBkYXRhLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgIHJldHVybiBwaWM7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0gICBcblxuICAvKipcbiAgICogT3BlbiBhIG5ldyB3aW5kb3dcbiAgICovXG4gIGNyZWF0ZVdpbmRvdyhhcmdzOiB7IHR5cGU6IHN0cmluZzsgY29udGVudDogc3RyaW5nOyB3aW5kb3dOYW1lOiBzdHJpbmc7IHdpbmRvd1RpdGxlOiBzdHJpbmcgfSk6IG51bWJlciB7XG4gICAgY29uc3Qgd2NpZCA9IHdpbmRvd1NlcnZpY2UuY3JlYXRlV2luZG93KGFyZ3MpO1xuICAgIHJldHVybiB3Y2lkO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IFdpbmRvdyBjb250ZW50cyBpZFxuICAgKi9cbiAgZ2V0V0NpZChhcmdzOiB7IHdpbmRvd05hbWU6IHN0cmluZyB9KTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3Qgd2NpZCA9IHdpbmRvd1NlcnZpY2UuZ2V0V0NpZChhcmdzKTtcbiAgICByZXR1cm4gd2NpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFsaXplIGNvbW11bmljYXRpb24gYmV0d2VlbiB0d28gd2luZG93cyB0aHJvdWdoIHRoZSB0cmFuc2ZlciBvZiB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICB3aW5kb3cxVG9XaW5kb3cyKGFyZ3M6IHsgcmVjZWl2ZXI6IHN0cmluZzsgY29udGVudDogdW5rbm93biB9LCBfZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIHdpbmRvd1NlcnZpY2UuY29tbXVuaWNhdGUoYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWxpemUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHR3byB3aW5kb3dzIHRocm91Z2ggdGhlIHRyYW5zZmVyIG9mIHRoZSBtYWluIHByb2Nlc3NcbiAgICovXG4gIHdpbmRvdzJUb1dpbmRvdzEoYXJnczogeyByZWNlaXZlcjogc3RyaW5nOyBjb250ZW50OiB1bmtub3duIH0sIF9ldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgd2luZG93U2VydmljZS5jb21tdW5pY2F0ZShhcmdzKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHN5c3RlbSBub3RpZmljYXRpb25zXG4gICAqL1xuICBzZW5kTm90aWZpY2F0aW9uKGFyZ3M6IHsgdGl0bGU/OiBzdHJpbmc7IHN1YnRpdGxlPzogc3RyaW5nOyBib2R5Pzogc3RyaW5nOyBzaWxlbnQ/OiBib29sZWFuIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBib29sZWFuIHwgc3RyaW5nIHtcbiAgICBjb25zdCB7IHRpdGxlLCBzdWJ0aXRsZSwgYm9keSwgc2lsZW50fSA9IGFyZ3M7XG5cbiAgICBpZiAoIU5vdGlmaWNhdGlvbi5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICByZXR1cm4gJ1x1NUY1M1x1NTI0RFx1N0NGQlx1N0VERlx1NEUwRFx1NjUyRlx1NjMwMVx1OTAxQVx1NzdFNSc7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9uczogTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zID0ge307XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvcHRpb25zLnRpdGxlID0gdGl0bGU7XG4gICAgfVxuICAgIGlmIChzdWJ0aXRsZSkge1xuICAgICAgb3B0aW9ucy5zdWJ0aXRsZSA9IHN1YnRpdGxlO1xuICAgIH1cbiAgICBpZiAoYm9keSkge1xuICAgICAgb3B0aW9ucy5ib2R5ID0gYm9keTtcbiAgICB9XG4gICAgaWYgKHNpbGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLnNpbGVudCA9IHNpbGVudDtcbiAgICB9XG4gICAgd2luZG93U2VydmljZS5jcmVhdGVOb3RpZmljYXRpb24ob3B0aW9ucywgZXZlbnQpO1xuXG4gICAgcmV0dXJuIHRydWVcbiAgfSAgIFxufVxuZXhwb3J0IGRlZmF1bHQgT3NDb250cm9sbGVyO1xuIiwgIi8vIEF1dG8tZ2VuZXJhdGVkIGNvbnRyb2xsZXIgcmVnaXN0cnkgLSBkbyBub3QgZWRpdFxuZ2xvYmFsLl9fRUVfQ09OVFJPTExFUl9SRUdJU1RSWV9fID0gW1xuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvY3Jvc3MudHNcIiwgcHJvcGVydGllczogW1wiY3Jvc3NcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jcm9zcy50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvZWZmZWN0LnRzXCIsIHByb3BlcnRpZXM6IFtcImVmZmVjdFwiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2VmZmVjdC50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvZXhhbXBsZS50c1wiLCBwcm9wZXJ0aWVzOiBbXCJleGFtcGxlXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vZXhhbXBsZS50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvZnJhbWV3b3JrLnRzXCIsIHByb3BlcnRpZXM6IFtcImZyYW1ld29ya1wiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2ZyYW1ld29yay50c1wiKTsgfSB9LFxuICB7IGZ1bGxwYXRoOiBcImNvbnRyb2xsZXIvb3MudHNcIiwgcHJvcGVydGllczogW1wib3NcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9vcy50c1wiKTsgfSB9XG5dOyIsICJpbXBvcnQgeyBhcHAgYXMgZWxlY3Ryb25BcHAsIHNjcmVlbiB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2VlLWNvcmUvY29uZmlnJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuY2xhc3MgTGlmZWN5Y2xlIHtcbiAgLyoqXG4gICAqIGNvcmUgYXBwIGhhdmUgYmVlbiBsb2FkZWRcbiAgICovXG4gIGFzeW5jIHJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSByZWFkeScpO1xuICB9XG5cbiAgLyoqXG4gICAqIGVsZWN0cm9uIGFwcCByZWFkeVxuICAgKi9cbiAgYXN5bmMgZWxlY3Ryb25BcHBSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbygnW2xpZmVjeWNsZV0gZWxlY3Ryb24tYXBwLXJlYWR5Jyk7XG5cbiAgICAvLyBXaGVuIGRvdWJsZSBjbGlja2luZyB0aGUgaWNvbiwgZGlzcGxheSB0aGUgb3BlbmVkIHdpbmRvd1xuICAgIGVsZWN0cm9uQXBwLm9uKCdzZWNvbmQtaW5zdGFuY2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgICBpZiAoIXdpbikgcmV0dXJuO1xuICAgICAgaWYgKHdpbi5pc01pbmltaXplZCgpKSB7XG4gICAgICAgIHdpbi5yZXN0b3JlKCk7XG4gICAgICB9XG4gICAgICB3aW4uc2hvdygpO1xuICAgICAgd2luLmZvY3VzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogbWFpbiB3aW5kb3cgaGF2ZSBiZWVuIGxvYWRlZFxuICAgKi9cbiAgYXN5bmMgd2luZG93UmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIHdpbmRvdy1yZWFkeScpO1xuXG4gICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgIGlmICghd2luKSByZXR1cm47XG5cbiAgICAvLyBUaGUgd2luZG93IGlzIGNlbnRlcmVkIGFuZCBzY2FsZWQgcHJvcG9ydGlvbmFsbHlcbiAgICAvLyBPYnRhaW4gdGhlIHNpemUgaW5mb3JtYXRpb24gb2YgdGhlIG1haW4gc2NyZWVuLCBjYWxjdWxhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHdpbmRvdyBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHNjcmVlbixcbiAgICAvLyBhbmQgY2FsY3VsYXRlIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgdXBwZXIgbGVmdCBjb3JuZXIgd2hlbiB0aGUgd2luZG93IGlzIGNlbnRlcmVkXG4gICAgY29uc3QgbWFpblNjcmVlbiA9IHNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpO1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gbWFpblNjcmVlbi53b3JrQXJlYVNpemU7XG4gICAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLmZsb29yKHdpZHRoICogMC42KTtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIDAuNyk7XG4gICAgY29uc3QgeCA9IE1hdGguZmxvb3IoKHdpZHRoIC0gd2luZG93V2lkdGgpIC8gMik7XG4gICAgY29uc3QgeSA9IE1hdGguZmxvb3IoKGhlaWdodCAtIHdpbmRvd0hlaWdodCkgLyAyKTtcbiAgICB3aW4uc2V0Qm91bmRzKHsgeCwgeSwgd2lkdGg6IHdpbmRvd1dpZHRoLCBoZWlnaHQ6IHdpbmRvd0hlaWdodCB9KVxuXG4gICAgLy8gRGVsYXllZCBsb2FkaW5nLCBubyB3aGl0ZSBzY3JlZW5cbiAgICBjb25zdCB7IHdpbmRvd3NPcHRpb24gfSA9IGdldENvbmZpZygpO1xuICAgIGlmICh3aW5kb3dzT3B0aW9uLnNob3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbi5vbmNlKCdyZWFkeS10by1zaG93JywgKCkgPT4ge1xuICAgICAgICB3aW4uc2hvdygpO1xuICAgICAgICB3aW4uZm9jdXMoKTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGJlZm9yZSBhcHAgY2xvc2VcbiAgICovICBcbiAgYXN5bmMgYmVmb3JlQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIGJlZm9yZS1jbG9zZScpO1xuICB9XG59XG5leHBvcnQge1xuICBMaWZlY3ljbGVcbn07XG4iLCAiaW1wb3J0IHsgVHJheSwgTWVudSwgYXBwIGFzIGVsZWN0cm9uQXBwLCBCcm93c2VyV2luZG93LCBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9ucywgRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3csIGdldENsb3NlQW5kUXVpdCwgc2V0Q2xvc2VBbmRRdWl0IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbi8qKlxuICogXHU2MjU4XHU3NkQ4XG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgVHJheVNlcnZpY2Uge1xuICBwcml2YXRlIHRyYXk6IFRyYXkgfCBudWxsO1xuICBwcml2YXRlIGNvbmZpZzogeyB0aXRsZTogc3RyaW5nOyBpY29uOiBzdHJpbmcgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRyYXkgPSBudWxsO1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgdGl0bGU6ICdlbGVjdHJvbi1lZ2cnLFxuICAgICAgaWNvbjogJy9wdWJsaWMvaW1hZ2VzL3RyYXkucG5nJ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcdTYyNThcdTc2RDhcbiAgICovXG4gIGNyZWF0ZSAoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ1t0cmF5XSBsb2FkJyk7XG5cbiAgICBjb25zdCBjZmcgPSB0aGlzLmNvbmZpZztcbiAgICBjb25zdCBtYWluV2luZG93ID0gZ2V0TWFpbldpbmRvdygpO1xuICAgIGlmICghbWFpbldpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gdHJheSBpY29uXG4gICAgY29uc3QgaWNvblBhdGggPSBwYXRoLmpvaW4oZ2V0QmFzZURpcigpLCBjZmcuaWNvbik7XG5cbiAgICAvLyBcdTYyNThcdTc2RDhcdTgzRENcdTUzNTVcdTUyOUZcdTgwRkRcdTUyMTdcdTg4NjhcbiAgICBjb25zdCB0cmF5TWVudVRlbXBsYXRlOiBNZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9uc1tdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1x1NjYzRVx1NzkzQScsXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbWFpbldpbmRvdy5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnXHU5MDAwXHU1MUZBJyxcbiAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdXG5cbiAgICAvLyBcdThCQkVcdTdGNkVcdTRFMDBcdTRFMkFcdTY4MDdcdThCQzZcdUZGMENcdTcwQjlcdTUxRkJcdTUxNzNcdTk1RURcdUZGMENcdTY3MDBcdTVDMEZcdTUzMTZcdTUyMzBcdTYyNThcdTc2RDhcbiAgICBzZXRDbG9zZUFuZFF1aXQoZmFsc2UpO1xuICAgIG1haW5XaW5kb3cub24oJ2Nsb3NlJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgaWYgKGdldENsb3NlQW5kUXVpdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG1haW5XaW5kb3cuaGlkZSgpO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NUI5RVx1NEY4Qlx1NTMxNlx1NjI1OFx1NzZEOFxuICAgIHRoaXMudHJheSA9IG5ldyBUcmF5KGljb25QYXRoKTtcbiAgICB0aGlzLnRyYXkuc2V0VG9vbFRpcChjZmcudGl0bGUpO1xuICAgIGNvbnN0IGNvbnRleHRNZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZSh0cmF5TWVudVRlbXBsYXRlKTtcbiAgICB0aGlzLnRyYXkuc2V0Q29udGV4dE1lbnUoY29udGV4dE1lbnUpO1xuICAgIC8vIFx1NURFNlx1OTUyRVx1NTM1NVx1NTFGQlx1NzY4NFx1NjVGNlx1NTAxOVx1ODBGRFx1NTkxRlx1NjYzRVx1NzkzQVx1NEUzQlx1N0E5N1x1NTNFM1xuICAgIHRoaXMudHJheS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICBtYWluV2luZG93LnNob3coKVxuICAgIH0pXG4gIH1cbn1cbmV4cG9ydCBjb25zdCB0cmF5U2VydmljZSA9IG5ldyBUcmF5U2VydmljZSgpO1xuIiwgImltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCB9IGZyb20gJ2VsZWN0cm9uJztcblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXG4gICAqL1xuICBjcmVhdGUgKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbc2VjdXJpdHldIGxvYWQnKTtcbiAgICBjb25zdCBydW5XaXRoRGVidWcgPSBwcm9jZXNzLmFyZ3YuZmluZChmdW5jdGlvbihlOiBzdHJpbmcpe1xuICAgICAgbGV0IGlzSGFzRGVidWcgPSBlLmluY2x1ZGVzKFwiLS1pbnNwZWN0XCIpIHx8IGUuaW5jbHVkZXMoXCItLWluc3BlY3QtYnJrXCIpIHx8IGUuaW5jbHVkZXMoXCItLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydFwiKTtcbiAgICAgIHJldHVybiBpc0hhc0RlYnVnO1xuICAgIH0pXG5cbiAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMERcdTUxNDFcdThCQjhcdThGRENcdTdBMEJcdThDMDNcdThCRDVcbiAgICBpZiAocnVuV2l0aERlYnVnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZCcpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignW2Vycm9yXSBSZW1vdGUgZGVidWdnaW5nIGlzIG5vdCBhbGxvd2VkLCAgcnVuV2l0aERlYnVnOicsIHJ1bldpdGhEZWJ1Zyk7XG4gICAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XG4gICAgfVxuICB9XG59XG5leHBvcnQgY29uc3Qgc2VjdXJpdHlTZXJ2aWNlID0gbmV3IFNlY3VyaXR5U2VydmljZSgpO1xuIiwgIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiogcHJlbG9hZFx1NEUzQVx1OTg4NFx1NTJBMFx1OEY3RFx1NkEyMVx1NTc1N1x1RkYwQ1x1OEJFNVx1NjU4N1x1NEVGNlx1NUMwNlx1NEYxQVx1NTcyOFx1N0EwQlx1NUU4Rlx1NTQyRlx1NTJBOFx1NjVGNlx1NTJBMFx1OEY3RCAqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IHRyYXlTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy90cmF5JztcbmltcG9ydCB7IHNlY3VyaXR5U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3Mvc2VjdXJpdHknO1xuaW1wb3J0IHsgYXV0b1VwZGF0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy9hdXRvX3VwZGF0ZXInO1xuaW1wb3J0IHsgY3Jvc3NTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9jcm9zcyc7XG5pbXBvcnQgeyBzcWxpdGVkYlNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2RhdGFiYXNlL3NxbGl0ZWRiJztcblxuZXhwb3J0IGZ1bmN0aW9uIHByZWxvYWQoKTogdm9pZCB7XG4gIC8vIFx1NzkzQVx1NEY4Qlx1NTI5Rlx1ODBGRFx1NkEyMVx1NTc1N1x1RkYwQ1x1NTNFRlx1OTAwOVx1NjJFOVx1NjAyN1x1NEY3Rlx1NzUyOFx1NTQ4Q1x1NEZFRVx1NjUzOVxuICBsb2dnZXIuaW5mbygnW3ByZWxvYWRdIGxvYWQgNScpO1xuICB0cmF5U2VydmljZS5jcmVhdGUoKTtcbiAgc2VjdXJpdHlTZXJ2aWNlLmNyZWF0ZSgpO1xuICAvL2F1dG9VcGRhdGVyU2VydmljZS5jcmVhdGUoKTtcblxuICAvLyBnbyBzZXJ2ZXJcbiAgLy9jcm9zc1NlcnZpY2UuY3JlYXRlR29TZXJ2ZXIoKTtcblxuICAvLyBpbml0IHNxbGl0ZSBkYlxuICAvL3NxbGl0ZWRiU2VydmljZS5pbml0KCk7XG59XG5cblxuIiwgImltcG9ydCB7IEVsZWN0cm9uRWdnIH0gZnJvbSAnZWUtY29yZSc7XG5pbXBvcnQgeyBMaWZlY3ljbGUgfSBmcm9tICcuL3ByZWxvYWQvbGlmZWN5Y2xlJztcbmltcG9ydCB7IHByZWxvYWQgfSBmcm9tICcuL3ByZWxvYWQnO1xuXG4vLyBuZXcgYXBwXG5jb25zdCBhcHAgPSBuZXcgRWxlY3Ryb25FZ2coKTtcblxuLy8gcmVnaXN0ZXIgbGlmZWN5Y2xlXG5jb25zdCBsaWZlID0gbmV3IExpZmVjeWNsZSgpO1xuYXBwLnJlZ2lzdGVyKFwicmVhZHlcIiwgbGlmZS5yZWFkeSk7XG5hcHAucmVnaXN0ZXIoXCJlbGVjdHJvbi1hcHAtcmVhZHlcIiwgbGlmZS5lbGVjdHJvbkFwcFJlYWR5KTtcbmFwcC5yZWdpc3RlcihcIndpbmRvdy1yZWFkeVwiLCBsaWZlLndpbmRvd1JlYWR5KTtcbmFwcC5yZWdpc3RlcihcImJlZm9yZS1jbG9zZVwiLCBsaWZlLmJlZm9yZUNsb3NlKTtcblxuLy8gcmVnaXN0ZXIgcHJlbG9hZFxuYXBwLnJlZ2lzdGVyKFwicHJlbG9hZFwiLCBwcmVsb2FkKTtcblxuLy8gcnVuXG5hcHAucnVuKCk7XG4iLCAiLy8gQXV0by1nZW5lcmF0ZWQgYnVuZGxlIGVudHJ5IC0gZG8gbm90IGVkaXRcbnJlcXVpcmUoJ2FwcDpjb25maWctcmVnaXN0cnknKTtcbnJlcXVpcmUoJ2FwcDpjb250cm9sbGVyLXJlZ2lzdHJ5Jyk7XG5yZXF1aXJlKFwiLi9tYWluLnRzXCIpOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQ0EsV0FNTztBQVBQO0FBQUE7QUFBQSxrQkFBaUI7QUFDakIsZ0JBQTJCO0FBTTNCLElBQU8seUJBQVEsTUFBdUI7QUFDcEMsYUFBTztBQUFBLFFBQ0wsY0FBYztBQUFBLFFBQ2QsWUFBWTtBQUFBLFFBQ1osZUFBZTtBQUFBLFVBQ2IsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsUUFBUTtBQUFBLFVBQ1IsVUFBVTtBQUFBLFVBQ1YsV0FBVztBQUFBLFVBQ1gsZ0JBQWdCO0FBQUE7QUFBQSxZQUVkLGtCQUFrQjtBQUFBO0FBQUEsWUFDbEIsaUJBQWlCO0FBQUE7QUFBQSxVQUVuQjtBQUFBLFVBQ0EsT0FBTztBQUFBLFVBQ1AsTUFBTTtBQUFBLFVBQ04sTUFBTSxZQUFBQSxRQUFLLFNBQUssc0JBQVcsR0FBRyxVQUFVLFVBQVUsYUFBYTtBQUFBLFFBQ2pFO0FBQUEs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O0FBQ0E7QUFBQTtBQUFBOzs7QUNOQTtBQUFBLG9CQUtNLEtBR0E7QUFSTjtBQUFBO0FBQUEscUJBQTRCO0FBQzVCO0FBQ0E7QUFHQSxJQUFNLE1BQU0sSUFBSSwyQkFBWTtBQUc1QixJQUFNLE9BQU8sSUFBSSxVQUFVO0FBQzNCLFFBQUksU0FBUyxTQUFTLEtBQUssS0FBSztBQUNoQyxRQUFJLFNBQVMsc0JBQXNCLEtBQUssZ0JBQWdCO0FBQ3hELFFBQUksU0FBUyxnQkFBZ0IsS0FBSyxXQUFXO0FBQzdDLFFBQUksU0FBUyxnQkFBZ0IsS0FBSyxXQUFXO0FBRzdDLFFBQUksU0FBUyxXQUFXLE9BQU87QUFHL0IsUUFBSSxJQUFJO0FBQUE7QUFBQTs7O0FDakJSO0FBQ0E7QUFDQTsiLAogICJuYW1lcyI6IFsicGF0aCIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X3BhdGgiLCAicGF0aCIsICJheGlvcyIsICJpbml0X2Nyb3NzIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9wcyIsICJpbXBvcnRfcGF0aCIsICJwYXRoIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfdXRpbHMiLCAiaW1wb3J0X2xvZyIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BzIiwgImltcG9ydF9sb2ciLCAiaW5pdF9mcmFtZXdvcmsiLCAicGF0aCIsICJmcyIsICJlbGVjdHJvbkFwcCIsICJkYXlqcyIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BzIiwgImltcG9ydF9jb25maWciLCAiaW1wb3J0X3V0aWxzIiwgImltcG9ydF9sb2ciLCAicGF0aCIsICJpbXBvcnRfZnMiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X2VsZWN0cm9uIiwgInBhdGgiLCAiZWxlY3Ryb25BcHAiLCAiZnMiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9sb2ciLCAiaW1wb3J0X2NvbmZpZyIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X3BzIiwgImltcG9ydF9sb2ciLCAicGF0aCIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9lbGVjdHJvbiIsICJlbGVjdHJvbkFwcCIsICJpbXBvcnRfbG9nIl0KfQo=
