<template>
  <div id="os-file-pic">
    <div class="one-block-1">
      <span>
          1. 加载本机图片
      </span>
    </div>  
    <div class="one-block-2">
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
#os-file-pic {
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
  