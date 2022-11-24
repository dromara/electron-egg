<template>
  <div id="app-base-httpserver">
    <div class="one-block-1">
      <span>
        1. 内置socket-io server服务
      </span>
    </div>
    <div class="one-block-2">
      <a-space>
        <p>* 状态：{{ currentStatus }}</p>
      </a-space>
      <p>* 地址：{{ servicAddress }}</p>
    </div>
    <div class="one-block-1">
      <span>
        2. 发送请求
      </span>
    </div>    
    <div class="one-block-2">
      <a-space>
        <a-button @click="sendRequest('downloads')"> 打开【我的下载】 </a-button>
      </a-space>
    </div>
  </div>
</template>
<script>
import { io } from 'socket.io-client'
import { ipcApiRoute, requestHttp } from '@/api/main'

export default {
  data() {
    return {
      currentStatus: '关闭',
      servicAddress: 'ws://127.0.0.1:7070'
    };
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      const self = this;
      this.socket = io(this.servicAddress);
      this.socket.on('connect', () => {
        console.log('connect!!!!!!!!');
        self.currentStatus = '开启';
      });
    },
    sendRequest (id) {
      if (this.currentStatus == '关闭') {
        this.$message.error('socketio服务未开启');
        return;
      }

      const method = ipcApiRoute.doSocketRequest; 
      this.socket.emit('c1', { cmd: method, params: {id: id} }, (response) => {
        // response为返回值
        console.log('response:', response)
      });
    },  
  }
};
</script>
<style lang="less" scoped>
#app-base-httpserver {
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
