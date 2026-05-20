export { SocketServer } from './socketServer.js';
export { HttpServer } from './httpServer.js';
export { IpcServer } from './ipcServer.js';

import { SocketServer } from './socketServer.js';
import { HttpServer } from './httpServer.js';
import { IpcServer } from './ipcServer.js';

const Instance: {
  socketServer: SocketServer | null;
  httpServer: HttpServer | null;
  ipcServer: IpcServer | null;
} = {
  socketServer: null,
  httpServer: null,
  ipcServer: null,
};

// create SocketServer
export function createSocketServer(): SocketServer {
  Instance.socketServer = new SocketServer();
  return Instance.socketServer;
}

// socketServer
export function getSocketServer(): SocketServer | null {
  return Instance.socketServer;
}

// create Http Server
export function createHttpServer(): HttpServer {
  Instance.httpServer = new HttpServer();
  return Instance.httpServer;
}

// httpServer
export function getHttpServer(): HttpServer | null {
  return Instance.httpServer;
}

// create IPC Server
export function createIpcServer(): IpcServer {
  Instance.ipcServer = new IpcServer();
  return Instance.ipcServer;
}

// ipcServer
export function getIpcServer(): IpcServer | null {
  return Instance.ipcServer;
}

// load socket server
export function loadSocket(): void {
  createSocketServer();
  createHttpServer();
  createIpcServer();
}
