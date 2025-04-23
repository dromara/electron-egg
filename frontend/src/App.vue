<template>
  <div>
    <router-view/>
    <update-notification />
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import UpdateNotification from '@/components/common/UpdateNotification.vue';

onMounted(() => {
  const loadingElement = document.getElementById('loadingPage');
  if (loadingElement) {
    loadingElement.remove();
  }
});
</script>
<style lang="less"></style>
