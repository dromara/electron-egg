// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * EtsBridgeAdapter - ArkTS-side bridge adapter.
 *
 * Registered to C++ via AKI framework. Electron main process invokes
 * these methods through systemPreferences.callArkTSFunction().
 *
 * Supported returnType values on C++ side:
 *   void / number / boolean / string / string[] / number[]
 *
 * Supported parameter types (via TypedValue variant):
 *   number (int32/float/double) / boolean / string /
 *   Array<string> / Array<number> /
 *   function / function0
 *     - JS Function with one parameter -> CallbackArgument
 *       (ArkTS side declares `(value: AkiValue) => void`)
 *     - JS Function with zero parameters -> VoidCallbackArgument
 *       (ArkTS side declares `() => void`)
 *     The C++ bridge auto-selects between "function" / "function0" based on
 *     the JS Function's declared arity (Function.length).
 *     For callbacks expecting a value, avoid default/rest parameters because
 *     they can make Function.length equal 0, which selects function0.
 *     Callback arguments are supported only when the total argument count is
 *     3 or fewer.
 *     The callback payload supports: undefined / null / boolean / number /
 *     string. Object/array payloads are not supported and arrive as
 *     undefined on the JS side.
 *
 * This file contains test methods covering all type combinations
 * to verify correct type passing across C++ <-> AKI <-> ArkTS.
 */

import { injectable, inject } from 'inversify';

import { BaseAdapter } from '../common/BaseAdapter';
import LogUtil from '../utils/LogUtil';
import LogMethod from '../common/LogDecorator';

const TAG: string = 'EtsBridgeAdapter';

@injectable()
export class EtsBridgeAdapter extends BaseAdapter {

    // ============================================================
    // Section 1: No parameters + various return types
    //   Verify C++ correctly receives different return value types
    // ============================================================

    /** Return string array - returnType: "string[]" */
    @LogMethod
    testReturnArrayString(): Array<string> {
        return ['ets', 'bridge', 'adapter'];
    }

    /** Return number array - returnType: "number[]" */
    @LogMethod
    testReturnArrayNumber(): Array<number> {
        return [1, 2, 3];
    }

    /** Return string - returnType: "string" */
    @LogMethod
    testReturnString(): string {
        return 'ets bridge adapter';
    }

    /** Return integer - returnType: "number" */
    @LogMethod
    testReturnNumber(): number {
        return 42;
    }

    /** Return boolean - returnType: "boolean" */
    @LogMethod
    testReturnBoolean(): boolean {
        return true;
    }

    /** Return void - returnType: "void" */
    @LogMethod
    testVoidReturn(): void {
        LogUtil.info(TAG, 'testVoidReturn: called successfully');
    }

    // ============================================================
    // Section 2: Single parameter + return value
    //   Verify a single argument keeps its correct type via AKI
    // ============================================================

    /**
     * Receive string, return string.
     * JS call: callArkTSFunction("...", "string", ["Hello"])
     */
    @LogMethod
    testReturnByStringParam(param: string): string {
        return `Received param: ${param}`;
    }

    /**
     * Receive number, return number (doubled).
     * JS call: callArkTSFunction("...", "number", [123])
     */
    @LogMethod
    testReturnByNumberParam(param: number): number {
        return param * 2;
    }

    /**
     * Receive boolean, return boolean (negated).
     * JS call: callArkTSFunction("...", "boolean", [true])
     */
    @LogMethod
    testReturnByBooleanParam(param: boolean): boolean {
        return !param;
    }

    /**
     * Receive string array, return as-is.
     * JS call: callArkTSFunction("...", "string[]", [["a","b","c"]])
     * Note: outer array is paramArray, inner array is the actual argument.
     */
    @LogMethod
    testReturnByStringArrayParam(param: Array<string>): Array<string> {
        return param;
    }

    /**
     * Receive number array, return as-is.
     * JS call: callArkTSFunction("...", "number[]", [[10,20,30]])
     */
    @LogMethod
    testReturnByNumberArrayParam(param: Array<number>): Array<number> {
        return param;
    }

