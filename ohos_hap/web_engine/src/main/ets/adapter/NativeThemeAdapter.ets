// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable, inject } from 'inversify';
import ConfigurationConstant from '@ohos.app.ability.ConfigurationConstant';
import { BaseAdapter } from '../common/BaseAdapter';
import common from '@ohos.app.ability.common';
import LogMethod from '../common/LogDecorator';
import { ContextAdapter } from './ContextAdapter';

@injectable()
export class NativeThemeAdapter extends BaseAdapter {
  public static DARK_BACKGROUND_COLOR: string = '#FF3D3D3D';
  public static LIGHT_BACKGROUND_COLOR: string = '#FFFFFFFF';

  private themeSource: ConfigurationConstant.ColorMode;
  private ctxAdapter: ContextAdapter;
  private hasInit: boolean = false;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.themeSource = ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET;
    this.ctxAdapter.getContext()
      .getApplicationContext()
      .setColorMode(this.themeSource);
  }

  override init() {
    let activeContext = this.ctxAdapter.getActiveContext() as common.UIAbilityContext ||
                        this.ctxAdapter.getActiveContext() as common.UIExtensionContext;
    if (!activeContext) {
      return;
    }
    if (activeContext.config.colorMode !== undefined) {
      this.themeSource = activeContext.config.colorMode;
    }
  }

  @LogMethod
  getSystemNativeTheme(): ConfigurationConstant.ColorMode {
    if (!this.hasInit) {
      this.init();
      this.hasInit = true;
    }
    return this.themeSource;
  }

  setSystemNativeTheme(themeSource: ConfigurationConstant.ColorMode) {
    this.themeSource = themeSource;
    this.nativeContext.SetThemeSource(themeSource);
  }

  setAppColorMode(colorMode: ConfigurationConstant.ColorMode){
    this.ctxAdapter.getContext().getApplicationContext().setColorMode(colorMode);
  }

  /**
   * Get color mode from system theme.
   * Can not be called during the first
   * ability creating.
   * @returns true if color mode is dark.
   */
  public isDarkMode(): boolean {
    let colorMode = this.getSystemNativeTheme();
    return colorMode === ConfigurationConstant.ColorMode.COLOR_MODE_DARK;
  }

  /**
   * Get color mode from system theme.
   * Can not be called during the first
   * ability creating.
   * @returns true if color mode is light.
   */
  public isLightMode(): boolean {
    let colorMode = this.getSystemNativeTheme();
    return colorMode === ConfigurationConstant.ColorMode.COLOR_MODE_LIGHT;
  }
};
