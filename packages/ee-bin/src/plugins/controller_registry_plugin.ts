import { Plugin, PluginBuild } from 'esbuild';
import globby from 'globby';
import path from 'path';

interface RegistryEntry {
  fullpath: string;
  properties: string[];
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
 * esbuild plugin that generates a controller registry at build time.
 *
 * How it works:
 * 1. onStart: scans electron/controller/ directory for .js and .jsc files
 * 2. onResolve: intercepts virtual module "app:controller-registry"
 * 3. onLoad: generates code that require()'s each controller and sets global.__EE_CONTROLLER_REGISTRY__
 * 4. onResolve/onLoad for "app:bundle-entry": generates the virtual entry point
 *    that first loads the registry, then requires the real main.js
 */
export function controllerRegistryPlugin(
  controllerDir: string,
  mainJsPath: string,
): Plugin {
  return {
    name: 'controller-registry',
    setup(build: PluginBuild) {
      let registryEntries: RegistryEntry[] = [];

      build.onStart(() => {
        const files = globby.sync(['**/*.js', '**/*.jsc'], { cwd: controllerDir });
        registryEntries = files.map((filepath) => ({
          fullpath: 'controller/' + filepath.replace(/\\/g, '/'),
          properties: computeProperties(filepath),
          relPath: filepath,
        }));
      });

      // Virtual module: controller registry
      build.onResolve({ filter: /^app:controller-registry$/ }, (args) => {
        return { path: args.path, namespace: 'controller-registry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'controller-registry' }, () => {
        const lines: string[] = ['// Auto-generated controller registry - do not edit'];
        // Use lazy getters so controllers are not loaded until the registry is actually read.
        // This avoids initialization order issues (e.g. services calling getConfig() before ElectronEgg runs).
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

      // Virtual module: bundle entry point
      build.onResolve({ filter: /^app:bundle-entry$/ }, (args) => {
        return { path: args.path, namespace: 'bundle-entry' };
      });

      build.onLoad({ filter: /.*/, namespace: 'bundle-entry' }, () => {
        const mainRelative = './' + path.basename(mainJsPath);
        const contents = [
          '// Auto-generated bundle entry - do not edit',
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
