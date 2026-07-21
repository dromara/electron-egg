// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { BusinessError } from '@ohos.base';
import { display } from '@kit.ArkUI';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { ContextAdapter } from './ContextAdapter';
import { common } from '@kit.AbilityKit';
import { WindowBound } from '../interface/CommonInterface';
import { DeviceInfoAdapter } from './DeviceInfoAdapter';

export interface CompleteDisplay {
  id: number;
  baseDisplay: display.Display | undefined;
  availArea: display.Rect | undefined;
}

export interface BrightnessInfo {
  currentHeadroom: number;
  maxHeadroom: number;
  sdrNits: number;
}

@injectable()
export class DisplayAdapter extends BaseAdapter {
  private static TAG: string = 'DisplayAdapter';
  private static VIRTUAL_ID: number = 1000;
  private fontSizeScale: number = 1.0;
  private ctxAdapter: ContextAdapter;
  private hasInit: boolean = false;
  private statusBarHeight: number = 0;
  private isAvailableAreaMonitor: boolean = false;
  private deviceInfoAdapter: DeviceInfoAdapter;
  private static invalidDisplay: CompleteDisplay = {
    id: -1,
    baseDisplay: undefined,
    availArea: undefined,
  };

  private static invalidBrightnessInfo: BrightnessInfo = {
    currentHeadroom: -1,
    maxHeadroom: -1,
    sdrNits: -1,
  };

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter,
    @inject(DeviceInfoAdapter) deviceInfoAdapter: DeviceInfoAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.deviceInfoAdapter = deviceInfoAdapter;
  }

  override init() {
    let activeContext = this.ctxAdapter.getActiveContext() as common.UIAbilityContext ||
                        this.ctxAdapter.getActiveContext() as common.UIExtensionContext;
    if (!activeContext) {
      return;
    }
    if (activeContext.config.fontSizeScale !== undefined) {
      this.fontSizeScale = activeContext.config.fontSizeScale;
    }
  }

  @LogMethod
  getPrimaryDisplay(callback: (completeDisplay: CompleteDisplay) => void) { 
    try {
      let displayClass: display.Display = display.getPrimaryDisplaySync();
      displayClass.getAvailableArea().then((availArea) => {
        let completeDisplay: CompleteDisplay = {
          id: displayClass.id,
          baseDisplay: displayClass,
          availArea: availArea,
        }
        LogUtil.info(DisplayAdapter.TAG,
          'getPrimaryDisplay, displayId: ' + displayClass.id +
          ', AvailArea.width: ' + availArea.width + ', height: '+ availArea.height);
        callback(completeDisplay);
      }).catch((err: BusinessError) => {
        LogUtil.error(DisplayAdapter.TAG, `Failed to get the available area in this display.
          Code: ${err.code}, message: ${err.message}`);
        callback(DisplayAdapter.invalidDisplay);
      })
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG,
        'Failed to obtain the default display object. Code: ' + JSON.stringify(exception));
      callback(DisplayAdapter.invalidDisplay);
    }
  }

  @LogMethod
  getBrightnessInfo(displayId: number, callback: (brightnessInfo: BrightnessInfo) => void) {
    try {
      let displayBrightnessInfo = display.getBrightnessInfo(displayId);
      if (!displayBrightnessInfo) {
        LogUtil.error(DisplayAdapter.TAG, 'Failed to displayBrightnessInfo.');
        return;
      }
      let brightnessInfo: BrightnessInfo = {
        currentHeadroom: displayBrightnessInfo.currentHeadroom,
        maxHeadroom: displayBrightnessInfo.maxHeadroom,
        sdrNits: displayBrightnessInfo.sdrNits,
      }
      callback(brightnessInfo);
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG,
        'Failed to obtain the default display object. Code: ' + JSON.stringify(exception));
      callback(DisplayAdapter.invalidBrightnessInfo);
    }
  }
 
  @LogMethod
  getALLDisplays(callback: (completeDisplays: Array<CompleteDisplay>,
                            length: number) => void) {
    try {
      display.getAllDisplays((err: BusinessError, baseDisplays: Array<display.Display>) => {
        const errCode: number = err.code;
        if (errCode) {
          LogUtil.error(DisplayAdapter.TAG,
            'Failed to obtain all the display objects. Code: ' + JSON.stringify(err));
          callback([], 0);
          return;
        }
 
        Promise.all(baseDisplays.map(baseDisplay => baseDisplay.getAvailableArea()))
          .then(availAreas => {
            if (this.deviceInfoAdapter.isNormalWindowMode()) {
              let primaryDisplayId = display.getPrimaryDisplaySync().id;
              let primaryIndex = baseDisplays.findIndex(baseDisplay => baseDisplay.id === primaryDisplayId);
              if (primaryIndex !== -1) {
                availAreas[primaryIndex].top += this.statusBarHeight;
                availAreas[primaryIndex].height -= this.statusBarHeight;
              }
            }

            let completeDisplays: Array<CompleteDisplay> =
              baseDisplays.map((baseDisplay, index) => ({
                id: baseDisplay.id,
                baseDisplay: baseDisplay,
                availArea: availAreas[index] }
              ) as CompleteDisplay);
            for (let i = 0; i < completeDisplays.length; i++) {
              LogUtil.info(DisplayAdapter.TAG,
                'getAllDisplays, displayId: ' + completeDisplays[i].id +
                ', AvailArea.width: ' +completeDisplays[i].availArea?.width +
                ', height:'+ completeDisplays[i].availArea?.height);
            }
            callback(completeDisplays, completeDisplays.length);
          })
          .catch((err: BusinessError) => {
            LogUtil.error(DisplayAdapter.TAG, `Failed to get the available area in all displays.
              Code: ${err.code}, message: ${err.message}`);
            callback([], 0);
          });
      });
    } catch (exception) {
      callback([], 0);
      LogUtil.error(DisplayAdapter.TAG,
        'Failed to obtain all the display object. Code: ' + JSON.stringify(exception));
    }
  }

  @LogMethod
  registerDisplayMonitor() {
    try {
      display.on("add", this.onAddCallback);
      display.on("remove", this.onRemoveCallback);
      display.on("change", this.onChangeCallback);
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG, 'Failed to register callback. Code: ' + JSON.stringify(exception));
    }
  }

  private checkVirtualId(displayId: number) : boolean {
    if(displayId >= DisplayAdapter.VIRTUAL_ID){
        return true;
    }
    return false;
  }

  private onAddCallback = (data: number) => {
    try {
      if (this.checkVirtualId(data)) {
        LogUtil.warn(DisplayAdapter.TAG, JSON.stringify(data) + ' is a virtual display in onAddCallback');
        return;
      }
      this.nativeContext.OnDisplayChangeCallback("add", data);

      // After API 20, the available area is monitored via NDK, eliminating the need
      // to register and unregister monitoring as the screens increase or decrease.
      if (this.isAvailableAreaMonitor) {
        let addDisplay = display.getDisplayByIdSync(data);
        addDisplay.on('availableAreaChange', (rect: display.Rect) => {
          this.onAvailableAreaChangeCallback(rect, addDisplay.id);
        });
      }
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG, 'Add event callback fail. Code: ' + JSON.stringify(exception));
    }
  }

  private onRemoveCallback = (data: number) => {
    try {
      if (this.checkVirtualId(data)) {
        LogUtil.warn(DisplayAdapter.TAG, JSON.stringify(data) + ' is a virtual display in onRemoveCallback');
        return;
      }
      this.nativeContext.OnDisplayChangeCallback("remove", data);

      if (this.isAvailableAreaMonitor) {
        let removeDisplay = display.getDisplayByIdSync(data);
        removeDisplay.off('availableAreaChange', (rect: display.Rect) => {
          this.onAvailableAreaChangeCallback(rect, removeDisplay.id);
        });
      }
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG, 'remove event callback fail. Code: ' + JSON.stringify(exception));
    }
  }

  private onChangeCallback = (data: number) => {
    try {
      if (this.checkVirtualId(data)) {
        LogUtil.warn(DisplayAdapter.TAG, JSON.stringify(data) + ' is a virtual display in onChangeCallback');
        return;
      }
      this.nativeContext.OnDisplayChangeCallback("change", data);
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG, 'Change event callback fail. Code: ' + JSON.stringify(exception));
    }
  }

  @LogMethod
  getFontSizeScale(): number {
    if (!this.hasInit) {
      this.init();
      this.hasInit = true;
    }
    return this.fontSizeScale;
  }

  onSystemFontSizeChange(fontSizeZoom: number = 1.0) {
    this.fontSizeScale = fontSizeZoom;
    this.nativeContext.OnFontSizeChangeCallback(fontSizeZoom);
  }

  @LogMethod
  registerAvailableAreaMonitor() {
    try {
      display.getAllDisplays((err: BusinessError, baseDisplays: Array<display.Display>) => {
        const errCode: number = err.code;
        if (errCode) {
          LogUtil.error(DisplayAdapter.TAG,
            'Failed to obtain all the display objects. Code: ' + JSON.stringify(err));
          return;
        }

        baseDisplays.forEach((baseDisplay) => {
          if (this.checkVirtualId(baseDisplay.id)) {
            return;
          }

          baseDisplay.on('availableAreaChange', (rect: display.Rect) => {
            this.onAvailableAreaChangeCallback(rect, baseDisplay.id);
          });
        });
      });

      // Indicates that the available area are monitored on the ETS side through
      // system interfaces. After API 20, this monitoring will be implemented via
      // NDK.
      this.isAvailableAreaMonitor = true;
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG,
        'Failed to register available area change callback of all the display object. Code: ' + JSON.stringify(exception));
    }
  }

  private onAvailableAreaChangeCallback(rect: display.Rect, displayId: number) {
    try {
      let statusBarHeight = 0;
      if (this.deviceInfoAdapter.isNormalWindowMode() && displayId === display.getPrimaryDisplaySync().id) {
        statusBarHeight = this.statusBarHeight;
      }
      
      let availableArea: WindowBound = {
        left: rect.left,
        top: rect.top + statusBarHeight,
        width: rect.width,
        height: rect.height - statusBarHeight
      }
      this.nativeContext.OnAvailableAreaChangeCallback(availableArea, displayId);
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG, 'AvailableAreaChange event callback fail. Code: ' + JSON.stringify(exception));
    }
  }

  public setStatusBarHeight(statusBarHeight: number) {
    this.statusBarHeight = statusBarHeight;
  }

  public availableAreaUpdateByStatusBar() {
    try {
      if (!this.isAvailableAreaMonitor) {
        return;
      }
      let displayClass: display.Display = display.getPrimaryDisplaySync();
      displayClass.getAvailableArea().then((availableArea) => {
        this.onAvailableAreaChangeCallback(availableArea, displayClass.id);
      }).catch((err: BusinessError) => {
        LogUtil.error(DisplayAdapter.TAG, `Failed to get the available area in this display. 
          Code: ${err.code}, message: ${err.message}`);
      });
    } catch (exception) {
      LogUtil.error(DisplayAdapter.TAG, 'Failed to update available area by status bar. Code: ' + JSON.stringify(exception));
    }
  }
}
