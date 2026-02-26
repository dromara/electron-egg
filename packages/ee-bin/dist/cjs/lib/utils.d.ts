declare function loadConfig(binFile?: string): unknown;
declare function loadFile(filepath: string): any;
/**
 * get electron program
 */
declare function getElectronProgram(): string;
/**
 * 版本号比较
 */
declare function compareVersion(v1: string, v2: string): number;
declare function isWindows(): boolean;
declare function isOSX(): boolean;
declare function isMacOS(): boolean;
declare function isLinux(): boolean;
declare function isx86(): boolean;
declare function isx64(): boolean;
/**
 * Delete a file or folder
 */
declare function rm(name: string): void;
/**
 * 获取项目根目录package.json
 */
declare function getPackage(): any;
declare function readJsonSync(filepath: string, encoding?: BufferEncoding): any;
interface WriteJsonOptions {
    space?: number;
    replacer?: (key: string, value: any) => any;
}
declare function writeJsonSync(filepath: string, str: any, options?: WriteJsonOptions): void;
declare function getPlatform(delimiter?: string, isDiffArch?: boolean): string;
declare function getArgumentByName(name: string, args?: string[]): string | undefined;
declare function getExtraResourcesDir(): string;
declare function getModuleNameFromPath(modulePath: string): string | null;
export { loadConfig, loadFile, getElectronProgram, compareVersion, isWindows, isOSX, isMacOS, isLinux, isx86, isx64, getPlatform, rm, getPackage, readJsonSync, writeJsonSync, getArgumentByName, getExtraResourcesDir, getModuleNameFromPath };
