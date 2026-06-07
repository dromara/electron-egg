<template>
  <div id="app-os-notification" class="page-container">
    <div class="card-grid">
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">1. 弹出桌面通知</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="sendNotification(0)">默认</a-button>
            <a-button @click="sendNotification(1)">发出提示音</a-button>
            <a-button @click="sendNotification(2)">点击通知触发事件</a-button>
            <a-button @click="sendNotification(3)">关闭通知触发事件</a-button>
          </a-space>
        </div>
      </div>
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
    subtitle: '副标题',
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
</style>