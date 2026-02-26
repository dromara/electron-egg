interface ServeOptions {
    config?: string;
    serve?: string;
    cmds?: string;
    env?: string;
}
interface BinCmdConfig {
    [key: string]: {
        directory: string;
        cmd: string;
        args: string | string[];
        protocol?: string;
        hostname?: string;
        port?: number;
        indexPath?: string;
        force?: boolean;
        sync?: boolean;
        loadingPage?: string;
        watch?: boolean;
        delay?: number;
        stdio?: string;
    };
}
interface MultiExecOptions {
    binCmd: string;
    binCmdConfig: BinCmdConfig;
    command: string;
}
declare class ServeProcess {
    private execProcess;
    private electronDir;
    private bundleDir;
    private pkgPath;
    constructor();
    /**
     * init
     */
    private _init;
    private _closeProcess;
    /**
     * Start frontend and main process services
     */
    dev(options?: ServeOptions): void;
    /**
     * Start the main process service
     */
    start(options?: ServeOptions): void;
    sleep(ms: number): Promise<void>;
    /**
     * build
     */
    build(options?: ServeOptions): void;
    /**
     * Execute custom commands
     */
    exec(options?: ServeOptions): void;
    /**
     * Support multiple commands
     */
    multiExec(opt: MultiExecOptions): void;
    bundle(bundleConfig: any): void;
    private _formatCmds;
    private _switchPkgMain;
    isDev(): boolean;
}
declare const serveProcess: ServeProcess;
export { ServeProcess, serveProcess };
