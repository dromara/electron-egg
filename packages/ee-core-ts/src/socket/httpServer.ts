import debug from 'debug';
import assert from 'assert';
import is from 'is-type-of';
import Koa from 'koa';
import cors from 'koa2-cors';
import koaBody from 'koa-body';
import https from 'https';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { coreLogger } from '../log/index.js';
import { getBaseDir } from '../ps/index.js';
import { getController } from '../controller/index.js';
import { getConfig } from '../config/index.js';
import { getPort } from '../utils/port/index.js';

const log = debug('ee-core:socket:httpServer');

export class HttpServer {
  config: Record<string, unknown>;
  httpApp: Koa | undefined;
  channelSeparator: string;

  constructor() {
    const { httpServer, mainServer } = getConfig() as {
      httpServer: Record<string, unknown>;
      mainServer: { channelSeparator: string };
    };
    this.config = httpServer;
    this.channelSeparator = mainServer.channelSeparator;
    this.httpApp = undefined;
    this.init();
  }

  async init(): Promise<void> {
    if (this.config.enable === false) {
      return;
    }

    const port = await getPort({ port: parseInt(this.config.port as string) });
    if (!port) {
      throw new Error('[ee-core] [socket/HttpServer] http port required, and must be a number !');
    }
    process.env.EE_HTTP_PORT = String(port);
    this.config.port = port;
    this._create();
  }

  _create(): void {
    const config = this.config;
    const koaConfig = (config.koaConfig as Record<string, unknown>) || {};
    const preMiddleware = (koaConfig.preMiddleware as unknown[]) || [];
    const postMiddleware = (koaConfig.postMiddleware as unknown[]) || [];
    const errorHandler = koaConfig.errorHandler as ((err: Error) => void) | null;
    const isHttps = (config.https as Record<string, unknown> | undefined)?.enable === true;
    const sslOptions: { key?: Buffer; cert?: Buffer } = {};

    if (isHttps) {
      config.protocol = 'https://';
      const httpsConfig = config.https as { key: string; cert: string };
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

    this._setupErrorHandler(koaApp, errorHandler);
    this._loadMiddlewares(koaApp, preMiddleware, 'pre');

    koaApp.use(cors(corsOptions as Parameters<typeof cors>[0]));
    koaApp.use(koaBody(config.body as Parameters<typeof koaBody>[0]));
    koaApp.use(this._dispatch.bind(this));

    this._loadMiddlewares(koaApp, postMiddleware, 'post');

    let msg = '[ee-core] [socket/http] server is: ' + url;
    const listenOpt = { host: config.host as string, port: config.port as number };
    if (isHttps) {
      https.createServer(sslOptions, koaApp.callback()).listen(listenOpt, (err?: Error) => {
        msg = err ? err.message : msg;
        coreLogger.info(msg);
      });
    } else {
      koaApp.listen(listenOpt, (e?: Error) => {
        msg = e ? e.message : msg;
        coreLogger.info(msg);
      });
    }

    this.httpApp = koaApp;
  }

  async _dispatch(ctx: Koa.Context, next: Koa.Next): Promise<void> {
    const controller = getController();
    const { filterRequest } = getConfig().httpServer as {
      filterRequest: { uris: string[]; returnData: string };
    };
    let uriPath = ctx.request.path;
    const method = ctx.request.method;
    let params = ctx.request.query;
    params = is.object(params) ? JSON.parse(JSON.stringify(params)) : {};
    const body = ctx.request.body;

    ctx.response.status = 200;

    try {
      if (uriPath.indexOf('/') === 0) {
        uriPath = uriPath.substring(1);
      }
      if (_.includes(filterRequest.uris, uriPath)) {
        ctx.response.body = filterRequest.returnData;
        await next();
        return;
      }
      if (uriPath.slice(0, 10) !== 'controller') {
        uriPath = 'controller/' + uriPath;
      }
      const cmd = uriPath.split('/').join(this.channelSeparator);
      log('[request] uri %s', cmd);
      const args = method === 'POST' ? body : params;
      let fn: ((...args: unknown[]) => unknown) | null = null;
      if (is.string(cmd)) {
        const actions = cmd.split(this.channelSeparator);
        log('[findFn] channel %o', actions);
        let obj: Record<string, unknown> = { controller };
        actions.forEach((key) => {
          obj = obj[key] as Record<string, unknown>;
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj as unknown as (...args: unknown[]) => unknown;
      }
      if (!fn) throw new Error('function not exists');

      const result = await fn.call(controller, args, ctx);
      ctx.response.body = result;
    } catch (err) {
      coreLogger.error('[ee-core/httpServer] throw error:', err);
    }

    await next();
  }

  getHttpApp(): Koa | undefined {
    return this.httpApp;
  }

  _setupErrorHandler(app: Koa, errorHandler: ((err: Error) => void) | null): void {
    if (is.function_(errorHandler)) {
      app.on('error', errorHandler);
    }
  }

  _loadMiddlewares(app: Koa, middlewares: unknown[] = [], type = 'pre'): void {
    if (is.array(middlewares)) {
      middlewares.forEach((middleware) => {
        if (is.function_(middleware)) {
          app.use((middleware as () => Koa.Middleware)());
        } else {
          coreLogger.warn(`[ee-core/httpServer] Invalid ${type} middleware detected, skipping.`);
        }
      });
    }
  }
}
