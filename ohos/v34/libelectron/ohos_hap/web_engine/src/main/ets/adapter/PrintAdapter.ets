// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { inject, injectable } from 'inversify';
import { BusinessError } from '@ohos.base';
import print from '@ohos.print';
import fs, { ListFileOptions } from '@ohos.file.fs';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

import promptAction from '@ohos.promptAction'
import { ContextAdapter } from './ContextAdapter';

const TAG: string = 'Print';

@injectable()
export class PrintAdapter extends BaseAdapter {
  private printFilesPath: string [] = [];
  private ctxAdapter: ContextAdapter;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.init();
  }

  override init() {
    let dirPath = this.ctxAdapter.getContext().getApplicationContext().tempDir + "/print";
    fs.mkdir(dirPath).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'mkdir error: ' + JSON.stringify(err));
    });
  }

  @LogMethod
  showPrintDialog(value: string) {
    // TODO: need adapter print file
    let dirPath = this.ctxAdapter.getContext().getApplicationContext().tempDir + "/print";
    let listFileOption: ListFileOptions = {
      recursion: false,
      listNum: 0,
      filter: {}
    }
    fs.listFile(dirPath, listFileOption).then((filenames: Array<string>) => {
      for (let i = 0; i < filenames.length; i++) {
        let pngPath = dirPath + '/' + filenames[i];
        let tempFile: fs.File = fs.openSync(pngPath);
        let fileFd = 'fd://' + tempFile.fd;
        this.printFilesPath.push(fileFd);
      }
      print.print(this.printFilesPath, this.ctxAdapter.getActiveContext())
        .then((printTask: print.PrintTask) => {
          printTask.on('succeed', () => {
            LogUtil.info(TAG, 'print state is succeed');
          })
          printTask.on('cancel', () => {
            LogUtil.info(TAG, 'print state is cancel');
          })
        }).catch((error: Error) => {
        LogUtil.error(TAG, 'print err ' + JSON.stringify(error));
      })
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'list file error: ' + JSON.stringify(err));
    });
  }

  @LogMethod
  PrintPdfFiles(pdfData: ArrayBuffer) {
    let printAdapter: print.PrintDocumentAdapter = {
      onStartLayoutWrite(jobId: string,
                         oldAttrs: print.PrintAttributes,
                         newAttrs: print.PrintAttributes,
                         fd: number,
                         writeResultCallback: (jobId: string, writeResult: print.PrintFileCreationState) => void): void {
        const contentBuf: Uint8Array = new Uint8Array(pdfData);
        fs.writeSync(fd, contentBuf.buffer);
        writeResultCallback(jobId, print.PrintFileCreationState.PRINT_FILE_CREATED_UNRENDERED);
      },
      onJobStateChanged(jobId: string, state: print.PrintDocumentAdapterState): void {}
    }
    // default print start parameter
    let printAttributes: print.PrintAttributes = {
      pageSize: print.PrintPageType.PAGE_ISO_A4,
      directionMode: print.PrintDirectionMode.DIRECTION_MODE_AUTO,
      colorMode: print.PrintColorMode.COLOR_MODE_MONOCHROME,
      duplexMode: print.PrintDuplexMode.DUPLEX_MODE_NONE
    }
    print.print('', printAdapter, printAttributes, this.ctxAdapter.getActiveContext())
      .then(() => {
        LogUtil.info(TAG, 'Succeeded in print pdf files.');
      }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'Failed to print pdf files. Cause:' + JSON.stringify(err));
    });
  }

  @LogMethod
  showPrintTipsDialog() {
    try {
      promptAction.showDialog({
        title: $r('app.string.print_title'),
        message: $r('app.string.print_tip'),
        buttons: [
          {
            text: $r('app.string.print_ok'),
            color: $r('app.color.print_tip_button')
          },
        ],
      }).catch((err: Error) => {
          LogUtil.error(TAG, 'showDialog error:' + err);
        })
    } catch (error) {
      LogUtil.error(TAG, 'list file error: ' + JSON.stringify(error));
    }
    ;
  }
}