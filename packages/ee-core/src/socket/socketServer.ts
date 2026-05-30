/**
 * @module socket/socketServer
 * @description SocketIO 服务器。为第三方软件（非 Electron 渲染进程）提供
 * WebSocket/HTTP 轮询通信能力，使其能调用主进程的控制器方法。
 *
 * 通信协议：
 * - 客户端连接后，通过指定频道发送消息：{ cmd: 'controller/user/add', args: {...} }
 * - 服务端解析 cmd 路径，调用对应的控制器方法
 * - 控制器执行结果通过 callback 返回给客户端
 *
 * 使用场景：
 * - 本地其他进程（Go/Python 后端）与 Electron 主进程通信
 * - 远程控制面板通过 WebSocket 操控应用
 */
import debug from 'debug';
import { Server } from 'socket.io';
import { coreLogger } from '../log/index.js';
import { getConfig } from '../config/index.js';
import { SocketIO } from '../const/channel.js';
import { getController } from '../controller/index.js';
import { getPort } from '../utils/port/index.js';
import type { SocketServerConfig } from '../types/index.js';
import { resolveControllerFn } from './utils.js';

const debugLog = debug('ee-core:socket:socketServer');

/**
 * SocketServer SocketIO 服务器
 *
 * 使用工厂模式创建（static create()），因为初始化需要异步获取端口。
 * 配置中 enable=false 时，创建后不会启动服务。
 */
export class SocketServer {
  /** SocketIO 服务器配置 */
  config: SocketServerConfig;
  /** 通道分隔符 */
  channelSeparator: string;
  /** 当前连接的 socket 实例 */
  socket: ReturnType<Server['on']> | undefined;
  /** SocketIO Server 实例 */
  io: Server | undefined;

  private constructor() {
    const config = getConfig();
    this.config = config.socketServer;
    this.channelSeparator = config.mainServer.channelSeparator || '/';
    this.socket = undefined;
    this.io = undefined;
  }

  /**
   * 工厂方法：创建并初始化 SocketServer
   *
   * @returns 初始化完成的 SocketServer 实例
   */
  static async create(): Promise<SocketServer> {
    const instance = new SocketServer();
    await instance.init();
    return instance;
  }

  /**
   * 初始化 SocketIO 服务器
   *
   * 获取可用端口后创建 SocketIO Server 实例，
   * 端口号写入 process.env.EE_SOCKET_PORT 供其他模块获取。
   */
  async init(): Promise<void> {
    if (this.config.enable === false) {
      return;
    }

    const port = await getPort({ port: this.config.port });
    if (!port) {
      throw new Error('[ee-core] [socket/socketServer] socekt port required, and must be a number !');
    }
    coreLogger.info('[socket/socketServer] port is:', port);

    process.env.EE_SOCKET_PORT = String(port);
    this.config.port = port;
    this.io = new Server(port, this.config);
    this.connect();
  }

  /**
   * 监听客户端连接并处理消息
   *
   * 客户端连接后，监听配置的频道（默认 'socket-channel'）。
   * 收到消息后，通过 cmd 路径路由到对应的控制器方法执行。
   *
   * 消息格式：{ cmd: string, args: unknown }
   * 返回方式：通过 callback 函数将结果回传给客户端
   */
  connect(): void {
    const controller = getController();
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      const channel = this.config.channel || SocketIO.partySoftware;
      this.socket = socket as unknown as ReturnType<Server['on']>;
      socket.on(channel, async (message: { cmd: string; args: unknown }, callback: (result: unknown) => void) => {
        coreLogger.info('[socket/socketServer] socket id:' + socket.id + ' message cmd: ' + message.cmd);

        try {
          const cmd = message.cmd;
          const args = message.args;
          debugLog('[socket] channel %s', cmd);
          const fn = resolveControllerFn(controller, cmd, this.channelSeparator);
          if (!fn) throw new Error('function not exists');

          const result = await fn.call(controller, args);
          if (callback) {
            callback(result);
          }
        } catch (err) {
          coreLogger.error('[socket/socketServer] throw error:', err);
        }
      });
    });
  }
}
