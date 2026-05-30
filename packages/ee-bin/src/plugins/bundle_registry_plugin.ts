/**
 * esbuild Bundle-Registry Plugin — generates controller and config registries at build time
 *
 * This plugin is the core mechanism for Electron main process bundling. It scans the
 * electron/controller/ and electron/config/ directories at build time and generates
 * virtual modules that register all controllers and config modules, ensuring the bundled
 * code can correctly locate them. The lazy getter design avoids initialization order issues.
 *
 * Three virtual modules are generated:
 *   1. app:controller-registry → Scans electron/controller/, generates global.__EE_CONTROLLER_REGISTRY__
 *   2. app:config-registry     → Scans electron/config/, generates global.__EE_CONFIG_REGISTRY__
 *   3. app:bundle-entry        → Virtual entry point that loads in order: config registry → controller registry → main.js
 *
 * Why config loads before controller:
 *   ee-core's ConfigLoader._loadConfig() needs __EE_CONFIG_REGISTRY__ to load configuration,
 *   and ControllerLoader.load() needs __EE_CONTROLLER_REGISTRY__ to load controllers.
 *   Config loading happens before controller loading (ElectronEgg lifecycle: loadConfig → loadController),
 *   so registries must be injected in this order as well.
 *
 * How it works with ee-core:
 *   - Bundle mode (global.__EE_CONTROLLER_REGISTRY__ exists) → FileLoader.parseFromRegistry() reads from the registry
 *   - Dev mode (registry absent) → FileLoader falls back to globby filesystem scanning + require()
 */

import { Plugin, PluginBuild } from 'esbuild';
import globby from 'globby';
import path from 'path';

/** Controller registry entry — corresponds to each file under electron/controller/ */
interface RegistryEntry {
  /** Full path identifier, format: 'controller/subdir/filename' (used by ee-core for matching) */
  fullpath: string;
  /** Property path array after camelize conversion (e.g. ["foo", "bar"]) */
  properties: string[];
  /** Relative path used for require() loading (relative to controllerDir) */
  relPath: string;
}

/** Config registry entry — corresponds to each file under electron/config/ */
interface ConfigEntry {
  /** Filename without extension, used by ee-core ConfigLoader to find config by name */
  filename: string;
  /** Relative path used for require() loading (relative to configDir) */
  relPath: string;
}

/**
 * Compute property paths from a file path, replicating ee-core's getProperties() + defaultCamelize(caseStyle: 'lower')
 *
 * Camelize rules (caseStyle: 'lower' means first character lowercase):
 *   - Remove file extension: 'foo/bar.js' → 'foo/bar'
 *   - Split by '/': 'foo/bar' → ['foo', 'bar']
 *   - Apply camelCase conversion per segment: letter after underscore/hyphen is uppercased ('foo-bar' → 'fooBar')
 *   - First character lowercase: 'FooBar' → 'fooBar'
 *
 * Example: 'foo_bar/my-controller.js' => ['fooBar', 'myController']
 */
function computeProperties(filepath: string): string[] {
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map((property) => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }
    // Convert underscore/hyphen separators to camelCase
    const normalized = property.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    const first = normalized[0];
    if (!first) return normalized;
    // Ensure first character is lowercase (caseStyle: 'lower')
    return first.toLowerCase() + normalized.substring(1);
  });
}

/**
 * Create the esbuild bundle-registry plugin
 *
 * @param controllerDir - Absolute path to the electron/controller/ directory
 * @param mainJsPath    - Absolute path to electron/main.js or main.ts (entry file)
 * @param configDir     - Absolute path to the electron/config/ directory
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

      // Re-scan directories at the start of each build (supports file additions/deletions in rebuild/watch mode)
      build.onStart(() => {
        const controllerFiles = globby.sync(['**/*.js', '**/*.jsc', '**/*.ts'], { cwd: controllerDir });
        registryEntries = controllerFiles.map((filepath) => ({
          fullpath: 'controller/' + filepath.replace(/\\/g, '/'),
          properties: computeProperties(filepath),
          relPath: filepath,
        }));

        const configFiles = globby.sync(['**/*.js', '**/*.jsc', '**/*.ts'], { cwd: configDir });
        configEntries = configFiles.map((filepath) => ({
          // Remove extension from filename to match ee-core ConfigLoader's lookup logic:
          // ConfigLoader finds config by name (e.g. 'default'), not including the '.js' extension
          filename: filepath.replace(/\\/g, '/').substring(0, filepath.lastIndexOf('.')),
          relPath: filepath,
        }));
      });

      // ─── Virtual module: controller registry ──────────────────────

      build.onResolve({ filter: /^app:controller-registry$/ }, (args) => {
        return { path: args.path, namespace: 'controller-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'controller-registry' }, () => {
        const lines: string[] = ['// Auto-generated controller registry - do not edit'];
        lines.push('global.__EE_CONTROLLER_REGISTRY__ = [');
        for (const [i, entry] of registryEntries.entries()) {
          const requirePath = JSON.stringify('./' + entry.relPath.replace(/\\/g, '/'));
          const comma = i < registryEntries.length - 1 ? ',' : '';
          // Use lazy getter (get module() { return require(...) }) instead of direct require()
          // to avoid executing all controller modules at registry load time, which could cause
          // initialization order issues. ee-core's FileLoader.parseFromRegistry() invokes the
          // getter only when the module is actually needed.
          lines.push(`  { fullpath: ${JSON.stringify(entry.fullpath)}, properties: ${JSON.stringify(entry.properties)}, get module() { return require(${requirePath}); } }${comma}`);
        }
        lines.push('];');

        return {
          contents: lines.join('\n'),
          loader: 'js',
          // Set resolveDir to controllerDir so require() paths resolve relative to the controller directory
          resolveDir: controllerDir,
        };
      });

      // ─── Virtual module: config registry ──────────────────────────

      build.onResolve({ filter: /^app:config-registry$/ }, (args) => {
        return { path: args.path, namespace: 'config-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'config-registry' }, () => {
        const lines: string[] = ['// Auto-generated config registry - do not edit'];
        lines.push('global.__EE_CONFIG_REGISTRY__ = [');
        for (const [i, entry] of configEntries.entries()) {
          const requirePath = JSON.stringify('./' + entry.relPath.replace(/\\/g, '/'));
          const comma = i < configEntries.length - 1 ? ',' : '';
          // Same as controller registry: use lazy getter to avoid loading config modules immediately
          lines.push(`  { filename: ${JSON.stringify(entry.filename)}, get module() { return require(${requirePath}); } }${comma}`);
        }
        lines.push('];');

        return {
          contents: lines.join('\n'),
          loader: 'js',
          resolveDir: configDir,
        };
      });

      // ─── Virtual module: bundle entry point ───────────────────────

      build.onResolve({ filter: /^app:bundle-entry$/ }, (args) => {
        return { path: args.path, namespace: 'bundle-entry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'bundle-entry' }, () => {
        const mainRelative = JSON.stringify('./' + path.basename(mainJsPath));
        // Load order is critical: config registry → controller registry → main.js
        // Because ee-core's lifecycle is loadConfig → loadController → loadElectron,
        // registries must be injected onto global before main.js executes
        const contents = [
          '// Auto-generated bundle entry - do not edit',
          `require('app:config-registry');`,
          `require('app:controller-registry');`,
          `require(${mainRelative});`,
        ].join('\n');

        return {
          contents,
          loader: 'js',
          // Set resolveDir to the directory containing main.js so require(main.js) resolves correctly
          resolveDir: path.dirname(mainJsPath),
        };
      });
    },
  };
}
