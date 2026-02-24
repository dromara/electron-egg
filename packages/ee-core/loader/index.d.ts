// 加载单个文件(如果是函数，将被执行)
export declare function loadFile(filepath: string, ...inject: any[]): any;
// 加载并运行文件
export declare function execFile(filepath: string, ...inject: any[]): Any;
export declare function requireFile(filepath: string): any;
// 模块的绝对路径
export declare function resolveModule(filepath: string): string;
// 获取electron目录下文件的绝对路径
export function getFullpath(filepath: string): string;
