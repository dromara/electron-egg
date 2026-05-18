import path from 'path';
import { env, getBaseDir, getLogDir } from '../ps/index.js';
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
      encoding: 'utf8',
      env: env(),
      level: 'INFO',
      consoleLevel: 'INFO',
      disableConsoleAfterReady: env() !== 'local',
      outputJSON: false,
      buffer: true,
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      agentLogName: 'ee-agent.log',
      errorLogName: 'ee-error.log',
      coreLogger: {},
      allowDebugAtProd: false,
      enablePerformanceTimer: false,
      rotator: 'day',
    },
    socketServer: {
      enable: false,
      port: 7070,
      path: '/socket.io/',
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ['polling', 'websocket'],
      cors: {
        origin: true,
      },
      channel: SocketIO.partySoftware,
    },
    httpServer: {
      enable: false,
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      protocol: 'http://',
      host: '127.0.0.1',
      port: 7071,
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
