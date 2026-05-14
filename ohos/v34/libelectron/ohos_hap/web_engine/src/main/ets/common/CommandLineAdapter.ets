// Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import LogUtil from '../utils/LogUtil';

const TAG = 'CommandLineAdapter';

export class CommandLineAdapter {
  private static readonly UNSUPPORTED_ARGS: string[] = [
    '--disable-renderer-backgrounding',
    '--host-rules',
    '--no-stdio-init',
    '--force_high_performance_gpu',
    '--force_low_power_gpu',
    '--xdg-portal-required-version',
    '--experimental-network-inspection',
    '--diagnostic-dir',
  ];
  private static readonly INSTANCE: CommandLineAdapter = new CommandLineAdapter();
  private args: Array<string> = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): CommandLineAdapter {
    return CommandLineAdapter.INSTANCE;
  }

  /**
   * Initialize command line. Clears any previously appended args and
   * re-populates the default argument list. Private because calling this
   * after startup would discard user-appended switches.
   */
  private init(): void {
    this.args = [];
    this.appendArgs(this.buildDefaultArgs());
  }

  /**
   * Check if a switch exists
   * @param switchName The switch name to check
   * @returns true if the switch exists, false otherwise
   */
  public hasSwitch(switchName: string): boolean {
    const switchArg = `--${switchName.replace(/^--/, '')}`;
    return this.args.some(arg => arg === switchArg || arg.startsWith(`${switchArg}=`));
  }

  /**
   * Get value of a switch
   * @param switchName The switch name to get value for
   * @returns The switch value or empty string if not found
   */
  public getSwitchValue(switchName: string): string {
    const switchArg = `--${switchName.replace(/^--/, '')}`;
    for (const arg of this.args) {
      if (arg.startsWith(`${switchArg}=`)) {
        return arg.substring(switchArg.length + 1);
      }
    }
    return '';
  }

  /**
   * Get all command line arguments
   * @returns Array of command line arguments
   */
  public getArgs(): Array<string> {
    return [...this.args];
  }

  /**
   * Append a switch to command line
   * @param switchName The switch name to append
   * @param value Optional value for the switch
   */
  public appendSwitch(switchName: string, value?: string): void {
    const switchArg = `--${switchName.replace(/^--/, '')}`;
    if (value !== undefined) {
      this.appendArg(`${switchArg}=${value}`);
    } else {
      this.appendArg(switchArg);
    }
  }

  /**
   * Append multiple switches to command line
   * @param switches Map of switch names and their values
   */
  public appendSwitches(switches: Map<string, string>): void {
    switches.forEach((value: string, key: string) => {
      this.appendSwitch(key, value);
    });
  }

  /**
   * Append multiple arguments to command line
   * @param args Array of arguments to append
   */
  public appendArgs(args: Array<string>): void {
    args.forEach(arg => this.appendArg(arg));
  }

  /**
   * Append a single argument to command line
   * @param arg Argument to append
   */
  public appendArg(arg: string): void {
    this.warnIfUnsupported(arg);
    this.args.push(arg);
    LogUtil.debug(TAG, `Appended argument: ${arg}`);
  }

  /**
   * Remove a switch from command line
   * @param switchName The switch name to remove
   */
  public removeSwitch(switchName: string): void {
    const switchArg = `--${switchName.replace(/^--/, '')}`;
    this.args = this.args.filter(arg =>
      arg !== switchArg && !arg.startsWith(`${switchArg}=`)
    );
    LogUtil.debug(TAG, `Removed switch ${switchArg}`);
  }

  /**
   * Prints warning if the given argument is unsupported in the current
   * HarmonyOS Electron version.
   * @param arg A single command line argument (e.g. "--host-rules=xxx").
   */
  private warnIfUnsupported(arg: string): void {
    const argKey = arg.split('=')[0];
    if (CommandLineAdapter.UNSUPPORTED_ARGS.includes(argKey)) {
      LogUtil.warn(TAG,
        `Unsupported commandLine parameter detected: "${argKey}". ` +
        `It may be invalid or cause exceptions in the current version of HarmonyOS Electron.`);
    }
  }

  /**
   * Build default command line arguments
   * @returns Array of default command line arguments
   */
  private buildDefaultArgs(): Array<string> {
    let vec_args = [
      "electron",
      "--use-gl=egl",
      "--enable-features=UseOzonePlatform",
      "--ozone-platform=ohos",
      "--enable-logging",
      "--ozone-dump-file=/data/storage/el2/base/cache/",
      "--no-zygote",
      "--user-data-dir=/data/storage/el2/base/files/",
      "--force-renderer-accessibility=complete",
      "--disable-gpu-watchdog",
      "--disable-features=EnableDrDc",
    ];
    return vec_args;
  }
}
