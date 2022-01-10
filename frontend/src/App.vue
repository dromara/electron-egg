<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
  data() {
    return {};
  },
  watch: {},
  mounted () {
    // 初始化一个公共消息通信频道
    this.initIpc();
  },
  methods: {
    initIpc () {
      const self = this;
      self.$ipc.on('public.message', (event, result) => {
        // 使用ant-desing-vue, message组件
        self.$message.info(result);
      })
    },
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
