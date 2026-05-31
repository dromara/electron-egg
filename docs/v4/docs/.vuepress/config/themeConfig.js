const nav = require("./nav.js");
const htmlModules = require("./htmlModules.js");

// Theme Config
module.exports = {
  nav,
  sidebarDepth: 2, // 侧边栏显示深度，默认1，最大2（显示到h3标题）
  logo: '/img/logo.png', // 导航栏logo
  //repo: 'dromara/electron-egg', // 导航栏右侧生成Github链接
  searchMaxSuggestions: 10, // 搜索结果显示最大数
  lastUpdated: '上次更新', // 更新的时间，及前缀文字   string | boolean (取值为git提交时间)

  docsRepo: "wallace5303/docs",
  docsDir: "/",
  docsBranch: "main",
  editLinks: false,
  editLinkText: "帮助我们改善此页面！",

  // Vdoing Theme Config
  // 以下配置是Vdoing主题改动的和新增的配置
  sidebar: { mode: 'structuring', collapsable: true }, // 侧边栏  'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | 自定义    温馨提示：目录页数据依赖于结构化的侧边栏数据，如果你不设置为'structuring',将无法使用目录页

  sidebarOpen: true, // 初始状态是否打开侧边栏，默认true
  updateBar: { // 最近更新栏
    showToArticle: false, // 显示到文章页底部，默认true
    // moreArticle: '/archives' // “更多文章”跳转的页面，默认'/archives'
  },
  // titleBadge: false, // 文章标题前的图标是否显示，默认true
  // titleBadgeIcons: [ // 文章标题前图标的地址，默认主题内置图标
  //   '图标地址1',
  //   '图标地址2'
  // ],

  pageStyle: 'line', // 页面风格，可选值：'card'卡片 | 'line' 线（未设置bodyBgImg时才生效）， 默认'card'。 说明：card时背景显示灰色衬托出卡片样式，line时背景显示纯色，并且部分模块带线条边框

  // contentBgStyle: 1,

  category: false, // 是否打开分类功能，默认true。 如打开，会做的事情有：1. 自动生成的frontmatter包含分类字段 2.页面中显示与分类相关的信息和模块 3.自动生成分类页面（在@pages文件夹）。如关闭，则反之。
  tag: false, // 是否打开标签功能，默认true。 如打开，会做的事情有：1. 自动生成的frontmatter包含标签字段 2.页面中显示与标签相关的信息和模块 3.自动生成标签页面（在@pages文件夹）。如关闭，则反之。
  archive: true, // 是否打开归档功能，默认true。 如打开，会做的事情有：1.自动生成归档页面（在@pages文件夹）。如关闭，则反之。

  author: { // 文章默认的作者信息，可在md文件中单独配置此信息 String | {name: String, href: String}
    name: '哆啦好梦', // 必需
    href: 'https://github.com/wallace5303' // 可选的
  },

  social: {
    // iconfontCssFile: '//at.alicdn.com/t/font_1678482_u4nrnp8xp6g.css', // 可选，阿里图标库在线css文件地址，对于主题没有的图标可自由添加
    icons: [
      {
        iconClass: "icon-github",
        title: "GitHub",
        link: "https://github.com/dromara/electron-egg"
      },
      {
        iconClass: "icon-gitee",
        title: "Gitee",
        link: "https://gitee.com/dromara/electron-egg"
      },
      {
        iconClass: 'icon-youjian',
        title: '发邮件',
        link: 'mailto:530353222@qq.com'
      },
    ]
  },

  footer: {
    createYear: 2023,
    copyrightInfo: [
      '<a href="http://www.kaka996.com" target="_blank" style="font-weight:bold">哆啦好梦</a>',
      ' | ',
      '<a href="http://beian.miit.gov.cn/" target=_blank>京ICP备15041380号-2</a>',
    ].join('')
  },

  htmlModules
};
