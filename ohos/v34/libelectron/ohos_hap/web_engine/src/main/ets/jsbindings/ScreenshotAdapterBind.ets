// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import { image } from '@kit.ImageKit';
import lazy { ScreenshotAdapter } from '../adapter/ScreenshotAdapter';

function implScreenshotAdapter(): ScreenshotAdapter {
  return Inject.getOrCreate(ScreenshotAdapter);
}

function startCapture(callback: (imageInfo: image.ImageInfo | null,
                                 readBuffer: ArrayBuffer | null) => void): void {
  implScreenshotAdapter().startCapture(callback);
}

export class ScreenshotAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('ScreenshotAdapter.StartCapture', startCapture);
  }
}