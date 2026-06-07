// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { PrintAdapter } from '../adapter/PrintAdapter';

function implPrintAdapter(): PrintAdapter {
  return Inject.getOrCreate(PrintAdapter);
}

function showPrintDialog(value: string) {
  implPrintAdapter().showPrintDialog(value);
}

function PrintPdfFiles(pdfData: ArrayBuffer) {
  implPrintAdapter().PrintPdfFiles(pdfData);
}

function showPrintTipsDialog() {
  implPrintAdapter().showPrintTipsDialog();
}

export class PrintAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("PrintAdapter.ShowPrintDialog", showPrintDialog);
    JsBindingUtils.bindFunction("PrintAdapter.PrintPdfFiles", PrintPdfFiles);
    JsBindingUtils.bindFunction("PrintAdapter.ShowPrintTipsDialog", showPrintTipsDialog);
  }
}