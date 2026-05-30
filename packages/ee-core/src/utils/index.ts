/**
 * @module utils
 * @description Utility module entry point. Uniformly exports all sub-module public APIs for
 * other framework modules and business code to reference via `import { xxx } from 'ee-core/utils'`.
 *
 * Export sources:
 * - extend: object deep merge
 * - is: Electron runtime environment detection (process type, OS, architecture)
 * - json: JSON file synchronous/asynchronous read/write
 * - pargv: command line argument parsing
 * - wrap: file path to property path conversion
 * - helper: common utility functions (debounce, sleep, version comparison, etc.)
 * - port: TCP port allocation
 * - ip: public IP query
 */
export * from './extend.js';
export * from './is.js';
export * from './json.js';
export * from './pargv.js';
export * from './wrap.js';
export * from './helper.js';
export * from './port/index.js';
export { publicIpv4, publicIpv6 } from './ip.js';

import os from 'os';
import path from 'path';
import fs from 'fs';
import { exec, execSync } from 'child_process';
import { createHash } from 'crypto';
import { getBaseDir } from '../ps/index.js';
import { readSync } from './json.js';
import * as is from './is.js';

const { platform } = process;

/** Windows registry binary paths (distinguishing 32-bit and 64-bit architectures) */
const win32RegBinPath: Record<string, string> = {
  /** Native architecture (64-bit Node on 64-bit system) */
  native: '%windir%\\System32',
  /** Mixed architecture (32-bit Node on 64-bit system, needs sysnative redirect) */
  mixed: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32',
};

/**
 * Commands to get machine unique identifiers per platform
 *
 * - macOS: reads IOPlatformUUID via ioreg
 * - Windows: reads MachineGuid from registry
 * - Linux: reads /var/lib/dbus/machine-id or /etc/machine-id
 * - FreeBSD: reads UUID via kenv or sysctl
 */
const MachineGuid: Record<string, string> = {
  darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
  win32: `${win32RegBinPath[_isWindowsProcessMixedOrNativeArchitecture()]}\\REG.exe ` +
    'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
    '/v MachineGuid',
  linux: '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
  freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid',
};

/**
 * Get package.json content from the project root directory
 *
 * Reads and parses the package.json file in the project root directory,
 * used to obtain application name, version number, and other metadata.
 *
 * @returns Parsed package.json object
 */
export function getPackage(): unknown {
  const json = readSync(path.join(getBaseDir(), 'package.json'));
  return json;
}

/**
 * Get the first valid MAC address
 *
 * Traverses local network interfaces, returns the first non-zero MAC address.
 * Zero MAC addresses (00:00:00:00:00:00) typically indicate virtual interfaces and are skipped.
 *
 * @param iface - Specify network interface name; if omitted, all interfaces are traversed
 * @returns First valid MAC address string
 * @throws Error - Throws when specified interface doesn't exist, has no valid MAC, or no valid MAC globally
 */
export function getMAC(iface?: string): string {
  const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;
  const list = os.networkInterfaces();
  if (iface) {
    // Search in the specified interface
    const parts = list[iface];
    if (!parts) {
      throw new Error(`interface ${iface} was not found`);
    }
    for (const part of parts) {
      if (zeroRegex.test(part.mac) === false) {
        return part.mac;
      }
    }
    throw new Error(`interface ${iface} had no valid mac addresses`);
  } else {
    // Traverse all interfaces to find the first valid MAC
    for (const [, parts] of Object.entries(list)) {
      if (!parts) continue;
      for (const part of parts) {
        if (zeroRegex.test(part.mac) === false) {
          return part.mac;
        }
      }
    }
  }
  throw new Error('failed to get the MAC address');
}

/**
 * Check if input is a valid MAC address format
 *
 * MAC address format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX,
 * each segment 1-2 hexadecimal characters.
 *
 * @param macAddress - String to check
 * @returns true if it matches MAC address format
 */
export function isMAC(macAddress: string): boolean {
  const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
  return macRegex.test(macAddress);
}

/**
 * Check if protocol is a file protocol
 *
 * @param protocol - Protocol string
 * @returns true if it is file:// protocol
 */
export function isFileProtocol(protocol: string): boolean {
  return protocol === 'file://';
}

/**
 * Check if protocol is a web protocol (http or https)
 *
 * @param protocol - Protocol string
 * @returns true if it is http:// or https:// protocol
 */
export function isWebProtocol(protocol: string): boolean {
  return ['http://', 'https://'].includes(protocol);
}

/**
 * Check if the project is a JavaScript project (not TypeScript)
 *
 * Determines by checking if the entry file main.js or index.js exists.
 * TypeScript projects use main.ts as the entry point.
 *
 * @param baseDir - Project root directory
 * @returns true if it is a JS project
 */
