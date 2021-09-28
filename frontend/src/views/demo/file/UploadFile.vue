<template>
  <div id="app-demo-file-upload">
    <div class="one-block-1">
      <span>
        上传文件到sm图床
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
  </div>
</template>
<script>
export default {
  data() {
    return {
      action_url: process.env.VUE_APP_API_BASE_URL + '/api/v1/example/uploadFile',
      image_info: [],
      num: 0
    };
  },
  methods: {
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
    }
  }
};
</script>
<style lang="less" scoped>
#app-demo-file-upload {
  padding: 0px 10px;
  text-align: center;
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
