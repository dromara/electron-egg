/**
 * 本地辅助工具 — 替代不必要的 npm 依赖
 *
 * 本模块用轻量本地实现替代了四个 npm 包，降低依赖体积和安全风险：
 *   - is-type-of → is.function / is.class（仅用到两个判断）
 *   - chalk → 基于 ANSI 转义码的彩色输出（8 种颜色足够）
 *   - fs-extra → copyDirSync 递归目录复制（仅需这一个方法）
 *   - debug → createDebug 基于 DEBUG 环境变量的调试日志（带缓存优化）
 *
 * 另外提供 formatCmds 命令字符串解析工具。
 */

import fs from 'fs';
import path from 'path';

// ─── 类型判断（替代 is-type-of）────────────────────────────

export const is = {
  function(val: unknown): boolean {
    return typeof val === 'function';
  },
  /**
   * 判断值是否为 ES6 class
   * 通过 toString 检查源码是否以 'class ' 开头，并验证 prototype 属性存在，
   * 双重检查避免普通函数误判（箭头函数和 bound 函数没有 prototype）
   */
  class(val: unknown): boolean {
    return typeof val === 'function' && val.toString().startsWith('class ') && !!val.prototype;
  },
};

// ─── 彩色输出（替代 chalk，基于 ANSI 转义码）───────────────

const RESET = '\x1b[0m';

/** 用 ANSI 转义码包裹文本：前缀颜色码 + 内容 + 重置码 */
function ansi(code: string, text: string): string {
  return code + text + RESET;
}

/** 最小化 chalk 替代，提供 ee-bin 日志所需的 8 种颜色 */
export const chalk = {
  blue: (text: string) => ansi('\x1b[34m', text),
  green: (text: string) => ansi('\x1b[32m', text),
  red: (text: string) => ansi('\x1b[31m', text),
  cyan: (text: string) => ansi('\x1b[36m', text),
  magenta: (text: string) => ansi('\x1b[35m', text),
  yellow: (text: string) => ansi('\x1b[33m', text),
  bgRed: (text: string) => ansi('\x1b[41m', text),
  bgYellow: (text: string) => ansi('\x1b[43m', text),
};

// ─── 递归目录复制（替代 fs-extra）───────────────────────────

/**
 * 同步复制文件或目录
 * 自动判断 src 类型：文件直接复制，目录递归复制所有内容
 */
export function copyDirSync(src: string, dest: string): void {
  if (fs.statSync(src).isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return;
  }
  _copyDirRecursive(src, dest);
}

/** 递归复制目录内容（内部实现） */
function _copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      _copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── 调试日志（替代 debug npm 包）─────────────────────────────

/**
 * 创建命名空间调试日志函数
 *
 * 基于 process.env.DEBUG 环境变量控制输出：
 *   - DEBUG=*        → 启用所有命名空间
 *   - DEBUG=ee-bin:* → 启用所有 ee-bin 子命名空间
 *   - DEBUG=ee-bin:serve → 仅启用 serve 命名空间
 *
 * 带缓存优化：仅在 DEBUG 环境变量发生变化时重新计算启用状态，
 * 避免每次日志调用都重新解析 env 字符串
 */
export function createDebug(namespace: string): (...args: unknown[]) => void {
  let cachedDebugEnv: string | undefined;
  let cachedEnabled = false;

  const checkEnabled = () => {
    const currentEnv = process.env.DEBUG;
    if (currentEnv !== cachedDebugEnv) {
      cachedDebugEnv = currentEnv;
      const dbg = currentEnv || '';
      cachedEnabled = dbg === '*' || dbg.split(',').some((ns) => {
        if (ns.endsWith(':*')) return namespace.startsWith(ns.slice(0, -1));
        return ns === namespace;
      });
    }
    return cachedEnabled;
  };

  return (...args: unknown[]) => {
    if (checkEnabled()) {
      console.log(namespace, ...args);
    }
  };
}

// ─── 命令字符串解析 ──────────────────────────────────────────

/**
 * 解析逗号分隔的命令字符串为命令数组
 *
 * 处理规则：
 *   - 空字符串 → []
 *   - 无逗号 → 单元素数组
 *   - 有逗号 → 拆分后 trim 每项并过滤空值
 *     例: "frontend, electron" → ["frontend", "electron"]
 *     例: "frontend,,electron" → ["frontend", "electron"]
 */
export function formatCmds(command: string): string[] {
  const cmdString = command.trim();
  if (cmdString === '') return [];
  if (cmdString.includes(',')) {
    return cmdString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [cmdString];
}