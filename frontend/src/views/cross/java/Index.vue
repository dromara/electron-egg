<template>
  <div id="app-cross-java">
    <div class="one-block-1">
      <span>
        1. 基础控制
      </span>
    </div>  
    <div class="one-block-2">
      <el-space>
        <el-button @click="create()"> 启动 </el-button>
        <el-button @click="getUrl()"> 获取地址 </el-button>
        <el-button @click="kill()"> kill </el-button>
        <el-button @click="info()"> 查看 </el-button>
      </el-space>
    </div>
    <div class="one-block-1">
      <span>
        2. 发送http请求
      </span>
    </div>  
    <div class="one-block-2">
      <el-space>
        <el-button @click="request(1)"> 前端发送 </el-button>
        <el-button @click="request(2)"> 主进程发送 </el-button>
      </el-space>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import axios from 'axios';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const serverUrl = ref('');

function info() {
  ipc.invoke(ipcApiRoute.cross.crossInfo, {}).then(res => {
    console.log('res:', res);
  }) 
}

function getUrl() {
  ipc.invoke(ipcApiRoute.cross.getCrossUrl, {name: 'javaapp'}).then(url => {
    serverUrl.value = url;
    ElMessage.info(`服务地址: ${url}`);
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
    ElMessage.info("请先获取服务地址");
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
      ElMessage.info(`服务返回: ${data}`);
    })
  } else {
    ipc.invoke(ipcApiRoute.cross.requestApi, {name: 'javaapp', urlPath: '/test1/get', params: { id: '1111111'}}).then(res => {
      console.log('res:', res);
      const data = res || null;
      ElMessage.info(`服务返回: ${data}`);
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
  