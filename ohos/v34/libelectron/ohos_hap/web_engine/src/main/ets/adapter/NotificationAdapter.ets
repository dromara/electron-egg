// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import common from '@ohos.app.ability.common';
import { inject, injectable } from 'inversify';
import Base from '@ohos.base';
import commonEventManager from '@ohos.commonEventManager';
import image from '@ohos.multimedia.image';
import notificationManager from '@ohos.notificationManager';
import wantAgent, { WantAgent } from '@ohos.app.ability.wantAgent';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { NotificationAdapterRequest, NotificationAdapterImage, NotificationAdapterButton } from '../interface/CommonInterface'
import { ContextAdapter } from './ContextAdapter';

const TAG: string = 'Notification';
const GROUP_NAME: string = 'chromeJSNotificationGroup';
const NOTIFICATION_IMAGE_EDITABLE: boolean = false;
const NOTIFICATION_IMAGE_PIXEL_FORMAT: number = 4;
const ICON_MAX_SIZE: number = 30720;
const HUNDRED: number = 100;
const CLICK_WANT_AGENT_REQUEST_CODE: number = 100;
const CLICK_EVENT: string = 'chrome.notification.click';
const CLOSE_EVENT: string = 'chrome.notification.close';
const BUTTON_CLICK_EVENT: string = 'chrome.notification.button.click';
const NOTIFICATION_LIST: NotificationAdapterRequest[] = [];
const NOTIFICATION_ERROR_CODE_DISABLED: number = 1600004;

