// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { BaseAdapter } from '../common/BaseAdapter';
import { BusinessError } from '@ohos.base';
import image from '@ohos.multimedia.image';
import { injectable } from 'inversify';
import LogMethod from '../common/LogDecorator';
import LogUtil from '../utils/LogUtil';
import { OhosPasteDataRecord } from '../interface/CommonInterface';
import pasteboard from '@ohos.pasteboard';
import StringUtil from '../utils/StringUtil';

const TAG: string = 'PasteBoard';
const TYPES: string[] = ['plainText', 'htmlText', 'pixelMap', 'uri'];

interface PasteBoardImage {
  pixelMapFormat: number,
  alphaType: number,
  width: number,
  height: number,
  rowBytes: number,
};

@injectable()
export class PasteBoardAdapter extends BaseAdapter {
  @LogMethod
  setPasteData(recordInfo: OhosPasteDataRecord, arrayBuff: ArrayBuffer) : void {
    let record: pasteboard.PasteDataRecord = pasteboard.createRecord(recordInfo.mime_type, '');
    const arrayBuffer : ArrayBuffer = arrayBuff as ArrayBuffer;
    if (recordInfo.html_text) {
      record.htmlText = recordInfo.html_text;
    }
    if (recordInfo.plain_text) {
      record.plainText = recordInfo.plain_text;
    }
    if (arrayBuff !== undefined && arrayBuff.byteLength > 0) {
      record.data = {'chromium/x-bookmark-entries' : arrayBuffer}
    }
    let pasteData = pasteboard.createData(record.mimeType, '');
    pasteData.replaceRecord(0, record);

    try {
      pasteboard.getSystemPasteboard().setDataSync(pasteData);
    } catch (err) {
      LogUtil.error(TAG, `Failed to write pasteboard. Cause: ${JSON.stringify(err.message)}`);
    }
  }

