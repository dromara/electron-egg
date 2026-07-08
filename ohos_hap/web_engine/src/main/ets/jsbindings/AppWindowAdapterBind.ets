// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
import { NodeContent } from '@kit.ArkUI';
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { AppWindowAdapter } from '../adapter/AppWindowAdapter';
import type { NewWindowParam, PointCoordinate, WindowBound, ILoginInfo } from '../interface/CommonInterface';
import { window } from '@kit.ArkUI';

function implAppWindowAdapter(): AppWindowAdapter {
  return Inject.getOrCreate(AppWindowAdapter);
}

function createWindow(param: NewWindowParam) {
  implAppWindowAdapter().createWindow(param);
}

function closeWindow(id: number) {
  implAppWindowAdapter().closeWindow(id);
}

function showWindow(id: number) {
  implAppWindowAdapter().showWindow(id);
}

function hideWindow(id: number) {
  implAppWindowAdapter().hideWindow(id);
}

function activateWindow(id: number) {
  implAppWindowAdapter().activateWindow(id);
}

function setFullScreen(fullScreen: boolean, id: number) {
  implAppWindowAdapter().setFullScreen(fullScreen, id);
}

function setSimpleFullScreen(fullScreen: boolean, id: number) {
  implAppWindowAdapter().setSimpleFullScreen(fullScreen, id);
}

function restore(id: number) {
  implAppWindowAdapter().restore(id);
}

function setBounds(id: number,
                   hasFrame: boolean,
                   bounds: WindowBound) {
  implAppWindowAdapter().setBounds(id, hasFrame, bounds);
}

function setEnabled(enable: boolean, id: number) {
  implAppWindowAdapter().setEnabled(enable, id);
}

function setWindowLimits(minWidth: number,
                         minHeight: number,
                         maxWidth: number,
                         maxHeight: number,
                         id: number) {
  implAppWindowAdapter().setWindowLimits(minWidth, minHeight, maxWidth, maxHeight, id);
}

function maximize(id: number) {
  implAppWindowAdapter().maximize(id);
}

function unMaximize(id: number) {
  implAppWindowAdapter().unMaximize(id);
}

function minimize(id: number) {
  implAppWindowAdapter().minimize(id);
}

function setTitle(id: number, title:string) {
  implAppWindowAdapter().setTitle(id, title);
}

function setAspectRatio(id: number, aspectRatio: number) {
  implAppWindowAdapter().setAspectRatio(id, aspectRatio);
}

function setUseNativeFrame(id: number, useNativeFrame: boolean) {
  implAppWindowAdapter().setUseNativeFrame(id, useNativeFrame);
}

function setBackgroundColor(id: number, argbColor: number) {
  implAppWindowAdapter().setBackgroundColor(id, argbColor);
}

function setOpacity(id: number, opacity: number) {
  implAppWindowAdapter().setOpacity(id, opacity);
}

function setMaximizable(id: number, maximizable: boolean) {
  implAppWindowAdapter().setMaximizable(id, maximizable);
}

function setMinimizable(id: number, minimizable: boolean) {
  implAppWindowAdapter().setMinimizable(id, minimizable);
}

function setClosable(id: number, closable: boolean) {
  implAppWindowAdapter().setClosable(id, closable);
}

function setWindowButtonVisibility(id: number, visible: boolean) {
  implAppWindowAdapter().setWindowButtonVisibility(id, visible);
}

function getWindowButtonVisibility(id: number): boolean {
  return implAppWindowAdapter().getWindowButtonVisibility(id);
    JsBindingUtils.bindFunction("AppWindow.Bind", bind);
}

function setAlwaysOnTop(id: number, onTop: boolean) {
  implAppWindowAdapter().setAlwaysOnTop(id, onTop);
}

function setContentProtection(id: number, enable: boolean) {
  implAppWindowAdapter().setContentProtection(id, enable);
}
    JsBindingUtils.bindFunction("AppWindow.UnBind", unbind);

function setMovable(id: number, movable: boolean) {
  implAppWindowAdapter().setMovable(id, movable);
}

function setResizable(id: number, resizable: boolean) {
  implAppWindowAdapter().setResizable(id, resizable);
}

function startWindowMoving(id: number) {
  implAppWindowAdapter().startWindowMoving(id);
}

function getWindowsByCoordinate(coordinate: PointCoordinate,
                                callback: (windowIds: Array<string>) => void) {
  implAppWindowAdapter().getWindowsByCoordinate(coordinate, callback);
}

function setWindowModal(modal: boolean, id: number) {
  implAppWindowAdapter().setWindowModal(modal, id);
}

function getWindowStatus(id: number): window.WindowStatusType {
  return implAppWindowAdapter().getWindowStatus(id);
}

function shiftWindowMouseEvent(sourceId: number, targetId: number,
                          callback: (result: boolean) => void) {
  implAppWindowAdapter().shiftWindowMouseEvent(sourceId, targetId, callback);
}

function startWindowMovingWithOffset(id: number, offsetX: number, offsetY: number) {
  implAppWindowAdapter().startWindowMovingWithOffset(id, offsetX, offsetY);
}

