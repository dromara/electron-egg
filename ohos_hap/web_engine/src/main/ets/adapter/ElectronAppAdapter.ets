// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable, inject } from 'inversify';
import bundleManager from '@ohos.bundle.bundleManager';
import { BusinessError } from '@ohos.base';
import I18n from '@ohos.i18n';
import { autoStartupManager, common, Want } from '@kit.AbilityKit';

import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import { ContextAdapter } from './ContextAdapter';
import { deviceInfo } from '@kit.BasicServicesKit';
import { notificationManager } from '@kit.NotificationKit';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

const TAG: string = 'ElectronApp';

@injectable()
export class ElectronAppAdapter extends BaseAdapter {
  private abilityManager: AbilityManager;
  private bundleName: string = 'com.electronegg.demo';
  private bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION |
                        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_METADATA;
  private ctxAdapter: ContextAdapter;
  private appProvisionType: string = "release";

  constructor(
    @inject(ContextAdapter) ctxAdapter: ContextAdapter,
    @inject(AbilityManager) abilityManager: AbilityManager,
  ) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.abilityManager = abilityManager;
    try {
      let data = bundleManager.getBundleInfoForSelfSync(this.bundleFlags);
      this.bundleName = data.name;
      this.appProvisionType = data.appInfo.appProvisionType;
    } catch (err) {
      let message = (err as BusinessError).message;
      LogUtil.error(TAG, `getBundleInfoForSelfSync failed.: ${message}`);
    }
  }

  @LogMethod
  getPreferredLanguageList(): Array<string> {
    let preferredLanguageList: Array<string> = [];
    try {
      preferredLanguageList = I18n.System.getPreferredLanguageList(); // 获取系统当前偏好语言列表
    } catch(error) {
      let err: BusinessError = error as BusinessError;
      LogUtil.error(TAG, `call System.getPreferredLanguageList failed, error code: ${err.code}, message: ${err.message}.`);
    }
    return preferredLanguageList;
  }

  @LogMethod
  getSystemRegion(): string {
    return I18n.System.getSystemRegion();
  }

  @LogMethod
  getSystemLocale(): string {
    return I18n.System.getSystemLocale();
  }

  @LogMethod
  getFileIcon(callback: Function): void {
    let bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION;
    try {
      bundleManager.getBundleInfoForSelf(bundleFlags).then((data) => {
        let context = this.ctxAdapter.getActiveContext();
        context?.resourceManager.getMediaContent(data.appInfo.iconId, (error: BusinessError, value: Uint8Array) => {
          if (error != null) {
            LogUtil.error(TAG, 'getMediaContent failed. Cause: ' + error);
          } else {
            let media = value;
            callback(media);
          }
        });
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, 'getBundleInfoForSelf failed. Cause:' + err.message)
      });
    } catch (err) {
      let message = (err as BusinessError).message;
      LogUtil.error(TAG, 'getBundleInfoForSelf failed. Cause:' + message)
    }
  }

  @LogMethod
  relaunch(args: Array<string>, execPath: string): void {
    let applicationContext = this.ctxAdapter.getContext().getApplicationContext();
    let want: Want = {
      bundleName: this.bundleName,
      abilityName: 'EntryAbility'
    };
    want.parameters = {
      'cmdArgs' : args,
      'electronRelaunchExecPath': execPath
    };
    try {
      applicationContext.restartApp(want);
    } catch (err) {
      LogUtil.error(TAG, 'restartApp fail, error:' + JSON.stringify(err))
    }
  }

  @LogMethod
  openApplicationInfoEntry(): void {
    let context = this.ctxAdapter.getActiveContext() as common.UIAbilityContext;
    context.startAbility({
      bundleName: 'com.huawei.hmos.settings',
      abilityName: 'com.huawei.hmos.settings.MainAbility',
      uri: 'application_info_entry',
      parameters: {
        pushParams: this.bundleName
      }
    });
  }

  @LogMethod
  setLoginItemSettings(): void {
    let context = this.ctxAdapter.getActiveContext() as common.UIAbilityContext;
    context.startAbility({
      bundleName: 'com.huawei.hmos.settings',
      abilityName: 'com.huawei.hmos.settings.MainAbility',
      uri: 'pc_app_setup_settings'
    });
  }

  @LogMethod
  getLoginItemSettings(callback: Function): void {
    if (deviceInfo.sdkApiVersion >= 21) {
      autoStartupManager.getAutoStartupStatusForSelf().then((isAutoStartup: boolean) => {
        LogUtil.info(TAG, `getAutoStartupStatusForSelf success, isAutoStartup: ${JSON.stringify(isAutoStartup)}.`);
        callback(isAutoStartup);
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `getAutoStartupStatusForSelf failed, err code: ${err.code}, err msg: ${err.message}.`);
        callback(false);
      });
    } else {
      LogUtil.error(TAG, `getAutoStartupStatusForSelf requires a higher SDK version.`);
      callback(false);
    }
  }

  @LogMethod
  setBadgeCount(count: number): void {
    notificationManager.setBadgeNumber(count).then(() => {
      LogUtil.debug(TAG, "setBadgeNumber success");
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `setBadgeNumber fail: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  getPackagePublicInfo(): string {
    LogUtil.info(TAG, `getPackagePublicInfo success: ${this.appProvisionType}.`);
    return this.appProvisionType;
  }
};