// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import { BaseAdapter } from '../common/BaseAdapter';
import LogMethod from '../common/LogDecorator';
import { uniformTypeDescriptor } from '@kit.ArkData';
import LogUtil from '../utils/LogUtil';

@injectable()
export class MimeTypeAdapter extends BaseAdapter {
  @LogMethod
  GetExtensionByMimeType(mimeType: string): string[] {
    try {
      const typeId = uniformTypeDescriptor.getUniformDataTypeByMIMEType(mimeType);
      let typeObj: uniformTypeDescriptor.TypeDescriptor = uniformTypeDescriptor.getTypeDescriptor(typeId);
      if (typeObj) {
        let copy: string[] = []
        typeObj.filenameExtensions.forEach((ext) => {
          if (ext.startsWith(".")) {
            copy.push(ext.slice(1));
          } else {
            copy.push(ext);
          }
        })
        return copy;
      } else {
        return [];
      }
    } catch (err) {
      LogUtil.error('MimeTypeAdapter', `GetExtensionByMimeType failed: ${err}`);
    }
    return [];
  }

  @LogMethod
  GetMimeTypeByExtension(extension: string): string[] {
    try {
      const typeId = uniformTypeDescriptor.getUniformDataTypeByFilenameExtension("." + extension);
      let typeObj: uniformTypeDescriptor.TypeDescriptor = uniformTypeDescriptor.getTypeDescriptor(typeId);
      if (typeObj) {
        return typeObj.mimeTypes;
      } else {
        return [];
      }
    } catch (err) {
      LogUtil.error('MimeTypeAdapter', `GetMimeTypeByExtension failed: ${err}`);
    }
    return [];
  }
}