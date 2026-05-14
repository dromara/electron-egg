// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import type {
  CharacteristicInfo,
  DescriptorInfo,
  ServiceInfo
} from '../adapter/BluetoothLowEnergyAdapter';
import type ble from '@ohos.bluetooth.ble';
import type { AdvertisingParam } from '../interface/CommonInterface';
import lazy { BluetoothLowEnergyAdapter } from '../adapter/BluetoothLowEnergyAdapter';

function implBluetoothAdapter(): BluetoothLowEnergyAdapter {
  return Inject.getOrCreate(BluetoothLowEnergyAdapter);
}

function StartBluetoothDiscovery(): void {
  return implBluetoothAdapter().startBluetoothDiscovery();
}

function StopBluetoothDiscovery(): void {
  return implBluetoothAdapter().stopBluetoothDiscovery();
}

function StartDiscoveryMonitor(onReceiveEvent: (data: ArrayBuffer, scanResult: ble.ScanResult) => void): void {
  return implBluetoothAdapter().startDiscoveryMonitor(onReceiveEvent);
}

function StopDiscoveryMonitor(): void {
  return implBluetoothAdapter().stopDiscoveryMonitor();
}

function CreateGattClientDevice(deviceId: string, onGattChangeCallback: (state: number) => void): void {
  return implBluetoothAdapter().createGattClientDevice(deviceId, onGattChangeCallback);
}

function DisConnectGatt(deviceId: string): void {
  return implBluetoothAdapter().disconnectGatt(deviceId);
}

function StartAdvertising(param: AdvertisingParam, getAdvIdCallback: (advertising_id: number) => void): void {
  return implBluetoothAdapter().startAdvertising(param, getAdvIdCallback);
}

function StopAdvertising(advertisingId: number): void {
  return implBluetoothAdapter().stopAdvertising(advertisingId);
}

function OnAdvertisingStateChange(onReceiveEvent: (data: ble.AdvertisingStateChangeInfo) => void): void {
  return implBluetoothAdapter().onAdvertisingStateChange(onReceiveEvent);
}

function OffAdvertisingStateChange(): void {
  return implBluetoothAdapter().offAdvertisingStateChange();
}

function StartGattDiscovery(deviceId: string, callback: (ServiceInfos: Array<ServiceInfo>) => void): void {
  return implBluetoothAdapter().startGattDiscovery(deviceId, callback);
}

function CreateCharacteristic(serviceId: string, deviceId: string,
  callback: (characteristicInfos: Array<CharacteristicInfo>) => void): void {
  return implBluetoothAdapter().createCharacteristic(serviceId, deviceId, callback);
}

function CreateDescriptor(characteristicId: string, deviceId: string,
  callback: (descriptorInfos: Array<DescriptorInfo>) => void): void {
  return implBluetoothAdapter().createDescriptor(characteristicId, deviceId, callback);
}

function ReadCharacteristic(id: string, deviceId: string,
  callback: (error_code: Number, value: ArrayBuffer) => void): void {
  return implBluetoothAdapter().readCharacteristic(id, deviceId, callback);
}

function DeprecatedWriteCharacteristic(id: string, deviceId: string, value: ArrayBuffer,
  callback: (error_code: number) => void): void {
  return implBluetoothAdapter().deprecatedWriteCharacteristic(id, deviceId, value, callback);
}

function WriteCharacteristic(id: string, deviceId: string, writeType: number, value: ArrayBuffer,
  callback: (error_code: number) => void): void {
  return implBluetoothAdapter().writeCharacteristic(id, deviceId, writeType, value, callback);
}

function ReadDescriptor(id: string, deviceId: string,
  callback: (error_code: Number, value: ArrayBuffer) => void): void {
  return implBluetoothAdapter().readDescriptor(id, deviceId, callback);
}

function WriteDescriptor(id: string, deviceId: string, value: ArrayBuffer,
  callback: (error_code: number) => void): void {
  return implBluetoothAdapter().writeDescriptor(id, deviceId, value, callback);
}


function SubscribeToNotifications(id: string, deviceId: string,
  callback: (value: ArrayBuffer, error_code: number) => void): void {
  return implBluetoothAdapter().subscribeToNotifications(id, deviceId, callback);
}

function UnsubscribeFromNotifications(id: string, deviceId: string, callback: (error_code: number) => void): void {
  return implBluetoothAdapter().unsubscribeFromNotifications(id, deviceId, callback);
}

export class BluetoothLowEnergyAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StartBluetoothDiscovery', StartBluetoothDiscovery);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StopBluetoothDiscovery', StopBluetoothDiscovery);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StartDiscoveryMonitor', StartDiscoveryMonitor);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StopDiscoveryMonitor', StopDiscoveryMonitor);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.CreateGattClientDevice', CreateGattClientDevice);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.DisConnectGatt', DisConnectGatt);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StartAdvertising', StartAdvertising);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StopAdvertising', StopAdvertising);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.OnAdvertisingStateChange', OnAdvertisingStateChange);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.OffAdvertisingStateChange', OffAdvertisingStateChange);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.StartGattDiscovery', StartGattDiscovery);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.CreateCharacteristic', CreateCharacteristic);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.CreateDescriptor', CreateDescriptor);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.ReadCharacteristic', ReadCharacteristic);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.DeprecatedWriteCharacteristic',
      DeprecatedWriteCharacteristic);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.WriteCharacteristic', WriteCharacteristic);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.ReadDescriptor', ReadDescriptor);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.WriteDescriptor', WriteDescriptor);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.SubscribeToNotifications', SubscribeToNotifications);
    JsBindingUtils.bindFunction('BluetoothLowEnergyAdapter.UnsubscribeFromNotifications', UnsubscribeFromNotifications);
  }
}