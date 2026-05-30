/**
 * @module socket
 * @description 通信服务模块入口。提供三种通信方式的创建和管理：
 *
 * - SocketServer：SocketIO 服务器，供第三方软件通过 WebSocket 通信
 * - HttpServer：HTTP/HTTPS 服务器，供 RESTful API 调用
 * - IpcServer：Electron IPC 服务器，供渲染进程通过 ipcRenderer 通信
 *
 * 使用方式：
 * - loadSocket()：在框架启动时调用，创建并初始化所有通信服务
 * - getSocketServer() / getHttpServer() / getIpcServer()：获取服务实例
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

/** 服务实例存储 */
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
 * 创建 SocketIO 服务器
 *
 * @returns SocketServer 实例
 */
export async function createSocketServer(): Promise<SocketServer> {
  Instance.socketServer = await SocketServer.create();
  return Instance.socketServer;
}

/**
 * 获取 SocketIO 服务器实例
 */
export function getSocketServer(): SocketServer | null {
  return Instance.socketServer;
}

/**
 * 创建 HTTP 服务器
 *
 * @returns HttpServer 实例
 */
export async function createHttpServer(): Promise<HttpServer> {
  Instance.httpServer = await HttpServer.create();
  return Instance.httpServer;
}

/**
 * 获取 HTTP 服务器实例
 */
export function getHttpServer(): HttpServer | null {
  return Instance.httpServer;
}

/**
 * 创建 IPC 服务器
 *
 * @returns IpcServer 实例
 */
export function createIpcServer(): IpcServer {
  Instance.ipcServer = new IpcServer();
  return Instance.ipcServer;
}

/**
 * 获取 IPC 服务器实例
 */
export function getIpcServer(): IpcServer | null {
  return Instance.ipcServer;
}

/**
 * 加载并初始化所有通信服务
 *
 * 按顺序创建：SocketIO → HTTP → IPC
 * 在框架启动流程中由 Application.run() 调用。
 */
export async function loadSocket(): Promise<void> {
  await createSocketServer();
  await createHttpServer();
  createIpcServer();
}
