'use strict';

const dayjs = require('dayjs');
const path = require('path');

/**
 * 默认配置
 * https://www.yuque.com/u34495/mivcfg/guk1x0
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   **/
  const config = {};

  /**
   * 应用模式配置
   */
  config.developmentMode = {
    default: 'vue',
    mode: {
      vue: {
        hostname: 'localhost',
        port: 8080
      },
      react: {
        hostname: 'localhost',
        port: 3000
      },
      html: {
        hostname: 'localhost',
        indexPage: 'index.html'
      },
    }
  };

  /**
   * 开发者工具
   */
  config.openDevTools = false;

  /**
   * 应用程序顶部菜单
   * boolean | string
   * true, false, 'dev-show'(dev环境显示，prod环境隐藏)
   */
  config.openAppMenu = 'dev-show';

  /**
   * 主窗口
   */
  config.windowsOption = {
    title: 'EE框架',
    width: 980,
    height: 650,
    minWidth: 800,
    minHeight: 650,
    webPreferences: {
      //webSecurity: false, // 跨域问题 -> 打开注释
      contextIsolation: false, // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
      nodeIntegration: true,
      //preload: path.join(appInfo.baseDir, 'preload', 'bridge.js'),
    },
    frame: true,
    show: true,
    icon: path.join(appInfo.home, 'public', 'images', 'logo-32.png'),
  };

  /**
   * ee框架日志
   */  
  config.logger = {
    appLogName: `ee-${dayjs().format('YYYY-MM-DD')}.log`, 
    errorLogName: `ee-error-${dayjs().format('YYYY-MM-DD')}.log` 
  }

  /**
   * 远程模式-web地址
   */    
  config.remoteUrl = {
    enable: false, // 是否启用
    url: 'https://discuz.chat/' // Any web url
  };

  /**
   * 内置socket服务
   */   
  config.socketServer = {
    enable: false, // 是否启用
    port: 7070, // 默认端口（如果端口被使用，则随机获取一个）
    path: "/socket.io/", // 默认路径名称
    connectTimeout: 45000, // 客户端连接超时时间
    pingTimeout: 30000, // 心跳检测超时时间
    pingInterval: 25000, // 心跳检测间隔
    maxHttpBufferSize: 1e8, // 每条消息的数据最大值 1M
    transports: ["polling", "websocket"], // http轮询和websocket
    cors: {
      origin: true, // http协议时，要设置允许跨域
    }
  };

  /**
   * 内置http服务
   */     
  config.httpServer = {
    enable: false, // 是否启用
    https: {
      enable: false, 
      key: '/public/ssl/localhost+1.key', // key文件
      cert: '/public/ssl/localhost+1.pem' // cert文件
    },
    port: 7071, // 默认端口（如果端口被使用，则随机获取一个）
    cors: {
      origin: "*" // 跨域
    },
    body: {
      multipart: true,
      formidable: {
        keepExtensions: true
      }
    },
    filterRequest: {
      uris:  [
        'favicon.ico'
      ],
      returnData: '' // 任何数据类型
    }
  };

  /**
   * 主进程
   */     
  config.mainServer = {
    host: '127.0.0.1',
    port: 7072, // 默认端口（如果端口被使用，则随机获取一个）
  }; 

  /**
   * 硬件加速
   */
  config.hardGpu = {
    enable: false
  };

  /**
   * 插件功能
   * window 官方内置插件
   * tray 托盘插件
   * security 安全插件
   * awaken 唤醒插件
   * autoUpdater 自动升级插件
   * javaServer java项目插件
   * example demo插件
   */
  config.addons = {
    // 多窗口
    window: {
      enable: true,
    },
    // 托盘
    tray: {
      enable: true,
      title: 'EE程序', // 托盘显示标题
      icon: '/public/images/tray_logo.png' // 托盘图标
    },
    // 安全
    security: {
      enable: true,
    },
    // 唤醒
    awaken: {
      enable: true,
      protocol: 'ee', // 自定义协议名（默认你的应用名称-英文）
      args: []
    },
    // 自动升级
    autoUpdater: {
      enable: true,
      windows: false, // windows平台
      macOS: false, // macOs 需要签名验证
      linux: false, // linux平台
      options: {
        provider: 'generic', // or github, s3, bintray
        url: 'http://kodo.qiniu.com/' // resource dir, end with '/'
      },
      force: false, // 强制更新（运行软件时，检查新版本并后台下载安装）
    },      
    // java服务
    javaServer: {
      enable: false,
      port: 18080,    // 默认端口（如果端口被使用，则随机获取一个）
      jreVersion: 'jre1.8.0_201', // 额外资源目录下 jre 文件夹名称
      opt: '-server -Xms512M -Xmx512M -Xss512k -Dspring.profiles.active=prod -Dserver.port=${port} -Dlogging.file.path="${path}" ',
      name: 'java-app.jar' // 额外资源目录下 jar 名称
    },
    example: {
      enable: true,
    },
  };

  return {
    ...config
  };
}
