"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timing = exports.filePatterns = exports.isBytecodeClass = exports.getResolvedFilename = exports.callFn = exports.loadFile = exports.extensions = exports.FULLPATH = exports.EXPORTS = exports.FileLoader = void 0;
const file_loader_1 = require("./loader/file_loader");
Object.defineProperty(exports, "FileLoader", { enumerable: true, get: function () { return file_loader_1.FileLoader; } });
Object.defineProperty(exports, "EXPORTS", { enumerable: true, get: function () { return file_loader_1.EXPORTS; } });
Object.defineProperty(exports, "FULLPATH", { enumerable: true, get: function () { return file_loader_1.FULLPATH; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "extensions", { enumerable: true, get: function () { return utils_1.extensions; } });
Object.defineProperty(exports, "loadFile", { enumerable: true, get: function () { return utils_1.loadFile; } });
Object.defineProperty(exports, "callFn", { enumerable: true, get: function () { return utils_1.callFn; } });
Object.defineProperty(exports, "getResolvedFilename", { enumerable: true, get: function () { return utils_1.getResolvedFilename; } });
Object.defineProperty(exports, "isBytecodeClass", { enumerable: true, get: function () { return utils_1.isBytecodeClass; } });
Object.defineProperty(exports, "filePatterns", { enumerable: true, get: function () { return utils_1.filePatterns; } });
const timing_1 = require("./utils/timing");
Object.defineProperty(exports, "Timing", { enumerable: true, get: function () { return timing_1.Timing; } });
//# sourceMappingURL=index.js.map