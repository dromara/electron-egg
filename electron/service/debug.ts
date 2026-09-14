/**
 * 目录探查调试工具
 *
 * 用途：在真机（如鸿蒙 PC）上没有文件管理器权限查看应用安装目录时，
 * 由应用自己打印「运行时关键路径」与「安装包目录树」。
 *
 * 输出两份：
 * 1. 逐行 logger.info（进应用日志）
 * 2. {logDir}/dirs-tree.txt（完整树形文件，方便从沙箱取出查看）
 *
 * 用完可删：从 preload 中移除 printEnvTree() 调用即可。
 */
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { app } from 'electron';
import { logger } from 'ee-core/log';
import {
  getBaseDir,
  getExecDir,
  getDataDir,
  getLogDir,
  getExtraResourcesDir,
} from 'ee-core/ps';

interface TreeOptions {
  /** 最大递归深度，默认 6 */
  maxDepth?: number;
  /** 跳过的目录名（不递归，仅标注），默认跳过 node_modules/.git */
  skipDirs?: string[];
}

/**
 * 递归构建目录树（纯文本），单个目录读取失败不中断整体
 */
function buildTree(
  dir: string,
  prefix: string,
  depth: number,
  lines: string[],
  opt: Required<TreeOptions>,
): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    lines.push(`${prefix}[读取失败: ${e instanceof Error ? e.message : e}]`);
    return;
  }

  // 目录在前、文件在后，各自按名称排序
  entries.sort((a, b) => {
    const da = a.isDirectory() ? 0 : 1;
    const db = b.isDirectory() ? 0 : 1;
    return da - db || a.name.localeCompare(b.name);
  });

  entries.forEach((ent, i) => {
    const last = i === entries.length - 1;
    const label = ent.isDirectory() ? `${ent.name}/` : ent.name;
    lines.push(`${prefix}${last ? '└── ' : '├── '}${label}`);

    if (!ent.isDirectory()) return;

    const childPrefix = prefix + (last ? '    ' : '│   ');
    if (opt.skipDirs.includes(ent.name)) {
      lines.push(`${childPrefix}... (skipped)`);
      return;
    }
    if (depth + 1 >= opt.maxDepth) {
      lines.push(`${childPrefix}... (depth limit)`);
      return;
    }
    buildTree(path.join(dir, ent.name), childPrefix, depth + 1, lines, opt);
  });
}

/**
 * 打印任意目录的树形结构（逐行进日志 + 落盘到 logDir）
 */
export function printTree(root: string, options: TreeOptions = {}): string[] {
  const opt: Required<TreeOptions> = {
    maxDepth: options.maxDepth ?? 6,
    skipDirs: options.skipDirs ?? ['node_modules', '.git'],
  };
  const lines: string[] = [root];
  buildTree(root, '', 1, lines, opt);

  lines.forEach((line) => logger.info(`[dirs] ${line}`));
  try {
    const file = path.join(getLogDir(), 'dirs-tree.txt');
    fs.appendFileSync(file, lines.join('\n') + '\n\n', 'utf-8');
  } catch (e) {
    logger.info('[dirs] write dirs-tree.txt failed:', e instanceof Error ? e.message : e);
  }
  return lines;
}

/**
 * 打印运行时关键路径 + 应用安装包目录树
 *
 * 鸿蒙真机上 exe 位于：
 *   /data/storage/el1/bundle/electron/resources/resfile/electron
 * 截取到 /bundle 即官方文档中的「应用安装包目录」（沙箱视图）。
 */
export function printEnvTree(): void {
  // 1) 关键路径
  const roots = {
    exe: app.getPath('exe'),
    home: app.getPath('home'),
    appData: app.getPath('appData'),
    userData: app.getPath('userData'),
    temp: app.getPath('temp'),
    baseDir: getBaseDir(),
    execDir: getExecDir(),
    dataDir: getDataDir(),
    logDir: getLogDir(),
    extraResourcesDir: getExtraResourcesDir(),
  };
  Object.keys(roots).forEach((k) => {
    logger.info(`[dirs] ${k}: ${String(roots[k as keyof typeof roots])}`);
  });

  // 2) 安装包根目录：优先取沙箱 bundle 视图，否则退回 exe 所在目录
  const exePath = roots.exe;
  const idx = exePath.indexOf('/bundle');
  const bundleRoot = idx >= 0 ? exePath.slice(0, idx + '/bundle'.length) : path.dirname(exePath);
  logger.info(`[dirs] bundleRoot: ${bundleRoot}`);
  printTree(bundleRoot, { maxDepth: 7 });
}

function errMsg(e: unknown): string {
  return e instanceof Error ? `${e.code ? e.code + ' ' : ''}${e.message}` : String(e);
}

