// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { Want, wantConstant } from '@kit.AbilityKit';

import { BaseAdapter } from '../common/BaseAdapter';
import LogMethod from '../common/LogDecorator';
import LaunchHelper from '../utils/LaunchHelper';
import { ContextAdapter } from './ContextAdapter';

@injectable()
export class ExternalProtocolAdapter extends BaseAdapter {
  private ctxAdapter: ContextAdapter;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  @LogMethod
  async openExternal(urlStr: string) {
    let cleanURL = urlStr;
    const hashIndex = urlStr.indexOf('#');
    if (hashIndex !== -1) {
      cleanURL = urlStr.substring(0, hashIndex);
    }

    const want: Want = {
      flags: wantConstant.Flags.FLAG_START_WITHOUT_TIPS,
      uri: cleanURL,
      action: "ohos.want.action.viewData"
    }
    // Launch target app
    const launchResult = await LaunchHelper.AsyncLaunch(this.ctxAdapter.getActiveContext(), want);

    if (!launchResult) {
      let marketReferrer: undefined | string;
      const hash = urlStr.substring(hashIndex + 1);
      const match = hash.match(/want;(.*?);end/);
      if (match) {
        const payload = match[1];
        const pairs = payload.split(';');
        for (const pair of pairs) {
          if (pair.startsWith('S.market_referrer=')) {
            try {
              marketReferrer = decodeURIComponent(pair.slice('S.market_referrer='.length));
              if (!marketReferrer.startsWith('store://')) {
                marketReferrer = undefined;
                throw new Error('Invalid market referrer scheme.');
              }
              break;
            } catch (err) {
              LogUtil.error(TAG, `Failed to decode market referrer. ${err.name}: ${err.message}`);
            }
          }
        }
      }
      if (marketReferrer) {
        const jumpToStore: Want = {
          action: 'ohos.want.action.viewData',
          uri: marketReferrer,
        };
        // Failed to launch the target app, fallback to launching the app store
        LaunchHelper.Launch(this.ctxAdapter.getActiveContext(), jumpToStore);
      }
    }
  }
}
