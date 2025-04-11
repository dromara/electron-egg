<template>
  <div class="livechat-container">
    <div class="one-block-1">
      <span>直播间控场</span>
    </div>
    <div class="one-block-2">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-input
            v-model="roomId"
            placeholder="请输入抖音直播间ID"
            :disabled="isConnected"
            @keyup.enter="connect"
          >
            <template #prepend>直播间ID</template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            v-if="!isConnected"
            type="primary"
            @click="connect"
            :loading="connecting"
          >
            开始监控
          </el-button>
          <el-button
            v-else
            type="danger"
            @click="disconnect"
            :loading="disconnecting"
          >
            停止监控
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-tag v-if="isConnected" type="success">已连接</el-tag>
          <el-tag v-else type="info">未连接</el-tag>
        </el-col>
      </el-row>
    </div>

    <div class="one-block-1">
      <span>弹幕消息</span>
      <el-button
        size="small"
        style="margin-left: 10px;"
        @click="clearMessages"
      >
        清空消息
      </el-button>
    </div>
    <div class="one-block-2">
      <div class="message-container" ref="messageContainer">
        <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.type">
          <template v-if="message.type === 'system'">
            <div class="system-message">系统消息: {{ message.message }}</div>
          </template>
          <template v-else-if="message.type === 'error'">
            <div class="error-message">错误: {{ message.message }}</div>
          </template>
          <template v-else-if="message.type === 'chat'">
            <div class="chat-message">
              <span class="user">{{ message.user }}:</span>
              <span class="content">{{ message.content }}</span>
            </div>
          </template>
          <template v-else-if="message.type === 'gift'">
            <div class="gift-message">
              <span class="user">{{ message.user }}</span>
              <span class="content">赠送了 {{ message.giftName }} x{{ message.diamondCount }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';

// 状态变量
const roomId = ref('');
const isConnected = ref(false);
const connecting = ref(false);
const disconnecting = ref(false);
const messages = ref([]);
const messageContainer = ref(null);
let eventSource = null;

// 监听消息列表变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
});

// 连接到直播间
const connect = async () => {
  if (!roomId.value) {
    ElMessage.warning('请输入直播间ID');
    return;
  }

  connecting.value = true;
  try {
    // 清空之前的消息
    messages.value = [];

    // 调用API开始监控直播间
    const result = await ipc.invoke(ipcApiRoute.livechat.startMonitoring, {
      liveId: roomId.value
    });

    if (result && result.status === 'success') {
      ElMessage.success(result.message || '成功开始监控');
      isConnected.value = true;
      addMessage('system', '已成功连接到直播间');

      // 开始接收弹幕消息 - 主进程已经建立了SSE连接并会转发消息
    } else {
      ElMessage.error(result?.message || '开始监控失败');
    }
  } catch (error) {
    ElMessage.error(`连接错误: ${error.message || '未知错误'}`);
  } finally {
    connecting.value = false;
  }
};

// 断开连接
const disconnect = async () => {
  disconnecting.value = true;
  try {
    // 停止监控
    const result = await ipc.invoke(ipcApiRoute.livechat.stopMonitoring, {
      liveId: roomId.value
    });

    if (result && result.status === 'success') {
      ElMessage.success(result.message || '已停止监控');
      isConnected.value = false;

      // 断开SSE连接
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    } else {
      ElMessage.error(result?.message || '停止监控失败');
    }
  } catch (error) {
    ElMessage.error(`断开连接错误: ${error.message || '未知错误'}`);
  } finally {
    disconnecting.value = false;
  }
};

// 清空消息
const clearMessages = () => {
  messages.value = [];
};

// 添加消息到列表
const addMessage = (type, message) => {
  messages.value.push({ type, message });

  // 限制消息数量，避免内存占用过多
  if (messages.value.length > 500) {
    messages.value = messages.value.slice(-500);
  }
};

// 设置IPC消息监听器
const setupIpcListeners = () => {
  // 监听来自主进程的消息
  ipc.on('livechat-message', (event, message) => {
    console.log('收到弹幕消息:', message);
    const { type, message: text } = message;

    // 根据消息类型进行处理
    if (type === 'chat') {
      const match = text.match(/【聊天msg】\[([^\]]+)\]([^:]+): (.*)/);
      if (match) {
        const [_, userId, userName, content] = match;
        messages.value.push({
          type: 'chat',
          user: userName.trim(),
          content: content
        });
      } else {
        addMessage('chat', text);
      }
    } else if (type === 'gift') {
      const match = text.match(/【礼物msg】([^ ]+) 送出了 ([^x]+)x(\d+)/);
      if (match) {
        const [_, userName, giftName, count] = match;
        messages.value.push({
          type: 'gift',
          user: userName,
          giftName: giftName,
          diamondCount: count
        });
      } else {
        addMessage('gift', text);
      }
    } else {
      // 其他类型的消息直接添加
      addMessage(type, text);
    }
  });
};

// 页面挂载时
onMounted(() => {
  // 设置IPC消息监听器
  setupIpcListeners();
});

// 页面卸载前
onBeforeUnmount(() => {
  // 移除IPC消息监听器
  ipc.removeAllListeners('livechat-message');

  // 如果已连接，断开连接
  if (isConnected.value) {
    disconnect();
  }
});
</script>

<style lang="less" scoped>
.livechat-container {
  padding: 10px 20px;

  .one-block-1 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;

    &:first-child {
      margin-top: 0;
    }

    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .one-block-2 {
    margin-bottom: 20px;
  }

  .message-container {
    height: 500px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
    background-color: #f5f7fa;

    .message-item {
      margin-bottom: 8px;
      padding: 5px 8px;
      border-radius: 4px;

      &.system {
        background-color: #ecf5ff;
        color: #409eff;
      }

      &.error {
        background-color: #fef0f0;
        color: #f56c6c;
      }

      &.chat {
        background-color: #f0f9eb;

        .user {
          color: #67c23a;
          font-weight: bold;
          margin-right: 5px;
        }

        .content {
          color: #303133;
        }
      }

      &.gift {
        background-color: #fdf6ec;

        .user {
          color: #e6a23c;
          font-weight: bold;
          margin-right: 5px;
        }

        .content {
          color: #303133;
        }
      }
    }
  }
}
</style>
