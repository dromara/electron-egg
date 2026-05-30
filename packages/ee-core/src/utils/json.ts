/**
 * @module utils/json
 * @description JSON file read/write utility. Provides synchronous and asynchronous JSON file
 * read/write functions, automatically handling directory creation, object serialization, and
 * file path checking, simplifying JSON file operations in framework and business code.
 */
import fs from 'fs';
import path from 'path';

/** JSON write options */
export interface JsonWriteOptions {
  /** Number of indent spaces, default 2 */
  space?: number;
  /** JSON.stringify replacer function for custom serialization logic */
  replacer?: (key: string, value: unknown) => unknown;
}

/**
 * Strictly parse a JSON string
 *
 * Unlike JSON.parse, additionally validates that the parsed result must be an object type,
 * preventing primitive type values (such as strings, numbers) from being parsed.
 *
 * @param str - JSON string
 * @returns Parsed object
 * @throws Error - Throws when parse result is not an object
 */
export function strictParse(str: string): unknown {
  const obj = JSON.parse(str);
  // Ensure parse result is an object, excluding null, primitive values, and arrays
  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON string is not object');
  }
  return obj;
}

/**
 * Synchronously read a JSON file
 *
 * Reads file content and parses it as an object; throws if file does not exist.
 *
 * @param filepath - JSON file path
 * @returns Parsed object
 * @throws Error - Throws when file does not exist
 */
export function readSync(filepath: string): unknown {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

/**
 * Synchronously write a JSON file
 *
 * Automatically creates the target directory, objects are automatically serialized to JSON string,
 * non-object values are converted to string for writing. Default uses 2-space indentation.
 *
 * @param filepath - Target file path
 * @param str - Content to write, objects will be serialized by JSON.stringify
 * @param options - Write options (indentation, replacer)
 */
export function writeSync(filepath: string, str: unknown, options: JsonWriteOptions = {}): void {
  const opts = { space: 2, ...options };

  // Ensure target directory exists, avoiding write errors due to missing directory
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  let content: string;
  if (typeof str === 'object') {
    content = JSON.stringify(str, opts.replacer as (key: string, value: unknown) => unknown, opts.space) + '\n';
  } else {
    // Non-object values are converted to string directly for writing
    content = String(str);
  }

  fs.writeFileSync(filepath, content);
}

/**
 * Asynchronously read a JSON file
 *
 * First checks if the file exists and is a regular file, then reads and parses it.
 * Uses fs.promises async API, does not block the event loop.
 *
 * @param filepath - JSON file path
 * @returns Promise of the parsed object
 * @throws Error - Throws when file does not exist or is not a file
 */
export function read(filepath: string): Promise<unknown> {
  return fs.promises
    .stat(filepath)
    .then((stats) => {
      // Ensure path points to a regular file, not a directory
      if (!stats.isFile()) {
        throw new Error(filepath + ' is not found');
      }
      return fs.promises.readFile(filepath, 'utf8');
    })
    .then((buf) => JSON.parse(buf));
}

/**
 * Asynchronously write a JSON file
 *
 * Automatically creates the target directory, objects are automatically serialized to JSON string,
 * non-object values are converted to string for writing. Default uses 2-space indentation.
 * Uses fs.promises async API, does not block the event loop.
 *
 * @param filepath - Target file path
 * @param str - Content to write, objects will be serialized by JSON.stringify
 * @param options - Write options (indentation, replacer)
 * @returns Promise that resolves when writing is complete
 */
export function write(filepath: string, str: unknown, options: JsonWriteOptions = {}): Promise<void> {
  const opts = { space: 2, ...options };

  let content: string;
  if (typeof str === 'object') {
    content = JSON.stringify(str, opts.replacer as (key: string, value: unknown) => unknown, opts.space) + '\n';
  } else {
    content = String(str);
  }

  // First ensure directory exists, then write the file
  return fs.promises.mkdir(path.dirname(filepath), { recursive: true }).then(() => fs.promises.writeFile(filepath, content));
}
