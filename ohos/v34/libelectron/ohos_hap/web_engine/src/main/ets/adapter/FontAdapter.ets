// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import font from '@ohos.font';
import LogUtil from '../utils/LogUtil';

import { BaseAdapter } from '../common/BaseAdapter';
import LogMethod from '../common/LogDecorator';

const TAG: string = 'FontAdapter';

@injectable()
export class FontAdapter extends BaseAdapter {
  private fontList: Array<string> = new Array<string>();
  private configFontList: Array<string> = new Array<string>();
  private fontInfo: font.FontInfo = font.getFontByName('');

  @LogMethod
  getSystemFontList(): Array<string> {
    this.fontList = font.getSystemFontList();
    return this.fontList;
  }

  @LogMethod
  getConfigFontList(): Array<string> {
    this.configFontList.splice(0);
    let fontConfig = font.getUIFontConfig();
    for (let i = 0; i < fontConfig.generic.length; i ++){
      for (let j = 0; j < fontConfig.generic[i].alias.length; j ++){
        this.configFontList.push(fontConfig.generic[i].alias[j].name);
      }
    }
    for (let i = 0; i < fontConfig.fallbackGroups.length; i ++){
      for (let j = 0; j < fontConfig.fallbackGroups[i].fallback.length; j ++){
        this.configFontList.push(fontConfig.fallbackGroups[i].fallback[j].family);
      }
    }
    return this.configFontList;
  }

  @LogMethod
  getFontInfo(name: string): string {
    this.fontInfo = font.getFontByName(name);
    if (this.fontInfo === undefined) {
      LogUtil.warn(TAG, `FontAdapter.GetFontInfo undefined, name: ${name} not found!`);
      return "";
    }
    return JSON.stringify(this.fontInfo);
  }
}