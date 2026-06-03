const head = require('./config/head.js');
const plugins = require('./config/plugins.js');
const themeConfig = require('./config/themeConfig.js');


module.exports = {
  theme: "vdoing",
  title: "electron-egg",
  description: '一个入门简单、跨平台、企业级桌面软件开发框架',
  base: "/",
  markdown: {
    lineNumbers: true
  },
  head,
  themeConfig,
  plugins,

  markdown: {
    // lineNumbers: true,
    extractHeaders: ['h2', 'h3', 'h4', 'h5', 'h6'], // 提取标题到侧边栏的级别，默认['h2', 'h3']
  },

  // 监听文件变化并重新构建
  extraWatchFiles: [
    '.vuepress/config.js',
    '.vuepress/config/head.js',
    '.vuepress/config/nav.js',
    '.vuepress/config/htmlModules.js',
    '.vuepress/config/plugins.js',
    '.vuepress/config/themeConfig.js',
  ]
}
