<template>
  <div id="app-os-file" class="page-container">
    <div class="card-grid">
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">1. 系统原生对话框</div>
        <div class="feature-card__body">
          <a-space>
            <a-button @click="messageShow()">消息提示(ipc)</a-button>
            <a-button @click="messageShowConfirm()">消息提示与确认(ipc)</a-button>
          </a-space>
        </div>
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">2. 选择保存目录</div>
        <div class="feature-card__body">
          <a-row>
            <a-col :span="12">
              <a-input v-model="dir_path" :value="dir_path" addon-before="保存目录" />
            </a-col>
            <a-col :span="12">
              <a-button @click="selectDir">修改目录</a-button>
            </a-col>
          </a-row>
        </div>
      </div>
      <div class="feature-card feature-card--full">
        <div class="feature-card__title">3. 打开文件夹</div>
        <div class="feature-card__body">
          <a-list :grid="{ gutter: 16, column: 4 }" :data-source="fileList">
            <template #renderItem="{ item }">
              <a-list-item @click="openDirectry(item.id)">
                <a-card :title="item.content">
                  <a-button type="link">打开</a-button>
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';

import { ref } from 'vue';
import { message } from 'ant-design-vue';

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
    message.info(r);
  })
}

function messageShow() {
  ipc.invoke(ipcApiRoute.os.messageShow).then(r => {
    message.info(r);
  })
}

function messageShowConfirm() {
  ipc.invoke(ipcApiRoute.os.messageShowConfirm).then(r => {
    message.info(r);
  })
}
</script>
<style lang="less" scoped>
</style>