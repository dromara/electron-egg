<template>
  <div id="app-cross-java">
    <div class="one-block-1">
      <span>
        1. 基础控制
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="create()"> 启动 </a-button>
        <a-button @click="getUrl()"> 获取地址 </a-button>
        <a-button @click="kill()"> kill </a-button>
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
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import axios from 'axios';
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const serverUrl = ref('');

function info() {
  ipc.invoke(ipcApiRoute.cross.crossInfo, {}).then(res => {
    console.log('res:', res);
  }) 
}

function getUrl() {
  ipc.invoke(ipcApiRoute.cross.getCrossUrl, {name: 'javaapp'}).then(url => {
    serverUrl.value = url;
    message.info(`服务地址: ${url}`);
  }) 
}

function kill() {
  // name参数是 进程对象上的name，这里仅作为参照
  ipc.invoke(ipcApiRoute.cross.killCrossServer, {type: 'one', name: 'javaapp'})
}

function create() {
  ipc.invoke(ipcApiRoute.cross.createCrossServer, { program: 'java' })
}

function request(type) {
  if (type == 1 && serverUrl.value == "") {
    message.info("请先获取服务地址");
    return
  }

  if (type == 1) {
    const testApi = serverUrl.value + '/test1/get';
    const cfg = {
      method: 'get',
      url: testApi,
      params: { id: '1111111'},
      timeout: 1000,
    }
    axios(cfg).then(res => {
      console.log('res:', res);
      const data = res.data || null;
      message.info(`服务返回: ${data}`);
    })
  } else {
    ipc.invoke(ipcApiRoute.cross.requestApi, {name: 'javaapp', urlPath: '/test1/get', params: { id: '1111111'}}).then(res => {
      console.log('res:', res);
      const data = res || null;
      message.info(`服务返回: ${data}`);
    }) 
  }
}  
</script>
<style lang="less" scoped>
#app-cross-java {
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
  