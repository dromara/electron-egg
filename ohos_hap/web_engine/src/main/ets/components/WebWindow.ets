// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { NativeContext, WindowBound } from '../interface/CommonInterface';
import { AbilityManager } from '../common/AbilityManager';
import lazy { DragDropAdapter } from '../adapter/DragDropAdapter';
import LogUtil from '../utils/LogUtil';
import { ConfigData, ContextType, PanAction } from '../common/Constants';
import Inject from '../common/InjectModule';
import JsBindingUtils from '../utils/JsBindingUtils';
import { MultiInputAdapter } from '../adapter/MultiInputAdapter';
import { DragParamManager } from '../common/DragParamManager';
import { window } from '@kit.ArkUI';
import { CommandType } from '../common/Constants';
import { IMessageBoxParams } from '../adapter/DialogAdapter';
import { MessageBox } from '../components/MessageBox';
import { typeNode as TypedNode, NodeController, FrameNode } from '@ohos.arkui.node';
import { CommandLineAdapter } from '../common/CommandLineAdapter';

const TAG: string = 'WindowXComponentController';

interface ComponentConfig {
  moduleName: string,
  xComponentId: string,
  uri: string,
  nativeContext: NativeContext,
  window?: window.Window,
  cmdArgs: string[]
}

class WindowXComponentController extends XComponentController {
  onSurfaceCreated(surfaceId: string): void {
    LogUtil.info(TAG, `onSurfaceCreated surfaceId: ${surfaceId}`);
  }
  onSurfaceChanged(surfaceId: string, rect: SurfaceRect): void {
    LogUtil.info(TAG, `onSurfaceChanged surfaceId: ${surfaceId}, rect: ${JSON.stringify(rect)}`);
  }
  onSurfaceDestroyed(surfaceId: string): void {
    LogUtil.info(TAG, `onSurfaceDestroyed surfaceId: ${surfaceId}`);
  }
}

class WindowNodeController extends NodeController {
  private xComponentController: XComponentController = new WindowXComponentController();
  private xComponent: TypedNode.XComponent | undefined = undefined;
  private config: ComponentConfig;
  private kBundleInstallDir = 'bundle-installation-dir';

  constructor(config: ComponentConfig) {
    super();
    this.config = config;
    CommandLineAdapter.getInstance().appendArgs(this.config.cmdArgs);
    CommandLineAdapter.getInstance().appendSwitch(this.kBundleInstallDir, getContext().resourceDir);
  }

  makeNode(uiContext: UIContext): FrameNode | null {
    let node = new FrameNode(uiContext);
    this.xComponent = TypedNode.createNode(uiContext, "XComponent", {
      type: XComponentType.SURFACE,
      controller: this.xComponentController
    })
    this.xComponent.initialize({ id: this.config.moduleName, type: XComponentType.SURFACE, controller: this.xComponentController, libraryname: "adapter"});
    this.xComponent.attribute
      .defaultFocus(true)
      .focusable(true)
      .focusOnTouch(true)
      .backgroundColor(Color.Transparent)
      .renderFit(RenderFit.TOP_LEFT)
      .onLoad(() => {
        this.setDefaultBounds();
        let vec_args = CommandLineAdapter.getInstance().getArgs();
        this.config.nativeContext.runBrowser(vec_args);
        if (this.config.uri)
          this.config.nativeContext.ExecuteCommand(CommandType.kNewWindow, { url: this.config.uri, is_sync: true });
      })
    node.appendChild(this.xComponent);
    return node;
  }

  private setDefaultBounds() {
    if (this.config.xComponentId !== ConfigData.DEFAULT_WINDOW_ID)
      return;
    let prop = this.config.window?.getWindowProperties();
    if (prop) {
      let windowRect: WindowBound = {
        left: prop.windowRect.left,
        top: prop.windowRect.top,
        width: prop.windowRect.width,
        height: prop.windowRect.height
      }

      let drawableRect: WindowBound = {
        left: prop.drawableRect.left,
        top: prop.drawableRect.top,
        width: prop.drawableRect.width,
        height: prop.drawableRect.height
      }

      this.config.nativeContext.OnWindowInitSize(windowRect, drawableRect, 0);
    }

    let state = this.config.window?.getWindowStatus();
    if (state) {
      this.config.nativeContext.OnWindowInitState(state);
    }
  }

}

