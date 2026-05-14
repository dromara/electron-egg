// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import CheckEmptyUtils from '../utils/CheckEmptyUtils';
import Inject from '../common/InjectModule';
import LogUtil from '../utils/LogUtil';
import window from '@ohos.window';
import Want from '@ohos.app.ability.Want';
import { AbilityManager } from '../common/AbilityManager';
import { AppLifecycleAdapter } from '../adapter/AppLifecycleAdapter';
import { BrowserCloseResponse, CaptionButtonRect, WindowBound, WindowLimits, IWebAppInfo } from '../interface/CommonInterface';
import { BusinessError, deviceInfo, settings } from '@kit.BasicServicesKit';
import { ContextAdapter } from '../adapter/ContextAdapter';
import { CommandType, ConfigData, WebStatus } from '../common/Constants';
import { Configuration } from '@ohos.app.ability.Configuration';
import { common, ConfigurationConstant } from '@kit.AbilityKit';
import { DeviceInfoAdapter } from '../adapter/DeviceInfoAdapter';
import { DisplayAdapter } from  '../adapter/DisplayAdapter';
import { NativeThemeAdapter } from '../adapter/NativeThemeAdapter';
import { PermissionManagerAdapter } from '../adapter/PermissionManagerAdapter';
import { WindowStyle, IStyleData, IUpdateStyle } from '../common/WindowStyle';
import { WebBaseAbility } from './WebBaseAbility';
import lazy { GlobalThisHelper } from '../utils/GlobalThisHelper';
import { image } from '@kit.ImageKit';
import { kvManager, KVStoreInterface } from '../utils/KVStore';

const TAG: string = 'WebAbility';

export class WebAbility extends WebBaseAbility {
  private static WINDOW_CLOSE: number = 1000;
  private static SLEEP_INTERVAL_MS = 10;
  private static MAXIMUM_NUM_OF_SLEEP_CYCLES = 250;
  private abilityManager: AbilityManager | undefined = undefined;
  private displayAdapter : DisplayAdapter | undefined = undefined;
  private nativeThemeAdapter: NativeThemeAdapter | undefined = undefined;
  private contextAdapter: ContextAdapter | undefined = undefined;
  private deviceInfoAdapter: DeviceInfoAdapter | undefined = undefined;
  private appLifecycleAdapter: AppLifecycleAdapter | undefined = undefined;

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

