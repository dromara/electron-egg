<template>
  <div id="app-base-httpserver">
    <div class="one-block-1">
      <span>
        1. 内置http server服务
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
        2. 发送http请求
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
import storage from 'store2'
import { ipcApiRoute, requestHttp } from '@/api/main'

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
      const self = this;
      this.$ipcCall(ipcApiRoute.checkHttpServer, {}).then(r => {
        if (r.enable) {
          self.currentStatus = '开启';
          self.servicAddress = r.server;
          storage.set('httpServiceConfig', r);
        }
      })
    },
    sendRequest (id) {
      if (this.currentStatus == '关闭') {
        this.$message.error('http服务未开启');
        return;
      }

      const params = {
        id: id
      }
      requestHttp(ipcApiRoute.doHttpRequest, params).then(res => {
        //console.log('res:', res)
      }) 
    },  
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
