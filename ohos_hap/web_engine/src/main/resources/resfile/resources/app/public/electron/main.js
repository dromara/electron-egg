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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIiwgIi4uLy4uL2VsZWN0cm9uL2NvbmZpZy9jb25maWcubG9jYWwudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5wcm9kLnRzIiwgImNvbmZpZy1yZWdpc3RyeTphcHA6Y29uZmlnLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2UvY3Jvc3MudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9jcm9zcy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2VmZmVjdC50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2V4YW1wbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9kYXRhYmFzZS9iYXNlZGIudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYi50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL2F1dG9fdXBkYXRlci50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2ZyYW1ld29yay50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL3dpbmRvdy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL29zLnRzIiwgImNvbnRyb2xsZXItcmVnaXN0cnk6YXBwOmNvbnRyb2xsZXItcmVnaXN0cnkiLCAiLi4vLi4vZWxlY3Ryb24vcHJlbG9hZC9saWZlY3ljbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy90cmF5LnRzIiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2Uvb3Mvc2VjdXJpdHkudHMiLCAiLi4vLi4vZWxlY3Ryb24vcHJlbG9hZC9pbmRleC50cyIsICIuLi8uLi9lbGVjdHJvbi9tYWluLnRzIiwgImJ1bmRsZS1lbnRyeTphcHA6YnVuZGxlLWVudHJ5Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5cbi8qKlxuICogXHU5RUQ4XHU4QkE0XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpOiBQYXJ0aWFsPENvbmZpZz4gPT4ge1xuICByZXR1cm4ge1xuICAgIG9wZW5EZXZUb29sczogZmFsc2UsXG4gICAgc2luZ2xlTG9jazogdHJ1ZSxcbiAgICB3aW5kb3dzT3B0aW9uOiB7XG4gICAgICB0aXRsZTogJ2VsZWN0cm9uLWVnZycsXG4gICAgICB3aWR0aDogOTgwLFxuICAgICAgaGVpZ2h0OiA4NTAsXG4gICAgICBtaW5XaWR0aDogNDAwLFxuICAgICAgbWluSGVpZ2h0OiAzMDAsXG4gICAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgICAvL3dlYlNlY3VyaXR5OiBmYWxzZSxcbiAgICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2UsIC8vIGZhbHNlIC0+IFx1NTNFRlx1NTcyOFx1NkUzMlx1NjdEM1x1OEZEQlx1N0EwQlx1NEUyRFx1NEY3Rlx1NzUyOGVsZWN0cm9uXHU3Njg0YXBpXHVGRjBDdHJ1ZS0+XHU5NzAwXHU4OTgxYnJpZGdlLmpzKGNvbnRleHRCcmlkZ2UpXG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgICAgLy9wcmVsb2FkOiBwYXRoLmpvaW4oZ2V0RWxlY3Ryb25EaXIoKSwgJ3ByZWxvYWQnLCAnYnJpZGdlLmpzJyksXG4gICAgICB9LFxuICAgICAgZnJhbWU6IHRydWUsXG4gICAgICBzaG93OiB0cnVlLFxuICAgICAgaWNvbjogcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgJ3B1YmxpYycsICdpbWFnZXMnLCAnbG9nby0zMi5wbmcnKSxcbiAgICB9LFxuICAgIGxvZ2dlcjoge1xuICAgICAgbGV2ZWw6ICdpbmZvJywgLy8gJ2ZhdGFsJywgJ2Vycm9yJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZScgb3IgJ3NpbGVudCdcbiAgICAgIHJvdGF0b3I6ICdkYWlseScsIC8vIGRhaWx5LCBob3VybHlcbiAgICAgIGRhdGVGb3JtYXQ6ICd5eXl5LU1NLWRkJyxcbiAgICAgIG1heFNpemU6ICcxMDBtJyxcbiAgICAgIHJlZGFjdDogW10sXG4gICAgICByZWRhY3RDZW5zb3I6ICdbUmVkYWN0ZWRdJyxcbiAgICAgIHRpbWVzdGFtcDogdHJ1ZSxcbiAgICAgIGRlcHRoTGltaXQ6IDUsXG4gICAgICB0aW1lem9uZTogJ0FzaWEvU2hhbmdoYWknLFxuICAgICAgbmFtZTogJ2VlJyxcbiAgICAgIGFwcExvZ05hbWU6ICdlZS5sb2cnLFxuICAgICAgY29yZUxvZ05hbWU6ICdlZS1jb3JlLmxvZycsXG4gICAgICBlcnJvckxvZ05hbWU6ICdlZS1lcnJvci5sb2cnXG4gICAgfSxcbiAgICByZW1vdGU6IHtcbiAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICB1cmw6ICdodHRwOi8vZWxlY3Ryb24tZWdnLmtha2E5OTYuY29tLydcbiAgICB9LFxuICAgIHNvY2tldFNlcnZlcjoge1xuICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgcG9ydDogNzA3MCxcbiAgICAgIHBhdGg6IFwiL3NvY2tldC5pby9cIixcbiAgICAgIGNvbm5lY3RUaW1lb3V0OiA0NTAwMCxcbiAgICAgIHBpbmdUaW1lb3V0OiAzMDAwMCxcbiAgICAgIHBpbmdJbnRlcnZhbDogMjUwMDAsXG4gICAgICBtYXhIdHRwQnVmZmVyU2l6ZTogMWU4LFxuICAgICAgdHJhbnNwb3J0czogW1wicG9sbGluZ1wiLCBcIndlYnNvY2tldFwiXSxcbiAgICAgIGNvcnM6IHtcbiAgICAgICAgb3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGNoYW5uZWw6ICdzb2NrZXQtY2hhbm5lbCdcbiAgICB9LFxuICAgIGh0dHBTZXJ2ZXI6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIGh0dHBzOiB7XG4gICAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICAgIGtleTogJy9wdWJsaWMvc3NsL2xvY2FsaG9zdCsxLmtleScsXG4gICAgICAgIGNlcnQ6ICcvcHVibGljL3NzbC9sb2NhbGhvc3QrMS5wZW0nXG4gICAgICB9LFxuICAgICAgcHJvdG9jb2w6ICdodHRwOi8vJyxcbiAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgICAgcG9ydDogNzA3MSxcbiAgICAgIGNvcnM6IHsgb3JpZ2luOiAnKicgfSxcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgbXVsdGlwYXJ0OiBmYWxzZSxcbiAgICAgICAgZm9ybWlkYWJsZTogeyBrZWVwRXh0ZW5zaW9uczogZmFsc2UgfVxuICAgICAgfSxcbiAgICAgIGZpbHRlclJlcXVlc3Q6IHtcbiAgICAgICAgdXJpczogW10sXG4gICAgICAgIHJldHVybkRhdGE6ICcnXG4gICAgICB9LFxuICAgIH0sXG4gICAgbWFpblNlcnZlcjoge1xuICAgICAgcHJvdG9jb2w6ICdmaWxlOi8vJyxcbiAgICAgIGluZGV4UGF0aDogJy9wdWJsaWMvZGlzdC9pbmRleC5odG1sJyxcbiAgICAgIGNoYW5uZWxTZXBhcmF0b3I6ICcvJyxcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIERldmVsb3BtZW50IGVudmlyb25tZW50IGNvbmZpZ3VyYXRpb24sIGNvdmVyYWdlIGNvbmZpZy5kZWZhdWx0LmpzXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpOiBQYXJ0aWFsPENvbmZpZz4gPT4ge1xuICByZXR1cm4ge1xuICAgIG9wZW5EZXZUb29sczoge1xuICAgICAgbW9kZTogJ2RldGFjaCdcbiAgICB9LFxuICAgIGpvYnM6IHtcbiAgICAgIG1lc3NhZ2VMb2c6IGZhbHNlXG4gICAgfVxuICB9O1xufTtcbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqICBjb3ZlcmFnZSBjb25maWcuZGVmYXVsdC5qc1xuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IGZhbHNlLFxuICB9O1xufTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBjb25maWcgcmVnaXN0cnkgLSBkbyBub3QgZWRpdFxuZ2xvYmFsLl9fRUVfQ09ORklHX1JFR0lTVFJZX18gPSBbXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmRlZmF1bHRcIiwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbmZpZy5kZWZhdWx0LnRzXCIpOyB9IH0sXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmxvY2FsXCIsIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jb25maWcubG9jYWwudHNcIik7IH0gfSxcbiAgeyBmaWxlbmFtZTogXCJjb25maWcucHJvZFwiLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY29uZmlnLnByb2QudHNcIik7IH0gfVxuXTsiLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0RXh0cmFSZXNvdXJjZXNEaXIsIGdldExvZ0RpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgY3Jvc3MgfSBmcm9tICdlZS1jb3JlL2Nyb3NzJztcbmltcG9ydCB0eXBlIHsgQ3Jvc3NUYXJnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBjcm9zc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIENyb3NzU2VydmljZSB7XG5cbiAgaW5mbygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBpZHMgPSBjcm9zcy5nZXRQaWRzKCk7XG4gICAgbG9nZ2VyLmluZm8oJ2Nyb3NzIHBpZHM6JywgcGlkcyk7XG5cbiAgICBsZXQgbnVtID0gMTtcbiAgICBwaWRzLmZvckVhY2goKHBpZDogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgZW50aXR5ID0gY3Jvc3MuZ2V0UHJvYyhwaWQpO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gbmFtZToke2VudGl0eS5uYW1lfWApO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gY29uZmlnOmAsIGVudGl0eS5jb25maWcpO1xuICAgICAgbnVtKys7XG4gICAgfSlcblxuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxuXG4gIGdldFVybChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGNyb3NzLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsO1xuICB9XG5cbiAga2lsbFNlcnZlcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0eXBlID09ICdhbGwnKSB7XG4gICAgICBjcm9zcy5raWxsQWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNyb3NzLmtpbGxCeU5hbWUobmFtZSk7XG4gICAgfVxuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlIGdvIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlR29TZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gbWV0aG9kIDE6IFVzZSB0aGUgZGVmYXVsdCBTZXR0aW5nc1xuICAgIC8vY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lKTtcblxuICAgIC8vIG1ldGhvZCAyOiBVc2UgY3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IFwiZ29cIjtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2dvYXBwJyxcbiAgICAgIGNtZDogcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdnb2FwcCcpLFxuICAgICAgZGlyZWN0b3J5OiBnZXRFeHRyYVJlc291cmNlc0RpcigpLFxuICAgICAgYXJnczogWyctLXBvcnQ9NzA3MyddLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciBuYW1lOicsIGVudGl0eS5uYW1lKTtcbiAgICBsb2dnZXIuaW5mbygnW2dvXSBzZXJ2ZXIgY29uZmlnOicsIGVudGl0eS5jb25maWcpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgamF2YSBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNyZWF0ZUphdmFTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcImphdmFcIjtcbiAgICBjb25zdCBqYXJQYXRoID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdqYXZhLWFwcC5qYXInKTtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2phdmFhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS9iaW4vamF2YXcuZXhlJyksXG4gICAgICBkaXJlY3Rvcnk6IGdldEV4dHJhUmVzb3VyY2VzRGlyKCksXG4gICAgICBhcmdzOiBbJy1qYXInLCAnLXNlcnZlcicsICctWG1zNTEyTScsICctWG14NTEyTScsICctWHNzNTEyaycsICctRHNwcmluZy5wcm9maWxlcy5hY3RpdmU9cHJvZCcsIGAtRHNlcnZlci5wb3J0PTE4MDgwYCwgYC1EbG9nZ2luZy5maWxlLnBhdGg9JHtnZXRMb2dEaXIoKX1gLCBgJHtqYXJQYXRofWBdLFxuICAgICAgYXBwRXhpdDogZmFsc2UsXG4gICAgfVxuICAgIGlmIChpcy5tYWNPUygpKSB7XG4gICAgICAvLyBTZXR1cCBKYXZhIHByb2dyYW1cbiAgICAgIG9wdC5jbWQgPSBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS5qcmUvQ29udGVudHMvSG9tZS9iaW4vamF2YScpO1xuICAgIH1cbiAgICBpZiAoaXMubGludXgoKSkge1xuICAgICAgLy8gU2V0dXAgSmF2YSBwcm9ncmFtXG4gICAgfVxuXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgY3Jvc3MuZ2V0VXJsKGVudGl0eS5uYW1lKSk7XG5cbiAgICByZXR1cm47XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBjcmVhdGUgcHl0aG9uIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlUHl0aG9uU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIG1ldGhvZCAxOiBVc2UgdGhlIGRlZmF1bHQgU2V0dGluZ3NcbiAgICAvL2NvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSk7XG5cbiAgICAvLyBtZXRob2QgMjogVXNlIGN1c3RvbSBjb25maWd1cmF0aW9uXG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcInB5dGhvblwiO1xuICAgIGNvbnN0IG9wdDogQ3Jvc3NUYXJnZXRDb25maWcgPSB7XG4gICAgICBuYW1lOiAncHlhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ3B5JywgJ3B5YXBwJyksXG4gICAgICBkaXJlY3Rvcnk6IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCAncHknKSxcbiAgICAgIGFyZ3M6IFsnLS1wb3J0PTcwNzQnXSxcbiAgICAgIHdpbmRvd3NFeHRuYW1lOiB0cnVlLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3RBcGkobmFtZTogc3RyaW5nLCB1cmxQYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3MuZ2V0VXJsKG5hbWUpO1xuICAgIGlmICghc2VydmVyVXJsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBhcGlIZWxsbyA9IHNlcnZlclVybCArIHVybFBhdGg7XG4gICAgY29uc29sZS5sb2coJ1NlcnZlciBVcmw6Jywgc2VydmVyVXJsKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3Moe1xuICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgIHVybDogYXBpSGVsbG8sXG4gICAgICB0aW1lb3V0OiAxMDAwLFxuICAgICAgcGFyYW1zLFxuICAgICAgcHJveHk6IGZhbHNlLFxuICAgIH0pO1xuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IHJlc3BvbnNlO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0gIFxufVxuZXhwb3J0IGNvbnN0IGNyb3NzU2VydmljZSA9IG5ldyBDcm9zc1NlcnZpY2UoKTsgIFxuIiwgImltcG9ydCB7IGNyb3NzU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvY3Jvc3MnO1xuXG4vKipcbiAqIENyb3NzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQ3Jvc3NDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIFZpZXcgcHJvY2VzcyBzZXJ2aWNlIGluZm9ybWF0aW9uXG4gICAqL1xuICBpbmZvKCk6IHN0cmluZyB7XG4gICAgY3Jvc3NTZXJ2aWNlLmluZm8oKTtcbiAgICByZXR1cm4gJ2hlbGxvIGVsZWN0cm9uLWVnZyc7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNlcnZpY2UgdXJsXG4gICAqLyAgXG4gIGFzeW5jIGdldFVybChhcmdzOiB7IG5hbWU6IHN0cmluZyB9KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7IG5hbWUgfSA9IGFyZ3M7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3NTZXJ2aWNlLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIGtpbGwgc2VydmljZVxuICAgKiBCeSBkZWZhdWx0IChtb2RpZmlhYmxlKSwga2lsbGluZyB0aGUgcHJvY2VzcyB3aWxsIGV4aXQgdGhlIGVsZWN0cm9uIGFwcGxpY2F0aW9uLlxuICAgKi8gIFxuICBhc3luYyBraWxsU2VydmVyKGFyZ3M6IHsgdHlwZTogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgdHlwZSwgbmFtZSB9ID0gYXJncztcbiAgICBjcm9zc1NlcnZpY2Uua2lsbFNlcnZlcih0eXBlLCBuYW1lKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIHNlcnZpY2VcbiAgICovICAgXG4gIGFzeW5jIGNyZWF0ZVNlcnZlcihhcmdzOiB7IHByb2dyYW06IHN0cmluZyB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyBwcm9ncmFtIH0gPSBhcmdzO1xuICAgIGlmIChwcm9ncmFtID09ICdnbycpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVHb1NlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAocHJvZ3JhbSA9PSAnamF2YScpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVKYXZhU2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChwcm9ncmFtID09ICdweXRob24nKSB7XG4gICAgICBjcm9zc1NlcnZpY2UuY3JlYXRlUHl0aG9uU2VydmVyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjY2VzcyB0aGUgYXBpIGZvciB0aGUgY3Jvc3Mgc2VydmljZVxuICAgKi9cbiAgYXN5bmMgcmVxdWVzdEFwaShhcmdzOiB7IG5hbWU6IHN0cmluZzsgdXJsUGF0aDogc3RyaW5nOyBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgeyBuYW1lLCB1cmxQYXRoLCBwYXJhbXN9ID0gYXJncztcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgY3Jvc3NTZXJ2aWNlLnJlcXVlc3RBcGkobmFtZSwgdXJsUGF0aCwgcGFyYW1zKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQ3Jvc3NDb250cm9sbGVyO1xuIiwgImltcG9ydCB7IGRpYWxvZyB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuLyoqXG4gKiBlZmZlY3QgLSBkZW1vXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRWZmZWN0Q29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBzZWxlY3QgZmlsZVxuICAgKi9cbiAgc2VsZWN0RmlsZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXVxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVQYXRoc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2dpbiB3aW5kb3dcbiAgICovXG4gIGxvZ2luV2luZG93KGFyZ3M6IHsgd2lkdGg/OiBudW1iZXI7IGhlaWdodD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBhcmdzO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICBpZiAoIXdpbikgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2l6ZSA9IHtcbiAgICAgIHdpZHRoOiB3aWR0aCB8fCA0MDAsXG4gICAgICBoZWlnaHQ6IGhlaWdodCB8fCAzMDBcbiAgICB9XG4gICAgd2luLnNldFNpemUoc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuICAgIHdpbi5zZXRSZXNpemFibGUodHJ1ZSk7XG4gICAgd2luLmNlbnRlcigpO1xuICAgIHdpbi5zaG93KCk7XG4gICAgd2luLmZvY3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogcmVzdG9yZSB3aW5kb3dcbiAgICovXG4gIHJlc3RvcmVXaW5kb3coYXJnczogeyB3aWR0aD86IG51bWJlcjsgaGVpZ2h0PzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IGFyZ3M7XG4gICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgIGlmICghd2luKSByZXR1cm47XG5cbiAgICBjb25zdCBzaXplID0ge1xuICAgICAgd2lkdGg6IHdpZHRoIHx8IDk4MCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IHx8IDY1MFxuICAgIH1cbiAgICB3aW4uc2V0U2l6ZShzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgd2luLnNldFJlc2l6YWJsZSh0cnVlKTtcbiAgICB3aW4uY2VudGVyKCk7XG4gICAgd2luLnNob3coKTtcbiAgICB3aW4uZm9jdXMoKTtcbiAgfSAgIFxufVxuZXhwb3J0IGRlZmF1bHQgRWZmZWN0Q29udHJvbGxlcjtcbiIsICIvKipcbiAqIGV4YW1wbGVcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBFeGFtcGxlQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiB0ZXN0XG4gICAqL1xuICBhc3luYyB0ZXN0ICgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgRXhhbXBsZUNvbnRyb2xsZXI7XG4iLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgQ2hpbGRKb2IsIENoaWxkUG9vbEpvYiB9IGZyb20gJ2VlLWNvcmUvam9icyc7XG5pbXBvcnQgdHlwZSB7IEpvYlByb2Nlc3MgfSBmcm9tICdlZS1jb3JlL2pvYnMvY2hpbGQvam9iUHJvY2Vzcyc7XG5pbXBvcnQgdHlwZSB7IElwY01haW5FdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcblxuLyoqXG4gKiBmcmFtZXdvcmtcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBGcmFtZXdvcmtTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBteVRpbWVyOiBOb2RlSlMuVGltZW91dCB8IG51bGw7XG4gIHByaXZhdGUgbXlKb2I6IENoaWxkSm9iO1xuICBwcml2YXRlIG15Sm9iUG9vbDogQ2hpbGRQb29sSm9iO1xuICBwcml2YXRlIHRhc2tGb3JKb2I6IFJlY29yZDxzdHJpbmcsIEpvYlByb2Nlc3M+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIFx1NTcyOFx1Njc4NFx1OTAyMFx1NTFGRFx1NjU3MFx1NEUyRFx1NTIxRFx1NTlDQlx1NTMxNlx1NEUwMFx1NEU5Qlx1NTNEOFx1OTFDRlxuICAgIHRoaXMubXlUaW1lciA9IG51bGw7XG4gICAgdGhpcy5teUpvYiA9IG5ldyBDaGlsZEpvYigpO1xuICAgIHRoaXMubXlKb2JQb29sID0gbmV3IENoaWxkUG9vbEpvYigpO1xuICAgIHRoaXMudGFza0ZvckpvYiA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIHRlc3RcbiAgICovXG4gIGFzeW5jIHRlc3QoYXJnczogdW5rbm93bik6IFByb21pc2U8eyBzdGF0dXM6IHN0cmluZzsgcGFyYW1zOiB1bmtub3duIH0+IHtcbiAgICBsZXQgb2JqID0ge1xuICAgICAgc3RhdHVzOidvaycsXG4gICAgICBwYXJhbXM6IGFyZ3NcbiAgICB9XG4gICAgbG9nZ2VyLmluZm8oJ0ZyYW1ld29ya1NlcnZpY2Ugb2JqOicsIG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBpcGNcdTkwMUFcdTRGRTEoXHU1M0NDXHU1NDExKVxuICAgKi9cbiAgYm90aFdheU1lc3NhZ2UodHlwZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBzdHJpbmcge1xuICAgIC8vIFx1NTI0RFx1N0FFRmlwY1x1OTg5MVx1OTA1MyBjaGFubmVsXG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay9pcGNTZW5kTXNnJztcblxuICAgIGlmICh0eXBlID09ICdzdGFydCcpIHtcbiAgICAgIC8vIFx1NkJDRlx1OTY5NDFcdTc5RDJcdUZGMENcdTU0MTFcdTUyNERcdTdBRUZcdTk4NzVcdTk3NjJcdTUzRDFcdTkwMDFcdTZEODhcdTYwNkZcbiAgICAgIC8vIFx1NzUyOFx1NUI5QVx1NjVGNlx1NTY2OFx1NkEyMVx1NjJERlxuICAgICAgdGhpcy5teVRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oZSwgYywgbXNnKSB7XG4gICAgICAgIGxldCB0aW1lTm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGV0IGRhdGEgPSBtc2cgKyAnOicgKyB0aW1lTm93O1xuICAgICAgICBlLnJlcGx5KGAke2N9YCwgZGF0YSlcbiAgICAgIH0sIDEwMDAsIGV2ZW50LCBjaGFubmVsLCBjb250ZW50KVxuXG4gICAgICByZXR1cm4gJ1x1NUYwMFx1NTlDQlx1NEU4NidcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ2VuZCcpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5teVRpbWVyISk7XG4gICAgICByZXR1cm4gJ1x1NTA1Q1x1NkI2Mlx1NEU4NicgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnb2h0aGVyJ1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovIFxuICBkb0pvYihqb2JJZDogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICBsZXQgcmVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGxldCBvbmVUYXNrOiBKb2JQcm9jZXNzIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9mcmFtZXdvcmsvdGltZXJKb2JQcm9ncmVzcyc7XG4gIFxuICAgIGlmIChhY3Rpb24gPT0gJ2NyZWF0ZScpIHtcbiAgICAgIC8vIFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVx1NTNDQVx1NzZEMVx1NTQyQ1x1OEZEQlx1NUVBNlxuICAgICAgbGV0IGV2ZW50TmFtZSA9ICdqb2ItdGltZXItcHJvZ3Jlc3MtJyArIGpvYklkO1xuICAgICAgY29uc3QgdGltZXJUYXNrID0gdGhpcy5teUpvYi5leGVjKCcuL2pvYnMvZXhhbXBsZS90aW1lcicsIHtqb2JJZH0pO1xuICAgICAgdGltZXJUYXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YTogdW5rbm93bikgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnW21haW4tcHJvY2Vzc10gdGltZXJUYXNrLCBmcm9tIFRpbWVySm9iIGRhdGE6JywgZGF0YSk7XG4gICAgICAgIC8vIFx1NTNEMVx1OTAwMVx1NjU3MFx1NjM2RVx1NTIzMFx1NkUzMlx1NjdEM1x1OEZEQlx1N0EwQlxuICAgICAgICBldmVudC5zZW5kZXIuc2VuZChgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICB9KVxuICAgIFxuICAgICAgLy8gXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2IFx1NUYwMlx1NkI2NVxuICAgICAgLy8gbXlqb2IuZXhlY1Byb21pc2UoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSkudGhlbih0YXNrID0+IHtcbiAgICAgIC8vICAgdGFzay5lbWl0dGVyLm9uKGV2ZW50TmFtZSwgKGRhdGEpID0+IHtcbiAgICAgIC8vICAgICBMb2cuaW5mbygnW21haW4tcHJvY2Vzc10gdGltZXJUYXNrLCBmcm9tIFRpbWVySm9iIGRhdGE6JywgZGF0YSk7XG4gICAgICAvLyAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAvLyAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuICAgICAgLy8gICB9KVxuICAgICAgLy8gfSk7XG5cbiAgICAgIHJlcy5waWQgPSB0aW1lclRhc2sucGlkOyBcbiAgICAgIHRoaXMudGFza0ZvckpvYltqb2JJZF0gPSB0aW1lclRhc2s7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gPT0gJ2Nsb3NlJykge1xuICAgICAgb25lVGFzayA9IHRoaXMudGFza0ZvckpvYltqb2JJZF07XG4gICAgICBvbmVUYXNrLmtpbGwoKTtcbiAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwge2pvYklkLCBudW1iZXI6MCwgcGlkOjB9KTtcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PSAncGF1c2UnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2suY2FsbEZ1bmMoJy4vam9icy9leGFtcGxlL3RpbWVyJywgJ3BhdXNlJywgam9iSWQpO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uID09ICdyZXN1bWUnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2suY2FsbEZ1bmMoJy4vam9icy9leGFtcGxlL3RpbWVyJywgJ3Jlc3VtZScsIGpvYklkLCBvbmVUYXNrLnBpZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG5cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBcG9vbFxuICAgKi8gXG4gIGRvQ3JlYXRlUG9vbChudW06IG51bWJlciwgZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9mcmFtZXdvcmsvY3JlYXRlUG9vbE5vdGljZSc7XG4gICAgdGhpcy5teUpvYlBvb2wuY3JlYXRlKG51bSkudGhlbigocGlkczogc3RyaW5nW10pID0+IHtcbiAgICAgIGV2ZW50LnJlcGx5KGAke2NoYW5uZWx9YCwgcGlkcyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHU5MDFBXHU4RkM3XHU4RkRCXHU3QTBCXHU2QzYwXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXG4gICAqL1xuICBhc3luYyBkb0pvYkJ5UG9vbChqb2JJZDogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICBsZXQgcmVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9mcmFtZXdvcmsvdGltZXJKb2JQcm9ncmVzcyc7XG4gICAgaWYgKGFjdGlvbiA9PSAncnVuJykge1xuICAgICAgLy8gXHU1RjAyXHU2QjY1LVx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVx1NTNDQVx1NzZEMVx1NTQyQ1x1OEZEQlx1NUVBNlxuICAgICAgY29uc3QgdGFzayA9IGF3YWl0IHRoaXMubXlKb2JQb29sLnJ1blByb21pc2UoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSk7XG5cbiAgICAgIC8vIFx1NzZEMVx1NTQyQ1x1NTY2OFx1NTQwRFx1NzlGMFx1NTUyRlx1NEUwMFx1RkYwQ1x1NTQyNlx1NTIxOVx1NEYxQVx1NTFGQVx1NzNCMFx1OTFDRFx1NTkwRFx1NzZEMVx1NTQyQ1x1MzAwMlxuICAgICAgLy8gXHU0RUZCXHU1MkExXHU1QjhDXHU2MjEwXHU2NUY2XHVGRjBDXHU5NzAwXHU4OTgxXHU3OUZCXHU5NjY0XHU3NkQxXHU1NDJDXHU1NjY4XHVGRjBDXHU5NjMyXHU2QjYyXHU1MTg1XHU1QjU4XHU2Q0M0XHU2RjBGXG4gICAgICBsZXQgZXZlbnROYW1lID0gJ2pvYi10aW1lci1wcm9ncmVzcy0nICsgam9iSWQ7XG4gICAgICB0YXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YTogdW5rbm93bikgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnW21haW4tcHJvY2Vzc10gW0NoaWxkUG9vbEpvYl0gdGltZXJUYXNrLCBmcm9tIFRpbWVySm9iIGRhdGE6JywgZGF0YSk7XG5cbiAgICAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwgZGF0YSlcblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY1MzZcdTUyMzBcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdTc2ODRcdTZEODhcdTYwNkZcdUZGMENcdTc5RkJcdTk2NjRcdTc2RDFcdTU0MkNcdTU2NjhcbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmICdlbmQnIGluIGRhdGEgJiYgKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmVuZCkge1xuICAgICAgICAgIHRhc2suZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJlcy5waWQgPSB0YXNrLnBpZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTgzQjdcdTUzRDZcdTZCNjNcdTU3MjhcdThGRDBcdTg4NENcdTc2ODQgam9iIFx1OEZEQlx1N0EwQiBcbiAgICovIFxuICBtb25pdG9ySm9iKCk6IHZvaWQge1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCBqb2JQaWRzID0gdGhpcy5teUpvYi5nZXRQaWRzKCk7XG4gICAgICBsZXQgam9iUG9vbFBpZHMgPSB0aGlzLm15Sm9iUG9vbC5nZXRQaWRzKCk7XG4gICAgICBsb2dnZXIuaW5mbyhgW21haW4tcHJvY2Vzc10gW21vbml0b3JKb2JdIGpvYlBpZHM6ICR7am9iUGlkc30sIGpvYlBvb2xQaWRzOiAke2pvYlBvb2xQaWRzfWApO1xuICAgIH0sIDUwMDApXG4gIH1cblxufVxuZXhwb3J0IGNvbnN0IGZyYW1ld29ya1NlcnZpY2UgPSBuZXcgRnJhbWV3b3JrU2VydmljZSgpOyAgXG4iLCAiaW1wb3J0IHsgU3FsaXRlU3RvcmFnZSB9IGZyb20gJ2VlLWNvcmUvc3RvcmFnZSc7XG5pbXBvcnQgeyBnZXREYXRhRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIERhdGFiYXNlIGZyb20gJ2JldHRlci1zcWxpdGUzJztcblxuLyoqXG4gKiBzcWxpdGVcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBCYXNlZGJTZXJ2aWNlIHtcbiAgcHJvdGVjdGVkIGRibmFtZTogc3RyaW5nO1xuICBwcm90ZWN0ZWQgZGIhOiBEYXRhYmFzZS5EYXRhYmFzZTtcbiAgcHJvdGVjdGVkIHN0b3JhZ2UhOiBTcWxpdGVTdG9yYWdlO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHsgZGJuYW1lOiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IHsgZGJuYW1lIH0gPSBvcHRpb25zO1xuICAgIHRoaXMuZGJuYW1lID0gZGJuYW1lO1xuICB9XG5cbiAgLypcbiAgICogXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAqL1xuICBfaW5pdCgpOiB2b2lkIHtcbiAgICAvLyBcdTVCOUFcdTRFNDlcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBkYkZpbGUgPSBwYXRoLmpvaW4oZ2V0RGF0YURpcigpLCBcImRiXCIsIHRoaXMuZGJuYW1lKTtcbiAgICBjb25zdCBzcWxpdGVPcHRpb25zID0ge1xuICAgICAgdGltZW91dDogNjAwMCxcbiAgICAgIHZlcmJvc2U6IGNvbnNvbGUubG9nXG4gICAgfVxuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBTcWxpdGVTdG9yYWdlKGRiRmlsZSwgc3FsaXRlT3B0aW9ucyk7XG4gICAgdGhpcy5kYiA9IHRoaXMuc3RvcmFnZS5kYjtcbiAgfVxuXG4gIC8qXG4gICAqIGNoYW5nZSBkYXRhIGRpciAoc3FsaXRlKVxuICAgKi9cbiAgY2hhbmdlRGF0YURpcihkaXI6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIHRoZSBhYnNvbHV0ZSBwYXRoIG9mIHRoZSBkYiBmaWxlXG4gICAgY29uc3QgZGJGaWxlID0gcGF0aC5qb2luKGRpciwgdGhpcy5kYm5hbWUpO1xuICAgIGNvbnN0IHNxbGl0ZU9wdGlvbnMgPSB7XG4gICAgICB0aW1lb3V0OiA2MDAwLFxuICAgICAgdmVyYm9zZTogY29uc29sZS5sb2dcbiAgICB9XG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFNxbGl0ZVN0b3JhZ2UoZGJGaWxlLCBzcWxpdGVPcHRpb25zKTtcbiAgICB0aGlzLmRiID0gdGhpcy5zdG9yYWdlLmRiOyAgIFxuICB9XG59ICBcbmV4cG9ydCB7IEJhc2VkYlNlcnZpY2UgfTtcbiIsICJpbXBvcnQgeyBCYXNlZGJTZXJ2aWNlIH0gZnJvbSAnLi9iYXNlZGInO1xuXG4vKipcbiAqIHNxbGl0ZVx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXNlclJvdyB7XG4gIGlkOiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcbiAgYWdlOiBudW1iZXI7XG59XG5cbmNsYXNzIFNxbGl0ZWRiU2VydmljZSBleHRlbmRzIEJhc2VkYlNlcnZpY2Uge1xuICBwcml2YXRlIHVzZXJUYWJsZU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGRibmFtZTogJ3NxbGl0ZS1kZW1vLmRiJyxcbiAgICB9XG4gICAgc3VwZXIob3B0aW9ucyk7XG4gICAgdGhpcy51c2VyVGFibGVOYW1lID0gJ3VzZXInO1xuICB9XG5cbiAgLypcbiAgICogXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAqL1xuICBpbml0KCk6IHZvaWQge1xuICAgIC8vIFx1NTIxRFx1NTlDQlx1NTMxNlx1NjU3MFx1NjM2RVx1NUU5M1xuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1ODg2OFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGNvbnN0IG1hc3RlclN0bXQgPSB0aGlzLmRiLnByZXBhcmUoJ1NFTEVDVCAqIEZST00gc3FsaXRlX21hc3RlciBXSEVSRSB0eXBlPT8gQU5EIG5hbWUgPSA/Jyk7XG4gICAgbGV0IHRhYmxlRXhpc3RzID0gbWFzdGVyU3RtdC5nZXQoJ3RhYmxlJywgdGhpcy51c2VyVGFibGVOYW1lKTtcbiAgICBpZiAoIXRhYmxlRXhpc3RzKSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTg4NjhcbiAgICAgIGNvbnN0IGNyZWF0ZV91c2VyX3RhYmxlX3NxbCA9XG4gICAgICBgQ1JFQVRFIFRBQkxFICR7dGhpcy51c2VyVGFibGVOYW1lfVxuICAgICAgKFxuICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgbmFtZSBDSEFSKDUwKSBOT1QgTlVMTCxcbiAgICAgICAgIGFnZSBJTlRcbiAgICAgICk7YFxuICAgICAgdGhpcy5kYi5leGVjKGNyZWF0ZV91c2VyX3RhYmxlX3NxbCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogXHU1ODlFIFRlc3QgZGF0YSAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgYWRkVGVzdERhdGFTcWxpdGUoZGF0YTogeyBuYW1lOiBzdHJpbmc7IGFnZTogbnVtYmVyIH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBpbnNlcnQgPSB0aGlzLmRiLnByZXBhcmUoYElOU0VSVCBJTlRPICR7dGhpcy51c2VyVGFibGVOYW1lfSAobmFtZSwgYWdlKSBWQUxVRVMgKEBuYW1lLCBAYWdlKWApO1xuICAgIGluc2VydC5ydW4oZGF0YSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKlxuICAgKiBcdTUyMjAgVGVzdCBkYXRhIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBkZWxUZXN0RGF0YVNxbGl0ZShuYW1lID0gJycpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkZWxVc2VyID0gdGhpcy5kYi5wcmVwYXJlKGBERUxFVEUgRlJPTSAke3RoaXMudXNlclRhYmxlTmFtZX0gV0hFUkUgbmFtZSA9ID9gKTtcbiAgICBkZWxVc2VyLnJ1bihuYW1lKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qXG4gICAqIFx1NjUzOSBUZXN0IGRhdGEgKHNxbGl0ZSlcbiAgICovXG4gIGFzeW5jIHVwZGF0ZVRlc3REYXRhU3FsaXRlKG5hbWU9ICcnLCBhZ2UgPSAwKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgdXBkYXRlVXNlciA9IHRoaXMuZGIucHJlcGFyZShgVVBEQVRFICR7dGhpcy51c2VyVGFibGVOYW1lfSBTRVQgYWdlID0gPyBXSEVSRSBuYW1lID0gP2ApO1xuICAgIHVwZGF0ZVVzZXIucnVuKGFnZSwgbmFtZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gIFxuXG4gIC8qXG4gICAqIFx1NjdFNSBUZXN0IGRhdGEgKHNxbGl0ZSlcbiAgICovXG4gIGFzeW5jIGdldFRlc3REYXRhU3FsaXRlKGFnZSA9IDApOiBQcm9taXNlPFVzZXJSb3dbXT4ge1xuICAgIGNvbnN0IHNlbGVjdFVzZXIgPSB0aGlzLmRiLnByZXBhcmUoYFNFTEVDVCAqIEZST00gJHt0aGlzLnVzZXJUYWJsZU5hbWV9IFdIRVJFIGFnZSA9IEBhZ2VgKTtcbiAgICBjb25zdCB1c2VycyA9IHNlbGVjdFVzZXIuYWxsKHthZ2U6IGFnZX0pIGFzIFVzZXJSb3dbXTtcbiAgICByZXR1cm4gdXNlcnM7XG4gIH0gIFxuICBcbiAgLypcbiAgICogYWxsIFRlc3QgZGF0YSAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgZ2V0QWxsVGVzdERhdGFTcWxpdGUoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHNlbGVjdEFsbFVzZXIgPSB0aGlzLmRiLnByZXBhcmUoYFNFTEVDVCAqIEZST00gJHt0aGlzLnVzZXJUYWJsZU5hbWV9IGApO1xuICAgIGNvbnN0IGFsbFVzZXIgPSAgc2VsZWN0QWxsVXNlci5hbGwoKTtcbiAgICByZXR1cm4gYWxsVXNlcjtcbiAgfVxuICBcbiAgLypcbiAgICogZ2V0IGRhdGEgZGlyIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBnZXREYXRhRGlyKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZGlyID0gdGhpcy5zdG9yYWdlLmdldERiRGlyKCk7ICAgIFxuICAgIHJldHVybiBkaXI7XG4gIH0gXG5cbiAgLypcbiAgICogc2V0IGN1c3RvbSBkYXRhIGRpciAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgc2V0Q3VzdG9tRGF0YURpcihkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZGlyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VEYXRhRGlyKGRpcik7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuO1xuICB9XG59XG5leHBvcnQgY29uc3Qgc3FsaXRlZGJTZXJ2aWNlID0gbmV3IFNxbGl0ZWRiU2VydmljZSgpO1xuIiwgImltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGF1dG9VcGRhdGVyIH0gZnJvbSBcImVsZWN0cm9uLXVwZGF0ZXJcIjtcbmltcG9ydCB0eXBlIHsgUHJvZ3Jlc3NJbmZvIH0gZnJvbSAnZWxlY3Ryb24tdXBkYXRlcic7XG5pbXBvcnQgdHlwZSB7IEdlbmVyaWNTZXJ2ZXJPcHRpb25zIH0gZnJvbSAnYnVpbGRlci11dGlsLXJ1bnRpbWUnO1xuaW1wb3J0IHsgaXMgfSBmcm9tICdlZS1jb3JlL3V0aWxzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3csIHNldENsb3NlQW5kUXVpdCB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuXG4vKipcbiAqIFx1ODFFQVx1NTJBOFx1NTM0N1x1N0VBN1xuICogQGNsYXNzXG4gKi9cbmludGVyZmFjZSBVcGRhdGVyQ29uZmlnIHtcbiAgd2luZG93czogYm9vbGVhbjtcbiAgbWFjT1M6IGJvb2xlYW47XG4gIGxpbnV4OiBib29sZWFuO1xuICBvcHRpb25zOiBHZW5lcmljU2VydmVyT3B0aW9ucztcbn1cblxuY2xhc3MgQXV0b1VwZGF0ZXJTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBjb25maWc6IFVwZGF0ZXJDb25maWc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICB3aW5kb3dzOiBmYWxzZSxcbiAgICAgIG1hY09TOiBmYWxzZSxcbiAgICAgIGxpbnV4OiBmYWxzZSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgcHJvdmlkZXI6ICdnZW5lcmljJyBhcyBjb25zdCxcbiAgICAgICAgdXJsOiAnaHR0cDovL2tvZG8ucWluaXUuY29tLydcbiAgICAgIH0sXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIxQlx1NUVGQVxuICAgKi9cbiAgY3JlYXRlICgpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnW2F1dG9VcGRhdGVyXSBsb2FkJyk7XG4gICAgY29uc3QgY2ZnID0gdGhpcy5jb25maWc7XG4gICAgaWYgKChpcy53aW5kb3dzKCkgJiYgY2ZnLndpbmRvd3MpIHx8IChpcy5tYWNPUygpICYmIGNmZy5tYWNPUykgfHwgKGlzLmxpbnV4KCkgJiYgY2ZnLmxpbnV4KSkge1xuICAgICAgLy8gY29udGludWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzID0ge1xuICAgICAgZXJyb3I6IC0xLFxuICAgICAgYXZhaWxhYmxlOiAxLFxuICAgICAgbm9BdmFpbGFibGU6IDIsXG4gICAgICBkb3dubG9hZGluZzogMyxcbiAgICAgIGRvd25sb2FkZWQ6IDQsXG4gICAgfVxuXG4gICAgY29uc3QgdmVyc2lvbiA9IGVsZWN0cm9uQXBwLmdldFZlcnNpb24oKTtcbiAgICBsb2dnZXIuaW5mbygnW2F1dG9VcGRhdGVyXSBjdXJyZW50IHZlcnNpb246ICcsIHZlcnNpb24pO1xuICBcbiAgICAvLyBcdThCQkVcdTdGNkVcdTRFMEJcdThGN0RcdTY3MERcdTUyQTFcdTU2NjhcdTU3MzBcdTU3NDBcbiAgICBsZXQgc2VydmVyID0gY2ZnLm9wdGlvbnMudXJsO1xuICAgIGxldCBsYXN0Q2hhciA9IHNlcnZlci5zdWJzdHJpbmcoc2VydmVyLmxlbmd0aCAtIDEpO1xuICAgIHNlcnZlciA9IGxhc3RDaGFyID09PSAnLycgPyBzZXJ2ZXIgOiBzZXJ2ZXIgKyBcIi9cIjtcbiAgICBjb25zdCBmZWVkT3B0aW9uczogR2VuZXJpY1NlcnZlck9wdGlvbnMgPSB7IC4uLmNmZy5vcHRpb25zLCB1cmw6IHNlcnZlciB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGF1dG9VcGRhdGVyLnNldEZlZWRVUkwoZmVlZE9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ1thdXRvVXBkYXRlcl0gc2V0RmVlZFVSTCBlcnJvciA6ICcsIGVycm9yKTtcbiAgICB9XG4gIFxuICAgIGF1dG9VcGRhdGVyLm9uKCdjaGVja2luZy1mb3ItdXBkYXRlJywgKCkgPT4ge1xuICAgICAgLy9zZW5kU3RhdHVzVG9XaW5kb3coJ1x1NkI2M1x1NTcyOFx1NjhDMFx1NjdFNVx1NjZGNFx1NjVCMC4uLicpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1hdmFpbGFibGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5hdmFpbGFibGUsXG4gICAgICAgIGRlc2M6ICdcdTY3MDlcdTUzRUZcdTc1MjhcdTY2RjRcdTY1QjAnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCd1cGRhdGUtbm90LWF2YWlsYWJsZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLm5vQXZhaWxhYmxlLFxuICAgICAgICBkZXNjOiAnXHU2Q0ExXHU2NzA5XHU1M0VGXHU3NTI4XHU2NkY0XHU2NUIwJ1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuZXJyb3IsXG4gICAgICAgIGRlc2M6IGVyclxuICAgICAgfVxuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbignZG93bmxvYWQtcHJvZ3Jlc3MnLCAocHJvZ3Jlc3NPYmo6IFByb2dyZXNzSW5mbykgPT4ge1xuICAgICAgY29uc3QgcGVyY2VudE51bWJlciA9IE1hdGguZmxvb3IocHJvZ3Jlc3NPYmoucGVyY2VudCk7XG4gICAgICBjb25zdCB0b3RhbFNpemUgPSB0aGlzLmJ5dGVzQ2hhbmdlKHByb2dyZXNzT2JqLnRvdGFsKTtcbiAgICAgIGNvbnN0IHRyYW5zZmVycmVkU2l6ZSA9IHRoaXMuYnl0ZXNDaGFuZ2UocHJvZ3Jlc3NPYmoudHJhbnNmZXJyZWQpO1xuICAgICAgbGV0IHRleHQgPSAnXHU1REYyXHU0RTBCXHU4RjdEICcgKyBwZXJjZW50TnVtYmVyICsgJyUnO1xuICAgICAgdGV4dCA9IHRleHQgKyAnICgnICsgdHJhbnNmZXJyZWRTaXplICsgXCIvXCIgKyB0b3RhbFNpemUgKyAnKSc7XG4gIFxuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuZG93bmxvYWRpbmcsXG4gICAgICAgIGRlc2M6IHRleHQsXG4gICAgICAgIHBlcmNlbnROdW1iZXIsXG4gICAgICAgIHRvdGFsU2l6ZSxcbiAgICAgICAgdHJhbnNmZXJyZWRTaXplXG4gICAgICB9XG4gICAgICBsb2dnZXIuaW5mbygnW2F1dG9VcGRhdGVyXSBwcm9ncmVzczogJywgdGV4dCk7XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCd1cGRhdGUtZG93bmxvYWRlZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLmRvd25sb2FkZWQsXG4gICAgICAgIGRlc2M6ICdcdTRFMEJcdThGN0RcdTVCOENcdTYyMTAnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcblxuICAgICAgLy8gXHU2MjU4XHU3NkQ4XHU2M0QyXHU0RUY2XHU5MUNDXHU5NzYyXHU4QkJFXHU3RjZFXHU0RTg2XHU5NjNCXHU2QjYyXHU3QTk3XHU1M0UzXHU1MTczXHU5NUVEXHVGRjBDXHU4RkQ5XHU5MUNDXHU4QkJFXHU3RjZFXHU1MTQxXHU4QkI4XHU1MTczXHU5NUVEXHU3QTk3XHU1M0UzXG4gICAgICBzZXRDbG9zZUFuZFF1aXQodHJ1ZSk7XG4gICAgICBcbiAgICAgIC8vIEluc3RhbGwgdXBkYXRlcyBhbmQgZXhpdCB0aGUgYXBwbGljYXRpb25cbiAgICAgIGF1dG9VcGRhdGVyLnF1aXRBbmRJbnN0YWxsKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHU2OEMwXHU2N0U1XHU2NkY0XHU2NUIwXG4gICAqL1xuICBjaGVja1VwZGF0ZSAoKTogdm9pZCB7XG4gICAgYXV0b1VwZGF0ZXIuY2hlY2tGb3JVcGRhdGVzKCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBcdTRFMEJcdThGN0RcdTY2RjRcdTY1QjBcbiAgICovXG4gIGRvd25sb2FkICgpOiB2b2lkIHtcbiAgICBhdXRvVXBkYXRlci5kb3dubG9hZFVwZGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTQxMVx1NTI0RFx1N0FFRlx1NTNEMVx1NkQ4OFx1NjA2RlxuICAgKi9cbiAgc2VuZFN0YXR1c1RvV2luZG93KGNvbnRlbnQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30pOiB2b2lkIHtcbiAgICBjb25zdCB0ZXh0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY3VzdG9tL2FwcC91cGRhdGVyJztcbiAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgaWYgKCF3aW4pIHJldHVybjtcbiAgICB3aW4ud2ViQ29udGVudHMuc2VuZChjaGFubmVsLCB0ZXh0SnNvbik7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBcdTUzNTVcdTRGNERcdThGNkNcdTYzNjJcbiAgICovXG4gIGJ5dGVzQ2hhbmdlIChsaW1pdDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgc2l6ZSA9IFwiXCI7XG4gICAgaWYobGltaXQgPCAwLjEgKiAxMDI0KXsgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBzaXplID0gbGltaXQudG9GaXhlZCgyKSArIFwiQlwiO1xuICAgIH1lbHNlIGlmKGxpbWl0IDwgMC4xICogMTAyNCAqIDEwMjQpeyAgICAgICAgICAgIFxuICAgICAgc2l6ZSA9IChsaW1pdC8xMDI0KS50b0ZpeGVkKDIpICsgXCJLQlwiO1xuICAgIH1lbHNlIGlmKGxpbWl0IDwgMC4xICogMTAyNCAqIDEwMjQgKiAxMDI0KXsgICAgICAgIFxuICAgICAgc2l6ZSA9IChsaW1pdC8oMTAyNCAqIDEwMjQpKS50b0ZpeGVkKDIpICsgXCJNQlwiO1xuICAgIH1lbHNleyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICBzaXplID0gKGxpbWl0LygxMDI0ICogMTAyNCAqIDEwMjQpKS50b0ZpeGVkKDIpICsgXCJHQlwiO1xuICAgIH1cblxuICAgIGxldCBzaXplU3RyID0gc2l6ZSArIFwiXCI7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gc2l6ZVN0ci5pbmRleE9mKFwiLlwiKTsgICAgICAgICAgICAgICAgICAgIFxuICAgIGxldCBkb3UgPSBzaXplU3RyLnN1YnN0cmluZyhpbmRleCArIDEgLCBpbmRleCArIDMpOyAgICAgICAgICAgIFxuICAgIGlmKGRvdSA9PSBcIjAwXCIpe1xuICAgICAgICByZXR1cm4gc2l6ZVN0ci5zdWJzdHJpbmcoMCwgaW5kZXgpICsgc2l6ZVN0ci5zdWJzdHJpbmcoaW5kZXggKyAzLCBpbmRleCArIDUpO1xuICAgIH1cblxuICAgIHJldHVybiBzaXplO1xuICB9ICBcbn1cbmV4cG9ydCBjb25zdCBhdXRvVXBkYXRlclNlcnZpY2UgPSBuZXcgQXV0b1VwZGF0ZXJTZXJ2aWNlKCk7XG4iLCAiaW1wb3J0IGRheWpzIGZyb20gJ2RheWpzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCwgc2hlbGwsIElwY01haW5FdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldEV4dHJhUmVzb3VyY2VzRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuaW1wb3J0IHsgZnJhbWV3b3JrU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvZnJhbWV3b3JrJztcbmltcG9ydCB7IHNxbGl0ZWRiU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvZGF0YWJhc2Uvc3FsaXRlZGInO1xuaW1wb3J0IHR5cGUgeyBVc2VyUm93IH0gZnJvbSAnLi4vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYic7XG5pbXBvcnQgeyBhdXRvVXBkYXRlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL29zL2F1dG9fdXBkYXRlcic7XG5pbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICdrb2EnO1xuXG4vKipcbiAqIGZyYW1ld29yayAtIGRlbW9cbiAqIEBjbGFzc1xuICovXG5pbnRlcmZhY2UgU3FsaXRlZGJPcGVyYXRpb25BcmdzIHtcbiAgYWN0aW9uOiBzdHJpbmc7XG4gIGluZm8/OiB7IG5hbWU6IHN0cmluZzsgYWdlOiBudW1iZXIgfTtcbiAgZGVsZXRlX25hbWU/OiBzdHJpbmc7XG4gIHVwZGF0ZV9uYW1lPzogc3RyaW5nO1xuICB1cGRhdGVfYWdlPzogbnVtYmVyO1xuICBzZWFyY2hfYWdlPzogbnVtYmVyO1xuICBkYXRhX2Rpcj86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNxbGl0ZWRiT3BlcmF0aW9uUmVzdWx0IHtcbiAgYWN0aW9uOiBzdHJpbmc7XG4gIHJlc3VsdDogYm9vbGVhbiB8IHN0cmluZyB8IFVzZXJSb3dbXSB8IG51bGw7XG4gIGFsbF9saXN0OiBVc2VyUm93W107XG4gIGNvZGU6IG51bWJlcjtcbn1cblxuY2xhc3MgRnJhbWV3b3JrQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBcdTYyNDBcdTY3MDlcdTY1QjlcdTZDRDVcdTYzQTVcdTY1MzZcdTRFMjRcdTRFMkFcdTUzQzJcdTY1NzBcbiAgICogQHBhcmFtIGFyZ3MgXHU1MjREXHU3QUVGXHU0RjIwXHU3Njg0XHU1M0MyXHU2NTcwXG4gICAqIEBwYXJhbSBldmVudCAtIGlwY1x1OTAxQVx1NEZFMVx1NjVGNlx1NjI0RFx1NjcwOVx1NTAzQ1x1MzAwMlx1OEJFNlx1NjBDNVx1ODlDMVx1RkYxQVx1NjNBN1x1NTIzNlx1NTY2OFx1NjU4N1x1Njg2M1xuICAgKi9cblxuICAvKipcbiAgICogc3FsaXRlXHU2NTcwXHU2MzZFXHU1RTkzXHU2NENEXHU0RjVDXG4gICAqLyAgIFxuICBhc3luYyBzcWxpdGVkYk9wZXJhdGlvbihhcmdzOiBTcWxpdGVkYk9wZXJhdGlvbkFyZ3MpOiBQcm9taXNlPFNxbGl0ZWRiT3BlcmF0aW9uUmVzdWx0PiB7XG4gICAgY29uc3QgeyBhY3Rpb24sIGluZm8sIGRlbGV0ZV9uYW1lLCB1cGRhdGVfbmFtZSwgdXBkYXRlX2FnZSwgc2VhcmNoX2FnZSwgZGF0YV9kaXIgfSA9IGFyZ3M7XG5cbiAgICBjb25zdCBkYXRhOiBTcWxpdGVkYk9wZXJhdGlvblJlc3VsdCA9IHtcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlc3VsdDogbnVsbCxcbiAgICAgIGFsbF9saXN0OiBbXSxcbiAgICAgIGNvZGU6IDBcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIHRlc3RcbiAgICAgIHNxbGl0ZWRiU2VydmljZS5nZXREYXRhRGlyKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgZGF0YS5jb2RlID0gLTE7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnYWRkJyA6XG4gICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuYWRkVGVzdERhdGFTcWxpdGUoaW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZWwnIDpcbiAgICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZGVsVGVzdERhdGFTcWxpdGUoZGVsZXRlX25hbWUpOztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1cGRhdGUnIDpcbiAgICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UudXBkYXRlVGVzdERhdGFTcWxpdGUodXBkYXRlX25hbWUsIHVwZGF0ZV9hZ2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dldCcgOlxuICAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5nZXRUZXN0RGF0YVNxbGl0ZShzZWFyY2hfYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnZXREYXRhRGlyJyA6XG4gICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmdldERhdGFEaXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXREYXRhRGlyJyA6XG4gICAgICAgIGlmIChkYXRhX2Rpcikge1xuICAgICAgICAgIGF3YWl0IHNxbGl0ZWRiU2VydmljZS5zZXRDdXN0b21EYXRhRGlyKGRhdGFfZGlyKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhazsgICAgICAgICAgICBcbiAgICB9XG5cbiAgICBkYXRhLmFsbF9saXN0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmdldEFsbFRlc3REYXRhU3FsaXRlKCk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIFx1OEMwM1x1NzUyOFx1NTE3Nlx1NUI4M1x1N0EwQlx1NUU4Rlx1RkYwOGV4ZVx1MzAwMWJhc2hcdTdCNDlcdTUzRUZcdTYyNjdcdTg4NENcdTdBMEJcdTVFOEZcdUZGMDlcbiAgICogXG4gICAqL1xuICBvcGVuU29mdHdhcmUoYXJnczogeyBzb2Z0TmFtZTogc3RyaW5nIH0pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHNvZnROYW1lIH0gPSBhcmdzO1xuICAgIGNvbnN0IHNvZnR3YXJlUGF0aCA9IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCBzb2Z0TmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ1tvcGVuU29mdHdhcmVdIHNvZnR3YXJlUGF0aDonLCBzb2Z0d2FyZVBhdGgpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU3QTBCXHU1RThGXHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHNvZnR3YXJlUGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gXHU1NDdEXHU0RUU0XHU4ODRDXHU1QjU3XHU3QjI2XHU0RTMyIFx1NUU3NiBcdTYyNjdcdTg4NEMsIHN0YXJ0IFx1NTQ3RFx1NEVFNFx1NTQwRVx1OTc2Mlx1NzY4NFx1OERFRlx1NUY4NFx1ODk4MVx1NTJBMFx1NTNDQ1x1NUYxNVx1NTNGN1xuICAgIGNvbnN0IGNtZFN0ciA9IGBzdGFydCBcIiR7c29mdHdhcmVQYXRofVwiYDtcbiAgICBleGVjKGNtZFN0cik7XG5cbiAgICAvLyBcdTY1QjlcdTZDRDVcdTRFOENcbiAgICAvLyBcdTRGN0ZcdTc1Mjhjcm9zc1x1NkEyMVx1NTc1N1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTZENEJodHRwXHU2NzBEXHU1MkExXHU2NjJGXHU1NDI2XHU1RjAwXHU1NDJGXG4gICAqLyBcbiAgYXN5bmMgY2hlY2tIdHRwU2VydmVyKCk6IFByb21pc2U8eyBlbmFibGU6IGJvb2xlYW47IHNlcnZlcjogc3RyaW5nIH0+IHtcbiAgICBjb25zdCB7IGVuYWJsZSwgcHJvdG9jb2wsIGhvc3QsIHBvcnQgfSA9IChnZXRDb25maWcoKSBhcyBDb25maWcpLmh0dHBTZXJ2ZXI7XG4gICAgY29uc3QgdXJsID0gcHJvdG9jb2wgKyBob3N0ICsgJzonICsgcG9ydDtcbiAgICBjb25zb2xlLmxvZygnW2NoZWNrSHR0cFNlcnZlcl0gdXJsOicsIHVybCk7XG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIGVuYWJsZTogZW5hYmxlLFxuICAgICAgc2VydmVyOiB1cmxcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU0RTAwXHU0RTJBIGh0dHAgXHU4QkY3XHU2QzQyXG4gICAqIGFyZ3MgXHU2NjJGIFx1NTI0RFx1N0FFRlx1NEYyMFx1NzY4NFx1NTNDMlx1NjU3MFxuICAgKiBjdHggXHU2NjJGIGtvYSBcdTc2ODQgY3R4IFx1NUJGOVx1OEM2MVxuICAgKi9cbiAgYXN5bmMgZG9IdHRwUmVxdWVzdChhcmdzOiB7IGlkOiBzdHJpbmcgfSwgY3R4OiBDb250ZXh0ICYgeyByZXF1ZXN0OiB7IGJvZHk/OiB1bmtub3duIH0gfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGh0dHBJbmZvID0ge1xuICAgICAgYXJncyxcbiAgICAgIG1ldGhvZDogY3R4LnJlcXVlc3QubWV0aG9kLFxuICAgICAgcXVlcnk6IGN0eC5yZXF1ZXN0LnF1ZXJ5LFxuICAgICAgYm9keTogY3R4LnJlcXVlc3QuYm9keVxuICAgIH1cbiAgICBsb2dnZXIuaW5mbygnaHR0cEluZm86JywgaHR0cEluZm8pO1xuXG4gICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGRpciA9IGVsZWN0cm9uQXBwLmdldFBhdGgoaWQgYXMgUGFyYW1ldGVyczx0eXBlb2YgZWxlY3Ryb25BcHAuZ2V0UGF0aD5bMF0pO1xuICAgIHNoZWxsLm9wZW5QYXRoKGRpcik7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFMDBcdTRFMkFzb2NrZXQgaW9cdThCRjdcdTZDNDJcdThCQkZcdTk1RUVcdTZCNjRcdTY1QjlcdTZDRDVcbiAgICovXG4gIGFzeW5jIGRvU29ja2V0UmVxdWVzdChhcmdzOiB7IGlkOiBzdHJpbmcgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHsgaWQgfSA9IGFyZ3M7XG4gICAgaWYgKCFpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBkaXIgPSBlbGVjdHJvbkFwcC5nZXRQYXRoKGlkIGFzIFBhcmFtZXRlcnM8dHlwZW9mIGVsZWN0cm9uQXBwLmdldFBhdGg+WzBdKTtcbiAgICBzaGVsbC5vcGVuUGF0aChkaXIpO1xuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIFxuICAvKipcbiAgICogXHU1RjAyXHU2QjY1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXG4gICAqLyBcbiAgYXN5bmMgaXBjSW52b2tlTXNnKGFyZ3M6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IHRpbWVOb3cgPSBkYXlqcygpLmZvcm1hdCgnWVlZWS1NTS1ERCBISDptbTpzcycpO1xuICAgIGNvbnN0IGRhdGEgPSBhcmdzICsgJyAtICcgKyB0aW1lTm93O1xuICAgIFxuICAgIHJldHVybiBkYXRhO1xuICB9ICBcblxuICAvKipcbiAgICogXHU1NDBDXHU2QjY1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXG4gICAqLyBcbiAgYXN5bmMgaXBjU2VuZFN5bmNNc2coYXJnczogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgdGltZU5vdyA9IGRheWpzKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG4gICAgY29uc3QgZGF0YSA9IGFyZ3MgKyAnIC0gJyArIHRpbWVOb3c7XG4gICAgXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdTUzQ0NcdTU0MTFcdTVGMDJcdTZCNjVcdTkwMUFcdTRGRTFcbiAgICovXG4gIGlwY1NlbmRNc2coYXJnczogeyB0eXBlOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZyB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHR5cGUsIGNvbnRlbnQgfSA9IGFyZ3M7XG4gICAgY29uc3QgZGF0YSA9IGZyYW1ld29ya1NlcnZpY2UuYm90aFdheU1lc3NhZ2UodHlwZSwgY29udGVudCwgZXZlbnQpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU0RUZCXHU1MkExXG4gICAqL1xuICBzb21lSm9iKGFyZ3M6IHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmcgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmc7IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQgfSB7XG4gICAgY29uc3QgeyBqb2JJZCwgYWN0aW9ufSA9IGFyZ3M7XG4gICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG5cbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgcmVzdWx0ID0gZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrOyAgICAgICBcbiAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGF1c2UnOlxuICAgICAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7ICBcbiAgICAgIGNhc2UgJ3Jlc3VtZSc6XG4gICAgICAgIGZyYW1ld29ya1NlcnZpY2UuZG9Kb2Ioam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhazsgICBcbiAgICAgIGRlZmF1bHQ6ICBcbiAgICB9XG4gICAgXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICBqb2JJZCxcbiAgICAgIGFjdGlvbixcbiAgICAgIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFcdTRFRkJcdTUyQTFcdTZDNjBcbiAgICovIFxuICBhc3luYyBjcmVhdGVQb29sKGFyZ3M6IHsgbnVtYmVyOiBudW1iZXIgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBudW0gPSBhcmdzLm51bWJlcjtcbiAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvQ3JlYXRlUG9vbChudW0sIGV2ZW50KTtcblxuICAgIC8vIHRlc3QgbW9uaXRvclxuICAgIGZyYW1ld29ya1NlcnZpY2UubW9uaXRvckpvYigpO1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1OTAxQVx1OEZDN1x1OEZEQlx1N0EwQlx1NkM2MFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVxuICAgKi9cbiAgYXN5bmMgc29tZUpvYkJ5UG9vbChhcmdzOiB7IGpvYklkOiBzdHJpbmc7IGFjdGlvbjogc3RyaW5nIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBQcm9taXNlPHsgam9iSWQ6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmc7IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfT4ge1xuICAgIGNvbnN0IHsgam9iSWQsIGFjdGlvbiB9ID0gYXJncztcbiAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdydW4nOlxuICAgICAgICByZXN1bHQgPSBhd2FpdCBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iQnlQb29sKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIGxldCBkYXRhID0ge1xuICAgICAgam9iSWQsXG4gICAgICBhY3Rpb24sXG4gICAgICByZXN1bHRcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5XHU2NUIwXHU3MjQ4XHU2NzJDXG4gICAqL1xuICBjaGVja0ZvclVwZGF0ZXIoKTogdm9pZCB7IFxuICAgIGF1dG9VcGRhdGVyU2VydmljZS5jaGVja1VwZGF0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTRFMEJcdThGN0RcdTY1QjBcdTcyNDhcdTY3MkNcbiAgICovXG4gIGRvd25sb2FkQXBwKCk6IHZvaWQge1xuICAgIGF1dG9VcGRhdGVyU2VydmljZS5kb3dubG9hZCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTZENEJcdThCRDVcdTYzQTVcdTUzRTNcbiAgICovIFxuICBoZWxsbyhhcmdzOiB1bmtub3duKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ2hlbGxvICcsIGFyZ3MpO1xuICB9ICAgXG59XG5leHBvcnQgZGVmYXVsdCBGcmFtZXdvcmtDb250cm9sbGVyO1xuIiwgImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQnJvd3NlcldpbmRvdywgQnJvd3NlcldpbmRvd0NvbnN0cnVjdG9yT3B0aW9ucywgTm90aWZpY2F0aW9uLCBOb3RpZmljYXRpb25Db25zdHJ1Y3Rvck9wdGlvbnMsIElwY01haW5FdmVudCwgRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5pbXBvcnQgeyBpc0RldiwgaXNQcm9kLCBnZXRCYXNlRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlL2NvbmZpZyc7XG5pbXBvcnQgeyBpc0ZpbGVQcm90b2NvbCB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBXaW5kb3dcbiAqIEBjbGFzc1xuICovXG5pbnRlcmZhY2UgQ3JlYXRlV2luZG93QXJncyB7XG4gIHR5cGU6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB3aW5kb3dOYW1lOiBzdHJpbmc7XG4gIHdpbmRvd1RpdGxlOiBzdHJpbmc7XG59XG5cbmNsYXNzIFdpbmRvd1NlcnZpY2Uge1xuICBwcml2YXRlIG15Tm90aWZpY2F0aW9uOiBOb3RpZmljYXRpb24gfCBudWxsO1xuICBwcml2YXRlIHdpbmRvd3M6IFJlY29yZDxzdHJpbmcsIEJyb3dzZXJXaW5kb3c+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubXlOb3RpZmljYXRpb24gPSBudWxsO1xuICAgIHRoaXMud2luZG93cyA9IHt9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHdpbmRvd1xuICAgKi9cbiAgY3JlYXRlV2luZG93KGFyZ3M6IENyZWF0ZVdpbmRvd0FyZ3MpOiBudW1iZXIge1xuICAgIGNvbnN0IHsgdHlwZSwgY29udGVudCwgd2luZG93TmFtZSwgd2luZG93VGl0bGUgfSA9IGFyZ3M7XG4gICAgbGV0IGNvbnRlbnRVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGlmICh0eXBlID09ICdodG1sJykge1xuICAgICAgY29udGVudFVybCA9IHBhdGguam9pbignZmlsZTovLycsIGdldEJhc2VEaXIoKSwgY29udGVudClcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3dlYicpIHtcbiAgICAgIGNvbnRlbnRVcmwgPSBjb250ZW50O1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAndnVlJykge1xuICAgICAgbGV0IGFkZHIgPSAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJ1xuICAgICAgaWYgKGlzUHJvZCgpKSB7XG4gICAgICAgIGNvbnN0IG1haW5TZXJ2ZXIgPSBnZXRDb25maWcoKS5tYWluU2VydmVyIGFzIENvbmZpZ1snbWFpblNlcnZlciddICYgeyBob3N0Pzogc3RyaW5nOyBwb3J0PzogbnVtYmVyIH07XG4gICAgICAgIGlmIChpc0ZpbGVQcm90b2NvbChtYWluU2VydmVyLnByb3RvY29sKSkge1xuICAgICAgICAgIGFkZHIgPSBtYWluU2VydmVyLnByb3RvY29sICsgcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgbWFpblNlcnZlci5pbmRleFBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZHIgPSBtYWluU2VydmVyLnByb3RvY29sICsgKG1haW5TZXJ2ZXIuaG9zdCA/PyAnJykgKyAobWFpblNlcnZlci5wb3J0ID8gJzonICsgbWFpblNlcnZlci5wb3J0IDogJycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnRVcmwgPSBhZGRyICsgY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc29tZVxuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKCdbY3JlYXRlV2luZG93XSB1cmw6ICcsIGNvbnRlbnRVcmwpO1xuICAgIGNvbnN0IG9wdDogQnJvd3NlcldpbmRvd0NvbnN0cnVjdG9yT3B0aW9ucyA9IHtcbiAgICAgIHRpdGxlOiB3aW5kb3dUaXRsZSxcbiAgICAgIHg6IDEwLFxuICAgICAgeTogMTAsXG4gICAgICB3aWR0aDogOTgwLCBcbiAgICAgIGhlaWdodDogNjUwLFxuICAgICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2UsXG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHdpbiA9IG5ldyBCcm93c2VyV2luZG93KG9wdCk7XG4gICAgY29uc3Qgd2luQ29udGVudHNJZCA9IHdpbi53ZWJDb250ZW50cy5pZDtcbiAgICBpZiAoY29udGVudFVybCkge1xuICAgICAgd2luLmxvYWRVUkwoY29udGVudFVybCk7XG4gICAgfVxuICAgIGlmIChpc0RldigpKSB7XG4gICAgICB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgfVxuXG4gICAgdGhpcy53aW5kb3dzW3dpbmRvd05hbWVdID0gd2luO1xuXG4gICAgcmV0dXJuIHdpbkNvbnRlbnRzSWQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBHZXQgd2luZG93IGNvbnRlbnRzIGlkXG4gICAqL1xuICBnZXRXQ2lkKGFyZ3M6IHsgd2luZG93TmFtZTogc3RyaW5nIH0pOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCB7IHdpbmRvd05hbWUgfSA9IGFyZ3M7XG4gICAgbGV0IHdpbjogQnJvd3NlcldpbmRvdyB8IG51bGw7XG4gICAgaWYgKHdpbmRvd05hbWUgPT0gJ21haW4nKSB7XG4gICAgICB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbiA9IHRoaXMud2luZG93c1t3aW5kb3dOYW1lXTtcbiAgICB9XG4gICAgaWYgKCF3aW4pIHJldHVybiBudWxsO1xuICAgIFxuICAgIHJldHVybiB3aW4ud2ViQ29udGVudHMuaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVhbGl6ZSBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHdpbmRvd3MgdGhyb3VnaCB0aGUgdHJhbnNmZXIgb2YgdGhlIG1haW4gcHJvY2Vzc1xuICAgKi9cbiAgY29tbXVuaWNhdGUoYXJnczogeyByZWNlaXZlcjogc3RyaW5nOyBjb250ZW50OiB1bmtub3duIH0pOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlY2VpdmVyLCBjb250ZW50IH0gPSBhcmdzO1xuICAgIGlmIChyZWNlaXZlciA9PSAnbWFpbicpIHtcbiAgICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICAgIGlmICghd2luKSByZXR1cm47XG4gICAgICB3aW4ud2ViQ29udGVudHMuc2VuZCgnY29udHJvbGxlci9vcy93aW5kb3cyVG9XaW5kb3cxJywgY29udGVudCk7XG4gICAgfSBlbHNlIGlmIChyZWNlaXZlciA9PSAnd2luZG93MicpIHtcbiAgICAgIGNvbnN0IHdpbiA9IHRoaXMud2luZG93c1tyZWNlaXZlcl07XG4gICAgICB3aW4ud2ViQ29udGVudHMuc2VuZCgnY29udHJvbGxlci9vcy93aW5kb3cxVG9XaW5kb3cyJywgY29udGVudCk7XG4gICAgfVxuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlTm90aWZpY2F0aW9uXG4gICAqL1xuICBjcmVhdGVOb3RpZmljYXRpb24ob3B0aW9uczogTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zICYgeyBjbGlja0V2ZW50PzogYm9vbGVhbjsgY2xvc2VFdmVudD86IGJvb2xlYW4gfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY29udHJvbGxlci9vcy9zZW5kTm90aWZpY2F0aW9uJztcbiAgICB0aGlzLm15Tm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbihvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zLmNsaWNrRXZlbnQpIHtcbiAgICAgIHRoaXMubXlOb3RpZmljYXRpb24ub24oJ2NsaWNrJywgKF9lOiBFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgIHR5cGU6ICdjbGljaycsXG4gICAgICAgICAgbXNnOiAnXHU2MEE4XHU3MEI5XHU1MUZCXHU0RTg2XHU5MDFBXHU3N0U1XHU2RDg4XHU2MDZGJ1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnJlcGx5KGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNsb3NlRXZlbnQpIHtcbiAgICAgIHRoaXMubXlOb3RpZmljYXRpb24ub24oJ2Nsb3NlJywgKF9lOiBFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgICAgbXNnOiAnXHU2MEE4XHU1MTczXHU5NUVEXHU0RTg2XHU5MDFBXHU3N0U1XHU2RDg4XHU2MDZGJ1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnJlcGx5KGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMubXlOb3RpZmljYXRpb24uc2hvdygpO1xuICB9XG5cbn1cbmV4cG9ydCBjb25zdCB3aW5kb3dTZXJ2aWNlID0gbmV3IFdpbmRvd1NlcnZpY2UoKTsgIFxuIiwgImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIGFwcCBhcyBlbGVjdHJvbkFwcCwgZGlhbG9nLCBzaGVsbCwgTm90aWZpY2F0aW9uLCBJcGNNYWluRXZlbnQsXG4gIE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucyxcbn0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgd2luZG93U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3Mvd2luZG93JztcblxuLyoqXG4gKiBleGFtcGxlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgT3NDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIEFsbCBtZXRob2RzIHJlY2VpdmUgdHdvIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIGFyZ3MgUGFyYW1ldGVycyB0cmFuc21pdHRlZCBieSB0aGUgZnJvbnRlbmRcbiAgICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgYXJlIG9ubHkgYXZhaWxhYmxlIGR1cmluZyBJUEMgY29tbXVuaWNhdGlvbi4gRm9yIGRldGFpbHMsIHBsZWFzZSByZWZlciB0byB0aGUgY29udHJvbGxlciBkb2N1bWVudGF0aW9uXG4gICAqL1xuXG4gIC8qKlxuICAgKiBNZXNzYWdlIHByb21wdCBkaWFsb2cgYm94XG4gICAqL1xuICBtZXNzYWdlU2hvdygpOiBzdHJpbmcge1xuICAgIGRpYWxvZy5zaG93TWVzc2FnZUJveFN5bmMoe1xuICAgICAgdHlwZTogJ2luZm8nLCAvLyBcIm5vbmVcIiwgXCJpbmZvXCIsIFwiZXJyb3JcIiwgXCJxdWVzdGlvblwiIFx1NjIxNlx1ODAwNSBcIndhcm5pbmdcIlxuICAgICAgdGl0bGU6ICdDdXN0b20gVGl0bGUnLFxuICAgICAgbWVzc2FnZTogJ0N1c3RvbWl6ZSBtZXNzYWdlIGNvbnRlbnQnLFxuICAgICAgZGV0YWlsOiAnT3RoZXIgYWRkaXRpb25hbCBpbmZvcm1hdGlvbidcbiAgICB9KVxuICBcbiAgICByZXR1cm4gJ09wZW5lZCB0aGUgbWVzc2FnZSBib3gnO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lc3NhZ2UgcHJvbXB0IGFuZCBjb25maXJtYXRpb24gZGlhbG9nIGJveFxuICAgKi9cbiAgbWVzc2FnZVNob3dDb25maXJtKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzID0gZGlhbG9nLnNob3dNZXNzYWdlQm94U3luYyh7XG4gICAgICB0eXBlOiAnaW5mbycsXG4gICAgICB0aXRsZTogJ0N1c3RvbSBUaXRsZScsXG4gICAgICBtZXNzYWdlOiAnQ3VzdG9taXplIG1lc3NhZ2UgY29udGVudCcsXG4gICAgICBkZXRhaWw6ICdPdGhlciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uJyxcbiAgICAgIGNhbmNlbElkOiAxLCAvLyBJbmRleCBvZiBidXR0b25zIHVzZWQgdG8gY2FuY2VsIGRpYWxvZyBib3hlc1xuICAgICAgZGVmYXVsdElkOiAwLCAvLyBTZXQgZGVmYXVsdCBzZWxlY3RlZCBidXR0b25cbiAgICAgIGJ1dHRvbnM6IFsnY29uZmlybScsICdjYW5jZWwnXSwgXG4gICAgfSlcbiAgICBsZXQgZGF0YSA9IChyZXMgPT09IDApID8gJ2NsaWNrIHRoZSBjb25maXJtIGJ1dHRvbicgOiAnY2xpY2sgdGhlIGNhbmNlbCBidXR0b24nO1xuICBcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgRGlyZWN0b3J5XG4gICAqL1xuICBzZWxlY3RGb2xkZXIoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nU3luYyh7XG4gICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknLCAnY3JlYXRlRGlyZWN0b3J5J11cbiAgICB9KTtcblxuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHJldHVybiBmaWxlUGF0aHNbMF07XG4gIH0gXG5cbiAgLyoqXG4gICAqIG9wZW4gZGlyZWN0b3J5XG4gICAqL1xuICBvcGVuRGlyZWN0b3J5KGFyZ3M6IHsgaWQ6IHN0cmluZyB9KTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBpZCB9ID0gYXJncztcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBkaXIgPSAnJztcbiAgICBpZiAocGF0aC5pc0Fic29sdXRlKGlkKSkge1xuICAgICAgZGlyID0gaWQ7XG4gICAgfSBlbHNlIHtcbiAgICBkaXIgPSBlbGVjdHJvbkFwcC5nZXRQYXRoKGlkIGFzIFBhcmFtZXRlcnM8dHlwZW9mIGVsZWN0cm9uQXBwLmdldFBhdGg+WzBdKTtcbiAgICB9XG5cbiAgICBzaGVsbC5vcGVuUGF0aChkaXIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCBQaWN0dXJlXG4gICAqL1xuICBzZWxlY3RQaWMoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gZGlhbG9nLnNob3dPcGVuRGlhbG9nU3luYyh7XG4gICAgICB0aXRsZTogJ3NlbGVjdCBwaWMnLFxuICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZSddLFxuICAgICAgZmlsdGVyczogW1xuICAgICAgICB7IG5hbWU6ICdJbWFnZXMnLCBleHRlbnNpb25zOiBbJ2pwZycsICdwbmcnLCAnZ2lmJ10gfSxcbiAgICAgIF1cbiAgICB9KTtcbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGhzWzBdKTtcbiAgICAgIGNvbnN0IHBpYyA9ICAnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwnICsgZGF0YS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICByZXR1cm4gcGljO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9ICAgXG5cbiAgLyoqXG4gICAqIE9wZW4gYSBuZXcgd2luZG93XG4gICAqL1xuICBjcmVhdGVXaW5kb3coYXJnczogeyB0eXBlOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgd2luZG93TmFtZTogc3RyaW5nOyB3aW5kb3dUaXRsZTogc3RyaW5nIH0pOiBudW1iZXIge1xuICAgIGNvbnN0IHdjaWQgPSB3aW5kb3dTZXJ2aWNlLmNyZWF0ZVdpbmRvdyhhcmdzKTtcbiAgICByZXR1cm4gd2NpZDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEdldCBXaW5kb3cgY29udGVudHMgaWRcbiAgICovXG4gIGdldFdDaWQoYXJnczogeyB3aW5kb3dOYW1lOiBzdHJpbmcgfSk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IHdjaWQgPSB3aW5kb3dTZXJ2aWNlLmdldFdDaWQoYXJncyk7XG4gICAgcmV0dXJuIHdjaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVhbGl6ZSBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHdpbmRvd3MgdGhyb3VnaCB0aGUgdHJhbnNmZXIgb2YgdGhlIG1haW4gcHJvY2Vzc1xuICAgKi9cbiAgd2luZG93MVRvV2luZG93MihhcmdzOiB7IHJlY2VpdmVyOiBzdHJpbmc7IGNvbnRlbnQ6IHVua25vd24gfSwgX2V2ZW50OiBJcGNNYWluRXZlbnQpOiB2b2lkIHtcbiAgICB3aW5kb3dTZXJ2aWNlLmNvbW11bmljYXRlKGFyZ3MpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFsaXplIGNvbW11bmljYXRpb24gYmV0d2VlbiB0d28gd2luZG93cyB0aHJvdWdoIHRoZSB0cmFuc2ZlciBvZiB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICB3aW5kb3cyVG9XaW5kb3cxKGFyZ3M6IHsgcmVjZWl2ZXI6IHN0cmluZzsgY29udGVudDogdW5rbm93biB9LCBfZXZlbnQ6IElwY01haW5FdmVudCk6IHZvaWQge1xuICAgIHdpbmRvd1NlcnZpY2UuY29tbXVuaWNhdGUoYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBzeXN0ZW0gbm90aWZpY2F0aW9uc1xuICAgKi9cbiAgc2VuZE5vdGlmaWNhdGlvbihhcmdzOiB7IHRpdGxlPzogc3RyaW5nOyBzdWJ0aXRsZT86IHN0cmluZzsgYm9keT86IHN0cmluZzsgc2lsZW50PzogYm9vbGVhbiB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogYm9vbGVhbiB8IHN0cmluZyB7XG4gICAgY29uc3QgeyB0aXRsZSwgc3VidGl0bGUsIGJvZHksIHNpbGVudH0gPSBhcmdzO1xuXG4gICAgaWYgKCFOb3RpZmljYXRpb24uaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgcmV0dXJuICdcdTVGNTNcdTUyNERcdTdDRkJcdTdFREZcdTRFMERcdTY1MkZcdTYzMDFcdTkwMUFcdTc3RTUnO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucyA9IHt9O1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgb3B0aW9ucy50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgICBpZiAoc3VidGl0bGUpIHtcbiAgICAgIG9wdGlvbnMuc3VidGl0bGUgPSBzdWJ0aXRsZTtcbiAgICB9XG4gICAgaWYgKGJvZHkpIHtcbiAgICAgIG9wdGlvbnMuYm9keSA9IGJvZHk7XG4gICAgfVxuICAgIGlmIChzaWxlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0aW9ucy5zaWxlbnQgPSBzaWxlbnQ7XG4gICAgfVxuICAgIHdpbmRvd1NlcnZpY2UuY3JlYXRlTm90aWZpY2F0aW9uKG9wdGlvbnMsIGV2ZW50KTtcblxuICAgIHJldHVybiB0cnVlXG4gIH0gICBcbn1cbmV4cG9ydCBkZWZhdWx0IE9zQ29udHJvbGxlcjtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBjb250cm9sbGVyIHJlZ2lzdHJ5IC0gZG8gbm90IGVkaXRcbmdsb2JhbC5fX0VFX0NPTlRST0xMRVJfUkVHSVNUUllfXyA9IFtcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2Nyb3NzLnRzXCIsIHByb3BlcnRpZXM6IFtcImNyb3NzXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY3Jvc3MudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2VmZmVjdC50c1wiLCBwcm9wZXJ0aWVzOiBbXCJlZmZlY3RcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9lZmZlY3QudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2V4YW1wbGUudHNcIiwgcHJvcGVydGllczogW1wiZXhhbXBsZVwiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2V4YW1wbGUudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL2ZyYW1ld29yay50c1wiLCBwcm9wZXJ0aWVzOiBbXCJmcmFtZXdvcmtcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9mcmFtZXdvcmsudHNcIik7IH0gfSxcbiAgeyBmdWxscGF0aDogXCJjb250cm9sbGVyL29zLnRzXCIsIHByb3BlcnRpZXM6IFtcIm9zXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vb3MudHNcIik7IH0gfVxuXTsiLCAiaW1wb3J0IHsgYXBwIGFzIGVsZWN0cm9uQXBwLCBzY3JlZW4gfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93IH0gZnJvbSAnZWUtY29yZS9lbGVjdHJvbic7XG5cbmNsYXNzIExpZmVjeWNsZSB7XG4gIC8qKlxuICAgKiBjb3JlIGFwcCBoYXZlIGJlZW4gbG9hZGVkXG4gICAqL1xuICBhc3luYyByZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbygnW2xpZmVjeWNsZV0gcmVhZHknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlbGVjdHJvbiBhcHAgcmVhZHlcbiAgICovXG4gIGFzeW5jIGVsZWN0cm9uQXBwUmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIGVsZWN0cm9uLWFwcC1yZWFkeScpO1xuXG4gICAgLy8gV2hlbiBkb3VibGUgY2xpY2tpbmcgdGhlIGljb24sIGRpc3BsYXkgdGhlIG9wZW5lZCB3aW5kb3dcbiAgICBlbGVjdHJvbkFwcC5vbignc2Vjb25kLWluc3RhbmNlJywgKCkgPT4ge1xuICAgICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgICAgaWYgKCF3aW4pIHJldHVybjtcbiAgICAgIGlmICh3aW4uaXNNaW5pbWl6ZWQoKSkge1xuICAgICAgICB3aW4ucmVzdG9yZSgpO1xuICAgICAgfVxuICAgICAgd2luLnNob3coKTtcbiAgICAgIHdpbi5mb2N1cygpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIG1haW4gd2luZG93IGhhdmUgYmVlbiBsb2FkZWRcbiAgICovXG4gIGFzeW5jIHdpbmRvd1JlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSB3aW5kb3ctcmVhZHknKTtcblxuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICBpZiAoIXdpbikgcmV0dXJuO1xuXG4gICAgLy8gVGhlIHdpbmRvdyBpcyBjZW50ZXJlZCBhbmQgc2NhbGVkIHByb3BvcnRpb25hbGx5XG4gICAgLy8gT2J0YWluIHRoZSBzaXplIGluZm9ybWF0aW9uIG9mIHRoZSBtYWluIHNjcmVlbiwgY2FsY3VsYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSB3aW5kb3cgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSBzY3JlZW4sXG4gICAgLy8gYW5kIGNhbGN1bGF0ZSB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHVwcGVyIGxlZnQgY29ybmVyIHdoZW4gdGhlIHdpbmRvdyBpcyBjZW50ZXJlZFxuICAgIGNvbnN0IG1haW5TY3JlZW4gPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKTtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IG1haW5TY3JlZW4ud29ya0FyZWFTaXplO1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAqIDAuNyk7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgKiAwLjgpO1xuICAgIGNvbnN0IHggPSBNYXRoLmZsb29yKCh3aWR0aCAtIHdpbmRvd1dpZHRoKSAvIDIpO1xuICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKChoZWlnaHQgLSB3aW5kb3dIZWlnaHQpIC8gMik7XG4gICAgd2luLnNldEJvdW5kcyh7IHgsIHksIHdpZHRoOiB3aW5kb3dXaWR0aCwgaGVpZ2h0OiB3aW5kb3dIZWlnaHQgfSlcblxuICAgIC8vIERlbGF5ZWQgbG9hZGluZywgbm8gd2hpdGUgc2NyZWVuXG4gICAgY29uc3QgeyB3aW5kb3dzT3B0aW9uIH0gPSBnZXRDb25maWcoKTtcbiAgICBpZiAod2luZG93c09wdGlvbi5zaG93ID09IGZhbHNlKSB7XG4gICAgICB3aW4ub25jZSgncmVhZHktdG8tc2hvdycsICgpID0+IHtcbiAgICAgICAgd2luLnNob3coKTtcbiAgICAgICAgd2luLmZvY3VzKCk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBiZWZvcmUgYXBwIGNsb3NlXG4gICAqLyAgXG4gIGFzeW5jIGJlZm9yZUNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSBiZWZvcmUtY2xvc2UnKTtcbiAgfVxufVxuZXhwb3J0IHtcbiAgTGlmZWN5Y2xlXG59O1xuIiwgImltcG9ydCB7IFRyYXksIE1lbnUsIGFwcCBhcyBlbGVjdHJvbkFwcCwgQnJvd3NlcldpbmRvdywgTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMsIEV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRCYXNlRGlyIH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBnZXRNYWluV2luZG93LCBnZXRDbG9zZUFuZFF1aXQsIHNldENsb3NlQW5kUXVpdCB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuXG4vKipcbiAqIFx1NjI1OFx1NzZEOFxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRyYXlTZXJ2aWNlIHtcbiAgcHJpdmF0ZSB0cmF5OiBUcmF5IHwgbnVsbDtcbiAgcHJpdmF0ZSBjb25maWc6IHsgdGl0bGU6IHN0cmluZzsgaWNvbjogc3RyaW5nIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50cmF5ID0gbnVsbDtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHRpdGxlOiAnZWxlY3Ryb24tZWdnJyxcbiAgICAgIGljb246ICcvcHVibGljL2ltYWdlcy90cmF5LnBuZydcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXHU2MjU4XHU3NkQ4XG4gICAqL1xuICBjcmVhdGUgKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbdHJheV0gbG9hZCcpO1xuXG4gICAgY29uc3QgY2ZnID0gdGhpcy5jb25maWc7XG4gICAgY29uc3QgbWFpbldpbmRvdyA9IGdldE1haW5XaW5kb3coKTtcbiAgICBpZiAoIW1haW5XaW5kb3cpIHJldHVybjtcblxuICAgIC8vIHRyYXkgaWNvblxuICAgIGNvbnN0IGljb25QYXRoID0gcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgY2ZnLmljb24pO1xuXG4gICAgLy8gXHU2MjU4XHU3NkQ4XHU4M0RDXHU1MzU1XHU1MjlGXHU4MEZEXHU1MjE3XHU4ODY4XG4gICAgY29uc3QgdHJheU1lbnVUZW1wbGF0ZTogTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnNbXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdcdTY2M0VcdTc5M0EnLFxuICAgICAgICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1haW5XaW5kb3cuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1x1OTAwMFx1NTFGQScsXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZWxlY3Ryb25BcHAucXVpdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXVxuXG4gICAgLy8gXHU4QkJFXHU3RjZFXHU0RTAwXHU0RTJBXHU2ODA3XHU4QkM2XHVGRjBDXHU3MEI5XHU1MUZCXHU1MTczXHU5NUVEXHVGRjBDXHU2NzAwXHU1QzBGXHU1MzE2XHU1MjMwXHU2MjU4XHU3NkQ4XG4gICAgc2V0Q2xvc2VBbmRRdWl0KGZhbHNlKTtcbiAgICBtYWluV2luZG93Lm9uKCdjbG9zZScsIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgIGlmIChnZXRDbG9zZUFuZFF1aXQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBtYWluV2luZG93LmhpZGUoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBcdTk2OTBcdTg1Q0ZcdTVFOTRcdTc1MjhcdTgzRENcdTUzNTVcdTY4MEZcbiAgICBtYWluV2luZG93LnNldE1lbnVCYXJWaXNpYmlsaXR5KGZhbHNlKTtcblxuICAgIC8vIFx1NUI5RVx1NEY4Qlx1NTMxNlx1NjI1OFx1NzZEOFxuICAgIHRoaXMudHJheSA9IG5ldyBUcmF5KGljb25QYXRoKTtcbiAgICB0aGlzLnRyYXkuc2V0VG9vbFRpcChjZmcudGl0bGUpO1xuICAgIGNvbnN0IGNvbnRleHRNZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZSh0cmF5TWVudVRlbXBsYXRlKTtcbiAgICB0aGlzLnRyYXkuc2V0Q29udGV4dE1lbnUoY29udGV4dE1lbnUpO1xuICAgIC8vIFx1NURFNlx1OTUyRVx1NTM1NVx1NTFGQlx1NzY4NFx1NjVGNlx1NTAxOVx1ODBGRFx1NTkxRlx1NjYzRVx1NzkzQVx1NEUzQlx1N0E5N1x1NTNFM1xuICAgIHRoaXMudHJheS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICBtYWluV2luZG93LnNob3coKVxuICAgIH0pXG4gIH1cbn1cbmV4cG9ydCBjb25zdCB0cmF5U2VydmljZSA9IG5ldyBUcmF5U2VydmljZSgpO1xuIiwgImltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCB9IGZyb20gJ2VsZWN0cm9uJztcblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXG4gICAqL1xuICBjcmVhdGUgKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdbc2VjdXJpdHldIGxvYWQnKTtcbiAgICBjb25zdCBydW5XaXRoRGVidWcgPSBwcm9jZXNzLmFyZ3YuZmluZChmdW5jdGlvbihlOiBzdHJpbmcpe1xuICAgICAgbGV0IGlzSGFzRGVidWcgPSBlLmluY2x1ZGVzKFwiLS1pbnNwZWN0XCIpIHx8IGUuaW5jbHVkZXMoXCItLWluc3BlY3QtYnJrXCIpIHx8IGUuaW5jbHVkZXMoXCItLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydFwiKTtcbiAgICAgIHJldHVybiBpc0hhc0RlYnVnO1xuICAgIH0pXG5cbiAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMERcdTUxNDFcdThCQjhcdThGRENcdTdBMEJcdThDMDNcdThCRDVcbiAgICBpZiAocnVuV2l0aERlYnVnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZCcpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignW2Vycm9yXSBSZW1vdGUgZGVidWdnaW5nIGlzIG5vdCBhbGxvd2VkLCAgcnVuV2l0aERlYnVnOicsIHJ1bldpdGhEZWJ1Zyk7XG4gICAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XG4gICAgfVxuICB9XG59XG5leHBvcnQgY29uc3Qgc2VjdXJpdHlTZXJ2aWNlID0gbmV3IFNlY3VyaXR5U2VydmljZSgpO1xuIiwgIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiogcHJlbG9hZFx1NEUzQVx1OTg4NFx1NTJBMFx1OEY3RFx1NkEyMVx1NTc1N1x1RkYwQ1x1OEJFNVx1NjU4N1x1NEVGNlx1NUMwNlx1NEYxQVx1NTcyOFx1N0EwQlx1NUU4Rlx1NTQyRlx1NTJBOFx1NjVGNlx1NTJBMFx1OEY3RCAqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IHRyYXlTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy90cmF5JztcbmltcG9ydCB7IHNlY3VyaXR5U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3Mvc2VjdXJpdHknO1xuaW1wb3J0IHsgY3Jvc3NTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9jcm9zcyc7XG5pbXBvcnQgeyBzcWxpdGVkYlNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2RhdGFiYXNlL3NxbGl0ZWRiJztcblxuZXhwb3J0IGZ1bmN0aW9uIHByZWxvYWQoKTogdm9pZCB7XG4gIC8vIFx1NzkzQVx1NEY4Qlx1NTI5Rlx1ODBGRFx1NkEyMVx1NTc1N1x1RkYwQ1x1NTNFRlx1OTAwOVx1NjJFOVx1NjAyN1x1NEY3Rlx1NzUyOFx1NTQ4Q1x1NEZFRVx1NjUzOVxuICBsb2dnZXIuaW5mbygnW3ByZWxvYWRdIGxvYWQgNScpO1xuICB0cmF5U2VydmljZS5jcmVhdGUoKTtcbiAgc2VjdXJpdHlTZXJ2aWNlLmNyZWF0ZSgpO1xuXG4gIC8vIGdvIHNlcnZlclxuICAvL2Nyb3NzU2VydmljZS5jcmVhdGVHb1NlcnZlcigpO1xuXG4gIC8vIGluaXQgc3FsaXRlIGRiXG4gIC8vc3FsaXRlZGJTZXJ2aWNlLmluaXQoKTtcbn1cblxuXG4iLCAiaW1wb3J0IHsgRWxlY3Ryb25FZ2cgfSBmcm9tICdlZS1jb3JlJztcbmltcG9ydCB7IExpZmVjeWNsZSB9IGZyb20gJy4vcHJlbG9hZC9saWZlY3ljbGUnO1xuaW1wb3J0IHsgcHJlbG9hZCB9IGZyb20gJy4vcHJlbG9hZCc7XG5cbi8vIG5ldyBhcHBcbmNvbnN0IGFwcCA9IG5ldyBFbGVjdHJvbkVnZygpO1xuXG4vLyByZWdpc3RlciBsaWZlY3ljbGVcbmNvbnN0IGxpZmUgPSBuZXcgTGlmZWN5Y2xlKCk7XG5hcHAucmVnaXN0ZXIoXCJyZWFkeVwiLCBsaWZlLnJlYWR5KTtcbmFwcC5yZWdpc3RlcihcImVsZWN0cm9uLWFwcC1yZWFkeVwiLCBsaWZlLmVsZWN0cm9uQXBwUmVhZHkpO1xuYXBwLnJlZ2lzdGVyKFwid2luZG93LXJlYWR5XCIsIGxpZmUud2luZG93UmVhZHkpO1xuYXBwLnJlZ2lzdGVyKFwiYmVmb3JlLWNsb3NlXCIsIGxpZmUuYmVmb3JlQ2xvc2UpO1xuXG4vLyByZWdpc3RlciBwcmVsb2FkXG5hcHAucmVnaXN0ZXIoXCJwcmVsb2FkXCIsIHByZWxvYWQpO1xuXG4vLyBydW5cbmFwcC5ydW4oKTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBidW5kbGUgZW50cnkgLSBkbyBub3QgZWRpdFxucmVxdWlyZSgnYXBwOmNvbmZpZy1yZWdpc3RyeScpO1xucmVxdWlyZSgnYXBwOmNvbnRyb2xsZXItcmVnaXN0cnknKTtcbnJlcXVpcmUoXCIuL21haW4udHNcIik7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFDQSxXQU1PO0FBUFA7QUFBQTtBQUFBLGtCQUFpQjtBQUNqQixnQkFBMkI7QUFNM0IsSUFBTyx5QkFBUSxNQUF1QjtBQUNwQyxhQUFPO0FBQUEsUUFDTCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixlQUFlO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxRQUFRO0FBQUEsVUFDUixVQUFVO0FBQUEsVUFDVixXQUFXO0FBQUEsVUFDWCxnQkFBZ0I7QUFBQTtBQUFBLFlBRWQsa0JBQWtCO0FBQUE7QUFBQSxZQUNsQixpQkFBaUI7QUFBQTtBQUFBLFVBRW5CO0FBQUEsVUFDQSxPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsVUFDTixNQUFNLFlBQUFBLFFBQUssU0FB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QUssa0JBQWtCO0FBQzlCLGNBQVksT0FBTztBQUNuQixrQkFBZ0IsT0FBTztBQU96QjtBQXJCQSxJQUlBQztBQUpBO0FBQUE7QUFJQSxJQUFBQSxjQUF1QjtBQUN2QjtBQUNBO0FBQUE7QUFBQTs7O0FDTkE7QUFBQSxvQkFLTSxLQUdBO0FBUk47QUFBQTtBQUFBLHFCQUE0QjtBQUM1QjtBQUNBO0FBR0EsSUFBTSxNQUFNLElBQUksMkJBQVk7QUFHNUIsSUFBTSxPQUFPLElBQUksVUFBVTtBQUMzQixRQUFJLFNBQVMsU0FBUyxLQUFLLEtBQUs7QUFDaEMsUUFBSSxTQUFTLHNCQUFzQixLQUFLLGdCQUFnQjtBQUN4RCxRQUFJLFNBQVMsZ0JBQWdCLEtBQUssV0FBVztBQUM3QyxRQUFJLFNBQVMsZ0JBQWdCLEtBQUssV0FBVztBQUc3QyxRQUFJLFNBQVMsV0FBVyxPQUFPO0FBRy9CLFFBQUksSUFBSTtBQUFBO0FBQUE7OztBQ2pCUjtBQUNBO0FBQ0E7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiaW1wb3J0X3BzIiwgImltcG9ydF9wYXRoIiwgInBhdGgiLCAiYXhpb3MiLCAiaW5pdF9jcm9zcyIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X2xvZyIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X3BhdGgiLCAicGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X3V0aWxzIiwgImltcG9ydF9sb2ciLCAiZWxlY3Ryb25BcHAiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9wcyIsICJpbXBvcnRfbG9nIiwgImluaXRfZnJhbWV3b3JrIiwgInBhdGgiLCAiZnMiLCAiZWxlY3Ryb25BcHAiLCAiZGF5anMiLCAiaW1wb3J0X3BhdGgiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9wcyIsICJpbXBvcnRfY29uZmlnIiwgImltcG9ydF91dGlscyIsICJpbXBvcnRfbG9nIiwgInBhdGgiLCAiaW1wb3J0X2ZzIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9lbGVjdHJvbiIsICJwYXRoIiwgImVsZWN0cm9uQXBwIiwgImZzIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfbG9nIiwgImltcG9ydF9jb25maWciLCAiZWxlY3Ryb25BcHAiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9wcyIsICJpbXBvcnRfbG9nIiwgInBhdGgiLCAiZWxlY3Ryb25BcHAiLCAiaW1wb3J0X2xvZyIsICJpbXBvcnRfZWxlY3Ryb24iLCAiZWxlY3Ryb25BcHAiLCAiaW1wb3J0X2xvZyJdCn0K
