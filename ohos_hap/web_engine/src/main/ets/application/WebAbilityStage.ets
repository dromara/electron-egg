// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import AbilityStage from '@ohos.app.ability.AbilityStage';
import { CommandType, ConfigData, ContextType } from '../common/Constants';
import JsBindingUtils from '../utils/JsBindingUtils';
import Want from '@ohos.app.ability.Want';
import lazy { GlobalThisHelper } from '../utils/GlobalThisHelper';
import lazy { NativeContext } from '../interface/CommonInterface';
import lazy { CommonDependencyProvider } from '../common/CommonDependencyProvider';
import { AbilityConstant } from '@kit.AbilityKit';
import { ConfigurationConstant, Configuration } from '@kit.AbilityKit';
import { NativeThemeAdapter } from '../adapter/NativeThemeAdapter'
import Inject from '../common/InjectModule';

const DELAYED_TIME = 0;
export class WebAbilityStage extends AbilityStage {
  static X_COMPONENT_ID: string = '';

  private nativeContext: NativeContext | undefined = undefined;
  private nativeThemeAdapter: NativeThemeAdapter | undefined;

  onCreate(): void {
    this.runTaskAsync();
  }

  onAcceptWant(want: Want): string {
    let instanceKey = want.parameters?.instanceKey;
    if (instanceKey) {
      return instanceKey.toString();
    }

    if (want.parameters?.openInNewWindow) {
      this.nativeContext?.ExecuteCommand(
        CommandType.kNewWindow, { url: want.uri });
      let result = this.nativeContext?.ExecuteCommand(
        CommandType.kGetNextWidgetId, { url: want.uri });
      let widgetId = result?.widget_Id;
      WebAbilityStage.X_COMPONENT_ID = ConfigData.WINDOW_PREFIX + widgetId;
      return ConfigData.WINDOW_PREFIX + widgetId;
    }
    
    if (GlobalThisHelper.isLaunched()) {
      let widgetId = this.nativeContext?.GetLastActiveWidgetId();
      if (widgetId) {
        return ConfigData.WINDOW_PREFIX + widgetId;
      }
    }
    this.context.getApplicationContext().tempDir;
    return ConfigData.DEFAULT_WINDOW_ID;
  }

  onPrepareTermination(): AbilityConstant.PrepareTermination {
    this.nativeContext?.ExecuteCommand(CommandType.kAppQuit, { is_sync: false });
    return AbilityConstant.PrepareTermination.TERMINATE_IMMEDIATELY;
  }

  onConfigurationUpdate(config: Configuration) {
    if (config.colorMode !== undefined) {
      this.nativeThemeAdapter?.setSystemNativeTheme(config.colorMode);
    }
  }

  private runTaskAsync() {
    setTimeout(() => {
      JsBindingUtils.initNativeContext(ContextType.kMainProcess);
      this.nativeContext = JsBindingUtils.getNativeContext(ContextType.kMainProcess);
      if (!GlobalThisHelper.isLaunched()) {
        let appContext = this.context.getApplicationContext();
        GlobalThisHelper.appInit(new CommonDependencyProvider(appContext));
      }
      import('../jsbindings/JsBindingMethod').then((ns:ESObject) => {
        ns.JsBindingMethod.bind();
        this.nativeThemeAdapter = Inject.get(NativeThemeAdapter);
        JsBindingUtils.SetContextPaths();
      }).catch(()=>{
        console.log('import failed');
      });
    }, DELAYED_TIME)
  }
}
