// Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
 
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { Configuration } from '@ohos.app.ability.Configuration';
import window from '@ohos.window';
import Want from '@ohos.app.ability.Want';

import { deviceInfo } from '@kit.BasicServicesKit';

import { WebAbility } from 'web_engine';;
 
export default class StatelessAbility extends WebAbility {
  onConfigurationUpdate(config: Configuration) {
    super.onConfigurationUpdate(config);
  }
 
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    super.onCreate(want, launchParam);
  }
 
  async onPrepareToTerminateAsync(): Promise<boolean> {
    return await super.onPrepareToTerminateAsync();
  }

  async onDestroy(): Promise<void> {
    await super.onDestroy();
  }
 
  onWindowStageCreate(windowStage: window.WindowStage) {
    super.onWindowStageCreate(windowStage);
    if (deviceInfo.sdkApiVersion >= 14) {
      windowStage.setWindowRectAutoSave(false);
    }
  }
 
  onWindowStageDestroy() {
    super.onWindowStageDestroy();
  }
 
  onForeground() {
    super.onForeground();
  }
 
  onBackground() {
    super.onBackground();
  }
};