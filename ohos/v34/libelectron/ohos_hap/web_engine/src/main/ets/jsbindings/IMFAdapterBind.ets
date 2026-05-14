// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { IMFAdapter } from '../adapter/IMFAdapter';
import type {
  IMFAdapterCursorInfo,
  IMFAdapterInputAttribute,
  IMFAdapterTextConfig } from '../interface/CommonInterface';

function implIMFAdapter(): IMFAdapter {
  return Inject.getOrCreate(IMFAdapter);
}

function attachTextInput(textConfigIMF: IMFAdapterTextConfig, requestKeyboardReason: number,
  callback: (ret: boolean) => void) {
  implIMFAdapter().attachTextInput(textConfigIMF, requestKeyboardReason, callback);
}

function cursorUpdate(cursorInfoIMF: IMFAdapterCursorInfo) {
  implIMFAdapter().cursorUpdate(cursorInfoIMF);
}

function detachTextInput(callback: (ret: boolean) => void) {
  implIMFAdapter().detachTextInput(callback);
}

function updateAttribute(inputAttributeIMF: IMFAdapterInputAttribute) {
  implIMFAdapter().updateAttribute(inputAttributeIMF);
}

function offListenIME() {
  implIMFAdapter().offListenIME();
}
 
function showTextInput(requestKeyboardReason: number) {
  implIMFAdapter().showTextInput(requestKeyboardReason);
}

export class IMFAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("IMFAdapter.AttachTextInput", attachTextInput);
    JsBindingUtils.bindFunction("IMFAdapter.CursorUpdate", cursorUpdate);
    JsBindingUtils.bindFunction("IMFAdapter.DetachTextInput", detachTextInput);
    JsBindingUtils.bindFunction("IMFAdapter.UpdateAttribute", updateAttribute);
    JsBindingUtils.bindFunction("IMFAdapter.ShowTextInput", showTextInput);
    JsBindingUtils.bindFunction("IMFAdapter.OffListenIME", offListenIME);
  }
}