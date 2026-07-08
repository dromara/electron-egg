// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import Inject from '../common/InjectModule';
import { ChangeEventType, DeviceMode, NativeContext } from '../interface/CommonInterface';
import JsBindingUtils from '../utils/JsBindingUtils';
import { ContextType } from '../common/Constants';
import { settings } from '@kit.BasicServicesKit';
import LogUtil from '../utils/LogUtil';
import { AbilityManager } from '../common/AbilityManager';

const TAG: string = 'DeviceInfoAdapter';

@injectable()
export class DeviceInfoAdapter {
  private isRegisterDeviceModeChange: boolean = false;
  private nativeContext: NativeContext =
    JsBindingUtils.getNativeContext(ContextType.kMainProcess);
  private deviceMode: DeviceMode = DeviceMode.kPcMode;
  private abilityManager: AbilityManager = Inject.get(AbilityManager);

  public registerDeviceModeChange(context: Context): void {
    if (this.isRegisterDeviceModeChange) {
      return;
    }

    let res: boolean = settings.registerKeyObserver(context,
      'window_pcmode_switch_status', settings.domainName.USER_PROPERTY, () => {
        this.updateWindowDeviceModeSwitch(context);
      });
    if (!res) {
      LogUtil.error(TAG, 'Failed to register window_pcmode_switch_status.');
      return;
    }

    this.updateDeviceMode(this.getDeviceModeFromSystem(context));
    let proxyList = this.abilityManager.getProxyList();
    for (let i = 0; i < proxyList.length; i++) {
      this.abilityManager.getProxy(proxyList[i].getWindowId())?.updateAvoidAreaStatus(false);
    }

    this.isRegisterDeviceModeChange = true;
  }

  private updateWindowDeviceModeSwitch(context: Context): void {
    try {
      this.updateDeviceMode(this.getDeviceModeFromSystem(context));

      let proxyList = this.abilityManager.getProxyList();
      for (let i = 0; i < proxyList.length; i++) {
        this.abilityManager.getProxy(proxyList[i].getWindowId())?.updateAvoidAreaStatus(false);

        if (this.deviceMode === DeviceMode.kNormalWindowMode) {
          this.abilityManager.getProxy(proxyList[i].getWindowId())?.setDeviceModeChangeEvent(ChangeEventType.CHANGE_TO_NORMAL_MODE);
        } else if (this.deviceMode === DeviceMode.kFreeWindowsMode) {
          this.abilityManager.getProxy(proxyList[i].getWindowId())?.setDeviceModeChangeEvent(ChangeEventType.CHANGE_TO_FREE_MODE);
        }
      }
    } catch (err) {
      LogUtil.error(TAG, 'Failed to update window devicemode, err:' + JSON.stringify(err));
    }
  }

  private getDeviceModeFromSystem(context: Context): DeviceMode {
    let value = settings.getValueSync(context, 'window_pcmode_switch_status', 'false',
      settings.domainName.USER_PROPERTY);
    LogUtil.info(TAG, 'Get devicemode from system window_pcmode_switch_status, ' +
      'value:' + value);

    let newDeviceMode = value === 'true' ? DeviceMode.kFreeWindowsMode : DeviceMode.kNormalWindowMode;
    return newDeviceMode;
  }

  private updateDeviceMode(newDeviceMode: DeviceMode): void {
    if (this.deviceMode === newDeviceMode) {
      return;
    }
    this.deviceMode = newDeviceMode;
    this.nativeContext.UpdateWindowDeviceModeSwitchCB(newDeviceMode);
  }

  public isPcMode(): boolean {
    return this.deviceMode === DeviceMode.kPcMode;
  }

  public isNormalWindowMode(): boolean {
    return this.deviceMode === DeviceMode.kNormalWindowMode;
  }

  public isFreeWindowsMode(): boolean {
    return this.deviceMode === DeviceMode.kFreeWindowsMode;
  }
}
