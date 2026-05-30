/**
 * ee-bin 配置类型定义
 *
 * 定义了 ee-bin CLI 工具的完整配置体系类型。配置层级为：
 *   BinConfig（顶层）→ ExecConfig / BuildConfig / MoveConfig / EncryptConfig / UpdaterConfig（各子配置）
 *
 * 用户通过 `./cmd/bin.js` 提供自定义配置，ee-bin 会将其与 bin_default.ts 中的默认配置
 * 通过 extend() 深合并，生成最终的 BinConfig 实例。
 */

/** 命令执行配置 — 定义单个子进程的启动参数 */
export interface ExecConfig {
  /** 进程工作目录（相对于项目根目录） */
  directory: string;
  /** 要执行的命令，如 'npm'、'electron'、'electron-builder' */
  cmd: string;
  /** 命令参数数组 */
  args?: string[];
  /** 子进程 stdio 模式，默认 'inherit'（直接输出到终端） */
  stdio?: 'inherit' | 'pipe' | 'ignore';
  /** 是否同步执行。同步模式会阻塞直到命令完成，结果不存入 execProcess */
  sync?: boolean;
  /** 前端服务协议，用于开发模式判断是否跳过（'file://' 时跳过前端启动） */
  protocol?: string;
  /** 是否监听文件变化并自动重启（仅 dev 模式下 electron 支持） */
  watch?: boolean;
  /** watch 模式下的防抖延迟（毫秒），避免短时间内多次重建 */
  delay?: number;
  /** 前端开发服务器主机名 */
  hostname?: string;
  /** 前端开发服务器端口 */
  port?: number;
  /** 前端首页文件名 */
  indexPath?: string;
  /** 是否强制刷新页面 */
  force?: boolean;
  /** Electron 加载页路径（启动时先显示加载页再跳转主页） */
  loadingPage?: string;
}

/** esbuild 打包配置 — 控制 Electron 主进程代码的打包行为 */
export interface BundleConfig {
  /** 打包模式：'bundle' 用 esbuild 打包为单文件，'copy' 直接复制整个目录 */
  bundleType?: 'bundle' | 'copy';
  /** 用户自定义的 esbuild external 包名列表（框架 external 由 _bundleWithRegistry 自动添加） */
  external?: string[];
  /** sourcemap 配置：
   *  - false/undefined: 自动模式（dev→inline, prod→off）
   *  - 'inline': 强制内联 sourcemap
   *  - 'external': 生成独立 .map 文件
   *  - true: 等同于 'inline'
   */
  sourcemap?: boolean | 'inline' | 'external';
  /** 是否压缩代码（生产环境建议启用） */
  minify?: boolean;
  /** 移除指定语句类型：'console' 删除 console.*，'debugger' 删除 debugger 语句 */
  drop?: ('console' | 'debugger')[];
  /** minify 时是否保留函数/类名（便于调试） */
  keepNames?: boolean;
  /** 许可证注释处理方式：'inline' 保留在代码中，'eof' 移到文件末尾，'none' 删除 */
  legalComments?: 'inline' | 'eof' | 'none';
  /** 编译时常量定义，如 { 'process.env.CUSTOM': '"value"' } */
  define?: Record<string, string>;
  /** 需要从 electron/ 目录额外复制到打包输出的文件或目录列表（如 'assets'、'data/db.json'） */
  copy?: string[];
  /** 输出格式：'cjs' 推荐用于 Electron 主进程，'esm' 要求所有业务代码为 ESM 兼容 */
  format?: 'cjs' | 'esm';
}

/** javascript-obfuscator 混淆选项 — 对应 javascript-obfuscator 库的配置参数 */
export interface ConfusionOptions {
  compact?: boolean;
  stringArray?: boolean;
  /** 字符串数组编码阈值（0~1，1 表示所有字符串都进入数组） */
  stringArrayThreshold?: number;
  /** 字符串数组编码方式：'none' 不编码，'base64' Base64 编码，'rc4' RC4 加密 */
  stringArrayEncoding?: Array<'none' | 'base64' | 'rc4'>;
  stringArrayCallsTransform?: boolean;
  deadCodeInjection?: boolean;
  numbersToExpressions?: boolean;
  /** 混淆目标运行环境：'browser' 用于前端代码，'node' 用于 Node.js/Electron 代码 */
  target?: 'browser' | 'node';
  silent?: boolean;
}

