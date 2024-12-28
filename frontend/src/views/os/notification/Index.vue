<template>
  <div id="app-os-notification">
    <div class="one-block-1">
      <span>
        1. 弹出桌面通知
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="sendNotification(0)">默认</a-button>
        <a-button @click="sendNotification(1)">发出提示音</a-button>
        <a-button @click="sendNotification(2)">点击通知触发事件</a-button>
        <a-button @click="sendNotification(3)">关闭通知触发事件</a-button>
      </a-space>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { onMounted } from 'vue';
import { message } from 'ant-design-vue';

const views = [
  {
    type: 'main',
    title: '通知标题',
    subtitle: '副标题', // macOS系统专有属性
    body: '这是通知内容-默认',
    silent: true,
  },
  {
    type: 'main',
    title: '提示音',
    subtitle: '副标题-提示音',
    body: '这是通知内容-提示音',
    silent: false,
  },
  {
    type: 'main',
    title: '点击通知事件',
    subtitle: '副标题-点击通知事件',
    body: '这是通知内容-点击通知事件',
    clickEvent: true
  },
  {
    type: 'main',
    title: '关闭通知事件',
    subtitle: '副标题-关闭通知事件',
    body: '这是通知内容-点击通知事件',
    closeEvent: true
  },             
]

onMounted(() => {
  init()
})

function init() {
  // Avoid duplicate monitoring, or write the on function to a unified place and load it only once
  ipc.removeAllListeners(ipcApiRoute.os.sendNotification);
  ipc.on(ipcApiRoute.os.sendNotification, (event, result) => {
    if (Object.prototype.toString.call(result) == '[object Object]') {
      message.info(result.msg);
    }  
  })
}

function sendNotification (index) {
  ipc.send(ipcApiRoute.os.sendNotification, views[index]);
}
</script>
<style lang="less" scoped>
#app-os-notification {
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
