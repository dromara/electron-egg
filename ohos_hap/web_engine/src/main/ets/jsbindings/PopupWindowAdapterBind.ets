// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from "../common/InjectModule";
import lazy { PopupWindowAdapter } from '../adapter/PopupWindowAdapter';
import type { NewWindowParam, WindowBound } from '../interface/CommonInterface';

function implPopupWindowAdapter(): PopupWindowAdapter {
  return Inject.getOrCreate(PopupWindowAdapter);
}

function createWindow(param: NewWindowParam) {
  implPopupWindowAdapter().createWindow(param);
}

function closeWindow(id: number) {
  implPopupWindowAdapter().closeWindow(id);
}

function showWindow(id: number) {
  implPopupWindowAdapter().showWindow(id);
}

function hideWindow(id: number) {
  implPopupWindowAdapter().hideWindow(id);
}

function activateWindow(id: number) {
  implPopupWindowAdapter().activateWindow(id);
}

function setBounds(id: number,
                   bounds: WindowBound) {
  implPopupWindowAdapter().setBounds(id, bounds);
}

function setWindowLimits(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number, id: number) {
  implPopupWindowAdapter().setWindowLimits(minWidth, minHeight, maxWidth, maxHeight, id);
}

export class PopupWindowAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("PopupWindow.CreateWindow", createWindow);
    JsBindingUtils.bindFunction("PopupWindow.CloseWindow", closeWindow);
    JsBindingUtils.bindFunction("PopupWindow.ShowWindow", showWindow);
    JsBindingUtils.bindFunction("PopupWindow.HideWindow", hideWindow);
    JsBindingUtils.bindFunction("PopupWindow.ActivateWindow", activateWindow);
    JsBindingUtils.bindFunction("PopupWindow.SetBounds", setBounds);
    JsBindingUtils.bindFunction("PopupWindow.SetWindowLimits", setWindowLimits);
  }
}