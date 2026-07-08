// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { SubWindowAdapter } from '../adapter/SubWindowAdapter';
import type { NewWindowParam, WindowBound } from '../interface/CommonInterface';

function implSubWindowAdapter(): SubWindowAdapter {
  return Inject.getOrCreate(SubWindowAdapter);
}

function createSubWindow(param: NewWindowParam) {
  implSubWindowAdapter().createSubWindow(param)
}

function showSubWindow(id: string) {
  implSubWindowAdapter().showSubWindow(id);
}

function hideSubWindow(id: string) {
  implSubWindowAdapter().hideSubWindow(id);
}

function cancelSubWindow(id: string) {
  implSubWindowAdapter().cancelSubWindow(id);
}

function setSubWindowBounds(id: string, r: WindowBound) {
  implSubWindowAdapter().setSubWindowBounds(id, r);
}

function reuseSubWindow(param: NewWindowParam): string {
  return implSubWindowAdapter().reuseSubWindow(param);
}

export class SubWindowAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("SubWindow.Create", createSubWindow);
    JsBindingUtils.bindFunction("SubWindow.Show", showSubWindow);
    JsBindingUtils.bindFunction("SubWindow.Hide", hideSubWindow);
    JsBindingUtils.bindFunction("SubWindow.Cancel", cancelSubWindow);
    JsBindingUtils.bindFunction("SubWindow.SetBounds", setSubWindowBounds);
    JsBindingUtils.bindFunction("SubWindow.ReuseSubWindow", reuseSubWindow);
  }
}