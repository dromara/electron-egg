// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ContainerModule } from 'inversify';

import { AbilityManager } from '../common/AbilityManager';
import { DragParamManager } from '../common/DragParamManager';
import { NodeHandleManager } from './NodeHandleManager';
import { SystemFloatingWindowManager } from './SystemFloatingWindowManager';

export const commonModule = new ContainerModule((bind) => {
  bind(AbilityManager).toSelf();
  bind(DragParamManager).toSelf();
  bind(SystemFloatingWindowManager).toSelf();
  bind(NodeHandleManager).toSelf();
});
