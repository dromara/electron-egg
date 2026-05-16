// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from "../common/InjectModule";
import lazy { DialogAdapter } from '../adapter/DialogAdapter';

function implDialogAdapter(): DialogAdapter {
  return Inject.getOrCreate(DialogAdapter);
}

function showMessageBox(settings: string, buffer: ArrayBuffer, width: number, height: number,  callback: (button_id: number, checkbox_checked: boolean) => void): void {
  return implDialogAdapter().showMessageBox(settings, buffer, width, height, callback);
}

function showErrorBox(title: string, content: string, callback: (result: boolean) => void): void {
  return implDialogAdapter().showErrorBox(title, content, callback);
}

function showOpenDialog(settings: string, callback: (filePaths: string[], canceled: boolean) => void): void {
  return implDialogAdapter().showOpenDialog(settings, callback);
}

function showSaveDialog(settings: string, callback: (filePath: string, canceled: boolean) => void): void {
  return implDialogAdapter().showSaveDialog(settings, callback);
}

export class DialogAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("DialogAdapter.ShowMessageBox", showMessageBox);
    JsBindingUtils.bindFunction("DialogAdapter.ShowErrorBox", showErrorBox);
    JsBindingUtils.bindFunction("DialogAdapter.ShowOpenDialog", showOpenDialog);
    JsBindingUtils.bindFunction("DialogAdapter.ShowSaveDialog", showSaveDialog);
  }
}