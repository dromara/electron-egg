<template>
  <div id="app-base-window">
    <div class="one-block-1">
      <span>
        1. 新窗口中加载web内容
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="createWindow(0)">打开哔哩哔哩</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        2. 新窗口中加载html内容
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="createWindow(1)">打开html页面</a-button>
      </a-space>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'

export default {
  data() {
    return {
      views: [
        {
          type: 'web',
          content: 'https://www.bilibili.com/'
        },
        {
          type: 'html',
          content: '/public/html/view_example.html'
        },        
      ],
    };
  },
  methods: {
    createWindow (index) {
      this.$ipcInvoke(ipcApiRoute.createWindow, this.views[index]).then(r => {
        console.log(r);
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-base-window {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
