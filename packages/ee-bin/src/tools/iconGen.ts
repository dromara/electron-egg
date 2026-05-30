import fs from 'fs';
import path from 'path';

interface IconGenParams {
  input: string;
  output: string;
  size: string;
  clear: boolean;
  imagesDir: string;
}

const DEFAULT_PARAMS: IconGenParams = {
  input: '/public/images/logo.png',
  output: '/build/icons/',
  size: '16,32,64,256,512',
  clear: false,
  imagesDir: '/public/images/',
};

class IconGen {
  params: IconGenParams;
  input: string;
  output: string;
  imagesDir: string;
  iconOptions: Record<string, unknown>;
  icongen: ((input: string, output: string, options?: Record<string, unknown>) => Promise<string[]>) | null;

  constructor(params: IconGenParams) {
    this.params = params;

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

  async generateIcons(): Promise<void> {
    if (!this.icongen) {
      console.log('[ee-bin] [icon-gen] icon-gen is not installed.');
      console.log('[ee-bin] [icon-gen] Please run: pnpm add icon-gen');
      return;
    }

    console.log('[ee-bin] [icon-gen] Start generating logo images');
    if (!fs.existsSync(this.input)) {
      console.error('[ee-bin] [icon-gen] Input: ', this.input);
      throw new Error('Input image does not exist or path is invalid: ' + this.input);
    }
    if (!fs.existsSync(this.output)) {
      fs.mkdirSync(this.output, { recursive: true });
    } else {
      if (this.params.clear) {
        this.deleteGenFile(this.output);
      }
    }
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
    try {
      const results = await this.icongen(this.input, this.output, this.iconOptions);
      console.log('[ee-bin] [icon-gen] Generated image resources:');
      console.log(results);
      this._renameForEE(results);
    } catch (err) {
      console.error(err);
      throw new Error('[ee-bin] [icon-gen] Image generation failed!');
    }
  }

  deleteGenFile(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteGenFile(curPath);
        } else {
          if (['.ico', '.png'].includes(path.extname(curPath))) {
            fs.unlinkSync(curPath);
          }
        }
      }
    }
  }

  private _renameForEE(filesPath: string[]): void {
    console.log('[ee-bin] [icon-gen] Start renaming logo image resources');
    try {
      for (const filePath of filesPath) {
        const extname = path.extname(filePath);
        if (['.png'].includes(extname)) {
          const filename = path.basename(filePath, extname);
          const basename = filename.split('-')[1];
          const dirname = path.dirname(filePath);

          if (basename === '16') {
            const newName = 'tray' + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} copied successfully!`);
            fs.unlinkSync(filePath);
            continue;
          }

          if (basename === '32') {
            const newName = filename + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} copied successfully!`);
            continue;
          }

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

function extractParams(opts: Record<string, unknown>): IconGenParams {
  return {
    input: (opts.input as string) || DEFAULT_PARAMS.input,
    output: (opts.output as string) || DEFAULT_PARAMS.output,
    size: (opts.size as string) || DEFAULT_PARAMS.size,
    clear: opts.clear === true,
    imagesDir: (opts.images as string) || DEFAULT_PARAMS.imagesDir,
  };
}

export async function run(opts?: Record<string, unknown>): Promise<void> {
  const params = extractParams(opts || {});
  const i = new IconGen(params);
  await i.generateIcons();
}