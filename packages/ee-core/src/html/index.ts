import path from 'path';

function getCurrentDir(): string {
  // In CJS, __dirname is available
  // In ESM, fallback to current working directory
  // Note: This is a best-effort approach for dual module support
  return typeof __dirname !== 'undefined' ? __dirname : path.resolve();
}

export function getHtmlFilepath(name: string): string {
  return path.join(getCurrentDir(), name);
}
