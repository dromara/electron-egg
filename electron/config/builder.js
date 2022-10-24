/**
 * 打包配置
 * @see https://www.electron.build/configuration/configuration
 */
const path = require('path');
const basePath = process.cwd();
 
module.exports = {
   productName: "ee",
   appId: "com.electron.ee",
   copyright: "wallace5303",
   directories: {
     output: path.join(basePath, "./out"),
   },
   asar: true,
   files: [
     "**/*",
     "!frontend/",
     "!run/",
     "!logs/",
     "!data/",
     "!electron/"
   ],
   extraResources: {
     from: path.join(basePath, "./build/extraResources/"),
     to: "extraResources"
   },
   electronDownload: {
     mirror: "https://npmmirror.com/mirrors/electron/"
   },
   nsis: {
     oneClick: false,
     allowElevation: true,
     allowToChangeInstallationDirectory: true,
     installerIcon: path.join(basePath, "./build/icons/icon.ico"),
     uninstallerIcon: path.join(basePath, "./build/icons/icon.ico"),
     installerHeaderIcon: path.join(basePath, "./build/icons/icon.ico"),
     createDesktopShortcut: true,
     createStartMenuShortcut: true,
     shortcutName: "EE框架"
   },
   publish: [
     {
       provider: "generic",
       url: "https://github.com/wallace5303/electron-egg"
     }
   ],
   mac: {
     icon: path.join(basePath, "./build/icons/icon.icns"),
     artifactName: "${productName}-${os}-${version}-${arch}.${ext}",
     target: [
       "dmg",
       "zip"
     ]
   },
   win: {
     icon: path.join(basePath, "./build/icons/icon.ico"),
     artifactName: "${productName}-${os}-${version}-${arch}.${ext}",
     target: [
       {
         target: "nsis"
       }
     ]
   },
   linux: {
     icon: path.join(basePath, "./build/icons/icon.icns"),
     artifactName: "${productName}-${os}-${version}-${arch}.${ext}",
     target: [
       "deb"
     ],
     category: "Utility"
   }
 };