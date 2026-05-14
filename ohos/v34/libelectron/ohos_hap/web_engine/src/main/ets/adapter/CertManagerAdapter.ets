// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import account_osAccount from '@ohos.account.osAccount';
import { inject, injectable } from 'inversify';
import certManager from '@ohos.security.certManager';
import { certificateManager } from '@kit.DeviceCertificateKit';
import { BusinessError } from '@ohos.base';
import fs, { Filter } from '@ohos.file.fs';
import certificateManagerDialog from '@ohos.security.certManagerDialog';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import { ContextAdapter } from './ContextAdapter';

class ListFileOption {
  public recursion: boolean = false;
  public listNum: number = 0;
  public filter: Filter = {};
}

interface OhosCertInfo {
  cert: string;
  uri: string;
}

const TAG: string = 'CertManagerAdapter';

@injectable()
export class CertManagerAdapter extends BaseAdapter {
  private ctxAdapter: ContextAdapter;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  get uriPath(): string {
    return `${this.ctxAdapter.getContext().filesDir}/uris`;
  }

  readFile(filePath: string) : string {
    let res = fs.accessSync(filePath);
    if (!res) {
      return '';
    }
    let fileStat = fs.lstatSync(filePath);
    let file = fs.openSync(filePath, fs.OpenMode.READ_ONLY | fs.OpenMode.CREATE);
    let buf = new ArrayBuffer(fileStat.size);
    fs.readSync(file.fd, buf);
    fs.closeSync(file);
    return this.uint8ArrayToString(new Uint8Array(buf));
  }

  @LogMethod
  installPersonalCert(certData: ArrayBuffer,
    certPass: string,
    alias: string,
    callback: (ready: number) => void) {
    const keystore: Uint8Array =  new Uint8Array(certData);
    const keystorePwd: string = certPass;
    certManager.installPrivateCertificate(keystore, keystorePwd, alias)
      .then((cmResult) => {
        callback(0);
      }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `installPrivateCertificate failed, code: ${err.code}`);
      callback(err.code);
    });
  }

  private uint8ArrayToString(data: Uint8Array) {
    return data.reduce((prev, current) => prev + String.fromCharCode(current), '');
  }

  @LogMethod
  async getAllPrivateCertificates(callback: Function) {
    const certInfos: OhosCertInfo[] = [];
    try {
      certificateManager.getPrivateCertificates().then(async (cmResult) => {
        if (cmResult === undefined || cmResult.credentialList === undefined) {
          LogUtil.error(TAG, `credentialList is undefined.`);
          callback(certInfos, 0);
          return;
        }

        let list = cmResult.credentialList;
        for (let i = 0; i < list.length; i++) {
          let cmResult = await certManager.getPrivateCertificate(list[i].keyUri);
          if (cmResult && cmResult.credential && cmResult.credential.keyNum > 0) {
            const certInfo: OhosCertInfo = {
              uri: list[i].keyUri,
              cert: this.uint8ArrayToString(cmResult.credential.credentialData)
            };
            certInfos.push(certInfo);
          }
        }
        callback(certInfos, certInfos.length);
      }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `getPrivateCertificates failed, code: ${err.code}`);
        callback(certInfos, 0);
      })
    } catch (error) {
      LogUtil.error(TAG, `getPrivateCertificates failed, code: ${error.code}`);
      callback(certInfos, 0);
    }
  }

  @LogMethod
  removeCertByUri(uriparam: string, callback: Function) {
    certManager.uninstallPrivateCertificate(uriparam).then(() => {
      callback(0);
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, `uninstallPrivateCertificate failed, code: ${err.code}`);
      callback(err.code);
    });
  }

  @LogMethod
  signByCertUri(uri: string, inputData: ArrayBuffer, callback: Function): void {
    const input: Uint8Array =  new Uint8Array(inputData);
    const buffer_return = new ArrayBuffer(0);
    const SignReq: certManager.CMSignatureSpec = {
      purpose: certManager.CmKeyPurpose.CM_KEY_PURPOSE_SIGN,
      padding: certManager.CmKeyPadding.CM_PADDING_PKCS1_V1_5,
      digest: certManager.CmKeyDigest.CM_DIGEST_SHA256
    }
    certManager.init(uri, SignReq, (err: BusinessError, SignHandle: certManager.CMHandle) => {
      if (err) {
        LogUtil.error(TAG, `init sign failed, code: ${err.code}`);
        callback(buffer_return);
        return;
      }
      const SignHandle_const = SignHandle.handle;
      certManager.update(SignHandle_const, input, (err: BusinessError) => {
        if (err) {
          LogUtil.error(TAG, `update sign failed, code: ${err.code}`);
          callback(buffer_return);
          return;
        }
        certManager.finish(SignHandle_const).then((cmResult) => {
          callback(cmResult.outData || buffer_return);
        }).catch((err: BusinessError) => {
          LogUtil.error(TAG, `finish sign failed, code: ${err.code}`);
          callback(buffer_return);
        });
      });
    })
  }

  async getUserId(): Promise<number> {
    let accountManager = account_osAccount.getAccountManager();
    let localId: number = await accountManager.getOsAccountLocalId();
    return await Promise.resolve(localId);
  }

  @LogMethod
  async returnUserId(callback: Function) {
    let userid: number = await this.getUserId();
    callback(userid);
  }

  @LogMethod
  async getCertCrl(pathDirPrefix:string, getUserIdFlag: boolean, callback: Function) {
    let option = new ListFileOption();
    let pathDir: string;
    if (getUserIdFlag) {
      let userid: number = await this.getUserId();
      pathDir = pathDirPrefix + userid;
    } else {
      pathDir = pathDirPrefix;
    }

    let cert_crl = new Array<string>();
    let res = fs.accessSync(pathDir);
    if (!res) {
      callback(cert_crl, 0);
      return;
    }
    let filenames = fs.listFileSync(pathDir, option);

    for (let i = 0; i < filenames.length; i++) {
      let filePath: string = pathDir + '/' + filenames[i];
      let buf: string = this.readFile(filePath);
      cert_crl.push(buf);
    }
    callback(cert_crl, cert_crl.length);
  }

  @LogMethod
  showCertificateManagerDialog() {
    let activeContext = this.ctxAdapter.getActiveContext();
    if (!activeContext) {
      LogUtil.warn(TAG, 'Failed to get active context');
      return;
    }
    let pageType: certificateManagerDialog.CertificateDialogPageType =
       certificateManagerDialog.CertificateDialogPageType.PAGE_MAIN;
    try {
      certificateManagerDialog.openCertificateManagerDialog(activeContext, pageType)
        .then(() => {
        }).catch((err: BusinessError) => {
        LogUtil.error(TAG, `openCertificateManagerDialog failed, code: ${err.code}`);
      })
    } catch (error) {
      LogUtil.error(TAG, `openCertificateManagerDialog failed, code: ${error.code}`);
    }
  }

}
