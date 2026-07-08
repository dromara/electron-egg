// Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import LogUtil from '../utils/LogUtil';

const TAG = 'CommandLineAdapter';

export class CommandLineAdapter {
  private static readonly INSTANCE: CommandLineAdapter = new CommandLineAdapter();
  private args: Array<string> = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): CommandLineAdapter {
    return CommandLineAdapter.INSTANCE;
  }

  /**
   * Initialize command line
   */
  public init(): void {
    this.args = this.buildDefaultArgs();
  }

  /**
   * Check if a switch exists
   * @param switchName The switch name to check
   * @returns true if the switch exists, false otherwise
   */
  public hasSwitch(switchName: string): boolean {
    const switchArg = `--${switchName}`;
    return this.args.some(arg => arg === switchArg || arg.startsWith(`${switchArg}=`));
  }

  /**
   * Get value of a switch
   * @param switchName The switch name to get value for
   * @returns The switch value or empty string if not found
   */
  public getSwitchValue(switchName: string): string {
    const switchArg = `--${switchName}`;
    for (const arg of this.args) {
      if (arg.startsWith(`${switchArg}=`)) {
        return arg.substring(switchArg.length + 1);
      }
    }
    return this.args.includes(switchArg) ? '' : '';
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
    const switchArg = `--${switchName}`;
    if (value !== undefined) {
      this.appendArg(`${switchArg}=${value}`);
      LogUtil.debug(TAG, `Appended switch --${switchName}=${value}`);
    } else {
      this.appendArg(switchArg);
      LogUtil.debug(TAG, `Appended switch --${switchName}`);
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
    this.args.push(arg);
    LogUtil.debug(TAG, `Appended argument: ${arg}`);
  }

  /**
   * Remove a switch from command line
   * @param switchName The switch name to remove
   */
  public removeSwitch(switchName: string): void {
    const switchArg = `--${switchName}`;
    this.args = this.args.filter(arg =>
    arg !== switchArg && !arg.startsWith(`${switchArg}=`)
    );
    LogUtil.debug(TAG, `Removed switch --${switchName}`);
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
      "--force-renderer-accessibility=basic",
      "--disable-gpu-watchdog",
      "--disable-features=EnableDrDc",
    ];
    return vec_args;
  }
}