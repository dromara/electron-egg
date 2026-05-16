// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { AccessibilityAdapterBind } from '../jsbindings/AccessibilityAdapterBind';
import { AppLifecycleAdapterBind } from './AppLifecycleAdapterBind';
import { AppWindowAdapterBind } from '../jsbindings/AppWindowAdapterBind';
import { BluetoothAdapterBind } from '../jsbindings/BluetoothAdapterBind';
import { BluetoothLowEnergyAdapterBind } from '../jsbindings/BluetoothLowEnergyAdapterBind';
import { BrowserPolicyAdapterBind } from '../jsbindings/BrowserPolicyAdapterBind';
import { CertManagerAdapterBind } from '../jsbindings/CertManagerAdapterBind';
import { ContextAdapterBind } from './ContextAdapterBind';
import { ContextPathAdapterBind } from '../jsbindings/ContextPathAdapterBind';
import { CursorAdapterBind } from '../jsbindings/CursorAdapterBind';
import { DeviceAdapterBind } from '../jsbindings/DeviceAdapterBind';
import { DeviceUserAuthAdapterBind } from '../jsbindings/DeviceUserAuthAdapterBind';
import { DialogAdapterBind } from '../jsbindings/DialogAdapterBind';
import { DisplayAdapterBind } from '../jsbindings/DisplayAdapterBind';
import { DragDropAdapterBind } from '../jsbindings/DragDropAdapterBind';
import { ElectronAppAdapterBind } from '../jsbindings/ElectronAppAdapterBind';
import { EtsBridgeAdapterBind } from '../jsbindings/EtsBridgeAdapterBind';
import { FileManagerAdapterBind } from '../jsbindings/FileManagerAdapterBind';
import { FilePickerAdapterBind } from '../jsbindings/FilePickerAdapterBind';
import { FontAdapterBind } from '../jsbindings/FontAdapterBind';
import { I18nAdapterBind } from '../jsbindings/I18nAdapterBind';
import { IMFAdapterBind } from '../jsbindings/IMFAdapterBind';
import { MediaAdapterBind } from '../jsbindings/MediaAdapterBind';
import { MimeTypeAdapterBind } from '../jsbindings/MimeTypeAdapterBind';
import { NativeMessagingAdapterBind } from '../jsbindings/NativeMessagingAdapterBind';
import { NativeThemeAdapterBind } from '../jsbindings/NativeThemeAdapterBind';
import { NotificationAdapterBind } from '../jsbindings/NotificationAdapterBind';
import { PermissionManagerAdapterBind } from '../jsbindings/PermissionManagerAdapterBind.ets';
import { PopupWindowAdapterBind } from '../jsbindings/PopupWindowAdapterBind';
import { PrintAdapterBind } from '../jsbindings/PrintAdapterBind';
import { ProcessAdapterBind } from '../jsbindings/ProcessAdapterBind';
import { RunningLockAdapterBind } from '../jsbindings/RunningLockAdapterBind';
import { ScreenshotAdapterBind } from '../jsbindings/ScreenshotAdapterBind';
import { ShapeDetectionAdapterBind } from '../jsbindings/ShapeDetectionAdapterBind';
import { SpeechAdapterBind } from '../jsbindings/SpeechAdapterBind';
import { SubWindowAdapterBind } from '../jsbindings/SubWindowAdapterBind';
import { SystemFloatingWindowAdapterBind } from './SystemFloatingWindowAdapterBind';
import { StatusBarManagerAdapterBind } from './StatusBarManagerAdapterBind';
import { WebAppAdapterBind } from './WebAppAdapterBind';

export class JsBindingMethod {
  static bind() {
    AccessibilityAdapterBind.bind();
    AppLifecycleAdapterBind.bind();
    AppWindowAdapterBind.bind();
    BluetoothAdapterBind.bind();
    BluetoothLowEnergyAdapterBind.bind();
    BrowserPolicyAdapterBind.bind();
    CertManagerAdapterBind.bind();
    ContextAdapterBind.bind();
    ContextPathAdapterBind.bind();
    CursorAdapterBind.bind();
    DeviceAdapterBind.bind();
    DeviceUserAuthAdapterBind.bind();
    DialogAdapterBind.bind();
    DisplayAdapterBind.bind();
    DragDropAdapterBind.bind();
    ElectronAppAdapterBind.bind();
    EtsBridgeAdapterBind.bind();
    FileManagerAdapterBind.bind();
    FilePickerAdapterBind.bind();
    FontAdapterBind.bind();
    I18nAdapterBind.bind();
    IMFAdapterBind.bind();
    MediaAdapterBind.bind();
    MimeTypeAdapterBind.bind();
    NativeMessagingAdapterBind.bind();
    NativeThemeAdapterBind.bind();
    NotificationAdapterBind.bind();
    PermissionManagerAdapterBind.bind();
    PopupWindowAdapterBind.bind();
    PrintAdapterBind.bind();
    ProcessAdapterBind.bind();
    RunningLockAdapterBind.bind();
    ScreenshotAdapterBind.bind();
    ShapeDetectionAdapterBind.bind();
    SpeechAdapterBind.bind();
    StatusBarManagerAdapterBind.bind();
    SubWindowAdapterBind.bind();
    SystemFloatingWindowAdapterBind.bind();
    WebAppAdapterBind.bind();
  }
}
