import dgram from 'dgram';
import { isIPv6, isIPv4 } from 'net';
import dnsSocket from 'dns-socket';
import { request as urllibRequest } from 'urllib';

const emptyIP = '';

const defaults = {
  timeout: 3000,
  type: 'http' as 'http' | 'dns' | 'all',
};

interface DnsServerConfig {
  v4: {
    servers: string[];
    name: string;
    type: string;
  };
  v6: {
    servers: string[];
    name: string;
    type: string;
  };
}

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

interface IpTypeConfig {
  dnsServers: { servers: string[]; question: { name: string; type: string } }[];
  httpsUrls: string[];
}

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

interface IpOptions {
  timeout?: number;
  type?: 'http' | 'dns' | 'all';
  fallbackUrls?: string[];
}

function queryDns(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  const data = ipType[version]!;
  const socket = dnsSocket({
    retries: 0,
    maxQueries: 1,
    socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
    timeout: options.timeout,
  });

  const promise = (async (): Promise<string> => {
    for (const dnsServerInfo of data.dnsServers) {
      const { servers, question } = dnsServerInfo;
      for (const server of servers) {
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
          const method = version === 'v6' ? isIPv6 : isIPv4;

          if (ip && method(ip)) {
            socket.destroy();
            return ip;
          }
        } catch {
          // ignore
        }
      }
    }

    socket.destroy();
    return emptyIP;
  })() as Promise<string> & { cancel?: () => void };

  promise.cancel = () => {
    socket.destroy();
  };

  return promise;
}

function queryHttps(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  let cancelFn: (() => void) | undefined;

  const promise = (async (): Promise<string> => {
    const requestOptions = {
      method: 'GET',
      timeout: options.timeout,
      dataType: 'text' as const,
    };

    const urls = [
      ...ipType[version]!.httpsUrls,
      ...(options.fallbackUrls ?? []),
    ];

    for (const url of urls) {
      try {
        const response = await urllibRequest(url, requestOptions);
        const result = response.res.status === 200 ? response.data.toString() : '';
        const ip = result.trim();

        const method = version === 'v6' ? isIPv6 : isIPv4;

        if (ip && method(ip)) {
          return ip;
        }
      } catch {
        // ignore
      }
    }

    return emptyIP;
  })() as Promise<string> & { cancel?: () => void };

  promise.cancel = function () {
    return cancelFn?.apply(this);
  };

  return promise;
}

function queryAll(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  let cancelFn: (() => void) | undefined;

  const promise = (async (): Promise<string> => {
    let response: string;
    const dnsPromise = queryDns(version, options);
    cancelFn = dnsPromise.cancel ?? (() => {});
    try {
      response = await dnsPromise;
    } catch {
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

// 查询 public ipv4
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

  return queryAll('v4', merged);
}

// 查询 public ipv6
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
