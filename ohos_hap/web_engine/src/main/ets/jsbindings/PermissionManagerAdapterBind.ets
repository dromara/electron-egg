// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { PermissionManagerAdapter } from '../adapter/PermissionManagerAdapter';

function implPermissionManagerAdapter(): PermissionManagerAdapter {
  return Inject.getOrCreate(PermissionManagerAdapter);
}

function requestPermissions(permissionType: string, callback: (permissionGranted: number) => void) {
  implPermissionManagerAdapter().requestPermissions(permissionType, callback);
}

function checkPermissions(permissionType: string, callback: (permissionGranted: boolean) => void) {
  implPermissionManagerAdapter().checkPermissions(permissionType, callback);
}

function fileAccessPersist(uris: string[]) {
  implPermissionManagerAdapter().fileAccessPersist(uris);
}

function activateFileAccessPersist(uris: string[], callback: (code: number) => void) {
  implPermissionManagerAdapter().activateFileAccessPersist(uris, callback);
}

function saveUris(uris: string[]) {
  implPermissionManagerAdapter().saveUris(uris);
}

async function openPermissionConfirm(type: string, callback: (index: number) => void) {
  await implPermissionManagerAdapter().openPermissionConfirm(type, callback);
}

export class PermissionManagerAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('PermissionManagerAdapter.RequestPermissionCode', requestPermissions);
    JsBindingUtils.bindFunction('PermissionManagerAdapter.CheckPermissions', checkPermissions);
    JsBindingUtils.bindFunction('PermissionManagerAdapter.FileAccessPersist', fileAccessPersist);
    JsBindingUtils.bindFunction('PermissionManagerAdapter.ActivateFileAccessPersist', activateFileAccessPersist);
    JsBindingUtils.bindFunction('PermissionManagerAdapter.SaveUris', saveUris);
    JsBindingUtils.bindFunction('PermissionManagerAdapter.OpenPermissionConfirm', openPermissionConfirm);
  }
}