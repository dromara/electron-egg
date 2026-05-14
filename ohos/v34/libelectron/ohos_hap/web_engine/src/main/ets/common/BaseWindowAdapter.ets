// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject } from 'inversify';
import { common } from '@kit.AbilityKit';
import window from '@ohos.window';

import { BaseAdapter } from './BaseAdapter';
import { ContextAdapter } from '../adapter/ContextAdapter';
import { ChangeEventType, WindowPreferences } from '../interface/CommonInterface';
import { WebProxy } from '../interface/WebProxy';

export class BaseWindowAdapter extends BaseAdapter implements WebProxy {
  protected ctxAdapter: ContextAdapter;
  protected windowClass: window.Window | undefined = undefined;
  protected xcomponentId: string = '';
  protected originWindowId: number = -1;

  constructor(
    @inject(ContextAdapter) ctxAdapter: ContextAdapter
  ) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  initialize(xcomponentId: string, windowClass: window.Window) {
    this.xcomponentId = xcomponentId;
    this.windowClass = windowClass;
    this.originWindowId = windowClass.getWindowProperties().id;
  }

  // implements WebProxy interface
  getWindowStage(): window.WindowStage | undefined {
    return undefined;
  }

  getWindow(): window.Window | undefined {
    return this.windowClass;
  }

  getWindowContext(): common.Context | undefined {
    return this.ctxAdapter.getActiveContext();
  }

  getWindowId(): string {
    return this.xcomponentId;
  }

  getOriginWindowId(): number {
    return this.originWindowId;
  }

  setWindowTitle(title:string) {}

  isUIAbility(): boolean {
    return false;
  }

  setDeviceModeChangeEvent(deviceModeChangeEvent: ChangeEventType | undefined) {}

  createSubWindow(name: string): Promise<window.Window> {
    return new Promise<window.Window>((resolve, reject) => {
      reject('no reached.')
    });
  }

  getWindowPreferences(): WindowPreferences {
    return {
      hideTitleBar: true,
      maximizable: true,
      minimizable: true,
      closable: true,
    };
  }

  setWindowPreferences(preferences: WindowPreferences) {}

  updateAvoidAreaStatus(isFullScreen: boolean) {}
}