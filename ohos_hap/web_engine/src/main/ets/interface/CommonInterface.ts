// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import type image from '@ohos.multimedia.image';
import type inputMethod from '@ohos.inputMethod';
import type GestureEvent from '@ohos.multimodalInput.gestureEvent';
import type ConfigurationConstant from '@ohos.app.ability.ConfigurationConstant';
import type common from '@ohos.app.ability.common';
import type window from '@ohos.window';

export interface ILoginInfo {
  status: boolean;
  authCode: string;
  unionId: string;
  openId: string;
  idToken: string;
  anonymousPhone: string;
}

export interface ILogin {
  loginCallbackFunc: (loginInfo: ILoginInfo) => void;
};

export interface WindowBound {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CaptionButtonRect {
  right: number;
  top: number;
  width: number;
  height: number;
}

export class JSBind {
  bindFunction: (name: string, func: Function) => number;
}

export interface CommandParameter {
  url?: string;
  user_data?: string;
  is_sync?: boolean;
}

export interface CommandResult {
  ret_code: number;
  widget_Id: number;
  last_widget_Id: number;
}

export interface WinLimits {
  max_height: number;
  max_width: number;
  min_height: number;
  min_width: number;
}

export interface NativeContext {
  runBrowser: (vec_args: string[]) => void;
  BrowserDestroyed: () => boolean;
  runOtherProcessType: (processType: number) => void;
  registerLifecycle: () => void;
  openFile: (filePath: string) => void;
  readImageFromReceiver: (receiver: image.ImageReceiver) => image.Image;
  JSBind: JSBind;
  OnPanEventCB: (action: number, id: string, event: GestureEvent) => void;
  OnPinchEventCB: (pinch_step: string, id: string, event: GestureEvent) => void;
  InsertTextCallback: (text: string) => void;
  DeleteBackCallback: (length: number) => void;
  DeleteForwardCallback: (length: number) => void;
  SendEnterKeyEventCallback: () => void;
  MoveCursorCallback: (direction: inputMethod.Direction) => void;
  SetThemeSource: (themeSource: ConfigurationConstant.ColorMode) => void;
  OnDragEnterCB: (id: string, dragInfo: OhosDropData, fileUris: Array<string>) => void;
  OnDragLeaveCB: (id: string) => void;
  OnDragEndCB: (id: string) => void;
  OnDragMoveCB: (id: string, windowX: number, windowY: number) => void;
  OnDropCB: (id: string, dragInfo: OhosDropData, fileUris: Array<string>) => void;
  OnFontSizeChangeCallback:(fontSizeZoom :number) => void;
  OnWindowInitSize: (windowRect: WindowBound, drawableRect: WindowBound, displayId: number) => void;
  OnWindowStatusChange: (id: string, status: window.WindowStatusType) => void;
  OnWindowVisibleChange: (windowId: String, visible: boolean) => void;
  OnWindowInitState: (state: window.WindowStatusType) => void;
  OnWindowRectChange: (id: string, event: WindowBound, reason: number) => void;
  OnWindowSizeChange: (id: string, event: WindowBound) => void;
  OnWindowEvent: (id: string, event: number) => void;
  OnWindowVisibilityChange: (id: string, visible: boolean) => void;
  OnKeyboardHeightChange: (id: string, height: number) => void;
  OnNotificationClickCallback: (id: number) => void;
  OnNotificationCloseCallback: (id: number) => void;
  OnNotificationButtonClickCallback: (id: number, buttonIndex) => void;
  OnAvailableAreaChangeCallback: (availableArea: WindowBound, displayId: number) => void;
  OnDisplayChangeCallback: (even: string, id: number) => void;
  ExecuteCommand: (id: number, param: CommandParameter) => CommandResult;
  GetBrowserCloseResponse: (id: number) => BrowserCloseResponse;
  RegisterWindowEventFilter: (origin_window_id: number) => void;
  ClearWindowEventFilter: (origin_window_id: number) => void;
  OnCaptionButtonRectChange: (id: string, event: CaptionButtonRect) => void;
  UpdateWindowDeviceModeSwitchCB: (mode: DeviceMode) => void;
  UpdateDisplayBrightnessCB: (display_brightness: string) => void;
  SetSystemWindowLimits: (windowLimits: WinLimits) => void;
  OnDeviceModeChange: (id: string, event: ChangeEventType, status: window.WindowStatusType) => void;
  OnWindowDisplayIdChange: (id: string, displayId: number) => void;
  OnAbilityStartedCB: (id: string) => void;
  IsSupportNodeHandleFeature: () => boolean;
  OnAvoidAreaChangeCallback: (statusBarHeight: number) => void;
  OnBackToLastPage: (id: string) => void;
  GetLastActiveWidgetId: () => number;
}

export interface IParams {
  id: string,
  size: number[], // [width, height]
  initColorRgb: string,
}

export interface OhosDragParamToJs {
  text: string;
  url: string;
  url_title: string;
  html: string;
  web_image_file_path: string;
  electronFilePath: string;
  bookmark_buffer: ArrayBuffer;
  web_custom_buffer: ArrayBuffer;
  pixelmap_buffer: ArrayBuffer;
  pixelmap_width: number;
  pixelmap_height: number;
  pixelmap_touch_x: number;
  pixelmap_touch_y: number;
  window_id: string;
}

export interface OhosDropData {
  text: string;
  url: string;
  urlTitle: string;
  html: string;
  fileUris: Array<string>;
  bookmarkBuffer: ArrayBuffer | undefined;
  webCustomBuffer: ArrayBuffer | undefined;
}

export interface IMFAdapterInputAttribute {
  inputPattern: inputMethod.TextInputType;
  enterKeyType: inputMethod.EnterKeyType;
}

export interface IMFAdapterCursorInfo {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface IMFAdapterTextConfig {
  inputAttribute: IMFAdapterInputAttribute;
  cursorInfo: IMFAdapterCursorInfo;
}

export interface NotificationAdapterImage {
  width: number;
  height: number;
  buff: ArrayBuffer;
}

export interface NotificationAdapterButton {
  title: string;
  buttonIndex: number;
}

export interface NotificationAdapterRequest {
  notificationId: number;
  title: string;
  message: string;
  requireInteraction: boolean;
  silent: boolean;
  timestamp: number;
  icon: NotificationAdapterImage;
  buttons: NotificationAdapterButton[];
}

export interface OhosPasteDataRecord {
  html_text: string;
  mime_type: string;
  plain_text: string;
}

export interface SpeakingParamsExtraParams {
  speed?: number;
  volume?: number;
  pitch?: number;
  languageContext?: string;
  audioType?: string;
  playType?: number;
  soundChannel?: number;
  queueMode?: number;
}

export interface SpeakingParams {
  requestId: string;
  extraParams?: SpeakingParamsExtraParams;
}

export interface EngineCreationParamsExtraParams {
  style?: string;
  locate?: string;
  name?: string;
}

export interface EngineCreationParams {
  language: string;
  online: number;
  person: number;
  extraParams?: EngineCreationParamsExtraParams;
}

export interface VoiceQueryExtraParams {
  language?: string;
  person?: number;
}

export interface VoiceQuery {
  requestId: string;
  online: number;
  extraParams?: VoiceQueryExtraParams
}

export interface VoiceInfo {
  language: string;
  person: number;
  style: string;
  status: string;
  gender: string;
  description: string;
}

export interface AdvertisingParam {
  connectable: boolean;
  service_uuids: string[];
  manufacturer_data: Map<number, Uint8Array>;
  service_data: Map<string, Uint8Array>;
  scan_response_data: Map<number, Uint8Array>;
}

// see the file
// src/ohos/adapter/common/constants.h
// The enumeration order should be kept the same
export enum WindowType {
  INVALID = -1,

