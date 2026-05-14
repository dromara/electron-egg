// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import LogMethod from '../common/LogDecorator';
import pointer from '@ohos.multimodalInput.pointer';
import { image } from '@kit.ImageKit';
import LogUtil from '../utils/LogUtil';
import { BusinessError } from '@kit.BasicServicesKit';
import { deviceInfo } from '@kit.BasicServicesKit';
import { SystemFloatingWindowManager } from '../common/SystemFloatingWindowManager';

const TAG: string = 'Cursor';

@injectable()
export class CursorAdapter extends BaseAdapter {
  private abilityManager: AbilityManager;
  private systemFloatingWindowManager : SystemFloatingWindowManager;

  constructor(
    @inject(AbilityManager) abilityManager: AbilityManager,
    @inject(SystemFloatingWindowManager) systemFloatingWindowManager: SystemFloatingWindowManager
  ) {
    super();
    this.abilityManager = abilityManager;
    this.systemFloatingWindowManager = systemFloatingWindowManager;
  }

  private getWindow(id: string | number) {
    let window = this.abilityManager.getProxy(id)?.getWindow();
    if (!window) {
      window = this.systemFloatingWindowManager.getWindow(id);
    }
    return window;
  }

  @LogMethod
  setCursor(id: number, type: number) {
    let window = this.getWindow(id);
    if (window) {
      let windowId = window.getWindowProperties().id;
      pointer.setPointerStyle(windowId, type)
        .catch((error: BusinessError) => {
          LogUtil.error(TAG, "Failed to set cursor. Cause: " + JSON.stringify(error));
        });
    }
  }

  @LogMethod
  setCursorVisible(visible: boolean) {
    pointer.setPointerVisible(visible)
      .catch((error: BusinessError) => {
        LogUtil.error(TAG, "Failed to set cursor visible. Cause: " + JSON.stringify(error));
      });
  }

  @LogMethod
  setCustomCursor(id: string,
    width: number,
    height: number,
    hotspotX: number,
    hotspotY: number,
    buff: ArrayBuffer) {
    let opts: image.InitializationOptions = {
      editable: false,
      pixelFormat: image.PixelMapFormat.BGRA_8888,
      size: {
        height: height,
        width: width
      }
    };
    image.createPixelMap(buff, opts)
      .then((cursorImage: image.PixelMap) => {
        let window = this.getWindow(id);
        if (window) {
          let windowId = window.getWindowProperties().id;
          if (deviceInfo.sdkApiVersion >= 15) {
            let cuisor: pointer.CustomCursor = {
              pixelMap: cursorImage,
              focusX: hotspotX,
              focusY: hotspotY
            }
            pointer.setCustomCursor(windowId, cuisor, { followSystem: false })
              .catch((error: BusinessError) => {
                LogUtil.error(TAG, "Failed to set setCustomCursor. Cause: " + JSON.stringify(error));
              });
          } else {
            pointer.setCustomCursorSync(windowId, cursorImage, hotspotX, hotspotY);
          }
        }
      })
      .catch((error: BusinessError) => {
        LogUtil.error(TAG, "Failed to create pixel map. Cause: " + JSON.stringify(error));
      });
  }
}
