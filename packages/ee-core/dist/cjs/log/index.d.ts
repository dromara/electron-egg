interface EELog {
    logger: any;
    coreLogger: any;
}
declare function createLog(config?: any): any;
declare function loadLog(): EELog | null;
export { createLog, loadLog };
export declare const logger: any;
export declare const coreLogger: any;
