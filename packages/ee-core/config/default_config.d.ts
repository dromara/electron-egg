import { BrowserWindowConstructorOptions } from 'electron';

export declare interface AppConfig {
    openDevTools?: boolean | Object;
    singleLock?: boolean;
    windowsOption?: BrowserWindowConstructorOptions;
    logger?: LoggerConfig;
    socketServer?: SocketConfig;
    httpServer?: HttpConfig;
    remote?: RemoteConfig;
    mainServer?: MainConfig;
    exception?: ExceptionConfig;
    job?: JobConfig;
    cross?: CrossConfig;
}
export declare interface LoggerConfig {
    type?: string;
    dir?: string;
    encoding?: string;
    env?: string;
    level?: string;
    consoleLevel?: string;
    disableConsoleAfterReady?: boolean;
    outputJSON?: boolean;
    buffer?: boolean;
    appLogName: string;
    coreLogName?: string;
    agentLogName?: string;
    errorLogName: string;
    coreLogger?: {};
    allowDebugAtProd?: boolean;
    enablePerformanceTimer?: boolean;
    rotator?: string;
}
export declare interface SocketConfig {
    enable: boolean;
    port: number;
    path?: string;
    connectTimeout?: number;
    pingTimeout?: number;
    pingInterval?: number;
    maxHttpBufferSize?: number;
    transports?: string[];
    cors?: {
        origin?: boolean;
    };
    channel?: string;
}
export declare interface HttpConfig {
    enable: boolean;
    https?: {
        enable: boolean;
        key: string;
        cert: string;
    };
    protocol?: string;
    host?: string;
    port: number;
    cors?: {
        origin?: string;
    };
    body?: {
        multipart?: boolean;
        formidable?: {
            keepExtensions?: boolean;
        };
    };
    filterRequest?: {
        uris?: string[];
        returnData?: string;
    };
}
export declare interface RemoteConfig {
    enable: boolean;
    url: string;
}
export declare interface MainConfig {
    protocol?: string;
    indexPath: string;
    options?: {};
    takeover?: string;
    loadingPage?: string;
    channelSeparator?: string;
}
export declare interface ExceptionConfig {
    mainExit?: boolean;
    childExit?: boolean;
    rendererExit?: boolean;
}
export declare interface JobConfig {
    messageLog: boolean;
}
export declare interface CrossConfig {}
declare function config(): AppConfig;
export = config;
