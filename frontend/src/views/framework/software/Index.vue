<template>
  <div id="app-software">
    <div class="one-block-1">
      <span>
        1. 调用其它软件 (exe、bash等可执行程序)
      </span>
      <p/>
      <span class="sub-content">
        注: 请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        {{ soft }}
        <a-button @click="openSoft">执行</a-button>
      </a-space>
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
#app-software {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    .sub-content {
      font-size: 14px;
    }
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
