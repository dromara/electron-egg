"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlFilepath = getHtmlFilepath;
const path_1 = __importDefault(require("path"));
// Html
function getHtmlFilepath(name) {
    const pagePath = path_1.default.join(__dirname, name);
    return pagePath;
}
//# sourceMappingURL=index.js.map