export function isJsProject(baseDir: string): boolean {
  const entryFile1 = path.join(baseDir, 'electron', 'main.js');
  const entryFile2 = path.join(baseDir, 'electron', 'index.js');
  return fs.existsSync(entryFile1) || fs.existsSync(entryFile2);
}

/**
 * Synchronously get machine unique identifier (hash value)
 *
 * Obtains machine identifier by executing platform-specific commands, returns SHA-256 hash by default.
 * Set original to true to return the raw value.
 *
 * @param original - Whether to return the original value instead of hash, default false
 * @returns Machine unique identifier string
 * @throws Error - Unsupported OS platform
 */
export function machineIdSync(original = false): string {
  const cmd = MachineGuid[platform];
  if (!cmd) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  const id = _expose(execSync(cmd).toString());
  return original ? id : _hash(id);
}

/**
 * Asynchronously get machine unique identifier (hash value)
 *
 * Obtains machine identifier by asynchronously executing platform-specific commands, returns SHA-256 hash by default.
 * Suitable for scenarios where blocking the event loop is undesirable.
 *
 * @param original - Whether to return the original value instead of hash, default false
 * @returns Promise of machine unique identifier string
 * @throws Error - Unsupported OS platform or command execution failure
 */
export function machineId(original = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = MachineGuid[platform];
    if (!cmd) {
      return reject(new Error(`Unsupported platform: ${platform}`));
    }
    exec(cmd, {}, (err: Error | null, stdout: string | Buffer) => {
      if (err) {
        return reject(new Error(`Error while obtaining machine id: ${err.stack}`));
      }
      const id = _expose(stdout.toString());
      return resolve(original ? id : _hash(id));
    });
  });
}

/**
 * Get platform identifier string
 *
 * Returns a combined identifier of current OS and architecture, used for build artifact naming and platform detection.
 *
 * @param delimiter - Separator, default '_'
 * @param isDiffArch - Whether to distinguish architecture bitness (only effective on Windows), default false
 * @returns Platform identifier (e.g. 'windows_64', 'macos_apple', 'linux')
 */
export function getPlatform(delimiter = '_', isDiffArch = false): string {
  if (process.platform === 'win32') {
    let os = 'windows';
    if (isDiffArch) {
      os += delimiter + (process.arch === 'x64' ? '64' : '32');
    }
    return os;
  }
  if (process.platform === 'darwin') {
    // macOS distinguishes Intel (x64) and Apple Silicon (arm64)
    const core = process.arch === 'arm64' ? 'apple' : 'intel';
    return 'macos' + delimiter + core;
  }
  return 'linux';
}

/**
 * Detect if Node.js process architecture is mixed mode on Windows
 *
 * Returns 'mixed' when running 32-bit Node.js on 64-bit Windows,
 * 'native' otherwise.
 * Used to determine the correct system path for registry access.
 *
 * @returns 'mixed' (32-bit Node on 64-bit Windows) or 'native'
 */
function _isWindowsProcessMixedOrNativeArchitecture(): string {
  if (process.platform !== 'win32') {
    return '';
  }
  // When 32-bit Node runs on 64-bit Windows, PROCESSOR_ARCHITEW6432 exists in environment variables
  if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
    return 'mixed';
  }
  return 'native';
}

/**
 * SHA-256 hash the machine identifier
 *
 * Hashes the original identifier before returning, to avoid exposing real machine information.
 *
 * @param guid - Original machine identifier string
 * @returns SHA-256 hashed hexadecimal string
 */
function _hash(guid: string): string {
  return createHash('sha256').update(guid).digest('hex');
}

/**
 * Extract machine identifier from command output
 *
 * Command output format varies by platform; this function is responsible for parsing and
 * extracting the pure identifier value.
 *
 * @param result - Command execution output string
 * @returns Cleaned machine identifier string
 * @throws Error - Unsupported platform
 */
function _expose(result: string): string {
  switch (platform) {
    case 'darwin': {
      // In ioreg output, IOPlatformUUID is followed by the UUID value
      const parts = result.split('IOPlatformUUID');
      const part = parts[1];
      if (!part) return '';
      const lines = part.split('\n');
      const line = lines[0];
      if (!line) return '';
      return line.replace(/\=|\s+|"/gi, '').toLowerCase();
    }
    case 'win32': {
      // In REG QUERY output, REG_SZ is followed by the value
      const parts = result.toString().split('REG_SZ');
      const part = parts[1];
      if (!part) return '';
      return part.replace(/\r+|\n+|\s+/gi, '').toLowerCase();
    }
    case 'linux':
      return result.toString().replace(/\r+|\n+|\s+/gi, '').toLowerCase();
    case 'freebsd':
      return result.toString().replace(/\r+|\n+|\s+/gi, '').toLowerCase();
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

/** Export all environment detection functions from the is module for external use */
export { is };
