// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export class ConfigData {
  static DOMAIN: number = 0x0000;
  static TAG: string = '[WebEngine]';
  static WINDOW_PREFIX: string = 'browser';
  static DEFAULT_WINDOW_ID: string = 'browser1';
  static INVALID_DISPLAY_ID: number = -1;
}
let configData = new ConfigData();
export default configData as ConfigData;

export enum PanAction {
  kStart = 0,
  kUpdate,
  kEnd,
  kCancel,
}

export enum ContextType {
  kMainProcess = 0,
  kRenderProcess,
  kCrashpadHandler,
}

export enum WebStatus {
  kInit = 0,
  kStart,
  kDestroy,
}

// Values must stay in sync with CommandType in
// ohos/adapter/browser/browser_adapter.h.
export enum CommandType {
  kNewWindow,
  kNewWebContent,
  kNewWidget,
  kGetWidget,
  kGetNextWidgetId,
  kGetLastActiveWidget,
  kOpenURL,
  kAppQuit,
  kSecondInstance,
}

// From the setWindowDecorHeight interface description in @ohos.window.ts
export enum kTitleBarHeightVP{
  kDefault = 37,
  kMinimum = 37,
  kMaximum = 112
}
