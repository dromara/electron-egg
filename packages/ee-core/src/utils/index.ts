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

// machine id
const win32RegBinPath: Record<string, string> = {
  native: '%windir%\\System32',
  mixed: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32',
};

const MachineGuid: Record<string, string> = {
  darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
  win32: `${win32RegBinPath[_isWindowsProcessMixedOrNativeArchitecture()]}\\REG.exe ` +
    'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
    '/v MachineGuid',
  linux: '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
  freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid',
};

// 获取项目根目录package.json
export function getPackage(): unknown {
  const json = readSync(path.join(getBaseDir(), 'package.json'));
  return json;
}

// Get the first proper MAC address
// iface: If provided, restrict MAC address fetching to this interface
export function getMAC(iface?: string): string {
  const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;
  const list = os.networkInterfaces();
  if (iface) {
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

// Check if the input is a valid MAC address
export function isMAC(macAddress: string): boolean {
  const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
  return macRegex.test(macAddress);
}

export function isFileProtocol(protocol: string): boolean {
  return protocol === 'file://';
}

export function isWebProtocol(protocol: string): boolean {
  return ['http://', 'https://'].includes(protocol);
}

export function isJsProject(baseDir: string): boolean {
  const entryFile1 = path.join(baseDir, 'electron', 'main.js');
  const entryFile2 = path.join(baseDir, 'electron', 'index.js');
  return fs.existsSync(entryFile1) || fs.existsSync(entryFile2);
}

// get machine id
export function machineIdSync(original = false): string {
  const cmd = MachineGuid[platform];
  if (!cmd) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  const id = _expose(execSync(cmd).toString());
  return original ? id : _hash(id);
}

// get machine id (promise)
// original <Boolean>, If true return original value of machine id, otherwise return hashed value (sha-256), default: false
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

// get platform
// values:  windows | windows_32 | windows_64 | macos_intel | macos_apple | linux
export function getPlatform(delimiter = '_', isDiffArch = false): string {
  if (process.platform === 'win32') {
    let os = 'windows';
    if (isDiffArch) {
      os += delimiter + (process.arch === 'x64' ? '64' : '32');
    }
    return os;
  }
  if (process.platform === 'darwin') {
    const core = process.arch === 'arm64' ? 'apple' : 'intel';
    return 'macos' + delimiter + core;
  }
  return 'linux';
}

function _isWindowsProcessMixedOrNativeArchitecture(): string {
  // detect if the node binary is the same arch as the Windows OS.
  // or if this is 32 bit node on 64 bit windows.
  if (process.platform !== 'win32') {
    return '';
  }
  if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
    return 'mixed';
  }
  return 'native';
}

function _hash(guid: string): string {
  return createHash('sha256').update(guid).digest('hex');
}

function _expose(result: string): string {
  switch (platform) {
    case 'darwin': {
      const parts = result.split('IOPlatformUUID');
      const part = parts[1];
      if (!part) return '';
      const lines = part.split('\n');
      const line = lines[0];
      if (!line) return '';
      return line.replace(/\=|\s+|"/gi, '').toLowerCase();
    }
    case 'win32': {
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

export { is };
