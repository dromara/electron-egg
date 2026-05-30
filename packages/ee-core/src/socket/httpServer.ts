/**
 * @module socket/httpServer
 * @description HTTP/HTTPS server. Provides RESTful API services based on the Koa framework,
 * routing HTTP requests to corresponding controller methods.
 *
 * Request routing rules:
 * - URL path maps to controller path, e.g., /controller/user/add → controller.user.add
 * - GET request parameters from query, POST request parameters from body
 * - Paths starting with 'controller' are used directly, otherwise 'controller' prefix is added automatically
 * - URIs in filterRequest return specified data directly without going through controllers
 *
 * Middleware loading order:
 * 1. Error handler (errorHandler)
 * 2. Pre-middleware (preMiddleware)
 * 3. CORS cross-origin middleware
 * 4. koa-body request body parsing middleware
 * 5. Core routing dispatch middleware (_dispatch)
 * 6. Post-middleware (postMiddleware)
 */
import debug from 'debug';
import assert from 'assert';
import { isFunction, isObject, isArray } from '../utils/type_check.js';
import Koa from 'koa';
import cors from 'koa2-cors';
import koaBody from 'koa-body';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { coreLogger } from '../log/index.js';
import { getBaseDir } from '../ps/index.js';
import { getController } from '../controller/index.js';
import { getConfig } from '../config/index.js';
import { getPort } from '../utils/port/index.js';
import type { HttpServerConfig, KoaConfig } from '../types/index.js';
import { resolveControllerFn } from './utils.js';

const debugLog = debug('ee-core:socket:httpServer');

/**
 * HttpServer - HTTP server
 *
 * Created using factory pattern (static create()), because initialization requires async port acquisition.
 * When enable=false in config, the service will not start after creation.
 */
export class HttpServer {
  /** HTTP server configuration */
  config: HttpServerConfig;
  /** Koa application instance */
  httpApp: Koa | undefined;
  /** Channel separator */
  channelSeparator: string;

  private constructor() {
    const config = getConfig();
    this.config = config.httpServer;
    this.channelSeparator = config.mainServer.channelSeparator || '/';
    this.httpApp = undefined;
  }

  /**
   * Factory method: create and initialize HttpServer
   *
   * @returns Fully initialized HttpServer instance
   */
  static async create(): Promise<HttpServer> {
    const instance = new HttpServer();
    await instance.init();
    return instance;
  }

  /**
   * Initialize HTTP server
   *
   * Acquires an available port then creates a Koa application and starts listening.
   * The port number is written to process.env.EE_HTTP_PORT for other modules to access.
   */
  async init(): Promise<void> {
    if (this.config.enable === false) {
      return;
    }

    const port = await getPort({ port: this.config.port });
    if (!port) {
      throw new Error('[ee-core] [socket/HttpServer] http port required, and must be a number !');
    }
    process.env.EE_HTTP_PORT = String(port);
    this.config.port = port;
    this._create();
  }

  /**
   * Create Koa application and start HTTP/HTTPS service
   *
   * Loads middleware in order, handles HTTPS configuration, and starts listening.
   */
  async _create(): Promise<void> {
    const config = this.config;
    const koaConfig: KoaConfig = config.koaConfig || {};
    const preMiddleware = koaConfig.preMiddleware || [];
    const postMiddleware = koaConfig.postMiddleware || [];
    const errorHandler = koaConfig.errorHandler || null;
    const isHttps = config.https.enable === true;
    const sslOptions: { key?: Buffer; cert?: Buffer } = {};

    if (isHttps) {
      config.protocol = 'https://';
      const httpsConfig = config.https;
      const keyFile = path.join(getBaseDir(), httpsConfig.key);
      const certFile = path.join(getBaseDir(), httpsConfig.cert);
      assert(fs.existsSync(keyFile), 'ssl key file is required');
      assert(fs.existsSync(certFile), 'ssl cert file is required');

      sslOptions.key = fs.readFileSync(keyFile);
      sslOptions.cert = fs.readFileSync(certFile);
    }

    const url = config.protocol + config.host + ':' + config.port;
    const corsOptions = config.cors as Record<string, unknown>;

    const koaApp = new Koa();

    // Set up error handler for unified error code handling
    this._setupErrorHandler(koaApp, errorHandler);
    // Load pre-middleware
    this._loadMiddlewares(koaApp, preMiddleware, 'pre');

    // Core middleware
    koaApp.use(cors(corsOptions as Parameters<typeof cors>[0]));
    koaApp.use(koaBody(config.body));
    koaApp.use(this._dispatch.bind(this));
    // Load post-middleware
    this._loadMiddlewares(koaApp, postMiddleware, 'post');

    let msg = '[socket/http] server is: ' + url;
    const listenOpt = { host: config.host, port: config.port };
    if (isHttps) {
      const server = https.createServer(sslOptions, koaApp.callback());
      server.on('error', (err) => {
        coreLogger.error(`[socket/http] https server error: ${err.message}`);
      });
      server.listen(listenOpt, () => {
        coreLogger.info(msg);
      });
    } else {
      const server = koaApp.listen(listenOpt, () => {
        coreLogger.info(msg);
      });
      server.on('error', (err) => {
        coreLogger.error(`[socket/http] http server error: ${err.message}`);
      });
    }

    this.httpApp = koaApp;
  }

