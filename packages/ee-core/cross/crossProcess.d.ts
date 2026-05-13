import EventEmitter = require("events");
export declare class CrossProcess {
    constructor(host: any, opt?: {});
    emitter: EventEmitter<[never]>;
    host: any;
    child: any;
    pid: number;
    port: number;
    name: string;
    config: {};
    /**
     * 初始化子进程
     */
    _init(options?: {}): void;
    /**
     * kill
     */
    kill(timeout?: number): void;
    getUrl(): string;
    getArgsObj(): {
        _: any[];
    };
    setPort(port: string|number): void;
    _generateId(): string;
    /**
     * exit electron
     */
    _exitElectron(timeout?: number): void;
}
