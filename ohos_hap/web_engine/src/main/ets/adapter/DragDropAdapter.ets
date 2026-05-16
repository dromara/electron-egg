// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import dragController from "@ohos.arkui.dragController"
import { deviceInfo } from '@kit.BasicServicesKit';
import image from '@ohos.multimedia.image';
import UDC from '@ohos.data.unifiedDataChannel';
import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { OhosDragParamToJs } from '../interface/CommonInterface';
import lazy { DragParamManager } from '../common/DragParamManager';
import { SystemFloatingWindowManager } from '../common/SystemFloatingWindowManager';

const TAG: string = 'OhosDrag';

@injectable()
export class DragDropAdapter extends BaseAdapter {
  private pixmap: image.PixelMap | undefined = undefined

  private abilityManager: AbilityManager;
  private systemFloatingWindowManager: SystemFloatingWindowManager;
  private dragSourceWindowId: string = "";
  private dragParamManager: DragParamManager;

  constructor(
    @inject(DragParamManager) manager: DragParamManager,
    @inject(AbilityManager) abilityManager: AbilityManager,
    @inject(SystemFloatingWindowManager) systemFloatingWindowManager: SystemFloatingWindowManager,
  ) {
    super();
    this.dragParamManager = manager;
    this.abilityManager = abilityManager;
    this.systemFloatingWindowManager = systemFloatingWindowManager;
  }

  @LogMethod
  startDrag(dragParams: OhosDragParamToJs, callback: (result: boolean) => void) {
    this.dragSourceWindowId = dragParams.window_id;
    let uiContext = this.dragParamManager.getUiContext(this.dragSourceWindowId);
    if (!uiContext) {
      this.handleStartDragError(callback, 'uiContext not exist');
      return;
    }
    let dragInfo = this.prepareDragInfo(dragParams);
    if (!dragInfo) {
      this.handleStartDragError(callback, 'prepareDragInfo fail');
      return;
    }
    this.prepareDragItemInfo(dragParams).then((dragItemInfo: DragItemInfo | undefined) => {
      if (!dragItemInfo || !uiContext || !dragInfo) {
        this.handleStartDragError(callback, 'dragItemInfo invalid');
        return;
      }
      try {
        let dragAction = this.prepareDragAction(uiContext, dragItemInfo, dragInfo);
        if (!dragAction) {
          this.handleStartDragError(callback, 'dragAction create fail');
          return;
        }
        dragAction.on('statusChange', this.dragActionStatusListener(dragAction));
        dragAction.startDrag().then(() => {
          callback(true);
        }).catch((err: Error) => {
          this.handleStartDragError(callback, 'dragAction startDrag fail', err);
        });
      } catch (error) {
        this.handleStartDragError(callback, 'dragAction fail', error);
      }
    }).catch((err: Error) => {
      this.handleStartDragError(callback, 'prepareDragItemInfo fail', err);
    });
  }

  private handleStartDragError(callback: (result: boolean) => void,
                               message?: string, error?: Error): void {
    this.clearDragParam();
    if (error) {
      LogUtil.error(TAG, `startDrag fail: ${message}, err:${JSON.stringify(error)}`);
    } else {
      LogUtil.error(TAG, `startDrag fail: ${message}`);
    }
    callback(false);
  }

  private prepareDragAction(uiContext: UIContext, dragItemInfo: DragItemInfo,
                            dragInfo: dragController.DragInfo) : dragController.DragAction | undefined {
    try {
      let customBuilders = new Array<CustomBuilder | DragItemInfo>();
      customBuilders.push(dragItemInfo);
      let dragAction = uiContext.getDragController().createDragAction(customBuilders, dragInfo);
      if (!dragAction) {
        LogUtil.error(TAG, `dragAction create fail`);
        return;
      }
      return dragAction;
    } catch (error) {
      LogUtil.error(TAG, `prepareDragAction fail :${JSON.stringify(error)}`);
      return;
    }
  }

