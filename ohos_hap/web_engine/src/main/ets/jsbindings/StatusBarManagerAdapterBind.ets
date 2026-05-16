// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from "../common/InjectModule";
import lazy { StatusBarManagerAdapter } from '../adapter/StatusBarManager';

function implStatusBarManagerAdapter(): StatusBarManagerAdapter {
  return Inject.getOrCreate(StatusBarManagerAdapter);
}

function setImage(whiteWidth: number,
                  whiteHeight: number,
                  whiteIconBuffer: ArrayBuffer,
                  onCompleted: (ret: boolean) => void,
                  callback: () => void,
                  blackWidth?: number,
                  blackHeight?: number,
                  blackIconBuffer?: ArrayBuffer): void {
  implStatusBarManagerAdapter().SetImage(whiteWidth, whiteHeight, whiteIconBuffer, onCompleted, callback, blackWidth, blackHeight, blackIconBuffer);
}

function setToolTips(tooltips: string): void {
  implStatusBarManagerAdapter().SetToolTips(tooltips);
}

function setContextMenu(menu_model: string, onCompleted: (ret: boolean) => void, callback: (id: Number) => void): void {
  implStatusBarManagerAdapter().SetContextMenu(menu_model, onCompleted, callback);
}

function removeFromStatusBar(onCompleted: (ret: boolean) => void) {
  implStatusBarManagerAdapter().RemoveFromStatusBar(onCompleted);
}

export class StatusBarManagerAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("StatusBarManagerAdapter.SetImage", setImage);
    JsBindingUtils.bindFunction("StatusBarManagerAdapter.SetToolTips", setToolTips);
    JsBindingUtils.bindFunction("StatusBarManagerAdapter.SetContextMenu", setContextMenu);
    JsBindingUtils.bindFunction("StatusBarManagerAdapter.RemoveFromStatusBar", removeFromStatusBar);
  }
}