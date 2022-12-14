<template>
  <div id="app-other">
    <div class="one-block-1">
      <span>
        请求java后台接口， 本示例需要修改如下： <br/>
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="startServer()"> 启动java项目 </a-button>
        <a-button @click="sendRequest()"> 测试接口 </a-button>
        <a-button @click="closeServer()"> 关闭java项目 </a-button>
      </a-space>
    </div>
    <div class="one-block-2">
      <span>
        1. 修改 electron/config/config.default.js 中 config.server.enable = true <br/>
        2. 官方下载 jre 并解压到： build/extraResources <br/>
        3. 编译 spring boot 可执行jar到： build/extraResources <br/>

        下载我准备好的 jre 和 app.jar 看效果： <br/>
        链接: https://pan.baidu.com/s/1QLtFC76uD6_dm01S6xaUSA  密码: cqpf   <br/>
        注意： 请根据你的操作系统，选择正确的jre进行下载 <br/>

        同时可以去oracle官方下载其他版本的jre： <br/>

        https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html
        <br/>

        <br/>
        同时，你可以将18080端口先占用，后启动ee程序，观察请求的端口

      </span>
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
      this.$ipcInvoke(ipcApiRoute.startJavaServer, {}).then(r => {
        if (r.code != 0) {
          this.$message.error(r.msg);
        }
        this.$message.info('启动成功');
        storage.set('javaService', r.server);
      })
    },

    closeServer () {
      this.$ipcInvoke(ipcApiRoute.closeJavaServer, {}).then(r => {
        if (r.code != 0) {
          this.$message.error(r.msg);
        }
        this.$message.info('服务已关闭');
        storage.remove('javaService:');
      })
    },

    sendRequest () {
      const server = storage.get('javaService') || '';
      if (server == '') {
        this.$message.error('服务未开启');
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
        console.log('res:', res);
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
