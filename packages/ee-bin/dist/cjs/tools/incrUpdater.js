"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrUpdater = exports.IncrUpdater = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const crypto_1 = __importDefault(require("crypto"));
const chalk_1 = __importDefault(require("chalk"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const globby_1 = __importDefault(require("globby"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const utils_1 = require("../lib/utils");
class IncrUpdater {
    constructor() {
        this.tmpAppDirs = [
            'mac',
            'mac-arm64',
            'win-unpacked',
            'win-ia32-unpacked',
            'linux-unpacked'
        ];
        this.windows32Platform = 'windows_32';
        this.windows64Platform = 'windows_64';
        this.macosIntelPlatform = 'macos_intel';
        this.macosApplePlatform = 'macos_apple';
        this.linuxPlatform = 'linux';
        this.nodeModulesString = 'node_modules';
        this.asarUnpackedString = 'app.asar.unpacked';
    }
    /**
     * run
     */
    run(options = {}) {
        console.log('[ee-bin] [updater] Start');
        const { config, asarFile, platform, force } = options;
        const binCfg = (0, utils_1.loadConfig)(config);
        const cfg = binCfg.updater;
        const forceUpdate = force === 'true' ? true : false;
        if (!cfg) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: ${cfg} config does not exist`));
            return;
        }
        this.generateFile(cfg, asarFile, platform, forceUpdate);
        console.log('[ee-bin] [updater] End');
    }
    /**
     * generate json file
     */
    generateFile(config, asarFile, platform, force = false) {
        if (!platform) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red('Error: platform is required'));
            return;
        }
        const cfg = config[platform];
        if (!cfg) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: ${platform} config does not exist`));
            return;
        }
        let latestVersionInfo = {};
        const homeDir = process.cwd();
        console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.green(`${platform} config:`), cfg);
        const metadataPath = path_1.default.join(homeDir, cfg.metadata);
        if (!fs_1.default.existsSync(metadataPath)) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: ${metadataPath} does not exist!`));
            return;
        }
        const metadataObj = js_yaml_1.default.load(fs_1.default.readFileSync(metadataPath, 'utf8'));
        let asarFilePath = "";
        if (asarFile) {
            asarFilePath = path_1.default.normalize(path_1.default.join(homeDir, asarFile));
        }
        else {
            asarFilePath = path_1.default.normalize(path_1.default.join(homeDir, cfg.asarFile));
        }
        if (!fs_1.default.existsSync(asarFilePath)) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: ${asarFilePath} does not exist`));
            return;
        }
        const version = metadataObj.version;
        let platformForFilename = platform;
        if (platform.indexOf("_") !== -1) {
            const platformArr = platform.split("_");
            // windows_32 -> windows-32
            platformForFilename = platformArr.join("-");
        }
        // zip
        let zipName = "";
        const extZip = '.zip';
        zipName = path_1.default.basename(cfg.output.zip, extZip) + `-${platformForFilename}-${version}${extZip}`;
        const asarZipPath = path_1.default.join(homeDir, cfg.output.directory, zipName);
        if (fs_1.default.existsSync(asarZipPath)) {
            fs_extra_1.default.removeSync(asarZipPath);
        }
        const zip = new adm_zip_1.default();
        // add asar
        zip.addLocalFile(asarFilePath);
        // add extraResources
        if (cfg.extraResources && cfg.extraResources.length > 0) {
            const files = globby_1.default.sync(cfg.extraResources, { cwd: homeDir });
            for (const extraRes of files) {
                const extraResPath = path_1.default.normalize(path_1.default.join(homeDir, extraRes));
                if (!fs_1.default.existsSync(extraResPath)) {
                    continue;
                }
                const extraResDir = path_1.default.dirname(extraResPath);
                const index = extraResDir.indexOf('extraResources');
                const zipFileDir = extraResDir.substring(index);
                // 资源路径 extraResPath: D:\www\gofile\src\ee\ee-demo\build\extraResources\hello\c.txt
                // 文件在zip中的路径 zipFileDir: extraResources/hello
                zip.addLocalFile(extraResPath, zipFileDir);
            }
        }
        // add asarUnpacked
        if (cfg.asarUnpacked && cfg.asarUnpacked.length > 0) {
            const modules = cfg.asarUnpacked;
            for (const moduleItem of modules) {
                const modulePath = path_1.default.normalize(path_1.default.join(homeDir, moduleItem));
                if (!fs_1.default.existsSync(modulePath)) {
                    throw new Error(`${modulePath} is not exists!`);
                }
                const zipDir = path_1.default.join(this.asarUnpackedString, moduleItem);
                zip.addLocalFolder(modulePath, zipDir);
            }
        }
        zip.writeZip(asarZipPath, (err) => {
            if (err) {
                console.log(chalk_1.default.blue('[ee-bin] [updater] create zip ') + chalk_1.default.red(`Error: ${err}`));
            }
        });
        // generate latest.json
        // incr file
        const zipSha1 = this.generateHash(asarZipPath, 'sha1', 'hex');
        const fileStat = fs_1.default.statSync(asarZipPath);
        // full file
        let fullFileInfo;
        for (const item of metadataObj.files) {
            if (item.url.indexOf('.zip') !== -1) {
                continue;
            }
            fullFileInfo = item;
        }
        if (!fullFileInfo) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red('Error: fullFileInfo not found'));
            return;
        }
        const fullFileName = fullFileInfo.url;
        const fullFilePath = path_1.default.normalize(path_1.default.join(homeDir, cfg.output.directory, fullFileName));
        const generateSha512 = this.generateHash(fullFilePath, 'sha512');
        if (fullFileInfo.sha512 !== generateSha512) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: metadata sha512 is not equal to generateSha512 !
      at metadata sha512: ${fullFileInfo.sha512}
      at generate Sha512: ${generateSha512}`));
            return;
        }
        const item = {
            version: version,
            file: zipName,
            size: fileStat.size,
            sha1: zipSha1,
            fullFile: {
                fileName: fullFileInfo.url,
                size: fullFileInfo.size,
                sha512: generateSha512,
            },
            force,
            releaseDate: metadataObj.releaseDate,
        };
        const extJson = '.json';
        const jsonName = path_1.default.basename(cfg.output.file, extJson) + `-${platformForFilename}${extJson}`;
        latestVersionInfo = item;
        const updaterJsonFilePath = path_1.default.join(homeDir, cfg.output.directory, jsonName);
        (0, utils_1.writeJsonSync)(updaterJsonFilePath, latestVersionInfo);
        // Delete cache files to prevent generated zip files from being outdated versions
        if (cfg.cleanCache) {
            this.tmpAppDirs.forEach(dir => {
                const dirPath = path_1.default.join(homeDir, cfg.output.directory, dir);
                fs_extra_1.default.removeSync(dirPath);
            });
        }
    }
    generateHash(filepath = "", algorithm = "sha512", encoding = "base64") {
        let data = '';
        if (filepath.length === 0) {
            return data;
        }
        if (!fs_1.default.existsSync(filepath)) {
            return data;
        }
        console.log(chalk_1.default.blue('[ee-bin] [updater] ') + `generate ${algorithm} for filepath:${filepath}`);
        try {
            const buffer = fs_1.default.readFileSync(filepath);
            const fsHash = crypto_1.default.createHash(algorithm);
            fsHash.update(buffer);
            data = fsHash.digest(encoding);
            return data;
        }
        catch (error) {
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: generate ${algorithm} error!`));
            console.log(chalk_1.default.blue('[ee-bin] [updater] ') + chalk_1.default.red(`Error: ${error}`));
        }
        return data;
    }
}
exports.IncrUpdater = IncrUpdater;
const incrUpdater = new IncrUpdater();
exports.incrUpdater = incrUpdater;
//# sourceMappingURL=incrUpdater.js.map