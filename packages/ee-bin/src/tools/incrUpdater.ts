/**
 * 增量更新包生成器 — 为 Electron 应用生成增量更新资源
 *
 * 增量更新原理：只打包 asar 包中变化的部分（差异文件），而非完整安装包，
 * 用户下载增量包后在本地与完整包合并，显著减少更新下载量。
 *
 * 生成流程：
 *   1. 读取 metadata YAML（获取版本号、文件列表、SHA512 hash）
 *   2. 确定目标 asar 文件路径
 *   3. 创建 zip 压缩包（包含 asar + extraResources + asarUnpacked 模块）
 *   4. 生成 zip 的 SHA1 hash（用于快速校验）和完整包的 SHA512 hash
 *   5. 验证 SHA512 与 metadata 中记录的 hash 是否一致（确保完整性）
 *   6. 写入 JSON 元数据文件（版本、文件名、大小、hash、是否强制更新等）
 *   7. 可选清理各平台临时解压目录
 *
 * 依赖：compressing（zip 压缩）、js-yaml（YAML 解析）、crypto（hash 计算）、globby（文件扫描）
 */

import path from 'path';
import fs from 'fs';
import { chalk } from '../lib/helpers.js';
import crypto from 'crypto';
import { zip as compressZip } from 'compressing';
import globby from 'globby';
import yaml from 'js-yaml';
import { loadConfig, writeJsonSync } from '../lib/utils.js';
import type { UpdaterConfig } from '../types/config.js';

/** 增量更新 CLI 选项 */
interface UpdaterOptions {
  config?: string;
  asarFile?: string;
  platform?: string;
  force?: string;
}

/** 元数据中的单个文件条目 */
interface MetadataFile {
  /** 文件下载 URL */
  url: string;
  /** 文件 SHA512 hash（用于完整性校验） */
  sha512: string;
  /** 文件大小（字节） */
  size: number;
}

/** 元数据顶层结构（对应 electron-builder 生成的 YAML） */
interface Metadata {
  version: string;
  releaseDate: string;
  files: MetadataFile[];
}

class IncrUpdater {
  /** 各平台 electron-builder 解压后的临时目录名（用于 cleanCache 清理） */
  tmpAppDirs: string[];
  /** asar.unpack 目录的标准名称（在 zip 中需要保持此路径层级） */
  asarUnpackedString: string;

  constructor() {
    this.tmpAppDirs = ['mac', 'mac-arm64', 'win-unpacked', 'win-ia32-unpacked', 'linux-unpacked'];
    this.asarUnpackedString = 'app.asar.unpacked';
  }

  /**
   * 增量更新入口
   *
   * @param options - CLI 选项（config 配置文件路径、asarFile asar 包路径、
   *                  platform 目标平台、force 是否强制更新）
   */
  async run(options: UpdaterOptions = {}): Promise<void> {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform, force } = options;
    const binCfg = loadConfig(config);
    const cfg = binCfg.updater;
    const forceUpdate = force === 'true';