  @LogMethod
  readPasteBoardText(callback: Function) : void {
    pasteboard.getSystemPasteboard().getData().then((v: pasteboard.PasteData) => {
      const count: number = v.getRecordCount();
      let textData: string = '';
      for (let i = 0; i < count; i++) {
        let recordData = v.getRecord(i);
        if (recordData.plainText !== undefined) {
          textData += recordData.plainText;
        } else {
          LogUtil.warn(TAG, 'plain text undefined');
        }
      }
      callback(textData);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to read pasteboard text. Cause: ${JSON.stringify(err.message)}`);
      callback('');
    });
  }

  @LogMethod
  clear() : void {
    let systemPasteboard: pasteboard.SystemPasteboard = pasteboard.getSystemPasteboard();
    try {
      systemPasteboard.clearDataSync();
    } catch (err) {
      LogUtil.error(TAG, `Failed to clear PasteData. Cause: ${JSON.stringify(err.message)}`);
    }
  }

  @LogMethod
  isExistMimeType(callback: Function, type: string) : void {
    let ret: boolean = false;
    pasteboard.getSystemPasteboard().getData().then((data: pasteboard.PasteData) => {
      const count: number = data.getRecordCount();
      for (let i = 0; i < count; i++) {
        let recordData = data.getRecord(i);
        if (this.isSupportedType(type, recordData) === true) {
          ret = true;
          break;
        }
      }
      if (!ret) {
        LogUtil.warn(TAG, 'is not exist mime type');
      }
      callback(ret);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to get MimeType. Cause: ${JSON.stringify(err.message)}`);
      callback(ret);
    });
  }

  @LogMethod
  readPasteBoardHTML(callback: Function) : void {
    pasteboard.getSystemPasteboard().getData().then((v: pasteboard.PasteData) => {
      const count: number = v.getRecordCount();
      let htmlData: string = '';
      for (let i = 0; i < count; i++) {
        let recordData = v.getRecord(i);
        if (recordData.htmlText !== undefined) {
          htmlData += recordData.htmlText;
        }
      }
      callback(htmlData);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to read pasteboard text. Cause: ${JSON.stringify(err.message)}`);
      callback('');
    });
  }

  @LogMethod
  readImageBuff(callback: Function){
    pasteboard.getSystemPasteboard().getData().then((data: pasteboard.PasteData) => {
      let pixelMap = data.getPrimaryPixelMap();
      const readBuffer: ArrayBuffer = new ArrayBuffer(data.getRecord(0).pixelMap.getPixelBytesNumber());
      pixelMap.readPixelsToBuffer(readBuffer, (err: BusinessError, res: void) => {
        if (err) {
          LogUtil.error(TAG, 'Failed to obtain the image pixel map buff.');
          callback(new ArrayBuffer(0));
          return;
        }
        callback(readBuffer);
      })
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to read pasteboard image buff. Cause:${JSON.stringify(err.message)}`);
      callback(new ArrayBuffer(0));
    });
  }

  @LogMethod
  readImageInfo(callback: Function){
    let imageInfo: PasteBoardImage = {
      pixelMapFormat: image.PixelMapFormat.UNKNOWN as number,
      alphaType: image.AlphaType.UNKNOWN as number,
      width: 0,
      height: 0,
      rowBytes: 0
    };
    try {
      let pasteImage: pasteboard.PasteData = pasteboard.getSystemPasteboard().getDataSync();
      if (pasteImage !== undefined) {
        let result: image.ImageInfo = pasteImage.getRecord(0).pixelMap.getImageInfoSync();
        if (result !== undefined) {
          imageInfo.pixelMapFormat = result.pixelFormat;
          imageInfo.alphaType = result.alphaType;
          imageInfo.width = result.size.width;
          imageInfo.height = result.size.height;
          imageInfo.rowBytes = pasteImage.getRecord(0).pixelMap.getBytesNumberPerRow();
        }
      } else {
        LogUtil.error(TAG, 'read pasteboard image result is undefined.');
      }
      if (callback !== undefined) {
        callback(imageInfo);
      }
    } catch (err) {
      LogUtil.error(TAG, `Failed to read pasteboard image info. Cause:${JSON.stringify(err.message)}`);
      callback(imageInfo);
    }
  }

  @LogMethod
  writeImage(buff: ArrayBuffer, height: number, width: number,
                    pixelFormat: image.PixelMapFormat, alphaType: image.AlphaType) : void {
    const bufferArr : ArrayBuffer = buff as ArrayBuffer;
    let opts : image.InitializationOptions = {
      editable: true, pixelFormat: pixelFormat, size: { height: height, width: width}, alphaType: alphaType}
    try {
      let pixelMap : image.PixelMap = image.createPixelMapSync(bufferArr, opts);
      if (pixelMap !== undefined) {
        let pasteData = pasteboard.createData(pasteboard.MIMETYPE_PIXELMAP, pixelMap);
        pasteboard.getSystemPasteboard().setDataSync(pasteData);
      }
    } catch (err) {
      LogUtil.error(TAG, `Failed to write image, code is:${JSON.stringify(err.message)}`);
    }
  }

  @LogMethod
  writeData(data: ArrayBuffer, format: string) : void {
    const arrayBuffer : ArrayBuffer = data as ArrayBuffer;
    let pasteData = pasteboard.createData(format, arrayBuffer);
    try {
      pasteboard.getSystemPasteboard().setDataSync(pasteData);
    } catch (err) {
      LogUtil.error(TAG, `Failed to write data, code is:${JSON.stringify(err.message)}`);
    }
  }

  @LogMethod
  readPasteBoardData(callback: Function, format: string) : void {
    pasteboard.getSystemPasteboard().getData().then((v: pasteboard.PasteData) => {
      const count: number = v.getRecordCount();
      for (let i = 0; i < count; i++) {
        let recordData = v.getRecord(i);
        if (recordData.data !== undefined && recordData.data[format] !== undefined) {
          let data: ArrayBuffer = recordData.data[format];
          callback(data);
          return;
        }
      }
      const buffer = new ArrayBuffer(0);
      callback(buffer);
    }).catch((err: BusinessError) => {
      const buffer = new ArrayBuffer(0);
      callback(buffer);
      LogUtil.error(TAG, `Failed to read data, code is:${JSON.stringify(err.message)}`);
    });
  }

  @LogMethod
  readPasteBoardURI(callback: (filePaths: Array<string>) => void) : void {
    pasteboard.getSystemPasteboard().getData().then((v: pasteboard.PasteData) => {
      const count: number = v.getRecordCount();
      let filePaths = new Array<string>();
      let fileData: string = '';
      for (let i = 0; i < count; i++) {
        let recordData = v.getRecord(i);
        if (recordData.uri !== undefined) {
          fileData = StringUtil.filterFileDocs(recordData.uri);
          filePaths.push(fileData);
        }
      }
      callback(filePaths);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `Failed to read uri, code is:${JSON.stringify(err.message)}`);
      callback(Array<string>());
    });
  }

  private isSupportedType(type: string, recordData: pasteboard.PasteDataRecord) : boolean {
    if ((type === 'chromium/x-bookmark-entries' && recordData.data !== undefined &&
      recordData.data['chromium/x-bookmark-entries'] !== undefined)) {
      return true;
    }

    if (TYPES.includes(type) && recordData[type] !== undefined) {
      return true;
    }
    return false;
  }
}
