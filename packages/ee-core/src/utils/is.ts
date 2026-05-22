// Checks if we are in renderer process
export function renderer(): boolean {
  return process.type === 'renderer';
}

// Checks if we are in main process
export function main(): boolean {
  return process.type === 'browser';
}

// Checks if we are under Mac OS
export function osx(): boolean {
  return process.platform === 'darwin';
}

// Checks if we are under Mac OS
export function macOS(): boolean {
  return osx();
}

// Checks if we are under Windows OS
export function windows(): boolean {
  return process.platform === 'win32';
}

// Checks if we are under Linux OS
export function linux(): boolean {
  return process.platform === 'linux';
}

// Checks if we are the processor's arch is x86
export function x86(): boolean {
  return process.arch === 'ia32';
}

// Checks if we are the processor's arch is x64
export function x64(): boolean {
  return process.arch === 'x64';
}

// Checks if the app is running in a sandbox on macOS
export function sandbox(): boolean {
  return 'APP_SANDBOX_CONTAINER_ID' in process.env;
}

// Checks if the app is running as a Mac App Store build
export function mas(): boolean {
  return process.mas === true;
}

// Checks if the app is running as a Windows Store (appx) build
export function windowsStore(): boolean {
  return process.windowsStore === true;
}

// checks if all the 'is functions' passed as arguments are true
export function all(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (!fn()) return false;
  }
  return true;
}

// checks if all the 'is functions' passed as arguments are false
export function none(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return false;
  }
  return true;
}

// returns true if one of the 'is functions' passed as argument is true
export function one(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return true;
  }
  return false;
}
