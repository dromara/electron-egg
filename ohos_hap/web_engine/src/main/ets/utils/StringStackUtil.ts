// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export class StringStack {
  private stack: string[] = [];

  public push(element: string): void {
    this.stack.push(element);
  }

  public remove(element: string): void {
    const index = this.stack.indexOf(element);
    if (index > -1) {
      this.stack.splice(index, 1);
    }
  }

  public peek(): string {
    return this.stack[this.stack.length - 1];
  }

  public isEmpty(): boolean {
    return this.stack.length === 0;
  }
}
