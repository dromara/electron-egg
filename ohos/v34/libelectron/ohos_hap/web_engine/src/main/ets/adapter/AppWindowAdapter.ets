// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import bundleManager from '@ohos.bundle.bundleManager';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';
import { contextConstant, StartOptions } from '@kit.AbilityKit';
import { display, NodeContent, window } from '@kit.ArkUI';
import { deviceInfo } from '@kit.BasicServicesKit';
import { image } from '@kit.ImageKit';
import Want from '@ohos.app.ability.Want';

import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import { ContextAdapter } from './ContextAdapter';
import { IStyleData, IUpdateStyle, WindowStyle } from '../common/WindowStyle';
import LaunchHelper from '../utils/LaunchHelper';
import LogMethod from '../common/LogDecorator';
import LogUtil from '../utils/LogUtil';
import { NewWindowParam, PointCoordinate, WindowType, WindowBound, WindowPreferences, ILoginInfo, ILogin, kAbilityMap } from "../interface/CommonInterface"
import { DeviceInfoAdapter } from '../adapter/DeviceInfoAdapter';
import { NativeThemeAdapter } from './NativeThemeAdapter';
import { NodeHandleManager } from '../common/NodeHandleManager';

const TAG: string = 'AppWindow';

@injectable()
export class AppWindowAdapter extends BaseAdapter {
  private abilityManager: AbilityManager;
  private bundleName: string = 'com.huawei.ohos_electron';
  private bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION |
                        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_METADATA;
  private queryWindowNum: number = 10;  
  private ctxAdapter: ContextAdapter;
  private defaultBackgroundColor: string = '#00000000';
  private loginWindow: window.Window | null = null;
  private deviceInfoAdapter: DeviceInfoAdapter;
  private themeAdapter: NativeThemeAdapter;
  private nodeHandleManager: NodeHandleManager;

  constructor(
    @inject(AbilityManager) abilityManager: AbilityManager,
    @inject(ContextAdapter) ctxAdapter: ContextAdapter,
    @inject(DeviceInfoAdapter) deviceInfoAdapter: DeviceInfoAdapter,
    @inject(NativeThemeAdapter) themeAdapter: NativeThemeAdapter,
    @inject(NodeHandleManager) nodeHandleManager: NodeHandleManager
  ) {
    super();
    this.abilityManager = abilityManager;
    this.ctxAdapter = ctxAdapter;
    this.deviceInfoAdapter = deviceInfoAdapter;
    this.themeAdapter = themeAdapter;
    this.nodeHandleManager = nodeHandleManager;

    try {
      let data = bundleManager.getBundleInfoForSelfSync(this.bundleFlags);
      this.bundleName = data.name;
    } catch (err) {
      let message = (err as BusinessError).message;
      LogUtil.error(TAG, `getBundleInfoForSelfSync failed.: ${message}`);
    }
  }

  private getWindow(id: number): window.Window | undefined {
    return this.abilityManager.getProxy(id)?.getWindow();
  }

  private backgroundColor(useDarkMode: boolean): string {
    if (useDarkMode || this.themeAdapter.isDarkMode()) {
      return NativeThemeAdapter.DARK_BACKGROUND_COLOR;
    }
    return NativeThemeAdapter.LIGHT_BACKGROUND_COLOR;
  }

