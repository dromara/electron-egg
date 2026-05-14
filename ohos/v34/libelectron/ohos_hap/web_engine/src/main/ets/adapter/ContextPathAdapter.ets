// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable, inject } from 'inversify';
import Want from '@ohos.app.ability.Want';

import { BaseAdapter } from '../common/BaseAdapter';
import LaunchHelper from '../utils/LaunchHelper';
import LogMethod from '../common/LogDecorator';
import LogUtil from '../utils/LogUtil';
import { ContextAdapter } from './ContextAdapter';

import { picker } from '@kit.CoreFileKit';
import { BusinessError } from '@kit.BasicServicesKit';

const TAG: string = 'ContextPath';

@injectable()
export class ContextPathAdapter extends BaseAdapter {
  private ctxAdapter: ContextAdapter;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  @LogMethod
  getResourceDir(): string {
    return this.ctxAdapter.getActiveContext()?.resourceDir || "";
  }

  @LogMethod
  showSystemSettings(uri_value: string, subUri?: string): void {
    let want: Want = {
      bundleName: 'com.huawei.hmos.settings',
      abilityName: 'com.huawei.hmos.settings.MainAbility',
      uri: uri_value
    }
    if (subUri !== undefined) {
      want.parameters = {
        'subUri': subUri
      }
    }
    LaunchHelper.Launch(this.ctxAdapter.getActiveContext(), want);
  }

  @LogMethod
  getPrivacyDownloadDir(callback: (uri_path: string) => void): void {
    let uri: string = '';
    let context = this.ctxAdapter.getActiveContext();
    if (context === undefined) {
      callback("");
      return;
    }
    const documentViewPicker = new picker.DocumentViewPicker(context);
    const documentSaveOptions = new picker.DocumentSaveOptions();
    documentSaveOptions.pickerMode = picker.DocumentPickerMode.DOWNLOAD;
    documentViewPicker.save(documentSaveOptions).then((documentSaveResult: Array<string>) => {
      uri = documentSaveResult[0];
      LogUtil.info (TAG, `Invoke documentViewPicker.save successfully, uri is ${uri}`);
      callback(uri.replace("file://docs", ""));
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Invoke documentViewPicker.save failed, code is ${err.code}, message is ${err.message}`);
      callback("");
    })
  }
}