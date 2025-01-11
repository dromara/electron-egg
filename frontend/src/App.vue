<template>
    <router-view/>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const loadingElement = document.getElementById('loadingPage');
  if (loadingElement) {
    (loadingElement as HTMLElement).remove();
  }
});
</script>
<style lang="less"></style>
