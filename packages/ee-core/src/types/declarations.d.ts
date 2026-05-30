
declare module 'urllib' {
  export function request(url: string, options?: Record<string, unknown>): Promise<{ data: Buffer; res: { status: number; headers: Record<string, string> } }>;
  export function curl(url: string, options?: Record<string, unknown>): Promise<{ data: Buffer; res: { status: number; headers: Record<string, string> } }>;
}

declare module 'dns-socket' {
  import type { Socket } from 'dgram';

  interface DnsSocketOptions {
    retries?: number;
    maxQueries?: number;
    socket: Socket;
    timeout?: number;
  }

  interface DnsQuestion {
    name: string;
    type: string;
  }

  interface DnsAnswer {
    data: string | Buffer;
  }

  interface DnsResponse {
    answers: DnsAnswer[];
  }

  class DnsSocket {
    destroyed: boolean;
    query(query: { questions: DnsQuestion[] }, port: number, server: string): Promise<DnsResponse>;
    destroy(): void;
  }

  function createDnsSocket(options: DnsSocketOptions): DnsSocket;
  export = createDnsSocket;
}

declare module 'bytenode' {
  // bytenode has minimal exports
}

declare module 'config-file-ts' {
  export function readConfigTS<T = unknown>(filepath: string): T;
}

declare module 'javascript-obfuscator' {
  export function obfuscate(sourceCode: string, options?: Record<string, unknown>): { getObfuscatedCode(): string };
}

declare module 'koa2-cors' {
  import type { Middleware } from 'koa';
  function cors(options?: Record<string, unknown>): Middleware;
  export = cors;
}

declare module 'koa-body' {
  import type { Middleware } from 'koa';
  function koaBody(options?: Record<string, unknown>): Middleware;
  export = koaBody;
}

