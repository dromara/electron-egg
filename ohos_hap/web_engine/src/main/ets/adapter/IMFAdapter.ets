// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import inputMethod from '@ohos.inputMethod';

import { BaseAdapter } from '../common/BaseAdapter';
import { BusinessError } from '@ohos.base';
import LogMethod from '../common/LogDecorator';
import LogUtil from '../utils/LogUtil';
import { deviceInfo } from '@kit.BasicServicesKit';

import {
  IMFAdapterCursorInfo,
  IMFAdapterInputAttribute,
  IMFAdapterTextConfig } from '../interface/CommonInterface';

const TAG: string = 'IMFAdapter';

@injectable()
export class IMFAdapter extends BaseAdapter {
  private inputMethodController = inputMethod.getController();
  private count = 0;
  private IMEonListen = false;

  @LogMethod
  attachTextInput(textConfigIMF: IMFAdapterTextConfig, requestKeyboardReason: number, callback: (ret: boolean) => void) {
    this.attachTextInputHelper(textConfigIMF, requestKeyboardReason, callback)
  }

  @LogMethod
  cursorUpdate(cursorInfoIMF: IMFAdapterCursorInfo) {
    let cursorInfo: inputMethod.CursorInfo = {
      left: cursorInfoIMF.left as number,
      top: cursorInfoIMF.top as number,
      width: cursorInfoIMF.width as number,
      height: cursorInfoIMF.height as number
    };
    this.inputMethodController.updateCursor(cursorInfo, (err: BusinessError) => {
      if (err) {
        LogUtil.error(TAG, `Failed to updateCursor:` + JSON.stringify(err));
        return;
      }
    });
  }

  @LogMethod
  detachTextInput(callback: (ret: boolean) => void) {
    this.detachTextInputHelper(callback);
  }

  @LogMethod
  updateAttribute(inputAttributeIMF: IMFAdapterInputAttribute) {
    let inputAttribute: inputMethod.InputAttribute = {
      textInputType: inputAttributeIMF.inputPattern as inputMethod.TextInputType,
      enterKeyType: inputAttributeIMF.enterKeyType as inputMethod.EnterKeyType
    };
    this.inputMethodController.updateAttribute(inputAttribute, (err: BusinessError) => {
      if (err) {
        LogUtil.error(TAG, `Failed to updateAttribute:` + JSON.stringify(err));
        return;
      }
    });
  }

  @LogMethod
  showTextInput(requestKeyboardReason: number) {
    if (deviceInfo.sdkApiVersion >= 15) {
      this.inputMethodController.showTextInput(requestKeyboardReason).then(() => {
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `Failed to showTextInput:` + JSON.stringify(err));
      });
    } else {
      this.inputMethodController.showTextInput((err: BusinessError) => {
        if (err) {
          LogUtil.error(TAG, `Failed to showTextInput:` + JSON.stringify(err));
          return;
        }
      });
    }
  }

  @LogMethod
  offListenIME(){
    LogUtil.info(TAG, 'Unregisters the input method event listening function');
    this.inputMethodController.off('insertText');
    this.inputMethodController.off('deleteLeft');
    this.inputMethodController.off('deleteRight');
    this.inputMethodController.off('sendFunctionKey');
    this.inputMethodController.off('moveCursor');
  }

  private attachTextInputHelper(textConfigIMF: IMFAdapterTextConfig, requestKeyboardReason: number,
    callback: (ret: boolean) => void) {
    let textConfig: inputMethod.TextConfig = {
      inputAttribute: {
        textInputType: textConfigIMF.inputAttribute.inputPattern,
        enterKeyType: textConfigIMF.inputAttribute.enterKeyType
      },
      cursorInfo: {
        left: textConfigIMF.cursorInfo.left,
        top: textConfigIMF.cursorInfo.top,
        width: textConfigIMF.cursorInfo.width,
        height: textConfigIMF.cursorInfo.height
      }
    };
    this.inputMethodController.attach(true, textConfig).then(() => {
      this.showTextInputHelper(requestKeyboardReason, callback);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to attach:` + JSON.stringify(err));
      callback(false);
    });
  }

  private showTextInputHelper(requestKeyboardReason: number, callback: (ret: boolean) => void) {
    if (deviceInfo.sdkApiVersion >= 15) {
      this.inputMethodController.showTextInput(requestKeyboardReason).then(() => {
        if (!this.IMEonListen) {
          this.onListenIME();
          this.IMEonListen = true;
        }
        callback(true);
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `Failed to showTextInput:` + JSON.stringify(err));
        callback(false);
      });
    } else {
      this.inputMethodController.showTextInput().then(() => {
        if (!this.IMEonListen) {
          this.onListenIME();
          this.IMEonListen = true;
        }
        callback(true);
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `Failed to showTextInput:` + JSON.stringify(err));
        callback(false);
      });
    }
  }

  private onListenIME() {
    this.inputMethodController.on('insertText', (text: string) => {
      this.nativeContext.InsertTextCallback(text);
      this.inputMethodController.changeSelection("" + this.count++, 0, 0);
    });
    this.inputMethodController.on('deleteLeft', (length: number) => {
      this.nativeContext.DeleteBackCallback(length);
    });
    this.inputMethodController.on('deleteRight', (length: number) => {
      this.nativeContext.DeleteForwardCallback(length);
    });
    this.inputMethodController.on('sendFunctionKey', () => {
      this.nativeContext.SendEnterKeyEventCallback();
    });
    this.inputMethodController.on('moveCursor', (direction: inputMethod.Direction) => {
      this.nativeContext.MoveCursorCallback(direction);
    });
  }

  private detachTextInputHelper(callback: (ret: boolean) => void) {
    this.inputMethodController.detach().then(() => {
      callback(true); 
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to detach:` + JSON.stringify(err));
      callback(false);
    });
  }
}
