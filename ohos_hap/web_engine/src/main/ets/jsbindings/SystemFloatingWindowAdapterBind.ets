// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import type { NewWindowParam, WindowBound } from '../interface/CommonInterface';
import lazy { SystemFloatingWindowAdapter } from '../adapter/SystemFloatingWindowAdapter';

function implSystemFloatingWindowAdapter(): SystemFloatingWindowAdapter {
  return Inject.getOrCreate(SystemFloatingWindowAdapter);
}

function createWindow(param: NewWindowParam) {
  implSystemFloatingWindowAdapter().createWindow(param);
}

function closeWindow(id: number) {
  implSystemFloatingWindowAdapter().closeWindow(id);
}

function showWindow(id: number) {
  implSystemFloatingWindowAdapter().showWindow(id);
}

function hideWindow(id: number) {
  implSystemFloatingWindowAdapter().hideWindow(id);
}

function setBounds(id: number,
                   bounds: WindowBound,
                   onCompleted: (ret: boolean) => void) {
  implSystemFloatingWindowAdapter().setBounds(id, bounds, onCompleted);
}

function setWindowLimits(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number, id: number) {
  implSystemFloatingWindowAdapter().setWindowLimits(minWidth, minHeight, maxWidth, maxHeight, id);
}

function startWindowMoving(id: number) {
  implSystemFloatingWindowAdapter().startWindowMoving(id);
}

function getOriginWindowId(id: number): number {
  return implSystemFloatingWindowAdapter().getOriginWindowId(id);
}

export class SystemFloatingWindowAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("SystemFloatingWindow.CreateWindow", createWindow);
    JsBindingUtils.bindFunction("SystemFloatingWindow.CloseWindow", closeWindow);
    JsBindingUtils.bindFunction("SystemFloatingWindow.ShowWindow", showWindow);
    JsBindingUtils.bindFunction("SystemFloatingWindow.HideWindow", hideWindow);
    JsBindingUtils.bindFunction("SystemFloatingWindow.SetBounds", setBounds);
    JsBindingUtils.bindFunction("SystemFloatingWindow.SetWindowLimits", setWindowLimits);
    JsBindingUtils.bindFunction("SystemFloatingWindow.StartWindowMoving", startWindowMoving);
    JsBindingUtils.bindFunction("SystemFloatingWindow.GetOriginWindowId", getOriginWindowId);
  }
}
