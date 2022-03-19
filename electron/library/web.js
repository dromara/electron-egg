'use strict';

const path = require('path');
const Socket = require('ee-core').Socket;
const Koa = Socket.Koa;
const koaStatic = require('koa-static');
const koaRouter = require('koa-router');

/**
 * todo 浏览器访问
 */

module.exports = {
  
  /**
   * 安装
   */  
  install (eeApp) {
    eeApp.logger.info('[preload] load web module');

    const staticDir = path.join(eeApp.config.homeDir, 'public', 'dist');
    const koaApp = new Koa();	
    koaApp.use(koaStatic(staticDir));
    const port = 7071;
    let url = 'http://127.0.0.1:' + port;

    // 路由
    const router = new koaRouter();
    router.all('/', async (ctx) => {
        ctx.type = 'json';
        ctx.body = '<h1>hello world!</h1>';
    })
    koaApp.use(router.routes());
    koaApp.listen(port, () => {
      // 服务创建成功
      eeApp.logger.info("web server:", url );
    });

  }

}
