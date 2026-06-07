<template>
  <div id="os-file-pic" class="page-container">
    <div class="card-grid">
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">1. 加载本机图片</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="selectPic(0)">选择图片</a-button>
          </a-space>
          <p></p>
          <a-image
            :width="500"
            :src=picPath
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref } from 'vue';

const picPath = ref('https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png');

function selectPic() {
  ipc.invoke(ipcApiRoute.os.selectPic).then(r => {
    picPath.value = r;
  })
}
</script>
<style lang="less" scoped>
</style>