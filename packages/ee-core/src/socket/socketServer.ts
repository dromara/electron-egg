/**
 * @module socket/socketServer
 * @description SocketIO server. Provides WebSocket/HTTP polling communication for
 * third-party software (non-Electron renderer processes) to call main process controller methods.
 *
 * Communication protocol:
 * - After client connects, send messages on a specified channel: { cmd: 'controller/user/add', args: {...} }
 * - Server parses the cmd path and calls the corresponding controller method
 * - Controller execution result is returned to client via callback
 *
 * Use cases:
 * - Local other processes (Go/Python backends) communicating with Electron main process
 * - Remote control panels operating the application via WebSocket
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
 * SocketServer - SocketIO server
 *
 * Created using factory pattern (static create()), because initialization requires async port acquisition.
 * When enable=false in config, the service will not start after creation.
 */
export class SocketServer {
  /** SocketIO server configuration */
  config: SocketServerConfig;
  /** Channel separator */
  channelSeparator: string;
  /** Currently connected socket instance */
  socket: ReturnType<Server['on']> | undefined;
  /** SocketIO Server instance */
  io: Server | undefined;

  private constructor() {
    const config = getConfig();
    this.config = config.socketServer;
    this.channelSeparator = config.mainServer.channelSeparator || '/';
    this.socket = undefined;
    this.io = undefined;
  }

  /**
   * Factory method: create and initialize SocketServer
   *
   * @returns Fully initialized SocketServer instance
   */
  static async create(): Promise<SocketServer> {
    const instance = new SocketServer();
    await instance.init();
    return instance;
  }

  /**
   * Initialize SocketIO server
   *
   * Acquires an available port then creates a SocketIO Server instance.
   * The port number is written to process.env.EE_SOCKET_PORT for other modules to access.
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
   * Listen for client connections and handle messages
   *
   * After client connects, listens on the configured channel (default 'socket-channel').
   * Upon receiving a message, routes via cmd path to the corresponding controller method for execution.
   *
   * Message format: { cmd: string, args: unknown }
   * Return method: Results are sent back to client via callback function
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
          // Return error to client so it's not silently lost
          if (callback) {
            callback({ __EE_ERROR__: true, message: err instanceof Error ? err.message : String(err) });
          }
        }
      });
    });
  }
}
