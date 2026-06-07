// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { injectable } from 'inversify';
import { textToSpeech } from '@kit.CoreSpeechKit';
import { BusinessError } from '@kit.BasicServicesKit';
import audio from '@ohos.multimedia.audio';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

import { SpeakingParams, EngineCreationParams, VoiceQuery, VoiceInfo } from '../interface/CommonInterface';

// When the engine creation method is invoked, if no parameter is transferred,
// the default configuration is used to initialize the engine.
// refer https://developer.huawei.com/consumer/cn/doc/harmonyos-references/hms-ai-texttospeech#section235272615215
const defaultCreateEngineParams: EngineCreationParams = {
  language: 'zh-CN',
  person: 13,
  online: 1,
  extraParams: {
    "style": 'interaction-broadcast',
    "locate": 'CN',
    "name": 'defaultEngine'
  }
}

// refer https://developer.huawei.com/consumer/cn/doc/harmonyos-references/hms-ai-texttospeech#section1638144844811
const defaultVoiceQueryParams: VoiceQuery = {
  requestId: 'VOICEQUERY',
  online: 1
}

interface listVoiceMsg {
  voiceList: Array<VoiceInfo>,
  length: number;
}

const TAG = "SpeechAdapter";

// adjust system volume
function adjustSpeechVolumeOfSpeakParams(speakParams: SpeakingParams): SpeakingParams {
  // The nested object transferred by C++ cannot be directly modified. Therefore,
  // the default parameter of the same type is defined and the value is overwritten
  // based on the object transferred by C++.
  let clonedSpeakParams: SpeakingParams = {
    requestId: '',
    extraParams: {},
  };
  clonedSpeakParams.requestId = speakParams.requestId;
  if (clonedSpeakParams.extraParams && speakParams.extraParams) {
    clonedSpeakParams.extraParams.speed = speakParams.extraParams.speed ?? 1;
    clonedSpeakParams.extraParams.volume = speakParams.extraParams.volume ?? 1;
    clonedSpeakParams.extraParams.pitch = speakParams.extraParams.pitch ?? 1;
    clonedSpeakParams.extraParams.languageContext = speakParams.extraParams.languageContext ?? 'zh-CN';
    clonedSpeakParams.extraParams.audioType = speakParams.extraParams.audioType ?? 'pcm';
    clonedSpeakParams.extraParams.playType = speakParams.extraParams.playType ?? 1;
    clonedSpeakParams.extraParams.soundChannel = speakParams.extraParams.soundChannel ?? 3;
    clonedSpeakParams.extraParams.queueMode = speakParams.extraParams.queueMode ?? 0;
  }
  let audioVolumeManager = audio.getAudioManager().getVolumeManager();
  let systemVolume: number | undefined;
  try {
    let audioVolumeGroupManager: audio.AudioVolumeGroupManager =
      audioVolumeManager.getVolumeGroupManagerSync(audio.DEFAULT_VOLUME_GROUP_ID);
    systemVolume = audioVolumeGroupManager.getVolumeSync(audio.AudioVolumeType.MEDIA);
  } catch (err) {
    let error = err as BusinessError;
    LogUtil.error(TAG, `tts Failed to get audioVolumeGroupManager, error: ${error}`);
  }
  if (typeof systemVolume === "number" && clonedSpeakParams.extraParams) {
    // Converts the system volume to a percentage, which is used to scale the speak input volume parameter.
    // The range for the system volume is 0 - 20
    const adjustedVolume = (systemVolume / 20) * ((speakParams.extraParams)!.volume as number);
    clonedSpeakParams.extraParams.volume = adjustedVolume;
  }
  return clonedSpeakParams;
}

@injectable()
export class SpeechAdapter extends BaseAdapter {
  private ttsEngine: textToSpeech.TextToSpeechEngine | undefined = undefined;
  private isCreated: boolean = false;
  private ONSPEAKCOMPLETE: number = 1;
  private voiceList: Array<VoiceInfo> = [];

  @LogMethod
  createTextToSpeechEngineAndSetListener(
    callback: Function,
    startEventCallback: Function,
    endEventCallback: Function,
    params: EngineCreationParams = defaultCreateEngineParams): void {
    try {
      textToSpeech.createEngine(params as textToSpeech.CreateEngineParams)
        .then((res: textToSpeech.TextToSpeechEngine) => {
          this.ttsEngine = res;
          this.isCreated = true;
          this.setSpeakListener(startEventCallback, endEventCallback);
          callback(true);
        })
        .catch((err: BusinessError) => {
          const errMsg =
            `tts createEngine failed,  error code:${JSON.stringify(err.code)}, message:${JSON.stringify(err.message)}`;
          LogUtil.error(TAG, errMsg);
          callback(false);
        });
    } catch (error) {
      const errorMsg =
        `tts createEngine failed, error code: ${(error as BusinessError).code}, message: ${(error as BusinessError).message}.`;
      LogUtil.error(TAG, errorMsg);
      callback(false);
    }
  }

