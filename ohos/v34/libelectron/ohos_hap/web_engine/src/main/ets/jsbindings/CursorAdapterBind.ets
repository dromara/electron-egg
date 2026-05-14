// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { CursorAdapter } from '../adapter/CursorAdapter';

function implCursorAdapter(): CursorAdapter {
  return Inject.getOrCreate(CursorAdapter);
}

function setCursor(id: number, type: number) {
  implCursorAdapter().setCursor(id, type);
}

function setCursorVisible(visible: boolean) {
  implCursorAdapter().setCursorVisible(visible);
}

function setCustomCursor(id: string, width: number, height: number,
  hotspotX: number, hotspotY: number, buff: ArrayBuffer) {
  implCursorAdapter().setCustomCursor(id, width, height, hotspotX, hotspotY, buff);
}

export class CursorAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("CursorAdapter.SetCursor", setCursor);
    JsBindingUtils.bindFunction("CursorAdapter.SetCursorVisible", setCursorVisible);
    JsBindingUtils.bindFunction("CursorAdapter.SetCustomCursor", setCustomCursor);
  }
}
