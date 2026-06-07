// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { MimeTypeAdapter } from '../adapter/MimeTypeAdapter';

function implMimeTypeAdapter(): MimeTypeAdapter {
  return Inject.getOrCreate(MimeTypeAdapter);
}

function getExtensionByMimeType(mimeType: string): string[] {
  return implMimeTypeAdapter().GetExtensionByMimeType(mimeType);
}

function getMimeTypeByExtension(extension: string): string[] {
  return implMimeTypeAdapter().GetMimeTypeByExtension(extension);
}

export class MimeTypeAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("MimeTypeAdapter.GetExtensionByMimeType", getExtensionByMimeType);
    JsBindingUtils.bindFunction("MimeTypeAdapter.GetMimeTypeByExtension", getMimeTypeByExtension);
  }
}