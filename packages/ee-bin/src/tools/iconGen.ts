/**
 * Application Icon Generator — produces platform-specific icons from a source image
 *
 * This module generates all required icon formats for Electron applications:
 *   - .ico files for Windows (installer + taskbar)
 *   - .png files at various sizes for Linux, tray icons, and window icons
 *   - Renamed/copyed icons following electron-egg naming conventions
 *
 * Icon generation flow:
 *   1. Load optional "icon-gen" dependency (graceful error if not installed)
 *   2. Validate input image exists and prepare output directory
 *   3. Generate icons via icon-gen library (ico + favicon/png sizes)
 *   4. Post-process: rename and copy icons to match the framework's expected paths:
 *      - 16px → copied to public/images/ as "tray.png" (system tray icon)
 *      - 32px → copied to public/images/ with original name (window icon)
 *      - Other sizes → renamed to "NxN.png" format in build/icons/
 *
 * Dependencies:
 *   - icon-gen: Optional npm package for icon generation. If not installed,
 *     a helpful message is displayed with install instructions.
 */

import fs from 'fs';
import path from 'path';

/** Parameters controlling icon generation, derived from CLI options with defaults */
interface IconGenParams {
  /** Path to the source image file (typically a high-resolution PNG) */
  input: string;
  /** Output directory for generated icon files */
  output: string;
  /** Comma-separated list of sizes to generate (e.g. "16,32,64,256,512") */
  size: string;
  /** Whether to clear the output directory before generating */
  clear: boolean;
  /** Directory for Windows window icon and tray images (typically /public/images/) */
  imagesDir: string;
}

/** Default parameter values when no CLI options are provided */
const DEFAULT_PARAMS: IconGenParams = {
  input: '/public/images/logo.png',
  output: '/build/icons/',
  size: '16,32,64,256,512',
  clear: false,
  imagesDir: '/public/images/',
};

class IconGen {
  /** Resolved CLI parameters (defaults + user overrides) */
  params: IconGenParams;
  /** Absolute path to the source image */
  input: string;
  /** Absolute path to the output directory */
  output: string;
  /** Absolute path to the images directory (for tray/window icons) */
  imagesDir: string;
  /** icon-gen library options (ico sizes, favicon png sizes, etc.) */
  iconOptions: Record<string, unknown>;
  /** Loaded icon-gen module function (null if the package is not installed) */
  icongen: ((input: string, output: string, options?: Record<string, unknown>) => Promise<string[]>) | null;

  constructor(params: IconGenParams) {
    this.params = params;

    // Attempt to load icon-gen as an optional dependency.
    // If not installed, set to null and provide a helpful message later.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional dependency lazy load
      const mod = require('icon-gen');
      this.icongen = typeof mod.default === 'function' ? mod.default : mod;
    } catch {
      this.icongen = null;
    }

    console.log('[ee-bin] [icon-gen] Current working directory: ', process.cwd());
    this.input = path.join(process.cwd(), params.input);
    this.output = path.join(process.cwd(), params.output);
    this.imagesDir = path.join(process.cwd(), params.imagesDir);

