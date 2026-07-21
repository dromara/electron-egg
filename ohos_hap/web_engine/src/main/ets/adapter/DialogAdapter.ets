// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import fs from '@ohos.file.fs';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';
import picker from '@ohos.file.picker';
import { promptAction } from '@kit.ArkUI';

import { AbilityManager } from '../common/AbilityManager';
import { BaseAdapter } from '../common/BaseAdapter';
import { BusinessError } from '@ohos.base';
import { image } from '@kit.ImageKit';
import { inject, injectable } from 'inversify';
import { ContextAdapter } from './ContextAdapter';

const TAG: string = 'Dialog';
const DEFAULT_BUTTON_LABEL: string = 'OK';
const PRIMARY_BUTTON_COLOR: string = '#FF0A59F7';
const NORMAL_BUTTON_COLOR: string = '#000000';

interface IMessageBoxSettings {
  parent_id: number,
  type: string,
  title: string,
  message: string,
  detail: string,
  checkbox_label: string,
  checkbox_checked: boolean,
  cancel_id: number,
  default_id: number,
  buttons: string[]
}

interface IFilter {
  name: string,
  extensions: string[]
}

interface IOpenDialogSettings {
  parent_id: number,
  title: string,
  message: string,
  button_label: string,
  default_path: string,
  filters: IFilter[],
  properties_open_directory: boolean,
  properties_open_mixed: boolean,
  properties_multi_selections: boolean
}

export interface IMessageBoxParams {
  messageBoxSettings: IMessageBoxSettings | undefined,
  icon: image.PixelMap | undefined,
  callback: (buttonId: number, checkboxChecked: boolean) => void
}

export interface MessageBoxData {
  id: string,
  dialogController: CustomDialogController,
  setMessageBoxParams: (messageBoxParams: IMessageBoxParams) => void;
}

@injectable()
export class DialogAdapter extends BaseAdapter {
  private abilityManager: AbilityManager = new AbilityManager();
  private static PATH_PREFIX: string = 'file://docs'; 
  private static DEFAULT_DIR: string = 'file://docs/storage/Users/currentUser';
  private static MAX_SELECT_NUMBER: number = 500;
  private ctxAdapter: ContextAdapter;
  private allFIleDescriptionId: number = $r("app.string.upload_all_file_description").id;

  constructor(@inject(ContextAdapter) ctxAdapter: ContextAdapter) {
    super();
    this.ctxAdapter = ctxAdapter;
  }

  @LogMethod
  showMessageBox(settings: string, buffer: ArrayBuffer, width: number, height: number,  callback: (button_id: number, checkbox_checked: boolean) => void) {
    LogUtil.info(TAG, 'messagebox settings ' + settings);
    let icon: image.PixelMap | undefined = this.convertImagePixelMap(width, height, buffer);
    let boxSettings: IMessageBoxSettings = JSON.parse(settings);
    let params: IMessageBoxParams = {
      messageBoxSettings: boxSettings,
      icon: icon,
      callback: callback
    };
    LogUtil.error(TAG, 'parentId ' + boxSettings.parent_id);
    if (boxSettings.parent_id === -1) {
      this.showParentlessMessageBox(boxSettings, callback);
      return;
    }

    let parentId = boxSettings.parent_id;
    let messageBoxManager: MessageBoxData | undefined = this.abilityManager.getMessageBox(parentId);
    if (!messageBoxManager) {
      LogUtil.error(TAG, 'showMessageBox failed, parent message box manager not found: ' + parentId);
      callback(boxSettings.cancel_id, boxSettings.checkbox_checked);
      return;
    }
    messageBoxManager.setMessageBoxParams(params);
    messageBoxManager.dialogController.open();
  }

