// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable, inject } from 'inversify';
import { image } from '@kit.ImageKit';
import { JSON } from '@kit.ArkTS';
import { statusBarManager } from '@kit.StatusBarExtensionKit';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import emitter from '@ohos.events.emitter';
import { ContextAdapter } from './ContextAdapter';

const TAG: string = 'statusBar';
const TRAY_IMAGE_EDITABLE: boolean = false;
const TRAY_IMAGE_PIXEL_FORMAT: number = 4;

interface MenuItem {
  title?: string,
  subTitle?: string,
  menuAction?: statusBarManager.StatusBarMenuAction,
  subMenu?: MenuItem[]
};

interface MenuRawData {
  acceleratorWorksWhenHidden?: boolean,
  checked?: boolean,
  commandId?: number,
  enabled?: boolean,
  label?: string,
  registerAccelerator?: boolean,
  role?: string,
  sublabel?: string,
  submenu?: MenuRawData[],
  toolTip?: string,
  type?: number,
  visible?: boolean
}

@injectable()
export class StatusBarManagerAdapter extends BaseAdapter {
  private TOOLTIPS: string = '';
  private TITLE: string = '';
  private isCreated: boolean = false;
  private quickOperationHeight: number = 100;
  private leftClickCallback: Function | undefined;
  private rightMenuCallback: Function | undefined;
  private ctxAdapter: ContextAdapter;

  constructor(
    @inject(ContextAdapter) ctxAdapter: ContextAdapter
  ) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

@LogMethod
async SetImage(
  whiteWidth: number,
  whiteHeight: number,
  whiteIconBuffer: ArrayBuffer,
  onCompleted: (ret: boolean) => void,
  callback: () => void,
  blackWidth?: number,
  blackHeight?: number,
  blackIconBuffer?: ArrayBuffer
) {
  let whiteTrayIcon: image.PixelMap | undefined = this.convertImagePixelMap(whiteWidth, whiteHeight, whiteIconBuffer);
  let blackTrayIcon: image.PixelMap | undefined;

  if (blackWidth !== undefined && blackHeight !== undefined && blackIconBuffer !== undefined) {
    blackTrayIcon = this.convertImagePixelMap(blackWidth, blackHeight, blackIconBuffer);
  }

  if (!this.isCreated) {
    try {
      statusBarManager.addToStatusBar(this.ctxAdapter.getActiveContext(), {
        icons: {
          white: whiteTrayIcon,
          black: blackTrayIcon ?? whiteTrayIcon
        },
        quickOperation: {
          title: this.TITLE,
          height: this.quickOperationHeight,
          moduleName: "electron",
          abilityName: "",
        },
        statusBarGroupMenu: [],
      }, () => {
        this.leftClickCallback = callback;
        statusBarManager.on('statusBarIconClick', () => {
          this.leftClickCallback?.();
        });
        let rightMenuClickCallback = (eventData: emitter.EventData) => {
          LogUtil.info(TAG, `rightMenuClickCallback is called. menuCode: ${eventData?.data?.menuCode}`);
          this.rightMenuCallback?.(Number(eventData?.data?.menuCode));
        }
        statusBarManager.on('rightMenuClick', rightMenuClickCallback);
        this.isCreated = true;
        onCompleted && onCompleted(true);
      });
    } catch (err) {
      LogUtil.error(TAG, `addToStatusBar failed. err: ${JSON.stringify(err)}`);
      onCompleted && onCompleted(false);
    }
  } else {
    try {
      statusBarManager.updateStatusBarIcon(this.ctxAdapter.getActiveContext(), {
        white: whiteTrayIcon,
        black: blackTrayIcon ?? whiteTrayIcon
      }, () => {
        onCompleted && onCompleted(true);
      });
    } catch(err) {
      LogUtil.error(TAG, `updateStatusBarIcon failed. err: ${JSON.stringify(err)}`);
      onCompleted && onCompleted(false);
    }
  }
}

  @LogMethod
  SetToolTips(tooltips: string) {
    this.TOOLTIPS = tooltips;
  }

