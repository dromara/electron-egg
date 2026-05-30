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

export class SocketServer {
  config: SocketServerConfig;
  channelSeparator: string;
  socket: ReturnType<Server['on']> | undefined;
  io: Server | undefined;

  private constructor() {
    const config = getConfig();
    this.config = config.socketServer;
    this.channelSeparator = config.mainServer.channelSeparator || '/';
    this.socket = undefined;
    this.io = undefined;
  }

  static async create(): Promise<SocketServer> {
    const instance = new SocketServer();
    await instance.init();
    return instance;
  }

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
