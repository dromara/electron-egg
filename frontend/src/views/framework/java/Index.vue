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
import storage from 'store2'
import { ipcApiRoute } from '@/api/main';

export default {
  data() {
    return {
      server: '',
    };
  },
  mounted() {

  },  
  methods: {
    startServer () {
      this.$ipc.invoke(ipcApiRoute.startJavaServer, {}).then(r => {
        if (r.code != 0) {
          this.$message.error(r.msg);
        }
        this.$message.info('异步启动');
        storage.set('javaService', r.server);
      })
    },

    closeServer () {
      this.$ipc.invoke(ipcApiRoute.closeJavaServer, {}).then(r => {
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
      let testApi = server + '/test1/get';
      let params = {
        url: testApi,
        method: 'get',
        params: { id: '1111111'},
        timeout: 60000,
      }
      this.$http(params).then(res => {
        this.$message.info(`java服务返回: ${res}`, );
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
