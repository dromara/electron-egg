// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import ble from '@ohos.bluetooth.ble';
import HashMap from '@ohos.util.HashMap';
import constant from '@ohos.bluetooth.constant';
import { AdvertisingParam } from '../interface/CommonInterface';
import { ArrayList } from '@kit.ArkTS';

export interface ServiceInfo {
  identifier: string;
  device_id: string;
  service_uuid: string;
  is_primary: boolean;
};

export interface DescriptorInfo {
  identifier: string;
  device_id: string;
  service_uuid: string;
  characteristic_uuid: string;
  descriptor_uuid: string;
};

export interface CharacteristicInfo {
  identifier: string;
  device_id: string;
  service_uuid: string;
  properties: number;
  characteristic_uuid: string;
};

@injectable()
export class BluetoothLowEnergyAdapter extends BaseAdapter {
  private static TAG: string = 'BluetoothLowEnergyAdapter';
  static GATT_MAP: HashMap<string, ble.GattClientDevice> = new HashMap();
  static ON_GATT_CHANGE_CALLBACK: ((scanResults: Array<ble.ScanResult>) => void);
  static CHARACTERISTIC_MAP: HashMap<string, ble.BLECharacteristic> = new HashMap();
  static SERVICE_MAP: HashMap<string, ble.GattService> = new HashMap();
  static DESCRIPTOR_MAP: HashMap<string, ble.BLEDescriptor> = new HashMap();
  static CHARACTERISTIC_CHANGE_MAP: HashMap<string, (arr: ArrayBuffer, error_code: number) => void> = new HashMap();
  static PROPERTY_READ: number = 1 << 1;
  static PROPERTY_WRITE_WITHOUT_RESPONSE: number = 1 << 2;
  static PROPERTY_WRITE: number = 1 << 3;
  static PROPERTY_NOTIFY: number = 1 << 4;
  static PROPERTY_INDICATE: number = 1 << 5;
  static ERROR_NULL: number = -1;
  static ERROR_UN_KNOWN: number = 0;
  static ERROR_FAILED: number = 1;
  static ERROR_NOT_PERMITTED: number = 4;
  static WRITE: number = 1;
  static WRITE_NO_RESPONSE: number = 2;

