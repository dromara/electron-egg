<template>
  <div id="app-base-socket-ipc">
    <div class="one-block-1">
      <span>
        1. 发送异步消息
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="handleInvoke">发送 - 回调</a-button>
        结果：{{ message1 }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="handleInvoke2">发送 - async/await</a-button>
        结果：{{ message2 }}
      </a-space>            
    </div>   
    <div class="one-block-1">
      <span>
        <!-- 尽量不要使用，任何错误都容易引起卡死 -->
        2. 同步消息（不推荐，阻塞执行）
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="handleSendSync">同步消息</a-button>
        结果：{{ message3 }}
      </a-space>   
    </div>        
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
import { ipcApiRoute } from '@/api/main'
export default {
  data() {
    return {
      content: 'hello',
      content2: 'hello world',
      reply: '',
      socketMessageString: '',
      message1: '',
      message2: '',
      message3: ''
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      const self = this;
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.socketMessageStart);
      this.$ipc.removeAllListeners(ipcApiRoute.socketMessageStop);

      this.$ipc.on(ipcApiRoute.socketMessageStart, (event, result) => {
        console.log('[ipcRenderer] [socketMsgStart] result:', result)
        self.socketMessageString = result;
      })
      this.$ipc.on(ipcApiRoute.socketMessageStop, (event, result) => {
        console.log('[ipcRenderer] [socketMsgStop] result:', result)
        self.socketMessageString = result;
      })
    },
    helloHandle(value) {
      const self = this;
      this.$ipcCall(ipcApiRoute.hello, value).then(r => {
        self.$message.info(r);
      })
    },
    executeJSHandle(value) {
      this.$ipcCall(ipcApiRoute.executeJS, value).then(r => {
        console.log(r);
      })      
    },
    socketMsgStart() {
      this.$ipc.send(ipcApiRoute.socketMessageStart, '时间')
    },
    socketMsgStop() {
      this.$ipc.send(ipcApiRoute.socketMessageStop, '')
    },
    handleInvoke () {
      const self = this;
      this.$ipcInvoke(ipcApiRoute.ipcInvokeMsg, '异步-回调').then(r => {
        console.log('r:', r);
        self.message1 = r;
      });
    },
    async handleInvoke2 () {
      const msg = await this.$ipcInvoke(ipcApiRoute.ipcInvokeMsg, '异步');
      console.log('msg:', msg);
      this.message2 = msg;
    },
    handleSendSync () {
      const msg = this.$ipcSendSync(ipcApiRoute.ipcSendSyncMsg, '同步');
      this.message3 = msg;
    },
  }
}
</script>
<style lang="less" scoped>
#app-base-socket-ipc {
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
