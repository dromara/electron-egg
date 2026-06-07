// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import fileUri from '@ohos.file.fileuri';

export default class StringUtil {
  private static TAG: string = 'StringUtil';

  static uriConvert(docs: string[]): string[] {
    let copy: string[] = [];
    docs.forEach((path) => {
      // Resolve Chinese garbled characters
      path = decodeURI(path);
      // Convert to uri get systeam path
      let uri = new fileUri.FileUri(path);
      copy.push(uri.path);
    });
    return copy;
  }
}
