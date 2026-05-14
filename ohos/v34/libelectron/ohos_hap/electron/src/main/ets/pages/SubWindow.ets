// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { WebSubWindow } from 'web_engine';

let subStorage = LocalStorage.getShared();
@Entry(subStorage)
@Component
struct SubWindow {
  build() {
    Column() {
      WebSubWindow()
    }
    .width('100%')
    .height('100%')
  }
}