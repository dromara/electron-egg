// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ContextType } from './Constants';
import { injectable, inject } from 'inversify';
import JsBindingUtils from '../utils/JsBindingUtils';
import { NativeContext } from '../interface/CommonInterface';
import * as ns from "reflect-metadata"
ns

@injectable()
export abstract class BaseAdapter {
    protected nativeContext: NativeContext;

    constructor() {
        this.nativeContext = JsBindingUtils.getNativeContext(ContextType.kMainProcess);
    }

    init(): void {}

    unInit(): void {}

    getNativeContext(): NativeContext {
        return this.nativeContext;
    }
}