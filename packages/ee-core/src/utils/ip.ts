/**
 * @module utils/ip
 * @description 公网 IP 地址查询工具。通过 DNS 解析或 HTTPS 请求获取本机的公网 IPv4/IPv6 地址。
 *
 * 支持三种查询方式：
 * - DNS 查询：通过 OpenDNS 的特殊域名 myip.opendns.com 解析获取
 * - HTTPS 查询：通过第三方 IP 查询服务（icanhazip、ipify）获取
 * - 组合查询（all）：先尝试 DNS，失败后回退到 HTTPS
 *
 * 所有查询方法返回的 Promise 都附带 cancel() 方法，可随时取消查询。
 */
import dgram from 'dgram';
import { isIPv6, isIPv4 } from 'net';
import dnsSocket from 'dns-socket';
import { request as urllibRequest } from 'urllib';

/** 空字符串常量，表示查询失败无结果 */
const emptyIP = '';

/** 默认查询选项 */
const defaults = {
  /** 查询超时时间（毫秒） */
  timeout: 3000,
  /** 查询方式：'http' 使用 HTTPS 接口，'dns' 使用 DNS 解析，'all' 先 DNS 后 HTTPS */
  type: 'http' as 'http' | 'dns' | 'all',
};

/** DNS 服务器配置结构 */
interface DnsServerConfig {
  /** IPv4 DNS 服务器配置 */
  v4: {
    /** DNS 服务器地址列表 */
    servers: string[];
    /** 查询域名 */
    name: string;
    /** DNS 记录类型 */
    type: string;
  };
  /** IPv6 DNS 服务器配置 */
  v6: {
    /** DNS 服务器地址列表 */
    servers: string[];
    /** 查询域名 */
    name: string;
    /** DNS 记录类型 */
    type: string;
  };
}

/**
 * 预配置的 DNS 服务器列表
 *
 * 使用 OpenDNS 的公共 DNS 服务器，通过查询 myip.opendns.com 的 A/AAAA 记录
 * 获取本机公网 IP。OpenDNS 会将查询者的 IP 地址作为响应返回。
 */
const dnsServers: DnsServerConfig[] = [
  {
    v4: {
      servers: [
        '208.67.222.222',
        '208.67.220.220',
        '208.67.222.220',
        '208.67.220.222',
      ],
      name: 'myip.opendns.com',
      type: 'A',
    },
    v6: {
      servers: [
        '2620:0:ccc::2',
        '2620:0:ccd::2',
      ],
      name: 'myip.opendns.com',
      type: 'AAAA',
    },
  },
];

/** IP 版本对应的查询配置 */
interface IpTypeConfig {
  /** DNS 服务器和查询参数列表 */
  dnsServers: { servers: string[]; question: { name: string; type: string } }[];
  /** HTTPS IP 查询服务 URL 列表 */
  httpsUrls: string[];
}

/**
 * 按协议版本组织的查询配置
 *
 * IPv4 和 IPv6 各自使用不同的 DNS 记录类型（A/AAAA）
 * 和不同的 HTTPS 查询端点。
 */
const ipType: Record<string, IpTypeConfig> = {
  v4: {
    dnsServers: dnsServers.map(({ v4: { servers, ...question } }) => ({
      servers,
      question,
    })),
    httpsUrls: [
      'https://icanhazip.com/',
      'https://api.ipify.org/',
    ],
  },
  v6: {
    dnsServers: dnsServers.map(({ v6: { servers, ...question } }) => ({
      servers,
      question,
    })),
    httpsUrls: [
      'https://icanhazip.com/',
      'https://api6.ipify.org/',
    ],
  },
};

/** IP 查询选项 */
interface IpOptions {
  /** 查询超时时间（毫秒） */
  timeout?: number;
  /** 查询方式 */
  type?: 'http' | 'dns' | 'all';
  /** 备用 HTTPS URL 列表，在默认 URL 都失败时使用 */
  fallbackUrls?: string[];
}

/**
 * 通过 DNS 查询公网 IP
 *
 * 向 OpenDNS 服务器发送特殊域名查询，OpenDNS 会将查询者的 IP 地址
 * 作为 DNS 响应返回。逐个尝试服务器列表直到成功。
 *
 * @param version - IP 版本，'v4' 或 'v6'
 * @param options - 查询选项
 * @returns IP 地址字符串的 Promise，附带 cancel() 方法可取消查询
 */
