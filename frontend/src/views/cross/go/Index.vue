<template>
    <div id="app-cross-go">
      <div class="one-block-1">
        <span>
          1. go服务
        </span>
      </div>  
      <div class="one-block-2">
        <a-space>
          <a-button @click="getUrl()"> 获取地址 </a-button>
          <a-button @click="kill('go')"> kill </a-button>
          <a-button @click="run('go')"> 启动 </a-button>
          <a-button @click="test()"> test </a-button>
        </a-space>
      </div>
      <div class="one-block-1">
        <span>
          2. 向go服务发送http请求
        </span>
      </div>  
      <div class="one-block-2">
        <a-space>
          <a-button @click="request(1)"> 前端请求 </a-button>
          <a-button @click="request(2)"> 主进程请求 </a-button>
        </a-space>
      </div>
      <div class="one-block-1">
        <span>
          3. 多个go服务
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
      test() {
        ipc.invoke(ipcApiRoute.crossTest, {}).then(res => {
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
        ipc.invoke(ipcApiRoute.killCrossServer, {name: 'goapp'})
      },
      create() {
        ipc.invoke(ipcApiRoute.createCrossServer, {name: 'goapp'})
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
  