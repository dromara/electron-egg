declare class Appliaction {
    constructor();
    register(eventName: string, handler: (...args: any[]) => any): void;
    run(): void;
}
declare const app: Appliaction;
export { Appliaction, app, };
