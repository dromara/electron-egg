import { EventEmitter } from 'node:events';
import { CrossProcess } from "./crossProcess";
import internal = require("stream");
export declare class Cross {
    emitter: EventEmitter<[never]>;
    children: {};
    childrenMap: {};
    create(): Promise<void>;
    run(service: string, opt?: {}): Promise<CrossProcess>;
    killAll(): void;
    kill(pid: string|number): void;
    killByName(name: string): void;
    getUrl(name: string): string;
    getProcByName(name: string): CrossProcess;
    getProc(pid: string|number): CrossProcess;
    getPids(): string[];
    _initEventEmitter(): void;
}
export declare let cross: Cross;
