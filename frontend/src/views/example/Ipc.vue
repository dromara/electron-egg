<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      demo3 渲染进程与主进程IPC通信
    </h3>
    <a-list bordered>
      <!-- <a-button @click="helloHandle">打招呼</a-button> -->
      <a-input-search v-model="content" @search="helloHandle">
        <a-button slot="enterButton">
          send
        </a-button>
      </a-input-search>
    </a-list>
  </div>
</template>
<script>
export default {
  data() {
    return {
      content: 'hello',
      reply: ''
    }
  },
  methods: {
    helloHandle(value) {
      const self = this;
      this.$callMain('example.hello', value).then(r => {
        self.$message.info(r);
      })
    }
  }
}
</script>
<style></style>