  /**
   * Core routing dispatch middleware
   *
   * Maps HTTP request paths to controller methods:
   * 1. Remove leading '/' from path
   * 2. Check if path is in filter list (e.g., favicon.ico)
   * 3. Ensure path starts with 'controller'
   * 4. Find and call controller method via resolveControllerFn
   * 5. GET requests pass query params, POST requests pass body params
   *
   * Error handling: When controller method throws an exception, returns 500 + { error: 'Internal Server Error' }
   */
  async _dispatch(ctx: Koa.Context, next: Koa.Next): Promise<void> {
    const controller = getController();
    const { filterRequest } = getConfig().httpServer;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    // Deep copy query object to avoid Express/Koa proxy object issues
    params = isObject(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    ctx.response.status = 200;

    try {
      // Remove leading '/'
      if (uriPath.indexOf('/') === 0) {
        uriPath = uriPath.substring(1);
      }
      // Filter requests that don't need routing
      if (filterRequest.uris.includes(uriPath)) {
        ctx.response.body = filterRequest.returnData;
        await next();
        return;
      }
      // Automatically add 'controller' prefix
      if (uriPath.slice(0, 10) !== 'controller') {
        uriPath = 'controller/' + uriPath;
      }
      const cmd = uriPath.split('/').join(this.channelSeparator);
      debugLog('[request] uri %s', cmd);
      // GET uses query, POST uses body
      const args = method === 'POST' ? body : params;
      const fn = resolveControllerFn(controller, cmd, this.channelSeparator);
      if (!fn) throw new Error('function not exists');

      const result = await fn.call(controller, args, ctx);
      ctx.response.body = result;
    } catch (err) {
      coreLogger.error('[httpServer] throw error:', err);
      ctx.response.status = 500;
      ctx.response.body = { error: 'Internal Server Error' };
      // Attach original error to ctx for downstream error-reporting middleware
      (ctx as Record<string, unknown>).__ee_error = err;
    }

    await next();
  }

  /**
   * Get Koa application instance
   *
   * @returns Koa instance, or undefined if HTTP service is not enabled
   */
  getHttpApp(): Koa | undefined {
    return this.httpApp;
  }

  /**
   * Set up Koa error handler
   *
   * @param app - Koa application instance
   * @param errorHandler - Error handler function that receives an Error parameter
   */
  _setupErrorHandler(app: Koa, errorHandler: ((err: Error) => void) | null): void {
    if (isFunction(errorHandler)) {
      app.on('error', errorHandler);
    }
  }

  /**
   * Load pre/post middleware
   *
   * Middleware can be factory functions (called to return Koa middleware) or direct middleware functions.
   * Invalid middleware will be skipped with a warning.
   *
   * @param app - Koa application instance
   * @param middlewares - Middleware array
   * @param type - Type identifier (pre/post), used for warning messages
   */
  _loadMiddlewares(app: Koa, middlewares: unknown[] = [], type = 'pre'): void {
    if (isArray(middlewares)) {
      middlewares.forEach((middleware) => {
        if (isFunction(middleware)) {
          // middleware is a factory function, called to return (ctx, next) => {} style middleware
          app.use((middleware as () => Koa.Middleware)());
        } else {
          coreLogger.warn(`[ee-core/httpServer] Invalid ${type} middleware detected, skipping.`);
        }
      });
    }
  }
}
