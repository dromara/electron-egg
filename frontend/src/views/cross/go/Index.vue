<template>
    <div id="app-cross-go">
      <div class="one-block-1">
        <span>
          1. 向go服务发送http请求
        </span>
      </div>  
      <div class="one-block-2">
        <a-space>
          <a-button @click="exec(1)"> 点击 </a-button>
        </a-space>
      </div>
    </div>
  </template>
  <script>
  import { ipcApiRoute } from '@/api/main';
  import { ipc } from '@/utils/ipcRenderer';
  
  export default {
    data() {
      return {
        type: 1,
      };
    },
    methods: {
      exec(id) {
        const params = {
          id: id
        }
        ipc.invoke(ipcApiRoute.requestGoApi, params).then(res => {
          console.log('res:', res);
          const data = res.data || null;
          this.$message.info(`go服务返回: ${data}`, );
        }) 
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
  