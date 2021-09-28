<template>
  <div id="app-other">
    <div class="one-block-1">
      <span>
        待开发...
      </span>
    </div>  
    <div class="one-block-2">
      e
    </div>
  </div>
</template>
<script>
import { localApi } from '@/api/main'

export default {
  data() {
    return {};
  },
  methods: {
    test () {
      const params = {}
      localApi('openDir', params).then(res => {
        if (res.code !== 0) {
          return false
        }
      }).catch(err => {
        console.log('err:', err)
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-other {
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
