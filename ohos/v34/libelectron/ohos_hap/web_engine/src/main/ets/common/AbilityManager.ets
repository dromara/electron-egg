// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import { ConfigData } from './Constants';
import { MessageBoxData } from '../adapter/DialogAdapter';
import { WebProxy } from '../interface/WebProxy';

import LogUtil from '../utils/LogUtil';

const TAG = 'AbilityManager';

AppStorage.setOrCreate('abilityProxyList', []);

// Electron
AppStorage.setOrCreate('messageBoxParamsList', []);

@injectable()
export class AbilityManager {
  private appStorage: WebProxy[];
  // Electron
  private messageBoxList: MessageBoxData[];

  constructor() {
    let appStorageLink: SubscribedAbstractProperty<WebProxy[]>
      = AppStorage.link('abilityProxyList');
    this.appStorage = appStorageLink.get();
    let messageBoxList: SubscribedAbstractProperty<MessageBoxData[]> = AppStorage.link('messageBoxParamsList');
    this.messageBoxList = messageBoxList.get();
  }

  private paramNormalization(proxyId: string | number): string {
    if (typeof proxyId === 'number') {
      return ConfigData.WINDOW_PREFIX + proxyId;
    }
    return proxyId;
  }

  public addProxy(proxy: WebProxy) {
    for (let i = 0; i < this.appStorage.length; i++) {
      if (proxy.getWindowId() === this.appStorage[i].getWindowId()) {
        LogUtil.error(TAG, `addProxy failed, proxyId: ${proxy.getWindowId()} already exists.`);
        return;
      }
    }
    this.appStorage.push(proxy);
  }

  public removeProxy(proxyId: string | number) {
    let id = this.paramNormalization(proxyId);
    for (let i = 0; i < this.appStorage.length; i++) {
      if (id === this.appStorage[i].getWindowId()) {
        LogUtil.info(TAG, `removeProxy success, proxyId: ${id}`);
        this.appStorage.splice(i, 1);
        break;
      }
    }
  }

  public getProxy(proxyId: string | number): WebProxy | undefined {
    let id = this.paramNormalization(proxyId);
    for (let i = 0; i < this.appStorage.length; i++) {
      if (id === this.appStorage[i].getWindowId()) {
        return this.appStorage[i];
      }
    }
    LogUtil.error(TAG, `getProxy failed, proxyId: ${id} not found.`);
    return undefined;
  }

  public getProxyDefault(): WebProxy | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.appStorage[0];
  }

  public isEmpty(): boolean {
    return this.appStorage.length === 0;
  }

  public getProxyCount(): number {
    return this.appStorage.length;
  }

  public getProxyList(): WebProxy[] {
    return this.appStorage;
  }

  public getWindowIdByOriginWindow(originWindowId: number): string {
    for (let i = 0; i < this.appStorage.length; i++) {
      if (originWindowId === this.appStorage[i].getOriginWindowId()) {
        return this.appStorage[i].getWindowId();
      }
    }
    LogUtil.error(TAG, `getWindowIdByOriginWindow failed, originWindowId: ${originWindowId} not found.`);
    return "";
  }

  public getOriginWindowId(windowId: string): number {
    for (let i = 0; i < this.appStorage.length; i++) {
      if (windowId === this.appStorage[i].getWindowId()) {
        return this.appStorage[i].getOriginWindowId();
      }
    }
    LogUtil.error(TAG, `getOriginWindowId failed, windowId: ${windowId} not found.`);
    return -1;
  }

  // Electron
  public addMessageBox(data: MessageBoxData) {
    for (let i = 0; i < this.messageBoxList.length; i++) {
      if (data.id === this.messageBoxList[i].id) {
        LogUtil.error(TAG, `addMessageBox failed, id: ${data.id} already exists.`);
        return;
      }
    }
    this.messageBoxList.push(data);
  }

  public getMessageBox(xComponent: string | number): MessageBoxData | undefined {
    let id = this.paramNormalization(xComponent);
    for (let i = 0; i < this.messageBoxList.length; i++) {
      if (id === this.messageBoxList[i].id) {
        return this.messageBoxList[i];
      }
    }
    LogUtil.error(TAG, `getMessageBox failed, xComponent: ${id} not found.`);
    return undefined;
  }

  public removeMessageBox(xComponent: string | number) {
    let id = this.paramNormalization(xComponent);
    for (let i = 0; i < this.messageBoxList.length; i++) {
      if (id === this.messageBoxList[i].id) {
        this.messageBoxList.splice(i, 1);
        break;
      }
    }
  }
};
