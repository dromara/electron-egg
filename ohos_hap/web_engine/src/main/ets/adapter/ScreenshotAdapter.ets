// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { BusinessError } from '@ohos.base';
import { screenshot } from '@kit.ArkUI';
import { image } from '@kit.ImageKit';

const TAG: string = 'ScreenshotAdapter';

@injectable()
export class ScreenshotAdapter extends BaseAdapter {

  @LogMethod
  startCapture(callback: (imageInfo: image.ImageInfo | null,
                          readBuffer: ArrayBuffer | null) => void) {
    screenshot.capture().then((pixelMap: image.PixelMap) => {
      let imageInfo : image.ImageInfo = pixelMap.getImageInfoSync();
      const readBuffer: ArrayBuffer = new ArrayBuffer(pixelMap.getPixelBytesNumber());
      pixelMap.readPixelsToBufferSync(readBuffer);
      callback(imageInfo, readBuffer);
      pixelMap.release();
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'Failed to save screenshot. Code: ' + JSON.stringify(err));
      callback(null, null);
    });
  }
}