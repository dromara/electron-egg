// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import LogUtil from '../utils/LogUtil';
import window from '@ohos.window';
import Want from '@ohos.app.ability.Want';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { ContextAdapter } from '../adapter/ContextAdapter';
import { deviceInfo, settings } from '@kit.BasicServicesKit';
import { DisplayAdapter } from  '../adapter/DisplayAdapter';
import { NativeThemeAdapter } from '../adapter/NativeThemeAdapter';
import { AbilityManager } from '../common/AbilityManager';
import { Configuration } from '@ohos.app.ability.Configuration';
import Inject from '../common/InjectModule';
import { CaptionButtonRect, WindowBound, WinLimits, WindowStatus } from '../interface/CommonInterface';
import CheckEmptyUtils from '../utils/CheckEmptyUtils';
import { WebBaseAbility } from './WebBaseAbility';
import { WindowStyle, IStyleData, IUpdateStyle } from '../common/WindowStyle';
import { CommandType, ConfigData } from '../common/Constants';
import { PermissionManagerAdapter } from '../adapter/PermissionManagerAdapter';
import { abilityManager, ConfigurationConstant } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';

const TAG: string = 'WebAbility';

export class WebAbility extends WebBaseAbility {
  private static WINDOW_CLOSE: number = 1000;
  private abilityManager: AbilityManager | undefined = undefined;
  private displayAdapter : DisplayAdapter | undefined = undefined;
  private nativeThemeAdapter: NativeThemeAdapter | undefined = undefined;
  private contextAdapter: ContextAdapter | undefined = undefined;

  onConfigurationUpdate(config: Configuration) {
    if (config.colorMode !== undefined) {
      this.nativeThemeAdapter?.setSystemNativeTheme(config.colorMode);
    }
    if (config.fontSizeScale !== undefined) {
      this.displayAdapter?.onSystemFontSizeChange(config.fontSizeScale);
    } else {
      this.displayAdapter?.onSystemFontSizeChange(1.0);
    }
  }

  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    LogUtil.info(TAG, '[ohoswindow] in WebAbility onCreate.');
    this.checkInstanceLimit();

    super.onCreate(want, launchParam);

    this.abilityManager = Inject.get(AbilityManager);
    this.nativeThemeAdapter = Inject.get(NativeThemeAdapter);
    this.contextAdapter = Inject.get(ContextAdapter);

    Inject.get(PermissionManagerAdapter).initPermissions();
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    LogUtil.info(TAG, '[ohoswindow] in WebAbility onWindowStageCreate.');
    super.onWindowStageCreate(windowStage);

    if (this.checkSingleInstance()) {
      LogUtil.warn(TAG, 'repeat launch from desktop, need terminate');
      return;
    }

    this.abilityManager?.addProxy(this);

