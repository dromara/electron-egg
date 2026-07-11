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
      async _init() {
        const dbFile = import_path3.default.join((0, import_ps3.getDataDir)(), "db", this.dbname);
        const sqliteOptions = {
          timeout: 6e3,
          verbose: console.log
        };
        this.storage = new import_storage.SqliteStorage(dbFile);
        await this.storage.init(sqliteOptions);
        this.db = this.storage.db;
      }
      /*
       * change data dir (sqlite)
       */
      async changeDataDir(dir) {
        const dbFile = import_path3.default.join(dir, this.dbname);
        const sqliteOptions = {
          timeout: 6e3,
          verbose: console.log
        };
        this.storage = new import_storage.SqliteStorage(dbFile);
        await this.storage.init(sqliteOptions);
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
      async init() {
        await this._init();
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
        await this.changeDataDir(dir);
        await this.init();
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
      init() {
        import_log7.logger.info("[tray] load");
        const cfg = this.config;
        const mainWindow = (0, import_electron12.getMainWindow)();
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
  await sqlitedbService.init();
}
var import_log9;
var init_preload = __esm({
  "electron/preload/index.ts"() {
    import_log9 = require("ee-core/log");
    init_tray();
    init_security();
    init_sqlitedb();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIiwgIi4uLy4uL2VsZWN0cm9uL2NvbmZpZy9jb25maWcubG9jYWwudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29uZmlnL2NvbmZpZy5wcm9kLnRzIiwgImNvbmZpZy1yZWdpc3RyeTphcHA6Y29uZmlnLXJlZ2lzdHJ5IiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2UvY3Jvc3MudHMiLCAiLi4vLi4vZWxlY3Ryb24vY29udHJvbGxlci9jcm9zcy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2VmZmVjdC50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2V4YW1wbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9mcmFtZXdvcmsudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9kYXRhYmFzZS9iYXNlZGIudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYi50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL2F1dG9fdXBkYXRlci50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL2ZyYW1ld29yay50cyIsICIuLi8uLi9lbGVjdHJvbi9zZXJ2aWNlL29zL3dpbmRvdy50cyIsICIuLi8uLi9lbGVjdHJvbi9jb250cm9sbGVyL29zLnRzIiwgImNvbnRyb2xsZXItcmVnaXN0cnk6YXBwOmNvbnRyb2xsZXItcmVnaXN0cnkiLCAiLi4vLi4vZWxlY3Ryb24vcHJlbG9hZC9saWZlY3ljbGUudHMiLCAiLi4vLi4vZWxlY3Ryb24vc2VydmljZS9vcy90cmF5LnRzIiwgIi4uLy4uL2VsZWN0cm9uL3NlcnZpY2Uvb3Mvc2VjdXJpdHkudHMiLCAiLi4vLi4vZWxlY3Ryb24vcHJlbG9hZC9pbmRleC50cyIsICIuLi8uLi9lbGVjdHJvbi9tYWluLnRzIiwgImJ1bmRsZS1lbnRyeTphcHA6YnVuZGxlLWVudHJ5Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdldEJhc2VEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5cbi8qKlxuICogXHU5RUQ4XHU4QkE0XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpOiBQYXJ0aWFsPENvbmZpZz4gPT4ge1xuICByZXR1cm4ge1xuICAgIG9wZW5EZXZUb29sczogZmFsc2UsXG4gICAgc2luZ2xlTG9jazogdHJ1ZSxcbiAgICB3aW5kb3dzT3B0aW9uOiB7XG4gICAgICB0aXRsZTogJ2VsZWN0cm9uLWVnZycsXG4gICAgICB3aWR0aDogOTgwLFxuICAgICAgaGVpZ2h0OiA4NTAsXG4gICAgICBtaW5XaWR0aDogNDAwLFxuICAgICAgbWluSGVpZ2h0OiAzMDAsXG4gICAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgICAvL3dlYlNlY3VyaXR5OiBmYWxzZSxcbiAgICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2UsIC8vIGZhbHNlIC0+IFx1NTNFRlx1NTcyOFx1NkUzMlx1NjdEM1x1OEZEQlx1N0EwQlx1NEUyRFx1NEY3Rlx1NzUyOGVsZWN0cm9uXHU3Njg0YXBpXHVGRjBDdHJ1ZS0+XHU5NzAwXHU4OTgxYnJpZGdlLmpzKGNvbnRleHRCcmlkZ2UpXG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZSxcbiAgICAgICAgLy9wcmVsb2FkOiBwYXRoLmpvaW4oZ2V0RWxlY3Ryb25EaXIoKSwgJ3ByZWxvYWQnLCAnYnJpZGdlLmpzJyksXG4gICAgICB9LFxuICAgICAgZnJhbWU6IHRydWUsXG4gICAgICBzaG93OiB0cnVlLFxuICAgICAgaWNvbjogcGF0aC5qb2luKGdldEJhc2VEaXIoKSwgJ3B1YmxpYycsICdpbWFnZXMnLCAnbG9nby0zMi5wbmcnKSxcbiAgICB9LFxuICAgIGxvZ2dlcjoge1xuICAgICAgbGV2ZWw6ICdpbmZvJywgLy8gJ2ZhdGFsJywgJ2Vycm9yJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZScgb3IgJ3NpbGVudCdcbiAgICAgIHJvdGF0b3I6ICdkYWlseScsIC8vIGRhaWx5LCBob3VybHlcbiAgICAgIGRhdGVGb3JtYXQ6ICd5eXl5LU1NLWRkJyxcbiAgICAgIG1heFNpemU6ICcxMDBtJyxcbiAgICAgIHJlZGFjdDogW10sXG4gICAgICByZWRhY3RDZW5zb3I6ICdbUmVkYWN0ZWRdJyxcbiAgICAgIHRpbWVzdGFtcDogdHJ1ZSxcbiAgICAgIGRlcHRoTGltaXQ6IDUsXG4gICAgICB0aW1lem9uZTogJ0FzaWEvU2hhbmdoYWknLFxuICAgICAgbmFtZTogJ2VlJyxcbiAgICAgIGFwcExvZ05hbWU6ICdlZS5sb2cnLFxuICAgICAgY29yZUxvZ05hbWU6ICdlZS1jb3JlLmxvZycsXG4gICAgICBlcnJvckxvZ05hbWU6ICdlZS1lcnJvci5sb2cnXG4gICAgfSxcbiAgICByZW1vdGU6IHtcbiAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICB1cmw6ICdodHRwOi8vZWxlY3Ryb24tZWdnLmtha2E5OTYuY29tLydcbiAgICB9LFxuICAgIHNvY2tldFNlcnZlcjoge1xuICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgcG9ydDogNzA3MCxcbiAgICAgIHBhdGg6IFwiL3NvY2tldC5pby9cIixcbiAgICAgIGNvbm5lY3RUaW1lb3V0OiA0NTAwMCxcbiAgICAgIHBpbmdUaW1lb3V0OiAzMDAwMCxcbiAgICAgIHBpbmdJbnRlcnZhbDogMjUwMDAsXG4gICAgICBtYXhIdHRwQnVmZmVyU2l6ZTogMWU4LFxuICAgICAgdHJhbnNwb3J0czogW1wicG9sbGluZ1wiLCBcIndlYnNvY2tldFwiXSxcbiAgICAgIGNvcnM6IHtcbiAgICAgICAgb3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGNoYW5uZWw6ICdzb2NrZXQtY2hhbm5lbCdcbiAgICB9LFxuICAgIGh0dHBTZXJ2ZXI6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIGh0dHBzOiB7XG4gICAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICAgIGtleTogJy9wdWJsaWMvc3NsL2xvY2FsaG9zdCsxLmtleScsXG4gICAgICAgIGNlcnQ6ICcvcHVibGljL3NzbC9sb2NhbGhvc3QrMS5wZW0nXG4gICAgICB9LFxuICAgICAgcHJvdG9jb2w6ICdodHRwOi8vJyxcbiAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgICAgcG9ydDogNzA3MSxcbiAgICAgIGNvcnM6IHsgb3JpZ2luOiAnKicgfSxcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgbXVsdGlwYXJ0OiBmYWxzZSxcbiAgICAgICAgZm9ybWlkYWJsZTogeyBrZWVwRXh0ZW5zaW9uczogZmFsc2UgfVxuICAgICAgfSxcbiAgICAgIGZpbHRlclJlcXVlc3Q6IHtcbiAgICAgICAgdXJpczogW10sXG4gICAgICAgIHJldHVybkRhdGE6ICcnXG4gICAgICB9LFxuICAgIH0sXG4gICAgbWFpblNlcnZlcjoge1xuICAgICAgcHJvdG9jb2w6ICdmaWxlOi8vJyxcbiAgICAgIGluZGV4UGF0aDogJy9wdWJsaWMvZGlzdC9pbmRleC5odG1sJyxcbiAgICAgIGNoYW5uZWxTZXBhcmF0b3I6ICcvJyxcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqIERldmVsb3BtZW50IGVudmlyb25tZW50IGNvbmZpZ3VyYXRpb24sIGNvdmVyYWdlIGNvbmZpZy5kZWZhdWx0LmpzXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpOiBQYXJ0aWFsPENvbmZpZz4gPT4ge1xuICByZXR1cm4ge1xuICAgIG9wZW5EZXZUb29sczoge1xuICAgICAgbW9kZTogJ2RldGFjaCdcbiAgICB9LFxuICAgIGpvYnM6IHtcbiAgICAgIG1lc3NhZ2VMb2c6IGZhbHNlXG4gICAgfVxuICB9O1xufTtcbiIsICJpbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gJ2VlLWNvcmUnO1xuXG4vKipcbiAqICBjb3ZlcmFnZSBjb25maWcuZGVmYXVsdC5qc1xuICovXG5leHBvcnQgZGVmYXVsdCAoKTogUGFydGlhbDxDb25maWc+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuRGV2VG9vbHM6IGZhbHNlLFxuICB9O1xufTtcbiIsICIvLyBBdXRvLWdlbmVyYXRlZCBjb25maWcgcmVnaXN0cnkgLSBkbyBub3QgZWRpdFxuZ2xvYmFsLl9fRUVfQ09ORklHX1JFR0lTVFJZX18gPSBbXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmRlZmF1bHRcIiwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbmZpZy5kZWZhdWx0LnRzXCIpOyB9IH0sXG4gIHsgZmlsZW5hbWU6IFwiY29uZmlnLmxvY2FsXCIsIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9jb25maWcubG9jYWwudHNcIik7IH0gfSxcbiAgeyBmaWxlbmFtZTogXCJjb25maWcucHJvZFwiLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vY29uZmlnLnByb2QudHNcIik7IH0gfVxuXTsiLCAiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0RXh0cmFSZXNvdXJjZXNEaXIsIGdldExvZ0RpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBpcyB9IGZyb20gJ2VlLWNvcmUvdXRpbHMnO1xuaW1wb3J0IHsgY3Jvc3MgfSBmcm9tICdlZS1jb3JlL2Nyb3NzJztcbmltcG9ydCB0eXBlIHsgQ3Jvc3NUYXJnZXRDb25maWcgfSBmcm9tICdlZS1jb3JlJztcblxuLyoqXG4gKiBjcm9zc1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIENyb3NzU2VydmljZSB7XG5cbiAgaW5mbygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBpZHMgPSBjcm9zcy5nZXRQaWRzKCk7XG4gICAgbG9nZ2VyLmluZm8oJ2Nyb3NzIHBpZHM6JywgcGlkcyk7XG5cbiAgICBsZXQgbnVtID0gMTtcbiAgICBwaWRzLmZvckVhY2goKHBpZDogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgZW50aXR5ID0gY3Jvc3MuZ2V0UHJvYyhwaWQpO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gbmFtZToke2VudGl0eS5uYW1lfWApO1xuICAgICAgbG9nZ2VyLmluZm8oYHNlcnZlci0ke251bX0gY29uZmlnOmAsIGVudGl0eS5jb25maWcpO1xuICAgICAgbnVtKys7XG4gICAgfSlcblxuICAgIHJldHVybiAnaGVsbG8gZWxlY3Ryb24tZWdnJztcbiAgfVxuXG4gIGdldFVybChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHNlcnZlclVybCA9IGNyb3NzLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsO1xuICB9XG5cbiAga2lsbFNlcnZlcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0eXBlID09ICdhbGwnKSB7XG4gICAgICBjcm9zcy5raWxsQWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNyb3NzLmtpbGxCeU5hbWUobmFtZSk7XG4gICAgfVxuICB9ICBcblxuICAvKipcbiAgICogY3JlYXRlIGdvIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlR29TZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gbWV0aG9kIDE6IFVzZSB0aGUgZGVmYXVsdCBTZXR0aW5nc1xuICAgIC8vY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lKTtcblxuICAgIC8vIG1ldGhvZCAyOiBVc2UgY3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IFwiZ29cIjtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2dvYXBwJyxcbiAgICAgIGNtZDogcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdnb2FwcCcpLFxuICAgICAgZGlyZWN0b3J5OiBnZXRFeHRyYVJlc291cmNlc0RpcigpLFxuICAgICAgYXJnczogWyctLXBvcnQ9NzA3MyddLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciBuYW1lOicsIGVudGl0eS5uYW1lKTtcbiAgICBsb2dnZXIuaW5mbygnW2dvXSBzZXJ2ZXIgY29uZmlnOicsIGVudGl0eS5jb25maWcpO1xuICAgIGxvZ2dlci5pbmZvKCdbZ29dIHNlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgamF2YSBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNyZWF0ZUphdmFTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcImphdmFcIjtcbiAgICBjb25zdCBqYXJQYXRoID0gcGF0aC5qb2luKGdldEV4dHJhUmVzb3VyY2VzRGlyKCksICdqYXZhLWFwcC5qYXInKTtcbiAgICBjb25zdCBvcHQ6IENyb3NzVGFyZ2V0Q29uZmlnID0ge1xuICAgICAgbmFtZTogJ2phdmFhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS9iaW4vamF2YXcuZXhlJyksXG4gICAgICBkaXJlY3Rvcnk6IGdldEV4dHJhUmVzb3VyY2VzRGlyKCksXG4gICAgICBhcmdzOiBbJy1qYXInLCAnLXNlcnZlcicsICctWG1zNTEyTScsICctWG14NTEyTScsICctWHNzNTEyaycsICctRHNwcmluZy5wcm9maWxlcy5hY3RpdmU9cHJvZCcsIGAtRHNlcnZlci5wb3J0PTE4MDgwYCwgYC1EbG9nZ2luZy5maWxlLnBhdGg9JHtnZXRMb2dEaXIoKX1gLCBgJHtqYXJQYXRofWBdLFxuICAgICAgYXBwRXhpdDogZmFsc2UsXG4gICAgfVxuICAgIGlmIChpcy5tYWNPUygpKSB7XG4gICAgICAvLyBTZXR1cCBKYXZhIHByb2dyYW1cbiAgICAgIG9wdC5jbWQgPSBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ2pyZTEuOC4wXzIwMS5qcmUvQ29udGVudHMvSG9tZS9iaW4vamF2YScpO1xuICAgIH1cbiAgICBpZiAoaXMubGludXgoKSkge1xuICAgICAgLy8gU2V0dXAgSmF2YSBwcm9ncmFtXG4gICAgfVxuXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgY3Jvc3MuZ2V0VXJsKGVudGl0eS5uYW1lKSk7XG5cbiAgICByZXR1cm47XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBjcmVhdGUgcHl0aG9uIHNlcnZpY2VcbiAgICogSW4gdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgc2VydmljZXMgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhcHBsaWNhdGlvbnMuIFxuICAgKiBEZXZlbG9wZXJzIGNhbiB0dXJuIG9mZiB0aGUgY29uZmlndXJhdGlvbiBhbmQgY3JlYXRlIGl0IG1hbnVhbGx5LlxuICAgKi8gICBcbiAgYXN5bmMgY3JlYXRlUHl0aG9uU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIG1ldGhvZCAxOiBVc2UgdGhlIGRlZmF1bHQgU2V0dGluZ3NcbiAgICAvL2NvbnN0IGVudGl0eSA9IGF3YWl0IGNyb3NzLnJ1bihzZXJ2aWNlTmFtZSk7XG5cbiAgICAvLyBtZXRob2QgMjogVXNlIGN1c3RvbSBjb25maWd1cmF0aW9uXG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBcInB5dGhvblwiO1xuICAgIGNvbnN0IG9wdDogQ3Jvc3NUYXJnZXRDb25maWcgPSB7XG4gICAgICBuYW1lOiAncHlhcHAnLFxuICAgICAgY21kOiBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgJ3B5JywgJ3B5YXBwJyksXG4gICAgICBkaXJlY3Rvcnk6IHBhdGguam9pbihnZXRFeHRyYVJlc291cmNlc0RpcigpLCAncHknKSxcbiAgICAgIGFyZ3M6IFsnLS1wb3J0PTcwNzQnXSxcbiAgICAgIHdpbmRvd3NFeHRuYW1lOiB0cnVlLFxuICAgICAgYXBwRXhpdDogdHJ1ZSxcbiAgICB9XG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgY3Jvc3MucnVuKHNlcnZpY2VOYW1lLCBvcHQpO1xuICAgIGxvZ2dlci5pbmZvKCdzZXJ2ZXIgbmFtZTonLCBlbnRpdHkubmFtZSk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciBjb25maWc6JywgZW50aXR5LmNvbmZpZyk7XG4gICAgbG9nZ2VyLmluZm8oJ3NlcnZlciB1cmw6JywgZW50aXR5LmdldFVybCgpKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3RBcGkobmFtZTogc3RyaW5nLCB1cmxQYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3MuZ2V0VXJsKG5hbWUpO1xuICAgIGlmICghc2VydmVyVXJsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBhcGlIZWxsbyA9IHNlcnZlclVybCArIHVybFBhdGg7XG4gICAgY29uc29sZS5sb2coJ1NlcnZlciBVcmw6Jywgc2VydmVyVXJsKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3Moe1xuICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgIHVybDogYXBpSGVsbG8sXG4gICAgICB0aW1lb3V0OiAxMDAwLFxuICAgICAgcGFyYW1zLFxuICAgICAgcHJveHk6IGZhbHNlLFxuICAgIH0pO1xuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IHJlc3BvbnNlO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0gIFxufVxuZXhwb3J0IGNvbnN0IGNyb3NzU2VydmljZSA9IG5ldyBDcm9zc1NlcnZpY2UoKTsgIFxuIiwgImltcG9ydCB7IGNyb3NzU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvY3Jvc3MnO1xuXG4vKipcbiAqIENyb3NzXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgQ3Jvc3NDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIFZpZXcgcHJvY2VzcyBzZXJ2aWNlIGluZm9ybWF0aW9uXG4gICAqL1xuICBpbmZvKCk6IHN0cmluZyB7XG4gICAgY3Jvc3NTZXJ2aWNlLmluZm8oKTtcbiAgICByZXR1cm4gJ2hlbGxvIGVsZWN0cm9uLWVnZyc7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNlcnZpY2UgdXJsXG4gICAqLyAgXG4gIGFzeW5jIGdldFVybChhcmdzOiB7IG5hbWU6IHN0cmluZyB9KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7IG5hbWUgfSA9IGFyZ3M7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gY3Jvc3NTZXJ2aWNlLmdldFVybChuYW1lKTtcbiAgICByZXR1cm4gc2VydmVyVXJsIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIGtpbGwgc2VydmljZVxuICAgKiBCeSBkZWZhdWx0IChtb2RpZmlhYmxlKSwga2lsbGluZyB0aGUgcHJvY2VzcyB3aWxsIGV4aXQgdGhlIGVsZWN0cm9uIGFwcGxpY2F0aW9uLlxuICAgKi8gIFxuICBhc3luYyBraWxsU2VydmVyKGFyZ3M6IHsgdHlwZTogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgdHlwZSwgbmFtZSB9ID0gYXJncztcbiAgICBjcm9zc1NlcnZpY2Uua2lsbFNlcnZlcih0eXBlLCBuYW1lKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIHNlcnZpY2VcbiAgICovICAgXG4gIGFzeW5jIGNyZWF0ZVNlcnZlcihhcmdzOiB7IHByb2dyYW06IHN0cmluZyB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyBwcm9ncmFtIH0gPSBhcmdzO1xuICAgIGlmIChwcm9ncmFtID09ICdnbycpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVHb1NlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAocHJvZ3JhbSA9PSAnamF2YScpIHtcbiAgICAgIGNyb3NzU2VydmljZS5jcmVhdGVKYXZhU2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChwcm9ncmFtID09ICdweXRob24nKSB7XG4gICAgICBjcm9zc1NlcnZpY2UuY3JlYXRlUHl0aG9uU2VydmVyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjY2VzcyB0aGUgYXBpIGZvciB0aGUgY3Jvc3Mgc2VydmljZVxuICAgKi9cbiAgYXN5bmMgcmVxdWVzdEFwaShhcmdzOiB7IG5hbWU6IHN0cmluZzsgdXJsUGF0aDogc3RyaW5nOyBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB9KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgeyBuYW1lLCB1cmxQYXRoLCBwYXJhbXN9ID0gYXJncztcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgY3Jvc3NTZXJ2aWNlLnJlcXVlc3RBcGkobmFtZSwgdXJsUGF0aCwgcGFyYW1zKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQ3Jvc3NDb250cm9sbGVyO1xuIiwgImltcG9ydCB7IGRpYWxvZyB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3cgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuLyoqXG4gKiBlZmZlY3QgLSBkZW1vXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgRWZmZWN0Q29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBzZWxlY3QgZmlsZVxuICAgKi9cbiAgc2VsZWN0RmlsZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dTeW5jKHtcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXVxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVQYXRoc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2dpbiB3aW5kb3dcbiAgICovXG4gIGxvZ2luV2luZG93KGFyZ3M6IHsgd2lkdGg/OiBudW1iZXI7IGhlaWdodD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBhcmdzO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcblxuICAgIGNvbnN0IHNpemUgPSB7XG4gICAgICB3aWR0aDogd2lkdGggfHwgNDAwLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgMzAwXG4gICAgfVxuICAgIHdpbi5zZXRTaXplKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB3aW4uc2V0UmVzaXphYmxlKHRydWUpO1xuICAgIHdpbi5jZW50ZXIoKTtcbiAgICB3aW4uc2hvdygpO1xuICAgIHdpbi5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgd2luZG93XG4gICAqL1xuICByZXN0b3JlV2luZG93KGFyZ3M6IHsgd2lkdGg/OiBudW1iZXI7IGhlaWdodD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBhcmdzO1xuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcblxuICAgIGNvbnN0IHNpemUgPSB7XG4gICAgICB3aWR0aDogd2lkdGggfHwgOTgwLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgfHwgNjUwXG4gICAgfVxuICAgIHdpbi5zZXRTaXplKHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICB3aW4uc2V0UmVzaXphYmxlKHRydWUpO1xuICAgIHdpbi5jZW50ZXIoKTtcbiAgICB3aW4uc2hvdygpO1xuICAgIHdpbi5mb2N1cygpO1xuICB9ICAgXG59XG5leHBvcnQgZGVmYXVsdCBFZmZlY3RDb250cm9sbGVyO1xuIiwgIi8qKlxuICogZXhhbXBsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEV4YW1wbGVDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIHRlc3RcbiAgICovXG4gIGFzeW5jIHRlc3QgKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuICdoZWxsbyBlbGVjdHJvbi1lZ2cnO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBFeGFtcGxlQ29udHJvbGxlcjtcbiIsICJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBDaGlsZEpvYiwgQ2hpbGRQb29sSm9iIH0gZnJvbSAnZWUtY29yZS9qb2JzJztcbmltcG9ydCB0eXBlIHsgSm9iUHJvY2VzcyB9IGZyb20gJ2VlLWNvcmUvam9icy9jaGlsZC9qb2JQcm9jZXNzJztcbmltcG9ydCB0eXBlIHsgSXBjTWFpbkV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuXG4vKipcbiAqIGZyYW1ld29ya1xuICogQGNsYXNzXG4gKi9cbmNsYXNzIEZyYW1ld29ya1NlcnZpY2Uge1xuICBwcml2YXRlIG15VGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbDtcbiAgcHJpdmF0ZSBteUpvYjogQ2hpbGRKb2I7XG4gIHByaXZhdGUgbXlKb2JQb29sOiBDaGlsZFBvb2xKb2I7XG4gIHByaXZhdGUgdGFza0ZvckpvYjogUmVjb3JkPHN0cmluZywgSm9iUHJvY2Vzcz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gXHU1NzI4XHU2Nzg0XHU5MDIwXHU1MUZEXHU2NTcwXHU0RTJEXHU1MjFEXHU1OUNCXHU1MzE2XHU0RTAwXHU0RTlCXHU1M0Q4XHU5MUNGXG4gICAgdGhpcy5teVRpbWVyID0gbnVsbDtcbiAgICB0aGlzLm15Sm9iID0gbmV3IENoaWxkSm9iKCk7XG4gICAgdGhpcy5teUpvYlBvb2wgPSBuZXcgQ2hpbGRQb29sSm9iKCk7XG4gICAgdGhpcy50YXNrRm9ySm9iID0ge307XG4gIH1cblxuICAvKipcbiAgICogdGVzdFxuICAgKi9cbiAgYXN5bmMgdGVzdChhcmdzOiB1bmtub3duKTogUHJvbWlzZTx7IHN0YXR1czogc3RyaW5nOyBwYXJhbXM6IHVua25vd24gfT4ge1xuICAgIGxldCBvYmogPSB7XG4gICAgICBzdGF0dXM6J29rJyxcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH1cbiAgICBsb2dnZXIuaW5mbygnRnJhbWV3b3JrU2VydmljZSBvYmo6Jywgb2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIGlwY1x1OTAxQVx1NEZFMShcdTUzQ0NcdTU0MTEpXG4gICAqL1xuICBib3RoV2F5TWVzc2FnZSh0eXBlOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZXZlbnQ6IElwY01haW5FdmVudCk6IHN0cmluZyB7XG4gICAgLy8gXHU1MjREXHU3QUVGaXBjXHU5ODkxXHU5MDUzIGNoYW5uZWxcbiAgICBjb25zdCBjaGFubmVsID0gJ2NvbnRyb2xsZXIvZnJhbWV3b3JrL2lwY1NlbmRNc2cnO1xuXG4gICAgaWYgKHR5cGUgPT0gJ3N0YXJ0Jykge1xuICAgICAgLy8gXHU2QkNGXHU5Njk0MVx1NzlEMlx1RkYwQ1x1NTQxMVx1NTI0RFx1N0FFRlx1OTg3NVx1OTc2Mlx1NTNEMVx1OTAwMVx1NkQ4OFx1NjA2RlxuICAgICAgLy8gXHU3NTI4XHU1QjlBXHU2NUY2XHU1NjY4XHU2QTIxXHU2MkRGXG4gICAgICB0aGlzLm15VGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbihlLCBjLCBtc2cpIHtcbiAgICAgICAgbGV0IHRpbWVOb3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBsZXQgZGF0YSA9IG1zZyArICc6JyArIHRpbWVOb3c7XG4gICAgICAgIGUucmVwbHkoYCR7Y31gLCBkYXRhKVxuICAgICAgfSwgMTAwMCwgZXZlbnQsIGNoYW5uZWwsIGNvbnRlbnQpXG5cbiAgICAgIHJldHVybiAnXHU1RjAwXHU1OUNCXHU0RTg2J1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnZW5kJykge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLm15VGltZXIhKTtcbiAgICAgIHJldHVybiAnXHU1MDVDXHU2QjYyXHU0RTg2JyAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdvaHRoZXInXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NjI2N1x1ODg0Q1x1NEVGQlx1NTJBMVxuICAgKi8gXG4gIGRvSm9iKGpvYklkOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBldmVudDogSXBjTWFpbkV2ZW50KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGxldCByZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgbGV0IG9uZVRhc2s6IEpvYlByb2Nlc3MgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay90aW1lckpvYlByb2dyZXNzJztcbiAgXG4gICAgaWYgKGFjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgLy8gXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2XG4gICAgICBsZXQgZXZlbnROYW1lID0gJ2pvYi10aW1lci1wcm9ncmVzcy0nICsgam9iSWQ7XG4gICAgICBjb25zdCB0aW1lclRhc2sgPSB0aGlzLm15Sm9iLmV4ZWMoJy4vam9icy9leGFtcGxlL3RpbWVyJywge2pvYklkfSk7XG4gICAgICB0aW1lclRhc2suZW1pdHRlci5vbihldmVudE5hbWUsIChkYXRhOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdbbWFpbi1wcm9jZXNzXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcbiAgICAgICAgLy8gXHU1M0QxXHU5MDAxXHU2NTcwXHU2MzZFXHU1MjMwXHU2RTMyXHU2N0QzXHU4RkRCXHU3QTBCXG4gICAgICAgIGV2ZW50LnNlbmRlci5zZW5kKGAke2NoYW5uZWx9YCwgZGF0YSlcbiAgICAgIH0pXG4gICAgXG4gICAgICAvLyBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcdTUzQ0FcdTc2RDFcdTU0MkNcdThGREJcdTVFQTYgXHU1RjAyXHU2QjY1XG4gICAgICAvLyBteWpvYi5leGVjUHJvbWlzZSgnLi9qb2JzL2V4YW1wbGUvdGltZXInLCB7am9iSWR9KS50aGVuKHRhc2sgPT4ge1xuICAgICAgLy8gICB0YXNrLmVtaXR0ZXIub24oZXZlbnROYW1lLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gICAgIExvZy5pbmZvKCdbbWFpbi1wcm9jZXNzXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcbiAgICAgIC8vICAgICAvLyBcdTUzRDFcdTkwMDFcdTY1NzBcdTYzNkVcdTUyMzBcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcbiAgICAgIC8vICAgICBldmVudC5zZW5kZXIuc2VuZChgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICAvLyAgIH0pXG4gICAgICAvLyB9KTtcblxuICAgICAgcmVzLnBpZCA9IHRpbWVyVGFzay5waWQ7IFxuICAgICAgdGhpcy50YXNrRm9ySm9iW2pvYklkXSA9IHRpbWVyVGFzaztcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PSAnY2xvc2UnKSB7XG4gICAgICBvbmVUYXNrID0gdGhpcy50YXNrRm9ySm9iW2pvYklkXTtcbiAgICAgIG9uZVRhc2sua2lsbCgpO1xuICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCB7am9iSWQsIG51bWJlcjowLCBwaWQ6MH0pO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uID09ICdwYXVzZScpIHtcbiAgICAgIG9uZVRhc2sgPSB0aGlzLnRhc2tGb3JKb2Jbam9iSWRdO1xuICAgICAgb25lVGFzay5jYWxsRnVuYygnLi9qb2JzL2V4YW1wbGUvdGltZXInLCAncGF1c2UnLCBqb2JJZCk7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gPT0gJ3Jlc3VtZScpIHtcbiAgICAgIG9uZVRhc2sgPSB0aGlzLnRhc2tGb3JKb2Jbam9iSWRdO1xuICAgICAgb25lVGFzay5jYWxsRnVuYygnLi9qb2JzL2V4YW1wbGUvdGltZXInLCAncmVzdW1lJywgam9iSWQsIG9uZVRhc2sucGlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiBcdTUyMUJcdTVFRkFwb29sXG4gICAqLyBcbiAgZG9DcmVhdGVQb29sKG51bTogbnVtYmVyLCBldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay9jcmVhdGVQb29sTm90aWNlJztcbiAgICB0aGlzLm15Sm9iUG9vbC5jcmVhdGUobnVtKS50aGVuKChwaWRzOiBzdHJpbmdbXSkgPT4ge1xuICAgICAgZXZlbnQucmVwbHkoYCR7Y2hhbm5lbH1gLCBwaWRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTkwMUFcdThGQzdcdThGREJcdTdBMEJcdTZDNjBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovXG4gIGFzeW5jIGRvSm9iQnlQb29sKGpvYklkOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBldmVudDogSXBjTWFpbkV2ZW50KTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgIGxldCByZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgY29uc3QgY2hhbm5lbCA9ICdjb250cm9sbGVyL2ZyYW1ld29yay90aW1lckpvYlByb2dyZXNzJztcbiAgICBpZiAoYWN0aW9uID09ICdydW4nKSB7XG4gICAgICAvLyBcdTVGMDJcdTZCNjUtXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXHU1M0NBXHU3NkQxXHU1NDJDXHU4RkRCXHU1RUE2XG4gICAgICBjb25zdCB0YXNrID0gYXdhaXQgdGhpcy5teUpvYlBvb2wucnVuUHJvbWlzZSgnLi9qb2JzL2V4YW1wbGUvdGltZXInLCB7am9iSWR9KTtcblxuICAgICAgLy8gXHU3NkQxXHU1NDJDXHU1NjY4XHU1NDBEXHU3OUYwXHU1NTJGXHU0RTAwXHVGRjBDXHU1NDI2XHU1MjE5XHU0RjFBXHU1MUZBXHU3M0IwXHU5MUNEXHU1OTBEXHU3NkQxXHU1NDJDXHUzMDAyXG4gICAgICAvLyBcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdTY1RjZcdUZGMENcdTk3MDBcdTg5ODFcdTc5RkJcdTk2NjRcdTc2RDFcdTU0MkNcdTU2NjhcdUZGMENcdTk2MzJcdTZCNjJcdTUxODVcdTVCNThcdTZDQzRcdTZGMEZcbiAgICAgIGxldCBldmVudE5hbWUgPSAnam9iLXRpbWVyLXByb2dyZXNzLScgKyBqb2JJZDtcbiAgICAgIHRhc2suZW1pdHRlci5vbihldmVudE5hbWUsIChkYXRhOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdbbWFpbi1wcm9jZXNzXSBbQ2hpbGRQb29sSm9iXSB0aW1lclRhc2ssIGZyb20gVGltZXJKb2IgZGF0YTonLCBkYXRhKTtcblxuICAgICAgICAvLyBcdTUzRDFcdTkwMDFcdTY1NzBcdTYzNkVcdTUyMzBcdTZFMzJcdTY3RDNcdThGREJcdTdBMEJcbiAgICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoYCR7Y2hhbm5lbH1gLCBkYXRhKVxuXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjUzNlx1NTIzMFx1NEVGQlx1NTJBMVx1NUI4Q1x1NjIxMFx1NzY4NFx1NkQ4OFx1NjA2Rlx1RkYwQ1x1NzlGQlx1OTY2NFx1NzZEMVx1NTQyQ1x1NTY2OFxuICAgICAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgJ2VuZCcgaW4gZGF0YSAmJiAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuZW5kKSB7XG4gICAgICAgICAgdGFzay5lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycyhldmVudE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmVzLnBpZCA9IHRhc2sucGlkO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODNCN1x1NTNENlx1NkI2M1x1NTcyOFx1OEZEMFx1ODg0Q1x1NzY4NCBqb2IgXHU4RkRCXHU3QTBCIFxuICAgKi8gXG4gIG1vbml0b3JKb2IoKTogdm9pZCB7XG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbGV0IGpvYlBpZHMgPSB0aGlzLm15Sm9iLmdldFBpZHMoKTtcbiAgICAgIGxldCBqb2JQb29sUGlkcyA9IHRoaXMubXlKb2JQb29sLmdldFBpZHMoKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBbbWFpbi1wcm9jZXNzXSBbbW9uaXRvckpvYl0gam9iUGlkczogJHtqb2JQaWRzfSwgam9iUG9vbFBpZHM6ICR7am9iUG9vbFBpZHN9YCk7XG4gICAgfSwgNTAwMClcbiAgfVxuXG59XG5leHBvcnQgY29uc3QgZnJhbWV3b3JrU2VydmljZSA9IG5ldyBGcmFtZXdvcmtTZXJ2aWNlKCk7ICBcbiIsICJpbXBvcnQgeyBTcWxpdGVTdG9yYWdlIH0gZnJvbSAnZWUtY29yZS9zdG9yYWdlJztcbmltcG9ydCB7IGdldERhdGFEaXIgfSBmcm9tICdlZS1jb3JlL3BzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHR5cGUgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnO1xuXG4vKipcbiAqIHNxbGl0ZVx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFxuICogQGNsYXNzXG4gKi9cbmNsYXNzIEJhc2VkYlNlcnZpY2Uge1xuICBwcm90ZWN0ZWQgZGJuYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBkYiE6IERhdGFiYXNlLkRhdGFiYXNlO1xuICBwcm90ZWN0ZWQgc3RvcmFnZSE6IFNxbGl0ZVN0b3JhZ2U7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogeyBkYm5hbWU6IHN0cmluZyB9KSB7XG4gICAgY29uc3QgeyBkYm5hbWUgfSA9IG9wdGlvbnM7XG4gICAgdGhpcy5kYm5hbWUgPSBkYm5hbWU7XG4gIH1cblxuICAvKlxuICAgKiBcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICovXG4gIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NUI5QVx1NEU0OVx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlxuICAgIGNvbnN0IGRiRmlsZSA9IHBhdGguam9pbihnZXREYXRhRGlyKCksIFwiZGJcIiwgdGhpcy5kYm5hbWUpO1xuICAgIGNvbnN0IHNxbGl0ZU9wdGlvbnMgPSB7XG4gICAgICB0aW1lb3V0OiA2MDAwLFxuICAgICAgdmVyYm9zZTogY29uc29sZS5sb2dcbiAgICB9XG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFNxbGl0ZVN0b3JhZ2UoZGJGaWxlKTtcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuaW5pdChzcWxpdGVPcHRpb25zKTtcbiAgICB0aGlzLmRiID0gdGhpcy5zdG9yYWdlLmRiO1xuICB9XG5cbiAgLypcbiAgICogY2hhbmdlIGRhdGEgZGlyIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBjaGFuZ2VEYXRhRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gdGhlIGFic29sdXRlIHBhdGggb2YgdGhlIGRiIGZpbGVcbiAgICBjb25zdCBkYkZpbGUgPSBwYXRoLmpvaW4oZGlyLCB0aGlzLmRibmFtZSk7XG4gICAgY29uc3Qgc3FsaXRlT3B0aW9ucyA9IHtcbiAgICAgIHRpbWVvdXQ6IDYwMDAsXG4gICAgICB2ZXJib3NlOiBjb25zb2xlLmxvZ1xuICAgIH1cbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3FsaXRlU3RvcmFnZShkYkZpbGUpO1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5pbml0KHNxbGl0ZU9wdGlvbnMpO1xuICAgIHRoaXMuZGIgPSB0aGlzLnN0b3JhZ2UuZGI7XG4gIH1cbn1cbmV4cG9ydCB7IEJhc2VkYlNlcnZpY2UgfTtcbiIsICJpbXBvcnQgeyBCYXNlZGJTZXJ2aWNlIH0gZnJvbSAnLi9iYXNlZGInO1xuXG4vKipcbiAqIHNxbGl0ZVx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXNlclJvdyB7XG4gIGlkOiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcbiAgYWdlOiBudW1iZXI7XG59XG5cbmNsYXNzIFNxbGl0ZWRiU2VydmljZSBleHRlbmRzIEJhc2VkYlNlcnZpY2Uge1xuICBwcml2YXRlIHVzZXJUYWJsZU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGRibmFtZTogJ3NxbGl0ZS1kZW1vLmRiJyxcbiAgICB9XG4gICAgc3VwZXIob3B0aW9ucyk7XG4gICAgdGhpcy51c2VyVGFibGVOYW1lID0gJ3VzZXInO1xuICB9XG5cbiAgLypcbiAgICogXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAqL1xuICBhc3luYyBpbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTIxRFx1NTlDQlx1NTMxNlx1NjU3MFx1NjM2RVx1NUU5M1xuICAgIGF3YWl0IHRoaXMuX2luaXQoKTtcblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1ODg2OFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGNvbnN0IG1hc3RlclN0bXQgPSB0aGlzLmRiLnByZXBhcmUoJ1NFTEVDVCAqIEZST00gc3FsaXRlX21hc3RlciBXSEVSRSB0eXBlPT8gQU5EIG5hbWUgPSA/Jyk7XG4gICAgbGV0IHRhYmxlRXhpc3RzID0gbWFzdGVyU3RtdC5nZXQoJ3RhYmxlJywgdGhpcy51c2VyVGFibGVOYW1lKTtcbiAgICBpZiAoIXRhYmxlRXhpc3RzKSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTg4NjhcbiAgICAgIGNvbnN0IGNyZWF0ZV91c2VyX3RhYmxlX3NxbCA9XG4gICAgICBgQ1JFQVRFIFRBQkxFICR7dGhpcy51c2VyVGFibGVOYW1lfVxuICAgICAgKFxuICAgICAgICAgaWQgSU5URUdFUiBQUklNQVJZIEtFWSBBVVRPSU5DUkVNRU5ULFxuICAgICAgICAgbmFtZSBDSEFSKDUwKSBOT1QgTlVMTCxcbiAgICAgICAgIGFnZSBJTlRcbiAgICAgICk7YFxuICAgICAgdGhpcy5kYi5leGVjKGNyZWF0ZV91c2VyX3RhYmxlX3NxbCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogXHU1ODlFIFRlc3QgZGF0YSAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgYWRkVGVzdERhdGFTcWxpdGUoZGF0YTogeyBuYW1lOiBzdHJpbmc7IGFnZTogbnVtYmVyIH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBpbnNlcnQgPSB0aGlzLmRiLnByZXBhcmUoYElOU0VSVCBJTlRPICR7dGhpcy51c2VyVGFibGVOYW1lfSAobmFtZSwgYWdlKSBWQUxVRVMgKEBuYW1lLCBAYWdlKWApO1xuICAgIGluc2VydC5ydW4oZGF0YSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKlxuICAgKiBcdTUyMjAgVGVzdCBkYXRhIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBkZWxUZXN0RGF0YVNxbGl0ZShuYW1lID0gJycpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkZWxVc2VyID0gdGhpcy5kYi5wcmVwYXJlKGBERUxFVEUgRlJPTSAke3RoaXMudXNlclRhYmxlTmFtZX0gV0hFUkUgbmFtZSA9ID9gKTtcbiAgICBkZWxVc2VyLnJ1bihuYW1lKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qXG4gICAqIFx1NjUzOSBUZXN0IGRhdGEgKHNxbGl0ZSlcbiAgICovXG4gIGFzeW5jIHVwZGF0ZVRlc3REYXRhU3FsaXRlKG5hbWU9ICcnLCBhZ2UgPSAwKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgdXBkYXRlVXNlciA9IHRoaXMuZGIucHJlcGFyZShgVVBEQVRFICR7dGhpcy51c2VyVGFibGVOYW1lfSBTRVQgYWdlID0gPyBXSEVSRSBuYW1lID0gP2ApO1xuICAgIHVwZGF0ZVVzZXIucnVuKGFnZSwgbmFtZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gIFxuXG4gIC8qXG4gICAqIFx1NjdFNSBUZXN0IGRhdGEgKHNxbGl0ZSlcbiAgICovXG4gIGFzeW5jIGdldFRlc3REYXRhU3FsaXRlKGFnZSA9IDApOiBQcm9taXNlPFVzZXJSb3dbXT4ge1xuICAgIGNvbnN0IHNlbGVjdFVzZXIgPSB0aGlzLmRiLnByZXBhcmUoYFNFTEVDVCAqIEZST00gJHt0aGlzLnVzZXJUYWJsZU5hbWV9IFdIRVJFIGFnZSA9IEBhZ2VgKTtcbiAgICBjb25zdCB1c2VycyA9IHNlbGVjdFVzZXIuYWxsKHthZ2U6IGFnZX0pIGFzIFVzZXJSb3dbXTtcbiAgICByZXR1cm4gdXNlcnM7XG4gIH0gIFxuICBcbiAgLypcbiAgICogYWxsIFRlc3QgZGF0YSAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgZ2V0QWxsVGVzdERhdGFTcWxpdGUoKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIGNvbnN0IHNlbGVjdEFsbFVzZXIgPSB0aGlzLmRiLnByZXBhcmUoYFNFTEVDVCAqIEZST00gJHt0aGlzLnVzZXJUYWJsZU5hbWV9IGApO1xuICAgIGNvbnN0IGFsbFVzZXIgPSAgc2VsZWN0QWxsVXNlci5hbGwoKTtcbiAgICByZXR1cm4gYWxsVXNlcjtcbiAgfVxuICBcbiAgLypcbiAgICogZ2V0IGRhdGEgZGlyIChzcWxpdGUpXG4gICAqL1xuICBhc3luYyBnZXREYXRhRGlyKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZGlyID0gdGhpcy5zdG9yYWdlLmdldERiRGlyKCk7ICAgIFxuICAgIHJldHVybiBkaXI7XG4gIH0gXG5cbiAgLypcbiAgICogc2V0IGN1c3RvbSBkYXRhIGRpciAoc3FsaXRlKVxuICAgKi9cbiAgYXN5bmMgc2V0Q3VzdG9tRGF0YURpcihkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghZGlyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jaGFuZ2VEYXRhRGlyKGRpcik7XG4gICAgYXdhaXQgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuO1xuICB9XG59XG5leHBvcnQgY29uc3Qgc3FsaXRlZGJTZXJ2aWNlID0gbmV3IFNxbGl0ZWRiU2VydmljZSgpO1xuIiwgImltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IGF1dG9VcGRhdGVyIH0gZnJvbSBcImVsZWN0cm9uLXVwZGF0ZXJcIjtcbmltcG9ydCB0eXBlIHsgUHJvZ3Jlc3NJbmZvIH0gZnJvbSAnZWxlY3Ryb24tdXBkYXRlcic7XG5pbXBvcnQgdHlwZSB7IEdlbmVyaWNTZXJ2ZXJPcHRpb25zIH0gZnJvbSAnYnVpbGRlci11dGlsLXJ1bnRpbWUnO1xuaW1wb3J0IHsgaXMgfSBmcm9tICdlZS1jb3JlL3V0aWxzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB7IGdldE1haW5XaW5kb3csIHNldENsb3NlQW5kUXVpdCB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuXG4vKipcbiAqIFx1ODFFQVx1NTJBOFx1NTM0N1x1N0VBN1xuICogQGNsYXNzXG4gKi9cbmludGVyZmFjZSBVcGRhdGVyQ29uZmlnIHtcbiAgd2luZG93czogYm9vbGVhbjtcbiAgbWFjT1M6IGJvb2xlYW47XG4gIGxpbnV4OiBib29sZWFuO1xuICBvcHRpb25zOiBHZW5lcmljU2VydmVyT3B0aW9ucztcbn1cblxuY2xhc3MgQXV0b1VwZGF0ZXJTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBjb25maWc6IFVwZGF0ZXJDb25maWc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICB3aW5kb3dzOiBmYWxzZSxcbiAgICAgIG1hY09TOiBmYWxzZSxcbiAgICAgIGxpbnV4OiBmYWxzZSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgcHJvdmlkZXI6ICdnZW5lcmljJyBhcyBjb25zdCxcbiAgICAgICAgdXJsOiAnaHR0cDovL2tvZG8ucWluaXUuY29tLydcbiAgICAgIH0sXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIxQlx1NUVGQVxuICAgKi9cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnW2F1dG9VcGRhdGVyXSBsb2FkJyk7XG4gICAgY29uc3QgY2ZnID0gdGhpcy5jb25maWc7XG4gICAgaWYgKChpcy53aW5kb3dzKCkgJiYgY2ZnLndpbmRvd3MpIHx8IChpcy5tYWNPUygpICYmIGNmZy5tYWNPUykgfHwgKGlzLmxpbnV4KCkgJiYgY2ZnLmxpbnV4KSkge1xuICAgICAgLy8gY29udGludWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzID0ge1xuICAgICAgZXJyb3I6IC0xLFxuICAgICAgYXZhaWxhYmxlOiAxLFxuICAgICAgbm9BdmFpbGFibGU6IDIsXG4gICAgICBkb3dubG9hZGluZzogMyxcbiAgICAgIGRvd25sb2FkZWQ6IDQsXG4gICAgfVxuXG4gICAgY29uc3QgdmVyc2lvbiA9IGVsZWN0cm9uQXBwLmdldFZlcnNpb24oKTtcbiAgICBsb2dnZXIuaW5mbygnW2F1dG9VcGRhdGVyXSBjdXJyZW50IHZlcnNpb246ICcsIHZlcnNpb24pO1xuICBcbiAgICAvLyBcdThCQkVcdTdGNkVcdTRFMEJcdThGN0RcdTY3MERcdTUyQTFcdTU2NjhcdTU3MzBcdTU3NDBcbiAgICBsZXQgc2VydmVyID0gY2ZnLm9wdGlvbnMudXJsO1xuICAgIGxldCBsYXN0Q2hhciA9IHNlcnZlci5zdWJzdHJpbmcoc2VydmVyLmxlbmd0aCAtIDEpO1xuICAgIHNlcnZlciA9IGxhc3RDaGFyID09PSAnLycgPyBzZXJ2ZXIgOiBzZXJ2ZXIgKyBcIi9cIjtcbiAgICBjb25zdCBmZWVkT3B0aW9uczogR2VuZXJpY1NlcnZlck9wdGlvbnMgPSB7IC4uLmNmZy5vcHRpb25zLCB1cmw6IHNlcnZlciB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGF1dG9VcGRhdGVyLnNldEZlZWRVUkwoZmVlZE9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ1thdXRvVXBkYXRlcl0gc2V0RmVlZFVSTCBlcnJvciA6ICcsIGVycm9yKTtcbiAgICB9XG4gIFxuICAgIGF1dG9VcGRhdGVyLm9uKCdjaGVja2luZy1mb3ItdXBkYXRlJywgKCkgPT4ge1xuICAgICAgLy9zZW5kU3RhdHVzVG9XaW5kb3coJ1x1NkI2M1x1NTcyOFx1NjhDMFx1NjdFNVx1NjZGNFx1NjVCMC4uLicpO1xuICAgIH0pXG4gICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1hdmFpbGFibGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cy5hdmFpbGFibGUsXG4gICAgICAgIGRlc2M6ICdcdTY3MDlcdTUzRUZcdTc1MjhcdTY2RjRcdTY1QjAnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCd1cGRhdGUtbm90LWF2YWlsYWJsZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLm5vQXZhaWxhYmxlLFxuICAgICAgICBkZXNjOiAnXHU2Q0ExXHU2NzA5XHU1M0VGXHU3NTI4XHU2NkY0XHU2NUIwJ1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuZXJyb3IsXG4gICAgICAgIGRlc2M6IGVyclxuICAgICAgfVxuICAgICAgdGhpcy5zZW5kU3RhdHVzVG9XaW5kb3coZGF0YSk7XG4gICAgfSlcbiAgICBhdXRvVXBkYXRlci5vbignZG93bmxvYWQtcHJvZ3Jlc3MnLCAocHJvZ3Jlc3NPYmo6IFByb2dyZXNzSW5mbykgPT4ge1xuICAgICAgY29uc3QgcGVyY2VudE51bWJlciA9IE1hdGguZmxvb3IocHJvZ3Jlc3NPYmoucGVyY2VudCk7XG4gICAgICBjb25zdCB0b3RhbFNpemUgPSB0aGlzLmJ5dGVzQ2hhbmdlKHByb2dyZXNzT2JqLnRvdGFsKTtcbiAgICAgIGNvbnN0IHRyYW5zZmVycmVkU2l6ZSA9IHRoaXMuYnl0ZXNDaGFuZ2UocHJvZ3Jlc3NPYmoudHJhbnNmZXJyZWQpO1xuICAgICAgbGV0IHRleHQgPSAnXHU1REYyXHU0RTBCXHU4RjdEICcgKyBwZXJjZW50TnVtYmVyICsgJyUnO1xuICAgICAgdGV4dCA9IHRleHQgKyAnICgnICsgdHJhbnNmZXJyZWRTaXplICsgXCIvXCIgKyB0b3RhbFNpemUgKyAnKSc7XG4gIFxuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMuZG93bmxvYWRpbmcsXG4gICAgICAgIGRlc2M6IHRleHQsXG4gICAgICAgIHBlcmNlbnROdW1iZXIsXG4gICAgICAgIHRvdGFsU2l6ZSxcbiAgICAgICAgdHJhbnNmZXJyZWRTaXplXG4gICAgICB9XG4gICAgICBsb2dnZXIuaW5mbygnW2F1dG9VcGRhdGVyXSBwcm9ncmVzczogJywgdGV4dCk7XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcbiAgICB9KVxuICAgIGF1dG9VcGRhdGVyLm9uKCd1cGRhdGUtZG93bmxvYWRlZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLmRvd25sb2FkZWQsXG4gICAgICAgIGRlc2M6ICdcdTRFMEJcdThGN0RcdTVCOENcdTYyMTAnXG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRTdGF0dXNUb1dpbmRvdyhkYXRhKTtcblxuICAgICAgLy8gXHU2MjU4XHU3NkQ4XHU2M0QyXHU0RUY2XHU5MUNDXHU5NzYyXHU4QkJFXHU3RjZFXHU0RTg2XHU5NjNCXHU2QjYyXHU3QTk3XHU1M0UzXHU1MTczXHU5NUVEXHVGRjBDXHU4RkQ5XHU5MUNDXHU4QkJFXHU3RjZFXHU1MTQxXHU4QkI4XHU1MTczXHU5NUVEXHU3QTk3XHU1M0UzXG4gICAgICBzZXRDbG9zZUFuZFF1aXQodHJ1ZSk7XG4gICAgICBcbiAgICAgIC8vIEluc3RhbGwgdXBkYXRlcyBhbmQgZXhpdCB0aGUgYXBwbGljYXRpb25cbiAgICAgIGF1dG9VcGRhdGVyLnF1aXRBbmRJbnN0YWxsKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHU2OEMwXHU2N0U1XHU2NkY0XHU2NUIwXG4gICAqL1xuICBjaGVja1VwZGF0ZSAoKTogdm9pZCB7XG4gICAgYXV0b1VwZGF0ZXIuY2hlY2tGb3JVcGRhdGVzKCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBcdTRFMEJcdThGN0RcdTY2RjRcdTY1QjBcbiAgICovXG4gIGRvd25sb2FkICgpOiB2b2lkIHtcbiAgICBhdXRvVXBkYXRlci5kb3dubG9hZFVwZGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTQxMVx1NTI0RFx1N0FFRlx1NTNEMVx1NkQ4OFx1NjA2RlxuICAgKi9cbiAgc2VuZFN0YXR1c1RvV2luZG93KGNvbnRlbnQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30pOiB2b2lkIHtcbiAgICBjb25zdCB0ZXh0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICAgIGNvbnN0IGNoYW5uZWwgPSAnY3VzdG9tL2FwcC91cGRhdGVyJztcbiAgICBjb25zdCB3aW4gPSBnZXRNYWluV2luZG93KCk7XG4gICAgd2luLndlYkNvbnRlbnRzLnNlbmQoY2hhbm5lbCwgdGV4dEpzb24pO1xuICB9XG4gIFxuICAvKipcbiAgICogXHU1MzU1XHU0RjREXHU4RjZDXHU2MzYyXG4gICAqL1xuICBieXRlc0NoYW5nZSAobGltaXQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHNpemUgPSBcIlwiO1xuICAgIGlmKGxpbWl0IDwgMC4xICogMTAyNCl7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgc2l6ZSA9IGxpbWl0LnRvRml4ZWQoMikgKyBcIkJcIjtcbiAgICB9ZWxzZSBpZihsaW1pdCA8IDAuMSAqIDEwMjQgKiAxMDI0KXsgICAgICAgICAgICBcbiAgICAgIHNpemUgPSAobGltaXQvMTAyNCkudG9GaXhlZCgyKSArIFwiS0JcIjtcbiAgICB9ZWxzZSBpZihsaW1pdCA8IDAuMSAqIDEwMjQgKiAxMDI0ICogMTAyNCl7ICAgICAgICBcbiAgICAgIHNpemUgPSAobGltaXQvKDEwMjQgKiAxMDI0KSkudG9GaXhlZCgyKSArIFwiTUJcIjtcbiAgICB9ZWxzZXsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgc2l6ZSA9IChsaW1pdC8oMTAyNCAqIDEwMjQgKiAxMDI0KSkudG9GaXhlZCgyKSArIFwiR0JcIjtcbiAgICB9XG5cbiAgICBsZXQgc2l6ZVN0ciA9IHNpemUgKyBcIlwiOyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGxldCBpbmRleCA9IHNpemVTdHIuaW5kZXhPZihcIi5cIik7ICAgICAgICAgICAgICAgICAgICBcbiAgICBsZXQgZG91ID0gc2l6ZVN0ci5zdWJzdHJpbmcoaW5kZXggKyAxICwgaW5kZXggKyAzKTsgICAgICAgICAgICBcbiAgICBpZihkb3UgPT0gXCIwMFwiKXtcbiAgICAgICAgcmV0dXJuIHNpemVTdHIuc3Vic3RyaW5nKDAsIGluZGV4KSArIHNpemVTdHIuc3Vic3RyaW5nKGluZGV4ICsgMywgaW5kZXggKyA1KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2l6ZTtcbiAgfSAgXG59XG5leHBvcnQgY29uc3QgYXV0b1VwZGF0ZXJTZXJ2aWNlID0gbmV3IEF1dG9VcGRhdGVyU2VydmljZSgpO1xuIiwgImltcG9ydCBkYXlqcyBmcm9tICdkYXlqcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBhcHAgYXMgZWxlY3Ryb25BcHAsIHNoZWxsLCBJcGNNYWluRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBnZXRFeHRyYVJlc291cmNlc0RpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0Q29uZmlnIH0gZnJvbSAnZWUtY29yZS9jb25maWcnO1xuaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdlZS1jb3JlJztcbmltcG9ydCB7IGZyYW1ld29ya1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2ZyYW1ld29yayc7XG5pbXBvcnQgeyBzcWxpdGVkYlNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL2RhdGFiYXNlL3NxbGl0ZWRiJztcbmltcG9ydCB0eXBlIHsgVXNlclJvdyB9IGZyb20gJy4uL3NlcnZpY2UvZGF0YWJhc2Uvc3FsaXRlZGInO1xuaW1wb3J0IHsgYXV0b1VwZGF0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy9hdXRvX3VwZGF0ZXInO1xuaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSAna29hJztcblxuLyoqXG4gKiBmcmFtZXdvcmsgLSBkZW1vXG4gKiBAY2xhc3NcbiAqL1xuaW50ZXJmYWNlIFNxbGl0ZWRiT3BlcmF0aW9uQXJncyB7XG4gIGFjdGlvbjogc3RyaW5nO1xuICBpbmZvPzogeyBuYW1lOiBzdHJpbmc7IGFnZTogbnVtYmVyIH07XG4gIGRlbGV0ZV9uYW1lPzogc3RyaW5nO1xuICB1cGRhdGVfbmFtZT86IHN0cmluZztcbiAgdXBkYXRlX2FnZT86IG51bWJlcjtcbiAgc2VhcmNoX2FnZT86IG51bWJlcjtcbiAgZGF0YV9kaXI/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBTcWxpdGVkYk9wZXJhdGlvblJlc3VsdCB7XG4gIGFjdGlvbjogc3RyaW5nO1xuICByZXN1bHQ6IGJvb2xlYW4gfCBzdHJpbmcgfCBVc2VyUm93W10gfCBudWxsO1xuICBhbGxfbGlzdDogVXNlclJvd1tdO1xuICBjb2RlOiBudW1iZXI7XG59XG5cbmNsYXNzIEZyYW1ld29ya0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogXHU2MjQwXHU2NzA5XHU2NUI5XHU2Q0Q1XHU2M0E1XHU2NTM2XHU0RTI0XHU0RTJBXHU1M0MyXHU2NTcwXG4gICAqIEBwYXJhbSBhcmdzIFx1NTI0RFx1N0FFRlx1NEYyMFx1NzY4NFx1NTNDMlx1NjU3MFxuICAgKiBAcGFyYW0gZXZlbnQgLSBpcGNcdTkwMUFcdTRGRTFcdTY1RjZcdTYyNERcdTY3MDlcdTUwM0NcdTMwMDJcdThCRTZcdTYwQzVcdTg5QzFcdUZGMUFcdTYzQTdcdTUyMzZcdTU2NjhcdTY1ODdcdTY4NjNcbiAgICovXG5cbiAgLyoqXG4gICAqIHNxbGl0ZVx1NjU3MFx1NjM2RVx1NUU5M1x1NjRDRFx1NEY1Q1xuICAgKi8gICBcbiAgYXN5bmMgc3FsaXRlZGJPcGVyYXRpb24oYXJnczogU3FsaXRlZGJPcGVyYXRpb25BcmdzKTogUHJvbWlzZTxTcWxpdGVkYk9wZXJhdGlvblJlc3VsdD4ge1xuICAgIGNvbnN0IHsgYWN0aW9uLCBpbmZvLCBkZWxldGVfbmFtZSwgdXBkYXRlX25hbWUsIHVwZGF0ZV9hZ2UsIHNlYXJjaF9hZ2UsIGRhdGFfZGlyIH0gPSBhcmdzO1xuXG4gICAgY29uc3QgZGF0YTogU3FsaXRlZGJPcGVyYXRpb25SZXN1bHQgPSB7XG4gICAgICBhY3Rpb24sXG4gICAgICByZXN1bHQ6IG51bGwsXG4gICAgICBhbGxfbGlzdDogW10sXG4gICAgICBjb2RlOiAwXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICAvLyB0ZXN0XG4gICAgICBzcWxpdGVkYlNlcnZpY2UuZ2V0RGF0YURpcigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIGRhdGEuY29kZSA9IC0xO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2FkZCcgOlxuICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmFkZFRlc3REYXRhU3FsaXRlKGluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGVsJyA6XG4gICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmRlbFRlc3REYXRhU3FsaXRlKGRlbGV0ZV9uYW1lKTs7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndXBkYXRlJyA6XG4gICAgICAgIGRhdGEucmVzdWx0ID0gYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLnVwZGF0ZVRlc3REYXRhU3FsaXRlKHVwZGF0ZV9uYW1lLCB1cGRhdGVfYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnZXQnIDpcbiAgICAgICAgZGF0YS5yZXN1bHQgPSBhd2FpdCBzcWxpdGVkYlNlcnZpY2UuZ2V0VGVzdERhdGFTcWxpdGUoc2VhcmNoX2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ2V0RGF0YURpcicgOlxuICAgICAgICBkYXRhLnJlc3VsdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5nZXREYXRhRGlyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2V0RGF0YURpcicgOlxuICAgICAgICBpZiAoZGF0YV9kaXIpIHtcbiAgICAgICAgICBhd2FpdCBzcWxpdGVkYlNlcnZpY2Uuc2V0Q3VzdG9tRGF0YURpcihkYXRhX2Rpcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7ICAgICAgICAgICAgXG4gICAgfVxuXG4gICAgZGF0YS5hbGxfbGlzdCA9IGF3YWl0IHNxbGl0ZWRiU2VydmljZS5nZXRBbGxUZXN0RGF0YVNxbGl0ZSgpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0gIFxuXG4gIC8qKlxuICAgKiBcdThDMDNcdTc1MjhcdTUxNzZcdTVCODNcdTdBMEJcdTVFOEZcdUZGMDhleGVcdTMwMDFiYXNoXHU3QjQ5XHU1M0VGXHU2MjY3XHU4ODRDXHU3QTBCXHU1RThGXHVGRjA5XG4gICAqIFxuICAgKi9cbiAgb3BlblNvZnR3YXJlKGFyZ3M6IHsgc29mdE5hbWU6IHN0cmluZyB9KTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBzb2Z0TmFtZSB9ID0gYXJncztcbiAgICBjb25zdCBzb2Z0d2FyZVBhdGggPSBwYXRoLmpvaW4oZ2V0RXh0cmFSZXNvdXJjZXNEaXIoKSwgc29mdE5hbWUpO1xuICAgIGxvZ2dlci5pbmZvKCdbb3BlblNvZnR3YXJlXSBzb2Z0d2FyZVBhdGg6Jywgc29mdHdhcmVQYXRoKTtcblxuICAgIC8vIFx1NjhDMFx1NjdFNVx1N0EwQlx1NUU4Rlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFxuICAgIGlmICghZnMuZXhpc3RzU3luYyhzb2Z0d2FyZVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFx1NTQ3RFx1NEVFNFx1ODg0Q1x1NUI1N1x1N0IyNlx1NEUzMiBcdTVFNzYgXHU2MjY3XHU4ODRDLCBzdGFydCBcdTU0N0RcdTRFRTRcdTU0MEVcdTk3NjJcdTc2ODRcdThERUZcdTVGODRcdTg5ODFcdTUyQTBcdTUzQ0NcdTVGMTVcdTUzRjdcbiAgICBjb25zdCBjbWRTdHIgPSBgc3RhcnQgXCIke3NvZnR3YXJlUGF0aH1cImA7XG4gICAgZXhlYyhjbWRTdHIpO1xuXG4gICAgLy8gXHU2NUI5XHU2Q0Q1XHU0RThDXG4gICAgLy8gXHU0RjdGXHU3NTI4Y3Jvc3NcdTZBMjFcdTU3NTdcblxuICAgIHJldHVybiB0cnVlO1xuICB9ICBcblxuICAvKipcbiAgICogXHU2OEMwXHU2RDRCaHR0cFx1NjcwRFx1NTJBMVx1NjYyRlx1NTQyNlx1NUYwMFx1NTQyRlxuICAgKi8gXG4gIGFzeW5jIGNoZWNrSHR0cFNlcnZlcigpOiBQcm9taXNlPHsgZW5hYmxlOiBib29sZWFuOyBzZXJ2ZXI6IHN0cmluZyB9PiB7XG4gICAgY29uc3QgeyBlbmFibGUsIHByb3RvY29sLCBob3N0LCBwb3J0IH0gPSAoZ2V0Q29uZmlnKCkgYXMgQ29uZmlnKS5odHRwU2VydmVyO1xuICAgIGNvbnN0IHVybCA9IHByb3RvY29sICsgaG9zdCArICc6JyArIHBvcnQ7XG4gICAgY29uc29sZS5sb2coJ1tjaGVja0h0dHBTZXJ2ZXJdIHVybDonLCB1cmwpO1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBlbmFibGU6IGVuYWJsZSxcbiAgICAgIHNlcnZlcjogdXJsXG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NEUwMFx1NEUyQSBodHRwIFx1OEJGN1x1NkM0MlxuICAgKiBhcmdzIFx1NjYyRiBcdTUyNERcdTdBRUZcdTRGMjBcdTc2ODRcdTUzQzJcdTY1NzBcbiAgICogY3R4IFx1NjYyRiBrb2EgXHU3Njg0IGN0eCBcdTVCRjlcdThDNjFcbiAgICovXG4gIGFzeW5jIGRvSHR0cFJlcXVlc3QoYXJnczogeyBpZDogc3RyaW5nIH0sIGN0eDogQ29udGV4dCAmIHsgcmVxdWVzdDogeyBib2R5PzogdW5rbm93biB9IH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBodHRwSW5mbyA9IHtcbiAgICAgIGFyZ3MsXG4gICAgICBtZXRob2Q6IGN0eC5yZXF1ZXN0Lm1ldGhvZCxcbiAgICAgIHF1ZXJ5OiBjdHgucmVxdWVzdC5xdWVyeSxcbiAgICAgIGJvZHk6IGN0eC5yZXF1ZXN0LmJvZHlcbiAgICB9XG4gICAgbG9nZ2VyLmluZm8oJ2h0dHBJbmZvOicsIGh0dHBJbmZvKTtcblxuICAgIGNvbnN0IHsgaWQgfSA9IGFyZ3M7XG4gICAgaWYgKCFpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBkaXIgPSBlbGVjdHJvbkFwcC5nZXRQYXRoKGlkIGFzIFBhcmFtZXRlcnM8dHlwZW9mIGVsZWN0cm9uQXBwLmdldFBhdGg+WzBdKTtcbiAgICBzaGVsbC5vcGVuUGF0aChkaXIpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogXHU0RTAwXHU0RTJBc29ja2V0IGlvXHU4QkY3XHU2QzQyXHU4QkJGXHU5NUVFXHU2QjY0XHU2NUI5XHU2Q0Q1XG4gICAqL1xuICBhc3luYyBkb1NvY2tldFJlcXVlc3QoYXJnczogeyBpZDogc3RyaW5nIH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB7IGlkIH0gPSBhcmdzO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZGlyID0gZWxlY3Ryb25BcHAuZ2V0UGF0aChpZCBhcyBQYXJhbWV0ZXJzPHR5cGVvZiBlbGVjdHJvbkFwcC5nZXRQYXRoPlswXSk7XG4gICAgc2hlbGwub3BlblBhdGgoZGlyKTtcbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFx1NUYwMlx1NkI2NVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4QlxuICAgKi8gXG4gIGFzeW5jIGlwY0ludm9rZU1zZyhhcmdzOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCB0aW1lTm93ID0gZGF5anMoKS5mb3JtYXQoJ1lZWVktTU0tREQgSEg6bW06c3MnKTtcbiAgICBjb25zdCBkYXRhID0gYXJncyArICcgLSAnICsgdGltZU5vdztcbiAgICBcbiAgICByZXR1cm4gZGF0YTtcbiAgfSAgXG5cbiAgLyoqXG4gICAqIFx1NTQwQ1x1NkI2NVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4QlxuICAgKi8gXG4gIGFzeW5jIGlwY1NlbmRTeW5jTXNnKGFyZ3M6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IHRpbWVOb3cgPSBkYXlqcygpLmZvcm1hdCgnWVlZWS1NTS1ERCBISDptbTpzcycpO1xuICAgIGNvbnN0IGRhdGEgPSBhcmdzICsgJyAtICcgKyB0aW1lTm93O1xuICAgIFxuICAgIHJldHVybiBkYXRhO1xuICB9ICBcblxuICAvKipcbiAgICogXHU1M0NDXHU1NDExXHU1RjAyXHU2QjY1XHU5MDFBXHU0RkUxXG4gICAqL1xuICBpcGNTZW5kTXNnKGFyZ3M6IHsgdHlwZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmcgfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyB0eXBlLCBjb250ZW50IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRhdGEgPSBmcmFtZXdvcmtTZXJ2aWNlLmJvdGhXYXlNZXNzYWdlKHR5cGUsIGNvbnRlbnQsIGV2ZW50KTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NEVGQlx1NTJBMVxuICAgKi9cbiAgc29tZUpvYihhcmdzOiB7IGpvYklkOiBzdHJpbmc7IGFjdGlvbjogc3RyaW5nIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiB7IGpvYklkOiBzdHJpbmc7IGFjdGlvbjogc3RyaW5nOyByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkIH0ge1xuICAgIGNvbnN0IHsgam9iSWQsIGFjdGlvbn0gPSBhcmdzO1xuICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgIHJlc3VsdCA9IGZyYW1ld29ya1NlcnZpY2UuZG9Kb2Ioam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhazsgICAgICAgXG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIGZyYW1ld29ya1NlcnZpY2UuZG9Kb2Ioam9iSWQsIGFjdGlvbiwgZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BhdXNlJzpcbiAgICAgICAgZnJhbWV3b3JrU2VydmljZS5kb0pvYihqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBjYXNlICdyZXN1bWUnOlxuICAgICAgICBmcmFtZXdvcmtTZXJ2aWNlLmRvSm9iKGpvYklkLCBhY3Rpb24sIGV2ZW50KTtcbiAgICAgICAgYnJlYWs7ICAgXG4gICAgICBkZWZhdWx0OiAgXG4gICAgfVxuICAgIFxuICAgIGxldCBkYXRhID0ge1xuICAgICAgam9iSWQsXG4gICAgICBhY3Rpb24sXG4gICAgICByZXN1bHRcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjFCXHU1RUZBXHU0RUZCXHU1MkExXHU2QzYwXG4gICAqLyBcbiAgYXN5bmMgY3JlYXRlUG9vbChhcmdzOiB7IG51bWJlcjogbnVtYmVyIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgbnVtID0gYXJncy5udW1iZXI7XG4gICAgZnJhbWV3b3JrU2VydmljZS5kb0NyZWF0ZVBvb2wobnVtLCBldmVudCk7XG5cbiAgICAvLyB0ZXN0IG1vbml0b3JcbiAgICBmcmFtZXdvcmtTZXJ2aWNlLm1vbml0b3JKb2IoKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTkwMUFcdThGQzdcdThGREJcdTdBMEJcdTZDNjBcdTYyNjdcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovXG4gIGFzeW5jIHNvbWVKb2JCeVBvb2woYXJnczogeyBqb2JJZDogc3RyaW5nOyBhY3Rpb246IHN0cmluZyB9LCBldmVudDogSXBjTWFpbkV2ZW50KTogUHJvbWlzZTx7IGpvYklkOiBzdHJpbmc7IGFjdGlvbjogc3RyaW5nOyByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0+IHtcbiAgICBjb25zdCB7IGpvYklkLCBhY3Rpb24gfSA9IGFyZ3M7XG4gICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAncnVuJzpcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgZnJhbWV3b3JrU2VydmljZS5kb0pvYkJ5UG9vbChqb2JJZCwgYWN0aW9uLCBldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIGpvYklkLFxuICAgICAgYWN0aW9uLFxuICAgICAgcmVzdWx0XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOVx1NjVCMFx1NzI0OFx1NjcyQ1xuICAgKi9cbiAgY2hlY2tGb3JVcGRhdGVyKCk6IHZvaWQgeyBcbiAgICBhdXRvVXBkYXRlclNlcnZpY2UuY2hlY2tVcGRhdGUoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogXHU0RTBCXHU4RjdEXHU2NUIwXHU3MjQ4XHU2NzJDXG4gICAqL1xuICBkb3dubG9hZEFwcCgpOiB2b2lkIHtcbiAgICBhdXRvVXBkYXRlclNlcnZpY2UuZG93bmxvYWQoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogXHU2RDRCXHU4QkQ1XHU2M0E1XHU1M0UzXG4gICAqLyBcbiAgaGVsbG8oYXJnczogdW5rbm93bik6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdoZWxsbyAnLCBhcmdzKTtcbiAgfSAgIFxufVxuZXhwb3J0IGRlZmF1bHQgRnJhbWV3b3JrQ29udHJvbGxlcjtcbiIsICJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEJyb3dzZXJXaW5kb3csIEJyb3dzZXJXaW5kb3dDb25zdHJ1Y3Rvck9wdGlvbnMsIE5vdGlmaWNhdGlvbiwgTm90aWZpY2F0aW9uQ29uc3RydWN0b3JPcHRpb25zLCBJcGNNYWluRXZlbnQsIEV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgZ2V0TWFpbldpbmRvdyB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuaW1wb3J0IHsgaXNEZXYsIGlzUHJvZCwgZ2V0QmFzZURpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHsgZ2V0Q29uZmlnIH0gZnJvbSAnZWUtY29yZS9jb25maWcnO1xuaW1wb3J0IHsgaXNGaWxlUHJvdG9jb2wgfSBmcm9tICdlZS1jb3JlL3V0aWxzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ2VlLWNvcmUvbG9nJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnZWUtY29yZSc7XG5cbi8qKlxuICogV2luZG93XG4gKiBAY2xhc3NcbiAqL1xuaW50ZXJmYWNlIENyZWF0ZVdpbmRvd0FyZ3Mge1xuICB0eXBlOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgd2luZG93TmFtZTogc3RyaW5nO1xuICB3aW5kb3dUaXRsZTogc3RyaW5nO1xufVxuXG5jbGFzcyBXaW5kb3dTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBteU5vdGlmaWNhdGlvbjogTm90aWZpY2F0aW9uIHwgbnVsbDtcbiAgcHJpdmF0ZSB3aW5kb3dzOiBSZWNvcmQ8c3RyaW5nLCBCcm93c2VyV2luZG93PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm15Tm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICB0aGlzLndpbmRvd3MgPSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFx1N0E5N1x1NTNFM1x1NTIxRFx1NTlDQlx1NTMxNlxuICAgKi9cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBtYWluV2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgIG1haW5XaW4uc2V0TWVudUJhclZpc2liaWxpdHkoZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyB3aW5kb3dcbiAgICovXG4gIGNyZWF0ZVdpbmRvdyhhcmdzOiBDcmVhdGVXaW5kb3dBcmdzKTogbnVtYmVyIHtcbiAgICBjb25zdCB7IHR5cGUsIGNvbnRlbnQsIHdpbmRvd05hbWUsIHdpbmRvd1RpdGxlIH0gPSBhcmdzO1xuICAgIGxldCBjb250ZW50VXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICBpZiAodHlwZSA9PSAnaHRtbCcpIHtcbiAgICAgIGNvbnRlbnRVcmwgPSBwYXRoLmpvaW4oJ2ZpbGU6Ly8nLCBnZXRCYXNlRGlyKCksIGNvbnRlbnQpXG4gICAgfSBlbHNlIGlmICh0eXBlID09ICd3ZWInKSB7XG4gICAgICBjb250ZW50VXJsID0gY29udGVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3Z1ZScpIHtcbiAgICAgIGxldCBhZGRyID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCdcbiAgICAgIGlmIChpc1Byb2QoKSkge1xuICAgICAgICBjb25zdCBtYWluU2VydmVyID0gZ2V0Q29uZmlnKCkubWFpblNlcnZlciBhcyBDb25maWdbJ21haW5TZXJ2ZXInXSAmIHsgaG9zdD86IHN0cmluZzsgcG9ydD86IG51bWJlciB9O1xuICAgICAgICBpZiAoaXNGaWxlUHJvdG9jb2wobWFpblNlcnZlci5wcm90b2NvbCkpIHtcbiAgICAgICAgICBhZGRyID0gbWFpblNlcnZlci5wcm90b2NvbCArIHBhdGguam9pbihnZXRCYXNlRGlyKCksIG1haW5TZXJ2ZXIuaW5kZXhQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRyID0gbWFpblNlcnZlci5wcm90b2NvbCArIChtYWluU2VydmVyLmhvc3QgPz8gJycpICsgKG1haW5TZXJ2ZXIucG9ydCA/ICc6JyArIG1haW5TZXJ2ZXIucG9ydCA6ICcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb250ZW50VXJsID0gYWRkciArIGNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNvbWVcbiAgICB9XG5cbiAgICBsb2dnZXIuaW5mbygnW2NyZWF0ZVdpbmRvd10gdXJsOiAnLCBjb250ZW50VXJsKTtcbiAgICBjb25zdCBvcHQ6IEJyb3dzZXJXaW5kb3dDb25zdHJ1Y3Rvck9wdGlvbnMgPSB7XG4gICAgICB0aXRsZTogd2luZG93VGl0bGUsXG4gICAgICB4OiAxMCxcbiAgICAgIHk6IDEwLFxuICAgICAgd2lkdGg6IDk4MCwgXG4gICAgICBoZWlnaHQ6IDY1MCxcbiAgICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICAgIGNvbnRleHRJc29sYXRpb246IGZhbHNlLFxuICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCB3aW4gPSBuZXcgQnJvd3NlcldpbmRvdyhvcHQpO1xuICAgIGNvbnN0IHdpbkNvbnRlbnRzSWQgPSB3aW4ud2ViQ29udGVudHMuaWQ7XG4gICAgaWYgKGNvbnRlbnRVcmwpIHtcbiAgICAgIHdpbi5sb2FkVVJMKGNvbnRlbnRVcmwpO1xuICAgIH1cbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpO1xuICAgIH1cblxuICAgIC8vIHN1YiB3aW5kb3cgXG4gICAgd2luLnNldE1lbnVCYXJWaXNpYmlsaXR5KGZhbHNlKTtcblxuICAgIHRoaXMud2luZG93c1t3aW5kb3dOYW1lXSA9IHdpbjtcblxuICAgIHJldHVybiB3aW5Db250ZW50c0lkO1xuICB9XG4gIFxuICAvKipcbiAgICogR2V0IHdpbmRvdyBjb250ZW50cyBpZFxuICAgKi9cbiAgZ2V0V0NpZChhcmdzOiB7IHdpbmRvd05hbWU6IHN0cmluZyB9KTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgeyB3aW5kb3dOYW1lIH0gPSBhcmdzO1xuICAgIGxldCB3aW46IEJyb3dzZXJXaW5kb3cgfCBudWxsO1xuICAgIGlmICh3aW5kb3dOYW1lID09ICdtYWluJykge1xuICAgICAgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgICAgcmV0dXJuIHdpbi53ZWJDb250ZW50cy5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luID0gdGhpcy53aW5kb3dzW3dpbmRvd05hbWVdID8/IG51bGw7XG4gICAgICBpZiAoIXdpbikgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gd2luLndlYkNvbnRlbnRzLmlkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFsaXplIGNvbW11bmljYXRpb24gYmV0d2VlbiB0d28gd2luZG93cyB0aHJvdWdoIHRoZSB0cmFuc2ZlciBvZiB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICBjb21tdW5pY2F0ZShhcmdzOiB7IHJlY2VpdmVyOiBzdHJpbmc7IGNvbnRlbnQ6IHVua25vd24gfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVjZWl2ZXIsIGNvbnRlbnQgfSA9IGFyZ3M7XG4gICAgaWYgKHJlY2VpdmVyID09ICdtYWluJykge1xuICAgICAgY29uc3Qgd2luID0gZ2V0TWFpbldpbmRvdygpO1xuICAgICAgd2luLndlYkNvbnRlbnRzLnNlbmQoJ2NvbnRyb2xsZXIvb3Mvd2luZG93MlRvV2luZG93MScsIGNvbnRlbnQpO1xuICAgIH0gZWxzZSBpZiAocmVjZWl2ZXIgPT0gJ3dpbmRvdzInKSB7XG4gICAgICBjb25zdCB3aW4gPSB0aGlzLndpbmRvd3NbcmVjZWl2ZXJdO1xuICAgICAgd2luLndlYkNvbnRlbnRzLnNlbmQoJ2NvbnRyb2xsZXIvb3Mvd2luZG93MVRvV2luZG93MicsIGNvbnRlbnQpO1xuICAgIH1cbiAgfSAgXG5cbiAgLyoqXG4gICAqIGNyZWF0ZU5vdGlmaWNhdGlvblxuICAgKi9cbiAgY3JlYXRlTm90aWZpY2F0aW9uKG9wdGlvbnM6IE5vdGlmaWNhdGlvbkNvbnN0cnVjdG9yT3B0aW9ucyAmIHsgY2xpY2tFdmVudD86IGJvb2xlYW47IGNsb3NlRXZlbnQ/OiBib29sZWFuIH0sIGV2ZW50OiBJcGNNYWluRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjaGFubmVsID0gJ2NvbnRyb2xsZXIvb3Mvc2VuZE5vdGlmaWNhdGlvbic7XG4gICAgdGhpcy5teU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24ob3B0aW9ucyk7XG5cbiAgICBpZiAob3B0aW9ucy5jbGlja0V2ZW50KSB7XG4gICAgICB0aGlzLm15Tm90aWZpY2F0aW9uLm9uKCdjbGljaycsIChfZTogRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICB0eXBlOiAnY2xpY2snLFxuICAgICAgICAgIG1zZzogJ1x1NjBBOFx1NzBCOVx1NTFGQlx1NEU4Nlx1OTAxQVx1NzdFNVx1NkQ4OFx1NjA2RidcbiAgICAgICAgfVxuICAgICAgICBldmVudC5yZXBseShgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5jbG9zZUV2ZW50KSB7XG4gICAgICB0aGlzLm15Tm90aWZpY2F0aW9uLm9uKCdjbG9zZScsIChfZTogRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgICAgIG1zZzogJ1x1NjBBOFx1NTE3M1x1OTVFRFx1NEU4Nlx1OTAxQVx1NzdFNVx1NkQ4OFx1NjA2RidcbiAgICAgICAgfVxuICAgICAgICBldmVudC5yZXBseShgJHtjaGFubmVsfWAsIGRhdGEpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLm15Tm90aWZpY2F0aW9uLnNob3coKTtcbiAgfVxuXG59XG5leHBvcnQgY29uc3Qgd2luZG93U2VydmljZSA9IG5ldyBXaW5kb3dTZXJ2aWNlKCk7ICBcbiIsICJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1xuICBhcHAgYXMgZWxlY3Ryb25BcHAsIGRpYWxvZywgc2hlbGwsIE5vdGlmaWNhdGlvbiwgSXBjTWFpbkV2ZW50LFxuICBOb3RpZmljYXRpb25Db25zdHJ1Y3Rvck9wdGlvbnMsXG59IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IHdpbmRvd1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL29zL3dpbmRvdyc7XG5cbi8qKlxuICogZXhhbXBsZVxuICogQGNsYXNzXG4gKi9cbmNsYXNzIE9zQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBBbGwgbWV0aG9kcyByZWNlaXZlIHR3byBwYXJhbWV0ZXJzXG4gICAqIEBwYXJhbSBhcmdzIFBhcmFtZXRlcnMgdHJhbnNtaXR0ZWQgYnkgdGhlIGZyb250ZW5kXG4gICAqIEBwYXJhbSBldmVudCAtIEV2ZW50IGFyZSBvbmx5IGF2YWlsYWJsZSBkdXJpbmcgSVBDIGNvbW11bmljYXRpb24uIEZvciBkZXRhaWxzLCBwbGVhc2UgcmVmZXIgdG8gdGhlIGNvbnRyb2xsZXIgZG9jdW1lbnRhdGlvblxuICAgKi9cblxuICAvKipcbiAgICogTWVzc2FnZSBwcm9tcHQgZGlhbG9nIGJveFxuICAgKi9cbiAgbWVzc2FnZVNob3coKTogc3RyaW5nIHtcbiAgICBkaWFsb2cuc2hvd01lc3NhZ2VCb3hTeW5jKHtcbiAgICAgIHR5cGU6ICdpbmZvJywgLy8gXCJub25lXCIsIFwiaW5mb1wiLCBcImVycm9yXCIsIFwicXVlc3Rpb25cIiBcdTYyMTZcdTgwMDUgXCJ3YXJuaW5nXCJcbiAgICAgIHRpdGxlOiAnQ3VzdG9tIFRpdGxlJyxcbiAgICAgIG1lc3NhZ2U6ICdDdXN0b21pemUgbWVzc2FnZSBjb250ZW50JyxcbiAgICAgIGRldGFpbDogJ090aGVyIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24nXG4gICAgfSlcbiAgXG4gICAgcmV0dXJuICdPcGVuZWQgdGhlIG1lc3NhZ2UgYm94JztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXNzYWdlIHByb21wdCBhbmQgY29uZmlybWF0aW9uIGRpYWxvZyBib3hcbiAgICovXG4gIG1lc3NhZ2VTaG93Q29uZmlybSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlcyA9IGRpYWxvZy5zaG93TWVzc2FnZUJveFN5bmMoe1xuICAgICAgdHlwZTogJ2luZm8nLFxuICAgICAgdGl0bGU6ICdDdXN0b20gVGl0bGUnLFxuICAgICAgbWVzc2FnZTogJ0N1c3RvbWl6ZSBtZXNzYWdlIGNvbnRlbnQnLFxuICAgICAgZGV0YWlsOiAnT3RoZXIgYWRkaXRpb25hbCBpbmZvcm1hdGlvbicsXG4gICAgICBjYW5jZWxJZDogMSwgLy8gSW5kZXggb2YgYnV0dG9ucyB1c2VkIHRvIGNhbmNlbCBkaWFsb2cgYm94ZXNcbiAgICAgIGRlZmF1bHRJZDogMCwgLy8gU2V0IGRlZmF1bHQgc2VsZWN0ZWQgYnV0dG9uXG4gICAgICBidXR0b25zOiBbJ2NvbmZpcm0nLCAnY2FuY2VsJ10sIFxuICAgIH0pXG4gICAgbGV0IGRhdGEgPSAocmVzID09PSAwKSA/ICdjbGljayB0aGUgY29uZmlybSBidXR0b24nIDogJ2NsaWNrIHRoZSBjYW5jZWwgYnV0dG9uJztcbiAgXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IERpcmVjdG9yeVxuICAgKi9cbiAgc2VsZWN0Rm9sZGVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZ1N5bmMoe1xuICAgICAgcHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5JywgJ2NyZWF0ZURpcmVjdG9yeSddXG4gICAgfSk7XG5cbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZVBhdGhzWzBdO1xuICB9IFxuXG4gIC8qKlxuICAgKiBvcGVuIGRpcmVjdG9yeVxuICAgKi9cbiAgb3BlbkRpcmVjdG9yeShhcmdzOiB7IGlkOiBzdHJpbmcgfSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgaWQgfSA9IGFyZ3M7XG4gICAgaWYgKCFpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBsZXQgZGlyID0gJyc7XG4gICAgaWYgKHBhdGguaXNBYnNvbHV0ZShpZCkpIHtcbiAgICAgIGRpciA9IGlkO1xuICAgIH0gZWxzZSB7XG4gICAgZGlyID0gZWxlY3Ryb25BcHAuZ2V0UGF0aChpZCBhcyBQYXJhbWV0ZXJzPHR5cGVvZiBlbGVjdHJvbkFwcC5nZXRQYXRoPlswXSk7XG4gICAgfVxuXG4gICAgc2hlbGwub3BlblBhdGgoZGlyKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgUGljdHVyZVxuICAgKi9cbiAgc2VsZWN0UGljKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZ1N5bmMoe1xuICAgICAgdGl0bGU6ICdzZWxlY3QgcGljJyxcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXSxcbiAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnSW1hZ2VzJywgZXh0ZW5zaW9uczogWydqcGcnLCAncG5nJywgJ2dpZiddIH0sXG4gICAgICBdXG4gICAgfSk7XG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoc1swXSk7XG4gICAgICBjb25zdCBwaWMgPSAgJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJyArIGRhdGEudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgcmV0dXJuIHBpYztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSAgIFxuXG4gIC8qKlxuICAgKiBPcGVuIGEgbmV3IHdpbmRvd1xuICAgKi9cbiAgY3JlYXRlV2luZG93KGFyZ3M6IHsgdHlwZTogc3RyaW5nOyBjb250ZW50OiBzdHJpbmc7IHdpbmRvd05hbWU6IHN0cmluZzsgd2luZG93VGl0bGU6IHN0cmluZyB9KTogbnVtYmVyIHtcbiAgICBjb25zdCB3Y2lkID0gd2luZG93U2VydmljZS5jcmVhdGVXaW5kb3coYXJncyk7XG4gICAgcmV0dXJuIHdjaWQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBHZXQgV2luZG93IGNvbnRlbnRzIGlkXG4gICAqL1xuICBnZXRXQ2lkKGFyZ3M6IHsgd2luZG93TmFtZTogc3RyaW5nIH0pOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCB3Y2lkID0gd2luZG93U2VydmljZS5nZXRXQ2lkKGFyZ3MpO1xuICAgIHJldHVybiB3Y2lkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWxpemUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHR3byB3aW5kb3dzIHRocm91Z2ggdGhlIHRyYW5zZmVyIG9mIHRoZSBtYWluIHByb2Nlc3NcbiAgICovXG4gIHdpbmRvdzFUb1dpbmRvdzIoYXJnczogeyByZWNlaXZlcjogc3RyaW5nOyBjb250ZW50OiB1bmtub3duIH0sIF9ldmVudDogSXBjTWFpbkV2ZW50KTogdm9pZCB7XG4gICAgd2luZG93U2VydmljZS5jb21tdW5pY2F0ZShhcmdzKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogUmVhbGl6ZSBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHdpbmRvd3MgdGhyb3VnaCB0aGUgdHJhbnNmZXIgb2YgdGhlIG1haW4gcHJvY2Vzc1xuICAgKi9cbiAgd2luZG93MlRvV2luZG93MShhcmdzOiB7IHJlY2VpdmVyOiBzdHJpbmc7IGNvbnRlbnQ6IHVua25vd24gfSwgX2V2ZW50OiBJcGNNYWluRXZlbnQpOiB2b2lkIHtcbiAgICB3aW5kb3dTZXJ2aWNlLmNvbW11bmljYXRlKGFyZ3MpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgc3lzdGVtIG5vdGlmaWNhdGlvbnNcbiAgICovXG4gIHNlbmROb3RpZmljYXRpb24oYXJnczogeyB0aXRsZT86IHN0cmluZzsgc3VidGl0bGU/OiBzdHJpbmc7IGJvZHk/OiBzdHJpbmc7IHNpbGVudD86IGJvb2xlYW4gfSwgZXZlbnQ6IElwY01haW5FdmVudCk6IGJvb2xlYW4gfCBzdHJpbmcge1xuICAgIGNvbnN0IHsgdGl0bGUsIHN1YnRpdGxlLCBib2R5LCBzaWxlbnR9ID0gYXJncztcblxuICAgIGlmICghTm90aWZpY2F0aW9uLmlzU3VwcG9ydGVkKCkpIHtcbiAgICAgIHJldHVybiAnXHU1RjUzXHU1MjREXHU3Q0ZCXHU3RURGXHU0RTBEXHU2NTJGXHU2MzAxXHU5MDFBXHU3N0U1JztcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zOiBOb3RpZmljYXRpb25Db25zdHJ1Y3Rvck9wdGlvbnMgPSB7fTtcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIG9wdGlvbnMudGl0bGUgPSB0aXRsZTtcbiAgICB9XG4gICAgaWYgKHN1YnRpdGxlKSB7XG4gICAgICBvcHRpb25zLnN1YnRpdGxlID0gc3VidGl0bGU7XG4gICAgfVxuICAgIGlmIChib2R5KSB7XG4gICAgICBvcHRpb25zLmJvZHkgPSBib2R5O1xuICAgIH1cbiAgICBpZiAoc2lsZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdGlvbnMuc2lsZW50ID0gc2lsZW50O1xuICAgIH1cbiAgICB3aW5kb3dTZXJ2aWNlLmNyZWF0ZU5vdGlmaWNhdGlvbihvcHRpb25zLCBldmVudCk7XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9ICAgXG59XG5leHBvcnQgZGVmYXVsdCBPc0NvbnRyb2xsZXI7XG4iLCAiLy8gQXV0by1nZW5lcmF0ZWQgY29udHJvbGxlciByZWdpc3RyeSAtIGRvIG5vdCBlZGl0XG5nbG9iYWwuX19FRV9DT05UUk9MTEVSX1JFR0lTVFJZX18gPSBbXG4gIHsgZnVsbHBhdGg6IFwiY29udHJvbGxlci9jcm9zcy50c1wiLCBwcm9wZXJ0aWVzOiBbXCJjcm9zc1wiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL2Nyb3NzLnRzXCIpOyB9IH0sXG4gIHsgZnVsbHBhdGg6IFwiY29udHJvbGxlci9lZmZlY3QudHNcIiwgcHJvcGVydGllczogW1wiZWZmZWN0XCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vZWZmZWN0LnRzXCIpOyB9IH0sXG4gIHsgZnVsbHBhdGg6IFwiY29udHJvbGxlci9leGFtcGxlLnRzXCIsIHByb3BlcnRpZXM6IFtcImV4YW1wbGVcIl0sIGdldCBtb2R1bGUoKSB7IHJldHVybiByZXF1aXJlKFwiLi9leGFtcGxlLnRzXCIpOyB9IH0sXG4gIHsgZnVsbHBhdGg6IFwiY29udHJvbGxlci9mcmFtZXdvcmsudHNcIiwgcHJvcGVydGllczogW1wiZnJhbWV3b3JrXCJdLCBnZXQgbW9kdWxlKCkgeyByZXR1cm4gcmVxdWlyZShcIi4vZnJhbWV3b3JrLnRzXCIpOyB9IH0sXG4gIHsgZnVsbHBhdGg6IFwiY29udHJvbGxlci9vcy50c1wiLCBwcm9wZXJ0aWVzOiBbXCJvc1wiXSwgZ2V0IG1vZHVsZSgpIHsgcmV0dXJuIHJlcXVpcmUoXCIuL29zLnRzXCIpOyB9IH1cbl07IiwgImltcG9ydCB7IGFwcCBhcyBlbGVjdHJvbkFwcCwgc2NyZWVuIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0Q29uZmlnIH0gZnJvbSAnZWUtY29yZS9jb25maWcnO1xuaW1wb3J0IHsgZ2V0TWFpbldpbmRvdyB9IGZyb20gJ2VlLWNvcmUvZWxlY3Ryb24nO1xuXG5jbGFzcyBMaWZlY3ljbGUge1xuICAvKipcbiAgICogY29yZSBhcHAgaGF2ZSBiZWVuIGxvYWRlZFxuICAgKi9cbiAgYXN5bmMgcmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmluZm8oJ1tsaWZlY3ljbGVdIHJlYWR5Jyk7XG4gIH1cblxuICAvKipcbiAgICogZWxlY3Ryb24gYXBwIHJlYWR5XG4gICAqL1xuICBhc3luYyBlbGVjdHJvbkFwcFJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSBlbGVjdHJvbi1hcHAtcmVhZHknKTtcblxuICAgIC8vIFdoZW4gZG91YmxlIGNsaWNraW5nIHRoZSBpY29uLCBkaXNwbGF5IHRoZSBvcGVuZWQgd2luZG93XG4gICAgZWxlY3Ryb25BcHAub24oJ3NlY29uZC1pbnN0YW5jZScsICgpID0+IHtcbiAgICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcbiAgICAgIGlmICh3aW4uaXNNaW5pbWl6ZWQoKSkge1xuICAgICAgICB3aW4ucmVzdG9yZSgpO1xuICAgICAgfVxuICAgICAgd2luLnNob3coKTtcbiAgICAgIHdpbi5mb2N1cygpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIG1haW4gd2luZG93IGhhdmUgYmVlbiBsb2FkZWRcbiAgICovXG4gIGFzeW5jIHdpbmRvd1JlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKCdbbGlmZWN5Y2xlXSB3aW5kb3ctcmVhZHknKTtcblxuICAgIGNvbnN0IHdpbiA9IGdldE1haW5XaW5kb3coKTtcblxuICAgIC8vIFRoZSB3aW5kb3cgaXMgY2VudGVyZWQgYW5kIHNjYWxlZCBwcm9wb3J0aW9uYWxseVxuICAgIC8vIE9idGFpbiB0aGUgc2l6ZSBpbmZvcm1hdGlvbiBvZiB0aGUgbWFpbiBzY3JlZW4sIGNhbGN1bGF0ZSB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgd2luZG93IGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgc2NyZWVuLFxuICAgIC8vIGFuZCBjYWxjdWxhdGUgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSB1cHBlciBsZWZ0IGNvcm5lciB3aGVuIHRoZSB3aW5kb3cgaXMgY2VudGVyZWRcbiAgICBjb25zdCBtYWluU2NyZWVuID0gc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCk7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtYWluU2NyZWVuLndvcmtBcmVhU2l6ZTtcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiAwLjcpO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0ICogMC44KTtcbiAgICBjb25zdCB4ID0gTWF0aC5mbG9vcigod2lkdGggLSB3aW5kb3dXaWR0aCkgLyAyKTtcbiAgICBjb25zdCB5ID0gTWF0aC5mbG9vcigoaGVpZ2h0IC0gd2luZG93SGVpZ2h0KSAvIDIpO1xuICAgIHdpbi5zZXRCb3VuZHMoeyB4LCB5LCB3aWR0aDogd2luZG93V2lkdGgsIGhlaWdodDogd2luZG93SGVpZ2h0IH0pXG5cbiAgICAvLyBEZWxheWVkIGxvYWRpbmcsIG5vIHdoaXRlIHNjcmVlblxuICAgIGNvbnN0IHsgd2luZG93c09wdGlvbiB9ID0gZ2V0Q29uZmlnKCk7XG4gICAgaWYgKHdpbmRvd3NPcHRpb24uc2hvdyA9PSBmYWxzZSkge1xuICAgICAgd2luLm9uY2UoJ3JlYWR5LXRvLXNob3cnLCAoKSA9PiB7XG4gICAgICAgIHdpbi5zaG93KCk7XG4gICAgICAgIHdpbi5mb2N1cygpO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogYmVmb3JlIGFwcCBjbG9zZVxuICAgKi8gIFxuICBhc3luYyBiZWZvcmVDbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbygnW2xpZmVjeWNsZV0gYmVmb3JlLWNsb3NlJyk7XG4gIH1cbn1cbmV4cG9ydCB7XG4gIExpZmVjeWNsZVxufTtcbiIsICJpbXBvcnQgeyBUcmF5LCBNZW51LCBhcHAgYXMgZWxlY3Ryb25BcHAsIEJyb3dzZXJXaW5kb3csIE1lbnVJdGVtQ29uc3RydWN0b3JPcHRpb25zLCBFdmVudCB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0QmFzZURpciB9IGZyb20gJ2VlLWNvcmUvcHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnZWUtY29yZS9sb2cnO1xuaW1wb3J0IHsgZ2V0TWFpbldpbmRvdywgZ2V0Q2xvc2VBbmRRdWl0LCBzZXRDbG9zZUFuZFF1aXQgfSBmcm9tICdlZS1jb3JlL2VsZWN0cm9uJztcblxuLyoqXG4gKiBcdTYyNThcdTc2RDhcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUcmF5U2VydmljZSB7XG4gIHByaXZhdGUgdHJheTogVHJheSB8IG51bGw7XG4gIHByaXZhdGUgY29uZmlnOiB7IHRpdGxlOiBzdHJpbmc7IGljb246IHN0cmluZyB9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudHJheSA9IG51bGw7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICB0aXRsZTogJ2VsZWN0cm9uLWVnZycsXG4gICAgICBpY29uOiAnL3B1YmxpYy9pbWFnZXMvdHJheS5wbmcnXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIxQlx1NUVGQVx1NjI1OFx1NzZEOFxuICAgKi9cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnW3RyYXldIGxvYWQnKTtcblxuICAgIGNvbnN0IGNmZyA9IHRoaXMuY29uZmlnO1xuICAgIGNvbnN0IG1haW5XaW5kb3cgPSBnZXRNYWluV2luZG93KCk7XG5cbiAgICAvLyB0cmF5IGljb25cbiAgICBjb25zdCBpY29uUGF0aCA9IHBhdGguam9pbihnZXRCYXNlRGlyKCksIGNmZy5pY29uKTtcblxuICAgIC8vIFx1NjI1OFx1NzZEOFx1ODNEQ1x1NTM1NVx1NTI5Rlx1ODBGRFx1NTIxN1x1ODg2OFxuICAgIGNvbnN0IHRyYXlNZW51VGVtcGxhdGU6IE1lbnVJdGVtQ29uc3RydWN0b3JPcHRpb25zW10gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnXHU2NjNFXHU3OTNBJyxcbiAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBtYWluV2luZG93LnNob3coKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdcdTkwMDBcdTUxRkEnLFxuICAgICAgICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVsZWN0cm9uQXBwLnF1aXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF1cblxuICAgIC8vIFx1OEJCRVx1N0Y2RVx1NEUwMFx1NEUyQVx1NjgwN1x1OEJDNlx1RkYwQ1x1NzBCOVx1NTFGQlx1NTE3M1x1OTVFRFx1RkYwQ1x1NjcwMFx1NUMwRlx1NTMxNlx1NTIzMFx1NjI1OFx1NzZEOFxuICAgIHNldENsb3NlQW5kUXVpdChmYWxzZSk7XG4gICAgbWFpbldpbmRvdy5vbignY2xvc2UnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZ2V0Q2xvc2VBbmRRdWl0KCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbWFpbldpbmRvdy5oaWRlKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU5NjkwXHU4NUNGXHU1RTk0XHU3NTI4XHU4M0RDXHU1MzU1XHU2ODBGXG4gICAgbWFpbldpbmRvdy5zZXRNZW51QmFyVmlzaWJpbGl0eShmYWxzZSk7XG5cbiAgICAvLyBcdTVCOUVcdTRGOEJcdTUzMTZcdTYyNThcdTc2RDhcbiAgICB0aGlzLnRyYXkgPSBuZXcgVHJheShpY29uUGF0aCk7XG4gICAgdGhpcy50cmF5LnNldFRvb2xUaXAoY2ZnLnRpdGxlKTtcbiAgICBjb25zdCBjb250ZXh0TWVudSA9IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUodHJheU1lbnVUZW1wbGF0ZSk7XG4gICAgdGhpcy50cmF5LnNldENvbnRleHRNZW51KGNvbnRleHRNZW51KTtcbiAgICAvLyBcdTVERTZcdTk1MkVcdTUzNTVcdTUxRkJcdTc2ODRcdTY1RjZcdTUwMTlcdTgwRkRcdTU5MUZcdTY2M0VcdTc5M0FcdTRFM0JcdTdBOTdcdTUzRTNcbiAgICB0aGlzLnRyYXkub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgbWFpbldpbmRvdy5zaG93KClcbiAgICB9KVxuICB9XG59XG5leHBvcnQgY29uc3QgdHJheVNlcnZpY2UgPSBuZXcgVHJheVNlcnZpY2UoKTtcbiIsICJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBhcHAgYXMgZWxlY3Ryb25BcHAgfSBmcm9tICdlbGVjdHJvbic7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgU2VjdXJpdHlTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIFx1NTIxQlx1NUVGQVxuICAgKi9cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnW3NlY3VyaXR5XSBsb2FkJyk7XG4gICAgY29uc3QgcnVuV2l0aERlYnVnID0gcHJvY2Vzcy5hcmd2LmZpbmQoZnVuY3Rpb24oZTogc3RyaW5nKXtcbiAgICAgIGxldCBpc0hhc0RlYnVnID0gZS5pbmNsdWRlcyhcIi0taW5zcGVjdFwiKSB8fCBlLmluY2x1ZGVzKFwiLS1pbnNwZWN0LWJya1wiKSB8fCBlLmluY2x1ZGVzKFwiLS1yZW1vdGUtZGVidWdnaW5nLXBvcnRcIik7XG4gICAgICByZXR1cm4gaXNIYXNEZWJ1ZztcbiAgICB9KVxuXG4gICAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTBEXHU1MTQxXHU4QkI4XHU4RkRDXHU3QTBCXHU4QzAzXHU4QkQ1XG4gICAgaWYgKHJ1bldpdGhEZWJ1ZyAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2QnKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ1tlcnJvcl0gUmVtb3RlIGRlYnVnZ2luZyBpcyBub3QgYWxsb3dlZCwgIHJ1bldpdGhEZWJ1ZzonLCBydW5XaXRoRGVidWcpO1xuICAgICAgZWxlY3Ryb25BcHAucXVpdCgpO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGNvbnN0IHNlY3VyaXR5U2VydmljZSA9IG5ldyBTZWN1cml0eVNlcnZpY2UoKTtcbiIsICIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqIHByZWxvYWRcdTRFM0FcdTk4ODRcdTUyQTBcdThGN0RcdTZBMjFcdTU3NTdcdUZGMENcdThCRTVcdTY1ODdcdTRFRjZcdTVDMDZcdTRGMUFcdTU3MjhcdTdBMEJcdTVFOEZcdTU0MkZcdTUyQThcdTY1RjZcdTUyQTBcdThGN0QgKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyB0cmF5U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2Uvb3MvdHJheSc7XG5pbXBvcnQgeyBzZWN1cml0eVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlL29zL3NlY3VyaXR5Jztcbi8vIGltcG9ydCB7IGNyb3NzU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2UvY3Jvc3MnO1xuaW1wb3J0IHsgc3FsaXRlZGJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9kYXRhYmFzZS9zcWxpdGVkYic7XG5pbXBvcnQgeyB3aW5kb3dTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZS9vcy93aW5kb3cnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gXHU3OTNBXHU0RjhCXHU1MjlGXHU4MEZEXHU2QTIxXHU1NzU3XHVGRjBDXHU1M0VGXHU5MDA5XHU2MkU5XHU2MDI3XHU0RjdGXHU3NTI4XHU1NDhDXHU0RkVFXHU2NTM5XG4gIGxvZ2dlci5pbmZvKCdbcHJlbG9hZF0gbG9hZCA1Jyk7XG4gIHdpbmRvd1NlcnZpY2UuaW5pdCgpO1xuICB0cmF5U2VydmljZS5pbml0KCk7XG4gIHNlY3VyaXR5U2VydmljZS5pbml0KCk7XG4gIC8vIGluaXQgc3FsaXRlIGRiIChsYXp5IGxvYWRzIGJldHRlci1zcWxpdGUzIG9uIGZpcnN0IHVzZSlcbiAgYXdhaXQgc3FsaXRlZGJTZXJ2aWNlLmluaXQoKTtcbiAgLy8gZ28gc2VydmVyXG4gIC8vY3Jvc3NTZXJ2aWNlLmNyZWF0ZUdvU2VydmVyKCk7XG59XG5cblxuIiwgImltcG9ydCB7IEVsZWN0cm9uRWdnIH0gZnJvbSAnZWUtY29yZSc7XG5pbXBvcnQgeyBMaWZlY3ljbGUgfSBmcm9tICcuL3ByZWxvYWQvbGlmZWN5Y2xlJztcbmltcG9ydCB7IHByZWxvYWQgfSBmcm9tICcuL3ByZWxvYWQnO1xuXG4vLyBuZXcgYXBwXG5jb25zdCBhcHAgPSBuZXcgRWxlY3Ryb25FZ2coKTtcblxuLy8gcmVnaXN0ZXIgbGlmZWN5Y2xlXG5jb25zdCBsaWZlID0gbmV3IExpZmVjeWNsZSgpO1xuYXBwLnJlZ2lzdGVyKFwicmVhZHlcIiwgbGlmZS5yZWFkeSk7XG5hcHAucmVnaXN0ZXIoXCJlbGVjdHJvbi1hcHAtcmVhZHlcIiwgbGlmZS5lbGVjdHJvbkFwcFJlYWR5KTtcbmFwcC5yZWdpc3RlcihcIndpbmRvdy1yZWFkeVwiLCBsaWZlLndpbmRvd1JlYWR5KTtcbmFwcC5yZWdpc3RlcihcImJlZm9yZS1jbG9zZVwiLCBsaWZlLmJlZm9yZUNsb3NlKTtcblxuLy8gcmVnaXN0ZXIgcHJlbG9hZFxuYXBwLnJlZ2lzdGVyKFwicHJlbG9hZFwiLCBwcmVsb2FkKTtcblxuLy8gcnVuXG5hcHAucnVuKCk7XG4iLCAiLy8gQXV0by1nZW5lcmF0ZWQgYnVuZGxlIGVudHJ5IC0gZG8gbm90IGVkaXRcbnJlcXVpcmUoJ2FwcDpjb25maWctcmVnaXN0cnknKTtcbnJlcXVpcmUoJ2FwcDpjb250cm9sbGVyLXJlZ2lzdHJ5Jyk7XG5yZXF1aXJlKFwiLi9tYWluLnRzXCIpOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQ0EsV0FN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WyJwYXRoIiwgImltcG9ydF9wcyIsICJpbXBvcnRfcGF0aCIsICJwYXRoIiwgImF4aW9zIiwgImluaXRfY3Jvc3MiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF9sb2ciLCAiaW1wb3J0X3BzIiwgImltcG9ydF9wYXRoIiwgInBhdGgiLCAiaW1wb3J0X2VsZWN0cm9uIiwgImltcG9ydF91dGlscyIsICJpbXBvcnRfbG9nIiwgImVsZWN0cm9uQXBwIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X2xvZyIsICJpbml0X2ZyYW1ld29yayIsICJwYXRoIiwgImZzIiwgImVsZWN0cm9uQXBwIiwgImRheWpzIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X2NvbmZpZyIsICJpbXBvcnRfdXRpbHMiLCAiaW1wb3J0X2xvZyIsICJwYXRoIiwgImltcG9ydF9mcyIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfZWxlY3Ryb24iLCAicGF0aCIsICJlbGVjdHJvbkFwcCIsICJmcyIsICJpbXBvcnRfZWxlY3Ryb24iLCAiaW1wb3J0X2xvZyIsICJpbXBvcnRfY29uZmlnIiwgImVsZWN0cm9uQXBwIiwgImltcG9ydF9lbGVjdHJvbiIsICJpbXBvcnRfcGF0aCIsICJpbXBvcnRfcHMiLCAiaW1wb3J0X2xvZyIsICJwYXRoIiwgImVsZWN0cm9uQXBwIiwgImltcG9ydF9sb2ciLCAiaW1wb3J0X2VsZWN0cm9uIiwgImVsZWN0cm9uQXBwIiwgImltcG9ydF9sb2ciXQp9Cg==
