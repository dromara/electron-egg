import { EventEmitter } from "events";
import { ChildProcess } from "child_process";
declare export class JobProcess {
    constructor(host: any, opt?: {});
    emitter: EventEmitter<[never]>;
    host: any;
    args: string[];
    sleeping: boolean;
    child: ChildProcess;
    pid: number;
    _init(): void;
    _eventEmit(m: any): void;
    dispatch(cmd: string, jobPath?: string, ...params: any[]): void;
    callFunc(jobPath?: string, funcName?: string, ...params: any[]): void;
    kill(timeout?: number): void;
}
