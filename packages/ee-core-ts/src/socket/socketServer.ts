import debug from 'debug';
import is from 'is-type-of';
import { Server } from 'socket.io';
import { coreLogger } from '../log/index.js';
import { getConfig } from '../config/index.js';
import { SocketIO } from '../const/channel.js';
import { getController } from '../controller/index.js';
import { getPort } from '../utils/port/index.js';

const debugLog = debug('ee-core:socket:socketServer');

export class SocketServer {
  config: Record<string, unknown>;
  channelSeparator: string;
  socket: ReturnType<Server['on']> | undefined;
  io: Server | undefined;

  constructor() {
    const { socketServer, mainServer } = getConfig() as {
      socketServer: Record<string, unknown>;
      mainServer: { channelSeparator: string };
    };
    this.config = socketServer;
    this.channelSeparator = mainServer.channelSeparator;
    this.init();
  }

  async init(): Promise<void> {
    if (this.config.enable === false) {
      return;
    }

    const port = await getPort({ port: parseInt(this.config.port as string) });
    if (!port) {
      throw new Error('[ee-core] [socket/socketServer] socekt port required, and must be a number !');
    }
    coreLogger.info('[ee-core] [socket/socketServer] port is:', port);

    process.env.EE_SOCKET_PORT = String(port);
    this.config.port = port;
    this.io = new Server(port, this.config as ConstructorParameters<typeof Server>[1]);
    this.connect();
  }

  connect(): void {
    const controller = getController();
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      const channel = (this.config.channel as string) || SocketIO.partySoftware;
      this.socket = socket as unknown as ReturnType<Server['on']>;
      socket.on(channel, async (message: { cmd: string; args: unknown }, callback: (result: unknown) => void) => {
        coreLogger.info('[ee-core] [socket/socketServer] socket id:' + socket.id + ' message cmd: ' + message.cmd);

        try {
          const cmd = message.cmd;
          const args = message.args;
          let fn: ((...args: unknown[]) => unknown) | null = null;
          debugLog('[socket] channel %s', cmd);
          if (is.string(cmd)) {
            const actions = cmd.split(this.channelSeparator);
            debugLog('[findFn] channel %o', actions);
            let obj: Record<string, unknown> = { controller };
            actions.forEach((key) => {
              obj = obj[key] as Record<string, unknown>;
              if (!obj) throw new Error(`class or function '${key}' not exists`);
            });
            fn = obj as unknown as (...args: unknown[]) => unknown;
          }
          if (!fn) throw new Error('function not exists');

          const result = await fn.call(controller, args);
          if (callback) {
            callback(result);
          }
        } catch (err) {
          coreLogger.error('[ee-core] [socket/socketServer] throw error:', err);
        }
      });
    });
  }
}
