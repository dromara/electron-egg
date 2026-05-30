export { SocketServer } from './socketServer.js';
export { HttpServer } from './httpServer.js';
export { IpcServer } from './ipcServer.js';

import { Server as IoServer } from 'socket.io';
import IoClient from 'socket.io-client';
import Koa from 'koa';
import { SocketServer } from './socketServer.js';
import { HttpServer } from './httpServer.js';
import { IpcServer } from './ipcServer.js';

export { Koa, IoServer, IoClient };

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
export async function createSocketServer(): Promise<SocketServer> {
  Instance.socketServer = await SocketServer.create();
  return Instance.socketServer;
}

// socketServer
export function getSocketServer(): SocketServer | null {
  return Instance.socketServer;
}

// create Http Server
export async function createHttpServer(): Promise<HttpServer> {
  Instance.httpServer = await HttpServer.create();
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
export async function loadSocket(): Promise<void> {
  await createSocketServer();
  await createHttpServer();
  createIpcServer();
}
