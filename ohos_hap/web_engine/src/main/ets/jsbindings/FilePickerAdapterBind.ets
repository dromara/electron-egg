// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { FilePickerAdapter } from '../adapter/FilePickerAdapter';
import type { SaveAsDialogParams, SelectFileDialogParams } from '../interface/CommonInterface';

function implFilePickerAdapter(): FilePickerAdapter {
  return Inject.getOrCreate(FilePickerAdapter);
}

function showDocumentViewPicker(params: SelectFileDialogParams, callback: (path: string) => void) {
  implFilePickerAdapter().showDocumentViewPicker(params, callback);
}

function showDirDocumentViewPicker(file_access_persist: boolean, callback: (path: string) => void) {
  implFilePickerAdapter().showDirDocumentViewPicker(file_access_persist, callback);
}

function showSaveAsDocumentViewPicker(params: SaveAsDialogParams, callback: (path: string) => void) {
  implFilePickerAdapter().showSaveAsDocumentViewPicker(params, callback);
}

function showInstallationPackageDialog(fileName: string, fileSize: string,
  callback: (continue_download: boolean) => void) {
  implFilePickerAdapter().showInstallationPackageDialog(fileName, fileSize, callback);
}
 
export class FilePickerAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("FilePickerAdapter.ShowDocumentViewPicker", showDocumentViewPicker);
    JsBindingUtils.bindFunction("FilePickerAdapter.ShowDirDocumentViewPicker", showDirDocumentViewPicker);
    JsBindingUtils.bindFunction("FilePickerAdapter.ShowSaveAsDocumentViewPicker", showSaveAsDocumentViewPicker);
    JsBindingUtils.bindFunction("FilePickerAdapter.ShowInstallationPackageDialog", showInstallationPackageDialog);
  }
}