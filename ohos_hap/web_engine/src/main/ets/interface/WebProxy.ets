// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { common } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { ChangeEventType } from '../interface/CommonInterface';

import { WindowPreferences } from './CommonInterface';

export interface WebProxy {
  getWindowStage: () => window.WindowStage | undefined;
  updateAvoidAreaStatus: (isFullScreen: boolean) => void;
  setDeviceModeChangeEvent: (deviceModeChangeEvent: ChangeEventType | undefined) => void;
  getWindow: () => window.Window | undefined;
  getWindowContext: () => common.Context | undefined;
  getWindowId: () => string;
  setWindowTitle: (title:string) => void;
  createSubWindow: (name: string) => Promise<window.Window>;
  getOriginWindowId: () => number;
  isUIAbility: () => boolean;
  // Electron
  getWindowPreferences: () => WindowPreferences;
  setWindowPreferences: (preferences: WindowPreferences) => void;
};

export class FakeWebProxy implements WebProxy {
  getWindowStage(): window.WindowStage | undefined {
    return undefined;
  }

  getWindow(): window.Window | undefined {
    return undefined;
  }

  getWindowContext(): common.Context | undefined {
    return undefined;
  }

  getWindowId(): string {
    return '';
  }

  getOriginWindowId(): number {
    return -1;
  }

  setWindowTitle(title:string) {}

  updateAvoidAreaStatus(isFullScreen: boolean) {}

  setDeviceModeChangeEvent(deviceModeChangeEvent: ChangeEventType | undefined) {}

  createSubWindow(name: string): Promise<window.Window> {
    return new Promise<window.Window>((resolve, reject) => {
      reject('fake window.')
    });
  }

  isUIAbility(): boolean {
    return true;
  }

  getWindowPreferences(): WindowPreferences {
    return {
      hideTitleBar: true,
      maximizable: true,
      minimizable: true,
      closable: true
    };
  }

  setWindowPreferences(preferences: WindowPreferences) {}
}
