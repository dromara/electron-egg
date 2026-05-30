/**
 * @module utils/ip
 * @description Public IP address query utility. Obtains the machine's public IPv4/IPv6 address
 * via DNS resolution or HTTPS requests.
 *
 * Supports three query methods:
 * - DNS query: resolves via OpenDNS special domain myip.opendns.com
 * - HTTPS query: obtains via third-party IP query services (icanhazip, ipify)
 * - Combined query (all): tries DNS first, falls back to HTTPS on failure
 *
 * All query methods return Promises with an attached cancel() method, allowing cancellation at any time.
 */
import dgram from 'dgram';
import { isIPv6, isIPv4 } from 'net';
import dnsSocket from 'dns-socket';
import { request as urllibRequest } from 'urllib';

/** Empty string constant, indicates query failure with no result */
const emptyIP = '';

/** Default query options */
const defaults = {
  /** Query timeout (ms) */
  timeout: 3000,
  /** Query method: 'http' uses HTTPS interface, 'dns' uses DNS resolution, 'all' tries DNS then HTTPS */
  type: 'http' as 'http' | 'dns' | 'all',
};

/** DNS server configuration structure */
interface DnsServerConfig {
  /** IPv4 DNS server configuration */
  v4: {
    /** DNS server address list */
    servers: string[];
    /** Query domain name */
    name: string;
    /** DNS record type */
    type: string;
  };
  /** IPv6 DNS server configuration */
  v6: {
    /** DNS server address list */
    servers: string[];
    /** Query domain name */
    name: string;
    /** DNS record type */
    type: string;
  };
}

/**
 * Pre-configured DNS server list
 *
 * Uses OpenDNS public DNS servers, obtains the machine's public IP by querying
 * the A/AAAA records of myip.opendns.com. OpenDNS returns the querier's IP
 * address as the response.
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

/** Query configuration per IP version */
interface IpTypeConfig {
  /** DNS server and query parameter list */
  dnsServers: { servers: string[]; question: { name: string; type: string } }[];
  /** HTTPS IP query service URL list */
  httpsUrls: string[];
}

/**
 * Query configuration organized by protocol version
 *
 * IPv4 and IPv6 each use different DNS record types (A/AAAA)
 * and different HTTPS query endpoints.
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

/** IP query options */
interface IpOptions {
  /** Query timeout (ms) */
  timeout?: number;
  /** Query method */
  type?: 'http' | 'dns' | 'all';
  /** Fallback HTTPS URL list, used when default URLs all fail */
  fallbackUrls?: string[];
}

/**
 * Query public IP via DNS
 *
 * Sends a special domain query to OpenDNS servers; OpenDNS returns the querier's
 * IP address as the DNS response. Tries servers in the list sequentially until success.
 *
 * @param version - IP version, 'v4' or 'v6'
 * @param options - Query options
 * @returns Promise of IP address string, with cancel() method to cancel the query
 */
function queryDns(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  const data = ipType[version]!;
  const socket = dnsSocket({
    retries: 0,
    maxQueries: 1,
    // IPv6 uses udp6 Socket, IPv4 uses udp4 Socket
    socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
    timeout: options.timeout,
  });

  const promise = (async (): Promise<string> => {
    for (const dnsServerInfo of data.dnsServers) {
      const { servers, question } = dnsServerInfo;
      for (const server of servers) {
        // If socket has been cancelled, return empty immediately
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
          // Validate the returned IP format
          const method = version === 'v6' ? isIPv6 : isIPv4;

          if (ip && method(ip)) {
            socket.destroy();
            return ip;
          }
        } catch {
          // Single server query failure does not affect subsequent attempts
        }
      }
    }

    socket.destroy();
    return emptyIP;
  })() as Promise<string> & { cancel?: () => void };

  // Provide cancel method, allowing external cancellation of ongoing DNS queries
  promise.cancel = () => {
    socket.destroy();
  };

  return promise;
}

/**
 * Query public IP via HTTPS interface
 *
 * Sends HTTP GET requests to third-party IP query services; the response body is the public IP address.
 * Tries URLs in the list sequentially until success.
 *
 * @param version - IP version, 'v4' or 'v6'
 * @param options - Query options
 * @returns Promise of IP address string, with cancel() method
 */
function queryHttps(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  let cancelFn: (() => void) | undefined;

  const promise = (async (): Promise<string> => {
    const requestOptions = {
      method: 'GET',
      timeout: options.timeout,
      dataType: 'text' as const,
    };

    // Combine default URLs with user-provided fallback URLs
    const urls = [
      ...ipType[version]!.httpsUrls,
      ...(options.fallbackUrls ?? []),
    ];

    for (const url of urls) {
      try {
        const response = await urllibRequest(url, requestOptions);
        const result = response.res.status === 200 ? response.data.toString() : '';
        const ip = result.trim();

        // Validate the returned IP format
        const method = version === 'v6' ? isIPv6 : isIPv4;

        if (ip && method(ip)) {
          return ip;
        }
      } catch {
        // Single URL request failure does not affect subsequent attempts
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
 * Combined query for public IP (DNS first, then HTTPS)
 *
 * Tries DNS query first; when DNS fails, automatically falls back to HTTPS query,
 * ensuring the public IP can still be obtained in restricted network environments.
 *
 * @param version - IP version, 'v4' or 'v6'
 * @param options - Query options
 * @returns Promise of IP address string, with cancel() method
 */
function queryAll(version: 'v4' | 'v6', options: Required<IpOptions>): Promise<string> & { cancel?: () => void } {
  let cancelFn: (() => void) | undefined;

  const promise = (async (): Promise<string> => {
    let response: string;
    // Try DNS query first
    const dnsPromise = queryDns(version, options);
    cancelFn = dnsPromise.cancel ?? (() => {});
    try {
      response = await dnsPromise;
    } catch {
      // DNS query failed, fall back to HTTPS
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
 * Query public IPv4 address
 *
 * @param options - Query options (type, timeout, fallbackUrls)
 * @returns Promise of IPv4 address string, with cancel() method to cancel the query
 *
 * @example
 * ```ts
 * const p = publicIpv4({ type: 'http', timeout: 5000 });
 * const ip = await p;
 * // Or cancel the query
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

  // type === 'all': DNS first, then HTTPS
  return queryAll('v4', merged);
}

/**
 * Query public IPv6 address
 *
 * @param options - Query options (type, timeout, fallbackUrls)
 * @returns Promise of IPv6 address string, with cancel() method to cancel the query
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
