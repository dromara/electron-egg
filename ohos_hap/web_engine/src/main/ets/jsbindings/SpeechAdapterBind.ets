// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import JsBindingUtils from '../utils/JsBindingUtils';
import Inject from '../common/InjectModule';
import lazy { SpeechAdapter } from '../adapter/SpeechAdapter';
import type { EngineCreationParams, SpeakingParams } from '../interface/CommonInterface';

function implSpeechAdapter(): SpeechAdapter {
  return Inject.getOrCreate(SpeechAdapter);
}

function createTextToSpeechEngineAndSetListener(
  callback: Function,
  startEventCallback: Function,
  endEventCallback: Function,
  params: EngineCreationParams): void {
  return implSpeechAdapter().createTextToSpeechEngineAndSetListener(callback,
    startEventCallback,
    endEventCallback,
    params);
}

function textToSpeechEngineListVoices(callback: Function): void {
  implSpeechAdapter().textToSpeechEngineListVoices(callback);
}

function isTextToSpeechEngineCreated(): boolean {
  return implSpeechAdapter().isTextToSpeechEngineCreated();
}

function speak(text: string, params: SpeakingParams): boolean {
  return implSpeechAdapter().speak(text, params);
}

function isSpeaking(): boolean {
  return implSpeechAdapter().isSpeaking();
}

function stopSpeaking(): boolean {
  return implSpeechAdapter().stopSpeaking();
}

function isInitialized(): boolean {
  return implSpeechAdapter().isInitialized();
}

function textToSpeechEngineShutdown(): boolean {
  return implSpeechAdapter().textToSpeechEngineShutdown();
}

export class SpeechAdapterBind {
  static bind() {
    JsBindingUtils.bindFunction('SpeechAdapter.createTextToSpeechEngineAndSetListener', createTextToSpeechEngineAndSetListener);
    JsBindingUtils.bindFunction('SpeechAdapter.isTextToSpeechEngineCreated', isTextToSpeechEngineCreated);
    JsBindingUtils.bindFunction('SpeechAdapter.speak', speak);
    JsBindingUtils.bindFunction('SpeechAdapter.isSpeaking', isSpeaking);
    JsBindingUtils.bindFunction('SpeechAdapter.stopSpeaking', stopSpeaking);
    JsBindingUtils.bindFunction('SpeechAdapter.isInitialized', isInitialized);
    JsBindingUtils.bindFunction('SpeechAdapter.textToSpeechEngineListVoices', textToSpeechEngineListVoices);
    JsBindingUtils.bindFunction('SpeechAdapter.textToSpeechEngineShutdown', textToSpeechEngineShutdown);
  }
}