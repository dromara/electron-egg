// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import LogUtil from '../utils/LogUtil';
import window from '@ohos.window';
import Want from '@ohos.app.ability.Want';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { NativeThemeAdapter } from '../adapter/NativeThemeAdapter';
import { Configuration } from '@ohos.app.ability.Configuration';
import Inject from '../common/InjectModule';
import { WindowBound } from '../interface/CommonInterface';
import { PermissionManagerAdapter } from '../adapter/PermissionManagerAdapter';
import { UIExtensionContentSession } from '@kit.AbilityKit';
import { JSON } from '@kit.ArkTS';
import { AbilityManager } from '../common/AbilityManager';
import { WebBaseExtensionAbility } from './WebBaseExtensionAbility';
import { uiExtension } from '@kit.ArkUI';

const TAG: string = 'WebEmbeddedAbility';

export class WebEmbeddedAbility extends WebBaseExtensionAbility {
  private static WINDOW_CLOSE: number = 1000;
  private abilityManager: AbilityManager | undefined = undefined;
  private nativeThemeAdapter: NativeThemeAdapter | undefined = undefined;

  onConfigurationUpdate(config: Configuration) {
    if (config.colorMode !== undefined) {
      this.nativeThemeAdapter?.setSystemNativeTheme(config.colorMode);
    }
  }

  onCreate(launchParam: AbilityConstant.LaunchParam) {
    this.abilityManager = Inject.get(AbilityManager);
    this.nativeThemeAdapter = Inject.get(NativeThemeAdapter);
    Inject.get(PermissionManagerAdapter).initPermissions();
  }

  onSessionCreate(want: Want, session: UIExtensionContentSession) {
    super.onSessionCreate(want, session);

    this.abilityManager?.addProxy(this);

    let windowProxy = session.getUIExtensionWindowProxy();
    try {
      windowProxy.on('windowSizeChange', (size) => {
        const prop = windowProxy.properties;
        let windowBound: WindowBound = {
          left: prop.uiExtensionHostWindowProxyRect.left,
          top: prop.uiExtensionHostWindowProxyRect.top,
          width: size.width,
          height: size.height,
        };
        this.nativeContext.OnWindowSizeChange(this.xcomponentId, windowBound);
      });
    } catch (exception) {
      LogUtil.error(TAG, 'Failed to listener for window size changes: ' + JSON.stringify(exception));
    }

    try {
      windowProxy.on('rectChange', uiExtension.RectChangeReason.HOST_WINDOW_RECT_CHANGE, (option) => {
        this.nativeContext.OnWindowSizeChange(this.xcomponentId, option.rect);
      });
    } catch (exception) {
      LogUtil.error(TAG,'Failed to listener for window rect changes: ' + JSON.stringify(exception));
    }

    let param: Record<string, Object> = {
      'xcomponentId': this.xcomponentId,
      'startUri': this.startUri,
      'session': session,
      'userData': this.userData,
    };
    let storage: LocalStorage = new LocalStorage(param);
    session.loadContent('pages/EmbeddedWindow', storage);
  }

  onSessionDestroy(session: UIExtensionContentSession) {
    LogUtil.info(TAG, `onSessionDestroy, id: ${this.xcomponentId}`);
    this.nativeContext.OnWindowEvent(this.xcomponentId, WebEmbeddedAbility.WINDOW_CLOSE);
  }

  onForeground() {
    LogUtil.info(TAG, `onForeground, id: ${this.xcomponentId}`);
  }

  onBackground() {
    LogUtil.info(TAG, `onBackground, id: ${this.xcomponentId}`);
  }

  onDestroy() {
    LogUtil.info(TAG, `onDestroy, id: ${this.xcomponentId}`);
  }

  closeWindow() {
    LogUtil.info(TAG, `closeWindow, id: ${this.xcomponentId}`);

    // Main window is destroyed, release UI related resources
    this.abilityManager?.removeProxy(this.xcomponentId);
    // this.UnRegisterEvent();
    super.closeWindow();
  }
};
