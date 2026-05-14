// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { FileManagerAdapter } from '../adapter/FileManagerAdapter';

function implFileManagerAdapter(): FileManagerAdapter {
  return Inject.getOrCreate(FileManagerAdapter);
}

function openItemInFolder(filePath: string, onCompleted: (ret: boolean) => void) {
  implFileManagerAdapter().openItemInFolder(filePath, onCompleted);
}

function openVerifiedItem(filePath: string, onCompleted: (ret: boolean) => void) {
  implFileManagerAdapter().openVerifiedItem(filePath, onCompleted);
}

function openUrlInDefaultBrowser(url: string) {
  implFileManagerAdapter().openUrlInDefaultBrowser(url);
}

function deleteFileToTrash(full_path: string, callback: (result: boolean) => void) {
  implFileManagerAdapter().deleteFileToTrash(full_path, callback);
}

function openExternal(url: string, options: string, callback: (err: string) => void): void {
  return implFileManagerAdapter().openExternal(url, options);
}

function getFileTypeIdByFileExtension(filenameExtension: string): string {
  return implFileManagerAdapter().getFileTypeIdByFileExtension(filenameExtension);
}

function getFileIconByFileTypeId(fileTypeId: string, callback: (icon: ArrayBuffer) => void): void {
  implFileManagerAdapter().getFileIconByFileTypeId(fileTypeId, callback);
}

export class FileManagerAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("FileManagerAdapter.OpenItemInFolder", openItemInFolder);
    JsBindingUtils.bindFunction("FileManagerAdapter.OpenVerifiedItem", openVerifiedItem);
    JsBindingUtils.bindFunction("FileManagerAdapter.OpenUrlInDefaultBrowser", openUrlInDefaultBrowser);
    JsBindingUtils.bindFunction("FileManagerAdapter.DeleteFileToTrash", deleteFileToTrash);
    JsBindingUtils.bindFunction("FileManagerAdapter.OpenExternal", openExternal);
    JsBindingUtils.bindFunction("FileManagerAdapter.GetFileTypeIdByFileExtension", getFileTypeIdByFileExtension);
    JsBindingUtils.bindFunction("FileManagerAdapter.GetFileIconByFileTypeId", getFileIconByFileTypeId);
  }
}