  private async getWebappInfo() : Promise<IWebAppInfo | undefined> {
    const appIdPrefix: string = "--app-id=";
    let key = this.appId.startsWith(appIdPrefix) ? this.appId.substring(appIdPrefix.length) : this.appId;
    const kvStore: KVStoreInterface | undefined = await kvManager.getKVStore('webapp');
    const webappInfo: string | undefined = await kvStore?.getData(key);
    if (!webappInfo) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(webappInfo));
  }

  private async updateWebAppIcon() {
    const webAppInfo = await this.getWebappInfo();
    const icon = webAppInfo?.icon;
    const label = webAppInfo?.label;
    const openAsWindow = webAppInfo?.openAsWindow;

    if (icon && label && openAsWindow) {
      const imageSource = image.createImageSource(icon);
      if (!imageSource) {
        LogUtil.error(TAG, 'imageSource invaild');
        return;
      }

      try {
        const pixelMap: image.PixelMap = await imageSource.createPixelMap();
        await this.context.setAbilityInstanceInfo(label, pixelMap);
      } catch (err) {
        LogUtil.error(TAG, `setAbilityInstanceInfo failed, code is ${err.code}, message is ${err.message}`);
      }
    }
  }

  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    LogUtil.info(TAG, '[ohoswindow] in WebAbility onCreate.');
    super.onCreate(want, launchParam);
    kvManager.init(this.context);
    this.updateWebAppIcon();

    this.abilityManager = Inject.get(AbilityManager);
    this.displayAdapter = Inject.get(DisplayAdapter);
    this.nativeThemeAdapter = Inject.get(NativeThemeAdapter);
    this.contextAdapter = Inject.get(ContextAdapter);

    Inject.get(PermissionManagerAdapter).initPermissions();

    this.deviceInfoAdapter = Inject.get(DeviceInfoAdapter);
    this.appLifecycleAdapter = Inject.get(AppLifecycleAdapter);
    if (this.appLifecycleAdapter?.getWebStatus() === WebStatus.kDestroy) {
      LogUtil.warn(TAG, 'app already exit and close this window widget_id:' + this.xcomponentId);
      this.closeWindow();
    }
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
          let statusBarHeight = 0;
          if (this.deviceInfoAdapter?.isNormalWindowMode()) {
            statusBarHeight = data.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM).topRect.height;
            //The current system has a timing issue where the drawableRect lags in updating during mode switching.
            //Here, when switching to normal mode, the drawableRect is set to 0
            //to temporarily maintain normal performance until the issue is resolved.
            prop.drawableRect.height = prop.drawableRect.height + prop.drawableRect.top;
            prop.drawableRect.top = 0;
          }
          let windowBound: window.Rect = {
            left: rect.left + prop.drawableRect.left,
            top: rect.top + prop.drawableRect.top + statusBarHeight,
            width: rect.width - prop.drawableRect.left - prop.drawableRect.left,
            height: rect.height - prop.drawableRect.left - prop.drawableRect.top - statusBarHeight,
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
    });

    try {
      windowStage.on("windowStageEvent", (event) => {
        if (event === window.WindowStageEventType.ACTIVE) {
          if (!GlobalThisHelper.isWebappWindow(this.xcomponentId)) {
            GlobalThisHelper.pushActiveBrowserId(this.xcomponentId);
          }
        }
      });
    } catch (exception) {
      LogUtil.error(TAG, 'Failed to register windowStageEvent callback: ' + JSON.stringify(exception));
    }

    this.getWebappInfo()
      .then((info) => {
        if (info?.openAsWindow) {
          GlobalThisHelper.addWindowTypeRec(this.xcomponentId, this.appId);
        }
      });

    const para: Record<string, Object | string[] | IUpdateStyle> = {
      'xcomponentId': this.xcomponentId,
      'startUri': this.startUri,
      'cmdArgs': this.cmdArgs,
      'updateStyle': {
        'registerUpdateStyleFunction': WindowStyle.registerUpdateStyleFunction,
        'removeUpdateStyleFunction': WindowStyle.removeUpdateStyleFunction
      },
      'window': windowStage.getMainWindowSync(),
      'useDarkMode': this.needDarkMode(),
      'appId': this.appId,
    };
    let storage: LocalStorage = new LocalStorage(para);
    windowStage.loadContent(this.getContentPath(), storage, (err, data) => {
      if (err.code) {
        LogUtil.error(TAG, 'Failed to load the content: ' + JSON.stringify(err));
        return;
      }

      let window: window.Window = windowStage.getMainWindowSync();

      let isPCStatus = settings.getValueSync(this.context, 'isSystemModePc', '', settings.domainName.USER_PROPERTY);
      if (deviceInfo.deviceType === 'tablet' && isPCStatus !== 'true') {
        this.onPadWindowStageCreate(window, storage);
      }

      // hide title bar
      window.setWindowDecorVisible(!this.hideTitleBar);

      if (this.useDarkMode && deviceInfo.deviceType === '2in1') {
        let buttonStyle: window.DecorButtonStyle = {
          colorMode: ConfigurationConstant.ColorMode.COLOR_MODE_DARK
        };
        window.setDecorButtonStyle(buttonStyle);
      } else if (this.useDarkMode) {
        this.setDarkModeButton(window);
      }
      this.maximizable = this.maximizable && !this.hideTitleBar;
      this.minimizable = this.minimizable && !this.hideTitleBar;
      this.closable = this.closable && !this.hideTitleBar;
      window.setResizeByDragEnabled(this.resizable);
      if (this.deviceInfoAdapter?.isNormalWindowMode() === false) {
        window.setWindowTitleButtonVisible(this.maximizable, this.minimizable, this.closable);
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
          let uiContext = window.getUIContext();
          let rect: CaptionButtonRect = {
            right: uiContext.vp2px(titleButtonRect.right),
            top: uiContext.vp2px(titleButtonRect.top),
            width: uiContext.vp2px(titleButtonRect.width),
            height: uiContext.vp2px(titleButtonRect.height)
          };
          if ((!this.maximizable && !this.minimizable && !this.closable) || !this.hideTitleBar) {
            rect = { right: 0, top: 0, width: 0, height: 0 };
          }
          this.nativeContext.OnCaptionButtonRectChange(this.xcomponentId, rect);
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to register window title button change callback: ' + JSON.stringify(exception));
      }

      if (deviceInfo.sdkApiVersion >= 15) {
        this.nativeContext.RegisterWindowEventFilter(window.getWindowProperties().id);
      }

      try {
        window.on('displayIdChange', (displayId) => {
          this.nativeContext.OnWindowDisplayIdChange(this.xcomponentId, displayId);
        });
      } catch (exception) {
        LogUtil.info(TAG, `register displayIdChange listener fail, xcomponentId:${this.xcomponentId},
                      exception: ${JSON.stringify(exception)}`);
      }

      try {
        if (this.xcomponentId === ConfigData.DEFAULT_WINDOW_ID) {
          let windowLimits = this.getWindow()?.getWindowLimits();
          let uiContext = window.getUIContext();
          let limits: WindowLimits = {
            maxHeight: Math.ceil(uiContext.px2vp(windowLimits?.maxHeight ?? 0)),
            maxWidth: Math.ceil(uiContext.px2vp(windowLimits?.maxWidth ?? 0)),
            minHeight: Math.ceil(uiContext.px2vp(windowLimits?.minHeight ?? 0)),
            minWidth: Math.ceil(uiContext.px2vp(windowLimits?.minWidth ?? 0))
          }
          this.nativeContext.SetSystemWindowLimits(limits);
        }
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to get window limits or get ui context:' + JSON.stringify(exception));
      }
    });

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
    GlobalThisHelper.delWindowTypeRec(this.xcomponentId);
    GlobalThisHelper.delActiveBrowserId(this.xcomponentId);
  }

  onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    LogUtil.info(TAG, `[ohoswindow] in WebAbility onNewWant, want is ${JSON.stringify(want)}, param is ${JSON.stringify(launchParam)}.`);
    const params = want?.parameters;
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
        this.openNewWindow(uri.replace("file://docs/", "file:///"), false);
      } else {
        LogUtil.debug(TAG, `Trigger open-url event. uri = ${uri}`);
        this.openURL(uri);
      }
    } else if (params !== undefined && params["appId"] !== undefined) {
      LogUtil.info(TAG, 'else if params !== undefined');
      let appId = params["appId"] as string;
      LogUtil.info(TAG, 'let appId: ' + appId);
      let xcomponentId = GlobalThisHelper.getWebappWindow(appId);
      LogUtil.info(TAG, 'get xcomponentId: ' + xcomponentId);
      if (xcomponentId !== '') {
        LogUtil.info(TAG, 'xcomponentId !== \'\'');
        return;
      } else {
        LogUtil.info(TAG, 'xcomponentId is empty');
        let windowClass = this.abilityManager?.getProxy(this.xcomponentId)?.getWindow();
        let show = windowClass?.isWindowShowing();
        LogUtil.info(TAG, `${this.xcomponentId} isWindowShowing: ${show}`);
        if (!show) {
          windowClass?.minimize()
            .catch((err: BusinessError) => {
              LogUtil.error(TAG, 'Failed to minimize the window. Cause: ' + JSON.stringify(err));
            });
        }
        this.openNewWindow(appId, true);
        LogUtil.info(TAG, 'this.openNewWindow(appId, true), appId: ' + appId);
      }
    } else if(GlobalThisHelper.getLastActiveBrowserId() === undefined) {
      LogUtil.info(TAG, 'GlobalThisHelper.getLastActiveBrowserId() begin');
      this.openNewWindow(this.startUri, false);
      LogUtil.info(TAG, 'GlobalThisHelper.getLastActiveBrowserId() end, this.startUri: ' + this.startUri);
    }
    LogUtil.info(TAG, 'end call onNewWant func');
  }

  onPrepareToTerminate(): boolean {
    this.nativeContext.OnWindowEvent(this.xcomponentId, WebAbility.WINDOW_CLOSE);
    return true;
  }

  async onPrepareToTerminateAsync(): Promise<boolean> {
    let id: number = Number(this.xcomponentId.substring(ConfigData.WINDOW_PREFIX.length));
    let response: BrowserCloseResponse = BrowserCloseResponse.kUndetermined;
    this.nativeContext.OnWindowEvent(this.xcomponentId, WebAbility.WINDOW_CLOSE);
    for (let i = 0; i < WebAbility.MAXIMUM_NUM_OF_SLEEP_CYCLES; i++) {
      await this.sleep(WebAbility.SLEEP_INTERVAL_MS);
      response = this.nativeContext.GetBrowserCloseResponse(id);
      if (response !== BrowserCloseResponse.kUndetermined) {
        break;
      }
    }
    if (response === BrowserCloseResponse.kClosingContinue || response === BrowserCloseResponse.kClosed) {
      return false;
    }
    return true;
  }

  sleep(delay: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, delay));
  }

  async onDestroy(): Promise<void> {
    LogUtil.info(TAG, ' [ohoswindow] onDestroy');
    let id: number = Number(this.xcomponentId.substring(ConfigData.WINDOW_PREFIX.length));
    while (true) {
      await this.sleep(WebAbility.SLEEP_INTERVAL_MS);
      let response = this.nativeContext.GetBrowserCloseResponse(id);
      if (this.appLifecycleAdapter?.getWebStatus() === WebStatus.kDestroy ||
        response === BrowserCloseResponse.kClosed || response === BrowserCloseResponse.kClosedAnyway) {
        break;
      }
    }
    if (this.abilityManager?.getProxyCount() === 0) {
      while (true) {
        await this.sleep(WebAbility.SLEEP_INTERVAL_MS);
        let destroyed = this.nativeContext.BrowserDestroyed();
        if (this.appLifecycleAdapter?.getWebStatus() === WebStatus.kDestroy || destroyed) {
          break;
        }
      }
    }
    return;
  }

  private checkSingleInstance(): boolean {
    if (!CheckEmptyUtils.isEmpty(this.xcomponentId)) {
      return false;
    }
    this.openNewWindow(this.startUri, false);
    this.closeWindow();
    return true;
  }

  private openNewWindow(open_url: string, is_webapp: boolean) {
    this.nativeContext.ExecuteCommand(CommandType.kNewWindow, { url: open_url, is_webapp: is_webapp });
  }

  private openURL(url: string) {
    LogUtil.debug(TAG, 'openURL is called, url: ' + url);
    this.nativeContext.ExecuteCommand(CommandType.kOpenURL, { url: url });
  }

  private onPadWindowStageCreate(windowClass: window.Window, storage: LocalStorage) {
    // During window initialization, it is not in full-screen state, so the input is false.
    // Here set the status bar avoidance and hides the navigation bar.
    this.updateAvoidAreaStatus(false);

    let avoidArea = windowClass.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
    let statusBarHeight = avoidArea.topRect.height;
    storage.setOrCreate('statusBarHeight', statusBarHeight);
    this.displayAdapter?.setStatusBarHeight(statusBarHeight);

    const context: Context = getContext(this);
    this.deviceInfoAdapter?.registerDeviceModeChange(context);

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
      if(!this.deviceInfoAdapter?.isNormalWindowMode()) {
        return;
      }

      this.displayAdapter?.availableAreaUpdateByStatusBar();

      let prop = windowClass.getWindowProperties();
      //The current system has a timing issue where the drawableRect lags in updating during mode switching.
      //Here, when switching to normal mode, the drawableRect is set to 0
      //to temporarily maintain normal performance until the issue is resolved.
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

  private needDarkMode(): boolean {
    let context = this.getWindowContext() as common.UIAbilityContext;
    let currentColorMode: ConfigurationConstant.ColorMode | undefined = context.config.colorMode;
    if (!currentColorMode) {
      LogUtil.warn(TAG, 'Can not get current color mode from window: ' + this.xcomponentId);
    }
    return this.useDarkMode || currentColorMode === ConfigurationConstant.ColorMode.COLOR_MODE_DARK;
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
