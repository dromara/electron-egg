// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import window from '@ohos.window';
import { injectable } from 'inversify';

interface ISystemFloatingWindowParams {
  id: string,
  window: window.Window
}

@injectable()
export class SystemFloatingWindowManager {
  private storage: Map<string, (ISystemFloatingWindowParams)[]> =
    new Map<string, (ISystemFloatingWindowParams)[]>();

  private paramNormalization(abilityId: string | number): string {
    if (typeof abilityId === 'number') {
      return 'browser' + abilityId;
    }
    return abilityId;
  }

  public addSystemFloatingWindow(abilityId: string | number,
    data: ISystemFloatingWindowParams) {
    let id = this.paramNormalization(abilityId);
    let windows = this.storage.get(id);
    if (windows) {
      windows.push(data);
    } else {
      this.storage.set(id, [data]);
    }
  }

  public removeSystemFloatingWindow(abilityId: string | number,
    systemFloatingWindowId: string | number) {
    let id = this.paramNormalization(abilityId);
    let windows = this.storage.get(id);
    if (windows) {
      for (let i = 0; i < windows.length; i++) {
        if (windows[i].id === this.paramNormalization(systemFloatingWindowId)) {
          windows.splice(i, 1);
        }
      }
    }
  }

  public getMainWindowId(windowId: string | number): string | undefined {
    let id = this.paramNormalization(windowId);
    for (let key of this.storage.keys()) {
      let value = this.storage.get(key);
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (id === value[i].id) {
            return key;
          }
        }
      }
    }
    return undefined;
  }

  public getWindow(windowId: string | number): window.Window | undefined {
    let id = this.paramNormalization(windowId);
    for (let key of this.storage.keys()) {
      let value = this.storage.get(key);
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (id === value[i].id) {
            return value[i].window;
          }
        }
      }
    }
    return undefined;
  }
};
