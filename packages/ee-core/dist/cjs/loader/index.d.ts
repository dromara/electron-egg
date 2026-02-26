declare function loadFile(filepath: string, ...inject: any[]): any;
declare function requireFile(filepath: string): any;
declare function execFile(filepath: string, ...inject: any[]): any;
declare function resolveModule(filepath: string): string | undefined;
declare function getFullpath(filepath: string): string;
export { loadFile, execFile, requireFile, resolveModule, getFullpath, };
