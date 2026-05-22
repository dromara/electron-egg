export declare class HttpServer {
    config: any;
    httpApp: any;
    init(): Promise<void>;
    _create(): void;
    _dispatch(ctx: any, next: any): Promise<void>;
    getHttpApp(): any;
}
