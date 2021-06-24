<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      demo4 快捷键
    </h3>
    <a-row :gutter="[16,16]">
      <a-col :span="12">
        显示窗口
        <!-- <HotkeyInput
          :hotkey.sync="hotKeyObj.keys"
          :verify="handleHotkeyVerify"
          placeholder="请按需要绑定的按键，支持组合按键"
        /> -->
        <a-input-search
          style="width: 272px;"
          v-model="cmd"
          @search="handleSetting"
          placeholder="快捷键">
          <a-button slot="enterButton">
            保存
          </a-button>
        </a-input-search>
      </a-col>
      <a-col :span="12">
        隐藏窗口
        <a-input-search
          style="width: 272px;"
          v-model="cmd"
          @search="handleSetting"
          placeholder="快捷键">
          <a-button slot="enterButton">
            保存
          </a-button>
        </a-input-search>
      </a-col>
    </a-row>  
    <a-row :gutter="[16,16]">
      <a-col :span="12">
        窗口最小化
        <a-input-search
          style="width: 272px;"
          v-model="cmd"
          @search="handleSetting"
          placeholder="快捷键">
          <a-button slot="enterButton">
            保存
          </a-button>
        </a-input-search>
      </a-col>
      <a-col :span="12">
        窗口还原
        <a-input-search
          style="width: 272px;"
          v-model="cmd"
          @search="handleSetting"
          placeholder="快捷键">
          <a-button slot="enterButton">
            保存
          </a-button>
        </a-input-search>
      </a-col>
    </a-row>
  </div>
</template>
<script>
// import VHotkey from "v-hotkey";
// import { openDir } from '@/api/main'

export default {
  components: {},
  data() {
    return {
      cmd: '',
      hotKeyObj: {
        tab: 'save',
        // keys: undefined
        keys: ["Ctrl+A", "Alt+D"]
      },
    };
  },
  methods: {
    handleSetting (value) {
      console.log('cmd:', value)
      //this.cmd = ''
    },
    handleHotkeyVerify(hotkey) {
      console.log('验证：', hotkey, this.hotKeyObj)
      return true;
    },
  }
};
</script>
<style></style>
