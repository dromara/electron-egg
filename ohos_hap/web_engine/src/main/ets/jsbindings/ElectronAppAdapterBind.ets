// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from "../common/InjectModule";
import lazy { ElectronAppAdapter } from '../adapter/ElectronAppAdapter';

function implElectronAppAdapter(): ElectronAppAdapter {
  return Inject.getOrCreate(ElectronAppAdapter);
}

function getPreferredLanguageList(): Array<string> {
  return implElectronAppAdapter().getPreferredLanguageList();
}

function getSystemRegion(): string {
  return implElectronAppAdapter().getSystemRegion();
}

function getSystemLocale(): string {
  return implElectronAppAdapter().getSystemLocale();
}

function getFileIcon(callback: Function): void {
  return implElectronAppAdapter().getFileIcon(callback);
}

function relaunch(args: Array<string>, execPath: string): void {
  return implElectronAppAdapter().relaunch(args, execPath);
}

function openApplicationInfoEntry(): void {
  return implElectronAppAdapter().openApplicationInfoEntry();
}

function setBadgeCount(count: number): void {
  return implElectronAppAdapter().setBadgeCount(count);
}

export class ElectronAppAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("ElectronApp.GetPreferredLanguageList", getPreferredLanguageList);
    JsBindingUtils.bindFunction("ElectronApp.GetSystemRegion", getSystemRegion);
    JsBindingUtils.bindFunction("ElectronApp.GetSystemLocale", getSystemLocale);
    JsBindingUtils.bindFunction("ElectronApp.GetFileIcon", getFileIcon);
    JsBindingUtils.bindFunction("ElectronApp.Relaunch", relaunch);
    JsBindingUtils.bindFunction("ElectronApp.OpenApplicationInfoEntry", openApplicationInfoEntry);
    JsBindingUtils.bindFunction("ElectronApp.SetBadgeCount", setBadgeCount);
  }
}