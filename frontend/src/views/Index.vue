<template>
  <div id="app-cross-go">
    <div class="one-block-2">
      <a-space>
        <a-button @click="request(1)"> 前端发送 </a-button>
        <a-button @click="request(2)"> 主进程发送 </a-button>
      </a-space>
    </div>
  </div>
</template>
<script>
  import { ipcApiRoute } from '@/api/main';
  import { ipc } from '@/utils/ipcRenderer';
  import axios from 'axios';
  
  export default {
    getUrl() {
      ipc.invoke(ipcApiRoute.getCrossUrl, {name: 'goapp'}).then(url => {
        this.serverUrl = url;
        this.$message.info(`服务地址: ${url}`);
      }) 
    },
    request(type) {
      if (type == 1 && this.serverUrl == "") {
        this.$message.info("请先获取服务地址");
        return
      }
      if (type == 1) {
        const testApi = this.serverUrl + '/api/hello';
        const cfg = {
          method: 'get',
          url: testApi,
          params: { id: '111'},
          timeout: 1000,
        }
        axios(cfg).then(res => {
          console.log('res:', res);
          const data = res.data.data || null;
          this.$message.info(`服务返回: ${data}`);
        })
      } else {
        ipc.invoke(ipcApiRoute.requestApi, {name: 'goapp', urlPath: '/api/hello'}).then(res => {
          console.log('res:', res);
          const data = res.data || null;
          this.$message.info(`服务返回: ${data}`);
        }) 
      }
    } 
  };
</script>

<style scoped>
#app-cross-go {
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
  