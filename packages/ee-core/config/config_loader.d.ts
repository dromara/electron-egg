import { Timing } from "../core/utils/timing";
import { EEConfig } from "./default_config";
export declare class ConfigLoader {
    timing: Timing;
    /**
     * Load config/config.xxx.js
     */
    load(): EEConfig;
    _AppConfig(): EEConfig;
    _loadConfig(dirpath: string, filename: string): EEConfig;
}


