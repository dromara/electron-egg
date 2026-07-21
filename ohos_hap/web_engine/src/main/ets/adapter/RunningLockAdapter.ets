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
import {runningLock} from '@kit.BasicServicesKit';

const TAG: string = 'RunningLock';

@injectable()
export class RunningLockAdapter extends BaseAdapter {
  private ctxAdapter: ContextAdapter;
  private recordLock: runningLock.RunningLock | null = null;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  @LogMethod
  start(lockType: string) {
    if (lockType === 'prevent-app-suspension') {
      this.holdRunningLock(true);
    } else if (lockType === 'prevent-display-sleep') {
      this.keepScreenOn(true);
    }
  }

  @LogMethod
  stop(lockType: string) {
    if (lockType === 'prevent-app-suspension') {
      this.holdRunningLock(false);
    } else if (lockType === 'prevent-display-sleep') {
      this.keepScreenOn(false);
    }
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

  private holdRunningLock(isHold: boolean) {
    if (isHold) {
      if (this.recordLock) {
        return;
      }
      runningLock.create('running_lock_test', runningLock.RunningLockType.BACKGROUND, (err: Error, lock: runningLock.RunningLock) => {
        if (typeof err === 'undefined') {
          LogUtil.error(TAG, 'create running lock: ' + lock);
          this.recordLock = lock;
          try {
            this.recordLock.hold(-1);
            LogUtil.info(TAG, 'hold running lock success');
          } catch(err) {
            LogUtil.error(TAG, 'hold running lock failed, err: ' + err);
          }
        } else {
          LogUtil.error(TAG, 'create running lock failed, err: ' + err);
        }
      });
    } else {
      if (this.recordLock) {
        try {
          let isHolding = this.recordLock.isHolding();
          if (!isHolding) {
            LogUtil.info(TAG, 'hold lock already release');
            this.recordLock = null;
            return;
          }
          this.recordLock.unhold();
          this.recordLock = null;
          LogUtil.info(TAG, 'hold running unlock success');
        } catch(err) {
          LogUtil.error(TAG, 'hold running unlock failed, err: ' + err);
        }
      }
    }
  }
}
