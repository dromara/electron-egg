// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { BusinessError } from '@ohos.base';
import { deviceInfo } from '@kit.BasicServicesKit';
import { window } from '@kit.ArkUI';
import { BaseWindowAdapter } from '../common/BaseWindowAdapter';
import LogUtil from '../utils/LogUtil';
import { AbilityManager } from '../common/AbilityManager';
import LogMethod from '../common/LogDecorator';
import { NewWindowParam, WindowBound, WindowType } from '../interface/CommonInterface';
import lazy { SystemFloatingWindowManager } from '../common/SystemFloatingWindowManager';
import lazy { ContextAdapter } from './ContextAdapter';
import { common } from '@kit.AbilityKit';
import { WindowStyle, IStyleData, IUpdateStyle } from '../common/WindowStyle';

const TAG: string = 'SystemFloatingWindowWindow';

@injectable()
export class SystemFloatingWindowAdapter extends BaseWindowAdapter {
  private abilityManager: AbilityManager;
  private systemFloatingWindowManager: SystemFloatingWindowManager;

  constructor(
    @inject(ContextAdapter) ctxAdapter: ContextAdapter,
    @inject(AbilityManager) abilityManager: AbilityManager,
    @inject(SystemFloatingWindowManager) systemFloatingWindowManager: SystemFloatingWindowManager,
  ) {
    super(ctxAdapter);
    this.abilityManager = abilityManager;
    this.systemFloatingWindowManager = systemFloatingWindowManager;
  }

  @LogMethod
  createWindow(param: NewWindowParam) {
    let activeContext = this.abilityManager.getProxy(param.parent_id)?.getWindowContext();
    if (!activeContext) {
      LogUtil.warn(TAG, 'Failed to get active context');
      return;
    }

    let bounds: WindowBound = {
      left: param.bounds.left,
      top: param.bounds.top,
      width: param.bounds.width,
      height: param.bounds.height,
    };
    const out_bounds = this.adjustBounds(bounds);
    let config: window.Configuration = {
      name: param.window_id,
      windowType: window.WindowType.TYPE_FLOAT,
      ctx: activeContext,
      decorEnabled: true
    };
    if (param.display_id !== -1) {
      config.displayId = param.display_id;
    }
    window.createWindow(config, (err: BusinessError, data) => {
      if (err.code) {
        LogUtil.error(TAG, 'Failed to create window. Cause: ' + JSON.stringify(err));
        return;
      }

      try {
        data.moveWindowTo(out_bounds.left, out_bounds.top)
          .then(() => {
            data.resize(out_bounds.width, out_bounds.height)
              .catch((err: BusinessError) => {
                LogUtil.error(TAG, 'Failed to change the window size. Cause:' + JSON.stringify(err));
              });
          }).catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to move the window. Cause:' + JSON.stringify(err));
        });
      } catch (exception) {
        LogUtil.error(TAG, 'move the window exception. Cause:' + JSON.stringify(exception));
      }

      try {
        data.on('windowSizeChange', (size) => {
          const windowProp = data.getWindowProperties();
          let windowBound: WindowBound = {
            left: windowProp.windowRect.left + windowProp.drawableRect.left,
            top: windowProp.windowRect.top + windowProp.drawableRect.top,
            width: size.width - windowProp.drawableRect.left - windowProp.drawableRect.left,
            height: size.height - windowProp.drawableRect.top - windowProp.drawableRect.top,
          };
          this.nativeContext.OnWindowSizeChange(param.window_id, windowBound);
        });
      } catch (exception) {
        LogUtil.error(TAG,'Failed to enable the listener for window size changes. Cause: ' + JSON.stringify(exception));
      }

      try {
        data.on("windowRectChange", (option) => {
          this.nativeContext.OnWindowRectChange(param.window_id, option.rect, option.reason.valueOf());
        });
      } catch (exception) {
        LogUtil.error(TAG,'Failed to enable the listener for window rect changes. Cause: ' + JSON.stringify(exception));
      }

      try {
        data.on('windowEvent', (type) => {
          this.nativeContext.OnWindowEvent(param.window_id, type.valueOf());
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to register callback. Cause: ' + JSON.stringify(exception));
      }

      try {
        data.on("windowVisibilityChange", (visible) => {
          this.nativeContext.OnWindowVisibilityChange(param.window_id, visible);
        });
      } catch (exception) {
        LogUtil.error(TAG, 'Failed to register callback. Cause: ' + JSON.stringify(exception));
      }

      try {
        data.on('displayIdChange', (displayId) => {
          this.nativeContext.OnWindowDisplayIdChange(param.window_id, displayId);
        });
      } catch (exception) {
        LogUtil.error(TAG, `register displayIdChange listener fail, xcomponentId:${param.window_id},
                      exception: ${JSON.stringify(exception)}`);
      }

      let windowClass = data;
      this.cacheWindow(param.parent_id, param.window_id, windowClass);

      let startUri: string = ''
      const para: Record<string, string | IUpdateStyle> = {
        'xcomponentId': param.window_id,
        'startUri': startUri,
        'updateStyle': {
          'registerUpdateStyleFunction': WindowStyle.registerUpdateStyleFunction,
          'removeUpdateStyleFunction': WindowStyle.removeUpdateStyleFunction
        }
      };
      let storage: LocalStorage = new LocalStorage(para);
      windowClass.loadContent(this.getContentPath(), storage, (err, data) => {
        let errCode: number = err.code;
        if (errCode) {
          LogUtil.error(TAG, 'Failed to load the content. Cause:' + JSON.stringify(err));
          return;
        }
        if (deviceInfo.sdkApiVersion >= 15) {
          this.nativeContext.RegisterWindowEventFilter(windowClass.getWindowProperties().id);
        }
      })
    });
  }

