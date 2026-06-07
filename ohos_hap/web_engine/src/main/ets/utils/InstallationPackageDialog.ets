// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export enum MenuItem {
  kOpenAppGallery = 0,
  kContinueDownload = 1,
  kCancel = 2,
}

export class InstallationParams {
  fileName: string
  fileSize: string
  onResult: (index: MenuItem) => void

  constructor(fileName: string, fileSize: string, onResult: (index: MenuItem) => void) {
    this.fileName = fileName
    this.fileSize = fileSize
    this.onResult = onResult
  }
}

@Builder
export function InstallationDialogBuilder(params: InstallationParams) {

  Column({ space: 8 }) {
    Text($r('app.string.download'))
      .fontSize(20)
      .fontWeight(FontWeight.Bold)
      .textAlign(TextAlign.Center)
      .fontColor($r('sys.color.ohos_id_color_text_primary'))

    Column({ space: 8 }) {
      Row() {
        Text($r('app.string.file_name_str'))
          .width(50)
          .fontSize(16)
          .textAlign(TextAlign.Start)
          .fontColor($r('sys.color.ohos_id_color_text_primary'))

        Marquee({
          start: true,
          step: 6,
          loop: 1,
          fromStart: true,
          src: params.fileName
        })
          .fontSize(16)
          .fontColor($r('sys.color.ohos_id_color_text_primary'))
          .width(310)
      }

      Row() {
        Text($r('app.string.file_size_str'))
          .width(50)
          .fontSize(16)
          .textAlign(TextAlign.Start)
          .fontColor($r('sys.color.ohos_id_color_text_primary'))

        Text(params.fileSize)
          .width(320)
          .fontSize(16)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .flexGrow(1)
          .fontColor($r('sys.color.ohos_id_color_text_primary'))
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('95%')

    Text($r('app.string.installation_not_supported'))
      .width('95%')
      .fontSize(12)
      .fontColor(Color.Red)
      .textAlign(TextAlign.Start)
      .fontColor($r('sys.color.ohos_id_color_text_primary'))
      .margin({ bottom: 10 })

    Column({ space: 8 }) {
      Button($r('app.string.go_to_app_gallery'))
        .width('97%')
        .onClick(() => params.onResult(MenuItem.kOpenAppGallery))
        .fontColor(Color.White)
      Button($r('app.string.still_download'))
        .width('97%')
        .onClick(() => params.onResult(MenuItem.kContinueDownload))
        .backgroundColor($r('sys.color.ohos_id_color_button_normal'))
        .fontColor($r('sys.color.status_button_text_color_focus'))
      Button($r('app.string.dialog_cancel_button'))
        .width('97%')
        .onClick(() => params.onResult(MenuItem.kCancel))
        .backgroundColor($r('sys.color.ohos_id_color_button_normal'))
        .fontColor($r('sys.color.status_button_text_color_focus'))
    }
  }
  .padding(10)
  .borderRadius(8)
  .backgroundColor($r('sys.color.ohos_id_color_dialog_bg'))
  .width(400)
}

export const WrappedInstallationBuilder = wrapBuilder(InstallationDialogBuilder)
