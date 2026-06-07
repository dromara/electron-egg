// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export class GlobalContext {
  private static instance: GlobalContext;
  private _objects = new Map<string, Object>();

  public static getInstance(): GlobalContext {
    if (GlobalContext.instance == null) {
      GlobalContext.instance = new GlobalContext();
    }
    return GlobalContext.instance;
  }

  public getObject(key: string): Object | undefined {
    let result = this._objects.get(key);
    return result;
  }

  public hasObject(key: string): boolean {
    return this._objects.has(key);
  }

  public setObject(key: string, objectClass: Object): void {
    this._objects.set(key, objectClass);
  }
}