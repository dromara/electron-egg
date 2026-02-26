/**
 * ee-bin 配置
 * 仅适用于开发环境
 */
declare const _default: {
    /**
     * development serve ("frontend" "electron" )
     * ee-bin dev
     */
    dev: {
        frontend: {
            directory: string;
            cmd: string;
            args: string[];
            protocol: string;
            hostname: string;
            port: number;
            indexPath: string;
            force: boolean;
            sync: boolean;
        };
        electron: {
            directory: string;
            cmd: string;
            args: string[];
            loadingPage: string;
            watch: boolean;
            sync: boolean;
            delay: number;
        };
    };
    /**
     * 构建
     * ee-bin build
     */
    build: {
        frontend: {
            directory: string;
            cmd: string;
            args: string[];
        };
        electron: {
            type: string;
            bundler: string;
            bundleType: string;
            javascript: {
                entryPoints: string[];
                platform: string;
                bundle: boolean;
                minify: boolean;
                outdir: string;
                packages: string;
                sourcemap: boolean;
                sourcesContent: boolean;
            };
            typescript: {
                entryPoints: string[];
                tsconfig: string;
                platform: string;
                format: string;
                bundle: boolean;
                minify: boolean;
                outdir: string;
                packages: string;
                sourcemap: boolean;
                sourcesContent: boolean;
            };
        };
        win32: {
            cmd: string;
            directory: string;
            args: string[];
        };
        win64: {
            cmd: string;
            directory: string;
            args: string[];
        };
        win_e: {
            cmd: string;
            directory: string;
            args: string[];
        };
        win_7z: {
            cmd: string;
            directory: string;
            args: string[];
        };
        mac: {
            cmd: string;
            directory: string;
            args: string[];
        };
        mac_arm64: {
            cmd: string;
            directory: string;
            args: string[];
        };
        linux: {
            cmd: string;
            directory: string;
            args: string[];
        };
        linux_arm64: {
            cmd: string;
            directory: string;
            args: string[];
        };
    };
    /**
     * 移动资源
     * ee-bin move
     */
    move: {
        frontend_dist: {
            src: string;
            dest: string;
        };
    };
    /**
     * 预发布模式（prod）
     * ee-bin start
     */
    start: {
        directory: string;
        cmd: string;
        args: string[];
    };
    /**
     * 加密
     */
    encrypt: {
        frontend: {
            type: string;
            files: string[];
            fileExt: string[];
            cleanFiles: string[];
            specificFiles: never[];
            encryptDir: string;
            confusionOptions: {
                compact: boolean;
                stringArray: boolean;
                stringArrayEncoding: string[];
                deadCodeInjection: boolean;
                stringArrayCallsTransform: boolean;
                numbersToExpressions: boolean;
                target: string;
            };
        };
        electron: {
            type: string;
            files: string[];
            fileExt: string[];
            cleanFiles: string[];
            specificFiles: string[];
            encryptDir: string;
            confusionOptions: {
                compact: boolean;
                stringArray: boolean;
                stringArrayEncoding: string[];
                deadCodeInjection: boolean;
                stringArrayCallsTransform: boolean;
                numbersToExpressions: boolean;
                target: string;
            };
        };
    };
    /**
     * 执行自定义命令
     * ee-bin exec
     */
    exec: {};
};
export default _default;
