import { CrossProcess } from './crossProcess';
declare class Cross {
    private emitter;
    private children;
    private childrenMap;
    constructor();
    create(): Promise<void>;
    run(service: string, opt?: any): Promise<CrossProcess>;
    killAll(): void;
    kill(pid: string): void;
    killByName(name: string): void;
    getUrl(name: string): any;
    getProcByName(name: string): any;
    getProc(pid: string): any;
    getPids(): string[];
    _initEventEmitter(): void;
}
declare const cross: Cross;
export { Cross, cross };
