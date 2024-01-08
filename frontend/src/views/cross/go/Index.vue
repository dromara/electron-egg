<template>
    <div id="app-cross-go">
      <div class="one-block-1">
        <span>
          1. 基础控制
        </span>
      </div>  
      <div class="one-block-2">
        <a-space>
          <a-button @click="getUrl()"> 获取地址 </a-button>
          <a-button @click="kill()"> kill </a-button>
          <a-button @click="create()"> 启动 </a-button>
          <a-button @click="info()"> 查看 </a-button>
        </a-space>
      </div>
      <div class="one-block-1">
        <span>
          2. 发送http请求
        </span>
      </div>  
      <div class="one-block-2">
        <a-space>
          <a-button @click="request(1)"> 前端发送 </a-button>
          <a-button @click="request(2)"> 主进程发送 </a-button>
        </a-space>
      </div>
      <div class="one-block-1">
        <span>
          3. 多个服务
        </span>
      </div>  
      <div class="one-block-2">
        <a-space>
          <a-button @click="create()"> 再启动一个 </a-button>
          <a-button @click="killAll()"> kill所有 </a-button>
        </a-space>
      </div>
    </div>
  </template>
  <script>
  import { ipcApiRoute } from '@/api/main';
  import { ipc } from '@/utils/ipcRenderer';
  import axios from 'axios';
  
  export default {
    data() {
      return {
        type: 1,
        serverUrl: ''
      };
    },
    methods: {
      info() {
        ipc.invoke(ipcApiRoute.crossInfo, {}).then(res => {
          console.log('res:', res);
        }) 
      },
      getUrl() {
        ipc.invoke(ipcApiRoute.getCrossUrl, {name: 'goapp'}).then(url => {
          this.serverUrl = url;
          this.$message.info(`服务地址: ${url}`);
        }) 
      },
      kill() {
        // name参数是 进程对象上的name，这里仅作为参照
        ipc.invoke(ipcApiRoute.killCrossServer, {type: 'one', name: 'goapp'})
      },
      killAll() {
        ipc.invoke(ipcApiRoute.killCrossServer, {type: 'all', name: 'goapp'})
      },
      create() {
        ipc.invoke(ipcApiRoute.createCrossServer, {service: 'go'})
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
            params: { id: '1111111'},
            timeout: 1000,
          }
          axios(cfg).then(res => {
            console.log('res:', res);
            const data = res.data.data || null;
            this.$message.info(`服务返回: ${data}`);
          })
        } else {
          ipc.invoke(ipcApiRoute.requestApi, {name: 'goapp'}).then(res => {
            console.log('res:', res);
            const data = res.data || null;
            this.$message.info(`服务返回: ${data}`);
          }) 
        }
      }    
    }
  };
  </script>
  <style lang="less" scoped>
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
  