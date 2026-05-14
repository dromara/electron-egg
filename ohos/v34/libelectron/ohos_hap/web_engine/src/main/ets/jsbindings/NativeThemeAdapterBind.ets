// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import ConfigurationConstant from '@ohos.app.ability.ConfigurationConstant';
import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { NativeThemeAdapter } from '../adapter/NativeThemeAdapter';

function implNativeThemeAdapter(): NativeThemeAdapter {
  return Inject.getOrCreate(NativeThemeAdapter);
}

function getSystemNativeTheme(): ConfigurationConstant.ColorMode {
  return implNativeThemeAdapter().getSystemNativeTheme();
}

function setAppColorMode(colorMode: ConfigurationConstant.ColorMode) {
  implNativeThemeAdapter().setAppColorMode(colorMode);
}

export class NativeThemeAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("NativeThemeAdapter.GetSystemNativeTheme", getSystemNativeTheme);
    JsBindingUtils.bindFunction("NativeThemeAdapter.SetAppColorMode", setAppColorMode);
  }
}