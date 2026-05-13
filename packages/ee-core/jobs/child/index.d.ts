import EventEmitter = require("events");
import { JobProcess } from "./jobProcess";
export declare class ChildJob extends EventEmitter<[never]> {
    constructor();
    jobs: {};
    config: any;
    _initEvents(): void;
    exec(filepath: string, params?: {}, opt?: {}): JobProcess;
    createProcess(opt?: {}): JobProcess;
    getPids(): string[];
    execPromise(filepath: string, params?: {}, opt?: {}): Promise<JobProcess>;
}