    // ============================================================
    // Section 3: Multiple parameters (mixed types)
    //   Verify DispatchSimpleArg dispatches 2-3 args correctly
    // ============================================================

    /**
     * 2 params: (string, number) -> string
     * Verifies 2-arg dispatch via DispatchSimpleArg.
     */
    @LogMethod
    testTwoParams(param1: string, param2: number): string {
        return `${param1}_${param2}`;
    }

    /**
     * 3 params: (string, number, boolean) -> string
     * Verifies 3-arg dispatch via DispatchSimpleArg.
     */
    @LogMethod
    testMultipleParams(param1: string, param2: number, param3: boolean): string {
        return `Combined: ${param1}_${param2}_${param3}`;
    }

    /**
     * 3 params with void return.
     * Verifies void return + multi-param combination.
     */
    @LogMethod
    testVoidReturnWithParams(param1: string, param2: number, param3: boolean): void {
        LogUtil.info(TAG, `testVoidReturnWithParams: ${param1}, ${param2}, ${param3}`);
    }

    /**
     * 3 number params -> number (sum).
     * Verifies dispatch when all params are the same type.
     */
    @LogMethod
    testThreeNumbers(a: number, b: number, c: number): number {
        return a + b + c;
    }

    /**
     * 2 string params -> string (concatenation).
     * Verifies dispatch when all params are strings.
     */
    @LogMethod
    testTwoStrings(a: string, b: string): string {
        return a + b;
    }

    // ============================================================
    // Section 4: Numeric boundary / special values
    //   Verify precision and correctness at extreme numeric values
    // ============================================================

    /** Return float - verify floating point precision */
    @LogMethod
    testReturnFloat(): number {
        return 3.1415926535;
    }

    /** Return negative number */
    @LogMethod
    testReturnNegativeNumber(): number {
        return -999;
    }

    /** Return zero - verify zero is not treated as falsy */
    @LogMethod
    testReturnZero(): number {
        return 0;
    }

    /** Return false - verify false is not dropped or misinterpreted */
    @LogMethod
    testReturnFalse(): boolean {
        return false;
    }

    /** Return int32 max value - verify large number passing */
    @LogMethod
    testReturnLargeNumber(): number {
        return 2147483647;
    }

    // ============================================================
    // Section 5: Empty values / empty collections
    //   Verify edge cases with empty strings and arrays
    // ============================================================

    /** Return empty string */
    @LogMethod
    testReturnEmptyString(): string {
        return '';
    }

    /** Return empty number array */
    @LogMethod
    testReturnEmptyNumberArray(): Array<number> {
        return [];
    }

    /** Return empty string array */
    @LogMethod
    testReturnEmptyStringArray(): Array<string> {
        return [];
    }

    /** Return string array containing empty string elements */
    @LogMethod
    testReturnArrayWithEmptyStrings(): Array<string> {
        return ['', 'hello', ''];
    }

    // ============================================================
    // Section 6: Special string content
    //   Verify special characters survive C++ <-> AKI <-> ArkTS
    // ============================================================

    /** Return Chinese characters */
    @LogMethod
    testReturnChineseString(): string {
        return '你好，鸿蒙！';
    }

    /** Return string with special characters (newlines, tabs, quotes) */
    @LogMethod
    testReturnSpecialChars(): string {
        return 'line1\nline2\ttab "quotes" \\backslash';
    }

    /** Echo back the input string parameter as-is */
    @LogMethod
    testEchoString(param: string): string {
        return param;
    }

    // ============================================================
    // Section 7: Large arrays
    //   Verify stability with larger array sizes
    // ============================================================

    /** Return number array with 100 elements */
    @LogMethod
    testReturnLargeNumberArray(): Array<number> {
        let arr: Array<number> = [];
        for (let i = 0; i < 100; i++) {
            arr.push(i);
        }
        return arr;
    }

    /** Return string array with 50 elements */
    @LogMethod
    testReturnLargeStringArray(): Array<string> {
        let arr: Array<string> = [];
        for (let i = 0; i < 50; i++) {
            arr.push(`item_${i}`);
        }
        return arr;
    }
}
