import { defineConfig } from 'vitepress'
import { rewrites, sidebarZh, sidebarEn } from './buildData.mjs'

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
  { text: 'v4', link: '/pages/909757/' },
  { text: '插件', link: '/pages/300556/' },
  { text: 'API', link: '/pages/a99b72/' },
  { text: 'demo', link: '/pages/132909/' },
  { text: '支持', link: '/pages/cce31f/' },
  { text: '知识点', link: '/pages/1f0f51/' },
  { text: '案例', link: '/pages/eadf46/' },
  { text: '交流', link: '/pages/c2720e/' },
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
  { text: 'v4', link: '/en/pages/909757/' },
  { text: 'Plugins', link: '/en/pages/300556/' },
  { text: 'API', link: '/en/pages/a99b72/' },
  { text: 'demo', link: '/en/pages/132909/' },
  { text: 'Support', link: '/en/pages/cce31f/' },
  { text: 'Tips', link: '/en/pages/1f0f51/' },
  { text: 'Cases', link: '/en/pages/eadf46/' },
  {
    text: 'Open Source',
    items: [
      { text: 'GitHub', link: 'https://github.com/dromara/electron-egg' },
      { text: 'Gitee', link: 'https://gitee.com/dromara/electron-egg' },
    ],
  },
]

export default defineConfig({
  srcDir: 'docs',
  rewrites,
  head,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    logo: '/img/logo.png',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dromara/electron-egg' }],
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: navZh,
        sidebar: sidebarZh,
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
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: navEn,
        sidebar: { '/en/': sidebarEn },
        outline: { label: 'On this page', level: [2, 6] },
        footer: {
          copyright:
            'Copyright © 2023 <a href="http://www.kaka996.com" target="_blank">electron-egg</a>',
        },
      },
    },
  },
})

