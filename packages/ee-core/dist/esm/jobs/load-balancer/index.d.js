var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_index_d = __commonJS({
  "jobs/load-balancer/index.d.ts"(exports, module) {
    const Scheduler = require("./scheduler");
    module.exports = LoadBalancer;
  }
});
export default require_index_d();
