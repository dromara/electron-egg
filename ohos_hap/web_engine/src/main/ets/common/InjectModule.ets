// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import common from '@ohos.app.ability.common';
import { Container, interfaces, ContainerModule } from 'inversify';
import { MODULE_TYPE } from "./ModuleType";
import { Dependency, DependencyProvider } from '../interface/Dependency';

export default class InjectModule {
  private static container = new Container({ defaultScope: "Singleton" });
  private static dependency: Dependency;
  private static isInject: boolean = false;

  static inject(provider: DependencyProvider) {
    if (InjectModule.isInject) {
      return;
    }

    try {
      InjectModule.dependency = provider.createDependency();
      InjectModule.container.bind<common.Context>(MODULE_TYPE.Context).toDynamicValue(
        () => {
          return InjectModule.dependency.getContext();
        });
      InjectModule.container.load(InjectModule.dependency.getCommonModule(),
                                  InjectModule.dependency.getAdapterModule());
      InjectModule.isInject = true;
    } catch(err) {
      throw new Error('inject Module failed: ' + JSON.stringify(err));
    }
  }

  static get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    return InjectModule.container.get<T>(serviceIdentifier);
  }

  static getOrCreate<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    try {
      const module = InjectModule.container.get<T>(serviceIdentifier);
      if (module) {
        return module;
      }
    } catch (err) {
      const loadMode = new ContainerModule((bind:interfaces.Bind) => {
        bind(serviceIdentifier).toSelf()
      });
      InjectModule.container.load(loadMode);
      return InjectModule.container.get<T>(serviceIdentifier);
    } finally {
      return InjectModule.container.get<T>(serviceIdentifier);
    }
  }

  static destroy() {
    InjectModule.container.unbindAll();
  }
}
