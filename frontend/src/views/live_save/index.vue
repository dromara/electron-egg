<template>
  <div class="live-save-container">
    <h1>你好</h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

onMounted(() => {
  console.log('Live_save页面已加载');
});
</script>

<style lang="less" scoped>
.live-save-container {
  padding: 20px;
}
</style>
