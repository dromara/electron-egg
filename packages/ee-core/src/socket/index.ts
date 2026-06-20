/**
 * @module socket
 * @description Communication service module entry point. Provides creation and management of three communication modes:
 *
 * - SocketServer: SocketIO server for third-party software communication via WebSocket
 * - HttpServer: HTTP/HTTPS server for RESTful API calls
 * - IpcServer: Electron IPC server for renderer process communication via ipcRenderer
 *
 * Usage:
 * - loadSocket(): Called during framework startup to create and initialize all communication services
 * - getSocketServer() / getHttpServer() / getIpcServer(): Get service instances
 */
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

/** Service instance storage */
const Instance: {
  socketServer: SocketServer | null;
  httpServer: HttpServer | null;
  ipcServer: IpcServer | null;
} = {
  socketServer: null,
  httpServer: null,
  ipcServer: null,
};

/**
 * Create SocketIO server
 *
 * @returns SocketServer instance
 */
export async function createSocketServer(): Promise<SocketServer> {
  Instance.socketServer = await SocketServer.create();
  return Instance.socketServer;
}

/**
 * Get SocketIO server instance
 *
 * @returns SocketServer instance
 * @throws Error if socketServer has not been created yet
 */
export function getSocketServer(): SocketServer {
  const server = Instance.socketServer;
  if (!server) {
    throw new Error('[ee-core] getSocketServer() called before socketServer was created. Ensure this code runs after the Ready lifecycle event.');
  }
  return server;
}

/**
 * Create HTTP server
 *
 * @returns HttpServer instance
 */
export async function createHttpServer(): Promise<HttpServer> {
  Instance.httpServer = await HttpServer.create();
  return Instance.httpServer;
}

/**
 * Get HTTP server instance
 *
 * @returns HttpServer instance
 * @throws Error if httpServer has not been created yet
 */
export function getHttpServer(): HttpServer {
  const server = Instance.httpServer;
  if (!server) {
    throw new Error('[ee-core] getHttpServer() called before httpServer was created. Ensure this code runs after the Ready lifecycle event.');
  }
  return server;
}

/**
 * Create IPC server
 *
 * @returns IpcServer instance
 */
export function createIpcServer(): IpcServer {
  Instance.ipcServer = new IpcServer();
  return Instance.ipcServer;
}

/**
 * Get IPC server instance
 *
 * @returns IpcServer instance
 * @throws Error if ipcServer has not been created yet
 */
export function getIpcServer(): IpcServer {
  const server = Instance.ipcServer;
  if (!server) {
    throw new Error('[ee-core] getIpcServer() called before ipcServer was created. Ensure this code runs after the Ready lifecycle event.');
  }
  return server;
}

/**
 * Load and initialize all communication services
 *
 * Created in order: SocketIO → HTTP → IPC
 * Called by Application.run() during the framework startup flow.
 */
export async function loadSocket(): Promise<void> {
  await createSocketServer();
  await createHttpServer();
  createIpcServer();
}
