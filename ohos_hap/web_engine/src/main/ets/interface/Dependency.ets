// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ContainerModule } from 'inversify';
import { common } from '@kit.AbilityKit';

export interface Dependency {
  getContext: () => common.Context;
  getCommonModule: () => ContainerModule;
  getAdapterModule: () => ContainerModule;
}

export interface DependencyProvider {
  createDependency: () => Dependency;
}
