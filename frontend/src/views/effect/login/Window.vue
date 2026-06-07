<template>
  <div id="effect-login-window">
    <div class="login-card">
      <div class="login-card__body">
        <a v-if="!loading" @click="login">
          <a-button type="primary" size="large" shape="round">
            登录
          </a-button>
        </a>
        <span v-else class="login-loading-text">{{ loginText }}</span>
      </div>
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
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-card {
    background-color: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 16px;
    padding: 40px 48px;
    box-shadow: 0 8px 32px rgba(7, 193, 96, 0.12);
  }

  .login-card__body {
    text-align: center;
  }

  .login-loading-text {
    color: #666666;
    font-size: 16px;
  }
}
</style>