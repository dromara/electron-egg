/** 插入自定义html模块 (可用于插入广告模块等)
 * {
 *   homeSidebarB: htmlString, 首页侧边栏底部
 *
 *   sidebarT: htmlString, 全局左侧边栏顶部
 *   sidebarB: htmlString, 全局左侧边栏底部
 *
 *   pageT: htmlString, 全局页面顶部
 *   pageB: htmlString, 全局页面底部
 *   pageTshowMode: string, 页面顶部-显示方式：未配置默认全局；'article' => 仅文章页①； 'custom' => 仅自定义页①
 *   pageBshowMode: string, 页面底部-显示方式：未配置默认全局；'article' => 仅文章页①； 'custom' => 仅自定义页①
 *
 *   windowLB: htmlString, 全局左下角②
 *   windowRB: htmlString, 全局右下角②
 * }
 *
 * ①注：在.md文件front matter配置`article: false`的页面是自定义页，未配置的默认是文章页（首页除外）。
 * ②注：windowLB 和 windowRB：1.展示区块宽高最大是200*200px。2.请给自定义元素定一个不超过200px的固定宽高。3.在屏宽小于960px时无论如何都不会显示。
 */

// 万维
/* <a href="https://ad-server.paperyy.com/link/1715568487831293954" target="_blank">
<img class="no-zoom" height="60" width="224" src="/img/sponsor/chatgtp.gif">
</a> */



module.exports = {
  sidebarT: `
    <div>
    <a href="https://www.toolsetlink.com?from=electron-egg" target="_blank">
      <img class="no-zoom" height="60" width="224" src="https://img01.kaka996.com/ee/images/ee-v4/upgradelink/upgradelink.png">
    </a>
    <a href="http://doc.zyplayer.com/#/integrate/zyplayer-doc?utm=electron-egg" target="_blank">
      <img class="no-zoom" height="60" width="224" src="https://img01.kaka996.com/ee/images/ee-v3/zydoc/zy-logo-4.png">
    </a>
    <span style='color: gray;font-size: smaller;'></span>
    <span style='color: #E01E5A;font-size: smaller;font-weight: bolder;float: right'>❤️<a href='/pages/fe2b29/'>成为赞助商</a></span>
    </div>    
  `,

  // 万维广告
  pageT: `
    <div class="wwads-cn wwads-horizontal page-wwads" data-id="236"></div>
    <style>
      .page-wwads{
        width:100%!important;
        min-height: 0;
        margin: 0;
        height: 100%;
      }
      .page-wwads .wwads-img img{
        width:80px!important;
      }
      .page-wwads .wwads-poweredby{
        width: 40px;
        position: absolute;
        right: 25px;
        bottom: 3px;
      }
      .wwads-content .wwads-text, .page-wwads .wwads-text{
        height: 100%;
        padding-top: 5px;
        display: block;
      }
    </style>
  `,
  // pageB: `
  //   <ins class="adsbygoogle"
  //     style="display:block"
  //     data-ad-client="ca-pub-2708221248260848"
  //     data-ad-slot="5098589217"
  //     data-ad-format="auto"
  //     data-full-width-responsive="true"></ins>
  //   <script>
  //     (adsbygoogle = window.adsbygoogle || []).push({});
  //   </script>
  // `,
  windowRB: `

  `
};
