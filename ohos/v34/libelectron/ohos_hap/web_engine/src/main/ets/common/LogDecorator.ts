// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import LogUtil from '../utils/LogUtil';

const TAG: string = 'LogMethodCall';

/**
 * Method log decorator
 */
const LogMethod = (
  target: Object,
  methodName: string,
  propertyDescriptor: PropertyDescriptor): PropertyDescriptor => {
  const method = propertyDescriptor.value;

  propertyDescriptor.value = function (...args: object[]) {
    const params = args.map(a => JSON.stringify(a)).join();
    LogUtil.info(TAG, `${target.constructor.name}#${methodName}(${params}) in `);

    const result = method.apply(this, args);
    const r = JSON.stringify(result);

    LogUtil.info(TAG, `${target.constructor.name}#${methodName}(${params}) out => ${r}`);
    return result;
  };

  return propertyDescriptor;
};

/**
 * Class decorator to log all methods
 */
export const LogAll = (target: ObjectConstructor) => {
  Reflect.ownKeys(target.prototype).forEach(propertyKey => {
    let propertyDescriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey);
    const method = propertyDescriptor.value;

    if (method) {
      propertyDescriptor.value = function (...args: object[]) {
        const params = args.map(a => JSON.stringify(a)).join();
        LogUtil.info(TAG, `${target.name}#${propertyKey.toString()}(${params}) in `);

        const result = method.apply(this, args);
        const r = JSON.stringify(result);

        LogUtil.info(TAG, `${target.name}#${propertyKey.toString()}(${params}) out => ${r}`);
        return result;
      };

      Object.defineProperty(target.prototype, propertyKey, propertyDescriptor);
    }
  });
};

export default LogMethod;
