// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable, inject } from 'inversify';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import { Permissions } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';
import bundleManager from '@ohos.bundle.bundleManager';
import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import LaunchHelper from '../utils/LaunchHelper';
import { ContextAdapter } from './ContextAdapter';
import { fileShare } from '@kit.CoreFileKit';
import preferences from '@ohos.data.preferences';
import prompt from '@ohos.promptAction'
import { promptAction } from '@kit.ArkUI';
import { Want } from '@kit.AbilityKit';

const CONFIRM: number = 0;
const ERROR: number = -1;
const ACTIVATE_SUCCESS: number = 1;
const EMPTY_ARRAY: number = -1;
const TAG: string = 'PermissionManagerAdapter';
const REQUEST_PERMISSION_FAIL: number = -2;
const REQUEST_PERMISSION_SUCCESS: number = 0;
let dataPreferences: preferences.Preferences | null = null;
let options: preferences.Options = { name: 'myStore' };

interface ConfirmParams {
  title: string,
  content: string,
  label: string,
  confirm: string,
  cancel: string
}

@injectable()
export class PermissionManagerAdapter extends BaseAdapter {
  private readonly needPermissions: Map<string, Array<Permissions>> = new Map([
    ['location', [
      'ohos.permission.APPROXIMATELY_LOCATION',
      'ohos.permission.LOCATION',
    ]],
    ['microphone', [
      'ohos.permission.MICROPHONE',
    ]],
    ['camera', [
      'ohos.permission.CAMERA',
    ]],
    ['screenshot', [
      'ohos.permission.CUSTOM_SCREEN_CAPTURE',
    ]],
    ['pasteboard', [
      'ohos.permission.READ_PASTEBOARD',
    ]],
    ['bluetooth', [
      'ohos.permission.ACCESS_BLUETOOTH',
    ]],
    ['directory_download', [
      'ohos.permission.READ_WRITE_DOWNLOAD_DIRECTORY',
    ]],
    ['directory_desktop', [
      'ohos.permission.READ_WRITE_DESKTOP_DIRECTORY',
    ]],
    ['directory_document', [
      'ohos.permission.READ_WRITE_DOCUMENTS_DIRECTORY',
    ]],
    ['screen_capture', [
      'ohos.permission.CUSTOM_SCREEN_CAPTURE',
    ]]
  ]);
  private atManager: abilityAccessCtrl.AtManager;
  private tokenId: number = 0;
  private ctxAdapter: ContextAdapter;
  private isInitialized: boolean = false;
  private appLabelId: number = 0;
  private bundleName: string = 'com.electronegg.demo';
  private bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION |
                        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_METADATA;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.atManager = abilityAccessCtrl.createAtManager();

