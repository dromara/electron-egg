"use strict";

const os = require("os");
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { createHash } = require('crypto');
const { getBaseDir } = require('../ps');
const { readSync } = require('./json');
const is = require('./is');

// machine id
const { platform } = process;
const win32RegBinPath = {
  native: '%windir%\\System32',
  mixed: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
};
const MachineGuid = {
  darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
  win32: `${win32RegBinPath[_isWindowsProcessMixedOrNativeArchitecture()]}\\REG.exe ` +
      'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
      '/v MachineGuid',
  linux: '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
  freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid'
};

// 获取项目根目录package.json
function getPackage() {
  const json = readSync(path.join(getBaseDir(), 'package.json'));
  
  return json;
};

// Get the first proper MAC address
// iface: If provided, restrict MAC address fetching to this interface
function getMAC(iface) {
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
  }
  else {
      for (const [key, parts] of Object.entries(list)) {
          // for some reason beyond me, this is needed to satisfy typescript
          // fix https://github.com/bevry/getmac/issues/100
          if (!parts)
              continue;
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
function isMAC(macAddress) {
  const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
  return macRegex.test(macAddress);
}

function isFileProtocol(protocol) {
  return protocol == 'file://';
}

function isWebProtocol(protocol) {
  return ['http://', 'https://'].includes(protocol);
}

function isJsProject(baseDir) {
  const entryFile1 = path.join(baseDir, 'electron/main.js');
  const entryFile2 = path.join(baseDir, 'electron/index.js');
  if (fs.existsSync(entryFile1) || fs.existsSync(entryFile2)) {
    return true;
  }
  return false;
}

// get machine id
function machineIdSync(original) {
  let id = _expose(execSync(MachineGuid[platform]).toString());
  return original ? id : _hash(id);
}

// get machine id (promise)
// original <Boolean>, If true return original value of machine id, otherwise return hashed value (sha-256), default: false
function machineId(original) {
  return new Promise((resolve, reject) => {
    return exec(MachineGuid[platform], {}, (err, stdout, stderr) => {
      if (err) {
        return reject(
            new Error(`Error while obtaining machine id: ${err.stack}`)
        );
      }
      let id = _expose(stdout.toString());
      return resolve(original ? id : _hash(id));
    });
  });
}

// get platform 
// values:  windows | windows_32 | windows_64 | macos_intel | macos_apple | linux
function getPlatform(delimiter = "_", isDiffArch = false) {
  let osName = "";
  if (is.windows()) {
    osName = "windows";
    if (isDiffArch) {
      const arch = is.x64() ? "64" : "32";
      osName += delimiter + arch;
    }
  } else if (is.macOS()) {
    let isAppleSilicon = false;
    const cpus = os.cpus();
    for (let cpu of cpus) {
      if (cpu.model.includes('Apple')) {
        isAppleSilicon = true;
        break;
      }
    }
    const core = isAppleSilicon? "apple" : "intel";
    osName = "macos" + delimiter + core;
  } else if (is.linux()) {
    osName = "linux";
  }

  return osName;
}



function _isWindowsProcessMixedOrNativeArchitecture() {
  // detect if the node binary is the same arch as the Windows OS.
  // or if this is 32 bit node on 64 bit windows.
  if(process.platform !== 'win32') {
    return '';
  }
  if( process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432') ) {
    return 'mixed';
  }
  return 'native';
}

function _hash(guid) {
  return createHash('sha256').update(guid).digest('hex');
}

function _expose(result) {
  switch (platform) {
    case 'darwin':
      return result
        .split('IOPlatformUUID')[1]
        .split('\n')[0].replace(/\=|\s+|\"/ig, '')
        .toLowerCase();
    case 'win32':
      return result
        .toString()
        .split('REG_SZ')[1]
        .replace(/\r+|\n+|\s+/ig, '')
        .toLowerCase();
    case 'linux':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/ig, '')
        .toLowerCase();
    case 'freebsd':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/ig, '')
        .toLowerCase();
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

module.exports = {
  getPackage,
  getMAC,
  isMAC,
  isFileProtocol,
  isWebProtocol,
  isJsProject,
  machineIdSync,
  machineId,
  getPlatform,
  is
}

