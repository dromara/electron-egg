// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { common } from '@kit.AbilityKit';

import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import { WebStatus } from '../common/Constants';
import LogMethod from '../common/LogDecorator';

@injectable()
export class AppLifecycleAdapter extends BaseAdapter {
  private abilityManager: AbilityManager;
  private webStatus: WebStatus;

  constructor(
    @inject(AbilityManager) abilityManager: AbilityManager,
  ) {
    super();
    this.abilityManager = abilityManager;
    this.webStatus = WebStatus.kInit;
  }

  @LogMethod
  onWebCreate() {
    this.webStatus = WebStatus.kStart;
    this.start();
  }

  @LogMethod
  onWebDestroy() {
    this.webStatus = WebStatus.kDestroy;
    this.destroy();
  }

  getWebStatus(): number {
    return this.webStatus;
  }

  start() {}

  destroy() {
    let proxy_list = this.abilityManager.getProxyList();
    for (let i = 0; i < proxy_list.length; i++) {
      let context = proxy_list[i].getWindowContext() as common.UIAbilityContext;
      context?.terminateSelf();
    }
  }
}
