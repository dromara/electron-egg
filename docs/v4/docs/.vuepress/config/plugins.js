// const loveMe = require("./../plugins/love-me");

// Plugin Config
module.exports = [
  // 鼠标点击爱心特效
  // [
  //   loveMe,
  //   {
  //     color: "#11a8cd",
  //     excludeClassName: "theme-vdoing-content"
  //   }
  // ],
  ['fulltext-search'], // 全文搜索
  // // 搜索框第三方搜索
  // [
  //   "thirdparty-search",
  //   {
  //     thirdparty: [
  //       {
  //         title: "在GitHub中搜索",
  //         frontUrl: "https://github.com/search?q=",
  //         behindUrl: ""
  //       },
  //       {
  //         title: "在Google中搜索",
  //         frontUrl: "https://www.google.com/search?q="
  //       },
  //       {
  //         title: "在Baidu中搜索",
  //         frontUrl: "https://www.baidu.com/s?wd="
  //       }
  //     ]
  //   }
  // ],
  // 百度统计
  [
    "vuepress-plugin-baidu-tongji",
    {
      hm: "6da4ceec5fb4d1c7efe0fd109cf2cc9d"
    }
  ],
  // 百度 SEO 优化
  // ["vuepress-plugin-baidu-autopush", {}],
  // 代码块复制
  ['one-click-copy', { // 代码块复制按钮
    copySelector: ['div[class*="language-"] pre', 'div[class*="aside-code"] aside'], // String or Array
    copyMessage: '复制成功', // default is 'Copy successfully and then paste it for use.'
    duration: 1000, // prompt message display time.
    showInMobile: false // whether to display on the mobile side, default: false.
}],
  // 图片缩放
  [
    "vuepress-plugin-zooming",
    {
      selector: ".theme-vdoing-content img:not(.no-zoom)",
      options: {
        bgColor: "rgba(0,0,0,0.6)"
      }
    }
  ],
  // "上次更新"时间格式
  [
    "@vuepress/last-updated",
    {
      transformer: (timestamp, lang) => {
        const dayjs = require("dayjs"); // https://day.js.org/
        return dayjs(timestamp).format("YYYY/MM/DD, HH:mm:ss");
      }
    }
  ],
  // 谷歌统计
  // [
  //   "@vuepress/google-analytics",
  //   {
  //     ga: "ddddddddddddddd"
  //   }
  // ],
  // 网站地图
  // [
  //   "sitemap",
  //   {
  //     hostname: 'https://www.kaka996.com',
  //   },
  // ],
  // ['demo-block', { // demo演示模块 https://github.com/xiguaxigua/vuepress-plugin-demo-block
  //   settings: {
  //     // jsLib: ['http://xxx'], // 在线示例(jsfiddle, codepen)中的js依赖
  //     // cssLib: ['http://xxx'], // 在线示例中的css依赖
  //     // vue: 'https://fastly.jsdelivr.net/npm/vue/dist/vue.min.js', // 在线示例中的vue依赖
  //     jsfiddle: false, // 是否显示 jsfiddle 链接
  //     codepen: true, // 是否显示 codepen 链接
  //     horizontal: false // 是否展示为横向样式
  //   }
  // }],
];
