<template>
    <a-config-provider :theme="theme">
        <router-view/>
    </a-config-provider>
</template>
<script setup>
import { onMounted } from 'vue';
import theme from './theme';

onMounted(() => {
  const loadingElement = document.getElementById('loadingPage');
  if (loadingElement) {
    loadingElement.remove();
  }
});
</script>
<style lang="less"></style>
