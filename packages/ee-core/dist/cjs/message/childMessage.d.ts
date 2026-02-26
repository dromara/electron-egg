declare class ChildMessage {
    sendToMain(eventName: string, params?: any): boolean;
    send(eventName: string, params: any | undefined, receiver: any): boolean;
    exit(code?: number): never;
    sendErrorToTerminal(err: any): void;
}
export { ChildMessage };
