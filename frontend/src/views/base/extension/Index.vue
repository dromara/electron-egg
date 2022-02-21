<template>
  <div id="app-demo-extension">
    <div class="one-block-1">
      <span>
        1. 上传扩展程序（crx文件格式）
      </span>
    </div>
    <div class="one-block-2">
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
        </p>
      </a-upload-dragger>
    </div>
    <div class="one-block-1">
      2. chrome扩展商店（crx下载）
    </div>  
    <div class="one-block-2">
      <a-space>
        极简插件：https://chrome.zzzmh.cn/
      </a-space>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      action_url: process.env.VUE_APP_API_BASE_URL + '/api/v1/example/uploadExtension',
    };
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
    },
		handleChange(info) {
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file);
      }
      if (status === 'done') {
        const uploadRes = info.file.response;
        console.log('uploadRes:', uploadRes)
        // if (uploadRes.code !== 'success') {
        //   this.$message.error(`file upload failed ${uploadRes.code} .`);
        //   return false;
        // }
        // this.$message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    },
  }
};
</script>
<style lang="less" scoped>
#app-demo-extension {
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
