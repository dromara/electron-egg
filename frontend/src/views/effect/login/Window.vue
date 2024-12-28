<template>
  <div id="effect-login-window">
    <div class="block-1">
      <a v-if="!loading" @click="login">
        <a-button type="primary">
          登录
        </a-button>
      </a>
      <span v-else>{{ loginText }}</span>
    </div>  
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const loginText = ref('正在登陆......');
  
const login = () => {
  loading.value = true;
  setTimeout(() => {
    router.push({ name: 'Framework'});
    ipc.invoke(ipcApiRoute.effect.restoreWindow, {width: 980, height: 650})
  }, 2000);
}
</script>
<style lang="less" scoped>
#effect-login-window {
  width: 100%;
  min-height: 100%;
  background: #f0f2f5 url(/src/assets/login.png) no-repeat 50%;
  display: flex;
  .block-1 {
    font-size: 16px;
    align-items: center;
    margin: auto;
    display: inline-block;
  }
}
</style>
  