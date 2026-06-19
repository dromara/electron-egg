/**
 * Ohos Resource Extraction Module — copies build artifacts to HarmonyOS HAP resource directories
 *
 * This module implements the "ohos" command, which extracts Electron build artifacts
 * and copies them to HarmonyOS (ohos) HAP resource directories. It follows electron-builder's
 * extraResources FileSet pattern (from/to/filter) for flexible resource selection.
 *
 * Process:
 *   1. Load configuration and read the ohos.resources section
 *   2. For each resource entry, validate source path exists
 *   3. Use globbySync with filter patterns to select files (supports negation like "!compiled")
 *   4. Copy each matched file preserving directory structure
 *   5. Use atomic backup strategy (backup old dest → copy new → delete backup)
 */

import path from 'path';
import fs from 'fs';
import { globbySync } from 'globby';
import { chalk } from '../lib/helpers.js';
import { loadConfig, rm } from '../lib/utils.js';
import type { OhosResourceConfig } from '../types/config.js';

const homeDir = process.cwd();

/** Ohos command CLI options */
interface OhosOptions {
  /** Path to custom bin.js config file */
  config?: string;
}

/**
 * Copy a single resource entry from source to destination with glob filtering
 *
 * Filter patterns follow electron-builder's FileSet convention:
 *   - "**\/*" matches all files (default if filter is not specified)
 *   - "!pattern" excludes matching files (e.g. "!compiled" excludes the compiled directory)
 *
 * Atomic copy strategy (same as move command):
 *   1. If destination already exists, rename it to a .bak backup
 *   2. Copy source files to destination
 *   3. Delete the .bak backup
 * This ensures the old destination is preserved until the new copy succeeds.
 */
function copyResource(resConfig: OhosResourceConfig, index: number, total: number): void {
  const srcPath = path.join(homeDir, resConfig.from);
  const destPath = path.join(homeDir, resConfig.to);
  const filterPatterns = resConfig.filter || ['**/*'];

  // Validate source exists
  if (!fs.existsSync(srcPath)) {
    console.log(chalk.blue('[ee-bin] [ohos] ') + chalk.yellow(`Warning: source path does not exist: ${resConfig.from}, skipping`));
    return;
  }

  console.log(chalk.blue('[ee-bin] [ohos] ') + `Resource [${index + 1}/${total}]`);
  console.log(chalk.blue('[ee-bin] [ohos] ') + `from: ${resConfig.from}`);
  console.log(chalk.blue('[ee-bin] [ohos] ') + `to: ${resConfig.to}`);
  console.log(chalk.blue('[ee-bin] [ohos] ') + `filter: ${JSON.stringify(filterPatterns)}`);

  // Get file list matching filter patterns
  const files = globbySync(filterPatterns, {
    cwd: srcPath,
    onlyFiles: true,
  });

  if (files.length === 0) {
    console.log(chalk.blue('[ee-bin] [ohos] ') + chalk.yellow('Warning: no files matched the filter patterns'));
    return;
  }

  console.log(chalk.blue('[ee-bin] [ohos] ') + `Matched ${files.length} files`);

  // Atomic copy: backup old destination → copy new → delete backup
  const backupDest = destPath + '.bak';
  if (fs.existsSync(destPath)) {
    // Remove any leftover backup from a previous failed run
    if (fs.existsSync(backupDest)) rm(backupDest);
    // Rename current destination as backup
    fs.renameSync(destPath, backupDest);
  }

  // Copy each matched file, preserving directory structure
  try {
    let copied = 0;
    for (const relFile of files) {
      const srcFile = path.join(srcPath, relFile);
      const destFile = path.join(destPath, relFile);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(srcFile, destFile);
      copied++;
    }
    console.log(chalk.blue('[ee-bin] [ohos] ') + `Copied ${copied} files`);
  } catch (copyErr) {
    // Restore backup on copy failure to avoid leaving broken state
    if (fs.existsSync(backupDest)) {
      if (fs.existsSync(destPath)) rm(destPath);
      fs.renameSync(backupDest, destPath);
      console.log(chalk.blue('[ee-bin] [ohos] ') + chalk.yellow('Copy failed, restored previous destination'));
    }
    throw copyErr;
  }

  // Clean up backup (old destination) after successful copy
  if (fs.existsSync(backupDest)) {
    rm(backupDest);
  }

  console.log(chalk.blue('[ee-bin] [ohos] ') + `Extracted to: ${resConfig.to}`);
}

/**
 * Execute ohos resource extraction
 *
 * Iterates over the ohos.resources array, copying files from each source path
 * to the corresponding destination path using glob filter patterns.
 *
 * @param options - CLI options (config file path)
 */
export function ohos(options: OhosOptions = {}): void {
  console.log(chalk.blue('[ee-bin] [ohos] ') + 'Start extracting resources');

  const { config } = options;
  const binCfg = loadConfig(config);
  const ohosConfig = binCfg.ohos;

  if (!ohosConfig || !ohosConfig.resources || !Array.isArray(ohosConfig.resources)) {
    console.log(chalk.blue('[ee-bin] [ohos] ') + chalk.red('Error: ohos.resources config does not exist'));
    return;
  }

  const resources = ohosConfig.resources;
  const total = resources.length;

  for (let i = 0; i < total; i++) {
    const res = resources[i];
    if (!res) continue;
    copyResource(res, i, total);
  }

  console.log(chalk.blue('[ee-bin] [ohos] ') + 'End');
}
