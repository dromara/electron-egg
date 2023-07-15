<template>
  <div id="app-other">
    <div class="one-block-1">
      <span>
        请求java服务接口
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="startServer()"> 启动java项目 </a-button>
        <a-button @click="sendRequest()"> 测试接口 </a-button>
        <a-button @click="closeServer()"> 关闭java项目 </a-button>
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
      server: '',
    };
  }, 
  methods: {
    startServer () {
      ipc.invoke(ipcApiRoute.startJavaServer, {}).then(r => {
        if (r.code != 0) {
          this.$message.error(r.msg);
        } else {
          this.$message.info('异步启动');
          storage.set('javaService', r.server);
        }
      })
    },

    closeServer () {
      ipc.invoke(ipcApiRoute.closeJavaServer, {}).then(r => {
        if (r.code != 0) {
          this.$message.error(r.msg);
        }
        this.$message.info('异步关闭');
        storage.remove('javaService');
      })
    },

    sendRequest () {
      const server = storage.get('javaService') || '';
      if (server == '') {
        this.$message.error('服务未开启 或 正在启动中');
        return
      }
      const testApi = server + '/test1/get';
      const cfg = {
        method: 'get',
        url: testApi,
        params: { id: '1111111'},
        timeout: 60000,
      }
      axios(cfg).then(res => {
        const data = res.data || null;
        this.$message.info(`java服务返回: ${data}`, );
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-other {
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
