<template>
  <div id="app-demo-window">
    <div class="one-block-1">
      <span>
        1. 自动更新
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="checkForUpdater()">检查更新</a-button>
        <!-- <a-button @click="check(0)">打开哔哩哔哩</a-button> -->
      </a-space>
    </div>
    <!-- <div class="one-block-1">
      <span>
        2. 新窗口中加载html内容
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="createWindow(1)">打开html页面</a-button>
      </a-space>
    </div> -->
  </div>
</template>
<script>

export default {
  data() {
    return {
      views: [],
    };
  },
  mounted () {
    //this.init();
  },
  methods: {
    checkForUpdater () {
      const self = this;
      self.$ipcCallMain('example.checkForUpdater').then(r => {
        console.log(r);
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-demo-window {
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
