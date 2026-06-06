<template>
  <div id="app-socket-ipc" class="page-container">
    <div class="card-grid">
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">1. 发送异步消息</div>
        <div class="feature-card__body">
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
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">
          2. 同步消息（不推荐，阻塞执行）
        </div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="handleSendSync">同步消息</a-button>
            结果：{{ message3 }}
          </a-space>
        </div>
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">3. 长消息： 服务端持续向前端页面发消息</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="sendMsgStart">开始</a-button>
            <a-button @click="sendMsgStop">结束</a-button>
            结果：{{ messageString }}
          </a-space>
        </div>
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">4. 多窗口通信：子窗口与主进程通信，子窗口互相通信</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="createWindow()">打开新窗口2</a-button>
            <a-button @click="sendTosubWindow()">向新窗口2发消息</a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const messageString = ref('');
const message1 = ref('');
const message2 = ref('');
const message3 = ref('');

const vueItem = {
  type: 'vue',
  content: '#/special/subwindow',
  windowName: 'window2',
  windowTitle: 'ipc window'
};

onMounted(() => {
  init()
})

function init() {
  ipc.removeAllListeners(ipcApiRoute.framework.ipcSendMsg);
  ipc.on(ipcApiRoute.framework.ipcSendMsg, (event, result) => {
    console.log('[ipcRenderer] [socketMsgStart] result:', result);

    messageString.value = result;
    event.sender.send(ipcApiRoute.framework.hello, 'electron-egg');
  })

  ipc.removeAllListeners(ipcApiRoute.os.window2ToWindow1);
  ipc.on(ipcApiRoute.os.window2ToWindow1, (event, arg) => {
    message.info(arg);
  })
}

function sendMsgStart() {
  const params = {
    type: 'start',
    content: '开始'
  }
  ipc.send(ipcApiRoute.framework.ipcSendMsg, params)
}

function sendMsgStop() {
  const params = {
    type: 'end',
    content: ''
  }
  ipc.send(ipcApiRoute.framework.ipcSendMsg, params)
}

function handleInvoke() {
  ipc.invoke(ipcApiRoute.framework.ipcInvokeMsg, '异步-回调').then(r => {
    console.log('r:', r);
    message1.value = r;
  });
}

async function handleInvoke2() {
  const msg = await ipc.invoke(ipcApiRoute.framework.ipcInvokeMsg, '异步');
  console.log('msg:', msg);
  message2.value = msg;
}

function handleSendSync() {
  const msg = ipc.sendSync(ipcApiRoute.framework.ipcSendSyncMsg, '同步');
  message3.value = msg;
}

function createWindow() {
  ipc.invoke(ipcApiRoute.os.createWindow, vueItem).then(wcid => {
    console.log('[createWindow] wcid:', wcid);
  })
}

async function sendTosubWindow() {
  const params = {
    receiver: 'window2',
    content: '窗口1给窗口2发送消息'
  }
  ipc.invoke(ipcApiRoute.os.window1ToWindow2, params)
}
</script>
<style lang="less" scoped>
</style>