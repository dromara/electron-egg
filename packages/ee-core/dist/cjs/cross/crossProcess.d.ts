declare class CrossProcess {
    private emitter;
    private host;
    private child;
    private _pid;
    private port;
    private _name;
    private config;
    get pid(): number | undefined;
    get name(): string;
    set name(value: string);
    constructor(host: any, opt?: any);
    /**
     * 初始化子进程
     */
    private _init;
    /**
     * kill
     */
    kill(timeout?: number): void;
    getUrl(): string;
    getArgsObj(): {
        _: any[];
    };
    setPort(port: number): void;
    private _generateId;
    /**
     * exit electron
     */
    private _exitElectron;
}
export { CrossProcess };
