<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      渲染进程与主进程IPC通信Demo
    </h3>
    <a-list bordered>
      <a-button @click="choiceFolder">选择本地文件夹</a-button>
      <div>{{ choiceFolderInfo }}</div>
      <a-button @click="choiceFile">选择本地文件</a-button>
      <div>{{ choiceFileInfo }}</div>

      <a-button @click="getMyLuckNum">摇一个幸运数字</a-button>
      <div>{{ luckNum }}</div>
    </a-list>
  </div>
</template>
<script>
const getMyLuckNum = require('./luckNum')
export default {
  data() {
    return {
      choiceFolderInfo: '',
      choiceFileInfo: '',
      luckNum: ''
    }
  },
  methods: {
    choiceFolder() {
      this.$callMain('system.choiceFolder', '我要选择系统的文件夹').then(r => {
        this.choiceFolderInfo = JSON.stringify(r)
      })
    },
    choiceFile() {
      this.$callMain('system.choiceFile', '我只选择excel文件', ['xlsx', 'xls']).then(r => {
        this.choiceFileInfo = JSON.stringify(r)
      })
    },
    getMyLuckNum() {
      // 在外部js中调用主进程函数
      getMyLuckNum(this, 'CNNN').then(r => this.luckNum = r)
    }
  }
}
</script>
<style></style>
