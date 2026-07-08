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
  async startDrag(dragParams: OhosDragParamToJs, callback: (result: boolean) => void) {
    this.dragSourceWindowId = dragParams.window_id;
    if (dragParams.pixelmap_touch_x > dragParams.pixelmap_width
      || dragParams.pixelmap_touch_y > dragParams.pixelmap_height) {
      LogUtil.error(TAG, `startDrag fail: touch point param is invalid,
                    touchX:${dragParams.pixelmap_touch_x},
                    touchY:${dragParams.pixelmap_touch_y},
                    width:${dragParams.pixelmap_width},
                    height:${dragParams.pixelmap_height}`);
      callback(false);
      return;
    }
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
      callback(false);
      return;
    }
    let dragItemInfo: DragItemInfo = {
      pixelMap: this.pixmap,
      builder: ()=>{},
      extraInfo: "ohosDrag"
    }
    this.executeDragAction(dragItemInfo, dragInfo, callback);
  }

  private executeDragAction(dragItemInfo: DragItemInfo, dragInfo: dragController.DragInfo,
                            callback: (result: boolean) => void) {
    let uiContext = this.dragParamManager.getUiContext(this.dragSourceWindowId);
    if (!uiContext) {
      this.clearDragParam();
      LogUtil.error(TAG, `executeDrag fail : uiContext not exist`);
      callback(false);
      return;
    }
    try {
      let customBuilders = new Array<CustomBuilder | DragItemInfo>();
      customBuilders.push(dragItemInfo);
      let dragAction = uiContext.getDragController().createDragAction(customBuilders, dragInfo);
      if (!dragAction) {
        this.clearDragParam();
        LogUtil.error(TAG, `dragAction create fail`);
        callback(false);
        return;
      }
      dragAction.on('statusChange', this.dragActionStatusListener(dragAction));
      dragAction.startDrag().then(() => {
        callback(true);
      }).catch((err: Error) => {
        this.clearDragParam();
        LogUtil.error(TAG, `dragAction startDrag fail :${JSON.stringify(err)}`);
        callback(false);
      })
    } catch(err) {
      this.clearDragParam();
      LogUtil.error(TAG, `dragAction fail :${JSON.stringify(err)}`);
      callback(false);
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
