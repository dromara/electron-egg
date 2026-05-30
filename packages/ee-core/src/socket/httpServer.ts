/**
 * @module socket/httpServer
 * @description HTTP/HTTPS 服务器。基于 Koa 框架提供 RESTful API 服务，
 * 将 HTTP 请求路由到对应的控制器方法。
 *
 * 请求路由规则：
 * - URL 路径映射到控制器路径，如 /controller/user/add → controller.user.add
 * - GET 请求参数从 query 获取，POST 请求参数从 body 获取
 * - 以 controller 开头的路径直接使用，否则自动添加 controller 前缀
 * - filterRequest 中配置的 URI 直接返回指定数据，不经过控制器
 *
 * 中间件加载顺序：
 * 1. 错误处理器（errorHandler）
 * 2. 前置中间件（preMiddleware）
 * 3. CORS 跨域中间件
 * 4. koa-body 请求体解析中间件
 * 5. 核心路由分发中间件（_dispatch）
 * 6. 后置中间件（postMiddleware）
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
 * HttpServer HTTP 服务器
 *
 * 使用工厂模式创建（static create()），因为初始化需要异步获取端口。
 * 配置中 enable=false 时，创建后不会启动服务。
 */
export class HttpServer {
  /** HTTP 服务器配置 */
  config: HttpServerConfig;
  /** Koa 应用实例 */
  httpApp: Koa | undefined;
  /** 通道分隔符 */
  channelSeparator: string;

  private constructor() {
    const config = getConfig();
    this.config = config.httpServer;
    this.channelSeparator = config.mainServer.channelSeparator || '/';
    this.httpApp = undefined;
  }

  /**
   * 工厂方法：创建并初始化 HttpServer
   *
   * @returns 初始化完成的 HttpServer 实例
   */
  static async create(): Promise<HttpServer> {
    const instance = new HttpServer();
    await instance.init();
    return instance;
  }

  /**
   * 初始化 HTTP 服务器
   *
   * 获取可用端口后创建 Koa 应用并启动监听。
   * 端口号写入 process.env.EE_HTTP_PORT 供其他模块获取。
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
   * 创建 Koa 应用并启动 HTTP/HTTPS 服务
   *
   * 按顺序加载中间件，处理 HTTPS 配置，启动监听。
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

  /**
   * 核心路由分发中间件
   *
   * 将 HTTP 请求路径映射到控制器方法：
   * 1. 去除路径开头的 '/'
   * 2. 检查是否在过滤列表中（如 favicon.ico）
   * 3. 确保路径以 'controller' 开头
   * 4. 通过 resolveControllerFn 查找并调用控制器方法
   * 5. GET 请求传 query 参数，POST 请求传 body 参数
   *
   * 错误处理：控制器方法抛出异常时返回 500 + { error: 'Internal Server Error' }
   */
  async _dispatch(ctx: Koa.Context, next: Koa.Next): Promise<void> {
    const controller = getController();
    const { filterRequest } = getConfig().httpServer;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    // 深拷贝 query 对象，避免 Express/Koa 的代理对象问题
    params = isObject(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    ctx.response.status = 200;

    try {
      // 去除开头的 '/'
      if (uriPath.indexOf('/') === 0) {
        uriPath = uriPath.substring(1);
      }
      // 过滤无需路由的请求
      if (filterRequest.uris.includes(uriPath)) {
        ctx.response.body = filterRequest.returnData;
        await next();
        return;
      }
      // 自动补充 controller 前缀
      if (uriPath.slice(0, 10) !== 'controller') {
        uriPath = 'controller/' + uriPath;
      }
      const cmd = uriPath.split('/').join(this.channelSeparator);
      debugLog('[request] uri %s', cmd);
      // GET 用 query，POST 用 body
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

  /**
   * 获取 Koa 应用实例
   *
   * @returns Koa 实例，未启用 HTTP 服务时返回 undefined
   */
  getHttpApp(): Koa | undefined {
    return this.httpApp;
  }

  /**
   * 设置 Koa 错误处理器
   *
   * @param app - Koa 应用实例
   * @param errorHandler - 错误处理函数，接收 Error 参数
   */
  _setupErrorHandler(app: Koa, errorHandler: ((err: Error) => void) | null): void {
    if (isFunction(errorHandler)) {
      app.on('error', errorHandler);
    }
  }

  /**
   * 加载前置/后置中间件
   *
   * 中间件可以是工厂函数（调用后返回 Koa 中间件）或直接的中间件函数。
   * 无效中间件会被跳过并输出警告。
   *
   * @param app - Koa 应用实例
   * @param middlewares - 中间件数组
   * @param type - 类型标识（pre/post），用于警告信息
   */
  _loadMiddlewares(app: Koa, middlewares: unknown[] = [], type = 'pre'): void {
    if (isArray(middlewares)) {
      middlewares.forEach((middleware) => {
        if (isFunction(middleware)) {
          // middleware 是工厂函数，调用后返回 (ctx, next) => {} 形式的中间件
          app.use((middleware as () => Koa.Middleware)());
        } else {
          coreLogger.warn(`[ee-core/httpServer] Invalid ${type} middleware detected, skipping.`);
        }
      });
    }
  }
}
