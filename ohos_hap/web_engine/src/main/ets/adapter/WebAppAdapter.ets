/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

import { injectable } from 'inversify';
import common from '@ohos.app.ability.common';
import { Want } from '@kit.AbilityKit';
import { productViewManager } from '@kit.StoreKit';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { DesktopShortcut } from '../interface/CommonInterface'
import bundleManager from '@ohos.bundle.bundleManager';
import { promptAction } from '@kit.ArkUI';
import { BusinessError } from '@kit.BasicServicesKit';
import { kvManager, KVStoreInterface } from '../utils/KVStore';

const TAG: string = 'WebAppAdapter';

interface LanguageMessages {
  en: string;
  zh: string;
}
type ErrorCodeMap = Map<number, LanguageMessages>;
// https://developer.huawei.com/consumer/cn/doc/harmonyos-references/store-productviewmanager#section2891132652315
const ERROR_CODES: ErrorCodeMap = new Map<number, LanguageMessages>([
  [401, { en: 'Parameter error.', zh: '参数错误。' }],
  [1006620001, { en: 'System internal error.', zh: '系统内部错误。' }],
  [1006620002, { en: 'Request to service error.', zh: '请求服务异常。' }],
  [1006620003, { en: 'Shortcut id already exists.', zh: '快捷方式ID已经存在。' }],
  [1006620004, { en: 'The number of shortcuts has reached the maximum.', zh: '快捷方式数量达到上限。' }],
  [1006620005, { en: 'Shortcut verification failed.', zh: '快捷方式校验失败。' }],
  [1006620006, { en: 'The shortcut is not verified or has expired.', zh: '快捷方式未校验或已过期。' }],
  [1006620007, { en: 'User refused to add shortcut.', zh: '用户拒绝添加快捷方式。' }]
]);

@injectable()
export class WebAppAdapter extends BaseAdapter {
  private moduleName: string = '';
  private bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_HAP_MODULE;

  private getErrorMessage(code: number): string {
    const errorInfo = ERROR_CODES.get(code);
    const language: string | undefined = AppStorage.get('language');
    const msg = language?.includes('zh') ? errorInfo?.zh : errorInfo?.en;
    return errorInfo ? `${code}: ${msg}` : `${code}: Unknown error code.`;
  }

  @LogMethod
  async createDesktopShortcut(shortcut: DesktopShortcut, callback: Function) {
    const uiContext = getContext(this) as common.UIAbilityContext;
    const kvStore: KVStoreInterface | undefined = await kvManager.getKVStore('webapp');

    try {
      let data = bundleManager.getBundleInfoForSelfSync(this.bundleFlags);
      let moduleInfo = data?.hapModulesInfo[0];
      this.moduleName = moduleInfo.name;
    } catch (exception) {
      LogUtil.error(TAG, 'getBundleInfoForSelfSync failed. Cause: ' + JSON.stringify(exception));
    }
    const want: Want = {
      bundleName: "com.huawei.ohos_chromium",
      moduleName: this.moduleName,
      abilityName: "EntryAbility",
      parameters: {
        'appId': '--app-id=' + shortcut.shortcutId,
      }
    }
    const shortcutId = shortcut.shortcutId;
    const label = shortcut.label;
    const foregroundIconPath = shortcut.foregroundIconPath;
    const backgroundIconPath = shortcut.backgroundIconPath;

    try {
      productViewManager.checkPinShortcutPermitted(uiContext, shortcutId, want, label, foregroundIconPath,
        backgroundIconPath)
        .then((result: productViewManager.CheckShortcutResult) => {
          productViewManager.requestNewPinShortcut(uiContext, result.tid)
            .then(() => {
              kvStore?.addData(shortcutId, JSON.stringify({
                'openAsWindow': shortcut.openAsWindow,
                'label': shortcut.label,
                'icon': shortcut.foregroundIconPath,
                'appId': shortcutId
              }));
              callback(true);
            }).catch((error: BusinessError) => {
            const msg = this.getErrorMessage(error.code);
            // const msg = `${JSON.stringify(error)}`;
            console.error(`requestNewPinShortcut error. code is ${msg}`);
            promptAction.showToast({
              message: msg,
              duration: 2000
            });
            callback(false);
          })
        }).catch((error: BusinessError) => {
        const msg = this.getErrorMessage(error.code);
        // const msg = `${JSON.stringify(error)}`;
        LogUtil.error(TAG, `checkPinShortcutPermitted error. code is ${msg}`);
        promptAction.showToast({
          message: msg,
          duration: 2000
        });
        callback(false);
      })
    } catch (error) {
      const msg = this.getErrorMessage(error.code);
      // const msg = `${JSON.stringify(error)}`;
      LogUtil.error(TAG, `createDesktopShortcut error. code is ${msg}`);
      promptAction.showToast({
        message: $r('app.string.add_failed_tip'),
        duration: 2000
      });
      callback(false);
    }
  }
}