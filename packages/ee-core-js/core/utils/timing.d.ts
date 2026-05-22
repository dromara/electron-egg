export declare class Timing {
    _enable: boolean;
    init(): void;
    start(name: any, start: any): {
        name: any;
        start: any;
        end: any;
        duration: any;
        pid: number;
        index: number;
    };
    end(name: any): any;
    enable(): void;
    disable(): void;
    clear(): void;
    toJSON(): any[];
    [MAP]: Map<any, any>;
    [LIST]: any[];
}
declare const MAP: unique symbol;
declare const LIST: unique symbol;
export {};
