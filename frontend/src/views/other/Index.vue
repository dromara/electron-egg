<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      待开发...
    </h3>
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
<style></style>
