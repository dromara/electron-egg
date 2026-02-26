

import path from 'path';
import fs from 'fs';
import fsPro from 'fs-extra';
import crypto from 'crypto';
import chalk from 'chalk';
import admZip from 'adm-zip';
import globby from 'globby';
import yaml from 'js-yaml';
import { loadConfig, writeJsonSync } from '../lib/utils';

interface UpdaterOptions {
  config?: string;
  asarFile?: string;
  platform?: string;
  force?: string;
}

interface UpdaterConfig {
  metadata: string;
  asarFile: string;
  output: {
    directory: string;
    zip: string;
    file: string;
  };
  extraResources?: string[];
  asarUnpacked?: string[];
  cleanCache?: boolean;
}

interface MetadataFile {
  version: string;
  releaseDate: string;
  files: Array<{
    url: string;
    size: number;
    sha512: string;
  }>;
}

class IncrUpdater {
  private tmpAppDirs: string[];
  private windows32Platform: string;
  private windows64Platform: string;
  private macosIntelPlatform: string;
  private macosApplePlatform: string;
  private linuxPlatform: string;
  private nodeModulesString: string;
  private asarUnpackedString: string;

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
  run(options: UpdaterOptions = {}): void {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform, force } = options;
    const binCfg = loadConfig(config) as any;
    const cfg = binCfg.updater;
    const forceUpdate = force === 'true' ? true : false;

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${cfg} config does not exist`));
      return;
    }

    this.generateFile(cfg, asarFile, platform, forceUpdate);

    console.log('[ee-bin] [updater] End');
  }

  /**
   * generate json file
   */ 
  generateFile(config: any, asarFile: string | undefined, platform: string | undefined, force: boolean = false): void {
    if (!platform) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red('Error: platform is required'));
      return;
    }

    const cfg = config[platform];
    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${platform} config does not exist`));
      return;
    }

    let latestVersionInfo: any = {};
    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green(`${platform} config:`), cfg);

    const metadataPath = path.join(homeDir, cfg.metadata);
    if (!fs.existsSync(metadataPath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${metadataPath} does not exist!`));
      return;
    }    
    const metadataObj = yaml.load(fs.readFileSync(metadataPath, 'utf8')) as MetadataFile;

    let asarFilePath = "";
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile));
    }

    if (!fs.existsSync(asarFilePath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${asarFilePath} does not exist`));
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
    zipName = path.basename(cfg.output.zip, extZip) + `-${platformForFilename}-${version}${extZip}`;
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    if (fs.existsSync(asarZipPath)) {
      fsPro.removeSync(asarZipPath);
    }
    const zip = new admZip();
    // add asar
    zip.addLocalFile(asarFilePath); 
    // add extraResources
    if (cfg.extraResources && cfg.extraResources.length > 0) {
      const files = globby.sync(cfg.extraResources, { cwd: homeDir });
      for (const extraRes of files) {
        const extraResPath = path.normalize(path.join(homeDir, extraRes));
        if (!fs.existsSync(extraResPath)) {
          continue;
        }
        const extraResDir = path.dirname(extraResPath);
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
        const modulePath = path.normalize(path.join(homeDir, moduleItem));
        if (!fs.existsSync(modulePath)) {
          throw new Error(`${modulePath} is not exists!`);
        }
      
        const zipDir = path.join(this.asarUnpackedString, moduleItem);
        zip.addLocalFolder(modulePath, zipDir);
      }
    }

    zip.writeZip(asarZipPath, (err) => {
      if (err) {
        console.log(chalk.blue('[ee-bin] [updater] create zip ') + chalk.red(`Error: ${err}`));
      }
    });

    // generate latest.json
    // incr file
    const zipSha1 = this.generateHash(asarZipPath, 'sha1', 'hex');
    const fileStat = fs.statSync(asarZipPath);
    // full file
    let fullFileInfo: { url: string; size: number; sha512: string } | undefined;
    for (const item of metadataObj.files) {
      if (item.url.indexOf('.zip') !== -1) {
        continue;
      }
      fullFileInfo = item;
    }
    
    if (!fullFileInfo) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red('Error: fullFileInfo not found'));
      return;
    }
    
    const fullFileName = fullFileInfo.url;
    const fullFilePath = path.normalize(path.join(homeDir, cfg.output.directory, fullFileName));
    const generateSha512 = this.generateHash(fullFilePath, 'sha512');
    if (fullFileInfo.sha512 !== generateSha512) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: metadata sha512 is not equal to generateSha512 !
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
    const jsonName = path.basename(cfg.output.file, extJson) + `-${platformForFilename}${extJson}`;
    latestVersionInfo = item;
    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    writeJsonSync(updaterJsonFilePath, latestVersionInfo);

    // Delete cache files to prevent generated zip files from being outdated versions
    if (cfg.cleanCache) {
      this.tmpAppDirs.forEach(dir => {
        const dirPath = path.join(homeDir, cfg.output.directory, dir);
        fsPro.removeSync(dirPath);
      });
    }
  }
  
  generateHash(filepath: string = "", algorithm: string = "sha512", encoding: 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex' = "base64"): string {
    let data = '';
    if (filepath.length === 0) {
      return data;
    }

    if (!fs.existsSync(filepath)) {
      return data;
    }

    console.log(chalk.blue('[ee-bin] [updater] ') + `generate ${algorithm} for filepath:${filepath}`);
    try {
      const buffer = fs.readFileSync(filepath);
      const fsHash = crypto.createHash(algorithm);
      fsHash.update(buffer);
      data = fsHash.digest(encoding as any);
      return data;
    } catch (error) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: generate ${algorithm} error!`));
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${error}`));
    }
    return data;
  }
}

const incrUpdater = new IncrUpdater();

export {
  IncrUpdater,
  incrUpdater
};