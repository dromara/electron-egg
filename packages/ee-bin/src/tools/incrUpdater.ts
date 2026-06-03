/**
 * Incremental Update Package Generator — produces incremental update resources for Electron apps
 *
 * Incremental update principle: only package the changed portion of the asar archive (diff files),
 * rather than the full installer. The user downloads the incremental package and merges it locally
 * with the full package, significantly reducing update download size.
 *
 * Generation flow:
 *   1. Read metadata YAML (obtain version number, file list, SHA512 hashes)
 *   2. Determine target asar file path
 *   3. Create a zip archive (containing asar + extraResources + asarUnpacked modules)
 *   4. Generate SHA1 hash of the zip (for quick verification) and SHA512 hash of the full package
 *   5. Verify SHA512 matches the hash recorded in metadata (ensures integrity)
 *   6. Write JSON metadata file (version, filename, size, hash, force-update flag, etc.)
 *   7. Optionally clean up per-platform temporary extraction directories
 *
 * Dependencies: compressing (zip compression), js-yaml (YAML parsing), crypto (hash calculation), globby (file scanning)
 */

import path from 'path';
import fs from 'fs';
import { chalk } from '../lib/helpers.js';
import crypto from 'crypto';
import { zip as compressZip } from 'compressing';
import { globbySync } from 'globby';
import yaml from 'js-yaml';
import { loadConfig, writeJsonSync } from '../lib/utils.js';
import type { UpdaterConfig } from '../types/config.js';

/** Incremental updater CLI options */
interface UpdaterOptions {
  config?: string;
  asarFile?: string;
  platform?: string;
  force?: string;
}

/** Single file entry from electron-builder metadata */
interface MetadataFile {
  /** File download URL */
  url: string;
  /** SHA512 hash of the file (for integrity verification) */
  sha512: string;
  /** File size in bytes */
  size: number;
}

/** Top-level metadata structure (corresponds to electron-builder-generated YAML) */
interface Metadata {
  version: string;
  releaseDate: string;
  files: MetadataFile[];
}

class IncrUpdater {
  /** Per-platform electron-builder extraction temp directory names (used by cleanCache cleanup) */
  tmpAppDirs: string[];
  /** Standard directory name for asar.unpack (must preserve this path hierarchy in the zip) */
  asarUnpackedString: string;

  constructor() {
    this.tmpAppDirs = ['mac', 'mac-arm64', 'win-unpacked', 'win-ia32-unpacked', 'linux-unpacked'];
    this.asarUnpackedString = 'app.asar.unpacked';
  }

  /**
   * Incremental update entry point
   *
   * @param options - CLI options (config file path, asarFile path, target platform, force update flag)
   */
  async run(options: UpdaterOptions = {}): Promise<void> {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform, force } = options;
    const binCfg = loadConfig(config);
    const cfg = binCfg.updater;
    const forceUpdate = force === 'true';

    if (!cfg || !platform) {
      throw new Error('[ee-bin] [updater] Error: updater config or platform does not exist');
    }

    await this.generateFile(cfg, asarFile, platform, forceUpdate);