    // Parse comma-separated size string into integer array for icon-gen
    const sizeList = params.size.split(',').map((item) => parseInt(item, 10));
    this.iconOptions = {
      report: false,
      ico: {
        name: 'icon',
        sizes: [256],
      },
      favicon: {
        name: 'logo-',
        pngSizes: sizeList,
      },
    };
  }

  /**
   * Generate all icon files from the source image
   *
   * Steps:
   *   1. Check icon-gen is available; if not, show install instructions
   *   2. Validate input image exists
   *   3. Prepare output directory (create if missing, optionally clear)
   *   4. Run icon-gen to produce ico + png files
   *   5. Post-process: rename and copy icons to framework-expected paths
   */
  async generateIcons(): Promise<void> {
    if (!this.icongen) {
      console.log('[ee-bin] [icon-gen] icon-gen is not installed.');
      console.log('[ee-bin] [icon-gen] Please run: pnpm add icon-gen');
      return;
    }

    console.log('[ee-bin] [icon-gen] Start generating logo images');
    // Validate that the source image file exists
    if (!fs.existsSync(this.input)) {
      console.error('[ee-bin] [icon-gen] Input: ', this.input);
      throw new Error('Input image does not exist or path is invalid: ' + this.input);
    }
    // Ensure output directory exists
    if (!fs.existsSync(this.output)) {
      fs.mkdirSync(this.output, { recursive: true });
    } else {
      // Optionally clear existing icons before generating new ones
      if (this.params.clear) {
        this.deleteGenFile(this.output);
      }
    }
    // Ensure images directory exists (for tray/window icon copies)
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
    try {
      const results = await this.icongen(this.input, this.output, this.iconOptions);
      console.log('[ee-bin] [icon-gen] Generated image resources:');
      console.log(results);
      // Rename/copy icons to match electron-egg naming conventions
      this._renameForEE(results);
    } catch (err) {
      console.error(err);
      throw new Error('[ee-bin] [icon-gen] Image generation failed!');
    }
  }

  /**
   * Delete generated icon files (.ico, .png) from a directory recursively
   *
   * Only removes files with .ico or .png extensions; leaves other files and
   * empty directories intact. This is used when --clear flag is set to start
   * with a clean output directory.
   *
   * @param dirPath - Directory to scan for icon files to delete
   */
  deleteGenFile(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteGenFile(curPath);
        } else {
          // Only delete icon files (.ico, .png), preserve other files
          if (['.ico', '.png'].includes(path.extname(curPath))) {
            fs.unlinkSync(curPath);
          }
        }
      }
    }
  }

  /**
   * Post-process generated icons — rename and copy to framework-expected paths
   *
   * electron-egg naming conventions:
   *   - 16px icon → copy to public/images/ as "tray.png" (system tray icon)
   *   - 32px icon → copy to public/images/ with original name (window icon)
   *   - Other sizes → rename to "NxN.png" format in build/icons/ (e.g. "64x64.png")
   *
   * The icon-gen library generates files with a "logo-" prefix (from favicon.name config),
   * e.g. "logo-16.png", "logo-32.png", "logo-256.png". This method transforms those
   * names into the framework's expected format.
   *
   * @param filesPath - Array of file paths generated by icon-gen
   */
  private _renameForEE(filesPath: string[]): void {
    console.log('[ee-bin] [icon-gen] Start renaming logo image resources');
    try {
      for (const filePath of filesPath) {
        const extname = path.extname(filePath);
        if (['.png'].includes(extname)) {
          const filename = path.basename(filePath, extname);
          // Extract the size number from the filename (e.g. "logo-16" → "16")
          const basename = filename.split('-')[1];
          const dirname = path.dirname(filePath);

          if (basename === '16') {
            // 16px icon → tray icon (used in system tray / notification area)
            const newName = 'tray' + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} copied successfully!`);
            fs.unlinkSync(filePath);
            continue;
          }

          if (basename === '32') {
            // 32px icon → window icon (used for the app window title bar)
            const newName = filename + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} copied successfully!`);
            continue;
          }

          // Other sizes → rename to "NxN.png" format (e.g. 64x64.png, 256x256.png)
          // This is the standard naming convention for Electron icon sets
          const newName = basename + 'x' + basename + extname;
          const newPath = path.join(dirname, newName);
          fs.renameSync(filePath, newPath);
          console.log(`${filename}${extname} --> ${newName} renamed successfully!`);
        }
      }
      console.log('[ee-bin] [icon-gen] Image resource processing completed!');
    } catch (e) {
      console.error('[ee-bin] [icon-gen] ERROR: ', e);
      throw new Error('Renaming logo image resources failed!');
    }
  }
}

/**
 * Extract IconGenParams from CLI options, applying defaults for missing values
 *
 * @param opts - Raw CLI options object from Commander
 * @returns Fully resolved IconGenParams with defaults applied
 */
function extractParams(opts: Record<string, unknown>): IconGenParams {
  return {
    input: (opts.input as string) || DEFAULT_PARAMS.input,
    output: (opts.output as string) || DEFAULT_PARAMS.output,
    size: (opts.size as string) || DEFAULT_PARAMS.size,
    clear: opts.clear === true,
    imagesDir: (opts.images as string) || DEFAULT_PARAMS.imagesDir,
  };
}

/**
 * Icon generation entry function
 *
 * @param opts - CLI options (input, output, size, clear, images)
 */
export async function run(opts?: Record<string, unknown>): Promise<void> {
  const params = extractParams(opts || {});
  const i = new IconGen(params);
  await i.generateIcons();
}
