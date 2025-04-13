<template>
  <div class="livechat-provider">
    <!-- 路由视图 -->
    <div class="router-container">
      <router-view></router-view>
    </div>

    <!-- 所有子路由页面共享的控制台组件 -->
    <live-chat-console
      ref="sharedConsoleRef"
      v-model:connected="connected"
      v-model:roomId="roomId"
    />
  </div>
</template>

<script>
import { ref, provide, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute } from '@/api';
import LiveChatConsole from '@/components/LiveChatConsole.vue';

export default {
  name: 'LivechatProvider',
  components: {
    LiveChatConsole
  },
  setup() {
    // 共享状态
    const roomId = ref('');
    const connected = ref(false);
    const sharedConsoleRef = ref(null);

    // 在组件卸载前检查连接状态，如果仍然连接着，发送警告但不断开
    onBeforeUnmount(() => {
      if (connected.value) {
        console.warn('LivechatProvider unloaded while still connected');
      }
    });

    // 提供共享状态给子组件，使用普通对象而非响应式对象
    provide('livechatState', {
      // 保持属性的响应式，但防止整个对象变成嵌套的响应式对象
      get roomId() { return roomId.value; },
      set roomId(val) { roomId.value = val; },
      get connected() { return connected.value; },
      set connected(val) { connected.value = val; },
      get consoleRef() { return sharedConsoleRef.value; },
    });

    onMounted(() => {
      // 当LiveChatConsole组件准备好后，确保能正确获取引用
      nextTick(() => {
        if (sharedConsoleRef.value) {
          // 初始化控制台
          console.log('LiveChatConsole组件引用已获取');
        }
      });
    });

    onBeforeUnmount(() => {
      // 在Provider卸载前不需要移除IPC监听器，因为监听器现在在控制台组件中维护
    });

    return {
      roomId,
      connected,
      sharedConsoleRef
    };
  }
}
</script>

<style scoped>
.livechat-provider {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.router-container {
  flex: 1;
  overflow: auto;
}
</style>
