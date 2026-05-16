// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ContainerModule } from 'inversify';

import lazy { AppLifecycleAdapter } from '../adapter/AppLifecycleAdapter';
import lazy { ContextAdapter } from '../adapter/ContextAdapter';
import lazy { ContextPathAdapter } from '../adapter/ContextPathAdapter';
import lazy { DisplayAdapter } from '../adapter/DisplayAdapter';
import lazy { DragDropAdapter } from '../adapter/DragDropAdapter';
import lazy { MultiInputAdapter } from '../adapter/MultiInputAdapter';
import lazy { NativeThemeAdapter } from '../adapter/NativeThemeAdapter';
import lazy { PermissionManagerAdapter } from '../adapter/PermissionManagerAdapter';
import lazy { DeviceInfoAdapter } from '../adapter/DeviceInfoAdapter';

import lazy { DialogAdapter } from '../adapter/DialogAdapter';

// Only the adapters which used in WebAbility or WebWindow should be added here.
export const adapterModule = new ContainerModule((bind) => {
  bind(AppLifecycleAdapter).toSelf();
  bind(ContextAdapter).toSelf();
  bind(ContextPathAdapter).toSelf();
  bind(DisplayAdapter).toSelf();
  bind(DragDropAdapter).toSelf();
  bind(MultiInputAdapter).toSelf();
  bind(NativeThemeAdapter).toSelf();
  bind(PermissionManagerAdapter).toSelf();

  bind(DialogAdapter).toSelf();
  bind(DeviceInfoAdapter).toSelf();
});
