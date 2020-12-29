<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      demo2 上传文件到sm图床实现
    </h3>
    <!-- dev调试时，action参数：请填写你本地完整的api地址，如：http://localhost:7068/api/v1/example/uploadFile -->
    <a-upload-dragger
        name="file"
        :multiple="true"
        action="http://localhost:7068/api/v1/example/uploadFile"
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
    <!-- <a-card hoverable style="width: 240px">
      <img
        slot="cover"
        alt="example"
        src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
      />

    </a-card> -->
    <p/>
    <a-list v-if="image_info.length !== 0" size="small" bordered :data-source="image_info">
      <a-list-item style="text-align:left;" slot="renderItem" slot-scope="item">
        {{ item.id }}.&nbsp;{{ item.imageUrlText }}:&nbsp;
        <a :href="item.url" target="_blank">{{ item.url }}</a>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
//import { uploadFile } from '@/api/main'

export default {
  data() {
    return {
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
<style></style>
