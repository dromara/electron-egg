export * from './extend.js';
export * from './is.js';
export * from './json.js';
export * from './pargv.js';
export * from './wrap.js';
export * from './helper.js';
export * from './port/index.js';

import os from 'os';
import path from 'path';
import fs from 'fs';
import { exec, execSync } from 'child_process';
import { createHash } from 'crypto';
import { getBaseDir } from '../ps/index.js';
import { readSync } from './json.js';
import * as is from './is.js';

const { platform } = process;
const win32RegBinPath = {
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

export function getPackage(): unknown {
  const json = readSync(path.join(getBaseDir(), 'package.json'));
  return json;
}

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

export function machineIdSync(original = false): string {
  const id = _expose(execSync(MachineGuid[platform]).toString());
  return original ? id : _hash(id);
}

export function machineId(original = false): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(MachineGuid[platform], {}, (err, stdout) => {
      if (err) {
        return reject(new Error(`Error while obtaining machine id: ${err.stack}`));
      }
      const id = _expose(stdout.toString());
      return resolve(original ? id : _hash(id));
    });
  });
}

export function getPlatform(delimiter = '_', isDiffArch = false): string {
  let osName = '';
  if (is.windows()) {
    osName = 'windows';
    if (isDiffArch) {
      const arch = is.x64() ? '64' : '32';
      osName += delimiter + arch;
    }
  } else if (is.macOS()) {
    let isAppleSilicon = false;
    const cpus = os.cpus();
    for (const cpu of cpus) {
      if (cpu.model.includes('Apple')) {
        isAppleSilicon = true;
        break;
      }
    }
    const core = isAppleSilicon ? 'apple' : 'intel';
    osName = 'macos' + delimiter + core;
  } else if (is.linux()) {
    osName = 'linux';
  }

  return osName;
}

function _isWindowsProcessMixedOrNativeArchitecture(): string {
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
    case 'darwin':
      return result
        .split('IOPlatformUUID')[1]
        .split('\n')[0]
        .replace(/\=|\s+|"/gi, '')
        .toLowerCase();
    case 'win32':
      return result
        .toString()
        .split('REG_SZ')[1]
        .replace(/\r+|\n+|\s+/gi, '')
        .toLowerCase();
    case 'linux':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/gi, '')
        .toLowerCase();
    case 'freebsd':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/gi, '')
        .toLowerCase();
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

export { is };
