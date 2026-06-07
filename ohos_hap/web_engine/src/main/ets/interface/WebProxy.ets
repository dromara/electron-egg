// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { common } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { ChangeEventType } from '../interface/CommonInterface';

import { WindowPreferences } from './CommonInterface';

export interface WebProxy {
  getWindowStage: () => window.WindowStage | undefined;
  getWindow: () => window.Window | undefined;
  getWindowContext: () => common.Context | undefined;
  getWindowId: () => string;
  setWindowTitle: (title:string) => void;
  createSubWindow: (name: string) => Promise<window.Window>;
  getOriginWindowId: () => number;
  isUIAbility: () => boolean;
  updateAvoidAreaStatus: (isFullScreen: boolean) => void;
  setDeviceModeChangeEvent: (deviceModeChangeEvent: ChangeEventType | undefined) => void;
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

  updateAvoidAreaStatus(isFullScreen: boolean) {}

  setWindowTitle(title:string) {}

  createSubWindow(name: string): Promise<window.Window> {
    return new Promise<window.Window>((resolve, reject) => {
      reject('fake window.')
    });
  }

  isUIAbility(): boolean {
    return true;
  }

  setDeviceModeChangeEvent(deviceModeChangeEvent: ChangeEventType | undefined) {}

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