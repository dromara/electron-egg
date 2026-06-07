// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { ContextPathAdapter } from '../adapter/ContextPathAdapter';

function implContextPathAdapter(): ContextPathAdapter {
  return Inject.getOrCreate(ContextPathAdapter);
}

function getResourceDir(): string {
  return implContextPathAdapter().getResourceDir();
}

function showSystemSettings(uri: string, subUri?: string): void {
  implContextPathAdapter().showSystemSettings(uri, subUri);
}

function getPrivacyDownloadDir(callback: (uri_path: string) => void): void {
  implContextPathAdapter().getPrivacyDownloadDir(callback);
}

export class ContextPathAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('ContextPathAdapter.GetResourceDir', getResourceDir);
    JsBindingUtils.bindFunction("ContextPathAdapter.ShowSystemSettings", showSystemSettings);
    JsBindingUtils.bindFunction("ContextPathAdapter.GetPrivacyDownloadDir", getPrivacyDownloadDir);
  }
}