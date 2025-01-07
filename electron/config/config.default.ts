import path from 'path';
import { getBaseDir } from 'ee-core/ps';

interface WindowOption {
  title: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  webPreferences: {
    contextIsolation: boolean;
    nodeIntegration: boolean;
  };
  frame: boolean;
  show: boolean;
  icon: string;
}

interface Logger {
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  outputJSON: boolean;
  appLogName: string;
  coreLogName: string;
  errorLogName: string;
}

interface Remote {
  enable: boolean;
  url: string;
}

interface SocketServer {
  enable: boolean;
  port: number;
  path: string;
  connectTimeout: number;
  pingTimeout: number;
  pingInterval: number;
  maxHttpBufferSize: number;
  transports: ('polling' | 'websocket')[];
  cors: {
    origin: boolean | string | ((origin: string, callback: (err: any, allow: boolean) => void) => void);
  };
  channel: string;
}

interface HttpServer {
  enable: boolean;
  https: {
    enable: boolean;
    key: string;
    cert: string;
  };
  host: string;
  port: number;
}

interface MainServer {
  indexPath: string;
}

interface Customize {
  tray: {
    title: string;
    icon: string;
  };
  awaken: {
    protocol: string;
    args: any[];
  };
}

interface AppConfig {
  openDevTools: boolean;
  singleLock: boolean;
  windowsOption: WindowOption;
  logger: Logger;
  remote: Remote;
  socketServer: SocketServer;
  httpServer: HttpServer;
  mainServer: MainServer;
  customize: Customize;
}

const config: () => AppConfig = () => {
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
      show: true,
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },
    logger: {
      level: 'INFO',
      outputJSON: false,
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log',
    },
    remote: {
      enable: false,
      url: 'http://electron-egg.kaka996.com/',
    },
    socketServer: {
      enable: false,
      port: 7070,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: true,
      },
      channel: 'c1',
    },
    httpServer: {
      enable: false,
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      host: '127.0.0.1',
      port: 7071,
    },
    mainServer: {
      indexPath: '/public/dist/index.html',
    },
    customize: {
      tray: {
        title: 'EE程序',
        icon: '/public/images/tray.png',
      },
      awaken: {
        protocol: 'ee',
        args: [],
      },
    },
  };
};

export default config;