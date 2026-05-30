/**
 * @module types/declarations
 * @description Type declaration patches for third-party modules. Provides handwritten declarations
 * for npm packages without built-in TypeScript type definitions, enabling framework code to
 * compile under strict type checking.
 *
 * Included modules:
 * - urllib: HTTP request library, provides request/curl methods
 * - dns-socket: DNS query library, used to obtain public IP
 * - bytenode: V8 bytecode compiler, used for code encryption
 * - config-file-ts: TypeScript configuration file reader
 * - javascript-obfuscator: JavaScript code obfuscation tool
 * - koa2-cors: Koa CORS middleware
 * - koa-body: Koa request body parsing middleware
 */

/** HTTP request library urllib, provides request and curl shortcut methods */
declare module 'urllib' {
  /**
   * Make an HTTP request
   * @param url - Request URL
   * @param options - Request options (method, headers, timeout, etc.)
   * @returns Response data and status info
   */
  export function request(url: string, options?: Record<string, unknown>): Promise<{ data: Buffer; res: { status: number; headers: Record<string, string> } }>;
  /**
   * cURL-style shortcut request method, same functionality as request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response data and status info
   */
  export function curl(url: string, options?: Record<string, unknown>): Promise<{ data: Buffer; res: { status: number; headers: Record<string, string> } }>;
}

/** DNS query library, implements DNS protocol communication based on dgram, used to obtain public IP via DNS resolution */
declare module 'dns-socket' {
  import type { Socket } from 'dgram';

  /** DNS Socket creation options */
  interface DnsSocketOptions {
    /** Query retry count */
    retries?: number;
    /** Maximum concurrent queries */
    maxQueries?: number;
    /** Underlying dgram Socket instance */
    socket: Socket;
    /** Single query timeout (ms) */
    timeout?: number;
  }

  /** DNS query question entry */
  interface DnsQuestion {
    /** Query domain name (e.g. 'myip.opendns.com') */
    name: string;
    /** DNS record type (e.g. 'A', 'AAAA') */
    type: string;
  }

  /** DNS query answer entry */
  interface DnsAnswer {
    /** Answer data, can be an IP address string or binary data */
    data: string | Buffer;
  }

  /** DNS query response */
  interface DnsResponse {
    /** List of answer entries */
    answers: DnsAnswer[];
  }

  /** DNS Socket instance, provides DNS query and resource destruction methods */
  class DnsSocket {
    /** Whether destroyed */
    destroyed: boolean;
    /**
     * Make a DNS query
     * @param query - Query parameters (containing questions array)
     * @param port - DNS server port (usually 53)
     * @param server - DNS server address
     * @returns DNS response
     */
    query(query: { questions: DnsQuestion[] }, port: number, server: string): Promise<DnsResponse>;
    /** Destroy the Socket to release resources */
    destroy(): void;
  }

  /**
   * Create a DNS Socket instance
   * @param options - Socket configuration options
   * @returns DnsSocket instance
   */
  function createDnsSocket(options: DnsSocketOptions): DnsSocket;
  export = createDnsSocket;
}

/** V8 bytecode compiler, compiles JavaScript to .jsc bytecode files for code encryption protection */
declare module 'bytenode' {
  // bytenode specific APIs are used as needed, here only declaring the module exists
}

/** TypeScript configuration file reader, supports directly loading .ts format configuration files */
declare module 'config-file-ts' {
  /**
   * Read a TypeScript configuration file and return the parsed object
   * @param filepath - .ts configuration file path
   * @returns Parsed configuration object
   */
  export function readConfigTS<T = unknown>(filepath: string): T;
}

/** JavaScript code obfuscation tool, used for production code protection, increasing reverse engineering difficulty */
declare module 'javascript-obfuscator' {
  /**
   * Obfuscate JavaScript source code
   * @param sourceCode - Original JavaScript source code
   * @param options - Obfuscation options (compression, encoding, control flow flattening, etc.)
   * @returns Object with getObfuscatedCode() method, used to get the obfuscated code
   */
  export function obfuscate(sourceCode: string, options?: Record<string, unknown>): { getObfuscatedCode(): string };
}

/** Koa CORS middleware, handles Access-Control-* response headers for cross-origin requests */
declare module 'koa2-cors' {
  import type { Middleware } from 'koa';
  /**
   * Create CORS middleware
   * @param options - CORS configuration options (origin, methods, headers, etc.)
   * @returns Koa middleware function
   */
  function cors(options?: Record<string, unknown>): Middleware;
  export = cors;
}

/** Koa request body parsing middleware, supports JSON, form, multipart and other formats */
declare module 'koa-body' {
  import type { Middleware } from 'koa';
  /**
   * Create request body parsing middleware
   * @param options - Parsing options (multipart, formidable, etc.)
   * @returns Koa middleware function
   */
  function koaBody(options?: Record<string, unknown>): Middleware;
  export = koaBody;
}
