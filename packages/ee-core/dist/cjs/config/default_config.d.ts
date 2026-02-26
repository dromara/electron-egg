/**
 * default
 */
declare const _default: () => {
    openDevTools: boolean;
    singleLock: boolean;
    windowsOption: {
        title: string;
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        webPreferences: {
            contextIsolation: boolean;
            nodeIntegration: boolean;
        };
        frame: boolean;
        show: boolean;
        icon: string;
    };
    logger: {
        type: string;
        dir: string;
        encoding: string;
        env: string | undefined;
        level: string;
        consoleLevel: string;
        disableConsoleAfterReady: boolean;
        outputJSON: boolean;
        buffer: boolean;
        appLogName: string;
        coreLogName: string;
        agentLogName: string;
        errorLogName: string;
        coreLogger: {};
        allowDebugAtProd: boolean;
        enablePerformanceTimer: boolean;
        rotator: string;
    };
    socketServer: {
        enable: boolean;
        port: number;
        path: string;
        connectTimeout: number;
        pingTimeout: number;
        pingInterval: number;
        maxHttpBufferSize: number;
        transports: string[];
        cors: {
            origin: boolean;
        };
        channel: string;
    };
    httpServer: {
        enable: boolean;
        https: {
            enable: boolean;
            key: string;
            cert: string;
        };
        protocol: string;
        host: string;
        port: number;
        cors: {
            origin: string;
        };
        body: {
            multipart: boolean;
            formidable: {
                keepExtensions: boolean;
            };
        };
        filterRequest: {
            uris: string[];
            returnData: string;
        };
    };
    remote: {
        enable: boolean;
        url: string;
    };
    mainServer: {
        protocol: string;
        indexPath: string;
        options: {};
        takeover: string;
        loadingPage: string;
        channelSeparator: string;
    };
    exception: {
        mainExit: boolean;
        childExit: boolean;
        rendererExit: boolean;
    };
    jobs: {
        messageLog: boolean;
    };
    cross: {};
};
export default _default;
