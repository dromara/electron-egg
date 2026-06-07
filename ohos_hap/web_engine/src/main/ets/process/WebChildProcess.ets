// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
 
import ChildProcess from '@ohos.app.ability.ChildProcess';
import { ContextType } from '../common/Constants';
import { NativeContext } from '../interface/CommonInterface';
import JsBindingUtils from '../utils/JsBindingUtils';
import LogUtil from '../utils/LogUtil';

export class WebChildProcess extends ChildProcess {
  private nativeContext: NativeContext = JsBindingUtils.getNativeContext(ContextType.kRenderProcess);

  onStart(): void {
    LogUtil.info("childProcess", "WebChildProcess onStart");
    this.nativeContext.runOtherProcessType(ContextType.kRenderProcess);
  }
}