  private prepareDragInfo(dragParams: OhosDragParamToJs) : dragController.DragInfo | undefined {
    if (dragParams.pixelmap_touch_x > dragParams.pixelmap_width
      || dragParams.pixelmap_touch_y > dragParams.pixelmap_height) {
      LogUtil.error(TAG, `startDrag fail: touch point param is invalid,
                    touchX:${dragParams.pixelmap_touch_x},
                    touchY:${dragParams.pixelmap_touch_y},
                    width:${dragParams.pixelmap_width},
                    height:${dragParams.pixelmap_height}`);
      return;
    }
    try {
      let touchX: Dimension =
        ((dragParams.pixelmap_touch_x / dragParams.pixelmap_width) * 100 + '%') as Dimension;
      let touchY: Dimension =
        ((dragParams.pixelmap_touch_y / dragParams.pixelmap_height) * 100 + '%') as Dimension;
      let unifiedData: UDC.UnifiedData | undefined;
      if (deviceInfo.sdkApiVersion >= 15) {
        unifiedData = this.dragParamManager.handleDragDataForEntries(dragParams);
      } else {
        unifiedData = this.dragParamManager.handleDragRecords(dragParams);
      }
      let dragInfo: dragController.DragInfo = {
        pointerId: 0,
        data: unifiedData,
        extraParams: '',
        previewOptions: {numberBadge: false, mode: DragPreviewMode.DISABLE_SCALE},
        touchPoint: {
          x: touchX,
          y: touchY
        }
      }
      return dragInfo;
    } catch (error) {
      LogUtil.error(TAG, `prepareDragInfo fail, error:${JSON.stringify(error)}`);
      return;
    }
  }

  private async prepareDragItemInfo(dragParams: OhosDragParamToJs) : Promise<DragItemInfo | undefined> {
    let opts: image.InitializationOptions = {
      editable: false,
      pixelFormat: image.PixelMapFormat.BGRA_8888,
      size: {
        height: dragParams.pixelmap_height,
        width: dragParams.pixelmap_width
      }
    }
    try {
      this.pixmap = await image.createPixelMap(dragParams.pixelmap_buffer, opts);
    } catch (error) {
      LogUtil.error(TAG, `pixelmap create fail :${JSON.stringify(error)}`);
      return;
    }

    try {
      let dragItemInfo: DragItemInfo = {
        pixelMap: this.pixmap,
        builder: ()=>{},
        extraInfo: "ohosDrag"
      }
      return dragItemInfo;
    } catch(err) {
      LogUtil.error(TAG, `dragAction fail :${JSON.stringify(err)}`);
      return;
    }
  }

  dragEnterData(xComponentId: string, summary: Summary) {
    let dropData = this.dragParamManager.handleDropDataForEnter(summary);
    this.nativeContext.OnDragEnterCB(xComponentId, dropData, dropData.fileUris);
  }

  dragMove(id: string, windowX: number, windowY: number): void {
    let windowClass = this.abilityManager.getProxy(id)?.getWindow();
    if (!windowClass) {
      windowClass = this.systemFloatingWindowManager.getWindow(id);
    }
    try {
      const mainWindowProp = windowClass?.getWindowProperties();
      let xComBorder: number = mainWindowProp?.drawableRect.left || 0;
      let xComTop: number = mainWindowProp?.drawableRect.top || 0;
      windowX -= xComBorder;
      windowY -= xComTop;
      this.nativeContext.OnDragMoveCB(id, windowX, windowY);
    } catch (err) {
      LogUtil.error(TAG, 'Failed to obtain window properties:' + JSON.stringify(err));
    }
  }

  dragLeave(xComponentId: string) {
    this.nativeContext.OnDragLeaveCB(xComponentId);
  }

  dropData(xComponentId: string, dragData: UnifiedData) {
    let dropData = this.dragParamManager.handleDropDataForDrop(dragData);
    this.nativeContext.OnDropCB(xComponentId, dropData, dropData.fileUris);
  }

  private dragActionStatusListener(dragAction: dragController.DragAction) {
    return (dragAndDropInfo: dragController.DragAndDropInfo) => {
      if (dragAndDropInfo.status === dragController.DragStatus.ENDED) {
        if (dragAction) {
          dragAction.off('statusChange');
        }
        LogUtil.info(TAG, 'drag action listener, drag ended.');
        this.nativeContext.OnDragEndCB(this.dragSourceWindowId);
        this.clearDragParam();
      }
    };
  }

  private clearDragParam() {
    if (this.pixmap) {
      this.pixmap.release().catch((err: Error) => {
        LogUtil.error(TAG, `pixmap release failed:${JSON.stringify(err)}`);
      })
    }
    this.dragSourceWindowId = "";
    this.dragParamManager.clearParam();
  }
}
