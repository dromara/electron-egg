// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import Base from '@ohos.base';
import CommonEventManager from '@ohos.commonEventManager';
import usb from '@ohos.usbManager';
import { injectable } from 'inversify';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

interface EventInfo {
  type: number,
  data: Array<usb.USBDevice>
};

const EVENT_DEVICE_ATTATCHED: string = 'usual.event.hardware.usb.action.USB_DEVICE_ATTACHED';
const EVENT_DEVICE_DETATCHED: string = 'usual.event.hardware.usb.action.USB_DEVICE_DETACHED';

@injectable()
export class DeviceAdapter extends BaseAdapter {
  private static TAG: string = 'DeviceAdapter';
  private subscriber: CommonEventManager.CommonEventSubscriber | undefined = undefined;
  private subscribeInfo: CommonEventManager.CommonEventSubscribeInfo = {
    events: [
      CommonEventManager.Support.COMMON_EVENT_USB_DEVICE_ATTACHED,
      CommonEventManager.Support.COMMON_EVENT_USB_DEVICE_DETACHED,
    ]
  };

  @LogMethod
  getDevices(get_devices_cb?: Function) : boolean {
    let devices : Array<usb.USBDevice> = [];
    try {
      devices = usb.getDevices();
      if (get_devices_cb != undefined) {
        get_devices_cb(devices, devices.length);
      }
    } catch (err) {
      LogUtil.error(DeviceAdapter.TAG,
        `Failed to obtain device information, code is ${err.code}, message is ${err.message}`);
      return false;
    }
    return true;
  }

  @LogMethod
  registerHotplugCallback(hotplug_cb: Function): void {
    try {
      CommonEventManager.createSubscriber(this.subscribeInfo, (err, commonEventSubscriber) => {
        if (err) {
          LogUtil.error(DeviceAdapter.TAG, `CreateSubscriber failed, code is ${err.code}, message is ${err.message}`);
          return;
        }

        this.subscriber = commonEventSubscriber;
        CommonEventManager.subscribe(this.subscriber, (err, data) => {
          let eventInfo = this.parseEventData(err, data);
          if (eventInfo !== undefined && hotplug_cb !== undefined) {
            hotplug_cb(eventInfo.type, eventInfo.data, eventInfo.data.length);
          }
        });
      });
    } catch (err) {
      LogUtil.error(DeviceAdapter.TAG, `CreateSubscriber failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  private parseEventData(err: Base.BusinessError,
                         data: CommonEventManager.CommonEventData): EventInfo | undefined {
    if (err) {
      LogUtil.error(DeviceAdapter.TAG, `ParseEventData failed, code is ${err.code}, message is ${err.message}`);
      return undefined;
    }

    let eventType: number = 0;
    if (data.event === EVENT_DEVICE_ATTATCHED) {
      eventType = 1;
    } else if (data.event === EVENT_DEVICE_DETATCHED) {
      eventType = 2;
    }
    let devices: Array<usb.USBDevice> = [];
    if (eventType !== 0 && data.data !== undefined) {
      let usbDevice: usb.USBDevice = JSON.parse(data.data);
      if (usbDevice === undefined) {
        LogUtil.warn(DeviceAdapter.TAG, 'Parse event data error.');
        return undefined;
      }
      devices.push(usbDevice);
      let eventInfo: EventInfo = {
        type: eventType,
        data: devices
      };
      return eventInfo;
    }
    return undefined;
  }

  @LogMethod
  unregisterHotplugCallback(): void {
    try {
      CommonEventManager.unsubscribe(this.subscriber, (err: Base.BusinessError) => {
        if (err) {
          LogUtil.error(DeviceAdapter.TAG, `Unsubscribe failed, code is ${err.code}, message is ${err.message}`);
        }
      });
    } catch (err) {
      LogUtil.error(DeviceAdapter.TAG, `Unsubscribe failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  hasRight(deviceName: string): boolean {
    return usb.hasRight(deviceName);
  }

  @LogMethod
  requestRight(deviceName: string, callback: (isGranted: boolean) => void): void {
    try {
      usb.requestRight(deviceName).then((result: boolean) => callback(result)).catch(() => callback(false));
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `requestRight failed, code is ${err.code}, message is ${err.message}`);
      callback(false);
    }
  }

  @LogMethod
  removeRight(deviceName: string): boolean {
    try {
      return usb.removeRight(deviceName);
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `removeRight failed, code is ${err.code}, message is ${err.message}`);
      return false;
    }
  }

  @LogMethod
  openDevice(device: usb.USBDevice, callback: (pipe: usb.USBDevicePipe) => void): boolean {
    try {
      const devicePipe: usb.USBDevicePipe = usb.connectDevice(device);
      callback(devicePipe);
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `openDevice failed, code is ${err.code}, message is ${err.message}`);
      return false;
    }
    return true;
  }

  @LogMethod
  getRawDescriptor(pipe: usb.USBDevicePipe, callback: (descriptor: Uint8Array, length: number) => void): void {
    try {
      const rawDescriptor: Uint8Array = usb.getRawDescriptor(pipe);
      callback(rawDescriptor, rawDescriptor.length);
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `getRawDescriptor failed, code is ${err.code}, message is ${err.message}`);
    }
  }

  @LogMethod
  getFileDescriptor(pipe: usb.USBDevicePipe): number {
    try {
      return usb.getFileDescriptor(pipe);
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `getFileDescriptor failed, code is ${err.code}, message is ${err.message}`);
      return -1;
    }
  }

  @LogMethod
  releaseInterface(pipe: usb.USBDevicePipe, iface: usb.USBInterface): number {
    try {
      return usb.releaseInterface(pipe, iface);
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `releaseInterface failed, code is ${err.code}, message is ${err.message}`);
      return -1;
    }
  }

  @LogMethod
  closePipe(pipe: usb.USBDevicePipe): number {
    try {
      return usb.closePipe(pipe);
    } catch(err) {
      LogUtil.error(DeviceAdapter.TAG, `closePipe failed, code is ${err.code}, message is ${err.message}`);
      return -1;
    }
  }
}