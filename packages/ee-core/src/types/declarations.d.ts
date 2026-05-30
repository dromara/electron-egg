/**
 * @module types/declarations
 * @description 第三方模块的类型声明补丁。为没有自带 TypeScript 类型定义的
 * npm 包提供手写声明，使框架代码在严格类型检查下能正常编译。
 *
 * 包含的模块：
 * - urllib：HTTP 请求库，提供 request/curl 方法
 * - dns-socket：DNS 查询库，用于获取公网 IP
 * - bytenode：V8 字节码编译器，用于代码加密
 * - config-file-ts：TypeScript 配置文件读取
 * - javascript-obfuscator：JavaScript 代码混淆工具
 * - koa2-cors：Koa CORS 中间件
 * - koa-body：Koa 请求体解析中间件
 */

/** HTTP 请求库 urllib，提供 request 和 curl 两个快捷方法 */
declare module 'urllib' {
  /**
   * 发起 HTTP 请求
   * @param url - 请求 URL
   * @param options - 请求选项（method、headers、timeout 等）
   * @returns 响应数据及状态信息
   */
  export function request(url: string, options?: Record<string, unknown>): Promise<{ data: Buffer; res: { status: number; headers: Record<string, string> } }>;
  /**
   * cURL 风格的快捷请求方法，功能同 request
   * @param url - 请求 URL
   * @param options - 请求选项
   * @returns 响应数据及状态信息
   */
  export function curl(url: string, options?: Record<string, unknown>): Promise<{ data: Buffer; res: { status: number; headers: Record<string, string> } }>;
}

/** DNS 查询库，基于 dgram 实现 DNS 协议通信，用于通过 DNS 解析获取公网 IP */
declare module 'dns-socket' {
  import type { Socket } from 'dgram';

  /** DNS Socket 创建选项 */
  interface DnsSocketOptions {
    /** 查询重试次数 */
    retries?: number;
    /** 最大并发查询数 */
    maxQueries?: number;
    /** 底层 dgram Socket 实例 */
    socket: Socket;
    /** 单次查询超时时间（毫秒） */
    timeout?: number;
  }

  /** DNS 查询问题条目 */
  interface DnsQuestion {
    /** 查询域名（如 'myip.opendns.com'） */
    name: string;
    /** DNS 记录类型（如 'A'、'AAAA'） */
    type: string;
  }

  /** DNS 查询回答条目 */
  interface DnsAnswer {
    /** 回答数据，可以是 IP 地址字符串或二进制数据 */
    data: string | Buffer;
  }

  /** DNS 查询响应 */
  interface DnsResponse {
    /** 回答条目列表 */
    answers: DnsAnswer[];
  }

  /** DNS Socket 实例，提供 DNS 查询和资源销毁方法 */
  class DnsSocket {
    /** 是否已销毁 */
    destroyed: boolean;
    /**
     * 发起 DNS 查询
     * @param query - 查询参数（包含 questions 数组）
     * @param port - DNS 服务器端口（通常为 53）
     * @param server - DNS 服务器地址
     * @returns DNS 响应
     */
    query(query: { questions: DnsQuestion[] }, port: number, server: string): Promise<DnsResponse>;
    /** 销毁 Socket 释放资源 */
    destroy(): void;
  }

  /**
   * 创建 DNS Socket 实例
   * @param options - Socket 配置选项
   * @returns DnsSocket 实例
   */
  function createDnsSocket(options: DnsSocketOptions): DnsSocket;
  export = createDnsSocket;
}

/** V8 字节码编译器，将 JavaScript 编译为 .jsc 字节码文件，用于代码加密保护 */
declare module 'bytenode' {
  // bytenode 的具体 API 按需使用，此处仅声明模块存在
}

/** TypeScript 配置文件读取工具，支持直接加载 .ts 格式的配置文件 */
declare module 'config-file-ts' {
  /**
   * 读取 TypeScript 配置文件并返回解析后的对象
   * @param filepath - .ts 配置文件路径
   * @returns 解析后的配置对象
   */
  export function readConfigTS<T = unknown>(filepath: string): T;
}

/** JavaScript 代码混淆工具，用于生产环境的代码保护，增加逆向难度 */
declare module 'javascript-obfuscator' {
  /**
   * 对 JavaScript 源码进行混淆处理
   * @param sourceCode - 原始 JavaScript 源码
   * @param options - 混淆选项（压缩、编码、控制流平坦化等）
   * @returns 包含 getObfuscatedCode() 方法的对象，用于获取混淆后的代码
   */
  export function obfuscate(sourceCode: string, options?: Record<string, unknown>): { getObfuscatedCode(): string };
}

/** Koa CORS 中间件，处理跨域请求的 Access-Control-* 响应头 */
declare module 'koa2-cors' {
  import type { Middleware } from 'koa';
  /**
   * 创建 CORS 中间件
   * @param options - CORS 配置选项（origin、methods、headers 等）
   * @returns Koa 中间件函数
   */
  function cors(options?: Record<string, unknown>): Middleware;
  export = cors;
}

/** Koa 请求体解析中间件，支持 JSON、form、multipart 等格式 */
declare module 'koa-body' {
  import type { Middleware } from 'koa';
  /**
   * 创建请求体解析中间件
   * @param options - 解析选项（multipart、formidable 等）
   * @returns Koa 中间件函数
   */
  function koaBody(options?: Record<string, unknown>): Middleware;
  export = koaBody;
}
