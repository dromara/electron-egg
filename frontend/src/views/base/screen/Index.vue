<template>
  <div id="app-demo-screen">
    <div class="one-block-1">
      <span>
        1. 屏幕信息
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="getScreen(0)">获取当前鼠标位置</a-button>
        <a-button @click="getScreen(1)">获取主屏幕</a-button>
        <a-button @click="getScreen(2)">获取所有屏幕</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        结果：
      </span>
    </div>  
    <div class="one-block-2">
      <a-descriptions title="">
        <a-descriptions-item v-for="(info, index) in data" :key="index" :label="info.title" >
          {{ info.desc }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      data: [],
    };
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      const self = this;
      self.$ipc.on('example.getScreen', (event, result) => {
        self.data = result;
      })
    },
    getScreen (index) {
      this.$ipc.send('example.getScreen', index);
    },
  }
};
</script>
<style lang="less" scoped>
#app-demo-screen {
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
