import { 
    AppConfig, 
    WindowsConfig, 
    LoggerConfig, 
    SocketConfig, 
    HttpConfig,
    RemoteConfig,
    MainConfig,
    ExceptionConfig,
    JobConfig,
    CrossConfig 
} from "./default_config";
declare function loadConfig(): AppConfig;
declare function getConfig(): AppConfig;
export {
    AppConfig, 
    WindowsConfig, 
    LoggerConfig, 
    SocketConfig, 
    HttpConfig,
    RemoteConfig,
    MainConfig,
    ExceptionConfig,
    JobConfig,
    CrossConfig,
    loadConfig,
    getConfig
}
