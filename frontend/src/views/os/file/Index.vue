<template>
  <div id="app-os-file">
    <div class="one-block-1">
      <span>
        1. 系统原生对话框
      </span>
    </div>  
    <div class="one-block-2">
      <el-space>
        <el-button @click="messageShow()">消息提示(ipc)</el-button>
        <el-button @click="messageShowConfirm()">消息提示与确认(ipc)</el-button>
      </el-space>
    </div>
    <div class="one-block-1">
      <span>
        2. 选择保存目录
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="12">
        <el-col :span="12">
          <el-input v-model="dir_path" placeholder="保存目录">
            <template #prepend>保存目录</template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-button @click="selectDir">
            修改目录
          </el-button>
        </el-col>
      </el-row>
    </div>      
    <div class="one-block-1">
      <span>
        3. 打开文件夹
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="16">
        <el-col :span="6" v-for="item in fileList" :key="item.id">
          <el-card :title="item.content" @click="openDirectry(item.id)">
            <template #header>
              <div class="card-header">
                {{ item.content }}
              </div>
            </template>
            <el-button type="primary" text>打开</el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div class="footer">
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';

import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const fileList = [
  {
    content: '【下载】目录',
    id: 'downloads'
  },
  {
    content: '【图片】目录',
    id: 'pictures'
  },
  {
    content: '【文档】目录',
    id: 'documents'
  },
  {
    content: '【音乐】目录',
    id: 'music'
  }
];

const dir_path = ref('D:\\www\\ee');

function openDirectry (id) {
  ipc.invoke(ipcApiRoute.os.openDirectory, {id: id})     
}

function selectDir() {
  ipc.invoke(ipcApiRoute.os.selectFolder).then(r => {
    dir_path.value = r;
    ElMessage.info(r);
  })      
}

function messageShow() {
  ipc.invoke(ipcApiRoute.os.messageShow).then(r => {
    ElMessage.info(r);
  })
}

function messageShowConfirm() {
  ipc.invoke(ipcApiRoute.os.messageShowConfirm).then(r => {
    ElMessage.info(r);
  })
}
</script>
<style lang="less" scoped>
#app-os-file {
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
  .footer {
    padding-top: 10px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
