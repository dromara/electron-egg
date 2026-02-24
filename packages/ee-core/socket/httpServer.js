'use strict';

const debug = require('debug')('ee-core:socket:httpServer');
const assert = require('assert');
const is = require('is-type-of');
const Koa = require('koa');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const https = require('https');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { coreLogger } = require('../log');
const { getBaseDir } = require('../ps');
const { getController } = require('../controller');
const { getConfig } = require('../config');
const { getPort } = require('../utils/port');

let channelSeparator = '/';

/**
 * http server
 */
class HttpServer {
  constructor () {
    const { httpServer, mainServer } = getConfig();
    this.config = httpServer;
    channelSeparator = mainServer.channelSeparator;
    this.httpApp = undefined;
    this.init();
  }

  async init() {
    if (this.config.enable == false) {
      return;
    }

    const port = await getPort({port: parseInt(this.config.port)});
    if (!port) {
      throw new Error('[ee-core] [socket/HttpServer] http port required, and must be a number !');
    }
    process.env.EE_HTTP_PORT = port;
    this.config.port = port;

    this._create();
  }

  /**
   * 创建服务
   */
  _create () {
    const config = this.config;
    // config.default 增加koaConfig配置项
    const koaConfig = config.koaConfig || {};
    const { preMiddleware = [], postMiddleware = [], errorHandler = null } = koaConfig;
    const isHttps = config?.https?.enable ?? false;
    const sslOptions = {};

    if (isHttps === true) {
      config.protocol = 'https://';
      const keyFile = path.join(getBaseDir(), config.https.key);
      const certFile = path.join(getBaseDir(), config.https.cert);
      assert(fs.existsSync(keyFile), 'ssl key file is required');
      assert(fs.existsSync(certFile), 'ssl cert file is required');

      sslOptions.key = fs.readFileSync(keyFile);
      sslOptions.cert = fs.readFileSync(certFile);
    }
    const url = config.protocol + config.host + ':' + config.port;
    const corsOptions = config.cors;

    const koaApp = new Koa();

    // 设置错误处理器，便于统一错误代码处理
    this._setupErrorHandler(koaApp, errorHandler);

    // 加载前置中间件
    this._loadMiddlewares(koaApp, preMiddleware);

    // 核心中间件
    koaApp
      .use(cors(corsOptions))
      .use(koaBody(config.body))
      .use(this._dispatch);

    // 加载后置中间件
    this._loadMiddlewares(koaApp, postMiddleware, 'post');

    let msg = '[ee-core] [socket/http] server is: ' + url;
    const listenOpt = {
      host: config.host,
      port: config.port
    }
    if (isHttps) {
      https.createServer(sslOptions, koaApp.callback()).listen(listenOpt, (err) => {
        msg = err ? err : msg;
        coreLogger.info(msg);
      });
    } else {
      koaApp.listen(listenOpt, (e) => {
        msg = e ? e : msg;
        coreLogger.info(msg);
      });
    }

    this.httpApp = koaApp;
  }

  /**
   * 路由分发
   */
  async _dispatch (ctx, next) {
    const controller = getController();
    const { filterRequest } = getConfig().httpServer;
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = is.object(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    // 默认
    ctx.response.status = 200;

    try {
      // 找函数
      // 去除开头的 '/'
      if (uriPath.indexOf('/') == 0) {
        uriPath = uriPath.substring(1);
      }
      // 过滤
      if (_.includes(filterRequest.uris, uriPath)) {
        ctx.response.body = filterRequest.returnData;
        await next();
        return
      }
      if (uriPath.slice(0, 10) != 'controller') {
        uriPath = 'controller/' + uriPath;
      }
      const cmd = uriPath.split('/').join(channelSeparator);
      debug('[request] uri %s', cmd);
      const args = (method == 'POST') ? body: params;
      let fn = null;
      if (is.string(cmd)) {
        const actions = cmd.split(channelSeparator);
        debug('[findFn] channel %o', actions);
        let obj = { controller };
        actions.forEach(key => {
          obj = obj[key];
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj;
      }
      if (!fn) throw new Error('function not exists');

      const result = await fn.call(controller, args, ctx);
      ctx.response.body = result;
    } catch (err) {
      coreLogger.error('[ee-core/httpServer] throw error:', err);
    }

    await next();
  }

  getHttpApp() {
    return this.httpApp;
  }

  // 设置错误处理函数
  _setupErrorHandler(app, errorHandler) {
    if (is.function(errorHandler)) {
      app.on('error', errorHandler)
    }
  }

  /**
   * 加载前置、后置中间件
   * @param {*} app koaApp示例
   * @param {*} middlewares 中间件数组
   * @param {*} type 类型，pre/post
   */
  _loadMiddlewares(app, middlewares = [], type = 'pre') {
    if (is.array(middlewares)) {
      middlewares.forEach((middleware) => {
        if (is.function(middleware)) {
          // middleware是一个方法
          // 返回值是中间件(ctx, next) => {}的异步函数
          // 便于使用async/await进行同步编程
          app.use(middleware());
        } else {
          coreLogger.warn(`[ee-core/httpServer] Invalid ${type} middleware detected, skipping.`);
        }
      })
    }
  }
}

module.exports = {
  HttpServer
};
