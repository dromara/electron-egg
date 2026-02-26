import 'bytenode';
declare const extensions: any;
declare function loadFile(filepath: string): any;
declare function callFn(fn: any, args: any[], ctx: any): Promise<any>;
declare function getResolvedFilename(filepath: string, baseDir: string): string;
/**
 * 字节码类
 */
declare function isBytecodeClass(exports: any): boolean;
/**
 * 文件类型
 */
declare function filePatterns(): string[];
export { extensions, loadFile, callFn, getResolvedFilename, isBytecodeClass, filePatterns, };