  private getContentPath(): string {
    if (this.nativeContext.IsSupportNodeHandleFeature()) {
      return 'pages/NodeHandleWindow';
    } else {
      return 'pages/Index';
    }
  }

  @LogMethod
  closeWindow(id: number) {
    let mainWindowId = this.systemFloatingWindowManager.getMainWindowId(id);
    if (mainWindowId) {
      this.systemFloatingWindowManager.getWindow(id)?.destroyWindow();
      this.systemFloatingWindowManager.removeSystemFloatingWindow(mainWindowId, id);
    }
  }

  @LogMethod
  showWindow(id: number) {
    let windowClass = this.systemFloatingWindowManager.getWindow(id);
    let promise = windowClass?.showWindow();
    promise?.then(() => {
        LogUtil.info(TAG, 'Succeeded in showing the window.');
    }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `Failed to show the window. Cause code: ${err.code}, message: ${err.message}`);
    });
  }

    @LogMethod
  hideWindow(id: number) {
    let windowClass = this.systemFloatingWindowManager.getWindow(id);
    let promise = windowClass?.minimize();
    promise?.then(() => {
        LogUtil.info(TAG, 'Succeeded in hiding the window.');
    }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `Failed to hide the window. Cause code: ${err.code}, message: ${err.message}`);
    });
  }

  @LogMethod
  setBounds(id: number,
            bounds: WindowBound,
            onCompleted: (ret: boolean) => void) {
    let windowClass = this.systemFloatingWindowManager.getWindow(id);
    if (!windowClass) {
      onCompleted(false);
      LogUtil.error(TAG, 'Failed to obtain the main window.');
      return;
    }

    const windowProp = windowClass?.getWindowProperties();
    let xComBorder: number = windowProp?.drawableRect.left || 0;
    let xComTop: number = windowProp?.drawableRect.top || 0;
    bounds.left -= xComBorder;
    bounds.top -= xComTop;
    bounds.width = bounds.width + xComBorder + xComBorder;
    bounds.height = bounds.height + xComBorder + xComTop;

    try {
      windowClass.moveWindowTo(bounds.left, bounds.top)
        .then(() => {
          windowClass?.resize(bounds.width, bounds.height)
            .then(() => {
              onCompleted(true);
            }).catch((err: BusinessError) => {
            onCompleted(false);
            LogUtil.error(TAG, 'Failed to change the window size. Cause:' + JSON.stringify(err));
          });
        }).catch((err: BusinessError) => {
        onCompleted(false);
        LogUtil.error(TAG, 'Failed to move the window. Cause:' + JSON.stringify(err));
      });
    } catch (exception) {
      onCompleted(false);
      LogUtil.error(TAG, 'move the window exception. Cause:' + JSON.stringify(exception));
    }
  }

  @LogMethod
  setWindowLimits(minWidth: number,
                  minHeight: number,
                  maxWidth: number,
                  maxHeight: number,
                  id: number) {
    let windowClass = this.systemFloatingWindowManager.getWindow(id);
    const windowProp = windowClass?.getWindowProperties();
    let xComBorder: number = windowProp?.drawableRect.left || 0;
    let xComTop: number = windowProp?.drawableRect.top || 0;

    try {
      let windowLimits: window.WindowLimits = {
        minWidth: minWidth === 0 ? minWidth : minWidth + xComBorder + xComBorder,
        minHeight: minHeight === 0 ? minHeight : minHeight + xComTop + xComBorder,
        maxWidth: maxWidth === 0 ? maxWidth : maxWidth + xComBorder + xComBorder,
        maxHeight: maxHeight === 0 ? maxHeight : maxHeight + xComTop + xComBorder,
      };
      windowClass?.setWindowLimits(windowLimits)
        .catch((err: BusinessError) => {
          LogUtil.error(TAG, 'Failed to change the window limits. Cause: ' + JSON.stringify(err));
        });
    } catch (exception) {
      LogUtil.error(TAG, 'change the window limits exception. Cause:' + JSON.stringify(exception));
    }
  }

  @LogMethod
  startWindowMoving(id: number) {
    let window = this.systemFloatingWindowManager.getWindow(id);
    window?.startMoving().then(() => {
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `startWindowMoving fail, error info: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  override getOriginWindowId(windowId?: number): number {
    if (windowId === undefined) {
      return -1;
    }
    try {
      let window = this.systemFloatingWindowManager.getWindow(windowId);
      if (window) {
        return window.getWindowProperties().id;
      }
    } catch (err) {
      let message = (err as BusinessError).message;
      LogUtil.error(TAG, `getOriginWindowId failed, windowId:${windowId}, message:: ${message}`);
    }
    return -1;
  }

  @LogMethod
  setWindowShadow(id: number, hasShadow: boolean) {
    let windowClass = this.abilityManager.getProxy(id)?.getWindow();
    if (windowClass === undefined) {
      LogUtil.error(TAG, `setWindowShadow fail, window is not exist! windowId: ${id}, hasShadow: ${hasShadow}`);
      return;
    }
    const radius: number = hasShadow ? 15 : 0;
    if (deviceInfo.sdkApiVersion >= 17) {
      windowClass.setWindowShadowRadius(radius);
    } else {
      LogUtil.error(TAG, 'setWindowShadow fail, sdkApiVersion is less than 17');
    }
  }

  private adjustBounds(bounds: WindowBound): WindowBound {
    let out_bounds = bounds;
    let mainWindow = this.ctxAdapter.getActiveProxy().getWindow();
    if (!mainWindow) {
      return out_bounds;
    }
    const windowProp = mainWindow?.getWindowProperties();
    let xComBorder: number = windowProp?.drawableRect.left || 0;
    let xComTop: number = windowProp?.drawableRect.top || 0;
    out_bounds.left -= xComBorder;
    out_bounds.top -= xComTop;
    out_bounds.width += xComBorder + xComBorder;
    out_bounds.height += xComBorder + xComTop;
    return out_bounds;
  }

  private cacheWindow(parentId: string, windowId: string, windowClass: window.Window) {
    let mainWindowId = this.abilityManager.getProxy(parentId)?.getWindowId();
    if (mainWindowId) {
      super.initialize(windowId, windowClass);
      this.abilityManager.addProxy(this);
      this.systemFloatingWindowManager.addSystemFloatingWindow(mainWindowId, {
        "id": windowId,
        "window": windowClass
      });
    }
  }
};