  @LogMethod
  SetContextMenu(menu_model: string, onCompleted: (ret: boolean) => void, callback: (id: Number) => void) {
    LogUtil.debug(TAG, `JS SetContextMenu:: ${menu_model}`);
    try {
      let menu_json: MenuRawData[] = JSON.parse(menu_model) as MenuRawData[];
      const items: statusBarManager.StatusBarMenuItem[] = this.transformJsonToMenus(menu_json);
      const modified_items: statusBarManager.StatusBarMenuItem[] = this.processData(items) as statusBarManager.StatusBarMenuItem[];
      const menus: statusBarManager.StatusBarGroupMenu[] = [modified_items];
      try {
        statusBarManager.updateStatusBarMenu(this.ctxAdapter.getActiveContext(), menus, () => {onCompleted && onCompleted(true)});
      } catch (err){
        LogUtil.info(TAG, `updateStatusBarMenu failed. err: ${JSON.stringify(err)}`);
        onCompleted && onCompleted(false);
      }
      this.rightMenuCallback = callback;
    } catch (err) {
      LogUtil.error(TAG, 'SetContextMenu Error: ' + err);
      onCompleted && onCompleted(false);
    }
  }

  @LogMethod
  async RemoveFromStatusBar(onCompleted: (ret: boolean) => void) {
    try {
      try {
        statusBarManager.removeFromStatusBar(this.ctxAdapter.getActiveContext(), () => {
          this.isCreated = false;
          onCompleted && onCompleted(true);
        });
      } catch (err) {
        LogUtil.info(TAG, `removeFromStatusBar failed. err: ${JSON.stringify(err)}`);
        onCompleted && onCompleted(false);
      }
    } catch (err) {
      LogUtil.error(TAG, 'RemoveFromStatusBar Error: ' + err);
      onCompleted && onCompleted(false);
    } finally {
      statusBarManager.off('statusBarIconClick');
      statusBarManager.off('rightMenuClick');
    }
  }

  private recurse(items: MenuItem[] | undefined, isTopLevel: boolean = true): undefined | MenuItem[] {
    if (items === undefined) {
      return items;
    }
    items.map((item: MenuItem) => {
      if (!isTopLevel) {
        item.subTitle = item.title;
        item.title = undefined;
      }
      this.recurse(item.subMenu, false);
    });
    return items;
  }

  private processData(rawData: statusBarManager.StatusBarMenuItem[]) : MenuItem[] {
    let modifiedData: MenuItem[]  = JSON.parse(JSON.stringify(rawData)) as MenuItem[];
    return this.recurse(modifiedData) as MenuItem[];
  }


  private transformMenuItem(jsonItem: MenuRawData): statusBarManager.StatusBarMenuItem | statusBarManager.StatusBarSubMenuItem {
    const menuAction: statusBarManager.StatusBarMenuAction = {
      abilityName: 'StatusBarEntryAbility',
      moduleName: 'entry',
      notifyOnly: true,
      menuCode: jsonItem.commandId?.toString()
    };

    const menuItem: statusBarManager.StatusBarMenuItem = {
      title: jsonItem.label as string,
      menuAction: menuAction
    };

    if (jsonItem.submenu && jsonItem.submenu.length > 0) {
      menuItem.subMenu = jsonItem.submenu.map((subItem) => this.transformMenuItem(subItem) as statusBarManager.StatusBarSubMenuItem);
    }

    return menuItem;
  }

  private transformJsonToMenus(jsonData: MenuRawData[]): statusBarManager.StatusBarMenuItem[] {
    return jsonData.map(item => this.transformMenuItem(item) as statusBarManager.StatusBarMenuItem);
  }

  private convertImagePixelMap(width: number, height: number, buff: ArrayBuffer): image.PixelMap | undefined {
    if (width === 0 || height === 0) {
      LogUtil.warn(TAG, 'image is empty, no conversion required');
      return undefined;
    }
    let opts: image.InitializationOptions = {
      editable: TRAY_IMAGE_EDITABLE,
      pixelFormat: TRAY_IMAGE_PIXEL_FORMAT,
      size: {
        height: height,
        width: width
      }
    }
    try {
      return image.createPixelMapSync(buff, opts);
    } catch (error) {
      LogUtil.error(TAG, 'failed convert image pixel map because: ' +  JSON.stringify(error));
      return undefined;
    }
  }
}