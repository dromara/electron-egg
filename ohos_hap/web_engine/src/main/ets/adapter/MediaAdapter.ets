// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable, inject } from 'inversify';
import { BusinessError } from '@ohos.base';
import image from '@ohos.multimedia.image';
import { Size } from '@kit.ArkUI';
import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { camera } from '@kit.CameraKit';

const TAG: string = 'media';

@injectable()
export class MediaAdapter extends BaseAdapter {
  private previewReceiver: image.ImageReceiver;
  private defaultSize: Size = {
    width: 320,
    height: 240
  };
  private abilityManager: AbilityManager;

  constructor(
    @inject(AbilityManager) abilityManager: AbilityManager) {
    super();
    this.previewReceiver =
      image.createImageReceiver(this.defaultSize, image.ImageFormat.JPEG, 8);
    this.abilityManager = abilityManager;
  }

  @LogMethod
  getPreviewSurfaceId(callback?: Function) {
    this.previewReceiver.getReceivingSurfaceId().then((id:string) => {
      callback && callback(id);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to get Preview Surface:` + JSON.stringify(err));
    });
  }

  @LogMethod
  getImageReceiver() {
    this.previewReceiver.on('imageArrival', () => {
      let img: image.Image = this.nativeContext.readImageFromReceiver(this.previewReceiver);
      if (img) {
        img.release();
      } else {
        LogUtil.error(TAG, 'image undefined');
      }
    })
  }

  @LogMethod
  beep() {
    LogUtil.info(TAG, 'Beep is called');
  }
}
