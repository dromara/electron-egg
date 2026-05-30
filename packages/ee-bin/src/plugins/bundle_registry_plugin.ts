/**
 * esbuild bundle-registry 插件 — 构建时生成控制器和配置注册表
 *
 * 本插件是 Electron 主进程打包的核心机制。它将分散在 electron/controller/ 和
 * electron/config/ 目录中的文件在构建时扫描并生成虚拟模块，确保打包后代码能
 * 正确找到所有控制器和配置模块，同时避免初始化顺序问题（lazy getter 设计）。
 *
 * 生成三个虚拟模块：
 *   1. app:controller-registry → 扫描 electron/controller/，生成 global.__EE_CONTROLLER_REGISTRY__
 *   2. app:config-registry     → 扫截 electron/config/，生成 global.__EE_CONFIG_REGISTRY__
 *   3. app:bundle-entry        → 虚拟入口点，按顺序加载：config 注册表 → controller 注册表 → main.js
 *
 * 加载顺序（config 先于 controller）的原因：
 *   ee-core 的 ConfigLoader._loadConfig() 需要 __EE_CONFIG_REGISTRY__ 来加载配置，
 *   而 ControllerLoader.load() 需要 __EE_CONTROLLER_REGISTRY__ 来加载控制器。
 *   配置加载发生在控制器加载之前（ElectronEgg 生命周期：loadConfig → loadController），
 *   所以注册表也必须按此顺序注入。
 *
 * 与 ee-core 的配合：
 *   - 打包模式（global.__EE_CONTROLLER_REGISTRY__ 存在）→ FileLoader.parseFromRegistry() 从注册表读取
 *   - 开发模式（注册表不存在）→ FileLoader 回退到 globby 文件系统扫描 + require()
 */

import { Plugin, PluginBuild } from 'esbuild';
import globby from 'globby';
import path from 'path';

/** 控制器注册条目 — 对应 electron/controller/ 下的每个文件 */
interface RegistryEntry {
  /** 完整路径标识，格式为 'controller/子目录/文件名'（用于 ee-core 匹配） */
  fullpath: string;
  /** 属性路径数组，经 camelize 转换后的层级标识（如 ["foo", "bar"]） */
  properties: string[];
  /** 相对路径（用于 require() 加载，相对于 controllerDir） */
  relPath: string;
}

/** 配置注册条目 — 对应 electron/config/ 下的每个文件 */
interface ConfigEntry {
  /** 文件名（不含扩展名），用于 ee-core ConfigLoader 按文件名查找配置 */
  filename: string;
  /** 相对路径（用于 require() 加载，相对于 configDir） */
  relPath: string;
}

/**
 * 从文件路径计算属性路径，复现 ee-core 的 getProperties() + defaultCamelize(caseStyle: 'lower')
 *
 * camelize 规则（caseStyle: 'lower' 表示首字母小写）：
 *   - 去除文件扩展名：'foo/bar.js' → 'foo/bar'
 *   - 按 '/' 拆分层级：'foo/bar' → ['foo', 'bar']
 *   - 每层做 camelCase 转换：下划线/连字符后的字母大写（'foo-bar' → 'fooBar'）
 *   - 首字母小写：'FooBar' → 'fooBar'
 *
 * 例：'foo_bar/my-controller.js' => ['fooBar', 'myController']
 */
function computeProperties(filepath: string): string[] {
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map((property) => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }
    const normalized = property.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    const first = normalized[0];
    if (!first) return normalized;
    return first.toLowerCase() + normalized.substring(1);
  });
}

/**
 * 创建 esbuild bundle-registry 插件
 *
 * @param controllerDir - electron/controller/ 目录的绝对路径
 * @param mainJsPath    - electron/main.js 或 main.ts 的绝对路径（入口文件）
 * @param configDir     - electron/config/ 目录的绝对路径
 */
