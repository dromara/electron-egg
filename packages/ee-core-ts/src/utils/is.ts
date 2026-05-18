export function renderer(): boolean {
  return process.type === 'renderer';
}

export function main(): boolean {
  return process.type === 'browser';
}

export function osx(): boolean {
  return process.platform === 'darwin';
}

export function macOS(): boolean {
  return osx();
}

export function windows(): boolean {
  return process.platform === 'win32';
}

export function linux(): boolean {
  return process.platform === 'linux';
}

export function x86(): boolean {
  return process.arch === 'ia32';
}

export function x64(): boolean {
  return process.arch === 'x64';
}

export function sandbox(): boolean {
  return 'APP_SANDBOX_CONTAINER_ID' in process.env;
}

export function mas(): boolean {
  return process.mas === true;
}

export function windowsStore(): boolean {
  return process.windowsStore === true;
}

export function all(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (!fn()) return false;
  }
  return true;
}

export function none(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return false;
  }
  return true;
}
