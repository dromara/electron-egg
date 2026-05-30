/**
 * Resource Move Module — copies files/directories between project locations
 *
 * This module handles the "move" command, which copies resources from one location
 * to another as defined in the bin.js configuration. The most common use case is
 * moving the frontend build output (dist/) to the public directory so Electron
 * can load it as static assets.
 *
 * Move process:
 *   1. Load configuration and parse the --flag option to determine which items to move
 *   2. For each flagged item, resolve source and destination paths
 *      (supports "dist"/"target" aliases that override "src"/"dest")
 *   3. Validate source exists; skip with warning if not found
 *   4. Perform an atomic-ish copy: backup existing destination → copy source → delete backup
 *      This prevents data loss if the copy fails partway through
 *
 * Note: Despite the name "move", this module performs copy operations (not file moves).
 * The original source files remain intact after the operation.
 */

import path from 'path';
import fs from 'fs';
import { chalk, copyDirSync, formatCmds } from '../lib/helpers.js';
import { loadConfig, rm } from '../lib/utils.js';

const homeDir = process.cwd();

/** Move command CLI options */
interface MoveOptions {
  /** Path to custom bin.js config file */
  config?: string;
  /** Comma-separated move config keys to execute (e.g. "frontend_dist") */
  flag?: string;
}

/**
 * Execute resource move operations
 *
 * Iterates over the comma-separated flag values, looks up each one in the
 * "move" section of the bin.js config, and copies the source to the destination.
 *
 * Path alias support:
 *   - If "dist" is set in config, it takes priority over "src"
 *   - If "target" is set in config, it takes priority over "dest"
 *   This allows users to override the default paths without modifying the base config.
 *
 * Atomic-ish copy strategy:
 *   1. If destination already exists, rename it to a .bak backup
 *   2. Copy source to destination
 *   3. Delete the .bak backup
 *   This ensures the old destination is preserved until the new copy succeeds.
 *
 * @param options - CLI options (config file path, flag string)
 */
export function move(options: MoveOptions = {}): void {
  console.log('[ee-bin] [move] Start moving resources');
  const { config, flag } = options;
  const binCfg = loadConfig(config);
  const moveConfig = binCfg.move;

  if (!moveConfig || !flag) {
    console.log(chalk.blue('[ee-bin] [move] ') + chalk.red('Error: move config or flag does not exist'));
    return;
  }

  // Parse comma-separated flag string into individual flag names
  const flags = formatCmds(flag.trim());

  for (const f of flags) {
    const cfg = moveConfig[f];

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config does not exist`));
      continue;
    }

    // Resolve source and destination: "dist"/"target" aliases override "src"/"dest"
    const { src, dest, dist, target } = cfg;
    const source = dist || src;
    const destination = target || dest;

    if (!source || !destination) {
      console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config missing src/dest`));
      continue;
    }

    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green(`Move flag: ${f}`));
    console.log(chalk.blue('[ee-bin] [move] ') + chalk.green('config:'), cfg);

    const srcResource = path.join(homeDir, source);
    // Skip if source doesn't exist (may happen if frontend hasn't been built yet)
    if (!fs.existsSync(srcResource)) {
      console.log(chalk.yellow('[ee-bin] [move] ') + `Warning: ${source} does not exist, skipping`);
      continue;
    }

    const destResource = path.join(homeDir, destination);
    // Atomic copy: backup old destination → copy new → delete backup
    const backupDest = destResource + '.bak';
    if (fs.existsSync(destResource)) {
      // Remove any leftover backup from a previous failed run
      if (fs.existsSync(backupDest)) rm(backupDest);
      // Rename current destination as backup
      fs.renameSync(destResource, backupDest);
    }

    // Copy source to destination
    copyDirSync(srcResource, destResource);

    // Clean up backup (old destination) after successful copy
    if (fs.existsSync(backupDest)) {
      rm(backupDest);
      console.log('[ee-bin] [move] Cleaned previous resources:', destResource);
    }

    console.log(`[ee-bin] [move] Copy ${srcResource} to ${destResource}`);
  }

  console.log('[ee-bin] [move] End');
}
