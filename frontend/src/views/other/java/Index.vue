<template>
  <div id="app-other">
    <div class="one-block-1">
      <span>
        1. 请求java后台接口
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="exec(1111111)"> 点击 </a-button>
      </a-space>
    </div>
  </div>
</template>
<script>
import { requestJava } from '@/api/main'

export default {
  data() {
    return {};
  },
  methods: {
    exec (id) {
      requestJava('/test1/get', id).then(res => {
        console.log('res:', res)
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-other {
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
