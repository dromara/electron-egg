/**
 * @module config/default_config
 * @description 框架内置默认配置。所有配置项在此定义默认值，业务配置可覆盖。
 * 配置项按功能分组：窗口、日志、通信服务、主服务器、异常处理、任务、跨进程。
 */
import path from 'path';
import { isDev, getBaseDir, getLogDir } from '../ps/index.js';
import { SocketIO } from '../const/channel.js';
import type { Config } from '../types/index.js';

/**
 * 生成框架默认配置
 *
 * @returns 完整的默认配置对象
 */
export default function defaultConfig(): Config {
  return {
    /** 是否打开开发者工具（仅开发环境有效） */
    openDevTools: false,
    /** 是否启用单实例锁（防止同时运行多个应用实例） */
    singleLock: true,

    /** 主窗口配置 */
    windowsOption: {
      title: 'electron-egg',
      width: 980,
      height: 650,
      minWidth: 400,
      minHeight: 300,
      webPreferences: {
        // 安全警告：contextIsolation=false + nodeIntegration=true 允许渲染进程
        // 完全访问 Node.js API。渲染进程中的任何 XSS 漏洞都可能导致远程代码执行。
        // 新项目建议设置 contextIsolation=true 并使用 preload 脚本。
        contextIsolation: false,
        nodeIntegration: true,
      },
      /** 是否显示原生窗口边框 */
      frame: true,
      /** 创建时是否立即显示窗口（false 可先加载内容再显示，避免白屏） */
      show: false,
      /** 应用图标路径 */
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },

    /** 日志配置 */
    logger: {
      /** 日志文件存储目录 */
      dir: getLogDir(),
      /** 日志级别：trace < debug < info < warn < error < fatal */
      level: 'info',
      /** 开发环境是否使用 pretty 格式输出 */
      prettyPrint: isDev(),
      /** 日志文件名日期格式 */
      dateFormat: 'yyyy-MM-dd',
      /** 应用日志文件名 */
      appLogName: 'ee.log',
      /** 框架核心日志文件名 */
      coreLogName: 'ee-core.log',
      /** 错误日志文件名 */
      errorLogName: 'ee-error.log',
      /** 日志轮转策略：day（按天）、hour（按小时） */
      rotator: 'day',
      /** 需要脱敏的字段路径列表 */
      redact: [],
      /** 脱敏替换值 */
      redactCensor: '[Redacted]',
      /** 是否包含时间戳 */
      timestamp: true,
      /** pino logger 名称 */
      name: 'ee',
      /** 单个日志文件最大大小 */
      maxSize: '10m',
      /** pino 序列化器 */
      serializers: {},
      /** 自定义日志级别 */
      customLevels: {},
      /** 对象序列化深度限制 */
      depthLimit: 5,
      /** 安全模式：日志写入失败时不抛异常 */
      safe: true,
      /** 是否启用日志 */
      enabled: true,
    },

    /** SocketIO 服务器配置 */
    socketServer: {
      enable: false,
      /** 默认端口（端口被占用时自动随机选择） */
      port: 7070,
      /** SocketIO 路径 */
      path: "/socket.io/",
      /** 客户端连接超时时间（毫秒） */
      connectTimeout: 45000,
      /** 心跳检测超时时间（毫秒） */
      pingTimeout: 30000,
      /** 心跳检测间隔（毫秒） */
      pingInterval: 25000,
      /** 每条消息最大数据大小（100MB） */
      maxHttpBufferSize: 1e8,
      /** 传输方式：polling（HTTP 轮询）和 websocket */
      transports: ["polling", "websocket"],
      cors: {
        /** 跨域来源设置 */
        origin: true,
      },
      /** SocketIO 通信频道 */
      channel: SocketIO.partySoftware,
    },

    /** HTTP 服务器配置 */
    httpServer: {
      enable: false,
      /** HTTPS 配置 */
      https: {
        enable: false,
        /** SSL 私钥路径 */
        key: '/public/ssl/localhost+1.key',
        /** SSL 证书路径 */
        cert: '/public/ssl/localhost+1.pem',
      },
      /** 协议前缀 */
      protocol: 'http://',
      /** 监听地址 */
      host: '127.0.0.1',
      /** 默认端口（端口被占用时自动随机选择） */
      port: 7071,
      cors: {
        origin: '*',
      },
      /** 请求体解析配置（基于 koa-body） */
      body: {
        /** 是否支持 multipart/form-data（文件上传） */
        multipart: true,
        formidable: {
          /** 是否保留上传文件的扩展名 */
          keepExtensions: true,
        },
      },
      /** 请求过滤规则：匹配的 URI 直接返回指定数据，不经过控制器 */
      filterRequest: {
        uris: ['favicon.ico'],
        returnData: '',
      },
    },

    /** 远程服务配置 */
    remote: {
      enable: false,
      /** 远程服务地址 */
      url: '',
    },

    /** 主服务器配置（控制渲染进程加载方式） */
    mainServer: {
      /** 协议：file:// 加载本地文件，http:// 加载远程服务 */
      protocol: 'file://',
      /** 首页文件路径 */
      indexPath: '/public/dist/index.html',
      /** BrowserWindow.loadURL 的额外选项 */
      options: {},
      /** 跨进程接管标识：非空时由 Cross 模块提供 URL */
      takeover: '',
      /** 加载页面路径：窗口创建后先显示此页面，主页面加载完成后切换 */
      loadingPage: '',
      /** IPC 通道分隔符，用于拼接控制器路径 */
      channelSeparator: '/',
    },

    /** 异常处理配置 */
    exception: {
      /** 主进程异常是否退出 */
      mainExit: false,
      /** 子进程异常是否退出 */
      childExit: false,
      /** 渲染进程异常是否退出 */
      rendererExit: true,
    },

    /** 后台任务配置 */
    jobs: {
      /** 是否记录任务消息日志 */
      messageLog: false,
    },

    /** 跨进程通信配置（动态添加） */
    cross: {},
  };
}
