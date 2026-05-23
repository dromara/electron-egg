export declare class IpcServer {
    directory: string;
    loop(obj: any, pathname: string): void;
    register(exportObj: any, propertyChain: any): void;
    findFn(controller: any, c: any): {
        controller: any;
    };
    init(): void;
}
