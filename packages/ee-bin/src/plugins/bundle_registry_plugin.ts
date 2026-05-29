import { Plugin, PluginBuild } from 'esbuild';
import globby from 'globby';
import path from 'path';

interface RegistryEntry {
  fullpath: string;
  properties: string[];
  relPath: string;
}

interface ConfigEntry {
  filename: string;
  relPath: string;
}

/**
 * Compute properties from filepath, replicating getProperties() + defaultCamelize() with caseStyle: 'lower'.
 * e.g. "foo/bar.js" => ["foo", "bar"]
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
 * esbuild plugin that generates registries at build time for controllers and config.
 *
 * How it works:
 * 1. onStart: scans electron/controller/ and electron/config/ directories
 * 2. onResolve/onLoad for "app:controller-registry": generates controller registry
 * 3. onResolve/onLoad for "app:config-registry": generates config registry
 * 4. onResolve/onLoad for "app:bundle-entry": generates the virtual entry point
 *    that loads both registries, then requires the real main.js
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

      build.onStart(() => {
        const controllerFiles = globby.sync(['**/*.js', '**/*.jsc'], { cwd: controllerDir });
        registryEntries = controllerFiles.map((filepath) => ({
          fullpath: 'controller/' + filepath.replace(/\\/g, '/'),
          properties: computeProperties(filepath),
          relPath: filepath,
        }));

        const configFiles = globby.sync(['**/*.js', '**/*.jsc'], { cwd: configDir });
        configEntries = configFiles.map((filepath) => ({
          filename: filepath.replace(/\\/g, '/').substring(0, filepath.lastIndexOf('.')),
          relPath: filepath,
        }));
      });

      // Virtual module: controller registry
      build.onResolve({ filter: /^app:controller-registry$/ }, (args) => {
        return { path: args.path, namespace: 'controller-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'controller-registry' }, () => {
        const lines: string[] = ['// Auto-generated controller registry - do not edit'];
        lines.push('global.__EE_CONTROLLER_REGISTRY__ = [');
        for (let i = 0; i < registryEntries.length; i++) {
          const entry = registryEntries[i]!;
          const requirePath = './' + entry.relPath.replace(/\\/g, '/');
          const comma = i < registryEntries.length - 1 ? ',' : '';
          lines.push(`  { fullpath: '${entry.fullpath}', properties: ${JSON.stringify(entry.properties)}, get module() { return require('${requirePath}'); } }${comma}`);
        }
        lines.push('];');

        return {
          contents: lines.join('\n'),
          loader: 'js',
          resolveDir: controllerDir,
        };
      });

      // Virtual module: config registry
      build.onResolve({ filter: /^app:config-registry$/ }, (args) => {
        return { path: args.path, namespace: 'config-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'config-registry' }, () => {
        const lines: string[] = ['// Auto-generated config registry - do not edit'];
        lines.push('global.__EE_CONFIG_REGISTRY__ = [');
        for (let i = 0; i < configEntries.length; i++) {
          const entry = configEntries[i]!;
          const requirePath = './' + entry.relPath.replace(/\\/g, '/');
          const comma = i < configEntries.length - 1 ? ',' : '';
          lines.push(`  { filename: '${entry.filename}', get module() { return require('${requirePath}'); } }${comma}`);
        }
        lines.push('];');

        return {
          contents: lines.join('\n'),
          loader: 'js',
          resolveDir: configDir,
        };
      });

      // Virtual module: bundle entry point
      build.onResolve({ filter: /^app:bundle-entry$/ }, (args) => {
        return { path: args.path, namespace: 'bundle-entry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'bundle-entry' }, () => {
        const mainRelative = './' + path.basename(mainJsPath);
        const contents = [
          '// Auto-generated bundle entry - do not edit',
          `require('app:config-registry');`,
          `require('app:controller-registry');`,
          `require('${mainRelative}');`,
        ].join('\n');

        return {
          contents,
          loader: 'js',
          resolveDir: path.dirname(mainJsPath),
        };
      });
    },
  };
}