@Component
export struct WebWindow {
  private static TAG: string = 'WebWindow';
  @LocalStorageLink('statusBarHeight') statusBarHeight: number = 0;
  @LocalStorageLink('xcomponentId') xComponentId: string = '';
  @LocalStorageLink('startUri') startUri: string = '';
  @LocalStorageLink('window') window: window.Window | undefined = undefined;
  @LocalStorageLink('cmdArgs') cmdArgs: string[] = [];
  private XCOMPONENT_NAME: string = 'xcomponent';
  private MODULE_NAME: string = this.xComponentId + ':' + this.XCOMPONENT_NAME;
  private dragDropAdapter: DragDropAdapter = Inject.get(DragDropAdapter);
  private multiInputAdapter: MultiInputAdapter = Inject.get(MultiInputAdapter);
  private abilityManager = Inject.get(AbilityManager);
  private dragParamManager = Inject.get(DragParamManager);
  private nativeContext: NativeContext = JsBindingUtils.getNativeContext(ContextType.kMainProcess);

  @State private messageBoxParams: IMessageBoxParams = {
    messageBoxSettings: undefined,
    icon: undefined,
    callback: () => {}
  };
  private windowNodeController: WindowNodeController = new WindowNodeController({
    moduleName: this.MODULE_NAME,
    xComponentId: this.xComponentId,
    uri: this.startUri,
    nativeContext: this.nativeContext,
    window: this.window,
    cmdArgs: this.cmdArgs
  });

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
    this.dragParamManager.addDragContextData({
      id: this.xComponentId,
      uiContext: this.getUIContext(),
    });
    this.abilityManager.addMessageBox({
      id: this.xComponentId,
      setMessageBoxParams: this.setMessageBoxParams(),
      dialogController: this.dialogController
    });
  }

  aboutToDisappear(): void {
    this.dragParamManager.removeDragContextData(this.xComponentId);
  }

  build() {
    NodeContainer(this.windowNodeController)
      .gesture(
        PanGesture({ direction: PanDirection.Vertical | PanDirection.Horizontal, distance: 1 })
          .onActionStart((event: GestureEvent) => {
            this.multiInputAdapter.OnPanEvent(PanAction.kStart, this.xComponentId, event);
          })
          .onActionUpdate((event: GestureEvent) => {
            this.multiInputAdapter.OnPanEvent(PanAction.kUpdate, this.xComponentId, event);
          })
          .onActionEnd((event: GestureEvent) => {
            this.multiInputAdapter.OnPanEvent(PanAction.kEnd, this.xComponentId, event);
          })
          .onActionCancel(() => {
            this.multiInputAdapter.OnPanEvent(PanAction.kCancel, this.xComponentId, undefined);
          })
      )
      .gesture(
        PinchGesture()
          .onActionStart((event: GestureEvent) => {
            this.multiInputAdapter.OnPinchEvent("start", this.xComponentId, event);
          })
          .onActionUpdate((event: GestureEvent) => {
            this.multiInputAdapter.OnPinchEvent("update", this.xComponentId, event);
          })
          .onActionEnd((event: GestureEvent) => {
            this.multiInputAdapter.OnPinchEvent("end", this.xComponentId, event);
          })
      )
      .gesture(
        GestureGroup(GestureMode.Exclusive,
          TapGesture({ count: 2})
            .onAction(() => {})
        )
      )
      .onDragEnter((event?: DragEvent) => {
        LogUtil.info(WebWindow.TAG, 'OhosDrag WebWindow onDragEnter xComponentId:' + this.xComponentId);
        this.dragDropAdapter.dragEnterData(this.xComponentId, (event as DragEvent).getSummary());
      })
      .onDragMove((event?: DragEvent) => {
        let windowX = event?.getWindowX();
        let windowY = event?.getWindowY();
        windowX = vp2px(windowX);
        windowY = vp2px(windowY);
        this.dragDropAdapter.dragMove(this.xComponentId,
                                      windowX,
                                      windowY - this.statusBarHeight);
      })
      .onDragLeave(() => {
        LogUtil.info(WebWindow.TAG, 'OhosDrag WebWindow onDragLeave xComponentId:' + this.xComponentId);
        this.dragDropAdapter.dragLeave(this.xComponentId);
      })
      .onDrop((event?: DragEvent) => {
        if (!event) {
          LogUtil.error(WebWindow.TAG, 'OhosDrag WebWindow DragDrop onDrop event is null');
          return;
        }
        LogUtil.info(WebWindow.TAG, 'OhosDrag WebWindow onDrop xComponentId:' + this.xComponentId);
        let dragData: UnifiedData = (event as DragEvent).getData() as UnifiedData;
        this.dragDropAdapter.dropData(this.xComponentId, dragData);
      })
      .id(this.MODULE_NAME)
  }
}
