// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import fileUri from '@ohos.file.fileuri';
import fs from '@ohos.file.fs';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import picker from '@ohos.file.picker';

import { BaseAdapter } from '../common/BaseAdapter';
import { inject, injectable } from 'inversify';
import { uniformTypeDescriptor } from '@kit.ArkData';
import { ContextAdapter } from './ContextAdapter';
import { PermissionManagerAdapter } from './PermissionManagerAdapter';
import { SaveAsDialogParams, SelectFileDialogParams } from '../interface/CommonInterface';
import { ComponentContent, promptAction } from '@kit.ArkUI';
import LaunchHelper from '../utils/LaunchHelper';
import { Want } from '@kit.AbilityKit';
import { MenuItem,InstallationParams, WrappedInstallationBuilder} from '../utils/InstallationPackageDialog';
import { BusinessError } from '@kit.BasicServicesKit';

const TAG: string = "FilePicker";

@injectable()
export class FilePickerAdapter extends BaseAdapter {
  private static PREFIX: string = "file://docs";
  private static MAX_SELECT_NUMBER: number = 500;
  private ctxAdapter: ContextAdapter;
  private permissionManagerAdapter: PermissionManagerAdapter;
  private defaultDescriptionId: number = $r("app.string.upload_default_type_description").id;
  private allFIleDescriptionId: number = $r("app.string.upload_all_file_description").id;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter,
    @inject(PermissionManagerAdapter) permissionManagerAdapter: PermissionManagerAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
    this.permissionManagerAdapter = permissionManagerAdapter;
  }

  @LogMethod
  showDocumentViewPicker(params: SelectFileDialogParams, callback: (path: string) => void) {
    let DocumentSelectOptions = new picker.DocumentSelectOptions();
    if (params.multi_files) {
      DocumentSelectOptions.maxSelectNumber = FilePickerAdapter.MAX_SELECT_NUMBER;
    } else {
      DocumentSelectOptions.maxSelectNumber = 1;
    }
    const context = this.ctxAdapter.getContext();
    let allFileDescription = context.resourceManager.getStringSync(this.allFIleDescriptionId);
    if (params.extensions.length > 0) {
      DocumentSelectOptions.fileSuffixFilters = this.getFilterArray(params.extensions, params.descriptions);
      if (params.include_all_files) {
        DocumentSelectOptions.fileSuffixFilters.push(allFileDescription + "|.*");
      }
    } else {
      DocumentSelectOptions.fileSuffixFilters = [allFileDescription + "|.*"];
    }
    let documentPicker = new picker.DocumentViewPicker();
    documentPicker.select(DocumentSelectOptions).then((selectResult) => {
      selectResult = this.dirFilter(selectResult);
      callback(JSON.stringify(selectResult));
    }).catch((err: Error) => {
      callback('');
      LogUtil.error(TAG, `select failed with err: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  showDirDocumentViewPicker(file_access_persist: boolean,
    callback: (path: string) => void) {
    let DocumentSelectOptions = new picker.DocumentSelectOptions();
    DocumentSelectOptions.selectMode = picker.DocumentSelectMode.FOLDER;
    let documentPicker = new picker.DocumentViewPicker();
    documentPicker.select(DocumentSelectOptions)
      .then((selectResult) => {
        try {
          if (file_access_persist && selectResult.length !== 0) {
            this.permissionManagerAdapter.fileAccessPersist(selectResult);
          }
          selectResult = this.dirFilter(selectResult);
          callback(JSON.stringify(selectResult));
        } catch (err) {
          callback('');
          LogUtil.error(TAG, `select Foloder failed with err: ${JSON.stringify(err)}`);
        }
      }).catch((err: Error) => {
      callback('');
      LogUtil.error(TAG, `select failed with err: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  showSaveAsDocumentViewPicker(params: SaveAsDialogParams, callback: (path: string) => void) {
    let DocumentSaveOptions = new picker.DocumentSaveOptions();
    DocumentSaveOptions.newFileNames = [`${params.file_name}`];
    DocumentSaveOptions.defaultFilePathUri = FilePickerAdapter.PREFIX + params.dir_name;
    const context = this.ctxAdapter.getContext();
    let allFileDescription = context.resourceManager.getStringSync(this.allFIleDescriptionId);
    if (params.extensions.length > 0) {
      let filterDescriptions: Array<string> = this.getFilterArray(params.extensions, params.descriptions);
      DocumentSaveOptions.fileSuffixChoices = [filterDescriptions[0]];
      if (params.include_all_files) {
        DocumentSaveOptions.fileSuffixChoices.push(allFileDescription + "|.*");
      }
    } else {
      DocumentSaveOptions.fileSuffixChoices = [allFileDescription + "|.*"];
    }
    let documentPicker = new picker.DocumentViewPicker();
    documentPicker.save(DocumentSaveOptions).then((saveResult) => {
      saveResult = this.dirFilter(saveResult);
      callback(JSON.stringify(saveResult));
    }).catch((err: Error) => {
      callback('');
      LogUtil.error(TAG, `save failed with err: ${JSON.stringify(err)}`);
    });
  }

  @LogMethod
  showInstallationPackageDialog(fileName: string, fileSize: string, callback: (continue_download: boolean) => void) {
    let uiContext = this.ctxAdapter.getActiveProxy().getWindow()?.getUIContext();
    if (!uiContext) {
      LogUtil.error(TAG, "Failed to get uiContext!");
      callback(true);
      return;
    }

    const contentNode = new ComponentContent(
      uiContext,
      WrappedInstallationBuilder,
      new InstallationParams(
        fileName,
        fileSize,
        (index: MenuItem) => {
          switch (index) {
            case MenuItem.kOpenAppGallery:
              const want: Want = {
                bundleName: 'com.huawei.hmsapp.appgallery',
                abilityName: 'MainAbility',
                moduleName: 'entry'
              }
              LaunchHelper.Launch(this.ctxAdapter.getActiveContext(), want);
              callback(false)
              break;
            case MenuItem.kContinueDownload:
              callback(true);
              break;
            case MenuItem.kCancel:
            default:
              callback(false);
              break;
          }
          (uiContext as UIContext).getPromptAction().closeCustomDialog(contentNode)
        }
      )
    )

    uiContext.getPromptAction().openCustomDialog(contentNode, {
      alignment: DialogAlignment.Center,
      autoCancel: true
    } as promptAction.BaseDialogOptions).catch((error: BusinessError) => {
      LogUtil.error(TAG,`OpenCustomDialog args error code is ${error.code}, message is ${error.message}`);
    })
  }

  private dirFilter(docs: string[]): string[] {
    let copy: string[] = [];
    docs.forEach((path) => {
      // Convert to uri get systeam path
      let uri = new fileUri.FileUri(path);
      copy.push(uri.path);
    });
    return copy;
  }

  private getFilterArray(filters: Array<Array<string>>, descriptions: Array<string>): Array<string> {
    const context = this.ctxAdapter.getContext();
    let defaultDescription = context.resourceManager.getStringSync(this.defaultDescriptionId);
    let copy = new Array<string>();
    for (let i = 0; i < filters.length; i++) {
      let description: string = defaultDescription;
      if (descriptions[i]) {
        description = descriptions[i];
      } else if (filters[i].length == 1) {
        const typeId = uniformTypeDescriptor.getUniformDataTypeByFilenameExtension("." + filters[i][0]);
        let typeObj: uniformTypeDescriptor.TypeDescriptor = uniformTypeDescriptor.getTypeDescriptor(typeId);
        if (typeObj) {
          description = typeObj.description;
        }
      }
      copy.push(description + "(*." + filters[i].join(";*.") + ")|." + filters[i].join(",."));
    }
    return copy;
  }
}