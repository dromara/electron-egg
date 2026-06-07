// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import usb from '@ohos.usbManager';
import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { DeviceAdapter } from '../adapter/DeviceAdapter';

function implDeviceAdapter(): DeviceAdapter {
  return Inject.getOrCreate(DeviceAdapter);
}

function getDevices(callback?: Function): boolean {
  return implDeviceAdapter().getDevices(callback);
}

function hasRight(deviceName: string): boolean {
  return implDeviceAdapter().hasRight(deviceName);
}

function registerHotplugCallback(callback: Function): void {
  implDeviceAdapter().registerHotplugCallback(callback);
}

function unregisterHotplugCallback(): void {
  implDeviceAdapter().unregisterHotplugCallback();
}

function requestRight(deviceName: string, callback: (isGranted: boolean) => void): void {
  implDeviceAdapter().requestRight(deviceName, callback);
}

function removeRight(deviceName: string): boolean {
  return implDeviceAdapter().removeRight(deviceName);
}

function openDevice(device: usb.USBDevice, callback: (pipe: usb.USBDevicePipe) => void): boolean {
  return implDeviceAdapter().openDevice(device, callback);
}

function getRawDescriptor(pipe: usb.USBDevicePipe, callback: (descriptor: Uint8Array, length: number) => void): void {
  implDeviceAdapter().getRawDescriptor(pipe, callback);
}

function getFileDescriptor(pipe: usb.USBDevicePipe): number {
  return implDeviceAdapter().getFileDescriptor(pipe);
}

function releaseInterface(pipe: usb.USBDevicePipe, iface: usb.USBInterface): number {
  return implDeviceAdapter().releaseInterface(pipe, iface);
}

function closePipe(pipe: usb.USBDevicePipe): number {
  return implDeviceAdapter().closePipe(pipe);
}

export class DeviceAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('DeviceAdapter.GetDevices', getDevices);
    JsBindingUtils.bindFunction('DeviceAdapter.HasRight', hasRight);
    JsBindingUtils.bindFunction('DeviceAdapter.RegisterHotplugCallback', registerHotplugCallback);
    JsBindingUtils.bindFunction('DeviceAdapter.UnregisterHotplugCallback', unregisterHotplugCallback);
    JsBindingUtils.bindFunction('DeviceAdapter.RequestRight', requestRight);
    JsBindingUtils.bindFunction('DeviceAdapter.RemoveRight', removeRight);
    JsBindingUtils.bindFunction('DeviceAdapter.OpenDevice', openDevice);
    JsBindingUtils.bindFunction('DeviceAdapter.GetRawDescriptor', getRawDescriptor);
    JsBindingUtils.bindFunction('DeviceAdapter.GetFileDescriptor', getFileDescriptor);
    JsBindingUtils.bindFunction('DeviceAdapter.ReleaseInterface', releaseInterface);
    JsBindingUtils.bindFunction('DeviceAdapter.ClosePipe', closePipe);
  }
}