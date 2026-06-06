<template>
  <div id="app-os-window" class="page-container">
    <div class="card-grid">
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">1. 新窗口中加载web内容</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="createWindow(0)">打开哔哩哔哩</a-button>
          </a-space>
        </div>
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">2. 新窗口中加载html内容</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="createWindow(1)">打开html页面</a-button>
          </a-space>
        </div>
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">3. 新窗口中加载当前项目页面</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="createWindow(2)">打开vue页面</a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';

const views = [
  {
    type: 'web',
    content: 'https://www.bilibili.com/',
    windowName: 'window-web',
    windowTitle: 'bilibili'
  },
  {
    type: 'html',
    content: '/public/html/view_example.html',
    windowName: 'window-html',
    windowTitle: 'html window'
  },
  {
    type: 'vue',
    content: '#/special/subwindow',
    windowName: 'window-vue',
    windowTitle: 'vue window'
  },
];

function createWindow(index) {
  ipc.invoke(ipcApiRoute.os.createWindow, views[index])
}
</script>
<style lang="less" scoped>
</style>