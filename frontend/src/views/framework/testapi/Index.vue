<template>
  <div id="app-base-test-api">
    <div class="one-block-1">
      <span>
        1. 测试一些操作系统api
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="exec(1)"> 点击 </a-button>
        <a-button @click="exec2(1)"> 点击2 </a-button>
      </a-space>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute, requestHttp } from '@/api/main'

export default {
  data() {
    return {
      type: 1,
    };
  },
  methods: {
    exec (id) {
      const params = {
        id: id
      }
      this.$ipc.invoke(ipcApiRoute.test, params).then(res => {
        console.log('res:', res)
      }) 
    },
    exec2 (id) {
      const params = {
        id: id
      }
      requestHttp(ipcApiRoute.test, params).then(res => {
        console.log('res2:', res)
      }) 
    },    
  }
};
</script>
<style lang="less" scoped>
#app-base-test-api {
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
