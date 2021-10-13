<template>
  <div id="app-demo-screen">
    <div class="one-block-1">
      <span>
        1. 
      </span>
    </div>
    <div class="one-block-2">
      <a-space>
        <a-button @click="getTheme()">获取模式</a-button>
      </a-space>
      <span>
        结果：{{ currentThemeMode }}
      </span>
    </div>
    <div class="one-block-1">
      2. 设置主题模式（请自行实现前端UI效果）
    </div>  
    <div class="one-block-2">

    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      currentThemeMode: '',
      themeList: [
        'system',
        'light',
        'dark'
      ]
    };
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      const self = this;
      this.$ipc.on('example.setTheme', (event, result) => {
        console.log('result:', result)
        self.currentThemeMode = result;
      })

      this.$ipc.on('example.getTheme', (event, result) => {
        console.log('result:', result)
        self.currentThemeMode = result;
      })
    },
    setTheme (e) {
      this.currentThemeMode = e.target.value;
      console.log('setTheme currentThemeMode:', this.currentThemeMode)
      this.$ipc.send('example.setTheme', this.currentThemeMode);
    },
    getTheme () {
      this.$ipc.send('example.getTheme', '');
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