  @LogMethod
  createWindow(param: NewWindowParam) {
    LogUtil.info(TAG, `[ohoswindow] in AppWindowAdapter createWindow, param is ${JSON.stringify(param)}`);
    let abilityName: string = kAbilityMap.get(param.ability_type) ?? 'EntryAbility';
    const want: Want = {
      bundleName: this.bundleName,
      abilityName: abilityName,
      parameters: {
        'xcomponentId': param.window_id,
        'windowType': WindowType.MAIN_WINDOW,
        instanceKey: param.window_id,
        'hideTitleBar': param.hide_title_bar,
        'useDarkMode': param.use_dark_mode,
        'minimizable': param.minimizable,
        'maximizable': param.maximizable,
        'closable': param.closable,
        'alwaysOntop': param.always_on_top,
        'resizable': param.resizable,
        'isModal': param.is_modal,
        'isPanel': param.is_panel,
        'webappWindow': param.app_id
      }
    };

    let windowClass = this.ctxAdapter.getActiveProxy().getWindow();
    const windowProp = windowClass?.getWindowProperties();
    let leftBorder: number = param.hide_title_bar ? 0 : windowProp?.drawableRect.left || 0;
    let topBorder: number = param.hide_title_bar ? 0 : windowProp?.drawableRect.top || 0;
    let imagePixelMap: image.PixelMap;
    let color = new ArrayBuffer(0);

    image.createPixelMap(color, {
      size: {
        height: param.bounds.height + leftBorder + topBorder,
        width: param.bounds.width + leftBorder + leftBorder,
      }
    }).then((data) => {
      imagePixelMap = data;
      let options: StartOptions = {
        processMode: contextConstant.ProcessMode.ATTACH_TO_STATUS_BAR_ITEM,
        startupVisibility: param.show ? contextConstant.StartupVisibility.STARTUP_SHOW : contextConstant.StartupVisibility.STARTUP_HIDE,
        windowLeft: param.bounds.left - leftBorder,
        windowTop: param.bounds.top - topBorder,
        windowWidth: param.bounds.width + leftBorder + leftBorder,
        windowHeight: param.bounds.height + leftBorder + topBorder,
        startWindowIcon: imagePixelMap,
        startWindowBackgroundColor: this.backgroundColor(param.use_dark_mode)
      }
      if (param.is_panel) {
        options.windowMode = AbilityConstant.WindowMode.WINDOW_MODE_FULLSCREEN;
      }
      if (param.display_id != -1) {
        options.displayId = param.display_id;
      }
      LaunchHelper.LaunchWithOptions(this.ctxAdapter.getActiveContext(), want, options);
    })
  }