    if (!cfg || !platform) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: updater config or platform does not exist`));
      return;
    }

    await this.generateFile(cfg, asarFile, platform, forceUpdate);

    console.log('[ee-bin] [updater] End');
  }

  /**
   * 生成增量更新包 — 核心逻辑
   *
   * 完整步骤：
   *   1. 查找平台对应的 updater 配置
   *   2. 读取 metadata YAML 获取版本号和文件列表
   *   3. 确定 asar 文件路径（CLI 参数优先，其次配置中的 asarFile）
   *   4. 生成平台+版本命名的 zip 包
   *   5. 将 asar + extraResources + asarUnpacked 模块添加到 zip
   *   6. 计算 zip 的 SHA1 和完整包的 SHA512
   *   7. 验证 SHA512 与 metadata 一致
   *   8. 写入 JSON 元数据文件
   *   9. 可选清理临时目录
   */
  async generateFile(config: Record<string, UpdaterConfig>, asarFile: string | undefined, platform: string, force = false): Promise<void> {
    const cfg = config[platform];
    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${platform} config does not exist`));
      return;
    }

    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green(`${platform} config:`), cfg);

    // 读取 metadata YAML（electron-builder 生成的版本信息文件）
    const metadataPath = path.join(homeDir, cfg.metadata);
    if (!fs.existsSync(metadataPath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${metadataPath} does not exist!`));
      return;
    }
    const metadataObj = yaml.load(fs.readFileSync(metadataPath, 'utf8')) as Metadata;

    // 确定 asar 文件路径：CLI --asar-file 参数优先，其次配置中的 asarFile
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
    // 平台名转换：配置键名可能用下划线（如 mac_arm64），文件名用连字符（如 mac-arm64）
    let platformForFilename = platform;
    if (platform.includes('_')) {
      const platformArr = platform.split('_');
      platformForFilename = platformArr.join('-');
    }

    // 生成 zip 文件名：模板名-平台-版本.zip（如 updater-mac-arm64-1.0.0.zip）
    const extZip = '.zip';
    const zipName = path.basename(cfg.output.zip, extZip) + `-${platformForFilename}-${version}${extZip}`;
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    if (fs.existsSync(asarZipPath)) {
      fs.rmSync(asarZipPath, { recursive: true, force: true });
    }

    // 创建 zip 压缩包
    const zipStream = new compressZip.Stream();
    // 首先添加 asar 包本身（增量更新需要完整 asar 文件）
    zipStream.addEntry(asarFilePath, { relativePath: path.basename(asarFilePath) });

    // 添加额外资源文件（如 native 模块、配置文件等）
    if (cfg.extraResources && cfg.extraResources.length > 0) {
      const files = globby.sync(cfg.extraResources, { cwd: homeDir });
      for (const extraRes of files) {
        const extraResPath = path.normalize(path.join(homeDir, extraRes));
        if (!fs.existsSync(extraResPath)) {
          continue;
        }
        // 保留 extraResources 路径层级（从 'extraResources/' 开始的相对路径）
        const extraResDir = path.dirname(extraResPath);
        const index = extraResDir.indexOf('extraResources');
        const zipFileDir = extraResDir.substring(index).replace(/\\/g, '/');
        zipStream.addEntry(extraResPath, { relativePath: zipFileDir + '/' + path.basename(extraResPath) });
      }
    }

    // 添加 asarUnpacked 模块（native 模块必须以独立文件存在，不能打包进 asar）
    if (cfg.asarUnpacked && cfg.asarUnpacked.length > 0) {
      const modules = cfg.asarUnpacked;
      for (const moduleItem of modules) {
        const modulePath = path.normalize(path.join(homeDir, moduleItem));
        if (!fs.existsSync(modulePath)) {
          throw new Error(`${modulePath} is not exists!`);
        }

        // 保持 app.asar.unpacked/ 路径层级（Electron 加载 native 模块时会在此路径查找）
        const zipDir = path.join(this.asarUnpackedString, moduleItem).replace(/\\/g, '/');
        this._addFolderToZip(zipStream, modulePath, zipDir);
      }
    }

    // 将 zip 写入磁盘
    const writeStream = fs.createWriteStream(asarZipPath);
    zipStream.pipe(writeStream);
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // 计算 hash：zip 用 SHA1（快速校验），完整包用 SHA512（强校验）
    const zipSha1 = this.generateHash(asarZipPath, 'sha1', 'hex');
    const fileStat = fs.statSync(asarZipPath);

    // 从 metadata 中找到完整安装包的文件条目（跳过已有的 .zip 条目）
    let fullFileInfo: MetadataFile | undefined;
    for (const item of metadataObj.files) {
      if (item.url.includes('.zip')) {
        continue;
      }
      fullFileInfo = item;
    }

    if (!fullFileInfo) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red('Error: fullFileInfo not found in metadata'));
      return;
    }

    // 验证 SHA512：确保本地完整包的 hash 与 metadata 记录一致
    // 若不一致说明完整包被篡改或损坏，增量更新无法基于它生成
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

    // 构建并写入增量更新 JSON 元数据
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
    // JSON 文件名：模板名-平台.json（如 updater-mac-arm64.json）
    const jsonName = path.basename(cfg.output.file, extJson) + `-${platformForFilename}${extJson}`;
    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    writeJsonSync(updaterJsonFilePath, item);

    // 可选清理：删除各平台的 electron-builder 临时解压目录
    if (cfg.cleanCache) {
      for (const dir of this.tmpAppDirs) {
        const dirPath = path.join(homeDir, cfg.output.directory, dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
    }
  }

  /** 递归添加文件夹内容到 zip 压缩流 */
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
   * 计算文件的加密 hash
   *
   * @param filepath - 文件路径（空路径或文件不存在时抛错而非静默返回空值，
   *                   避免空 hash 写入更新元数据导致客户端校验失败）
   * @param algorithm - hash 算法（默认 sha512）
   * @param encoding - 输出编码（默认 base64，sha1 时使用 hex）
   * @returns hash 字符串
   * @throws filepath 为空或文件不存在时抛出 Error
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