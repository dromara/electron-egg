// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import Want from '@ohos.app.ability.Want';
import { WebEmbeddedAbility } from 'web_engine';
import { AbilityConstant, UIExtensionContentSession } from '@kit.AbilityKit';

export default class BrowserEmbeddedAbility extends WebEmbeddedAbility {
  onCreate(launchParam: AbilityConstant.LaunchParam) {
    super.onCreate(launchParam)
  }

  onForeground() {
    super.onForeground()
  }

  onBackground() {
    super.onBackground()
  }

  onDestroy() {
    super.onDestroy()
  }

  onSessionCreate(want: Want, session: UIExtensionContentSession) {
    super.onSessionCreate(want, session)
  }

  onSessionDestroy(session: UIExtensionContentSession) {
    super.onSessionDestroy(session)
  }
};