  MAIN_WINDOW = 0,
  SUB_WINDOW,
  FLOAT_WINDOW
}

export enum WindowStatus{
  UNDEFINED,
  FULL_SCREEN,
  MAXIMIZE,
  MINIMIZE,
  FLOATING,
  SPLIT_SCREEN
}

export interface NewWindowParam {
  parent_id: string,
  window_id: string,
  bounds: WindowBound,
  init_color_argb: string,
  hide_title_bar: boolean,
  use_dark_mode: boolean,
  show: boolean,
  minimizable: boolean,
  maximizable: boolean,
  closable: boolean,
  always_on_top: boolean,
  resizable: boolean,
  is_modal: boolean,
  is_panel: boolean,
  is_stateless: boolean,
  display_id: number,
  ability_type: AbilityType,
  app_id: string,
  caption_button_visible: boolean,
}

export interface ISubWindowInfo {
  id: string,
  parentId: string,
  subWindow: window.Window,
  localStorage: LocalStorage,
}

export interface SelectFileDialogParams {
  multi_files: boolean,
  extensions: Array<Array<string>>,
  descriptions: Array<string>,
  include_all_files: boolean
}

export interface SaveAsDialogParams {
  file_name: string,
  dir_name: string,
  extensions: Array<Array<string>>,
  descriptions: Array<string>,
  include_all_files: boolean
}

export interface PointCoordinate {
  x: number
  y: number,
  displayId: number,
}

export enum BrowserCloseResponse {
  kUndetermined,
  kClosingContinue,
  kClosingInterrupt,
  kClosed,
  kCloseCancelled,
  kClosedAnyway,
}

export enum DeviceMode {
  kPcMode = 0,
  kNormalWindowMode,
  kFreeWindowsMode,
};

export enum ChangeEventType {
  CHANGE_TO_NORMAL_MODE = 0,
  CHANGE_TO_FREE_MODE
};

export enum AbilityType {
  kEntryAbility = 0,
  kStatelessAbility,
  kTaskManagerAbility,
}

export const kAbilityMap = new Map<AbilityType, string>([
  [AbilityType.kEntryAbility, 'EntryAbility'],
  [AbilityType.kStatelessAbility, 'StatelessAbility'],
  [AbilityType.kTaskManagerAbility, 'TaskManagerAbility']
])
// Electron
export interface WindowPreferences {
  hideTitleBar: boolean,
  minimizable: boolean,
  maximizable: boolean,
  closable: boolean,
}
