<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // Ad-block detection banner, ported from old enhanceApp.js / head.js.
  const win = window as any
  setTimeout(() => {
    if (win._AdBlockInit === undefined && !document.getElementById('ee-adblock-banner')) {
      const banner = document.createElement('div')
      banner.id = 'ee-adblock-banner'
      banner.style.cssText =
        'position:fixed;top:0;left:0;width:100%;background:#E01E5A;color:#fff;z-index:9999999999;font-size:14px;text-align:center;line-height:1.5;font-weight:bold;padding:6px 0;'
      banner.innerHTML =
        "我们的广告服务商 <a style='color:#fff;text-decoration:underline' target='_blank' href='https://wwads.cn/page/end-user-privacy'>并不跟踪您的隐私</a>，为支持本站长期运营，请将本站 <a style='color:#fff;text-decoration:underline' target='_blank' href='https://wwads.cn/page/whitelist-wwads'>加入广告拦截器白名单</a>。"
      const close = document.createElement('span')
      close.textContent = '×'
      close.style.cssText = 'position:absolute;top:0;right:14px;cursor:pointer;'
      close.onclick = () => banner.remove()
      banner.appendChild(close)
      document.body.appendChild(banner)
    }
  }, 3000)
})
</script>

<template>
  <div class="wwads-cn wwads-horizontal ee-page-wwads" data-id="236"></div>
</template>

<style>
.ee-page-wwads {
  width: 100% !important;
  min-height: 0;
  margin: 0 0 1rem;
}
.ee-page-wwads .wwads-img img {
  width: 80px !important;
}
</style>
