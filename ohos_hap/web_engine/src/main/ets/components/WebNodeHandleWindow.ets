/*
 * Copyright (c) 2023-2025 Huawei Device Co., Ltd.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
import { NativeContext, WindowBound } from '../interface/CommonInterface';
import LogUtil from '../utils/LogUtil';
import JsBindingUtils from '../utils/JsBindingUtils';
import { NodeContent, window } from '@kit.ArkUI';
import { ConfigData, ContextType } from '../common/Constants';
import { NodeHandleManager } from '../common/NodeHandleManager';
import Inject from '../common/InjectModule';
import { ContextAdapter } from '../adapter/ContextAdapter';
import { CommandLineAdapter } from '../common/CommandLineAdapter';
import { MessageBox } from '../components/MessageBox';
import { IMessageBoxParams } from '../adapter/DialogAdapter';
import { AbilityManager } from '../common/AbilityManager';
import { DeviceInfoAdapter } from '../adapter/DeviceInfoAdapter';

@Component
export struct WebNodeHandleWindow {
  private static TAG: string = 'WebNodeHandleWindow';
  @LocalStorageLink('xcomponentId') xComponentId: string = '';
  @LocalStorageLink('startUri') startUri: string = '';
  @LocalStorageLink('appId') appId: string = '';
  @LocalStorageLink('window') window: window.Window | undefined = undefined;
  @LocalStorageLink('statusBarHeight') statusBarHeight: number = 0;
  @LocalStorageLink('cmdArgs') cmdArgs: string[] = [];
  private nativeContext: NativeContext = JsBindingUtils.getNativeContext(ContextType.kMainProcess);
  private nodeHandleManager = Inject.get(NodeHandleManager);
  private contextAdapter = Inject.get(ContextAdapter);
  private deviceInfoAdapter =  Inject.get(DeviceInfoAdapter);
  @State nodeContent: NodeContent = new NodeContent();
  private kBundleInstallDir = 'bundle-installation-dir';
  private abilityManager = Inject.get(AbilityManager);
  @State private messageBoxParams: IMessageBoxParams = {
    messageBoxSettings: undefined,
    icon: undefined,
    callback: () => {}
  };

  private dialogController: CustomDialogController = new CustomDialogController({
    builder: MessageBox({
      title: this.messageBoxParams.messageBoxSettings?.title,
      message: this.messageBoxParams.messageBoxSettings?.message,
      detail: this.messageBoxParams.messageBoxSettings?.detail,
      buttons: this.messageBoxParams.messageBoxSettings?.buttons,
      checkboxLabel: this.messageBoxParams.messageBoxSettings?.checkbox_label,
      checkboxChecked: this.messageBoxParams.messageBoxSettings?.checkbox_checked,
      icon: this.messageBoxParams?.icon,
      callback: this.messageBoxParams.callback
    }),
    cancel: () => {},
    autoCancel: false,
    alignment: DialogAlignment.Center,
    customStyle: false,
  })

  setMessageBoxParams() {
    const that = this;
    return (messageBoxParams: IMessageBoxParams) => {
      that.messageBoxParams = messageBoxParams;
    }
  }

  aboutToAppear(): void {
    LogUtil.info(WebNodeHandleWindow.TAG, 'WebNodeHandleWindow aboutToAppear ' + this.xComponentId);
    this.nodeHandleManager.addNodeContent(this.xComponentId, this.nodeContent);
    this.nativeContext.OnAbilityStartedCB(this.xComponentId);
    this.contextAdapter.setActiveWindow(this.xComponentId);
    this.abilityManager.addMessageBox({
      id: this.xComponentId,
      setMessageBoxParams: this.setMessageBoxParams(),
      dialogController: this.dialogController
    });
    this.setDefaultBounds();
    CommandLineAdapter.getInstance().appendArgs(this.cmdArgs);
    CommandLineAdapter.getInstance().appendSwitch(this.kBundleInstallDir, getContext().resourceDir);
    let vec_args = CommandLineAdapter.getInstance().getArgs();
    this.nativeContext.runBrowser(vec_args);
  }
 
  aboutToDisappear(): void {
    this.nodeHandleManager.removeNodeContent(this.xComponentId);
  }
 
  build() {
    ContentSlot(this.nodeContent)
  }
 
  private setDefaultBounds() {
    if (this.xComponentId !== ConfigData.DEFAULT_WINDOW_ID) {
      return;
    }
 
    let prop = this.window?.getWindowProperties();
    if (prop) {
      let windowRect: WindowBound = {
        left: prop.windowRect.left,
        top: prop.windowRect.top,
        width: prop.windowRect.width,
        height: prop.windowRect.height
      }

      if (this.deviceInfoAdapter?.isNormalWindowMode() && this.window) {
        try {
          this.statusBarHeight = this.window.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM).topRect.height;
        } catch (error) {
          LogUtil.error(WebNodeHandleWindow.TAG, `getWindowAvoidArea error, error = ${JSON.stringify(error)}`);
        }
      }

      let drawableRect: WindowBound = {
        left: prop.drawableRect.left,
        top: prop.drawableRect.top + this.statusBarHeight,
        width: prop.drawableRect.width,
        height: prop.drawableRect.height - this.statusBarHeight
      }
      let displayId = prop.displayId ?? ConfigData.INVALID_DISPLAY_ID;
      this.nativeContext.OnWindowInitSize(windowRect, drawableRect, displayId);
    }
 
    let state = this.window?.getWindowStatus();
    if (state) {
      this.nativeContext.OnWindowInitState(state);
    }
  }
}