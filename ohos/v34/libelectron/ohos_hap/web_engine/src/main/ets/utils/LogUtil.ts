// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import hilog from '@ohos.hilog';

/**
 *  log package tool class
 */
export default class LogUtil {
  private static DOMAIN: number = 0x0000;
  private static TAG: string = '[WebEngine]';

  /**
   * print debug level log
   *
   * @param {string} tag - Page or class tag
   * @param {string} msg - Log needs to be printed
   */
  static debug(tag: string, msg: string): void {
    hilog.debug(LogUtil.DOMAIN, LogUtil.TAG, 'tag: %{public}s --> %{public}s', tag, msg);
  }

  /**
   * print info level log
   *
   * @param {string} tag - Page or class tag
   * @param {string} msg - Log needs to be printed
   */
  static info(tag: string, msg: string): void {
    hilog.info(LogUtil.DOMAIN, LogUtil.TAG, 'tag: %{public}s --> %{public}s', tag, msg);
  }

  /**
   * print warn level log
   *
   * @param {string} tag - Page or class tag
   * @param {string} msg - Log needs to be printed
   */
  static warn(tag: string, msg: string): void {
    hilog.warn(LogUtil.DOMAIN, LogUtil.TAG, 'tag: %{public}s --> %{public}s', tag, msg);
  }

  /**
   * print error level log
   *
   * @param {string} tag - Page or class tag
   * @param {string} msg - Log needs to be printed
   */
  static error(tag: string, msg: string): void {
    hilog.error(LogUtil.DOMAIN, LogUtil.TAG, 'tag: %{public}s --> %{public}s', tag, msg);
  }
}
