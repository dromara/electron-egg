// Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { BaseAdapter } from '../common/BaseAdapter';
import LogMethod from '../common/LogDecorator';
import { injectable } from 'inversify';
import LogUtil from '../utils/LogUtil';
import { browser } from '@kit.MDMKit';
import { util } from '@kit.ArkTS';

const TAG: string = 'BrowserPolicy';

@injectable()
export class BrowserPolicyAdapter extends BaseAdapter {
  @LogMethod
  getManagedBrowserPolicy(): string {
    try {
      let buffer: ArrayBuffer = browser.getSelfManagedBrowserPolicy();
      let intBuffer: Uint8Array = new Uint8Array(buffer);
      let decoder: util.TextDecoder = util.TextDecoder.create("utf-8");
      let stringData: string = decoder.decodeWithStream(intBuffer);
      return stringData;
    }
    catch(err) {
      LogUtil.error(TAG, `Failed to get managed browser policy. Code is, ${err.code}, ${err.message}`);
      return '';
    }
}
}