    windowStage.getMainWindow((err, data) => {
      if (err.code) {
        LogUtil.error(TAG, 'Failed to obtain the main window: ' + JSON.stringify(err));
        return;
      }
      
      try {
        data.on('windowStatusChange', (status) => {
          this.nativeContext.OnWindowStatusChange(this.xcomponentId, status);
          if (status === window.WindowStatusType.MINIMIZE || this.deviceModeChangeEvent === undefined) {
            return;
          }
          LogUtil.info(TAG, 'Send device mode change event, xcomponentId: ' +
                            this.xcomponentId + ', deviceModeChangeEvent: ' +
                            this.deviceModeChangeEvent + ', status: ' + status);
          this.nativeContext.OnDeviceModeChange(this.xcomponentId, this.deviceModeChangeEvent, status);
          this.setDeviceModeChangeEvent(undefined);
        })
      } catch (exception) {
        LogUtil.error(TAG,'Failed to listener for window status changes: ' + JSON.stringify(exception));
      }

      try {
        data.on('windowSizeChange', (size) => {
          const prop = data.getWindowProperties();
          let windowBound: WindowBound = {
            left: prop.windowRect.left + prop.drawableRect.left,
            top: prop.windowRect.top + prop.drawableRect.top,
            width: size.width - prop.drawableRect.left - prop.drawableRect.left,
            height: size.height - prop.drawableRect.left - prop.drawableRect.top,
          };
          this.nativeContext.OnWindowSizeChange(this.xcomponentId, windowBound);
        });
      } catch (exception) {
        LogUtil.error(TAG,'Failed to listener for window size changes: ' + JSON.stringify(exception));
      }

      try {
        data.on("windowRectChange", (option) => {
          const prop = data.getWindowProperties();
          const rect = option.rect;
          let windowBound: window.Rect = {
            left: rect.left + prop.drawableRect.left,
            top: rect.top + prop.drawableRect.top,
            width: rect.width - prop.drawableRect.left - prop.drawableRect.left,
            height: rect.height - prop.drawableRect.left - prop.drawableRect.top,
          };
          this.nativeContext.OnWindowRectChange(this.xcomponentId,
            windowBound,
            option.reason.valueOf());
        });
      } catch (exception) {
        LogUtil.error(TAG,'Failed to listener for window rect changes: ' + JSON.stringify(exception));
      }

      try {
        data.on('windowEvent', (type) => {
          if (type == window.WindowEventType.WINDOW_SHOWN) {
            const prop = data.getWindowProperties();
            let windowBound: WindowBound = {
              left: prop.windowRect.left + prop.drawableRect.left,
              top: prop.windowRect.top + prop.drawableRect.top,
              width: prop.windowRect.width - prop.drawableRect.left - prop.drawableRect.left,
              height: prop.windowRect.height - prop.drawableRect.left - prop.drawableRect.top,
            };
            this.nativeContext.OnWindowRectChange(this.xcomponentId, windowBound, 0);
          }
          this.nativeContext.OnWindowEvent(this.xcomponentId, type.valueOf());
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to register callback: ' + JSON.stringify(exception));
      }

      try {
        data.on("windowVisibilityChange", (visible) => {
          this.nativeContext.OnWindowVisibilityChange(this.xcomponentId, visible);
        });
      } catch (exception) {
       LogUtil.error(TAG, 'Failed to register callback: ' + JSON.stringify(exception));
      }

      try {
        data.on('keyboardHeightChange', (height) => {
          this.nativeContext.OnKeyboardHeightChange(this.xcomponentId, height);
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to listener for keyboard height changes: ' + JSON.stringify(exception));
      }

      try {
        data.on('displayIdChange', (displayId) => {
          this.nativeContext.OnWindowDisplayIdChange(this.xcomponentId, displayId);
        });
      } catch (exception) {
        LogUtil.error(TAG, `register displayIdChange listener fail, xcomponentId:${this.xcomponentId},
                      exception: ${JSON.stringify(exception)}`);
      }

      if (this.initStatus === WindowStatus.MAXIMIZE &&
        data.getWindowStatus() !== window.WindowStatusType.MAXIMIZE) {
        data.maximize(window.MaximizePresentation.EXIT_IMMERSIVE).then(() => {
          LogUtil.warn(TAG,
            `[ohoswindow] Window starts maximized.`);
        }).catch((err: BusinessError) => {
          LogUtil.error(TAG,
            `[ohoswindow] Window fails to start from {${data.getWindowStatus()}} to maximized. Cause:` +
            JSON.stringify(err));
        });
      }

      if (deviceInfo.deviceType === "tablet") {
        try {
          let isLayoutFullScreen = true;
          data.setWindowLayoutFullScreen(isLayoutFullScreen)
            .then(() => {
              LogUtil.info(TAG, 'Succeeded in setting the window layout to full-screen mode.');
            })
            .catch((err: BusinessError) => {
              LogUtil.error(TAG, 'Failed to set the window layout to full-screen mode. Cause:' + JSON.stringify(err));
            });
          let promise = data.setSpecificSystemBarEnabled('status', false);
          promise.then(() => {
            LogUtil.info(TAG, 'Succeeded in setting the system bar to be invisible.');
          }).catch((err: BusinessError) => {
            LogUtil.error(TAG,
              `Failed to set the system bar to be invisible. Cause code: ${err.code}, message: ${err.message}`);
          });
          let sysBarProps: window.SystemBarProperties = {
            statusBarColor: '#0000FF00',
            navigationBarColor: '#0000FF00',
          };
          data.setWindowSystemBarProperties(sysBarProps)
            .then(() => {
              LogUtil.info(TAG, 'Succeeded in setting the system bar properties.');
            })
            .catch((err: BusinessError) => {
              LogUtil.error(TAG, 'Failed to set the system bar properties. Cause: ' + JSON.stringify(err));
            });
        } catch (exception) {
          LogUtil.error(TAG, 'Failed to set window status on pad onWindowStageCreate');
        }
      }
    });

    const para: Record<string, Object | string[] | IUpdateStyle> = {
      'xcomponentId': this.xcomponentId,
      'startUri': this.startUri,
      'appId': this.appId,
      'cmdArgs': this.cmdArgs,
      'window': windowStage.getMainWindowSync(),
      'updateStyle': {
        'registerUpdateStyleFunction': WindowStyle.registerUpdateStyleFunction,
        'removeUpdateStyleFunction': WindowStyle.removeUpdateStyleFunction
      }
    };
    let storage: LocalStorage = new LocalStorage(para);
    windowStage.loadContent(this.getContentPath(), storage, (err, data) => {
      if (err.code) {
        LogUtil.error(TAG, 'Failed to load the content: ' + JSON.stringify(err));
        return;
      }

      let window: window.Window = windowStage.getMainWindowSync();
      // hide title bar
      window.setWindowDecorVisible(!this.hideTitleBar);
      if (this.useDarkMode) {
        this.setDarkModeButton(window);
      }
      this.maximizable = this.maximizable && !this.hideTitleBar;
      this.minimizable = this.minimizable && !this.hideTitleBar;
      this.closable = this.closable && !this.hideTitleBar;
      window.setWindowTitleButtonVisible(this.maximizable, this.minimizable, this.closable);
      window.setResizeByDragEnabled(this.resizable);

      let isPCStatus = settings.getValueSync(this.context, 'isSystemModePc', '', settings.domainName.USER_PROPERTY);
      if (deviceInfo.deviceType === 'tablet' && isPCStatus !== 'true') {
        this.onPadWindowStageCreate(window, storage);
      }

      if (this.contextAdapter?.isPadNormalModel() === false) {
        window.setWindowTitleMoveEnabled(!this.hideTitleBar);
        windowStage.setWindowModal(this.isModal);
        if (this.isPanel)
          window.setTitleAndDockHoverShown(false, false);
      } else {
        LogUtil.info(TAG, 'tablet free multi-window model is disabled');
      }

      // window title button rect change callback must registered after loadContent/setUIContent
      try {
        window.on("windowTitleButtonRectChange", (titleButtonRect) => {
          let rect: CaptionButtonRect = {
            right: vp2px(titleButtonRect.right),
            top: vp2px(titleButtonRect.top),
            width: vp2px(titleButtonRect.width),
            height: vp2px(titleButtonRect.height)
          };
          this.nativeContext.OnCaptionButtonRectChange(this.xcomponentId, rect);
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to register window title button change callback: ' + JSON.stringify(exception));
      }

      if (deviceInfo.sdkApiVersion >= 15) {
        this.nativeContext.RegisterWindowEventFilter(window.getWindowProperties().id);
      }

      if(deviceInfo.deviceType == 'tablet') {
        const context: Context = getContext(this);
        let res: boolean = settings.registerKeyObserver(context,
          'window_pcmode_switch_status', settings.domainName.USER_PROPERTY, () => {
          this.contextAdapter?.updateWindowPcmodeSwitchStatus(context);
        });
        LogUtil.info(TAG, 'register window_pcmode_switch_status,res:' + res + ',xcomponentId:' + this.xcomponentId);
        if (res) {
          this.contextAdapter?.updateWindowPcmodeSwitchStatus(context);
        }
      }

      try {
        if (this.xcomponentId === ConfigData.DEFAULT_WINDOW_ID) {
          let windowLimits: window.WindowLimits | undefined = this.getWindow()?.getWindowLimits();
          let uiContext = window.getUIContext();
          let limits: WinLimits = {
            max_height: Math.ceil(uiContext.px2vp(windowLimits?.maxHeight ?? 0)),
            max_width: Math.ceil(uiContext.px2vp(windowLimits?.maxWidth ?? 0)),
            min_height: Math.ceil(uiContext.px2vp(windowLimits?.minHeight ?? 0)),
            min_width: Math.ceil(uiContext.px2vp(windowLimits?.minWidth ?? 0))
          }
          this.nativeContext.SetSystemWindowLimits(limits);
        }
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to get window limits or get ui context:' + JSON.stringify(exception));
      }
    });

    try {
      windowStage.on('windowStageClose', () => {
        this.nativeContext.OnWindowEvent(this.xcomponentId, WebAbility.WINDOW_CLOSE);
        return true;
      });
    } catch (exception) {
      console.error(`Failed to enable the listener for window stage close event. Cause code: ${exception.code}, message: ${exception.message}`);
    }
  }

  onWindowStageDestroy() {
    LogUtil.info(TAG, '[ohoswindow] in WebAbility onWindowStageDestroy.');
    if (CheckEmptyUtils.isEmpty(this.xcomponentId)) {
      LogUtil.warn(TAG, 'onWindowStageDestroy component is not instantiated');
      return;
    }
    if (deviceInfo.sdkApiVersion >= 15) {
      let originWindowId = this.abilityManager?.getOriginWindowId(this.xcomponentId);
      this.nativeContext.ClearWindowEventFilter(originWindowId);
    }
    // Main window is destroyed, release UI related resources
    this.abilityManager?.removeProxy(this.xcomponentId);
  }

  onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    LogUtil.info(TAG, `[ohoswindow] in WebAbility onNewWant, want is ${JSON.stringify(want)}, param is ${JSON.stringify(launchParam)}.`);
    let uriNotNull = want["uri"] !== undefined && want["uri"] !== '';
    if(want!== undefined && want !== null) {
      LogUtil.info(TAG, 'onNewWant begin, want: ' +
        'bundleName: ' + JSON.stringify(want.bundleName) +
        ', abilityName: ' + JSON.stringify(want.abilityName) +
        ', deviceId: ' + JSON.stringify(want.deviceId) +
        ', uri not null: ' + JSON.stringify(uriNotNull) +
        ', type: ' + JSON.stringify(want.type) +
        ', flags: ' + JSON.stringify(want.flags) +
        ', action: ' + JSON.stringify(want.action) +
        ', parameters: ' + JSON.stringify(want.parameters) +
        ', entities: ' + JSON.stringify(want.entities) +
        ', moduleName: ' + JSON.stringify(want.moduleName) +
        ', LaunchParam: ' + JSON.stringify(launchParam));
    }
    if (uriNotNull) {
      let uri = want['uri'] as string;
      if (uri.startsWith("file://docs/")) {
        this.openNewWindow(uri.replace("file://docs/", "file:///"));
      } else if (uri.startsWith("file:///")) {
        this.openNewWindow(uri);
      } else {
        LogUtil.debug(TAG, `Trigger open-url event. uri = ${uri}`);
        this.openURL(uri);
      }
    }
  }

  onPrepareToTerminate(): boolean {
    this.nativeContext.OnWindowEvent(this.xcomponentId, WebAbility.WINDOW_CLOSE);
    return true;
  }

  private onPadWindowStageCreate(windowClass: window.Window, storage: LocalStorage) {
    this.updateAvoidAreaStatus(false);

    let avoidArea = windowClass.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
    let statusBarHeight = avoidArea.topRect.height;
    storage.setOrCreate('statusBarHeight', statusBarHeight);
    this.displayAdapter?.setStatusBarHeight(statusBarHeight);

    windowClass.on('avoidAreaChange', (data) => {
      if (data.type !== window.AvoidAreaType.TYPE_SYSTEM) {
        return;
      }

      let statusBarHeight = data.area.topRect.height;
      storage.setOrCreate('statusBarHeight', statusBarHeight);
      LogUtil.info(TAG, 'Avoidarea changes,statusBarHeight:' + statusBarHeight);
      this.displayAdapter?.setStatusBarHeight(statusBarHeight);

      if (deviceInfo.sdkApiVersion >= 20) {
        this.nativeContext.OnAvoidAreaChangeCallback(statusBarHeight);
      }

      let prop = windowClass.getWindowProperties();
      prop.drawableRect.height = prop.drawableRect.height + prop.drawableRect.top;
      prop.drawableRect.top = 0;

      let windowBound: window.Rect = {
        left: prop.windowRect.left + prop.drawableRect.left,
        top: prop.windowRect.top + prop.drawableRect.top + statusBarHeight,
        width: prop.drawableRect.width,
        height: prop.drawableRect.height - statusBarHeight,
      };
      this.nativeContext.OnWindowRectChange(this.xcomponentId, windowBound, 0);
    });
  }

  private checkSingleInstance(): boolean {
    if (!CheckEmptyUtils.isEmpty(this.xcomponentId)) {
      return false;
    }
    this.openNewWindow(this.startUri);
    this.closeWindow();
    return true;
  }

  private openNewWindow(open_url: string) {
    this.nativeContext.ExecuteCommand(CommandType.kNewWindow, { url: open_url });
  }

  private openURL(url: string) {
    LogUtil.debug(TAG, 'openURL is called, url: ' + url);
    this.nativeContext.ExecuteCommand(CommandType.kOpenURL, { url: url });
  }

  private async checkInstanceLimit() {
    const runningInfos = await abilityManager.getAbilityRunningInfos();
    const currentAbilityInstances = runningInfos.filter(info =>
      info.ability.abilityName === 'EntryAbility'
    );

    if (currentAbilityInstances.length > 1) {
      console.info('[zh] 检测到多实例启动');
    }
  }

  private setDarkModeButton(window: window.Window) {
    let isPadDarkButtonSupported = deviceInfo.deviceType === 'tablet' && deviceInfo.sdkApiVersion >= 18;
    if (deviceInfo.deviceType !== '2in1' && !isPadDarkButtonSupported) {
      return;
    }
    try {
      let buttonStyle: window.DecorButtonStyle = {
        colorMode: ConfigurationConstant.ColorMode.COLOR_MODE_DARK
      };
      window.setDecorButtonStyle(buttonStyle);
    } catch (exception) {
      LogUtil.error(TAG, 'Failed to set the style of button: ' + JSON.stringify(exception));
    }
  }
};
