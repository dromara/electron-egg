declare class ElectronEgg {
    constructor();
    init(): void;
    register(eventName: string, handler: (...args: any[]) => any): void;
    run(): void;
}
export { ElectronEgg, };