/**
 * 尝试执行一个二进制，返回一句结论（不抛异常）。
 * - error: <EACCES/ENOEXEC...>  表示内核拒绝
 * - 存活 > waitMs  表示成功拉起（随即被 SIGKILL 回收）
 * - 提前退出但无 error 事件  表示 exec 本身成功，只是程序自行退出
 */
function probeSpawn(bin: string, args: string[], waitMs = 2500): Promise<string> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (r: string) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };
    let child;
    try {
      child = spawn(bin, args, { stdio: 'ignore' });
    } catch (e) {
      done(`sync-throw: ${errMsg(e)}`);
      return;
    }
    child.once('error', (err) => done(`error: ${errMsg(err)}`));
    child.once('exit', (code, signal) =>
      done(`exec-ok but process exited early (code=${code} signal=${signal})`),
    );
    setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {
        /* ignore */
      }
      done('exec-ok (stayed alive)');
    }, waitMs);
  });
}

/**
 * 执行权限探针：定位 goapp 在鸿蒙上 spawn EACCES 的具体原因
 *
 * 三个证据：
 * 1. /proc/mounts 里 bundle 与 data 分区的挂载选项（是否 noexec）
 * 2. goapp 在 bundle 路径下的权限位 + 直接 spawn 结果
 * 3. 把 goapp 复制到可写 userData 目录、chmod 0755 后再 spawn 的结果
 *
 * 用完可删。
 */
export async function probeGoExec(): Promise<void> {
  // 证据 1：挂载选项
  try {
    const mounts = fs.readFileSync('/proc/mounts', 'utf-8');
    const relevant = mounts
      .split('\n')
      .filter((l) => /bundle|resfile|\/data(\s|$)|el1|el2|\/mnt\/data/.test(l));
    logger.info(`[exec-probe] /proc/mounts (relevant lines):\n${relevant.join('\n')}`);
  } catch (e) {
    logger.info(`[exec-probe] read /proc/mounts failed: ${errMsg(e)}`);
  }

  const src = path.join(getExtraResourcesDir(), 'goapp');

  // 证据 2：bundle 路径下的权限位 + 直接执行
  let srcMode = 'stat失败';
  let srcOk = false;
  try {
    const st = fs.statSync(src);
    srcMode = (st.mode & 0o777).toString(8);
    srcOk = true;
    logger.info(`[exec-probe] bundle goapp mode=${srcMode} size=${st.size} path=${src}`);
  } catch (e) {
    logger.info(`[exec-probe] stat bundle goapp failed: ${errMsg(e)}`);
  }
  if (srcOk) {
    const r = await probeSpawn(src, ['--port=7099']);
    logger.info(`[exec-probe] spawn from bundle path      -> ${r}`);
  }

  // 证据 3：复制到可写 userData 目录后执行
  try {
    const dstDir = path.join(app.getPath('userData'), 'exec-probe');
    const dst = path.join(dstDir, 'goapp');
    fs.mkdirSync(dstDir, { recursive: true });
    fs.copyFileSync(src, dst);
    fs.chmodSync(dst, 0o755);
    logger.info(`[exec-probe] copied to writable dir: ${dst} (mode=${(fs.statSync(dst).mode & 0o777).toString(8)})`);
    const r = await probeSpawn(dst, ['--port=7099']);
    logger.info(`[exec-probe] spawn from userData    -> ${r}`);
    try {
      fs.rmSync(dstDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  } catch (e) {
    logger.info(`[exec-probe] userData copy failed: ${errMsg(e)}`);
  }

  // 证据 4：HNP 释放路径（安装时系统签名，XPM 应放行；版本目录需与 script/ohos-hnp.js 一致）
  try {
    const home = process.env.HNP_PRIVATE_HOME || '/data/app';
    const physical = path.join(home, 'goapp.org', 'goapp_1.0', 'bin', 'goapp', 'goapp');
    const link = path.join(home, 'bin', 'goapp'); // hnp.json 声明的软链接（调试可用，上架受限）
    logger.info(`[exec-probe] HNP_PRIVATE_HOME=${String(process.env.HNP_PRIVATE_HOME)}`);
    for (const [label, bin] of [
      ['hnp physical', physical],
      ['hnp symlink ', link],
    ] as const) {
      if (fs.existsSync(bin)) {
        logger.info(`[exec-probe] ${label} found: ${bin} (mode=${(fs.statSync(bin).mode & 0o777).toString(8)})`);
        const r = await probeSpawn(bin, ['--port=7099']);
        logger.info(`[exec-probe] spawn ${label} -> ${r}`);
      } else {
        logger.info(`[exec-probe] ${label} NOT found: ${bin}`);
      }
    }
  } catch (e) {
    logger.info(`[exec-probe] hnp probe failed: ${errMsg(e)}`);
  }
}
