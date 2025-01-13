/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

 const { logger } = require('ee-core/log');
 
 function preload() {
   logger.info('[preload] load 1');
 }
 
 /**
 * 预加载模块入口
 */
 module.exports = {
   preload
 }