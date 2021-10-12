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
    <div class="one-block-1">
      <span>
        3. 长消息： 服务端持续向前端页面发消息
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="socketMsgStart">开始</a-button>
        <a-button @click="socketMsgStop">结束</a-button>
        结果：{{ socketMessageString }}
      </a-space>
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
      reply: '',
      socketMessageString: ''
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      const self = this;
      self.$ipc.on('example.socketMessageStart', (event, result) => {
        console.log('[ipcRenderer] [socketMsgStart] result:', result)
        self.socketMessageString = result;
      })
      self.$ipc.on('example.socketMessageStop', (event, result) => {
        console.log('[ipcRenderer] [socketMsgStop] result:', result)
        self.socketMessageString = result;
      })
    },
    helloHandle(value) {
      const self = this;
      this.$ipcCallMain('example.hello', value).then(r => {
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
    },
    socketMsgStart() {
      this.$ipc.send('example.socketMessageStart', '时间')
    },
    socketMsgStop() {
      this.$ipc.send('example.socketMessageStop', '')
    },
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
