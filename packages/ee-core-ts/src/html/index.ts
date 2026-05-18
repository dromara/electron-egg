import path from 'path';

export function getHtmlFilepath(name: string): string {
  return path.join(path.resolve(), 'node_modules', 'ee-core-ts', 'dist', 'esm', 'html', name);
}
