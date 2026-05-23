import fs from 'fs';
import path from 'path';
import icongen from 'icon-gen';

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

  constructor(opts: Record<string, unknown> = {}) {
    const params: IconGenParams = {
      input: (opts.input as string) || DEFAULT_PARAMS.input,
      output: (opts.output as string) || DEFAULT_PARAMS.output,
      size: (opts.size as string) || DEFAULT_PARAMS.size,
      clear: opts.clear === true,
      imagesDir: (opts.images as string) || DEFAULT_PARAMS.imagesDir,
    };
    this.params = params;

    console.log('[ee-bin] [icon-gen] icon 当前路径: ', process.cwd());
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

  generateIcons(): void {
    console.log('[ee-bin] [icon-gen] iconGen 开始处理生成logo图片');
    if (!fs.existsSync(this.input)) {
      console.error('[ee-bin] [icon-gen] input: ', this.input);
      throw new Error('输入的图片不存在或路径错误');
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
    icongen(this.input, this.output, this.iconOptions)
      .then((results) => {
        console.log('[ee-bin] [icon-gen] iconGen 已生成下方图片资源');
        console.log(results);
        this._renameForEE(results);
      })
      .catch((err) => {
        console.error(err);
        throw new Error('[ee-bin] [icon-gen] iconGen 生成失败!');
      });
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

  _renameForEE(filesPath: string[]): void {
    console.log('[ee-bin] [icon-gen] iconGen 开始重新命名logo图片资源');
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
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} 复制成功!`);
            fs.unlinkSync(filePath);
            continue;
          }

          if (basename === '32') {
            const newName = filename + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} 复制成功!`);
            continue;
          }

          const newName = basename + 'x' + basename + extname;
          const newPath = path.join(dirname, newName);
          fs.renameSync(filePath, newPath);
          console.log(`${filename}${extname} --> ${newName} 重命名成功!`);
        }
      }
      console.log('[ee-bin] [icon-gen] iconGen 资源处理完成!');
    } catch (e) {
      console.error('[ee-bin] [icon-gen] ERROR: ', e);
      throw new Error('重命名logo图片资源失败!!');
    }
  }
}

export function run(opts?: Record<string, unknown>): void {
  const i = new IconGen(opts || {});
  i.generateIcons();
}