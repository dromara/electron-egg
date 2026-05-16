// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { WebEmbeddedWindow } from 'web_engine';
import { KeyCode } from '@kit.InputKit';

let storage = LocalStorage.getShared();
@Entry(storage)
@Component
struct EmbeddedWindow {
  build() {
    Row() {
      WebEmbeddedWindow()
    }.onKeyEvent((event?: KeyEvent) => {
      if (event) {
        if (event.type == KeyType.Down && event.keyCode == KeyCode.KEYCODE_ESCAPE) {
          event.stopPropagation();
        }
      }
    })
    .width('100%')
    .height('100%')
  }
}