  @LogMethod
  textToSpeechEngineListVoices(callback: Function): void {
    if (this.isCreated) {
      try {
        defaultVoiceQueryParams.requestId = defaultVoiceQueryParams.requestId + Date.now();
        this.ttsEngine?.listVoices(defaultVoiceQueryParams as textToSpeech.VoiceQuery)
          .then((res: textToSpeech.VoiceInfo[]) => {
            this.voiceList = res as Array<VoiceInfo>;
            const msg: listVoiceMsg = {
              voiceList: res as Array<VoiceInfo>,
              length: res.length
            }
            callback(msg);
          }).catch((err: BusinessError) => {
            LogUtil.error(TAG, `tts textToSpeechEngineListVoices error:${JSON.stringify(err)}`);
            callback({
              voiceList: [],
              length: 0
            });
          });
      } catch (err) {
        const errorMsg =
          `tts Some errors occurred when invoking the ttsEngine.listVoices function: ${JSON.stringify(err)}`;
        LogUtil.error(TAG, errorMsg);
        callback({
          voiceList: [],
          length: 0
        });
      }
    } else {
      LogUtil.error(TAG, 'tts The textToSpeech-Engine has not been created');
      callback({
        voiceList: [],
        length: 0
      });
    }
  }

  @LogMethod
  setSpeakListener(startEventCallback: Function, endEventCallback: Function): void {
    const that = this;
    let speakListener: textToSpeech.SpeakListener = {
      onStart(requestId: string, response: textToSpeech.StartResponse) {
        try {
          if (!startEventCallback) {
            return;
          }
          startEventCallback();
        } catch (err) {
          const errMsg =
            `tts An error occurred when executing the startEventCallback function. Error information: ${JSON.stringify(err)}`;
          LogUtil.error(TAG, errMsg);
        }
      },
      onComplete(requestId: string, response: textToSpeech.CompleteResponse) {
        if (response.type === that.ONSPEAKCOMPLETE) {
          try {
            if (!endEventCallback) {
              return;
            }
            endEventCallback();
          } catch (err) {
            const errMsg =
              `tts An error occurred when executing the endEventCallback function. Error information: ${JSON.stringify(err)}`;
            LogUtil.error(TAG, errMsg);
          }
        }
      },
      onStop(requestId: string, response: textToSpeech.StopResponse) {
        const msg = `tts onStop: requestId: ${requestId}. response:${JSON.stringify(response)}`;
        LogUtil.debug(TAG, msg);
      },
      onData(requestId: string, audio: ArrayBuffer, response: textToSpeech.SynthesisResponse) {
        const msg =
          `tts onData: requestId: ${requestId}. response:${JSON.stringify(response)}. audio length:${JSON.stringify(audio.byteLength)}`;
        LogUtil.debug(TAG, msg);
      },
      onError(requestId: string, errorCode: number, errorMessage: string) {
        const msg =
          `tts OnError: requestId: ${requestId}. errorCode:${JSON.stringify(errorCode)}. errorMessage:${JSON.stringify(errorMessage)}`;
        LogUtil.error(TAG, msg);
      }
    };

    if (this.ttsEngine) {
      try {
        this.ttsEngine.setListener(speakListener);
      } catch (e) {
        LogUtil.error(TAG, 'tts Failed to set engine listener.');
      }
    } else {
      LogUtil.error(TAG, 'tts The engine has not been created');
    }
  }

  @LogMethod
  isTextToSpeechEngineCreated(): boolean {
    return this.isCreated;
  }

  @LogMethod
  speak(text: string, params: SpeakingParams): boolean {
    if (!this.ttsEngine) {
      LogUtil.error(TAG, 'tts The engine is not created. Cannot speak');
      return false;
    }
    try {
      const adjustedParams = adjustSpeechVolumeOfSpeakParams(params);
      this.ttsEngine.speak(text, adjustedParams as textToSpeech.SpeakParams);
      return true;
    } catch (err) {
      const errorMsg = `tts There are some problems when calling the ttsEngine speak method:${JSON.stringify(err)}`;
      LogUtil.error(TAG, errorMsg);
    }
    return false;
  }

  @LogMethod
  isSpeaking(): boolean {
    if (this.ttsEngine) {
      try {
        return this.ttsEngine.isBusy();
      } catch (err) {
        const errorMsg =
          `tts There are some problems when calling the ttsEngine isSpeaking method:${JSON.stringify(err)}`;
        LogUtil.error(TAG, errorMsg);
        return false;
      }
    }
    LogUtil.error(TAG, 'tts The engine is not created. The isSpeaking status cannot be obtained.');
    return false;
  }

  @LogMethod
  stopSpeaking(): boolean {
    if (this.ttsEngine) {
      try {
        this.ttsEngine.stop();
        return true;
      } catch (err) {
        const errMsg = `tts There are some problems when calling the ttsEngine stop method:${JSON.stringify(err)}`
        LogUtil.error(TAG, errMsg);
        return false;
      }
    }
    LogUtil.error(TAG, 'tts The engine is not created. Cannot stop');
    return false;
  }

  @LogMethod
  isInitialized(): boolean {
    return !!this.ttsEngine;
  }

  @LogMethod
  textToSpeechEngineShutdown(): boolean {
    try {
      this.ttsEngine?.shutdown();
      return true;
    } catch (err) {
      const errMsg = `tts There are some problems when calling the ttsEngine shutdown method: ${err}`;
      LogUtil.error(TAG, errMsg);
      return false;
    }
  }
}

