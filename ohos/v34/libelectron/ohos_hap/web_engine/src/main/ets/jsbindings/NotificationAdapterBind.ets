// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { NotificationAdapter } from '../adapter/NotificationAdapter';
import type { NotificationAdapterRequest } from '../interface/CommonInterface';

function implNotificationAdapter(): NotificationAdapter {
  return Inject.getOrCreate(NotificationAdapter);
}

async function sendNotification(request: NotificationAdapterRequest) {
  await implNotificationAdapter().sendNotification(request);
}

async function closeNotification(notificationId: number) {
  await implNotificationAdapter().closeNotification(notificationId);
}

async function getAllNotification(callback: Function) {
  await implNotificationAdapter().getAllNotification(callback);
}

function requestNotificationPermission() {
  implNotificationAdapter().requestNotificationPermission();
}

function checkNotificationEnabled(callback: (enabled: boolean) => void) {
  implNotificationAdapter().checkNotificationEnabled(callback);
}

export class NotificationAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('NotificationAdapter.SendNotification', sendNotification);
    JsBindingUtils.bindFunction("NotificationAdapter.CloseNotification", closeNotification);
    JsBindingUtils.bindFunction("NotificationAdapter.GetAllNotification", getAllNotification);
    JsBindingUtils.bindFunction("NotificationAdapter.RequestNotificationPermission", requestNotificationPermission);
    JsBindingUtils.bindFunction("NotificationAdapter.CheckNotificationEnabled", checkNotificationEnabled);
  }
}