import path from 'path';
import fs from 'fs';
import fsPro from 'fs-extra';
import crypto from 'crypto';
import chalk from 'chalk/index.js';
import AdmZip from 'adm-zip';
import globby from 'globby';
import yaml from 'js-yaml';
import { loadConfig, writeJsonSync } from '../lib/utils.js';

interface UpdaterConfig {
  metadata: string;
  asarFile?: string;
  output: {
    directory: string;
    zip: string;
    file: string;
  };
  extraResources?: string[];
  asarUnpacked?: string[];
  cleanCache?: boolean;
}

interface UpdaterOptions {
  config?: string;
  asarFile?: string;
  platform?: string;
  force?: string;
}

interface MetadataFile {
  url: string;
  sha512: string;
  size: number;
}

interface Metadata {
  version: string;
  releaseDate: string;
  files: MetadataFile[];
}

class IncrUpdater {
  tmpAppDirs: string[];
  windows32Platform: string;
  windows64Platform: string;
  macosIntelPlatform: string;
  macosApplePlatform: string;
  linuxPlatform: string;
  nodeModulesString: string;
  asarUnpackedString: string;

  constructor() {
    this.tmpAppDirs = ['mac', 'mac-arm64', 'win-unpacked', 'win-ia32-unpacked', 'linux-unpacked'];
    this.windows32Platform = 'windows_32';
    this.windows64Platform = 'windows_64';
    this.macosIntelPlatform = 'macos_intel';
    this.macosApplePlatform = 'macos_apple';
    this.linuxPlatform = 'linux';
    this.nodeModulesString = 'node_modules';
    this.asarUnpackedString = 'app.asar.unpacked';
  }

  run(options: UpdaterOptions = {}): void {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform, force } = options;
    const binCfg = loadConfig(config);
    const cfg = binCfg.updater as Record<string, UpdaterConfig> | undefined;
    const forceUpdate = force === 'true';

    if (!cfg || !platform) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: updater config or platform does not exist`));
      return;
    }

    this.generateFile(cfg, asarFile, platform, forceUpdate);

    console.log('[ee-bin] [updater] End');
  }

  generateFile(config: Record<string, UpdaterConfig>, asarFile: string | undefined, platform: string, force = false): void {
    const cfg = config[platform];
    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${platform} config does not exist`));
      return;
    }

    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green(`${platform} config:`), cfg);

    const metadataPath = path.join(homeDir, cfg.metadata);
    if (!fs.existsSync(metadataPath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${metadataPath} does not exist!`));
      return;
    }
    const metadataObj = yaml.load(fs.readFileSync(metadataPath, 'utf8')) as Metadata;

    let asarFilePath = '';
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else if (cfg.asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile));
    }

    if (!asarFilePath || !fs.existsSync(asarFilePath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${asarFilePath} does not exist`));
      return;
    }

    const version = metadataObj.version;
    let platformForFilename = platform;
    if (platform.indexOf('_') !== -1) {
      const platformArr = platform.split('_');
      platformForFilename = platformArr.join('-');
    }

    const extZip = '.zip';
    const zipName = path.basename(cfg.output.zip, extZip) + `-${platformForFilename}-${version}${extZip}`;
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    if (fs.existsSync(asarZipPath)) {
      fsPro.removeSync(asarZipPath);
    }
    const zip = new AdmZip();
    zip.addLocalFile(asarFilePath);

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
        zip.addLocalFile(extraResPath, zipFileDir);
      }
    }

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

    const zipSha1 = this.generateHash(asarZipPath, 'sha1', 'hex');
    const fileStat = fs.statSync(asarZipPath);

    let fullFileInfo: MetadataFile | undefined;
    for (const item of metadataObj.files) {
      if (item.url.indexOf('.zip') !== -1) {
        continue;
      }
      fullFileInfo = item;
    }

    if (!fullFileInfo) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red('Error: fullFileInfo not found in metadata'));
      return;
    }

    const fullFileName = fullFileInfo.url;
    const fullFilePath = path.normalize(path.join(homeDir, cfg.output.directory, fullFileName));
    const generateSha512 = this.generateHash(fullFilePath, 'sha512');
    if (fullFileInfo.sha512 !== generateSha512) {
      console.log(
        chalk.blue('[ee-bin] [updater] ') +
          chalk.red(`Error: metadata sha512 is not equal to generateSha512 !
      at metadata sha512: ${fullFileInfo.sha512}
      at generate Sha512: ${generateSha512}`)
      );
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
    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    writeJsonSync(updaterJsonFilePath, item);

    if (cfg.cleanCache) {
      for (const dir of this.tmpAppDirs) {
        const dirPath = path.join(homeDir, cfg.output.directory, dir);
        if (fs.existsSync(dirPath)) {
          fsPro.removeSync(dirPath);
        }
      }
    }
  }

  generateHash(filepath = '', algorithm = 'sha512', encoding: crypto.BinaryToTextEncoding = 'base64'): string {
    if (filepath.length === 0) {
      return '';
    }

    if (!fs.existsSync(filepath)) {
      return '';
    }

    console.log(chalk.blue('[ee-bin] [updater] ') + `generate ${algorithm} for filepath:${filepath}`);
    try {
      const buffer = fs.readFileSync(filepath);
      const fsHash = crypto.createHash(algorithm);
      fsHash.update(buffer);
      return fsHash.digest(encoding);
    } catch (error) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: generate ${algorithm} error!`));
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${error}`));
    }
    return '';
  }
}

export const incrUpdater = new IncrUpdater();
export { IncrUpdater };
