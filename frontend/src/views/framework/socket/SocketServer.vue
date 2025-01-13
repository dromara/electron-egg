<template>
  <div id="app-socket-server">
    <div class="one-block-1">
      <span>
        1. 使用socket与主进程通信
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
<script setup>
import { ipcApiRoute } from '@/api';
import { io } from 'socket.io-client';
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const currentStatus = ref('关闭');
const servicAddress = ref('ws://localhost:7070');
const client = {
  socket: null
};

onMounted(() => {
  init()
})

function init() {
  client.socket = io(servicAddress.value);
  client.socket.on('connect', () => {
    console.log('connect!!!!!!!!');
    currentStatus.value = '开启';
  });
}

function sendRequest(id) {
  if (currentStatus.value == '关闭') {
    message.error('socketio服务未开启');
    return;
  }

  const method = ipcApiRoute.framework.doSocketRequest; 
  client.socket.emit('socket-channel', { cmd: method, args: {id} }, (response) => {
    // response为返回值
    console.log('response:', response)
  });
} 
</script>
<style lang="less" scoped>
#app-socket-server {
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
