import EventEmitter = require("events");
import LoadBalancer = require("../load-balancer");
export declare class ChildPoolJob extends EventEmitter<[never]> {
    constructor(opt?: {});
    config: any;
    boundMap: Map<any, any>;
    children: {};
    min: number;
    max: number;
    strategy: string;
    weights: any[];
    LB: LoadBalancer;
    _initEvents(): void;
    _removeChild(pid: any): void;
    create(number?: number): Promise<string[]>;
    _childCreated(childProcess: any): void;
    run(filepath: any, params?: {}): any;
    runPromise(filepath: any, params?: {}): Promise<any>;
    getBoundChild(boundId: any): any;
    getChildByPid(pid: any): any;
    getChild(): any;
    getPids(): string[];
    // kill all
    // type: sequence | parallel
    killAll(type?: string): void;
}
