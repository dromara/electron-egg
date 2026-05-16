/*
 * Copyright (c) 2023-2025 Huawei Device Co., Ltd.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
import { injectable } from "inversify";
import { NodeContent } from "@kit.ArkUI";
 
const TAG: string = 'NodeHandleManager';
 
@injectable()
export class NodeHandleManager {
  private nodeContentStorage: Map<string, NodeContent> = new Map<string, NodeContent>();
  private static instance: NodeHandleManager | undefined = undefined;
 
  public static getInstance(): NodeHandleManager {
    if (!NodeHandleManager.instance) {
      NodeHandleManager.instance = new NodeHandleManager();
    }
    return NodeHandleManager.instance;
  }
 
  public addNodeContent(id: string, nodeContent: NodeContent) {
    if(this.nodeContentStorage.get(id)) {
      return;
    }
 
    this.nodeContentStorage.set(id, nodeContent);
  }
 
  public removeNodeContent(id: string) {
    this.nodeContentStorage.delete(id);
  }
 
  public getNodeContent(id: string): NodeContent | undefined {
    let nodeContent = this.nodeContentStorage.get(id);
    if (nodeContent) {
      return nodeContent;
    }
    return undefined;
  }
}