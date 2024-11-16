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
<script>
import { ipcApiRoute } from '@/api/main';
import { ipc } from '@/utils/ipcRenderer';
  
export default {
  data() {
    return {
      loading: false, 
      loginText: '正在登陆......'
    };
  },
  methods: {
    login() {
      this.loading = true;
      setTimeout(() => {
        this.$router.push({ name: 'Framework', params: {}});
        ipc.invoke(ipcApiRoute.restoreWindow, {width: 980, height: 650}).then(r => {      
          // 
        })
      }, 2000);
    }
  }
};
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
  