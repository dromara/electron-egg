// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { ShapeDetectionAdapter } from '../adapter/ShapeDetectionAdapter';

function implShapeDetectionAdapter(): ShapeDetectionAdapter {
  return Inject.getOrCreate(ShapeDetectionAdapter);
}

function TextDetect(buffer:ArrayBuffer, width:number, height:number, callback:Function): void {
  implShapeDetectionAdapter().TextDetect(buffer, width, height, callback);
}

function FaceDetect(buffer:ArrayBuffer, width:number, height:number, callback:Function) : void  {
  implShapeDetectionAdapter().FaceDetect(buffer, width, height, callback);
}


export class ShapeDetectionAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('ShapeDetectionAdapter.TextDetect', TextDetect);
    JsBindingUtils.bindFunction('ShapeDetectionAdapter.FaceDetect', FaceDetect);
  }
}