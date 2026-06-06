<template>
  <div id="app-software" class="page-container">
    <div class="card-grid">
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">
          1. 调用其它软件 (exe、bash等可执行程序)
          <div class="feature-card__subtitle">
            注: 请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
          </div>
        </div>
        <div class="feature-card__body">
          <a-space>
            {{ soft }}
            <a-button @click="openSoft">执行</a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const soft = ref('powershell.exe');

function openSoft() {
  ipc.invoke(ipcApiRoute.framework.openSoftware, {softName: soft.value}).then(result => {
    if (!result) {
      message.error('程序不存在');
    }
  })
}
</script>
<style lang="less" scoped>
</style>