import { defineConfig } from 'vitepress'
import { sidebarZh, sidebarEn } from './buildData.mjs'

// Analytics + ads, ported from the old VuePress head.js / htmlModules.js
const head: any[] = [
  ['link', { rel: 'icon', href: '/img/favicon.ico' }],
  ['meta', { name: 'keywords', content: 'electron-egg,ElectronEgg,EE,ee,electron,framework,electron-egg教程,electron-egg架构,electron-egg控制台,egg' }],
  // Google Analytics
  ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-DBQJBD61NC' }],
  ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DBQJBD61NC');`],
  // Baidu Tongji
  ['script', {}, `var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?6da4ceec5fb4d1c7efe0fd109cf2cc9d";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`],
  // WWAds loader
  ['script', { async: '', src: 'https://cdn.wwads.cn/js/makemoney.js' }],
]

const navZh = [
  { text: '首页', link: '/' },
  { text: 'v5', link: '/00.docs/010.getting-started/001.major-update' },
  { text: '插件', link: '/08.plugins/01.introduction' },
  { text: 'API', link: '/09.api/001.tutorial/001.usage-guide' },
  { text: 'demo', link: '/07.features/01.demo' },
  { text: '案例', link: '/04.others/020.case-study-01' },
  { text: '交流', link: '/04.others/011.communication' },
  {
    text: '开源',
    items: [
      { text: 'GitHub', link: 'https://github.com/dromara/electron-egg' },
      { text: 'Gitee', link: 'https://gitee.com/dromara/electron-egg' },
    ],
  },
]

const navEn = [
  { text: 'Home', link: '/en/' },
  { text: 'v5', link: '/en/00.v4/010.getting-started/010.introduction' },
  { text: 'Plugins', link: '/en/08.plugins/01.introduction' },
  { text: 'API', link: '/en/09.api-v4/001.tutorial/001.usage-guide' },
  { text: 'demo', link: '/en/07.features/01.demo' },
  { text: 'Tips', link: '/en/05.tips/010.nvm' },
  { text: 'Cases', link: '/en/04.others/020.case-study-01' },
  {
    text: 'Open Source',
    items: [
      { text: 'GitHub', link: 'https://github.com/dromara/electron-egg' },
      { text: 'Gitee', link: 'https://gitee.com/dromara/electron-egg' },
    ],
  },
]

export default defineConfig({
  // 站点标题（浏览器标签页和导航栏显示）
  title: 'ElectronEgg',
  // 源文件目录，Markdown 文档从该目录下读取（相对于项目根）
  srcDir: 'docs',
  // 路径重写规则，将源文件路径映射为最终的访问 URL
  // 注入到每个页面 <head> 中的标签（图标、SEO meta、统计与广告脚本等）
  head,
  // 干净链接，去掉 URL 中的 .html 后缀
  cleanUrls: true,
  // 显示页面最后更新时间（基于 Git 提交记录）
  lastUpdated: true,
  // 忽略死链检测，构建时不因失效链接而报错中断
  ignoreDeadLinks: true,
  // 主题配置（默认主题），作用于所有语言的全局配置
  themeConfig: {
    // 导航栏 Logo 图片路径
    logo: '/img/logo.png',
    // 站内搜索，使用本地搜索（无需外部服务）
    search: { provider: 'local' },
    // 社交链接，导航栏右侧展示的图标链接
    socialLinks: [{ icon: 'github', link: 'https://github.com/dromara/electron-egg' }],
  },
  // 多语言配置，每个 key 对应一种语言/区域
  locales: {
    // 根语言（默认语言），访问根路径时使用，此处为简体中文
    root: {
      // 语言切换菜单中显示的名称
      label: '简体中文',
      // 该语言的 HTML lang 属性值
      lang: 'zh-CN',
      // 该语言独立的主题配置，会与外层 themeConfig 合并
      themeConfig: {
        // 顶部导航栏菜单（中文）
        nav: navZh,
        // 侧边栏菜单（中文）
        sidebar: sidebarZh,
        // 右侧大纲（TOC）标题与显示的标题层级
        outline: { label: '本页目录', level: [2, 6] },
        // 文档底部上一页/下一页的文案
        docFooter: { prev: '上一页', next: '下一页' },
        // “上次更新”时间前的提示文案
        lastUpdatedText: '上次更新',
        // 回到顶部按钮的无障碍标签
        returnToTopLabel: '回到顶部',
        // 移动端侧边栏菜单按钮的文案
        sidebarMenuLabel: '菜单',
        // 深色模式切换按钮的无障碍标签
        darkModeSwitchLabel: '主题',
        // 页脚信息（版权、备案号等）
        footer: {
          copyright:
            'Copyright © 2023 <a href="http://www.kaka996.com" target="_blank">哆啦好梦</a> | <a href="http://beian.miit.gov.cn/" target="_blank">京ICP备15041380号-2</a>',
        },
      },
    },
    // 英文语言配置
    en: {
      // 语言切换菜单中显示的名称
      label: 'English',
      // 该语言的 HTML lang 属性值
      lang: 'en',
      // 该语言的访问路径前缀
      link: '/en/',
      // 该语言独立的主题配置
      themeConfig: {
        // 顶部导航栏菜单（英文）
        nav: navEn,
        // 侧边栏菜单（英文），限定作用于 /en/ 路径
        sidebar: { '/en/': sidebarEn },
        // 右侧大纲（TOC）标题与显示的标题层级
        outline: { label: 'On this page', level: [2, 6] },
        // 页脚信息（版权等）
        footer: {
          copyright:
            'Copyright © 2023 <a href="http://www.kaka996.com" target="_blank">electron-egg</a>',
        },
      },
    },
  },
})

