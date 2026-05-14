// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { CertManagerAdapter } from '../adapter/CertManagerAdapter';

function implCertManagerAdapter(): CertManagerAdapter {
  return Inject.getOrCreate(CertManagerAdapter);
}

function installPersonalCert(certData: ArrayBuffer, certPass: string, alias: string, callback: (ready: number) => void) {
  implCertManagerAdapter().installPersonalCert(certData, certPass, alias, callback);
}

function getAllPrivateCertificates(callback: Function): void {
  implCertManagerAdapter().getAllPrivateCertificates(callback);
}

function removeCertByUri(uri: string, callback: Function) {
  implCertManagerAdapter().removeCertByUri(uri, callback);
}

function signByCertUri(uri: string, inputData: ArrayBuffer, callback: Function): void {
  implCertManagerAdapter().signByCertUri(uri, inputData, callback);
}

function getCertCrl(pathDirPrefix:string, getUserIdFlag: boolean, callback: Function) {
  implCertManagerAdapter().getCertCrl(pathDirPrefix, getUserIdFlag, callback);
}

function returnUserId(callback: Function): void {
  implCertManagerAdapter().returnUserId(callback);
}

function showCertificateManagerDialog(): void {
  implCertManagerAdapter().showCertificateManagerDialog();
}

export class CertManagerAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction("CertManagerAdapter.InstallPersonalCert", installPersonalCert);
    JsBindingUtils.bindFunction("CertManagerAdapter.GetAllPrivateCertificates", getAllPrivateCertificates);
    JsBindingUtils.bindFunction("CertManagerAdapter.RemoveCertByUri", removeCertByUri);
    JsBindingUtils.bindFunction("CertManagerAdapter.SignByCertUri", signByCertUri);
    JsBindingUtils.bindFunction("CertManagerAdapter.GetCertCrl", getCertCrl);
    JsBindingUtils.bindFunction("CertManagerAdapter.ReturnUserId", returnUserId);
    JsBindingUtils.bindFunction("CertManagerAdapter.ShowCertificateManagerDialog", showCertificateManagerDialog);
  }
}