/**
 * @module config/default_config
 * @description Framework built-in default configuration. All configuration items have default values defined here;
 * business configuration can override them. Configuration items are grouped by function:
 * window, logging, communication services, main server, exception handling, jobs, cross-process.
 */
import path from 'path';
import { isDev, getBaseDir, getLogDir } from '../ps/index.js';
import { SocketIO } from '../const/channel.js';
import type { Config } from '../types/index.js';

/**
 * Generate framework default configuration
 *
 * @returns Complete default configuration object
 */
export default function defaultConfig(): Config {
  return {
    /** Whether to open DevTools (only effective in development environment) */
    openDevTools: false,
    /** Whether to enable single-instance lock (prevents running multiple app instances simultaneously) */
    singleLock: true,

    /** Main window configuration */
    windowsOption: {
      title: 'electron-egg',
      width: 980,
      height: 650,
      minWidth: 400,
      minHeight: 300,
      webPreferences: {
        // Security warning: contextIsolation=false + nodeIntegration=true allows the renderer process
        // full access to Node.js APIs. Any XSS vulnerability in the renderer could lead to remote code execution.
        // New projects are recommended to set contextIsolation=true and use a preload script.
        contextIsolation: false,
        nodeIntegration: true,
      },
      /** Whether to show native window frame */
      frame: true,
      /** Whether to show the window immediately on creation (false allows loading content first to avoid blank screen) */
      show: false,
      /** Application icon path */
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },

    /** Logging configuration */
    logger: {
      /** Log file storage directory */
      dir: getLogDir(),
      /** Log level: trace < debug < info < warn < error < fatal */
      level: 'info',
      /** Whether to use pretty format output in development environment */
      prettyPrint: isDev(),
      /** Log filename date format */
      dateFormat: 'yyyy-MM-dd',
      /** Application log filename */
      appLogName: 'ee.log',
      /** Framework core log filename */
      coreLogName: 'ee-core.log',
      /** Error log filename */
      errorLogName: 'ee-error.log',
      /** Log rotation strategy: day (daily), hour (hourly) */
      rotator: 'day',
      /** List of field paths that need to be redacted */
      redact: [],
      /** Redaction replacement value */
      redactCensor: '[Redacted]',
      /** Whether to include timestamp */
      timestamp: true,
      /** IANA timezone for log timestamps (file JSON logs); 'UTC' or e.g. 'Asia/Shanghai' */
      timezone: 'UTC',
      /** pino logger name */
      name: 'ee',
      /** Maximum size of a single log file */
      maxSize: '10m',
      /** pino serializers */
      serializers: {},
      /** Custom log levels */
      customLevels: {},
      /** Object serialization depth limit */
      depthLimit: 5,
      /** Safe mode: do not throw exceptions when log writing fails */
      safe: true,
      /** Whether to enable logging */
      enabled: true,
    },

    /** SocketIO server configuration */
    socketServer: {
      enable: false,
      /** Default port (automatically selects a random port when occupied) */
      port: 7070,
      /** SocketIO path */
      path: "/socket.io/",
      /** Client connection timeout (milliseconds) */
      connectTimeout: 45000,
      /** Heartbeat check timeout (milliseconds) */
      pingTimeout: 30000,
      /** Heartbeat check interval (milliseconds) */
      pingInterval: 25000,
      /** Maximum data size per message (100MB) */
      maxHttpBufferSize: 1e8,
      /** Transport methods: polling (HTTP long-polling) and websocket */
      transports: ["polling", "websocket"],
      cors: {
        /** Cross-origin origin setting */
        origin: true,
      },
      /** SocketIO communication channel */
      channel: SocketIO.partySoftware,
    },

    /** HTTP server configuration */
    httpServer: {
      enable: false,
      /** HTTPS configuration */
      https: {
        enable: false,
        /** SSL private key path */
        key: '/public/ssl/localhost+1.key',
        /** SSL certificate path */
        cert: '/public/ssl/localhost+1.pem',
      },
      /** Protocol prefix */
      protocol: 'http://',
      /** Listen address */
      host: '127.0.0.1',
      /** Default port (automatically selects a random port when occupied) */
      port: 7071,
      cors: {
        origin: '*',
      },
      /** Request body parsing configuration (based on koa-body) */
      body: {
        /** Whether to support multipart/form-data (file upload) */
        multipart: true,
        formidable: {
          /** Whether to keep uploaded file extensions */
          keepExtensions: true,
        },
      },
      /** Request filter rules: matching URIs return specified data directly without going through controllers */
      filterRequest: {
        uris: ['favicon.ico'],
        returnData: '',
      },
      /** Koa middleware extension: pre/post middleware chains and a custom error handler (all optional, empty by default) */
      koaConfig: {
        /** Middleware executed before route handling (e.g. auth, logging) */
        preMiddleware: [],
        /** Middleware executed after route handling (e.g. response formatting) */
        postMiddleware: [],
        /** Custom Koa error handler; null falls back to the framework default */
        errorHandler: null,
      },
    },

    /** Remote service configuration */
    remote: {
      enable: false,
      /** Remote service URL */
      url: '',
    },

    /** Main server configuration (controls how the renderer process loads content) */
    mainServer: {
      /** Protocol: file:// loads local files, http:// loads remote service */
      protocol: 'file://',
      /** Home page file path */
      indexPath: '/public/dist/index.html',
      /** Additional options for BrowserWindow.loadURL */
      options: {},
      /** Cross-process takeover identifier: when non-empty, the Cross module provides the URL */
      takeover: '',
      /** Loading page path: shown first after window creation, switches to main page once loaded */
      loadingPage: '',
      /** IPC channel separator, used for concatenating controller paths */
      channelSeparator: '/',
    },

    /** Exception handling configuration */
    exception: {
      /** Whether to exit on main process exception */
      mainExit: false,
      /** Whether to exit on child process exception */
      childExit: false,
      /** Whether to exit on renderer process exception */
      rendererExit: true,
    },

    /** Background job configuration */
    jobs: {
      /** Whether to log job messages */
      messageLog: false,
    },

    /** Cross-process communication configuration (dynamically added) */
    cross: {},
  };
}
