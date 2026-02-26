declare const MAP: unique symbol;
declare const LIST: unique symbol;
declare class Timing {
    private _enable;
    private [MAP];
    private [LIST];
    constructor();
    init(): void;
    start(name: string, start?: number): {
        name: string;
        start: number;
        end: undefined;
        duration: undefined;
        pid: number;
        index: number;
    } | undefined;
    end(name: string): any;
    enable(): void;
    disable(): void;
    clear(): void;
    toJSON(): any[];
}
export { Timing };