export function bundleRegistryPlugin(
  controllerDir: string,
  mainJsPath: string,
  configDir: string,
): Plugin {
  return {
    name: 'bundle-registry',
    setup(build: PluginBuild) {
      let registryEntries: RegistryEntry[] = [];
      let configEntries: ConfigEntry[] = [];

      // 每次构建开始时重新扫描目录（支持 rebuild/watch 模式下文件增删）
      build.onStart(() => {
        const controllerFiles = globby.sync(['**/*.js', '**/*.jsc', '**/*.ts'], { cwd: controllerDir });
        registryEntries = controllerFiles.map((filepath) => ({
          fullpath: 'controller/' + filepath.replace(/\\/g, '/'),
          properties: computeProperties(filepath),
          relPath: filepath,
        }));

        const configFiles = globby.sync(['**/*.js', '**/*.jsc', '**/*.ts'], { cwd: configDir });
        configEntries = configFiles.map((filepath) => ({
          // filename 去除扩展名以匹配 ee-core ConfigLoader 的查找逻辑：
          // ConfigLoader 通过文件名（如 'default'）查找配置，不含 '.js' 扩展名
          filename: filepath.replace(/\\/g, '/').substring(0, filepath.lastIndexOf('.')),
          relPath: filepath,
        }));
      });

      // ─── 虚拟模块：controller 注册表 ────────────────────────────

      build.onResolve({ filter: /^app:controller-registry$/ }, (args) => {
        return { path: args.path, namespace: 'controller-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'controller-registry' }, () => {
        const lines: string[] = ['// Auto-generated controller registry - do not edit'];
        lines.push('global.__EE_CONTROLLER_REGISTRY__ = [');
        for (const [i, entry] of registryEntries.entries()) {
          const requirePath = JSON.stringify('./' + entry.relPath.replace(/\\/g, '/'));
          const comma = i < registryEntries.length - 1 ? ',' : '';
          // 使用 lazy getter（get module() { return require(...) })而非直接 require，
          // 避免注册表加载时就执行所有控制器模块（可能导致初始化顺序问题）。
          // ee-core 的 FileLoader.parseFromRegistry() 会在需要时才调用 getter 获取模块。
          lines.push(`  { fullpath: ${JSON.stringify(entry.fullpath)}, properties: ${JSON.stringify(entry.properties)}, get module() { return require(${requirePath}); } }${comma}`);
        }
        lines.push('];');

        return {
          contents: lines.join('\n'),
          loader: 'js',
          // resolveDir 设为 controllerDir，使 require() 路径相对于控制器目录解析
          resolveDir: controllerDir,
        };
      });

      // ─── 虚拟模块：config 注册表 ────────────────────────────────

      build.onResolve({ filter: /^app:config-registry$/ }, (args) => {
        return { path: args.path, namespace: 'config-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'config-registry' }, () => {
        const lines: string[] = ['// Auto-generated config registry - do not edit'];
        lines.push('global.__EE_CONFIG_REGISTRY__ = [');
        for (const [i, entry] of configEntries.entries()) {
          const requirePath = JSON.stringify('./' + entry.relPath.replace(/\\/g, '/'));
          const comma = i < configEntries.length - 1 ? ',' : '';
          // 同 controller 注册表，使用 lazy getter 避免立即加载配置模块
          lines.push(`  { filename: ${JSON.stringify(entry.filename)}, get module() { return require(${requirePath}); } }${comma}`);
        }
        lines.push('];');

        return {
          contents: lines.join('\n'),
          loader: 'js',
          resolveDir: configDir,
        };
      });

      // ─── 虚拟模块：bundle 入口点 ────────────────────────────────

      build.onResolve({ filter: /^app:bundle-entry$/ }, (args) => {
        return { path: args.path, namespace: 'bundle-entry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'bundle-entry' }, () => {
        const mainRelative = JSON.stringify('./' + path.basename(mainJsPath));
        // 加载顺序至关重要：config 注册表 → controller 注册表 → main.js
        // 因为 ee-core 的生命周期是 loadConfig → loadController → loadElectron，
        // 注册表必须在 main.js 执行前注入到 global 上
        const contents = [
          '// Auto-generated bundle entry - do not edit',
          `require('app:config-registry');`,
          `require('app:controller-registry');`,
          `require(${mainRelative});`,
        ].join('\n');

        return {
          contents,
          loader: 'js',
          // resolveDir 设为 main.js 所在目录，使 require(main.js) 能正确解析
          resolveDir: path.dirname(mainJsPath),
        };
      });
    },
  };
}