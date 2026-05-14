// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import Base from '@ohos.base';
import CommonEventManager from '@ohos.commonEventManager';
import Intl from '@ohos.intl';
import system from '@ohos.systemDateTime';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

@injectable()
export class I18nAdapter extends BaseAdapter {
  private static TAG: string = 'I18nAdapter';
  private subscriber: CommonEventManager.CommonEventSubscriber | undefined = undefined;
  private subscribeInfo: CommonEventManager.CommonEventSubscribeInfo = {
    events: [CommonEventManager.Support.COMMON_EVENT_TIMEZONE_CHANGED]
  };

  @LogMethod
  getLocaleLang(): string {
    return (new Intl.Locale()).language;
  }

  @LogMethod
  getLocaleRegion(): string {
    return (new Intl.Locale()).region;
  }

  @LogMethod
  registerTimeZoneListener(callback: Function) {
    CommonEventManager.createSubscriber(this.subscribeInfo,
      (err: Base.BusinessError, commonEventSubscriber: CommonEventManager.CommonEventSubscriber) => {
        if (err) {
          LogUtil.error(I18nAdapter.TAG, `createSubscriber failed, code is ${err.code}, message is ${err.message}`);
          return;
        }
        this.subscriber = commonEventSubscriber;
        CommonEventManager.subscribe(this.subscriber, (err: Base.BusinessError, data: CommonEventManager.CommonEventData) => {
          if (err) {
            LogUtil.error(I18nAdapter.TAG,
              `subscribe failed, code is %{public}d, message is ${err.code}, message is ${err.message}`);
            callback('');
            return;
          }
          callback(system.getTimezoneSync());
        });
      });
  }

  private unsubscribeTimeZoneListenerCB(err: Base.BusinessError) {
    if (err) {
      LogUtil.error(I18nAdapter.TAG, `subscribe failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  unsubscribeTimeZoneListener() {
    CommonEventManager.unsubscribe(this.subscriber, this.unsubscribeTimeZoneListenerCB);
  }
}
