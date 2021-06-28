<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      demo4 快捷键
    </h3>
    <a-row :gutter="[16,16]">
      <a-col :span="24">
        窗口最小化
        <a-form @submit="handleSubmit" :form="form">
          <a-form-item>
            <hot-key-input
              style="width: 100%;"
              :hotkey.sync="hotKeyObj.keys"
              :verify="handleHotkeyVerify"
              :max="1"
              type="lowser"
              :reset="true"
              :shake="false"
              :range="null"
              placeholder="快捷键">
            </hot-key-input>
          </a-form-item>
          <a-form-item
            :wrapperCol="{ span: 24 }"
            style="text-align: center"
          >
            <a-button htmlType="submit" type="primary">保存</a-button>
          </a-form-item>
        </a-form>  
      </a-col>
    </a-row>
  </div>
</template>
<script>
import { localApi } from '@/api/main'

export default {
  components: {},
  data() {
    return {
      form: this.$form.createForm(this),
      cmd: '',
      hotKeyObj: {
        tab: 'save',
        keys: ['Ctrl+k']
      },
    };
  },
  methods: {
    handleHotkeyVerify(hotkey) {
      console.log('组合键：', hotkey)
      return true;
    },
    handleSubmit (e) {
      e.preventDefault()
      console.log('submit 验证：', this.hotKeyObj)
      const shortcutStr = this.hotKeyObj.keys[0];
      const params = {
        id: 'mini_window',
        name: '窗口最小化',
        cmd: shortcutStr
      }
      localApi('setShortcut', params).then(res => {
        if (res.code !== 0) {
          // this.$message.info('error')
          return false
        }
        this.$message.info('设置成功，请按【设置的快捷键】查看效果')
      }).catch(err => {
        console.log('err:', err)
      })

      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    }
  }
};
</script>
<style></style>
