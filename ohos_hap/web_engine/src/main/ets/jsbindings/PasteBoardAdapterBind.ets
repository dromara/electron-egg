// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import image from '@ohos.multimedia.image';
import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import type { OhosPasteDataRecord } from '../interface/CommonInterface';
import lazy { PasteBoardAdapter } from '../adapter/PasteBoardApadter';

function implPasteBoardAdapter(): PasteBoardAdapter {
  return Inject.getOrCreate(PasteBoardAdapter);
}

function setPasteData(recordInfo: OhosPasteDataRecord, arrayBuff: ArrayBuffer) : void {
  implPasteBoardAdapter().setPasteData(recordInfo, arrayBuff);
}

function readPasteBoardText(callback: Function) : void {
  implPasteBoardAdapter().readPasteBoardText(callback);
}

function clear() : void {
  implPasteBoardAdapter().clear();
}

function isExistMimeType(callback: Function, type: string) : void {
  implPasteBoardAdapter().isExistMimeType(callback, type);
}

function readPasteBoardHTML(callback: Function) : void {
  implPasteBoardAdapter().readPasteBoardHTML(callback);
}

function readImageBuff(callback: Function){
  implPasteBoardAdapter().readImageBuff(callback);
}

function readImageInfo(callback: Function) {
  implPasteBoardAdapter().readImageInfo(callback);
}

function writeImage(buff: ArrayBuffer, height: number, width: number,
                    pixelFormat: image.PixelMapFormat, alphaType: image.AlphaType) : void {
  implPasteBoardAdapter().writeImage(buff, height, width, pixelFormat, alphaType);
}

function writeData(data: ArrayBuffer, format: string) : void {
  implPasteBoardAdapter().writeData(data, format);
}

function readPasteBoardData(callback: Function, format: string) : void {
  implPasteBoardAdapter().readPasteBoardData(callback, format);
}

function readPasteBoardURI(callback: (filePaths: Array<string>) => void) : void {
  implPasteBoardAdapter().readPasteBoardURI(callback);
}

export class PasteBoardAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('PasteBoardAdapter.ReadPasteBoardText', readPasteBoardText);
    JsBindingUtils.bindFunction('PasteBoardAdapter.Clear', clear);
    JsBindingUtils.bindFunction('PasteBoardAdapter.IsExistMimeType', isExistMimeType);
    JsBindingUtils.bindFunction('PasteBoardAdapter.ReadPasteBoardHTML', readPasteBoardHTML);
    JsBindingUtils.bindFunction('PasteBoardAdapter.ReadImageBuff', readImageBuff);
    JsBindingUtils.bindFunction('PasteBoardAdapter.WriteImage', writeImage);
    JsBindingUtils.bindFunction('PasteBoardAdapter.WriteData', writeData);
    JsBindingUtils.bindFunction('PasteBoardAdapter.ReadPasteBoardData', readPasteBoardData);
    JsBindingUtils.bindFunction('PasteBoardAdapter.SetPasteData', setPasteData);
    JsBindingUtils.bindFunction('PasteBoardAdapter.ReadPasteBoardURI',readPasteBoardURI);
    JsBindingUtils.bindFunction('PasteBoardAdapter.ReadImageInfo',readImageInfo);
  }
}