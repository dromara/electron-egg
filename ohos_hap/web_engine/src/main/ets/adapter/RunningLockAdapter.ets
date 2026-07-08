// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { BusinessError } from '@ohos.base';
import window from '@ohos.window';
import { ContextAdapter } from './ContextAdapter';

const TAG: string = 'RunningLock';

@injectable()
export class RunningLockAdapter extends BaseAdapter {
  private ctxAdapter: ContextAdapter;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  @LogMethod
  start() {
    this.keepScreenOn(true);
  }

  @LogMethod
  stop() {
    this.keepScreenOn(false);
  }

  private keepScreenOn(isKeepScreenOn: boolean) {
    window.getLastWindow(this.ctxAdapter.getActiveContext()).then((data) => {
      try {
        data.setWindowKeepScreenOn(isKeepScreenOn, (err: BusinessError) => {
          const errCode: number = err.code;
          if (errCode) {
            LogUtil.error(TAG, 'Failed to set the screen on. Cause: ' + JSON.stringify(err));
            return;
          }
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to set the screen on. Cause: ' + JSON.stringify(exception));
      }
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'Failed to obtain the top window. Cause: ' + JSON.stringify(err));
    });
  }
}
