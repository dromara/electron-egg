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

export class HttpServer {
  config: HttpServerConfig;
  httpApp: Koa | undefined;
  channelSeparator: string;

  constructor() {
    const config = getConfig();
    this.config = config.httpServer;
    this.channelSeparator = config.mainServer.channelSeparator || '/';
    this.httpApp = undefined;
    this.init();
  }

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

    // 设置错误处理器，便于统一错误代码处理
    this._setupErrorHandler(koaApp, errorHandler);
    // 加载前置中间件
    this._loadMiddlewares(koaApp, preMiddleware, 'pre');

    // 核心中间件
    koaApp.use(cors(corsOptions as Parameters<typeof cors>[0]));
    koaApp.use(koaBody(config.body));
    koaApp.use(this._dispatch.bind(this));
    // 加载后置中间件
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

  async _dispatch(ctx: Koa.Context, next: Koa.Next): Promise<void> {
    const controller = getController();
    const { filterRequest } = getConfig().httpServer;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = isObject(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    ctx.response.status = 200;

    try {
      // 找函数
      // 去除开头的 '/'
      if (uriPath.indexOf('/') === 0) {
        uriPath = uriPath.substring(1);
      }
      // 过滤
      if (filterRequest.uris.includes(uriPath)) {
        ctx.response.body = filterRequest.returnData;
        await next();
        return;
      }
      if (uriPath.slice(0, 10) !== 'controller') {
        uriPath = 'controller/' + uriPath;
      }
      const cmd = uriPath.split('/').join(this.channelSeparator);
      debugLog('[request] uri %s', cmd);
      const args = method === 'POST' ? body : params;
      const fn = resolveControllerFn(controller, cmd, this.channelSeparator);
      if (!fn) throw new Error('function not exists');

      const result = await fn.call(controller, args, ctx);
      ctx.response.body = result;
    } catch (err) {
      coreLogger.error('[httpServer] throw error:', err);
      ctx.response.status = 500;
      ctx.response.body = { error: 'Internal Server Error' };
    }

    await next();
  }

  getHttpApp(): Koa | undefined {
    return this.httpApp;
  }

  // 设置错误处理函数
  _setupErrorHandler(app: Koa, errorHandler: ((err: Error) => void) | null): void {
    if (isFunction(errorHandler)) {
      app.on('error', errorHandler);
    }
  }

  /**
   * 加载前置、后置中间件
   * @param {*} app koaApp示例
   * @param {*} middlewares 中间件数组
   * @param {*} type 类型，pre/post
   */
  _loadMiddlewares(app: Koa, middlewares: unknown[] = [], type = 'pre'): void {
    if (isArray(middlewares)) {
      middlewares.forEach((middleware) => {
        if (isFunction(middleware)) {
          // middleware是一个方法
          // 返回值是中间件(ctx, next) => {}的异步函数
          // 便于使用async/await进行同步编程
          app.use((middleware as () => Koa.Middleware)());
        } else {
          coreLogger.warn(`[ee-core/httpServer] Invalid ${type} middleware detected, skipping.`);
        }
      });
    }
  }
}
