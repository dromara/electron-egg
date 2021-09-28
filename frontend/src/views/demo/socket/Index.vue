<template>
  <div id="app-demo-socket-ipc">
    <div class="one-block-1">
      <span>
        1. 渲染进程与主进程IPC通信
      </span>
    </div>  
    <div class="one-block-2">
      <a-list bordered>
        <a-input-search v-model="content" @search="helloHandle">
          <a-button slot="enterButton">
            send
          </a-button>
        </a-input-search>
      </a-list>
    </div>
    <div class="one-block-1">
      <span>
        2. 主进程API执行网页函数
      </span>
    </div>  
    <div class="one-block-2">
      <a-list bordered>
        <a-input-search v-model="content2" @search="executeJSHandle">
          <a-button slot="enterButton">
            send
          </a-button>
        </a-input-search>
      </a-list>
    </div>
  </div>
</template>
<script>
import { localApi } from '@/api/main'
export default {
  data() {
    return {
      content: 'hello',
      content2: 'hello world',
      reply: ''
    }
  },
  methods: {
    helloHandle(value) {
      const self = this;
      this.$callMain('example.hello', value).then(r => {
        self.$message.info(r);
      })
    },
    executeJSHandle(value) {
      localApi('executeJS', {str: value}).then(res => {
        if (res.code == 0) {
          console.log(res.data);
        }
      }).catch(err => {
        console.log('err:', err)
      })
    }
  }
}
</script>
<style lang="less" scoped>
#app-demo-socket-ipc {
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