  @LogMethod
  closeWindow(id: number) {
    let context = this.abilityManager.getProxy(id)?.getWindowContext() as common.UIAbilityContext;
    context?.terminateSelf()
      .catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to close window. Cause: ' + JSON.stringify(err));
      });
  }

  @LogMethod
  setMaximizable(id: number, maximizable: boolean) {
    let proxy = this.abilityManager.getProxy(id);
    let preferences: WindowPreferences | undefined = proxy?.getWindowPreferences();
    if (preferences) {
      preferences.maximizable = maximizable;
      proxy?.setWindowPreferences(preferences);
      if (!preferences.hideTitleBar && !this.deviceInfoAdapter.isNormalWindowMode())
        proxy?.getWindow()?.setWindowTitleButtonVisible(preferences.maximizable, preferences.minimizable, preferences.closable);
    }
    let windowStage = proxy?.getWindowStage();
    if (!maximizable) {
      windowStage?.setSupportedWindowModes([bundleManager.SupportWindowMode.FLOATING]);
    } else {
      windowStage?.setSupportedWindowModes([bundleManager.SupportWindowMode.FLOATING, bundleManager.SupportWindowMode.SPLIT, bundleManager.SupportWindowMode.FULL_SCREEN]);
    }
  }

  @LogMethod
  setMinimizable(id: number, minimizable: boolean) {
    let proxy = this.abilityManager.getProxy(id);
    let preferences: WindowPreferences | undefined = proxy?.getWindowPreferences();
    if (preferences) {
      preferences.minimizable = minimizable;
      proxy?.setWindowPreferences(preferences);
      if (!preferences.hideTitleBar && !this.deviceInfoAdapter.isNormalWindowMode())
        proxy?.getWindow()?.setWindowTitleButtonVisible(preferences.maximizable, preferences.minimizable, preferences.closable);
    }
  }

  @LogMethod
  setClosable(id: number, closable: boolean) {
    let proxy = this.abilityManager.getProxy(id);
    let preferences: WindowPreferences | undefined = proxy?.getWindowPreferences();
    if (preferences) {
      preferences.closable = closable;
      proxy?.setWindowPreferences(preferences);
      if (!preferences.hideTitleBar && !this.deviceInfoAdapter.isNormalWindowMode())
        proxy?.getWindow()?.setWindowTitleButtonVisible(preferences.maximizable, preferences.minimizable, preferences.closable);
    }
  }

  @LogMethod
  setWindowButtonVisibility(id: number, visible: boolean) {
    let proxy = this.abilityManager.getProxy(id);
    let preferences: WindowPreferences | undefined = proxy?.getWindowPreferences();
    if (preferences) {
      preferences.maximizable = visible;
      preferences.minimizable = visible;
      preferences.closable = visible;
      proxy?.setWindowPreferences(preferences);
      if (!this.deviceInfoAdapter.isNormalWindowMode())
        proxy?.getWindow()?.setWindowTitleButtonVisible(preferences.maximizable, preferences.minimizable, preferences.closable);
    }
  }

  @LogMethod
  getWindowButtonVisibility(id: number): boolean {
    let proxy = this.abilityManager.getProxy(id);
    let preferences: WindowPreferences | undefined = proxy?.getWindowPreferences();
    if (preferences) {
      return preferences.maximizable || preferences.minimizable || preferences.closable;
    }
    return false;
  }

  @LogMethod
  setAlwaysOnTop(id: number, onTop: boolean) {
    let windowClass = this.getWindow(id);
    let promise = windowClass?.setWindowTopmost(onTop);
    promise?.then(() => {
      LogUtil.info(TAG, `Succeeded in setting the window to be topmost.`);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to set the window to be topmost. Cause code: ${err.code}, message: ${err.message}`);
    });
  }

  @LogMethod
  showWindow(id: number) {
    LogUtil.info(TAG, `[ohoswindow] in AppWindowAdapter showWindow, id is ${id}`);
    let context = this.abilityManager.getProxy(id)?.getWindowContext() as common.UIAbilityContext;
    context?.showAbility().then(() => {
      LogUtil.info(TAG, `showAbility success`);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, '[ohoswindow] Failed to showAbility. Cause:' + JSON.stringify(err));
    });
  }

  @LogMethod
  hideWindow(id: number) {
    let context = this.abilityManager.getProxy(id)?.getWindowContext() as common.UIAbilityContext;
    context?.hideAbility().then(() => {
      LogUtil.info(TAG, `hideAbility success`);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `hideAbility fail, err: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  activateWindow(id: number) {
    LogUtil.info(TAG, `[ohoswindow] in AppWindowAdapter activateWindow, id is ${id}`);
    this.showWindow(id);
  }

  @LogMethod
  setFullScreen(fullScreen: boolean, id: number) {
    if (fullScreen) {
      let windowClass = this.getWindow(id);
      if (!windowClass) {
        LogUtil.error(TAG, 'Failed to obtain the main window.');
        return;
      }

      if (this.deviceInfoAdapter.isNormalWindowMode()) {
        this.abilityManager.getProxy(id)?.updateAvoidAreaStatus(true);
      }

      windowClass.maximize(window.MaximizePresentation.ENTER_IMMERSIVE)
      .catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to maximize the window. Cause:' + JSON.stringify(err));
      });
    } else {
      this.unMaximize(id);
    }
  }

  @LogMethod
  setSimpleFullScreen(fullScreen: boolean, id: number) {
    if (fullScreen) {
      let windowClass = this.getWindow(id);
      if (!windowClass) {
        LogUtil.error(TAG, 'Failed to obtain the main window.');
        return;
      }

      windowClass.maximize(window.MaximizePresentation.ENTER_IMMERSIVE_DISABLE_TITLE_AND_DOCK_HOVER)
        .then(() => {
          LogUtil.info(TAG, 'Succeeded in maximizing the window.');
        }).catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to maximize the window. Cause:' + JSON.stringify(err));
      });
    } else {
      this.unMaximize(id);
    }
  }

  @LogMethod
  restore(id: number) {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }

    windowClass.restore().then(() => {
      console.info('Succeeded in restoring the window.');
    }).catch((err: BusinessError) => {
      console.error(`Failed to restore the window. Cause code: ${err.code}, 
      message: ${err.message}`);
    })
  }

  @LogMethod
  setBounds(id: number,
            hasFrame: boolean,
            bounds: WindowBound) {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }

    const windowProp = windowClass?.getWindowProperties();

    // xComponent bounds need to add a border
    let leftBorder: number = hasFrame ? windowProp?.drawableRect.left || 0 : 0;
    let topBorder: number = hasFrame ? windowProp?.drawableRect.top || 0 : 0;
    bounds.left -= leftBorder;
    bounds.top -= topBorder;
    bounds.width = bounds.width + leftBorder + leftBorder;
    bounds.height = bounds.height + topBorder + leftBorder;
     try {
      if (windowClass.getWindowStatus() !== window.WindowStatusType.MAXIMIZE &&
        windowClass.getWindowStatus() !== window.WindowStatusType.FULL_SCREEN) {
        windowClass.moveWindowToAsync(bounds.left, bounds.top)
          .then(() => {
            if (windowClass?.getWindowStatus() !== window.WindowStatusType.MAXIMIZE &&
              windowClass?.getWindowStatus() !== window.WindowStatusType.FULL_SCREEN) {
              windowClass?.resizeAsync(bounds.width, bounds.height)
                .catch((err: BusinessError) => {
                  LogUtil.error(TAG,
                    'Failed to change the window size. Cause:' + JSON.stringify(err) + ' window status:' +
                    windowClass?.getWindowStatus());
                });
            }
          }).catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to move the window. Cause:' + JSON.stringify(err) + ' window status:' +
          windowClass?.getWindowStatus());
        });
      }
     } catch (exception) {
       LogUtil.error(TAG, 'move the window exception. Cause:' + JSON.stringify(exception));
     }
  }

  @LogMethod
  setEnabled(enable: boolean, id: number): boolean {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return false;
    }
    windowClass.setWindowTouchable(enable)
      .catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to set the window to be touchable. Cause:' + JSON.stringify(err));
        return false;
      });
    return true;
  }

  @LogMethod
  setWindowLimits(minWidth: number,
                  minHeight: number,
                  maxWidth: number,
                  maxHeight: number,
                  id: number) {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }

    const windowProp = windowClass.getWindowProperties();
    let xComBorder: number = windowProp?.drawableRect.left || 0;
    let xComTop: number = windowProp?.drawableRect.top || 0;

    try {
      let windowLimits: window.WindowLimits = {
        minWidth: minWidth === 0 ? minWidth : minWidth + xComBorder + xComBorder,
        minHeight: minHeight === 0 ? minHeight : minHeight + xComTop + xComBorder,
        maxWidth: maxWidth === 0 ? maxWidth : maxWidth + xComBorder + xComBorder,
        maxHeight: maxHeight === 0 ? maxHeight : maxHeight + xComTop + xComBorder,
      };

      windowClass.setWindowLimits(windowLimits)
        .catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to change the window limits. Cause: ' + JSON.stringify(err));
        });
    } catch (exception) {
      LogUtil.error(TAG, 'change the window limits exception. Cause:' + JSON.stringify(exception));
    }
  }

  @LogMethod
  maximize(id: number) {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }

    if (windowClass.getWindowStatus() === window.WindowStatusType.MAXIMIZE) {
      return;
    }

    try {
      windowClass.maximize(window.MaximizePresentation.EXIT_IMMERSIVE).then(() => {
        LogUtil.info(TAG, 'Succeeded in maximizing the window.');
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to maximize the window. Cause:' + JSON.stringify(err));
      });

      if (!this.deviceInfoAdapter.isPcMode()) {
        this.abilityManager.getProxy(id)?.updateAvoidAreaStatus(false);
      }
    } catch (exception) {
      LogUtil.error(TAG, 'maximize the window exception. Cause:' + JSON.stringify(exception));
    }
  }

  @LogMethod
  unMaximize(id: number) {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }

    try {
      windowClass.recover().then(() => {
        LogUtil.info(TAG, 'Succeeded in setting the system bar to be invisible.');
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to recover the window. Cause: ' + JSON.stringify(err));
      });
    } catch (exception) {
      LogUtil.error(TAG, 'recover the window exception. Cause:' + JSON.stringify(exception));
    }
  }

  @LogMethod
  minimize(id: number) {
    let windowClass = this.getWindow(id);
    if (!windowClass) {
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }
    windowClass.minimize()
      .catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Failed to minimize the window. Cause: ' + JSON.stringify(err));
      });
  }

  @LogMethod
  setTitle(id: number, title: string) {
    let proxy = this.abilityManager.getProxy(id);
    proxy?.setWindowTitle(title);
  }

  @LogMethod
  setAspectRatio(id: number, aspectRatio: number) {
    let windowClass = this.getWindow(id);
    try {
      if ( aspectRatio <= 0 ) {
        windowClass?.resetAspectRatio()?.then(() => {
          LogUtil.info(TAG, 'Succeeded in setting aspect ratio of window.');
        }).catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to set the aspect ratio of window. Cause:' + JSON.stringify(err));
        });
      } else {
        let promise = deviceInfo.sdkApiVersion < 21 ? windowClass?.setAspectRatio(aspectRatio) : 
          windowClass?.setContentAspectRatio(aspectRatio, false, true);
        promise?.then(() => {
          LogUtil.info(TAG, 'Succeeded in setting aspect ratio of window.');
        }).catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to set the aspect ratio of window. Cause:' + JSON.stringify(err));
        });
      } 
    } catch (exception) {
      LogUtil.error(TAG, 'Failed to set the aspect ratio of window. Cause: ' + JSON.stringify(exception));
    }
  }

  @LogMethod
  setUseNativeFrame(id: number, useNativeFrame: boolean) {
    let windowClass = this.getWindow(id);
    try {
      windowClass?.setWindowDecorVisible(useNativeFrame);
      windowClass?.setWindowTitleButtonVisible(useNativeFrame, useNativeFrame, useNativeFrame);
      if (!this.deviceInfoAdapter.isNormalWindowMode()) {
        windowClass?.setWindowTitleMoveEnabled(useNativeFrame);
      } else {
        LogUtil.info(TAG, 'tablet free multi-window model is disabled');
      }
    } catch (exception) {
      LogUtil.error(TAG, `Failed to set the visibility of window decor. Cause code: ${exception.code}, message: ${exception.message}`);
    }
  }

  @LogMethod
  setBackgroundColor(id: number, argbColor: number) {
    let windowClass = this.getWindow(id);
    let data = WindowStyle.getStyleData(id);
    if (data !== undefined) {
      data.backgroundColor = `${WindowStyle.decimalColorToHex(argbColor)}`;
      WindowStyle.getUpdateStyleFunc(id)?.(data);
      windowClass?.setWindowBackgroundColor(`#${WindowStyle.decimalColorToHex(argbColor)}`);
      WindowStyle.updateStyleData(id, data);
    }
  }

  @LogMethod
  setOpacity(id: number, opacity: number) {
    let windowClass = this.getWindow(id);
    let data = WindowStyle.getStyleData(id);
    if (data !== undefined) {
      data.opacity = opacity;
      WindowStyle.getUpdateStyleFunc(id)?.(data);
      let lastColor = data.backgroundColor;
      windowClass?.setWindowBackgroundColor(`#${WindowStyle.decimalOpacityToHex(opacity)}${lastColor.slice(2)}`);
      WindowStyle.updateStyleData(id, data);
    }
  }

  @LogMethod
  setContentProtection(id: number, enable: boolean) {
    let windowClass = this.getWindow(id);
    try {
      windowClass?.setWindowPrivacyMode(enable, (err: BusinessError) => {
        const errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, `Failed to set the window to privacy mode. Cause code: ${err.code}, message: ${err.message}`);
          return;
        }
        LogUtil.info(TAG, 'Succeeded in setting the window to privacy mode.');
      });
    } catch (exception) {
      LogUtil.error(TAG, `Failed to set the window to privacy mode. Cause code: ${exception.code}, message: ${exception.message}`);
    }
  }

  @LogMethod
  setMovable(id: number, movable: boolean) {
    let windowClass = this.getWindow(id);
    try {
      windowClass?.setWindowTitleMoveEnabled(movable);
    } catch (exception) {
      LogUtil.error(TAG, `Failed to set the window Movable. Cause code: ${exception.code}, message: ${exception.message}`);
    }
  }

  @LogMethod
  setResizable(id: number, resizable: boolean) {
    let windowClass = this.getWindow(id);
    try {
      windowClass?.setResizeByDragEnabled(resizable).then(() => {}).catch((err: BusinessError) => {
        LogUtil.error(TAG, `Failed to set the window resizable. Cause ${JSON.stringify(err)}`);
      });
    } catch (exception) {
      LogUtil.error(TAG, `Failed to set the window resizable. Cause code: ${exception.code}, message: ${exception.message}`);
    }
  }

  @LogMethod
  startWindowMoving(id: number) {
    let window = this.getWindow(id);
    window?.startMoving().then(() => {
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `startWindowMoving fail, error info: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  startWindowMovingWithOffset(id: number, offsetX: number, offsetY: number) {
    let window = this.getWindow(id);
    if (deviceInfo.sdkApiVersion >= 15) {
      window?.startMoving(offsetX, offsetY).then(() => {
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `startWindowMovingWithOffset fail, error info: ${JSON.stringify(err)}`);
      });
    } else {
      LogUtil.error(TAG, 'startWindowMovingWithOffset fail, sdkApiVersion is less than 15');
    }
  }

  @LogMethod
  getWindowsByCoordinate(coordinate: PointCoordinate,
                         callback: (windowIds: Array<string>) => void) {
    let windowIds = new Array<string>();
    try {
      let displayId: number = display.getDefaultDisplaySync().id;
      window.getWindowsByCoordinate(displayId, this.queryWindowNum,
                                    coordinate.x, coordinate.y).then((windows) => {
        for (let win of windows) {
          let originWindowId: number = win.getWindowProperties().id
          let windowId = this.abilityManager.getWindowIdByOriginWindow(originWindowId);
          if (windowId) {
            windowIds.push(windowId);
          }
        }
        callback(windowIds);
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, 'window.getWindowsByCoordinate fail, code:' + JSON.stringify(err.code) +
          ',message:' + JSON.stringify(err.message));
        callback(windowIds);
      });
    } catch (err) {
      LogUtil.error(TAG, 'getWindowsByCoordinate fail, error:' + JSON.stringify(err));
      callback(windowIds);
    }
	}

  @LogMethod
  setWindowModal(modal: boolean, id: number) {
    if (this.deviceInfoAdapter.isNormalWindowMode()) {
      LogUtil.info(TAG, 'tablet free multi-window model is disabled');
      return;
    }
    let windowStage = this.abilityManager.getProxy(id)?.getWindowStage();
    windowStage?.setWindowModal(modal);
  }

  @LogMethod
  getWindowStatus(id: number): window.WindowStatusType {
    let windowClass = this.getWindow(id);
    let type = windowClass?.getWindowStatus();
    if (type !== undefined) {
      return type;
    }
    return window.WindowStatusType.UNDEFINED;
  }

  @LogMethod
  getOriginWindowIds(windowIds: Array<number>): Array<number> {
    let originWindowIds = new Array<number>();
    try {
      for (let i = 0; i < windowIds.length; i++) {
        let originWindowId = this.abilityManager.getProxy(windowIds[i])?.getOriginWindowId();
        originWindowIds.push(originWindowId ? originWindowId : -1);
      }
    } catch (err) {
      let message = (err as BusinessError).message;
      LogUtil.error(TAG, `getOriginWindowIds failed.: ${message}`);
    }
    return originWindowIds;
  }

  @LogMethod
  shiftWindowMouseEvent(sourceId: number, targetId: number,
    callback: (result: boolean) => void): void {
    if (deviceInfo.sdkApiVersion >= 15) {
      try {
        let sourceOriginWindowId = this.abilityManager.getProxy(sourceId)?.getOriginWindowId();
        let targetOriginWindowId = this.abilityManager.getProxy(targetId)?.getOriginWindowId();
        window.shiftAppWindowPointerEvent(sourceOriginWindowId, targetOriginWindowId).then(() => {
          LogUtil.info(TAG, 'shiftWindowEvent success.');
          callback(true);
        }).catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to shiftWindowEvent. Cause: ' + JSON.stringify(err));
          callback(false);
        })
      } catch (err) {
        let message = (err as BusinessError).message;
        LogUtil.error(TAG, `shiftWindowEvent failed.: ${message}`);
        callback(false);
      }
    } else {
      LogUtil.error(TAG, 'shiftWindowEvent fail, sdkApiVersion is less than 15');
      callback(false);
    }
  }

  @LogMethod
  showHuaweiQuickLogin(
      id: number,
      show: boolean,
      bounds: WindowBound,
      callback: (loginInfo: ILoginInfo) => void) {
    const loginFailInfo: ILoginInfo = {
      status: false,
      authCode: '',
      unionId: '',
      openId: '',
      idToken: '',
      anonymousPhone: ''
    };

    if (!show && this.loginWindow) {
      this.loginWindow.destroyWindow((err: BusinessError) => {
        let errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, 'Failed to destroy the window. Cause: ' + JSON.stringify(err));
          return;
        }
        LogUtil.info(TAG, 'Succeeded in destroying the window.');

        this.loginWindow = null;
      });
      return;
    };

    if (this.loginWindow) {
      callback(loginFailInfo);
      return;
    }

    let activeContext = this.ctxAdapter.getActiveContext() as common.UIAbilityContext;
    if (!activeContext) {
      LogUtil.error(TAG, 'Failed to get active context');
      return;
    }
    let config: window.Configuration = {
      name: 'login',
      windowType: window.WindowType.TYPE_DIALOG,
      ctx: activeContext
    };
    window.createWindow(config, (err: BusinessError, data) => {
      if (err.code) {
        LogUtil.error(TAG, 'Failed to create window. Cause: ' + JSON.stringify(err));
        return;
      }
      let windowClass: window.Window = data;
      if (!this.loginWindow) {
        this.loginWindow = windowClass;
      }
      windowClass.moveWindowTo(bounds.left, bounds.top, (err: BusinessError) => {
        let errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, `Failed to move the window. Cause:${JSON.stringify(err)}`);
          return;
        }
        LogUtil.info(TAG, `succeeded in moving the window.`);
      });
      windowClass.resize(bounds.width, bounds.height, (err: BusinessError) => {
        let errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, `Failed to change the window size. Cause:${JSON.stringify(err)}`);
          return;
        }
        LogUtil.info(TAG, `succeeded in changing the window size.`);
      });
      windowClass.showWindow((err: BusinessError) => {
        const errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, `Failed to show the window. Cause: ${JSON.stringify(err)}`);
          return;
        }
        LogUtil.info(TAG, 'Succeeded in showing the window.');
      });
      const para: Record<string, ILogin> = {
        'login': {
          'loginCallbackFunc': callback
        }
      };
      let storage: LocalStorage = new LocalStorage(para);
      windowClass.loadContent("pages/Login", storage, (err, data) => {
        let errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, 'Failed to load the content. Cause:' + JSON.stringify(err));
          return;
        }
        windowClass.setWindowBackgroundColor('#00000000'); // argb
      });
    });
  }

  @LogMethod
  getWindowId(id: number): number {
    let windowClass = this.getWindow(id);
    let windowId = windowClass?.getWindowProperties().id;
    if (windowId === undefined) {
      LogUtil.error(TAG, 'getWindowId failed, return -1.');
      return -1;
    }
    return windowId;
  }

  @LogMethod
  shiftWindowTouchEvent(sourceId: number, targetId: number,
    fingerId: number, callback: (result: boolean) => void): void {
    if (deviceInfo.sdkApiVersion >= 20) {
      try {
        let sourceOriginWindowId = this.abilityManager.getProxy(sourceId)?.getOriginWindowId();
        let targetOriginWindowId = this.abilityManager.getProxy(targetId)?.getOriginWindowId();
        window.shiftAppWindowTouchEvent(sourceOriginWindowId, targetOriginWindowId, fingerId).then(() => {
          LogUtil.info(TAG, 'shiftWindowTouchEvent success.');
          callback(true);
        }).catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to shiftWindowTouchEvent. Cause: ' + JSON.stringify(err));
          callback(false);
        })
      } catch (err) {
        let message = (err as BusinessError).message;
        LogUtil.error(TAG, `shiftWindowTouchEvent failed.: ${message}`);
        callback(false);
      }
    } else {
      LogUtil.error(TAG, 'shiftWindowTouchEvent fail, sdkApiVersion is less than 20');
      callback(false);
    }
  }

  bind(id: string, callback: (nodeContent: NodeContent | undefined) => void) {
    let nodeContent = this.nodeHandleManager.getNodeContent(id);
    if (!nodeContent) {
      LogUtil.warn(TAG, 'bind node handle with node content failed, not find node content for id' + id);
      callback(undefined);
      return;
    }
    callback(nodeContent);
  }

  @LogMethod
  unbind(id: string, callback: (nodeContent: NodeContent | undefined) => void) {
    let nodeContent = this.nodeHandleManager.getNodeContent(id);
    if (!nodeContent) {
      LogUtil.warn(TAG, 'unbind node handle with node content failed, not find node content for id' + id);
      callback(undefined);
      return;
    }
    callback(nodeContent);
  }

  @LogMethod
  setWindowShadow(id: number, hasShadow: boolean) {
    let window = this.getWindow(id);
    if (window === undefined) {
      LogUtil.error(TAG, `setWindowShadow fail, window is not exist! windowId: ${id}, hasShadow: ${hasShadow}`);
      return;
    }
    if (deviceInfo.sdkApiVersion >= 20) {
      window.setWindowShadowEnabled(hasShadow).catch((err: BusinessError) => {
        LogUtil.error(TAG, `setWindowShadow fail, error info: ${JSON.stringify(err)}`);
      });
    } else {
      LogUtil.error(TAG, 'setWindowShadow fail, sdkApiVersion is less than 20');
    }
  }
};