    try {
      let data = bundleManager.getBundleInfoForSelfSync(this.bundleFlags);
      this.bundleName = data.name;
      this.tokenId = data.appInfo.accessTokenId;
      this.appLabelId =  data.appInfo.labelId;
    } catch (err) {
      let message = (err as BusinessError).message;
      LogUtil.error(TAG, `getBundleInfoForSelfSync failed.: ${message}`);
    }
  }

  @LogMethod
  requestPermissions(permissionType: string, callback: (granted: number) => void) {
    const permissions = this.needPermissions.get(permissionType);
    if (!permissions) {
      LogUtil.error(TAG, 'unsupported permission:' + permissionType);
      callback(REQUEST_PERMISSION_FAIL);
      return;
    }
    let activeContext = this.ctxAdapter.getActiveContext();
    if (!activeContext) {
      LogUtil.error(TAG, 'requestPermissions, no active context');
      callback(REQUEST_PERMISSION_FAIL);
      return;
    }

    try {
      this.atManager.requestPermissionsFromUser(activeContext, permissions || [])
        .then((data) => {
          let grantStatus: Array<number> = data.authResults;
          for (let i = 0; i < grantStatus.length; i++) {
            if (grantStatus[i] !== 0) {
              LogUtil.error(TAG, 'Request permissions is failed, err:' + JSON.stringify(data));
              callback(grantStatus[i]);
              return;
            }
          }
          callback(REQUEST_PERMISSION_SUCCESS);
        }).catch((err: BusinessError) => {
        LogUtil.error(TAG, 'Request permissions is failed, type:' + permissionType + 
        ', err:BusinessError: ' + JSON.stringify(err));
        callback(REQUEST_PERMISSION_FAIL);
      });
    } catch (err) {
      LogUtil.error(TAG, 'Request permissions is failed, type:' + permissionType + 
        ', err:' + JSON.stringify(err));
      callback(REQUEST_PERMISSION_FAIL);
    }
  }

  @LogMethod
  async checkPermissions(permissionType: string, callback: (granted: boolean) => void): Promise<void> {
    const permissions = this.needPermissions.get(permissionType) as Array<Permissions>;
    if (!permissions) {
      LogUtil.error(TAG, 'unsupported permission:' + permissionType);
      callback(false);
      return;
    }
    let grantStatus: abilityAccessCtrl.GrantStatus =
      abilityAccessCtrl.GrantStatus.PERMISSION_DENIED;
    let bundleInfo: bundleManager.BundleInfo =
      await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION);
    let appInfo: bundleManager.ApplicationInfo = bundleInfo.appInfo;
    this.tokenId = appInfo.accessTokenId;
    for (let i = 0; i < permissions.length; i++) {
      try {
        grantStatus = this.atManager.checkAccessTokenSync(this.tokenId, permissions[i]);
        if (grantStatus !== abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
          LogUtil.error(TAG, 'checkPermission error');
          callback(false);
          return;
        }
      } catch (err) {
        LogUtil.error(TAG, `checkAccessToken failed: ${JSON.stringify(err)}`);
        callback(false);
      }
    }
    callback(true);
  }

  @LogMethod
  public async initPermissions(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.activateFileAccessPersist(this.getUris(), (code) => {
      if (code === ACTIVATE_SUCCESS) {
        this.isInitialized = true;
      } else {
        LogUtil.error(TAG, 'No URI required for activation or activation failed');
      }
    });
  }

  @LogMethod
  public saveUris(uris: string[]) {
    try {
      dataPreferences = preferences.getPreferencesSync(this.ctxAdapter.getContext(), options);
    } catch (err) {
      LogUtil.error(TAG, `Failed to get preference. Code:${err.code}, message:${err.message}`);
    }
    if (dataPreferences) {
      try {
        dataPreferences.putSync('defaultDownloadUri', JSON.stringify(uris));
        dataPreferences.flush((err: BusinessError) => {
          if (err) {
            LogUtil.error(TAG, `Failed to flush. Code:${err.code}, message:${err.message}`);
            return;
          }
          LogUtil.info(TAG, 'Succeeded in flushing.');
        });
      } catch (err) {
        LogUtil.error(TAG, `Failed to save uris. Code:${err.code}, message:${err.message}`);
      }
    }
  }

  @LogMethod
  private getUris(): string[] {
    try {
      dataPreferences = preferences.getPreferencesSync(this.ctxAdapter.getContext(), options);
    } catch (err) {
      LogUtil.error(TAG, `Failed to get preference. Code:${err.code}, message:${err.message}`);
    }
    if (dataPreferences) {
      try {
        let uris: string = dataPreferences.getSync('defaultDownloadUri', '[]') as string;
        return JSON.parse(uris);
      } catch (err) {
        LogUtil.error(TAG, `Failed to get uris. Code:${err.code}, message:${err.message}`);
      }
    }
    return [];
  }

  @LogMethod
  public activateFileAccessPersist(uris: string[], callback: (code: number) => void) {
    if (uris.length === 0) {
      LogUtil.error(TAG,'No URI required to activate');
      callback(EMPTY_ARRAY);
      return;
    }
    let policies = new Array<fileShare.PolicyInfo>();
    uris.forEach((uri) => {
      let policyReadWrite: fileShare.PolicyInfo = {
        uri: uri,
        operationMode: fileShare.OperationMode.READ_MODE |
        fileShare.OperationMode.WRITE_MODE,
      };
      policies.push(policyReadWrite);
    });
    fileShare.activatePermission(policies).then(() => {
      callback(ACTIVATE_SUCCESS);
    }).catch((err: BusinessError<Array<fileShare.PolicyErrorResult>>) => {
      callback(err.code);
      LogUtil.error(TAG, `activeFileAccessPersist failed: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  public fileAccessPersist(uris: string[]) {
    if (uris.length === 0) {
      LogUtil.error(TAG, 'No URI needs to be persisted');
      return;
    }
    let policies = new Array<fileShare.PolicyInfo>();
    uris.forEach((uri) => {
      let policyReadWrite: fileShare.PolicyInfo = {
        uri: uri,
        operationMode: fileShare.OperationMode.READ_MODE |
        fileShare.OperationMode.WRITE_MODE,
      };
      policies.push(policyReadWrite);
    });
    fileShare.persistPermission(policies)
      .catch((err: BusinessError<Array<fileShare.PolicyErrorResult>>) => {
        LogUtil.error(TAG, `fileAccessPersist failed: ${JSON.stringify(err)}`);
      });
  }

  @LogMethod
  openPermissionConfirm(type:string, callback: Function) {
    LogUtil.info(TAG, `permision type is: ${JSON.stringify(type)}`);
    let activeContext = this.ctxAdapter.getActiveContext();
    if (!activeContext) {
      LogUtil.error(TAG, 'openPermissionConfirm, Failed to get active context');
      return;
    }
    let confirmParams: ConfirmParams = {
      title: '',
      content: '',
      label: '',
      confirm: '',
      cancel: ''
    };
    switch(type) {
      case "pasteboard":
        this.openPasteboardPermissionConfirm(activeContext, confirmParams);
        break;
      case "screenshot":
        this.openScreenshotPermissionConfirm(activeContext, confirmParams);
        break;
      default:
        break;
    }
    if (!confirmParams.title||!confirmParams.content) {
      LogUtil.error(TAG, 'openPermissionConfirm, Failed to get title & content');
      return;
    }
    this.openPermissionConfirmDialog(activeContext, confirmParams, callback);
  }

  private openPasteboardPermissionConfirm(activeContext: Context, pasteboardConfirmParams: ConfirmParams) {
    pasteboardConfirmParams.title = activeContext.resourceManager.getStringSync($r("app.string.pasteBoard_dialog_title").id);
    pasteboardConfirmParams.content = activeContext.resourceManager.getStringSync($r("app.string.pasteBoard_dialog_content").id);
    pasteboardConfirmParams.label = activeContext.resourceManager.getStringSync(this.appLabelId);
    pasteboardConfirmParams.content = pasteboardConfirmParams.content.replace("label", pasteboardConfirmParams.label);
    pasteboardConfirmParams.confirm = activeContext.resourceManager.getStringSync($r("app.string.dialog_confirm_button").id);
    pasteboardConfirmParams.cancel = activeContext.resourceManager.getStringSync($r("app.string.dialog_cancel_button").id);
  }

  private openScreenshotPermissionConfirm(activeContext: Context, pasteboardConfirmParams: ConfirmParams) {
    pasteboardConfirmParams.title = activeContext.resourceManager.getStringSync($r("app.string.screenshot_dialog_title").id);
    pasteboardConfirmParams.content = activeContext.resourceManager.getStringSync($r("app.string.screenshot_dialog_content").id);
    pasteboardConfirmParams.label = activeContext.resourceManager.getStringSync(this.appLabelId);
    pasteboardConfirmParams.content = pasteboardConfirmParams.content.replace("label", pasteboardConfirmParams.label);
    pasteboardConfirmParams.confirm = activeContext.resourceManager.getStringSync($r("app.string.dialog_confirm_button").id);
    pasteboardConfirmParams.cancel = activeContext.resourceManager.getStringSync($r("app.string.dialog_cancel_button").id);
  }

  private async openPermissionConfirmDialog(activeContext: Context, confirmParams: ConfirmParams, callback: Function) {
    promptAction.showDialog({
      title: confirmParams.title,
      message: confirmParams.content,
      buttons: [
        {
          text: confirmParams.confirm,
          color: '#000000'
        },
        {
          text: confirmParams.cancel,
          color: '#000000'
        }
      ],
    }).then(data => {
      if (data.index === CONFIRM) {
        let wantInfo: Want = {
          bundleName: 'com.huawei.hmos.settings',
          abilityName: 'com.huawei.hmos.settings.MainAbility',
          uri: 'application_info_entry',
          parameters: {
            pushParams: this.bundleName
          }
        }
        LaunchHelper.Launch(activeContext, wantInfo);
      }
      callback(data.index);
    }).catch((err: Error) => {
      callback(ERROR);
      LogUtil.error(TAG, `showDialog failed, caused by:${JSON.stringify(err)}`);
    });
  }
}
