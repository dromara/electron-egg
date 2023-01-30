<template>
  <div id="app-base-file">
    <div class="one-block-1">
      <span>
        1. 系统原生对话框
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="messageShow('ipc')">消息提示(ipc)</a-button>
        <a-button @click="messageShowConfirm('ipc')">消息提示与确认(ipc)</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        2. 选择保存目录
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="12">
          <a-input v-model="dir_path" :value="dir_path" addon-before="保存目录" />
        </a-col>
        <a-col :span="12">
          <a-button @click="selectDir">
            修改目录
          </a-button>
        </a-col>
      </a-row>
    </div>      
    <div class="one-block-1">
      <span>
        3. 打开文件夹
      </span>
    </div>  
    <div class="one-block-2">
      <a-list :grid="{ gutter: 16, column: 4 }" :data-source="file_list">
        <a-list-item slot="renderItem" slot-scope="item" @click="openDirectry(item.id)">
          <a-card :title="item.content">
            <a-button type="link">
              打开
            </a-button>
          </a-card>
        </a-list-item>
      </a-list>
    </div>
    <div class="one-block-1">
      <span>
        4. 上传文件到图床
      </span>
    </div>  
    <div class="one-block-2">
      <a-upload-dragger
        name="file"
        :multiple="true"
        :action="action_url"
        @change="handleFileChange"
      >
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">
          点击 或 拖拽文件到这里
        </p>
        <p class="ant-upload-hint">
          注意：请使用您自己的图床token
        </p>
      </a-upload-dragger>
    </div>
    <div class="footer">
    </div>
  </div>
</template>
<script>
import storage from 'store2'
import { ipcApiRoute } from '@/api/main'

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

export default {
  data() {
    return {
      file_list: fileList,
      action_url: '',
      image_info: [],
      num: 0,
      servicAddress: '',
			dir_path: "D:\\www\\ee",
    };
  },
  mounted () {
    this.getHost();
  },
  methods: {
    getHost () {
      const self = this;
      this.$ipcInvoke(ipcApiRoute.checkHttpServer, {}).then(r => {
        if (r.enable) {
          self.servicAddress = r.server;
          storage.set('httpServiceConfig', r);

          // url转换
          const host = r.server || 'http://127.0.0.1:7071';
          let uri = ipcApiRoute.uploadFile;
          let url = uri.split('.').join('/');
          this.action_url = host + '/' + url;
        }
      })
    },
    openDirectry (id) {
      this.$ipcInvoke(ipcApiRoute.openDirectory, {id: id}).then(res => {
        //console.log('res:', res)
      })      
    },
    selectDir() {
      const self = this;
      self.$ipcInvoke(ipcApiRoute.selectFolder, '').then(r => {
        self.dir_path = r;
        self.$message.info(r);
      })      
    },
		messageShow(type) {
      const self = this;
      console.log('[messageShow] type:', type)
      this.$ipcInvoke(ipcApiRoute.messageShow, '').then(r => {
        self.$message.info(r);
      })
    },    
    messageShowConfirm(type) {
      const self = this;
      console.log('[messageShowConfirm] type:', type)
      this.$ipcInvoke(ipcApiRoute.messageShowConfirm, '').then(r => {
        self.$message.info(r);
      })
    },
    handleFileChange(info) {
      console.log('handleFileChange-----');
      if (this.action_url == '') {
        this.$message.error('http服务未开启');
        return;
      }
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file);
      }
      if (status === 'done') {
        const uploadRes = info.file.response;
        console.log('uploadRes:', uploadRes)
        if (uploadRes.code !== 'success') {
          this.$message.error(`file upload failed ${uploadRes.code} .`);
          return false;
        }
        this.num++;
        const picInfo = uploadRes.data;
        picInfo.id = this.num;
        picInfo.imageUrlText = 'image url';
        this.image_info.push(picInfo);
        this.$message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    },
  }
};
</script>
<style lang="less" scoped>
#app-base-file {
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
}
</style>