/** bytenode 字节码编译选项 — 对应 bytenode.compileFile() 的参数 */
export interface BytecodeOptions {
  /** 输入源文件路径（默认由 encrypt 自动设置） */
  filename?: string;
  /** 输出 .jsc 文件路径（默认为 filename + 'c'） */
  output?: string;
  /** 是否为 Electron 环境编译（启用 V8 字节码兼容） */
  electron?: boolean;
}

/** 加密配置 — 定义某个目标（frontend 或 electron）的加密策略 */
export interface EncryptConfig {
  /** 加密类型：
   *  - 'confusion': 仅混淆（javascript-obfuscator）
   *  - 'bytecode': 仅字节码（bytenode，仅 electron 支持）
   *  - 'strict': 混淆 + 字节码组合
   *  - 'none': 不加密（跳过处理）
   */
  type: 'confusion' | 'bytecode' | 'strict' | 'none';
  /** globby 匹配模式，指定要加密的文件路径（如 ['./public/electron/**/*.js']） */
  files?: string[];
  /** 仅处理这些扩展名的文件（默认 ['.js']） */
  fileExt?: string[];
  /** 需要单独使用 confusion 模式加密的文件（即使全局配置是 bytecode，这些文件仍用混淆） */
  specificFiles?: string[];
  /** 加密完成后要清理的目录路径 */
  cleanFiles?: string[];
  /** 加密操作的基准目录（默认 './'，即项目根目录） */
  encryptDir?: string;
  confusionOptions?: ConfusionOptions;
  bytecodeOptions?: BytecodeOptions;
}

/** 资源移动配置 — 定义文件/目录的源路径和目标路径
 *  src 和 dest 为必填项，因为移动操作必须明确方向
 */
export interface MoveConfig {
  /** 源路径（相对于项目根目录） */
  src: string;
  /** 目标路径（相对于项目根目录） */
  dest: string;
  /** 替代 src 的路径（若设置则优先使用 dist 而非 src） */
  dist?: string;
  /** 替代 dest 的路径（若设置则优先使用 target 而非 dest） */
  target?: string;
}

/** 增量更新配置 — 定义增量更新包的生成参数 */
export interface UpdaterConfig {
  /** metadata YAML 文件路径（包含版本号、releaseDate、files 等信息） */
  metadata: string;
  /** asar 包文件路径（可被 CLI --asar-file 参数覆盖） */
  asarFile?: string;
  /** 输出配置 */
  output: {
    /** 输出目录 */
    directory: string;
    /** zip 文件名模板（自动追加平台和版本后缀） */
    zip: string;
    /** JSON 元数据文件名模板（自动追加平台后缀） */
    file: string;
  };
  /** 需要打包进 zip 的额外资源 glob 模式列表 */
  extraResources?: string[];
  /** 要从 asarUnpacked 打包进 zip 的原生模块列表 */
  asarUnpacked?: string[];
  /** 是否在生成后清理各平台临时解压目录 */
  cleanCache?: boolean;
}

/** 构建配置 — build 段的顶层结构
 *  electron 键固定为 BundleConfig（打包配置），
 *  其他键（frontend、win32、win64 等）为 ExecConfig（命令执行配置）。
 *  索引签名含 undefined 以允许未定义的键。
 */
export interface BuildConfig {
  /** Electron 主进程打包配置（唯一必须为 BundleConfig 的键） */
  electron: BundleConfig;
  [key: string]: ExecConfig | BundleConfig | undefined;
}

/** ee-bin 顶层配置 — 对应 ./cmd/bin.js 的完整结构 */
export interface BinConfig {
  /** 开发模式配置（各子命令如 frontend、electron） */
  dev: Record<string, ExecConfig>;
  /** 构建配置（electron 为 BundleConfig，其他为 ExecConfig） */
  build: BuildConfig;
  /** 资源移动配置（如前端 dist → public/dist） */
  move: Record<string, MoveConfig>;
  /** 生产启动配置 */
  start: ExecConfig;
  /** 加密配置（frontend 和 electron 各有独立策略） */
  encrypt: Record<string, EncryptConfig>;
  /** 自定义命令配置 */
  exec: Record<string, ExecConfig>;
  /** 增量更新配置（可选，按平台配置） */
  updater?: Record<string, UpdaterConfig>;
}