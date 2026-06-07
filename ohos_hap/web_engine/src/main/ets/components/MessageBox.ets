
// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const TITLE_SIZE: number = 20;
const TITLE_WEIGHT: number = 700;
const MESSAGE_SIZE: number = 18;
const DETAIL_SIZE: number = 16;
const TEXT_MESSAGE_PADDING: number = 0;
const TEXT_MAX_LINES: number = 10;
const SPACE: number = 10;
const BUTTON_WIDTH_PCT: string = '40%';
const BORDER_WIDTH: number = 20;
const CHECKBOX_SIZE: number = 30;
const CHECKBOX_FONT_SIZE: number = 18;
const DIALOG_CORNER_RADIUS: number = 10;

@CustomDialog
export struct MessageBox {
  private title: string = '';
  private message: string = '';
  private detail: string = '';
  private checkboxLabel: string = '';
  private buttons: string[] = [];
  @State private checkboxChecked: boolean = false;
  private callback: (buttonId: number, checkoutChecked: boolean) => void = () => {};
  @State private showCheckbox: boolean = false;
  @State private showOneOrTwoButton: boolean = true;
  private isButtonClicked: boolean = false;
  private icon: PixelMap | undefined;

  controller?: CustomDialogController

  aboutToAppear() {
    if (this.buttons.length === 0) {
      this.buttons.push('OK');
    }
    if (this.checkboxLabel.trim().length === 0) {
      this.showCheckbox = false;
    } else {
      this.showCheckbox = true;
    }
    if (this.buttons.length < 3) {
      this.showOneOrTwoButton = true;
    } else {
      this.showOneOrTwoButton = false;
    }
  }

  build() {
    Column({space: SPACE}) {
      // title
      Row() {
        Text(this.title)
          .fontSize(TITLE_SIZE)
          .fontWeight(TITLE_WEIGHT)
          .margin({top: 15, left: 15})
      }
      .width('100%')
      // icon
      if (this.icon !== undefined) {
        Row() {
          Image(this.icon)
            .height('20%')
            .borderRadius(DIALOG_CORNER_RADIUS)
        }
      }
      // message
      Column() {
        Text(this.message)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .maxLines(TEXT_MAX_LINES)
          .fontSize(MESSAGE_SIZE)
          .padding(TEXT_MESSAGE_PADDING)
        if (this.detail != '') {
          Text(this.detail)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .maxLines(TEXT_MAX_LINES)
            .fontSize(DETAIL_SIZE)
            .padding(TEXT_MESSAGE_PADDING)
            .margin({top: 10})
        }
      }.width('100%')
      // checkbox
      if (this.showCheckbox) {
        Row({ space: SPACE }) {
          Checkbox({ name: 'checkbox', group: 'checkboxGroup' })
            .select(this.checkboxChecked)
            .selectedColor($r('app.color.checkbox_selected'))
            .onChange((value: boolean) => {
              this.checkboxChecked = value;
            })
            .width(CHECKBOX_SIZE)
            .height(CHECKBOX_SIZE)
            .margin(0)
            .padding(0)
          Text(this.checkboxLabel)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .maxLines(3)
            .fontSize(CHECKBOX_FONT_SIZE)
            .padding(TEXT_MESSAGE_PADDING)
        }.width('100%')
      }
      // buttons
      if (this.showOneOrTwoButton) {
        Row( { space: SPACE }) {
          ForEach(this.buttons, (button: string, index: number) => {
            Button(button)
              .onClick(() => {
                if (this.isButtonClicked) {
                  return;
                }
                this.isButtonClicked = true;
                if (this.controller != undefined) {
                  this.callback(index, this.checkboxChecked);
                  this.controller.close();
                }
              })
              .backgroundColor($r('app.color.button_background'))
              .fontColor($r('app.color.button_font'))
              .width(BUTTON_WIDTH_PCT)
          }, (button: string, index: number) => index.toString())
        }
        .margin({top: 15, left: 10})
      } else {
        Column({ space: SPACE }) {
          ForEach(this.buttons, (button: string, index: number) => {
            Button(button)
              .onClick(() => {
                if (this.isButtonClicked) {
                  return;
                }
                this.isButtonClicked = true;
                if (this.controller != undefined) {
                  this.callback(index, this.checkboxChecked);
                  this.controller.close();
                }
              })
              .backgroundColor($r('app.color.button_background'))
              .fontColor($r('app.color.button_font'))
              .width(BUTTON_WIDTH_PCT)
          }, (button: string, index: number) => index.toString())
        }
      }
      Row({ space: SPACE }) {}
    }
    .borderRadius(DIALOG_CORNER_RADIUS)
  }
}