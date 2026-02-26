declare class ConfigLoader {
    private timing;
    constructor();
    /**
     * Load config/config.xxx.js
     */
    load(): any;
    private _AppConfig;
    private _loadConfig;
}
export { ConfigLoader };
