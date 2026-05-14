/*
 * Copyright (c) 2023-2025 Huawei Device Co., Ltd.
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of
 *    conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list
 *    of conditions and the following disclaimer in the documentation and/or other materials
 *    provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used
 *    to endorse or promote products derived from this software without specific prior written
 *    permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
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
export class DeviceInfoAdapter{
  private isRegisterDeviceModeChange: boolean = false;
  private nativeContext: NativeContext =
    JsBindingUtils.getNativeContext(ContextType.kMainProcess);
  private deviceMode: DeviceMode = DeviceMode.kPcMode;
  private abilityManager: AbilityManager = Inject.get(AbilityManager);;
 
  public registerDeviceModeChange(context: Context) : void {
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
 
  private updateWindowDeviceModeSwitch(context: Context) : void {
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
 
  private getDeviceModeFromSystem(context: Context) : DeviceMode {
    let value = settings.getValueSync(context, 'window_pcmode_switch_status', 'false',
      settings.domainName.USER_PROPERTY);
    LogUtil.info(TAG, 'Get devicemode from system window_pcmode_switch_status, ' +
      'value:' + value);
 
    let newDeviceMode = value === 'true' ? DeviceMode.kFreeWindowsMode : DeviceMode.kNormalWindowMode;
    return newDeviceMode;
  }
 
  private updateDeviceMode(newDeviceMode: DeviceMode) : void {
    if (this.deviceMode === newDeviceMode) {
      return;
    }
    this.deviceMode = newDeviceMode;
    this.nativeContext.UpdateWindowDeviceModeSwitchCB(newDeviceMode);
  }
 
  public isPcMode() : boolean {
    return this.deviceMode === DeviceMode.kPcMode;
  }
 
  public isNormalWindowMode() : boolean {
    return this.deviceMode === DeviceMode.kNormalWindowMode;
  }
 
  public isFreeWindowsMode() : boolean {
    return this.deviceMode === DeviceMode.kFreeWindowsMode;
  }
 
}