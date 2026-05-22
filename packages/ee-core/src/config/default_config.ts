import path from 'path';
import { isDev, getBaseDir, getLogDir } from '../ps/index.js';
import { SocketIO } from '../const/channel.js';

export default function defaultConfig(): Record<string, unknown> {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: 'electron-egg',
      width: 980,
      height: 650,
      minWidth: 400,
      minHeight: 300,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
      frame: true,
      show: false,
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },
    logger: {
      type: 'application',
      dir: getLogDir(),
      level: 'info',
      outputJSON: false,
      prettyPrint: isDev(),
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log',
      rotator: 'day',
      redact: [],
      timestamp: true,
      name: 'ee',
      maxSize: '10m',
    },
    socketServer: {
      enable: false, // is it enabled
      port: 7070, // default port (if the port is in use, randomly select one)
      path: "/socket.io/", // path
      connectTimeout: 45000, // client connection timeout
      pingTimeout: 30000, // heartbeat detection timeout
      pingInterval: 25000, // heartbeat detection interval
      maxHttpBufferSize: 1e8, // the data size of each message 1M
      transports: ["polling", "websocket"], // http polling or websocket
      cors: {
        origin: true, // http协议时，要设置跨域 类型 Boolean String RegExp Array Function
      },
      channel: SocketIO.partySoftware,
    },
    httpServer: {
      enable: false, // is it enabled
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      protocol: 'http://',
      host: '127.0.0.1',
      port: 7071, // Default port (if the port is in use, randomly select one)
      cors: {
        origin: '*',
      },
      body: {
        multipart: true,
        formidable: {
          keepExtensions: true,
        },
      },
      filterRequest: {
        uris: ['favicon.ico'],
        returnData: '',
      },
    },
    remote: {
      enable: false,
      url: '',
    },
    mainServer: {
      protocol: 'file://',
      indexPath: '/public/dist/index.html',
      options: {},
      takeover: '',
      loadingPage: '',
      channelSeparator: '/',
    },
    exception: {
      mainExit: false,
      childExit: false,
      rendererExit: true,
    },
    jobs: {
      messageLog: false,
    },
    cross: {},
  };
}
