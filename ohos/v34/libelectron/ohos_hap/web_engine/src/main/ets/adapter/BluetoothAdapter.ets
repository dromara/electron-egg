// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import access from '@ohos.bluetooth.access';
import { BusinessError } from '@kit.BasicServicesKit';
import connection from '@ohos.bluetooth.connection';
import { BaseAdapter } from '../common/BaseAdapter';
import { injectable } from 'inversify';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

@injectable()
export class BluetoothAdapter extends BaseAdapter {
  private static TAG: string = 'BluetoothAdapter';
  private static onDiscoveryMonitorCallback: (result: Array<string>) => void;

  @LogMethod
  isBluetoothSwitched(): boolean {
    let state: access.BluetoothState = access.BluetoothState.STATE_OFF;
    try {
      state = access.getState();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `call isBluetoothSwitched failed, code is ${err.code}, message is ${err.message}`);
      return false;
    }
    if (state === access.BluetoothState.STATE_ON || state === access.BluetoothState.STATE_BLE_ON) {
      return true;
    }
    return false;
  }

  @LogMethod
  getAdapterName(): string {
    let localName: string = '--';
    try {
      if (this.isBluetoothSwitched()) {
        localName = connection.getLocalName();
      }
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `GetAdapterName failed, code is ${err.code}, message is ${err.message}`);
    }
    return localName;
  }

  @LogMethod
  setAdapterName(name: string): boolean {
    try {
      connection.setLocalName(name);
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `setAdapterName failed, code is ${err.code}, message is ${err.message}`);
      return false;
    }
    return true;
  }

  @LogMethod
  getBluetoothState(): number {
    let state: number = -1;
    try {
      let bluetoothState = access.getState();
      state = bluetoothState.valueOf();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `getBluetoothState failed, code is ${err.code}, message is ${err.message}`);
    }
    return state;
  }

  @LogMethod
  enableBluetooth(): void {
    try {
      if (!this.isBluetoothSwitched()) {
        access.enableBluetooth();
      }
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `enableBluetooth failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  disableBluetooth(): void {
    try {
      if (this.isBluetoothSwitched()) {
        access.disableBluetooth();
      }
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `disableBluetooth failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  startBluetoothStateMonitor(bluetoothStateCb: (state: number) => void): void {
    let errState = -1; // error code
    try {
      access.on('stateChange', (bluetoothState: access.BluetoothState) => {
        bluetoothStateCb(bluetoothState.valueOf());
      });
    } catch (err) {
      bluetoothStateCb(errState);
      LogUtil.error(BluetoothAdapter.TAG, `startBluetoothStateMonitor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  stopBluetoothStateMonitor(): void {
    try {
      access.off('stateChange');
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `stopBluetoothStateMonitor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  getBluetoothScanMode(): number {
    let result = -1; // error code
    try {
      let scanMode: connection.ScanMode = connection.getBluetoothScanMode();
      result = scanMode.valueOf();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `getBluetoothScanMode failed, code is ${err.code}, message is ${err.message}`);
    }
    return result;
  }

  @LogMethod
  setBluetoothScanMode(mode: number, duration: number): void {
    try {
      connection.setBluetoothScanMode(mode, duration);
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `setBluetoothScanMode failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  startBluetoothDiscovery(): void {
    try {
      connection.startBluetoothDiscovery();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `startBluetoothDiscovery failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  stopBluetoothDiscovery(): void {
    try {
      connection.stopBluetoothDiscovery();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `stopBluetoothDiscovery failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  startDiscoveryMonitor(deviceListCb: (deviceList: Array<string>) => void): void {
    try {
      BluetoothAdapter.onDiscoveryMonitorCallback = (deviceList: Array<string>) => {
        deviceListCb(deviceList);
      };
      connection.on('bluetoothDeviceFind', BluetoothAdapter.onDiscoveryMonitorCallback);
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `startDiscoveryMonitor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  stopDiscoveryMonitor(): void {
    try {
      connection.off('bluetoothDeviceFind', BluetoothAdapter.onDiscoveryMonitorCallback);
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `stopDiscoveryMonitor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  getRemoteDeviceName(device_id: string): string {
    let remoteDeviceName: string = '';
    try {
      remoteDeviceName = connection.getRemoteDeviceName(device_id);
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `getRemoteDeviceName failed, code is ${err.code}, message is ${err.message}`);
    }
    return remoteDeviceName;
  }

  @LogMethod
  getPairState(device_id: string): number {
    let state: number = 0;
    try {
      let bond_state: connection.BondState = connection.getPairState(device_id);
      state = bond_state.valueOf();
    } catch (err) {
      state = 0;
      LogUtil.error(BluetoothAdapter.TAG, `getRemoteDeviceName failed, code is ${err.code}, message is ${err.message}`);
    }
    return state;
  }

  @LogMethod
  getRemoteDeviceClass(deviceId: string): number {
    let deviceClass: number = 0;
    try {
      let remoteDeviceClass: connection.DeviceClass = connection.getRemoteDeviceClass(deviceId);
      deviceClass = remoteDeviceClass.majorMinorClass.valueOf();
    } catch (err) {
      deviceClass = 0;
      LogUtil.error(BluetoothAdapter.TAG, `getRemoteDeviceClass failed, code is ${err.code}, message is ${err.message}`);
    }
    return deviceClass;
  }

  @LogMethod
  pairDevice(deviceId: string, pairCb: (isSuccess: boolean) => void): void {
    try {
      connection.pairDevice(deviceId, (err: BusinessError) => {
        if (err) {
          pairCb(false);
          LogUtil.error(BluetoothAdapter.TAG, `pairDevice failed, code is ${err.code}, message is ${err.message}`);
          return;
        }
        pairCb(true);
      });
    } catch (err) {
      pairCb(false);
      LogUtil.error(BluetoothAdapter.TAG, `pairDevice failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  getPairedDevices(): Array<string> {
    let devices: Array<string> = [];
    try {
      devices = connection.getPairedDevices();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `getPairedDevices failed, code is ${err.code}, message is ${err.message}`);
    }
    return devices;
  }

  @LogMethod
  setDevicePinCode(deviceId: string, pinCode: string, setPinCodeCb: (isSuccess: boolean) => void): boolean {
    try {
      connection.setDevicePinCode(deviceId, pinCode, (err: BusinessError) => {
        if (err) {
          setPinCodeCb(false);
          LogUtil.error(BluetoothAdapter.TAG, `setDevicePinCode failed, code is ${err.code}, message is ${err.message}`);
          return;
        }
        setPinCodeCb(true);
      });
    } catch (err) {
      setPinCodeCb(false);
      LogUtil.error(BluetoothAdapter.TAG, `setDevicePinCode failed, code is ${err.code}, message is ${err.message}`);
      return false;
    }
    return true;
  }

  @LogMethod
  isBluetoothDiscovering(): boolean {
    let isDiscovering: boolean = false;
    try {
      isDiscovering = connection.isBluetoothDiscovering();
    } catch (err) {
      isDiscovering = false;
      LogUtil.error(BluetoothAdapter.TAG, `isBluetoothDiscovering failed, code is ${err.code}, message is ${err.message}`);
    }
    return isDiscovering;
  }

  @LogMethod
  getPairedState(deviceId: string): number {
    let state: number = 0;
    try {
      let pairState: connection.BondState = connection.getPairState(deviceId);
      state = pairState.valueOf();
    } catch (err) {
      LogUtil.error(BluetoothAdapter.TAG, `getPairedState failed, code is ${err.code}, message is ${err.message}`);
    }
    return state;
  }
};