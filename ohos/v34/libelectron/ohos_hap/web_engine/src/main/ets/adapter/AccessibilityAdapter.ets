// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import { BaseAdapter } from '../common/BaseAdapter';
import LogMethod from '../common/LogDecorator';
import LogUtil from '../utils/LogUtil';

const TAG: string = 'Accessibility';

@injectable()
export class AccessibilityAdapter extends BaseAdapter {
  @LogMethod
  speech(text: string, id: string) {
    LogUtil.info(TAG, `speech NOTIMPLEMENTED`);
  }

  @LogMethod
  shutDown() {
    LogUtil.info(TAG, `shutDown NOTIMPLEMENTED`);
  }
}