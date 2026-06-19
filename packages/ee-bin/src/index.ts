#!/usr/bin/env node

/**
 * ee-bin CLI Entry Point
 *
 * This is the main entry point for the ee-bin command-line tool. It defines all
 * available CLI commands using the Commander.js framework and delegates execution
 * to the appropriate tool modules.
 *
 * Available commands:
 *   dev      - Start development mode (frontend dev server + Electron process)
 *   build    - Build multiple resources (frontend, Electron bundle, platform packages)
 *   start    - Start the application in production mode
 *   exec     - Execute user-defined custom commands
 *   move     - Move/copy resources (e.g. frontend dist to public directory)
 *   encrypt  - Apply code encryption (obfuscation and/or bytecode compilation)
 *   clean    - Remove encrypted output files
 *   icon     - Generate application icons from a source image
 *   updater  - Generate incremental update packages
 *
 * When invoked without any subcommand, the help text is displayed in green.
 */

import { program, Command } from 'commander';
import { chalk } from './lib/helpers.js';
import { serveProcess } from './tools/serve.js';
import { move } from './tools/move.js';
import { encrypt, cleanEncrypt } from './tools/encrypt.js';
import { incrUpdater } from './tools/incrUpdater.js';
import { run as iconGenRun } from './tools/iconGen.js';
import { ohos } from './tools/ohos.js';

program
  .name('ee-bin')
  .description('CLI for ee development')
  .version('5.0.0');

/**
 * dev command - Start development mode
 *
 * Launches both the frontend dev server and the Electron process concurrently.
 * In dev mode, Electron code is first bundled via esbuild, then the process
 * is spawned. Optionally enables file watching with auto-rebuild.
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 *   --serve <mode>     Comma-separated list of services to start (e.g. "frontend,electron")
 */
program
  .command('dev')
  .description('create frontend-serve and electron-serve')
  .option('--config <folder>', 'config file')
  .option('--serve <mode>', 'serve mode')
  .action(function (this: Command) {
    serveProcess.dev(this.opts());
  });

/**
 * build command - Build multiple resources
 *
 * Orchestrates the build pipeline: frontend build, Electron bundling, and
 * platform-specific packaging via electron-builder. The --cmds flag specifies
 * which build steps to execute (e.g. "frontend,electron,win64").
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 *   --cmds <flag>      Comma-separated build commands to execute
 *   --env <env>        Node environment (default: "prod")
 */
program
  .command('build')
  .description('building multiple resources')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .option('--env <env>', 'environment')
  .action(function (this: Command) {
    serveProcess.build(this.opts());
  });

/**
 * start command - Preview the production build
 *
 * Starts the Electron application in production mode (NODE_ENV=prod).
 * Assumes the project has already been built via the build command.
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 */
program
  .command('start')
  .description('preview effect')
  .option('--config <folder>', 'config file')
  .action(function (this: Command) {
    serveProcess.start(this.opts());
  });

/**
 * exec command - Execute user-defined custom commands
 *
 * Runs arbitrary commands defined in the "exec" section of the user's bin.js
 * configuration. Useful for project-specific scripts and tooling.
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 *   --cmds <flag>      Comma-separated command names to execute
 */
program
  .command('exec')
  .description('execute custom commands')
  .option('--config <folder>', 'config file')
  .option('--cmds <flag>', 'custom commands')
  .action(function (this: Command) {
    serveProcess.exec(this.opts());
  });

/**
 * move command - Move/copy resources between directories
 *
 * Copies files or directories as specified in the "move" section of bin.js.
 * Typically used to move frontend build output to the public directory
 * so Electron can load it.
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 *   --flag <flag>      Comma-separated move config keys to execute
 */
program
  .command('move')
  .description('Move multip resources')
  .option('--config <folder>', 'config file')
  .option('--flag <flag>', 'resource flag')
  .action(function (this: Command) {
    move(this.opts());
  });

/**
 * encrypt command - Apply code encryption
 *
 * Encrypts JavaScript files using obfuscation (javascript-obfuscator) and/or
 * bytecode compilation (bytenode). Processes both frontend and Electron targets
 * independently, each with its own encryption strategy.
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 *   --out <folder>     Output directory override (defaults to encryptDir from config)
 */
program
  .command('encrypt')
  .description('Code encryption')
  .option('--config <folder>', 'config file')
  .option('--out <folder>', 'output directory')
  .action(async function (this: Command) {
    await encrypt(this.opts());
  });

/**
 * clean command - Remove encrypted output files
 *
 * Deletes the directories containing encrypted/compiled output files,
 * restoring the project to its pre-encryption state.
 *
 * Options:
 *   -d, --dir <folder>  Directory to clean (defaults to "./public/electron")
 */
program
  .command('clean')
  .description('Clear the encrypted code')
  .option('-d, --dir <folder>', 'clean directory')
  .action(function (this: Command) {
    cleanEncrypt(this.opts());
  });

/**
 * icon command - Generate application icons
 *
 * Takes a source image (typically a PNG) and generates all required icon sizes
 * for the target platforms: .ico for Windows, .icns for macOS, and various
 * PNG sizes. Also produces tray icons and window icons for the Electron app.
 *
 * Options:
 *   -i, --input <file>   Source image file (default: /public/images/logo.png)
 *   -o, --output <folder> Output directory (default: /build/icons/)
 *   -s, --size <flag>     Comma-separated icon sizes (default: 16,32,64,256,512)
 *   -c, --clear          Clear output directory before generating
 *   -m, --images <flag>  Path for Win window icon/tray images (default: /public/images/)
 */
program
  .command('icon')
  .description('Generate logo')
  .option('-i, --input <file>', 'image file default /public/images/logo.png')
  .option('-o, --output <folder>', 'output directory default /build/icons/')
  .option('-s, --size <flag>', 'generate size default 16,32,64,256,512')
  .option('-c, --clear', 'clear output directory first')
  .option('-m, --images <flag>', 'Win window icon/tray image generation path default /public/images/')
  .action(async function (this: Command) {
    await iconGenRun(this.opts());
  });

/**
 * updater command - Generate incremental update packages
 *
 * Creates incremental update zip files containing only the changed files from
 * the asar package, along with JSON metadata for the update checker. Supports
 * per-platform configuration and optional full-update forcing.
 *
 * Options:
 *   --config <folder>      Path to custom bin.js config file
 *   --app-file <file>      Path to the app package file (asar or directory)
 *   --platform <flag>      Target platform (e.g. "macos_apple", "windows_64", "linux")
 *   --force <flag>         Force full update ("true" to enable)
 */
program
  .command('updater')
  .description('updater commands')
  .option('--config <folder>', 'config file')
  .option('--app-file <file>', 'app file path')
  .option('--platform <flag>', 'platform')
  .option('--force <flag>', 'force update full')
  .action(async function (this: Command) {
    await incrUpdater.run(this.opts());
  });

/**
 * ohos command - Extract build artifacts to HarmonyOS resource directory
 *
 * Copies files from the Electron build output to the ohos HAP resource directory,
 * following electron-builder's extraResources FileSet pattern (from/to/filter).
 * Supports glob filter patterns with negation (e.g. "!compiled" to exclude files).
 *
 * Options:
 *   --config <folder>  Path to custom bin.js config file
 */
program
  .command('ohos')
  .description('Extract build artifacts to ohos resource directory')
  .option('--config <folder>', 'config file')
  .action(function (this: Command) {
    ohos(this.opts());
  });

program.parse();

// Display help text in green when invoked with no subcommand
if (!process.argv.slice(2).length) {
  program.outputHelp((text: string) => {
    console.log(chalk.green(text));
    return text;
  });
}
