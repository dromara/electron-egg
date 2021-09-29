<template>
  <div id="app-demo-file">
    <div class="one-block-1">
      <span>
        1. 上传文件到sm图床
      </span>
    </div>  
    <div class="one-block-2">
      <!-- dev调试时，action参数：请填写你本地完整的api地址，如：http://localhost:7068/api/v1/example/uploadFile -->
      <a-upload-dragger
        name="file"
        :multiple="true"
        :action="action_url"
        @change="handleChange"
      >
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p class="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading company data or other
          band files
        </p>
      </a-upload-dragger>
    </div>
    <div class="one-block-2">
      <a-list v-if="image_info.length !== 0" size="small" bordered :data-source="image_info">
        <a-list-item slot="renderItem" slot-scope="item" style="text-align:left;">
          {{ item.id }}.&nbsp;{{ item.imageUrlText }}:&nbsp;
          <a :href="item.url" target="_blank">{{ item.url }}</a>
        </a-list-item>
      </a-list>
    </div>
    <div class="one-block-1">
      <span>
        2. 系统原生对话框
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="messageShow('ipc')">消息提示(ipc)</a-button>
        <a-button @click="messageShowConfirm('ipc')">消息提示与确认(ipc)</a-button>
        <a-button @click="messageShow('http')">消息提示(http)</a-button>
        <a-button @click="messageShowConfirm('http')">消息提示与确认(http)</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        3. 选择保存目录
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
        4. 打开文件夹
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
    <div class="footer">
    </div>
  </div>
</template>
<script>
import { localApi } from '@/api/main'

const fileList = [
  {
    content: '【下载】目录',
    id: 'download'
  },
  {
    content: '【图片】目录',
    id: 'picture'
  },
  {
    content: '【文档】目录',
    id: 'doc'
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
      action_url: process.env.VUE_APP_API_BASE_URL + '/api/v1/example/uploadFile',
      image_info: [],
      num: 0,
			dir_path: "D:\\www\\xing\\electron-egg",
    };
  },
  methods: {
    openDirectry (id) {
      const params = {
        'id': id
      }
      localApi('openDir', params).then(res => {
        if (res.code !== 0) {
          return false
        }
      }).catch(err => {
        console.log('err:', err)
      })
    },
		handleChange(info) {
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file);
      }
      if (status === 'done') {
        // 去除list列表
        //info.fileList = [];
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
    selectDir() {
      localApi('selectFileDir', {}).then(res => {
        if (res.code !== 0) {
          return false
        }
        console.log('res.data.dir:', res.data.dir)
        this.dir_path = res.data.dir;
      }).catch(err => {
        this.$message.error('异常')
      })
    },
		messageShow(type) {
      const self = this;
      console.log('[messageShow] type:', type)
      if (type == 'http') {
        localApi('messageShow', {}).then(res => {
          if (res.code !== 0) {
            return false
          }
          console.log('res:', res)
        }).catch(err => {
          self.$message.error(err + '异常')
        })
      } else { 
        self.$ipcCallMain('example.messageShow', '').then(r => {
          self.$message.info(r);
        })
      }
    },    
    messageShowConfirm(type) {
      const self = this;
      console.log('[messageShowConfirm] type:', type)
      if (type == 'http') {
        localApi('messageShowConfirm', {}).then(res => {
          if (res.code !== 0) {
            return false
          }
          console.log('res:', res)
        }).catch(err => {
          self.$message.error(err + '异常')
        })
      } else {
        self.$ipcCallMain('example.messageShowConfirm', '').then(r => {
          self.$message.info(r);
        })
      }
    },
  }
};
</script>
<style lang="less" scoped>
#app-demo-file {
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
