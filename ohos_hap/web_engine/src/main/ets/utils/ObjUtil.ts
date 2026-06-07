// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export default class ObjUtil {
  public static isInvalid(obj): boolean {
    return obj === undefined || obj === null;
  }
}