  @LogMethod
  startBluetoothDiscovery(): void {
    try {
      let scanFilter: ble.ScanFilter = {};
      let scanOptions: ble.ScanOptions = {
        interval: 500,
        dutyMode: ble.ScanDuty.SCAN_MODE_LOW_POWER,
        matchMode: ble.MatchMode.MATCH_MODE_AGGRESSIVE,
      }
      ble.startBLEScan([scanFilter], scanOptions);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `startBLEScan failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  stopBluetoothDiscovery(): void {
    try {
      ble.stopBLEScan();
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `stopBLEScan failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  startDiscoveryMonitor(onReceiveEvent: (data: ArrayBuffer, scanResult: ble.ScanResult) => void): void {
    try {
      const onTransformReceiveEvent = (scanResults: Array<ble.ScanResult>) => {
        for (let scanResultsElement of scanResults) {
          const buffer: ArrayBuffer = scanResultsElement.data;

          onReceiveEvent(buffer.byteLength > 5 ? buffer.slice(5) : buffer, scanResultsElement);
        }
      }
      ble.on('BLEDeviceFind', onTransformReceiveEvent);
      BluetoothLowEnergyAdapter.ON_GATT_CHANGE_CALLBACK = onTransformReceiveEvent;
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `startDiscoveryMonitor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  stopDiscoveryMonitor(): void {
    try {
      ble.off('BLEDeviceFind', BluetoothLowEnergyAdapter.ON_GATT_CHANGE_CALLBACK);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `stopDiscoveryMonitor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  createGattClientDevice(deviceId: string, onGattChangeCallback: (state: number) => void): void {
    if (BluetoothLowEnergyAdapter.GATT_MAP.hasKey(deviceId)) {
      LogUtil.warn(BluetoothLowEnergyAdapter.TAG, `createGattClientDevice message:device is already exists`);
      return
    }
    try {
      let device: ble.GattClientDevice = ble.createGattClientDevice(deviceId);
      device.on('BLEConnectionStateChange', (state: ble.BLEConnectionChangeState) => {
        let connectState: ble.ProfileConnectionState = state.state;
        if (connectState === constant.ProfileConnectionState.STATE_CONNECTED) {
          BluetoothLowEnergyAdapter.GATT_MAP.set(deviceId, device);
        } else if (connectState === constant.ProfileConnectionState.STATE_DISCONNECTED) {
          BluetoothLowEnergyAdapter.GATT_MAP.remove(deviceId);
        }
        onGattChangeCallback(connectState);
      });
      device.connect();
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `createGattClientDevice failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  disconnectGatt(deviceId: string): void {
    if (!BluetoothLowEnergyAdapter.GATT_MAP.hasKey(deviceId)) {
      LogUtil.warn(BluetoothLowEnergyAdapter.TAG, `disconnectGatt message:device is not exists`);
      return
    }
    let device: ble.GattClientDevice = BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)
    try {
      device.disconnect();
      device.off('BLEConnectionStateChange');
      BluetoothLowEnergyAdapter.GATT_MAP.remove(deviceId);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `createGattClientDevice failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  onAdvertisingStateChange(onReceiveEvent: (data: ble.AdvertisingStateChangeInfo) => void) {
    try {
      ble.on('advertisingStateChange', onReceiveEvent);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `onAdvertisingStateChange failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  offAdvertisingStateChange() {
    try {
      ble.off('advertisingStateChange');
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `offAdvertisingStateChange failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  startAdvertising(param: AdvertisingParam, getAdvIdCallback: (advertising_id: number) => void): void {
    let advManufactureData: Array<ble.ManufactureData> = [];
    param.manufacturer_data.forEach((value: Uint8Array, key: number) => {
      advManufactureData.push({
        manufactureId: key,
        manufactureValue: value
      })
    })
    let resManufactureData: Array<ble.ManufactureData> = [];
    param.scan_response_data.forEach((value: Uint8Array, key: number) => {
      resManufactureData.push({
        manufactureId: key,
        manufactureValue: value
      })
    })

    let serviceData: Array<ble.ServiceData> = [];
    param.service_data.forEach((value: Uint8Array, key: string) => {
      serviceData.push({
        serviceUuid: key,
        serviceValue: value
      })
    })

    try {
      let setting: ble.AdvertiseSetting = {
        interval: 150,
        txPower: 0,
        connectable: param.connectable,
      };

      let advData: ble.AdvertiseData = {
        serviceUuids: param.service_uuids,
        manufactureData: advManufactureData,
        serviceData: serviceData,
      };
      let advResponse: ble.AdvertiseData = {
        serviceUuids: param.service_uuids,
        manufactureData: resManufactureData,
        serviceData: serviceData,
      };
      let advertisingParams: ble.AdvertisingParams = {
        advertisingSettings: setting,
        advertisingData: advData,
        advertisingResponse: advResponse,
        duration: 0,
      }
      ble.startAdvertising(advertisingParams)
        .then(outAdvHandle => {
          getAdvIdCallback(outAdvHandle);
        });
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `createGattClientDevice failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  stopAdvertising(advertisingId: number): void {
    try {
      ble.stopAdvertising(advertisingId);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `stopAdvertising failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  static InitServices(deviceId: string, callback: (ServiceInfos: Array<ServiceInfo>) => void) {
    let device = BluetoothLowEnergyAdapter.GetGattDevice(deviceId);
    BluetoothLowEnergyAdapter.ClearMapByDevice(deviceId, BluetoothLowEnergyAdapter.SERVICE_MAP);
    BluetoothLowEnergyAdapter.ClearMapByDevice(deviceId, BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP);
    BluetoothLowEnergyAdapter.ClearMapByDevice(deviceId, BluetoothLowEnergyAdapter.DESCRIPTOR_MAP);
    BluetoothLowEnergyAdapter.setServicesMap(deviceId, device, callback)
  }

  static ClearMapByDevice(deviceId: string, map: HashMap<string, object>) {
    let keys = new ArrayList<string>();
    map.forEach((value, key) => {
      if (key?.startsWith(deviceId)) {
        keys.add(key);
      }
    })
    keys.forEach((key) => {
      map.remove(key);
    })
  }

  static GetGattDevice(deviceId: string): ble.GattClientDevice {
    if (BluetoothLowEnergyAdapter.GATT_MAP.hasKey(deviceId)) {
      let device = BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId);
      if (device !== undefined) {
        return device;
      }
    }
    return ble.createGattClientDevice(deviceId);
  }

  static setServicesMap(deviceId: string, device: ble.GattClientDevice, callback: (ServiceInfos: Array<ServiceInfo>) => void) {
    let ServiceInfos = new Array<ServiceInfo>();
    device.getServices().then((result: Array<ble.GattService>) => {
      result.forEach((serv) => {
        let identifier = deviceId + "_" + serv.serviceUuid
        BluetoothLowEnergyAdapter.SERVICE_MAP.set(deviceId + "_" + serv.serviceUuid, serv);
        let serviceInfo: ServiceInfo = {
          identifier: identifier,
          device_id: deviceId,
          service_uuid: serv.serviceUuid,
          is_primary: serv.isPrimary
        }
        ServiceInfos.push(serviceInfo);

      })
      callback(ServiceInfos);
    })
  }

  @LogMethod
  readCharacteristic(id: string, deviceId: string, callback: (error_code: Number, value: ArrayBuffer) => void) {
    let characteristic = BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP.get(id);
    if (characteristic === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  characteristic, id is ${id}`);
      callback(BluetoothLowEnergyAdapter.ERROR_FAILED, new ArrayBuffer(8));
      return;
    }
    try {
      BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)?.readCharacteristicValue(characteristic);
      callback(BluetoothLowEnergyAdapter.ERROR_NULL, characteristic.characteristicValue);
    } catch (err) {
      let err_type = this.getErrorType(err.code);
      callback(err_type, new ArrayBuffer(8));
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `readCharacteristic  error , err.code is ${err.code} errMessage is  ${err.message}`);
    }
  }

  @LogMethod
  deprecatedWriteCharacteristic(id: string, deviceId: string, value: ArrayBuffer, callback: (error_code: number) => void) {
    let characteristic = BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP.get(id);
    if (characteristic === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  characteristic, id is ${id}`);
      callback(BluetoothLowEnergyAdapter.ERROR_FAILED);
      return;
    }
    try {
      characteristic.characteristicValue = value;
      BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)?.writeCharacteristicValue(characteristic, ble.GattWriteType.WRITE);
      callback(BluetoothLowEnergyAdapter.ERROR_NULL);
    } catch (err) {
      let err_type = this.getErrorType(err.code);
      callback(err_type);
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `writeCharacteristic  error , err.code is ${err.code} errMessage is  ${err.message}`);
    }
  }

  @LogMethod
  writeCharacteristic(id: string, deviceId: string, writeType: number, value: ArrayBuffer, callback: (error_code: number) => void) {
    let characteristic = BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP.get(id);
    if (characteristic === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  characteristic, id is ${id}`);
      callback(BluetoothLowEnergyAdapter.ERROR_FAILED);
      return;
    }
    try {
      characteristic.characteristicValue = value;
      if (BluetoothLowEnergyAdapter.WRITE === writeType) {
        BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)?.writeCharacteristicValue(characteristic, ble.GattWriteType.WRITE);
      } else {
        BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)?.writeCharacteristicValue(characteristic, ble.GattWriteType.WRITE_NO_RESPONSE);
      }
      callback(BluetoothLowEnergyAdapter.ERROR_NULL);
    } catch (err) {
      let err_type = this.getErrorType(err.code);
      callback(err_type);
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `writeCharacteristic  error , err.code is ${err.code} errMessage is  ${err.message}`);
    }
  }

  @LogMethod
  readDescriptor(id: string, deviceId: string, callback: (error_code: Number, value: ArrayBuffer) => void) {
    let descriptor = BluetoothLowEnergyAdapter.DESCRIPTOR_MAP.get(id);
    if (descriptor === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  descriptor, id is ${id}`);
      callback(BluetoothLowEnergyAdapter.ERROR_FAILED, new ArrayBuffer(8));
      return;
    }
    try {
      BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)?.readDescriptorValue(descriptor);
      callback(BluetoothLowEnergyAdapter.ERROR_NULL, descriptor.descriptorValue);
    } catch (err) {
      let err_type = this.getErrorType(err.code);
      callback(err_type, new ArrayBuffer(8));
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `writeCharacteristic  error , err.code is ${err.code} errMessage is  ${err.message}`);
    }
  }

  @LogMethod
  subscribeToNotifications(id: string, deviceId: string, callback: (value: ArrayBuffer, error_code: number) => void) {
    let characteristic = BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP.get(id);
    if (characteristic === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  characteristic, id is ${id}`);
      callback(new ArrayBuffer(8), BluetoothLowEnergyAdapter.ERROR_FAILED);
      return;
    }
    let device = BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)
    if (device === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  device, id is ${deviceId}`);
      callback(new ArrayBuffer(8), BluetoothLowEnergyAdapter.ERROR_FAILED);
      return;
    }
    device.setCharacteristicChangeNotification(characteristic, true);
    BluetoothLowEnergyAdapter.CHARACTERISTIC_CHANGE_MAP.set(id, callback);
    device.on('BLECharacteristicChange', (chara) => {
      let identifier = deviceId + "_" + chara.serviceUuid + "_" + chara.characteristicUuid;
      if (BluetoothLowEnergyAdapter.CHARACTERISTIC_CHANGE_MAP.hasKey(identifier)) {
        let callback = BluetoothLowEnergyAdapter.CHARACTERISTIC_CHANGE_MAP.get(identifier);
        callback(chara.characteristicValue, BluetoothLowEnergyAdapter.ERROR_NULL);
      } else {
        LogUtil.info(BluetoothLowEnergyAdapter.TAG, `characteristic not regist , id is ${identifier}`);
      }
    });
  }

  @LogMethod
  unsubscribeFromNotifications(id: string, deviceId: string, callback: (error_code: number) => void) {
    let device = BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)
    if (device === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  device, id is ${deviceId}`);
      callback(BluetoothLowEnergyAdapter.ERROR_FAILED);
      return;
    }
    BluetoothLowEnergyAdapter.CHARACTERISTIC_CHANGE_MAP.remove(id);
    try {
      if (BluetoothLowEnergyAdapter.CHARACTERISTIC_CHANGE_MAP.isEmpty()) {
        device.off('BLECharacteristicChange');
      }
      callback(BluetoothLowEnergyAdapter.ERROR_NULL);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `UnsubscribeFromNotifications  error , err.code is ${err.code} errMessage is  ${err.message}`);
      let err_type = this.getErrorType(err.code);
      callback(err_type);
    }

  }

  @LogMethod
  writeDescriptor(id: string, deviceId: string, value: ArrayBuffer, callback: (error_code: number) => void) {
    let descriptor = BluetoothLowEnergyAdapter.DESCRIPTOR_MAP.get(id);
    if (descriptor === undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  descriptor, id is ${id}`);
      callback(BluetoothLowEnergyAdapter.ERROR_FAILED);
    }
    descriptor.descriptorValue = value;
    try {
      BluetoothLowEnergyAdapter.GATT_MAP.get(deviceId)?.writeDescriptorValue(descriptor);
      callback(BluetoothLowEnergyAdapter.ERROR_NULL);
    } catch (err) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `writeDescriptor  error , err.code is ${err.code} errMessage is  ${err.message}`);
      let err_type = this.getErrorType(err.code);
      callback(err_type);
    }
  }

  getErrorType(error_code: number): number {
    if (error_code == 2901000 || error_code == 2901001) {
      return BluetoothLowEnergyAdapter.ERROR_NOT_PERMITTED;
    }
    if (error_code == 2900001 || error_code == 2900099) {
      return BluetoothLowEnergyAdapter.ERROR_FAILED;
    }
    return BluetoothLowEnergyAdapter.ERROR_UN_KNOWN;
  }

  @LogMethod
  startGattDiscovery(deviceId: string, callback: (ServiceInfos: Array<ServiceInfo>) => void): void {
    BluetoothLowEnergyAdapter.InitServices(deviceId, callback);
  }

  @LogMethod
  createCharacteristic(serviceId: string, deviceId: string, callback: (characteristicInfo: Array<CharacteristicInfo>) => void) {
    let service = BluetoothLowEnergyAdapter.SERVICE_MAP.get(serviceId);
    if (service == undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  service, id is ${serviceId}`);
    }
    let CharacteristicInfos = new Array<CharacteristicInfo>();
    service.characteristics.forEach((chara) => {
      let identifier = deviceId + "_" + chara.serviceUuid + "_" + chara.characteristicUuid;
      BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP.set(identifier, chara);
      let properties = 0;
      if (chara.properties?.write) {
        properties = properties | BluetoothLowEnergyAdapter.PROPERTY_WRITE;
      }
      if (chara.properties?.read) {
        properties = properties | BluetoothLowEnergyAdapter.PROPERTY_READ;
      }
      if (chara.properties?.notify) {
        properties = properties | BluetoothLowEnergyAdapter.PROPERTY_NOTIFY
      }
      if (chara.properties?.writeNoResponse) {
        properties = properties | BluetoothLowEnergyAdapter.PROPERTY_WRITE_WITHOUT_RESPONSE
      }
      if (chara.properties?.indicate) {
        properties = properties | BluetoothLowEnergyAdapter.PROPERTY_INDICATE
      }

      let characteristicInfo: CharacteristicInfo = {
        identifier: identifier,
        device_id: deviceId,
        service_uuid: chara.serviceUuid,
        characteristic_uuid: chara.characteristicUuid,
        properties: properties
      }
      CharacteristicInfos.push(characteristicInfo);
    })
    callback(CharacteristicInfos);
  }

  @LogMethod
  createDescriptor(characteristicId: string, deviceId: string, callback: (DescriptorInfo: Array<DescriptorInfo>) => void) {
    let DescriptorInfos = new Array<DescriptorInfo>();
    let characteristic = BluetoothLowEnergyAdapter.CHARACTERISTIC_MAP.get(characteristicId);
    if (characteristic == undefined) {
      LogUtil.error(BluetoothLowEnergyAdapter.TAG, `missing  characteristic, id is ${characteristicId}`);
    }
    characteristic.descriptors.forEach((des) => {
      let identifier = deviceId + "_" + des.serviceUuid + "_" + des.characteristicUuid + "_" + des.descriptorUuid;
      BluetoothLowEnergyAdapter.DESCRIPTOR_MAP.set(identifier, des);
      let descriptorInfo: DescriptorInfo = {
        identifier: identifier,
        device_id: deviceId,
        service_uuid: des.serviceUuid,
        characteristic_uuid: des.characteristicUuid,
        descriptor_uuid: des.descriptorUuid
      }
      DescriptorInfos.push(descriptorInfo);
    });
    callback(DescriptorInfos);
  }
}