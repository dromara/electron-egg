// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { DeviceUserAuthAdapter } from '../adapter/DeviceUserAuthAdapter';

function implDeviceUserAuthAdapter(): DeviceUserAuthAdapter {
  return Inject.getOrCreate(DeviceUserAuthAdapter);
}

function startUserAuth(prompt_string: string, callback: Function, enableBiom: boolean, biomType: number) {
  implDeviceUserAuthAdapter().startUserAuth(prompt_string, callback, enableBiom, biomType);
}

function checkBiometricAvailable(callback: (result: boolean, authType: number) => void) {
  implDeviceUserAuthAdapter().checkBiometricAvailable(callback);
}

export class DeviceUserAuthAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("DeviceUserAuthAdapter.StartUserAuth", startUserAuth);
    JsBindingUtils.bindFunction("DeviceUserAuthAdapter.CheckBiometricAvailable", checkBiometricAvailable);
  }
}