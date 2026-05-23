/**
 * Slync was inspired by atomic-sleep:
 * - https://www.npmjs.com/package/atomic-sleep
 *
 * It is written in TypeScript, and only accepts 'number' for the ms parameter,
 * whereas atomic-sleep also accepts 'bigint'.
 *
 * Slync will also determine which sleep method to use (atomic vs naive)
 * at runtime in case the global SharedBufferArray and Atomics changes.
 */

/**
 * Synchronously sleeps for the specified duration in milliseconds using a
 * naive approach involving while loops
 *
 * @param {number} ms - The duration to sleep in milliseconds.
 */
const sleepNaive = (ms: number): void => {
  const endTime = Date.now() + ms;
  while (endTime > Date.now()) {
    /* sleeping */
  }
};

/**
 * Synchronously sleeps for the specified duration in milliseconds using an
 * atomic approach:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait
 *
 * @param {number} ms - The duration to sleep in milliseconds.
 */
const sleepAtomic = (ms: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

/**
 * Synchronously sleeps for the specified duration in milliseconds.
 *
 * @param {number} ms - The duration to sleep in milliseconds.
 * @throws {TypeError} If `ms` is not a number.
 * @throws {RangeError} If `ms` is not strictly above 0 and below Infinity.
 */
const slync = (ms: number): void => {
  if (typeof ms !== 'number') {
    throw new TypeError(`slync: ms is not of type 'number'. Given: ${ms} of type '${typeof ms}'`);
  }

  if (!(ms >= 0 && ms < Infinity)) {
    throw new RangeError(`slync: ms must be in the range [0, Infinity). Given: ${ms}`);
  }

  if (typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined') {
    sleepAtomic(ms);
  } else {
    sleepNaive(ms);
  }
};

export default slync;