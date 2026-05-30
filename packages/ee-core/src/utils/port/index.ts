import net from 'net';
import os from 'os';

class Locked extends Error {
  constructor(port: number) {
    super(`${port} is locked`);
  }
}

const lockedPorts = {
  old: new Set<number>(),
  young: new Set<number>(),
};

// On this interval, the old locked ports are discarded,
// the young locked ports are moved to old locked ports,
// and a new young set for locked ports are created.
const releaseOldLockedPortsIntervalMs = 1000 * 15;

// Lazily create interval on first use
let interval: NodeJS.Timeout | undefined;

const getLocalHosts = (): Set<string | undefined> => {
  const interfaces = os.networkInterfaces();
  // Add undefined value for createServer function to use default host,
  // and default IPv4 host in case createServer defaults to IPv6.
  const results = new Set<string | undefined>([undefined, '0.0.0.0']);

  for (const _interface of Object.values(interfaces)) {
    if (!_interface) continue;
    for (const config of _interface) {
      results.add(config.address);
    }
  }

  return results;
};

const checkAvailablePort = (options: net.ListenOptions): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);

    server.listen(options, () => {
      const address = server.address();
      const port = typeof address === 'string' ? 0 : address?.port || 0;
      server.close(() => {
        resolve(port);
      });
    });
  });

const getAvailablePort = async (options: net.ListenOptions, hosts: Set<string | undefined>): Promise<number> => {
  if (options.host || options.port === 0) {
    return checkAvailablePort(options);
  }

  for (const host of hosts) {
    try {
      await checkAvailablePort({ port: options.port, host });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (!['EADDRNOTAVAIL', 'EINVAL'].includes(err.code || '')) {
        throw error;
      }
    }
  }

  return options.port || 0;
};

function* portCheckSequence(ports?: number[]): Generator<number> {
  if (ports) {
    for (const port of ports) {
      yield port;
    }
  }

  yield 0;
}

export interface GetPortOptions {
  port?: number | number[];
  host?: string;
}

export async function getPort(options?: GetPortOptions): Promise<number> {
  let ports: number[] | undefined;

  if (options) {
    ports = typeof options.port === 'number' ? [options.port] : options.port;
  }

  if (interval === undefined) {
    interval = setInterval(() => {
      lockedPorts.old = lockedPorts.young;
      lockedPorts.young = new Set();
    }, releaseOldLockedPortsIntervalMs);

    // Does not exist in some environments (Electron, Jest jsdom env, browser, etc).
    if (interval.unref) {
      interval.unref();
    }
  }

  const hosts = getLocalHosts();

  for (const port of portCheckSequence(ports)) {
    try {
      let availablePort = await getAvailablePort({ ...options, port }, hosts);
      while (lockedPorts.old.has(availablePort) || lockedPorts.young.has(availablePort)) {
        if (port !== 0) {
          throw new Locked(port);
        }

        availablePort = await getAvailablePort({ ...options, port: 0 }, hosts);
      }

      lockedPorts.young.add(availablePort);
      return availablePort;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (!['EADDRINUSE', 'EACCES'].includes(err.code || '') && !(error instanceof Locked)) {
        throw error;
      }
    }
  }

  throw new Error('No available ports found');
}

/**
 * Clear the port lock interval and release all locked ports.
 * Call this when shutting down to ensure clean resource cleanup.
 */
export function releasePortLocks(): void {
  if (interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
  lockedPorts.old.clear();
  lockedPorts.young.clear();
}
