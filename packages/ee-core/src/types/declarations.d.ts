
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

declare module 'koa' {
  import * as events from 'events';
  import * as http from 'http';

  interface ContextDelegatedRequest {
    query: Record<string, unknown>;
    body?: unknown;
    path: string;
    method: string;
  }

  interface ContextDelegatedResponse {
    status: number;
    body: unknown;
  }

  interface Request extends ContextDelegatedRequest {
    query: Record<string, unknown>;
    body: unknown;
    path: string;
    method: string;
  }

  interface Response extends ContextDelegatedResponse {
    status: number;
    body: unknown;
  }

  interface Context extends ContextDelegatedRequest, ContextDelegatedResponse {
    request: Request;
    response: Response;
  }

  type Next = () => Promise<unknown>;
  type Middleware = (ctx: Context, next: Next) => Promise<unknown> | unknown;

  class Application extends events.EventEmitter {
    use(fn: Middleware): this;
    listen(port?: number, hostname?: string, backlog?: number, callback?: () => void): http.Server;
    listen(port?: number, hostname?: string, callback?: () => void): http.Server;
    listen(port?: number, callback?: () => void): http.Server;
    listen(callback?: () => void): http.Server;
    listen(options: { host?: string; port?: number }, callback?: () => void): http.Server;
    callback(): (req: http.IncomingMessage, res: http.ServerResponse) => void;
  }

  export = Application;
  export { Context, Next, Middleware, Request, Response };
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

