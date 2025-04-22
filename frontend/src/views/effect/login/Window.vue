<template>
  <div id="effect-login-window">
    <div class="login-container">
      <div class="login-wrapper">
        <div class="logo-area">
          <img src="/src/assets/logo.png" alt="Logo" class="logo" />
          <!-- <h2 class="system-name">抖音直播工具系统</h2> -->
        </div>

        <div class="login-form">
          <h3 class="login-title">系统登录</h3>

          <div class="device-info" v-if="deviceFingerprint">
            <span class="label">设备标识:</span>
            <span class="value">{{ deviceFingerprint }}</span>
          </div>

          <div class="input-container">
            <el-input
              v-model="activationCode"
              placeholder="请输入激活码"
              clearable
              :disabled="loading"
              @keyup.enter="handleKeyPress"
            ></el-input>
          </div>

          <div class="button-container">
            <a v-if="!loading" @click="login">
              <el-button type="primary" :disabled="!activationCode">
                登录
              </el-button>
            </a>
            <div v-else class="loading-text">{{ loginText }}</div>
          </div>

          <div class="error-message" v-if="errorMsg">
            {{ errorMsg }}
          </div>
        </div>
      </div>

      <div class="footer" @click="handleFooterClick">
        <p>Copyright © 2025 抖音直播工具v1.3</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const loginText = ref('正在登录...');
const activationCode = ref('');
const errorMsg = ref('');
const deviceFingerprint = ref('');
const showCheatButton = ref(false);

// 作弊模式相关
const cheatCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
let currentCheatIndex = 0;
let cheatMode = false;
let footerClickCount = 0;
let cheatActivated = false;

// 监听按键事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    login();
  }
};

// 处理footer点击
const handleFooterClick = () => {
  if (cheatActivated) {
    footerClickCount++;
    if (footerClickCount >= 5) {
      // 点击5次后直接进入主页面
      router.push({ name: 'Framework' });
      ipc.invoke(ipcApiRoute.effect.restoreWindow, {width: 980, height: 650});
    }
  }
};

// 处理作弊登录
const handleCheatLogin = () => {
  router.push({ name: 'Framework' });
  ipc.invoke(ipcApiRoute.effect.restoreWindow, {width: 980, height: 650});
};

// 获取设备指纹
const getDeviceFingerprint = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.effect.generateDeviceFingerprint);
    if (result && result.status === 'success') {
      deviceFingerprint.value = result.data;
    } else {
      console.error('获取设备指纹失败:', result?.message);
    }
  } catch (error) {
    console.error('获取设备指纹出错:', error);
  }
};

// 在组件加载时检查是否已激活
onMounted(async () => {
  // 获取设备指纹
  await getDeviceFingerprint();

  try {
    // 调用后端检查是否已存在激活信息
    const result = await ipc.invoke(ipcApiRoute.effect.checkActivation);
    if (result && result.status === 'success') {
      // 如果已激活，自动进行登录
      login();
    }
  } catch (error) {
    console.error('检查激活信息出错:', error);
  }
});

const login = async () => {
  if (loading.value) return;

  // 检查是否输入了特殊代码
  if (activationCode.value === 'tutu0903') {
    // 显示开发者提示
    ElMessage({
      message: '开发者你好',
      type: 'success',
      duration: 2000
    });

    // 启动作弊模式监听
    cheatMode = true;
    currentCheatIndex = 0;

    // 监听键盘事件
    document.addEventListener('keydown', handleDevKeySequence);

    return;
  }

  errorMsg.value = '';
  loading.value = true;
  loginText.value = '正在验证...';

  try {
    // 调用后端验证激活码
    const result = await ipc.invoke(ipcApiRoute.effect.verifyActivation, {
      activationCode: activationCode.value
    });

    if (result && result.status === 'success') {
      // 验证成功
      loginText.value = '验证成功，正在登录...';

      // 使用原有的登录逻辑进行跳转
      setTimeout(() => {
        router.push({ name: 'Framework'});
        ipc.invoke(ipcApiRoute.effect.restoreWindow, {width: 1280, height: 720})
      }, 2000);
    } else {
      // 验证失败
      loading.value = false;
      errorMsg.value = result?.message || '激活码验证失败';
    }
  } catch (error) {
    loading.value = false;
    errorMsg.value = '验证过程中出现错误';
    console.error('激活验证出错:', error);
  }
}

// 添加新的函数来处理开发者按键序列
const handleDevKeySequence = (event) => {
  if (!cheatMode) return;

  if (event.key === cheatCode[currentCheatIndex]) {
    currentCheatIndex++;
    if (currentCheatIndex === cheatCode.length) {
      // 当完成按键序列后，等待回车键
      ElMessage({
        message: '作弊模式已准备就绪，按回车键确认',
        type: 'success',
        duration: 2000
      });
    }
  } else if (event.key === 'Enter' && currentCheatIndex === cheatCode.length) {
    // 按下回车键后激活作弊模式
    cheatActivated = true;
    footerClickCount = 0;
    document.removeEventListener('keydown', handleDevKeySequence);
    cheatMode = false;
    ElMessage({
      message: '作弊模式已激活',
      type: 'success',
      duration: 2000
    });
  } else {
    // 按键错误，重置序列
    currentCheatIndex = 0;
  }
};

// 在组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleDevKeySequence);
});
</script>
<style lang="less" scoped>
#effect-login-window {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to right, #1a237e, #4a148c);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .login-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
  }

  .logo-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;

    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: 15px;
    }

    .system-name {
      color: white;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .login-form {
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;

    .login-title {
      font-size: 20px;
      color: #303133;
      margin-bottom: 20px;
      font-weight: 500;
      align-self: center;
    }

    .device-info {
      width: 100%;
      font-size: 13px;
      color: #606266;
      margin-bottom: 20px;
      padding: 8px 0;
      word-break: break-all;

      .label {
        color: #909399;
        margin-right: 5px;
      }

      .value {
        font-family: monospace;
      }
    }

    .input-container {
      width: 100%;
      margin-bottom: 20px;
    }

    .button-container {
      width: 100%;
      margin-bottom: 15px;

      .el-button {
        width: 100%;
        height: 40px;
        font-size: 16px;
      }

      .loading-text {
        text-align: center;
        color: #409EFF;
        font-size: 14px;
      }
    }

    .error-message {
      color: #f56c6c;
      font-size: 14px;
      text-align: center;
      width: 100%;
    }
  }

  .footer {
    position: absolute;
    bottom: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    cursor: pointer;
  }
}
</style>
