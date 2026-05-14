// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import type { NativeContext } from '../../../ets/interface/CommonInterface';

export const getNativeContext: (contextType: number) => NativeContext;
export const SetContextPaths: (paths: Record<string, string>) => void;
