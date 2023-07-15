<template>
  <div id="app-base-httpserver">
    <div class="one-block-1">
      <span>
        1. 使用http与主进程通信
      </span>
    </div>
    <div class="one-block-2">
      <a-space>
        <p>* 状态：{{ currentStatus }}</p>
      </a-space>
      <p>* 地址：{{ servicAddress }}</p>
    </div>
    <div class="one-block-1">
      <span>
        2. 发送请求
      </span>
    </div>    
    <div class="one-block-2">
      <a-space>
        <a-button @click="sendRequest('pictures')"> 打开【我的图片】 </a-button>
      </a-space>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main';
import { ipc } from '@/utils/ipcRenderer';
import axios from 'axios';
import storage from 'store2';

export default {
  data() {
    return {
      currentStatus: '关闭',
      servicAddress: '无'
    };
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      ipc.invoke(ipcApiRoute.checkHttpServer, {}).then(r => {
        if (r.enable) {
          this.currentStatus = '开启';
          this.servicAddress = r.server;
          storage.set('httpServiceConfig', r);
        }
      })
    },
    sendRequest (id) {
      if (this.currentStatus == '关闭') {
        this.$message.error('http服务未开启');
        return;
      }

      this.requestHttp(ipcApiRoute.doHttpRequest, {id}).then(res => {
        //console.log('res:', res)
      })
    },

    /**
     * Accessing built-in HTTP services
     */
    requestHttp(uri, parameter) {
      // URL conversion
      const config = storage.get('httpServiceConfig');
      const host = config.server || 'http://localhost:7071';
      let url = uri.split('.').join('/');
      url = host + '/' + url;
      console.log('url:', url);
      return axios({
        url: url,
        method: 'post', 
        data: parameter,
        timeout: 60000,
      })
    }
  }
};
</script>
<style lang="less" scoped>
#app-base-httpserver {
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