    console.log('[ee-bin] [updater] End');
  }

  /**
   * Generate incremental update package — core logic
   *
   * Complete steps:
   *   1. Look up the updater config for the target platform
   *   2. Read metadata YAML to get version number and file list
   *   3. Determine asar file path (CLI argument takes priority, then config asarFile)
   *   4. Generate a platform+version-named zip package
   *   5. Add asar + extraResources + asarUnpacked modules to the zip
   *   6. Calculate SHA1 of the zip and SHA512 of the full package
   *   7. Verify SHA512 matches the metadata
   *   8. Write JSON metadata file
   *   9. Optionally clean temporary directories
   */
  async generateFile(config: Record<string, UpdaterConfig>, asarFile: string | undefined, platform: string, force = false): Promise<void> {
    const cfg = config[platform];
    if (!cfg) {
      throw new Error(`[ee-bin] [updater] Error: ${platform} config does not exist`);
    }

    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green(`${platform} config:`), cfg);

    // Read metadata YAML (electron-builder-generated version info file)
    const metadataPath = path.join(homeDir, cfg.metadata);
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`[ee-bin] [updater] Error: ${metadataPath} does not exist!`);
    }
    const metadataObj = yaml.load(fs.readFileSync(metadataPath, 'utf8')) as Metadata;

    // Determine asar file path: CLI --asar-file takes priority, then config asarFile
    let asarFilePath = '';
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else if (cfg.asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile));
    }

    if (!asarFilePath || !fs.existsSync(asarFilePath)) {
      throw new Error(`[ee-bin] [updater] Error: ${asarFilePath || '(empty path)'} does not exist`);
    }

    const version = metadataObj.version;
    // Platform name conversion: config keys may use underscores (e.g. mac_arm64),
    // but filenames use hyphens (e.g. mac-arm64)
    let platformForFilename = platform;
    if (platform.includes('_')) {
      const platformArr = platform.split('_');
      platformForFilename = platformArr.join('-');
    }

    // Generate zip filename: template-platform-version.zip (e.g. updater-mac-arm64-1.0.0.zip)
    const extZip = '.zip';
    const zipName = path.basename(cfg.output.zip, extZip) + `-${platformForFilename}-${version}${extZip}`;
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    // Remove existing zip if present (ensures clean output)
    if (fs.existsSync(asarZipPath)) {
      fs.rmSync(asarZipPath, { recursive: true, force: true });
    }

    // Create zip archive
    const zipStream = new compressZip.Stream();
    // First add the asar archive itself (incremental update needs the full asar file)
    zipStream.addEntry(asarFilePath, { relativePath: path.basename(asarFilePath) });

    // Add extra resource files (e.g. native modules, config files)
    if (cfg.extraResources && cfg.extraResources.length > 0) {
      const files = globbySync(cfg.extraResources, { cwd: homeDir });
      for (const extraRes of files) {
        const extraResPath = path.normalize(path.join(homeDir, extraRes));
        if (!fs.existsSync(extraResPath)) {
          continue;
        }
        // Preserve extraResources path hierarchy (relative path starting from 'extraResources/')
        const extraResDir = path.dirname(extraResPath);
        const index = extraResDir.indexOf('extraResources');
        const zipFileDir = extraResDir.substring(index).replace(/\\/g, '/');
        zipStream.addEntry(extraResPath, { relativePath: zipFileDir + '/' + path.basename(extraResPath) });
      }
    }

    // Add asarUnpacked modules (native modules must exist as separate files, cannot be bundled into asar)
    if (cfg.asarUnpacked && cfg.asarUnpacked.length > 0) {
      const modules = cfg.asarUnpacked;
      for (const moduleItem of modules) {
        const modulePath = path.normalize(path.join(homeDir, moduleItem));
        if (!fs.existsSync(modulePath)) {
          throw new Error(`${modulePath} is not exists!`);
        }

        // Preserve app.asar.unpacked/ path hierarchy (Electron looks for native modules at this path)
        const zipDir = path.join(this.asarUnpackedString, moduleItem).replace(/\\/g, '/');
        this._addFolderToZip(zipStream, modulePath, zipDir);
      }
    }

    // Write zip to disk
    const writeStream = fs.createWriteStream(asarZipPath);
    zipStream.pipe(writeStream);
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Calculate hashes: SHA1 for the zip (quick verification), SHA512 for the full package (strong verification)
    const zipSha1 = this.generateHash(asarZipPath, 'sha1', 'hex');
    const fileStat = fs.statSync(asarZipPath);

    // Find the full installer file entry from metadata (skip existing .zip entries)
    let fullFileInfo: MetadataFile | undefined;
    for (const item of metadataObj.files) {
      if (item.url.includes('.zip')) {
        continue;
      }
      fullFileInfo = item;
    }

    if (!fullFileInfo) {
      throw new Error('[ee-bin] [updater] Error: fullFileInfo not found in metadata');
    }

    // Verify SHA512: ensure the local full package hash matches the metadata record.
    // If they don't match, the full package has been tampered with or corrupted,
    // and the incremental update cannot be reliably generated from it.
    const fullFileName = fullFileInfo.url;
    const fullFilePath = path.normalize(path.join(homeDir, cfg.output.directory, fullFileName));
    const generateSha512 = this.generateHash(fullFilePath, 'sha512');
    if (fullFileInfo.sha512 !== generateSha512) {
      throw new Error(
        `[ee-bin] [updater] Error: metadata sha512 is not equal to generateSha512!\n` +
        `  at metadata sha512: ${fullFileInfo.sha512}\n` +
        `  at generate  sha512: ${generateSha512}`
      );
    }

    // Build and write incremental update JSON metadata
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
    // JSON filename: template-platform.json (e.g. updater-mac-arm64.json)
    const jsonName = path.basename(cfg.output.file, extJson) + `-${platformForFilename}${extJson}`;
    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    writeJsonSync(updaterJsonFilePath, item);

    // Optional cleanup: delete per-platform electron-builder temporary extraction directories
    if (cfg.cleanCache) {
      for (const dir of this.tmpAppDirs) {
        const dirPath = path.join(homeDir, cfg.output.directory, dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
    }
  }

  /**
   * Recursively add folder contents to a zip compression stream
   *
   * @param zipStream - The compressing zip stream to add entries to
   * @param folderPath - Absolute path to the folder on disk
   * @param zipDir - Relative path within the zip archive
   */
  _addFolderToZip(zipStream: compressZip.Stream, folderPath: string, zipDir: string): void {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      const relativePath = zipDir + '/' + entry.name;
      if (entry.isDirectory()) {
        this._addFolderToZip(zipStream, fullPath, relativePath);
      } else {
        zipStream.addEntry(fullPath, { relativePath });
      }
    }
  }

  /**
   * Calculate the cryptographic hash of a file
   *
   * @param filepath - File path (throws error for empty or non-existent paths instead of
   *                   silently returning empty values, to prevent empty hashes from being
   *                   written to update metadata which would cause client verification failures)
   * @param algorithm - Hash algorithm (default: sha512)
   * @param encoding - Output encoding (default: base64; sha1 uses hex)
   * @returns Hash string
   * @throws Error if filepath is empty or the file does not exist
   */
  generateHash(filepath: string, algorithm = 'sha512', encoding: crypto.BinaryToTextEncoding = 'base64'): string {
    if (filepath.length === 0) {
      throw new Error(`[ee-bin] [updater] Empty filepath for ${algorithm}`);
    }

    if (!fs.existsSync(filepath)) {
      throw new Error(`[ee-bin] [updater] ${filepath} does not exist for ${algorithm}`);
    }

    console.log(chalk.blue('[ee-bin] [updater] ') + `generate ${algorithm} for filepath:${filepath}`);
    const buffer = fs.readFileSync(filepath);
    const fsHash = crypto.createHash(algorithm);
    fsHash.update(buffer);
    return fsHash.digest(encoding);
  }
}

export const incrUpdater = new IncrUpdater();
export { IncrUpdater };