function getOriginWindowIds(windowIds: Array<number>): Array<number> {
  return implAppWindowAdapter().getOriginWindowIds(windowIds);
}

function showHuaweiQuickLogin(
    id: number,
    show: boolean,
    bounds: WindowBound,
    callback: (loginInfo: ILoginInfo) => void) {
  implAppWindowAdapter().showHuaweiQuickLogin(id, show, bounds, callback);
}

function getWindowId(id: number): number {
  return implAppWindowAdapter().getWindowId(id);
}

function bind(id: string, callback: (nodeContent: NodeContent | undefined) => void) {
  implAppWindowAdapter().bind(id, callback);
}

function unbind(id: string, callback: (nodeContent: NodeContent | undefined) => void) {
  implAppWindowAdapter().unbind(id, callback);
}

function shiftWindowTouchEvent(sourceId: number, targetId: number,
  fingerId: number, callback: (result: boolean) => void) {
  implAppWindowAdapter().shiftWindowTouchEvent(sourceId, targetId, fingerId, callback);
}

export class AppWindowAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("AppWindow.CreateWindow", createWindow);
    JsBindingUtils.bindFunction("AppWindow.CloseWindow", closeWindow);
    JsBindingUtils.bindFunction("AppWindow.SetFullscreen", setFullScreen);
    JsBindingUtils.bindFunction("AppWindow.SetSimpleFullScreen", setSimpleFullScreen);
    JsBindingUtils.bindFunction("AppWindow.Restore", restore);
    JsBindingUtils.bindFunction("AppWindow.SetBounds", setBounds);
    JsBindingUtils.bindFunction("AppWindow.SetEnabled", setEnabled);
    JsBindingUtils.bindFunction("AppWindow.SetWindowLimits", setWindowLimits);
    JsBindingUtils.bindFunction("AppWindow.Maximize", maximize);
    JsBindingUtils.bindFunction("AppWindow.UnMaximize", unMaximize);
    JsBindingUtils.bindFunction("AppWindow.Minimize", minimize);
    JsBindingUtils.bindFunction("AppWindow.SetTitle", setTitle);
    JsBindingUtils.bindFunction("AppWindow.ShowWindow", showWindow);
    JsBindingUtils.bindFunction("AppWindow.HideWindow", hideWindow);
    JsBindingUtils.bindFunction("AppWindow.ActivateWindow", activateWindow);
    JsBindingUtils.bindFunction("AppWindow.SetAspectRatio", setAspectRatio);
    JsBindingUtils.bindFunction("AppWindow.SetUseNativeFrame", setUseNativeFrame);
    JsBindingUtils.bindFunction("AppWindow.SetBackgroundColor", setBackgroundColor);
    JsBindingUtils.bindFunction("AppWindow.SetOpacity", setOpacity);
    JsBindingUtils.bindFunction("AppWindow.SetMaximizable", setMaximizable);
    JsBindingUtils.bindFunction("AppWindow.SetMinimizable", setMinimizable);
    JsBindingUtils.bindFunction("AppWindow.SetClosable", setClosable);
    JsBindingUtils.bindFunction("AppWindow.SetWindowButtonVisibility", setWindowButtonVisibility);
    JsBindingUtils.bindFunction("AppWindow.GetWindowButtonVisibility", getWindowButtonVisibility);
    JsBindingUtils.bindFunction("AppWindow.SetAlwaysOnTop", setAlwaysOnTop);
    JsBindingUtils.bindFunction("AppWindow.SetContentProtection", setContentProtection);
    JsBindingUtils.bindFunction("AppWindow.SetMovable", setMovable);
    JsBindingUtils.bindFunction("AppWindow.SetResizable", setResizable);
    JsBindingUtils.bindFunction("AppWindow.StartWindowMoving", startWindowMoving);
    JsBindingUtils.bindFunction("AppWindow.GetWindowsByCoordinate", getWindowsByCoordinate);
    JsBindingUtils.bindFunction("AppWindow.SetWindowModal", setWindowModal);
    JsBindingUtils.bindFunction("AppWindow.GetWindowStatus", getWindowStatus);
    JsBindingUtils.bindFunction("AppWindow.ShiftWindowMouseEvent", shiftWindowMouseEvent);
    JsBindingUtils.bindFunction("AppWindow.StartWindowMovingWithOffset", startWindowMovingWithOffset);
    JsBindingUtils.bindFunction("AppWindow.GetOriginWindowIds", getOriginWindowIds);
    JsBindingUtils.bindFunction("AppWindow.ShowHuaweiQuickLogin", showHuaweiQuickLogin);
    JsBindingUtils.bindFunction("AppWindow.GetWindowId", getWindowId);
    JsBindingUtils.bindFunction("AppWindow.Bind", bind);
    JsBindingUtils.bindFunction("AppWindow.Unbind", unbind);
    JsBindingUtils.bindFunction("AppWindow.ShiftWindowTouchEvent", shiftWindowTouchEvent);
  }
}