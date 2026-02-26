interface UpdaterOptions {
    config?: string;
    asarFile?: string;
    platform?: string;
    force?: string;
}
declare class IncrUpdater {
    private tmpAppDirs;
    private windows32Platform;
    private windows64Platform;
    private macosIntelPlatform;
    private macosApplePlatform;
    private linuxPlatform;
    private nodeModulesString;
    private asarUnpackedString;
    constructor();
    /**
     * run
     */
    run(options?: UpdaterOptions): void;
    /**
     * generate json file
     */
    generateFile(config: any, asarFile: string | undefined, platform: string | undefined, force?: boolean): void;
    generateHash(filepath?: string, algorithm?: string, encoding?: 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex'): string;
}
declare const incrUpdater: IncrUpdater;
export { IncrUpdater, incrUpdater };