function queryDns(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  const data = ipType[version]!;
  const socket = dnsSocket({
    retries: 0,
    maxQueries: 1,
    // IPv6 使用 udp6 Socket，IPv4 使用 udp4 Socket
    socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
    timeout: options.timeout,
  });

  const promise = (async (): Promise<string> => {
    for (const dnsServerInfo of data.dnsServers) {
      const { servers, question } = dnsServerInfo;
      for (const server of servers) {
        // Socket 已被取消则直接返回空
        if (socket.destroyed) {
          return emptyIP;
        }

        try {
          const { name, type } = question;
          const dnsResponse = await socket.query({ questions: [{ name, type }] }, 53, server);

          const answer = dnsResponse.answers[0];
          if (!answer) continue;

          const response = (typeof answer.data === 'string' ? answer.data : answer.data.toString()).trim();
          const ip = response;
          // 验证返回的 IP 格式是否合法
          const method = version === 'v6' ? isIPv6 : isIPv4;

          if (ip && method(ip)) {
            socket.destroy();
            return ip;
          }
        } catch {
          // 单个服务器查询失败不影响后续尝试
        }
      }
    }

    socket.destroy();
    return emptyIP;
  })() as Promise<string> & { cancel?: () => void };

  // 提供 cancel 方法，允许外部取消正在进行的 DNS 查询
  promise.cancel = () => {
    socket.destroy();
  };

  return promise;
}

/**
 * 通过 HTTPS 接口查询公网 IP
 *
 * 向第三方 IP 查询服务发送 HTTP GET 请求，响应体即为公网 IP 地址。
 * 逐个尝试 URL 列表直到成功。
 *
 * @param version - IP 版本，'v4' 或 'v6'
 * @param options - 查询选项
 * @returns IP 地址字符串的 Promise，附带 cancel() 方法
 */
function queryHttps(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  let cancelFn: (() => void) | undefined;

  const promise = (async (): Promise<string> => {
    const requestOptions = {
      method: 'GET',
      timeout: options.timeout,
      dataType: 'text' as const,
    };

    // 合并默认 URL 和用户提供的备用 URL
    const urls = [
      ...ipType[version]!.httpsUrls,
      ...(options.fallbackUrls ?? []),
    ];

    for (const url of urls) {
      try {
        const response = await urllibRequest(url, requestOptions);
        const result = response.res.status === 200 ? response.data.toString() : '';
        const ip = result.trim();

        // 验证返回的 IP 格式是否合法
        const method = version === 'v6' ? isIPv6 : isIPv4;

        if (ip && method(ip)) {
          return ip;
        }
      } catch {
        // 单个 URL 请求失败不影响后续尝试
      }
    }

    return emptyIP;
  })() as Promise<string> & { cancel?: () => void };

  promise.cancel = function () {
    return cancelFn?.apply(this);
  };

  return promise;
}

/**
 * 组合查询公网 IP（先 DNS 后 HTTPS）
 *
 * 优先尝试 DNS 查询，DNS 失败时自动回退到 HTTPS 查询，
 * 确保在网络环境受限时仍能获取公网 IP。
 *
 * @param version - IP 版本，'v4' 或 'v6'
 * @param options - 查询选项
 * @returns IP 地址字符串的 Promise，附带 cancel() 方法
 */
function queryAll(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  let cancelFn: (() => void) | undefined;

  const promise = (async (): Promise<string> => {
    let response: string;
    // 先尝试 DNS 查询
    const dnsPromise = queryDns(version, options);
    cancelFn = dnsPromise.cancel ?? (() => {});
    try {
      response = await dnsPromise;
    } catch {
      // DNS 查询失败，回退到 HTTPS
      const httpsPromise = queryHttps(version, options);
      cancelFn = httpsPromise.cancel ?? (() => {});
      response = await httpsPromise;
    }

    return response;
  })() as Promise<string> & { cancel?: () => void };

  promise.cancel = () => {
    cancelFn?.();
  };

  return promise;
}

/**
 * 查询公网 IPv4 地址
 *
 * @param options - 查询选项（type、timeout、fallbackUrls）
 * @returns IPv4 地址字符串的 Promise，附带 cancel() 方法可取消查询
 *
 * @example
 * ```ts
 * const p = publicIpv4({ type: 'http', timeout: 5000 });
 * const ip = await p;
 * // 或取消查询
 * p.cancel();
 * ```
 */
export function publicIpv4(options?: IpOptions): Promise<string> & { cancel?: () => void } {
  const merged = {
    ...defaults,
    ...options,
  } as Required<IpOptions>;

  if (merged.type === 'http') {
    return queryHttps('v4', merged);
  }

  if (merged.type === 'dns') {
    return queryDns('v4', merged);
  }

  // type === 'all'：先 DNS 后 HTTPS
  return queryAll('v4', merged);
}

/**
 * 查询公网 IPv6 地址
 *
 * @param options - 查询选项（type、timeout、fallbackUrls）
 * @returns IPv6 地址字符串的 Promise，附带 cancel() 方法可取消查询
 *
 * @example
 * ```ts
 * const ip = await publicIpv6({ type: 'dns' });
 * ```
 */
export function publicIpv6(options?: IpOptions): Promise<string> & { cancel?: () => void } {
  const merged = {
    ...defaults,
    ...options,
  } as Required<IpOptions>;

  if (merged.type === 'http') {
    return queryHttps('v6', merged);
  }

  if (merged.type === 'dns') {
    return queryDns('v6', merged);
  }

  return queryAll('v6', merged);
}
