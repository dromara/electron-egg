// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import adapter from 'libadapter.so';
import Inject from '../common/InjectModule';
import { ContextPathAdapter } from '../adapter/ContextPathAdapter';
import { ContextType } from '../common/Constants';
import { NativeContext } from '../interface/CommonInterface';

export default class JsBindingUtils {
  private static currentContext: NativeContext;

  private static currentType: ContextType;

  static initNativeContext(contextType: ContextType) {
    JsBindingUtils.currentType = contextType;
    JsBindingUtils.currentContext = adapter.getNativeContext(contextType);
  }

  static bindFunction(name: string, func: Function) {
    if (JsBindingUtils.currentContext === undefined) {
      JsBindingUtils.initNativeContext(ContextType.kMainProcess);
    }
    JsBindingUtils.currentContext.JSBind.bindFunction(name, func);
  }

  static callFunction(name: string, ...args: object[]) {
  }

  static getNativeContext(contextType: number): NativeContext {
    if (JsBindingUtils.currentType === contextType && JsBindingUtils.currentContext !== undefined) {
      return JsBindingUtils.currentContext;
    }
    return adapter.getNativeContext(contextType);
  }

  static SetContextPaths() {
    const contextPathAdapter = Inject.get(ContextPathAdapter);
    if (!contextPathAdapter) {
      console.error('ContextPathAdapter not available');
      return;
    }
    const safeGet = (fn: () => string, defaultValue: string = ''): string => {
      try { return fn(); } catch (e) { return defaultValue; }
    };
    const paths: Record<string, string> = {
      "cacheDir": safeGet((): string => contextPathAdapter.getCacheDir()),
      "filesDir": safeGet((): string => contextPathAdapter.getFilesDir()),
      "tempDir": safeGet((): string => contextPathAdapter.getTempDir()),
      "userDocumentDir": safeGet((): string => contextPathAdapter.getUserDocumentDir()),
      "userDesktopDir": safeGet((): string => contextPathAdapter.getUserDesktopDir()),
      "userDownloadDir": safeGet((): string => contextPathAdapter.getUserDownloadDir()),
    };
    if (adapter.SetContextPaths) {
      adapter.SetContextPaths(paths);
    } else {
      console.error('SetContextPaths not found in C++ module');
    }
  }
}