@injectable()
export class NotificationAdapter extends BaseAdapter {
  private customEventSubscriber: commonEventManager.CommonEventSubscriber | undefined = undefined;
  private ctxAdapter: ContextAdapter;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.init();
  }

  override init() {
    this.createSubscriber();
  }

  override unInit() {
    this.removeSubscriber();
  }

  @LogMethod
  async sendNotification(request: NotificationAdapterRequest) {
    this.checkNotificationAuthorization(async (grant) => {
      NOTIFICATION_LIST.push(request);
      if (!grant) {
        LogUtil.error(TAG, 'Failed to grant notification permission');
        return;
      }
      while (NOTIFICATION_LIST.length > 0) {
        const request = NOTIFICATION_LIST.shift();
        if (!request) {
          LogUtil.error(TAG, 'Failed to get notification request');
          return;
        }
        try {
          let notificationRequest = await this.createNotificationRequest(request);
          await notificationManager.publish(notificationRequest);
        } catch (err) {
          LogUtil.error(TAG, `Failed to send notification: ${JSON.stringify(err)}`);
        }
      }
    })
  }

  @LogMethod
  async closeNotification(notificationId: number) {
    notificationManager.cancel(notificationId);
  }

  @LogMethod
  getAllNotification(callback: Function) {
    notificationManager.getActiveNotifications()
      .then((data: Array<notificationManager.NotificationRequest>) => {
        let notificationIds: Array<number> = new Array<number>();
        for (let i = 0; i < data.length; i++) {
          if (data[i].id !== undefined) {
            let notificationId: number = data[i].id as number;
            notificationIds.push(notificationId);
          }
        }
        callback(notificationIds);
      }).catch((err: Base.BusinessError) => {
      LogUtil.error(TAG, `getActiveNotificationCount fail: ${JSON.stringify(err)}`);
      callback(new Array<number>());
    });
  }

  @LogMethod
  requestNotificationPermission() {
    let activeContext = this.ctxAdapter.getActiveContext() as common.UIAbilityContext;
    if (!activeContext) {
      LogUtil.error(TAG, 'Failed to get active context');
      return;
    }
    notificationManager.requestEnableNotification(activeContext)
      .then(() => {})
      .catch((err: Base.BusinessError) => {
        LogUtil.error(TAG, `requestNotificationPermission fail: ${JSON.stringify(err)}`);
      });
  }

  @LogMethod
  checkNotificationEnabled(callback: (enabled: boolean) => void) { 
    notificationManager.isNotificationEnabled()
      .then((enable) => {
        callback(enable);
      }).catch((err: Base.BusinessError) => {
        LogUtil.error(TAG, `isNotificationEnabled fail: ${JSON.stringify(err)}`);
        callback(false);
      });
  }

  private checkNotificationAuthorization(callback: (grant: boolean)=>void) {
    notificationManager.isNotificationEnabled().then((enable) => {
      if (enable) {
        callback(true);
      } else {
        let activeContext = this.ctxAdapter.getActiveContext() as common.UIAbilityContext;
        if (!activeContext) {
          LogUtil.error(TAG, 'Failed to get active context');
          callback(false);
          return;
        }
        notificationManager.requestEnableNotification(activeContext).then(() => {
          callback(true);
        }).catch((err: Base.BusinessError) => {
          if (NOTIFICATION_ERROR_CODE_DISABLED == err.code) {
            LogUtil.info(TAG, 'checkNotificationAuthorization success');
            callback(true);
          } else {
            LogUtil.error(TAG, `requestEnableNotification fail: ${JSON.stringify(err)}`);
            callback(false);
          }
        })
      }
    }).catch((err: Base.BusinessError) => {
      LogUtil.error(TAG, `isNotificationEnabled fail: ${JSON.stringify(err)}`);
      callback(false);
    })
  }

  private async createNotificationRequest(
    request: NotificationAdapterRequest): Promise<notificationManager.NotificationRequest> {
    let notificationRequest: notificationManager.NotificationRequest = {
      id: request.notificationId,
      content: {
        notificationContentType: notificationManager.ContentType.NOTIFICATION_CONTENT_BASIC_TEXT,
      },
      tapDismissed: false,
      groupName: GROUP_NAME,
    };
    let normal: notificationManager.NotificationBasicContent = {
      title: request.title,
      text: request.message
    };
    notificationRequest.content.normal = normal;
    let notificationIcon = await this.convertImagePixelMap(request.icon);
    if (notificationIcon) {
      notificationIcon = await this.verifyNotificationIcon(notificationIcon);
      notificationRequest.largeIcon = notificationIcon;
    }
    if (request.requireInteraction) {
      notificationRequest.extraInfo = {
        'hw_keep_headsup_sticky': true
      }
    }
    if (request.timestamp) {
      notificationRequest.deliveryTime = request.timestamp;
    }
    if (request.silent) {
      notificationRequest.notificationSlotType =
        notificationManager.SlotType.CONTENT_INFORMATION;
    } else {
      notificationRequest.notificationSlotType =
        notificationManager.SlotType.SOCIAL_COMMUNICATION;
    }
    await this.createWantAgent(request.notificationId, CLICK_EVENT, undefined)
      .then((data) => {
        notificationRequest.wantAgent = data;
      })
    await this.createWantAgent(request.notificationId, CLOSE_EVENT, undefined)
      .then((data) => {
        notificationRequest.removalWantAgent = data;
      })
    if (request.buttons !== undefined && request.buttons.length > 0) {
      await this.createActionButtons(request.notificationId, request.buttons)
        .then((data) => {
          notificationRequest.actionButtons = data;
        })
    }
    return notificationRequest;
  }

  private async convertImagePixelMap(requestImage: NotificationAdapterImage)
    : Promise<image.PixelMap | undefined>  {
    let pixmap: image.PixelMap;
    if (requestImage.width === 0 || requestImage.height === 0) {
      LogUtil.warn(TAG, 'image is empty, no conversion required');
      return undefined;
    }
    let opts: image.InitializationOptions = {
      editable: NOTIFICATION_IMAGE_EDITABLE,
      pixelFormat: NOTIFICATION_IMAGE_PIXEL_FORMAT,
      size: {
        height: requestImage.height,
        width: requestImage.width
      }
    }
    try {
      pixmap = await image.createPixelMap(requestImage.buff, opts);
      return pixmap;
    } catch (error) {
      LogUtil.error(TAG, 'failed convert pixel map: ' +  JSON.stringify(error));
      return undefined;
    }
  }

  private async verifyNotificationIcon(notificationIcon: image.PixelMap)
    : Promise<image.PixelMap> {
    if (notificationIcon.getPixelBytesNumber() > ICON_MAX_SIZE) {
      let ratio: number = ICON_MAX_SIZE / notificationIcon.getPixelBytesNumber();
      ratio = Math.floor(Math.sqrt(ratio) * HUNDRED) / HUNDRED ;
      await notificationIcon.scale(ratio, ratio);
    }
    return notificationIcon;
  }

  private async createWantAgent(notificationId: number,
    actionName: string,
    buttonIndex: number | undefined): Promise<WantAgent> {
    let wantAgentInfo: wantAgent.WantAgentInfo = {
      wants: [
        {
          action: actionName,
        }
      ],
      actionType: wantAgent.OperationType.SEND_COMMON_EVENT,
      requestCode: CLICK_WANT_AGENT_REQUEST_CODE,
      actionFlags: [wantAgent.WantAgentFlags.CONSTANT_FLAG],
    };
    if (buttonIndex) {
      wantAgentInfo.wants[0].parameters = {
        notificationId: notificationId,
        buttonIndex: buttonIndex
      }
    } else {
      wantAgentInfo.wants[0].parameters = {
        notificationId: notificationId,
      }
    }
    let clickWantAgent: WantAgent = await wantAgent.getWantAgent(wantAgentInfo);
    return clickWantAgent;
  }

  private subscribeCallBack(err: Base.BusinessError,
    data: commonEventManager.CommonEventData) {
    if (err) {
      LogUtil.error(TAG, `Failed to subscribe event. Cause ${JSON.stringify(err)}`);
      return;
    }
    let notificationId: number = data.parameters?.notificationId;
    switch (data.event) {
      case CLICK_EVENT:
        this.nativeContext.OnNotificationClickCallback(notificationId);
        break;
      case CLOSE_EVENT:
        this.nativeContext.OnNotificationCloseCallback(notificationId);
        break;
      case BUTTON_CLICK_EVENT:
        let buttonIndex: number = data.parameters?.buttonIndex;
        this.nativeContext.OnNotificationButtonClickCallback(notificationId, buttonIndex);
        break;
      default:
        break;
    }
  }

  private createSubscriberCallBack(err: Base.BusinessError,
    data: commonEventManager.CommonEventSubscriber) {
    if (err) {
      LogUtil.error(TAG, `Failed to create subscriber. Cause ${JSON.stringify(err)}`);
      return;
    }
    if (data !== null) {
      this.customEventSubscriber = data;
      commonEventManager.subscribe(this.customEventSubscriber,
        (err, data) => this.subscribeCallBack(err, data));
    } else {
      LogUtil.error(TAG, `The envent subscriber does not exist`);
    }
  }

  private createSubscriber() {
    let subscribeInfo: commonEventManager.CommonEventSubscribeInfo = {
      events: [CLICK_EVENT, CLOSE_EVENT, BUTTON_CLICK_EVENT],
    }
    commonEventManager.createSubscriber(subscribeInfo,
      (err, data) => this.createSubscriberCallBack(err,data));
  }

  private removeSubscriber() {
    if (this.customEventSubscriber) {
      commonEventManager.unsubscribe(this.customEventSubscriber);
      this.customEventSubscriber = undefined;
    }
  }

  private async createActionButtons(notificationId: number,
    buttons: Array<NotificationAdapterButton>)
    : Promise<Array<notificationManager.NotificationActionButton>> {
    let actionButtons = new Array<notificationManager.NotificationActionButton>();
    for (let button of buttons) {
      await this.createWantAgent(notificationId, BUTTON_CLICK_EVENT, button.buttonIndex)
        .then((data) => {
          let actionButton: notificationManager.NotificationActionButton = {
            title: button.title,
            wantAgent: data,
          }
          actionButtons.push(actionButton);
        })
    }
    return actionButtons;
  }
}