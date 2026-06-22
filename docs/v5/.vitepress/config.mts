import { defineConfig } from 'vitepress'
import { sidebarZh, sidebarEn, sidebarZhV4 } from './buildData.mjs'

// Analytics + ads
const head: any[] = [
  ['link', { rel: 'icon', href: '/img/favicon.ico' }],
  ['meta', { name: 'keywords', content: 'electron-egg,ElectronEgg,EE,ee,electron,framework,desktop application,cross-platform' }],
  // Google Analytics
  ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-DBQJBD61NC' }],
  ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DBQJBD61NC');`],
  // Baidu Tongji
  ['script', {}, `var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?6da4ceec5fb4d1c7efe0fd109cf2cc9d";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`],
  // WWAds loader
  ['script', { async: '', src: 'https://cdn.wwads.cn/js/makemoney.js' }],
]

const navEn = [
  { text: 'Home', link: '/' },
  {
    text: 'Version',
    items: [
      { text: 'v5 (Current)', link: '/00.docs/010.getting-started/001.major-update' },
      { text: 'v4 (Archive)', link: '/zh/v4/' },
    ],
  },
  { text: 'Plugins', link: '/08.plugins/01.introduction' },
  { text: 'API', link: '/09.api/001.tutorial/001.usage-guide' },
  { text: 'Demo', link: '/07.features/01.demo' },
  { text: 'Cases', link: '/04.others/020.case-study-01' },
  { text: 'Community', link: '/04.others/011.communication' },
  {
    text: 'Open Source',
    items: [
      { text: 'GitHub', link: 'https://github.com/dromara/electron-egg' },
      { text: 'Gitee', link: 'https://gitee.com/dromara/electron-egg' },
    ],
  },
]

const navZh = [
  { text: '首页', link: '/zh/' },
  {
    text: '版本',
    items: [
      { text: 'v5 (当前版本)', link: '/zh/00.docs/010.getting-started/001.major-update' },
      { text: 'v4 (归档版本)', link: '/zh/v4/' },
    ],
  },
  { text: '插件', link: '/zh/08.plugins/01.introduction' },
  { text: 'API', link: '/zh/09.api/001.tutorial/001.usage-guide' },
  { text: 'demo', link: '/zh/07.features/01.demo' },
  { text: '案例', link: '/zh/04.others/020.case-study-01' },
  { text: '交流', link: '/zh/04.others/011.communication' },
  {
    text: '开源',
    items: [
      { text: 'GitHub', link: 'https://github.com/dromara/electron-egg' },
      { text: 'Gitee', link: 'https://gitee.com/dromara/electron-egg' },
    ],
  },
]

export default defineConfig({
  // Site title (browser tab and navbar display)
  title: 'ElectronEgg',
  // Source directory, Markdown docs are read from this directory (relative to project root)
  srcDir: 'docs',
  // Head tags injected into every page <head>
  head,
  // Clean URLs, remove .html suffix from URLs
  cleanUrls: true,
  // Show last updated time (based on Git commits)
  lastUpdated: true,
  // Ignore dead link detection during build
  ignoreDeadLinks: true,
  // Theme config (default theme), global config applied to all languages
  themeConfig: {
    logo: '/img/logo.png',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dromara/electron-egg' }],
  },
  // Multi-language config, each key corresponds to a language/region
  locales: {
    // Root language (default), English
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: navEn,
        sidebar: [...sidebarEn, { text: 'v4 (Archive)', collapsed: true, items: [{ text: 'v4 Archive', link: '/v4/' }] }],
        outline: { label: 'On this page', level: [2, 6] },
        footer: {
          copyright:
            'Copyright © 2023 <a href="http://www.kaka996.com" target="_blank">electron-egg</a>',
        },
      },
    },
    // Chinese locale
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: navZh,
        sidebar: { '/zh/': [...sidebarZh, ...sidebarZhV4] },
        outline: { label: '本页目录', level: [2, 6] },
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdatedText: '上次更新',
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        footer: {
          copyright:
            'Copyright © 2023 <a href="http://www.kaka996.com" target="_blank">哆啦好梦</a> | <a href="http://beian.miit.gov.cn/" target="_blank">京ICP备15041380号-2</a>',
        },
      },
    },
  },
})