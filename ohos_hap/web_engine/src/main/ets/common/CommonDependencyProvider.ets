// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { common } from '@kit.AbilityKit';
import { ContainerModule } from 'inversify';
import { Dependency, DependencyProvider } from '../interface/Dependency';
import { commonModule,  } from './CommonModule';
import { adapterModule } from './AdapterModule';

class CommonDependency implements Dependency {
  private context: common.Context;

  constructor(ctx: common.Context) {
    this.context = ctx;
  }

  public getContext(): common.Context {
    return this.context;
  }

  getCommonModule(): ContainerModule {
    return commonModule;
  }

  getAdapterModule(): ContainerModule {
    return adapterModule;
  }
}

export class CommonDependencyProvider implements DependencyProvider {
  private context: common.Context;

  constructor(ctx: common.Context) {
    this.context = ctx;
  }

  public createDependency(): Dependency {
    return new CommonDependency(this.context);
  }
}