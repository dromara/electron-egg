/**
 * @module utils/port
 * @description Port allocation utility. Provides getPort() function to find available TCP ports
 * within a specified range, with a locking mechanism to prevent concurrent port conflicts
 * within the same process.
 *
 * Port allocation strategy:
 * 1. Create a temporary TCP server listening on the target port to verify availability
 * 2. Check if the port is in the locked set (prevents concurrent allocation of the same port)
 * 3. If the port is unavailable or locked, automatically increment the port number and retry
 * 4. Port 0 means let the OS automatically assign a random available port
 *
 * Locking mechanism:
 * - Uses old and young Sets to maintain allocated ports
 * - Rotates every 15 seconds: young -> old, old is cleared and released
 * - Two-level locking ensures ports are not re-allocated shortly after being assigned
 * - Call releasePortLocks() to manually clear all locks
 */
import net from 'net';
import os from 'os';

/**
 * Port locked error
 *
 * Thrown when the specified port is locked (in use).
 */
class Locked extends Error {
  constructor(port: number) {
    super(`${port} is locked`);
  }
}

/** Locked port sets, split into old and young levels */
const lockedPorts = {
  /** Previously locked ports, about to be released */
  old: new Set<number>(),
  /** Currently locked ports */
  young: new Set<number>(),
};

/**
 * Port lock rotation interval (ms)
 *
 * Every this interval, the old set is discarded (ports released),
 * the young set moves into old, and a new young set is created.
 * Two-level rotation ensures ports are locked for at least 15 seconds.
 */
const releaseOldLockedPortsIntervalMs = 1000 * 15;

/** Rotation timer reference, lazily created to avoid resource usage when idle */
let interval: NodeJS.Timeout | undefined;

/**
 * Get all local network interface addresses
 *
 * Collects IP addresses of all network interfaces, and adds undefined (represents using default host)
 * and '0.0.0.0' (represents listening on all IPv4 interfaces).
 * When host is not specified, port availability needs to be verified on all interfaces.
 *
 * @returns Set of host addresses
 */
const getLocalHosts = (): Set<string | undefined> => {
  const interfaces = os.networkInterfaces();
  // undefined lets createServer use default host;
  // '0.0.0.0' is IPv4 wildcard address, prevents createServer defaulting to IPv6
  const results = new Set<string | undefined>([undefined, '0.0.0.0']);

  for (const _interface of Object.values(interfaces)) {
    if (!_interface) continue;
    for (const config of _interface) {
      results.add(config.address);
    }
  }

  return results;
};

/**
 * Check if a single port is available on the specified host
 *
 * Creates a temporary TCP server to attempt listening; if successful, the port is available;
 * if failed, the port is occupied. Uses server.unref() to ensure the temporary server
 * doesn't prevent process exit.
 *
 * @param options - net.ListenOptions, containing port and host
 * @returns Available port number
 */
const checkAvailablePort = (options: net.ListenOptions): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    // Don't prevent process exit
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

/**
 * Verify port availability across multiple hosts
 *
 * When host is not specified, port availability must be verified on each local network interface
 * individually, ensuring the port is not occupied on any interface.
 * EADDRNOTAVAIL and EINVAL errors indicate the interface doesn't support this port and can be skipped.
 *
 * @param options - Listen options
 * @param hosts - Host address set
 * @returns Available port number
 */
const getAvailablePort = async (options: net.ListenOptions, hosts: Set<string | undefined>): Promise<number> => {
  // When host is specified or port is 0 (OS auto-assign), only need to check once
  if (options.host || options.port === 0) {
    return checkAvailablePort(options);
  }

  // When host is not specified, verify on all interfaces individually
  for (const host of hosts) {
    try {
      await checkAvailablePort({ port: options.port, host });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      // Address unavailable or invalid: this interface doesn't support this port, skip and continue checking
      if (!['EADDRNOTAVAIL', 'EINVAL'].includes(err.code || '')) {
        throw error;
      }
    }
  }

  return options.port || 0;
};

/**
 * Generate port check sequence
 *
 * Tries user-specified port list in order; if all are unavailable, falls back to port 0
 * (OS auto-assigns a random available port).
 *
 * @param ports - User-specified port list
 * @yields Port number to check
 */
function* portCheckSequence(ports?: number[]): Generator<number> {
  if (ports) {
    for (const port of ports) {
      yield port;
    }
  }

  // When all specified ports are unavailable, fall back to OS auto-assign
  yield 0;
}

/** getPort function options */
export interface GetPortOptions {
  /**
   * Preferred port number or port range array.
   * - Number: try specified port, increment if unavailable
   * - Array: try in order, OS auto-assigns if all unavailable
   * - Unspecified: OS auto-assigns a random available port
   */
  port?: number | number[];
  /** Bound host address; if unspecified, checks all interfaces */
  host?: string;
}

/**
 * Get an available TCP port
 *
 * Finds an available port within the specified range, with a two-level locking mechanism
 * to prevent concurrent allocation conflicts.
 * Search flow:
 * 1. Try binding one by one according to the port check sequence
 * 2. Check if the port is in the locked set (old or young)
 * 3. On lock conflict: if a specific port was requested, throw Locked; otherwise auto-get a new port
 * 4. After finding an available port, add it to the young locked set and return
 *
 * @param options - Port search options
 * @returns Available port number
 * @throws Error - Throws when all ports are unavailable
 *
 * @example
 * ```ts
 * // Get a system auto-assigned random port
 * const port = await getPort();
 *
 * // Try a specific port, auto-find next if unavailable
 * const port = await getPort({ port: 3000 });
 *
 * // Try multiple candidate ports
 * const port = await getPort({ port: [3000, 3001, 3002] });
 * ```
 */
export async function getPort(options?: GetPortOptions): Promise<number> {
  let ports: number[] | undefined;

  if (options) {
    ports = typeof options.port === 'number' ? [options.port] : options.port;
  }

  // Lazily create rotation timer, initialize on first call
  if (interval === undefined) {
    interval = setInterval(() => {
      // Rotate locked sets: young -> old, old is cleared and released
      lockedPorts.old = lockedPorts.young;
      lockedPorts.young = new Set();
    }, releaseOldLockedPortsIntervalMs);

    // unref ensures the timer doesn't prevent process exit (Electron/Jest environments may not have unref)
    if (interval.unref) {
      interval.unref();
    }
  }

  const hosts = getLocalHosts();

  for (const port of portCheckSequence(ports)) {
    try {
      let availablePort = await getAvailablePort({ ...options, port }, hosts);
      // Check if port is in locked set, preventing concurrent allocation of the same port
      while (lockedPorts.old.has(availablePort) || lockedPorts.young.has(availablePort)) {
        // Specified port number is locked -> throw exception to let caller know
        if (port !== 0) {
          throw new Locked(port);
        }

        // OS auto-assigned port is locked -> request a new one
        availablePort = await getAvailablePort({ ...options, port: 0 }, hosts);
      }

      // Found available port, add to young locked set
      lockedPorts.young.add(availablePort);
      return availablePort;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      // EADDRINUSE (port occupied) and EACCES (insufficient permissions) are expected errors, try next port
      if (!['EADDRINUSE', 'EACCES'].includes(err.code || '') && !(error instanceof Locked)) {
        throw error;
      }
    }
  }

  throw new Error('No available ports found');
}

/**
 * Clean up port lock resources
 *
 * Clears the rotation timer and releases all locked ports.
 * Call during application shutdown to ensure resources are cleaned up, preventing timer leaks.
 */
export function releasePortLocks(): void {
  if (interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
  lockedPorts.old.clear();
  lockedPorts.young.clear();
}
