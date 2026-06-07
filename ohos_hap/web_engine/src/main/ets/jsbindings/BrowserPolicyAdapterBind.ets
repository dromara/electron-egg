// Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import lazy { BrowserPolicyAdapter } from '../adapter/BrowserPolicyAdapter';
import Inject from '../common/InjectModule';
import JsBindingUtils from '../utils/JsBindingUtils';

function browserPolicyAdapter(): BrowserPolicyAdapter {
  return Inject.getOrCreate(BrowserPolicyAdapter);
}

function getManagedBrowserPolicy(): string {
  return browserPolicyAdapter().getManagedBrowserPolicy();
}

export class BrowserPolicyAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("BrowserPolicyAdapter.GetManagedBrowserPolicy", getManagedBrowserPolicy);
  }
}
