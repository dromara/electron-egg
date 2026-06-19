var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var hello_exports = {};
__export(hello_exports, {
  welcome: () => welcome
});
module.exports = __toCommonJS(hello_exports);
var import_log = require("ee-core/log");
function welcome() {
  import_log.logger.info("[child-process] [jobs/example/hello] welcome ! ");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  welcome
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vZWxlY3Ryb24vam9icy9leGFtcGxlL2hlbGxvLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB3ZWxjb21lKCk6IHZvaWQge1xuICBsb2dnZXIuaW5mbygnW2NoaWxkLXByb2Nlc3NdIFtqb2JzL2V4YW1wbGUvaGVsbG9dIHdlbGNvbWUgISAnKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUF1QjtBQUVoQixTQUFTLFVBQWdCO0FBQzlCLG9CQUFPLEtBQUssaURBQWlEO0FBQy9EOyIsCiAgIm5hbWVzIjogW10KfQo=
