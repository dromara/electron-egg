<template>
  <div id="app-updater">
    <div class="one-block-1">
      <span>
        1. 自动更新
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="checkForUpdater()">检查更新</a-button>
        <a-button @click="download()">下载并安装</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        2. 下载进度
      </span>
    </div>  
    <div class="one-block-2">
      <a-progress :percent="percentNumber" status="active" />
      <a-space>
        {{ progress }}
      </a-space>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute, specialIpcRoute } from '@/api';
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const status = ref(0);
const progress = ref('');
const percentNumber = ref(0);

onMounted(() => {
  init()
})

function init() {
  ipc.removeAllListeners(specialIpcRoute.appUpdater);
  ipc.on(specialIpcRoute.appUpdater, (event: any, result: any) => {
    result = JSON.parse(result);
    status.value = result.status;
    if (result.status == 3) {
      progress.value = result.desc;
      percentNumber.value = result.percentNumber;
    } else {
      message.info(result.desc);
    }
  })
}

function checkForUpdater () {
  ipc.invoke(ipcApiRoute.framework.checkForUpdater).then((res: any) => {
    console.log(res);
  })
}

function download () {
  if (status.value !== 1) {
    message.info('没有可用版本');
    return
  }
  ipc.invoke(ipcApiRoute.framework.downloadApp).then((res: any) => {
    console.log(res);
  })
}
</script>
<style lang="less" scoped>
#app-updater {
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
  