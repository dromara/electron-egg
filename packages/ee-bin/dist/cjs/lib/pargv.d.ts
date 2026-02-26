interface PargvOptions {
    boolean?: boolean | string[];
    alias?: Record<string, string | string[]>;
    string?: string[];
    default?: Record<string, any>;
    unknown?: (arg: string) => boolean | void;
    stopEarly?: boolean;
    '--'?: boolean;
}
interface ArgvResult {
    _: any[];
    [key: string]: any;
}
export default function pargv(args: string[], opts?: PargvOptions): ArgvResult;
export {};
