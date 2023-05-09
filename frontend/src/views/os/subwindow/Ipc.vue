<template>
  <div id="app-base-subwindow-ipc">
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
        3. 长消息： 服务端持续向前端页面发消息
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="sendMsgStart">开始</a-button>
        <a-button @click="sendMsgStop">结束</a-button>
        结果：{{ messageString }}
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        4. 多窗口通信：窗口之间互相通信
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="sendTosubWindow()">向主窗口发消息</a-button>
      </a-space>
    </div>       
  </div>
</template>
<script>
import { ipcApiRoute, specialIpcRoute } from '@/api/main'
export default {
  data() {
    return {
      messageString: '',
      message1: '',
      message2: '',
      message3: '',
      mainWCid: 0,
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      const self = this;
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.ipcSendMsg);
      this.$ipc.on(ipcApiRoute.ipcSendMsg, (event, result) => {
        console.log('[ipcRenderer] [socketMsgStart] result:', result);

        self.messageString = result;
        // 调用后端的另一个接口
        event.sender.send(ipcApiRoute.hello, 'electron-egg');
      })

      // 监听主窗口发来的消息
      this.$ipc.removeAllListeners(specialIpcRoute.window1ToWindow2);
      this.$ipc.on(specialIpcRoute.window1ToWindow2, (event, arg) => {
          this.$message.info(arg);
      })
    },
    sendMsgStart() {
      const params = {
        type: 'start',
        content: '开始'
      }
      this.$ipc.send(ipcApiRoute.ipcSendMsg, params)
    },
    sendMsgStop() {
      const params = {
        type: 'end',
        content: ''
      }
      this.$ipc.send(ipcApiRoute.ipcSendMsg, params)
    },
    handleInvoke () {
      const self = this;
      this.$ipc.invoke(ipcApiRoute.ipcInvokeMsg, '异步-回调').then(r => {
        console.log('r:', r);
        self.message1 = r;
      });
    },
    async handleInvoke2 () {
      const msg = await this.$ipc.invoke(ipcApiRoute.ipcInvokeMsg, '异步');
      console.log('msg:', msg);
      this.message2 = msg;
    },
    handleSendSync () {
      const msg = this.$ipc.sendSync(ipcApiRoute.ipcSendSyncMsg, '同步');
      this.message3 = msg;
    },
    sendTosubWindow () {
      // 获取主窗口id
      this.$ipc.invoke(ipcApiRoute.getWCid, 'main').then(id => {
        this.mainWCid = id;
        this.$ipc.sendTo(this.mainWCid, specialIpcRoute.window2ToWindow1, '窗口2 通过 sendTo 给主窗口发送消息');
      });
    },
  }
}
</script>
<style lang="less" scoped>
#app-base-subwindow-ipc {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
