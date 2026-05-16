// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export default class CheckEmptyUtils {
  /**
   * Check obj is empty.
   *
   * @param {any} obj
   * @return {boolean} true(empty)
   */
  static isEmpty(obj: any): boolean {
    return (typeof obj === 'undefined' || obj === null || obj === '');
  }

  /**
   * Check str is empty.
   *
   * @param {string} str
   * @return {boolean} true(empty)
   */
  static checkStrIsEmpty(str: string): boolean {
    return str === undefined || str === null || str.trim().length === 0;
  }

  /**
   * Check array is empty.
   *
   * @param {Array} arr An array to check if is empty.
   * @return {boolean} true(empty)
   */
  static isEmptyArr<T>(arr: T[]): boolean {
    return arr === undefined || arr === null || arr.length === 0;
  }
};
