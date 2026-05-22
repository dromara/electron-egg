#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const PKG_PATH = path.join(ROOT, 'package.json');

function generateExports() {
  const subdirs = fs.readdirSync(SRC_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const exports = {
    '.': {
      import: {
        types: './dist/esm/index.d.ts',
        default: './dist/esm/index.js',
      },
      require: {
        types: './dist/cjs/index.d.ts',
        default: './dist/cjs/index.js',
      },
    },
  };

  for (const name of subdirs) {
    // exact path: ./log -> dist/{cjs,esm}/log/index.js
    exports[`./${name}`] = {
      import: {
        types: `./dist/esm/${name}/index.d.ts`,
        default: `./dist/esm/${name}/index.js`,
      },
      require: {
        types: `./dist/cjs/${name}/index.d.ts`,
        default: `./dist/cjs/${name}/index.js`,
      },
    };
    // wildcard: ./log/* -> dist/{cjs,esm}/log/*.js
    exports[`./${name}/*`] = {
      import: {
        types: `./dist/esm/${name}/*.d.ts`,
        default: `./dist/esm/${name}/*.js`,
      },
      require: {
        types: `./dist/cjs/${name}/*.d.ts`,
        default: `./dist/cjs/${name}/*.js`,
      },
    };
  }

  exports['./package.json'] = './package.json';
  return exports;
}

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
pkg.exports = generateExports();
fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');

console.log('exports generated successfully');