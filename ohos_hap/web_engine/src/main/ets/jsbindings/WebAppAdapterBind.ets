/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from "../common/InjectModule";
import lazy { WebAppAdapter } from '../adapter/WebAppAdapter';
import lazy { DesktopShortcut } from '../interface/CommonInterface';

function implWebAppAdapter(): WebAppAdapter {
  return Inject.getOrCreate(WebAppAdapter);
}

async function createDesktopShortcut(shortcut: DesktopShortcut, callback: Function) {
  await implWebAppAdapter().createDesktopShortcut(shortcut, callback);
}

export class WebAppAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("WebAppAdapter.CreateDesktopShortcut", createDesktopShortcut);
  }
}