  private showParentlessMessageBox(boxSettings: IMessageBoxSettings,
    callback: (button_id: number, checkbox_checked: boolean) => void) {
    let isCallbackCalled = false;
    const safeCallback = (buttonId: number) => {
      if (isCallbackCalled) {
        return;
      }
      isCallbackCalled = true;
      callback(buttonId, boxSettings.checkbox_checked);
    };

    promptAction.showDialog({
      title: boxSettings.title,
      message: this.getParentlessPromptMessage(boxSettings),
      buttons: this.getParentlessPromptButtons(boxSettings)
    }).then(data => {
      if (typeof data.index === 'number' && data.index >= 0) {
        safeCallback(data.index);
      } else {
        safeCallback(boxSettings.cancel_id);
      }
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'show parentless message box failed with err: ' + JSON.stringify(err));
      safeCallback(boxSettings.cancel_id);
    });
  }

  private getParentlessPromptButtons(boxSettings: IMessageBoxSettings): promptAction.Button[] {
    const buttonLabels = boxSettings.buttons.length > 0 ? boxSettings.buttons : [DEFAULT_BUTTON_LABEL];
    const primaryIndex = boxSettings.default_id >= 0 && boxSettings.default_id < buttonLabels.length ?
      boxSettings.default_id : 0;
    return buttonLabels.map((button: string, index: number): promptAction.Button => {
      return {
        text: button,
        color: index === primaryIndex ? PRIMARY_BUTTON_COLOR : NORMAL_BUTTON_COLOR,
        primary: index === primaryIndex
      };
    });
  }

  private getParentlessPromptMessage(boxSettings: IMessageBoxSettings): string {
    let messages: string[] = [];
    if (boxSettings.message.length > 0) {
      messages.push(boxSettings.message);
    }
    if (boxSettings.detail.length > 0) {
      messages.push(boxSettings.detail);
    }
    if (boxSettings.checkbox_label.length > 0) {
      LogUtil.warn(TAG, 'parentless message box uses promptAction.showDialog, checkbox UI is not supported.');
    }
    return messages.join('\n\n');
  }

  @LogMethod
  showErrorBox(title: string, content: string, callback: (result: boolean) => void) {
    let isClicked = false;
    AlertDialog.show({
      title: title,
      message: content,
      autoCancel: false,
      cancel: () => {},
      primaryButton: {
        value: $r('app.string.button_ok'),
        style: DialogButtonStyle.HIGHLIGHT,
        action: () => {
          if (isClicked) {
            return;
          }
          isClicked = true;
          callback(true);
        },
      }
    });
  }

  @LogMethod
  showOpenDialog(settings: string, callback: (filePaths: string[], canceled: boolean) => void) {
    LogUtil.info(TAG, 'ShowOpenDialog ' + settings);
    let DocumentSelectOptions = new picker.DocumentSelectOptions();
    let dialogSettings: IOpenDialogSettings = JSON.parse(settings);
    if (dialogSettings.properties_open_directory) {
      DocumentSelectOptions.selectMode = picker.DocumentSelectMode.FOLDER;
      if (dialogSettings.properties_open_mixed)
        DocumentSelectOptions.selectMode = picker.DocumentSelectMode.MIXED;
    }
    if (dialogSettings.properties_multi_selections) {
      DocumentSelectOptions.maxSelectNumber = DialogAdapter.MAX_SELECT_NUMBER;
    }
    const context = this.ctxAdapter.getContext();
    let allFileDescription = context.resourceManager.getStringSync(this.allFIleDescriptionId);
    if (dialogSettings.filters.length > 0) {
      DocumentSelectOptions.fileSuffixFilters = this.getFilterArray(dialogSettings.filters);
    } else {
      DocumentSelectOptions.fileSuffixFilters = [allFileDescription + "|.*"];
    }
    let dirAndFile: string[] = this.handleDefaultPath(dialogSettings.default_path);
    LogUtil.info(TAG, 'showOpenDialog dirAndFile: ' + `${dirAndFile[0]}-${dirAndFile[1]}`);
    DocumentSelectOptions.defaultFilePathUri = dirAndFile[0];
    let documentPicker = new picker.DocumentViewPicker();
    documentPicker.select(DocumentSelectOptions).then((DocumentSelectResult: Array<string>) => {
      LogUtil.info(TAG, 'DocumentViewPicker.select successfully, DocumentSelectResult uri: ' + JSON.stringify(DocumentSelectResult));
      if (DocumentSelectResult.length === 0) {
        callback([], true);
      } else {
        callback(DocumentSelectResult, false);
      }
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'DocumentViewPicker.select failed with err: ' + JSON.stringify(err));
      callback([], true);
    });
  }

  @LogMethod
  showSaveDialog(settings: string, callback: (filePath: string, canceled: boolean) => void) {
    LogUtil.info(TAG, 'ShowSaveDialog ' + settings);
    let dialogSettings: IOpenDialogSettings = JSON.parse(settings);
    let DocumentSaveOptions = new picker.DocumentSaveOptions();
    let dirAndFile: string[] = this.handleDefaultPath(dialogSettings.default_path);
    LogUtil.info(TAG, 'ShowSaveDialog dirAndFile: ' + `${dirAndFile[0]}-${dirAndFile[1]}`);
    DocumentSaveOptions.defaultFilePathUri = dirAndFile[0];
    DocumentSaveOptions.newFileNames = [`${dirAndFile[1]}`];
    const context = this.ctxAdapter.getContext();
    let allFileDescription = context.resourceManager.getStringSync(this.allFIleDescriptionId);
    if (dialogSettings.filters.length > 0) {
      DocumentSaveOptions.fileSuffixChoices = this.getFilterArray(dialogSettings.filters);
    } else {
      DocumentSaveOptions.fileSuffixChoices = [allFileDescription + "|.*"];
    }
    let documentPicker = new picker.DocumentViewPicker();
    documentPicker.save(DocumentSaveOptions).then((DocumentSaveResult: Array<string>) => {
      LogUtil.info(TAG, 'DocumentViewPicker.save successfully, DocumentSaveResult uri: ' + JSON.stringify(DocumentSaveResult));
      if (DocumentSaveResult.length === 0) {
        callback('', true);
      } else {
        callback(DocumentSaveResult[0], false);
      }
    }).catch((err: BusinessError) => {
      LogUtil.error(TAG, 'DocumentViewPicker.save failed with err: ' + JSON.stringify(err));
      callback('', true);
    });
  }

  private handleDefaultPath(default_path: string) {
    let dirAndFile: string[] = [DialogAdapter.DEFAULT_DIR, ''];
    try {
      let path: string = default_path.trim();
      const prefix =  'file://docs/'
      const isFileUri = path.startsWith(prefix);
      const protocolPrefix = isFileUri ? prefix : '';
      let pathWithoutProtocol = isFileUri ? path.substring(prefix.length) : path;
      let displayPathWithoutProtocol = decodeURIComponent(pathWithoutProtocol)
      let exist = fs.accessSync(displayPathWithoutProtocol);
      if(exist) {
        const lastSlashIdx = displayPathWithoutProtocol.lastIndexOf('/');
        const dirPart = displayPathWithoutProtocol.substring(0, lastSlashIdx);
        const targetPartUri = pathWithoutProtocol.substring(lastSlashIdx + 1);
        let stat = fs.statSync(displayPathWithoutProtocol);
        if (stat.isDirectory()) {
          dirAndFile[0] = protocolPrefix + dirPart + '/' + targetPartUri;
          dirAndFile[1] = '';
        } else if (stat.isFile()) {
          dirAndFile[0] = protocolPrefix + dirPart
          dirAndFile[1] = targetPartUri
        }
      } else {
        LogUtil.error(TAG, 'accessSync file failed, path: ' + displayPathWithoutProtocol + 'not exist');
      }
    } catch (err) {
      LogUtil.error(TAG, 'handleDefaultPath failed with err: ' + JSON.stringify(err));
    }
    return dirAndFile;
  }

  private getFilterArray(filters: IFilter[]): Array<string> {
    let copy = new Array<string>();
    for (const filter of filters) {
      copy.push(filter.name + "(*." + filter.extensions.join(";*.") + ")|." + filter.extensions.join(",."));
    }
    return copy;
  }

  private convertImagePixelMap(width: number, height: number, buff: ArrayBuffer): image.PixelMap | undefined {
    let pixmap: image.PixelMap;
    if (width === 0 || height === 0) {
      LogUtil.warn(TAG, 'image is empty, no conversion required');
      return undefined;
    }
    let opts: image.InitializationOptions = {
      size: {
        height: height,
        width: width
      }
    }
    try {
      pixmap = image.createPixelMapSync(buff, opts);
      return pixmap;
    } catch (error) {
      LogUtil.error(TAG, 'failed convert image pixel map because: ' +  JSON.stringify(error));
      return undefined;
    }
  }
}
