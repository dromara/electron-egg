<template>
  <div id="app-demo-window-view">
    <div class="one-block-1">
      <span>
        1. 嵌入更多的 web 内容
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="loadViewContent(0)">加载百度页面</a-button>
        <a-button @click="removeViewContent(0)">移除百度页面</a-button>
        <a-button @click="loadViewContent(1)">加载html页面</a-button>
        <a-button @click="removeViewContent(1)">移除html页面</a-button>
      </a-space>
    </div>
    <div class="one-block-2">
      <template></template>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      views: [
        {
          type: 'web',
          content: 'https://www.baidu.com/'
        },
        {
          type: 'html',
          content: '/asset/view_example.html'
        },        
      ],
    };
  },
  methods: {
    loadViewContent (index) {
      const self = this;
      self.$ipcCallMain('example.loadViewContent', this.views[index]).then(r => {
        console.log(r);
      })
    },
    removeViewContent (index) {
      const self = this;
      self.$ipcCallMain('example.removeViewContent', self.views[index]).then(r => {
        console.log(r);
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-demo-window-view {
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
