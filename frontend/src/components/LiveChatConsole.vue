<template>
  <div class="live-chat-console" :style="{ height: consoleHeight + 'px' }">
    <!-- 可拖动的分隔条 -->
    <div class="console-resizer" @mousedown="startResize"></div>

    <div class="console-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="{ 'tab-active': activeTab === tab.name }"
        @click="activeTab = tab.name"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="console-body">
      <!-- 系统消息 -->
      <div class="console-content" :class="{ 'console-content-active': activeTab === 'system' }" v-show="activeTab === 'system'">
        <div v-for="(message, index) in systemMessages" :key="'system-'+index" class="system-item">
          <el-alert
            :title="message.message"
            :type="message.type === 'error' ? 'error' : 'info'"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <!-- 弹幕内容 -->
      <div class="console-content" :class="{ 'console-content-active': activeTab === 'chat' }" v-show="activeTab === 'chat'">
        <div class="chat-content-wrapper">
          <!-- 左侧弹幕区域 -->
          <div class="chat-message-area" ref="chatContainer">
            <div v-for="(message, index) in chatMessages" :key="'chat-'+index" class="chat-item">
              <span class="user">{{ message.user }}:</span>
              <span class="content">{{ message.content }}</span>
            </div>
          </div>

          <!-- 右侧互动区域 -->
          <div class="interaction-area">
            <!-- 进入直播间消息 -->
            <div class="member-message-area" ref="memberContainer">
              <div class="area-title">进入直播间</div>
              <div class="area-content">
                <transition-group name="member-transition">
                  <div v-for="item in memberMessages.slice(0, 3)" :key="item.id" class="member-item">
                    <el-avatar :size="24" :src="generateAvatar(item.user)"></el-avatar>
                    <span class="member-name">{{ item.user }}</span>
                    <span class="member-action">{{ item.action }}</span>
                  </div>
                </transition-group>
              </div>
            </div>

            <!-- 礼物消息 -->
            <div class="gift-message-area" ref="giftContainer">
              <div class="area-title">礼物消息</div>
              <div class="area-content">
                <transition-group name="gift-transition">
                  <div v-for="gift in giftMessages.slice(0, 3)" :key="gift.id" class="gift-item">
                    <div class="gift-sender">
                      <el-avatar :size="24" :src="generateAvatar(gift.user)"></el-avatar>
                      <span>{{ gift.user }}</span>
                    </div>
                    <div class="gift-info">
                      <span class="gift-name">送出 {{ gift.giftName }}</span>
                      <span class="gift-count">x{{ gift.count }}</span>
                    </div>
                  </div>
                </transition-group>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="console-content" :class="{ 'console-content-active': activeTab === 'textReply' }" v-show="activeTab === 'textReply'">
        <div v-for="(log, index) in textReplyLogs" :key="'reply-'+index" class="log-item">
          {{ log.time }} {{ log.message }}
        </div>
      </div>

      <div class="console-content" :class="{ 'console-content-active': activeTab === 'textControl' }" v-show="activeTab === 'textControl'">
        <div v-for="(log, index) in textControlLogs" :key="'control-'+index" class="chat-item">
          <span class="user">机器人[{{ log.time }}]:</span>
          <span class="content">{{ log.message }}</span>
        </div>
      </div>

      <div class="console-content" :class="{ 'console-content-active': activeTab === 'voiceAssistant' }" v-show="activeTab === 'voiceAssistant'">
        <div v-for="(log, index) in voiceAssistantLogs" :key="'voice-'+index" class="log-item">
          {{ log.time }} {{ log.message }}
        </div>
      </div>
    </div>

    <div class="console-input-area">
      <div class="left-controls">
        <el-input
          v-model="roomId"
          placeholder="请输入抖音直播间ID"
          :disabled="connected"
          @keyup.enter="connect"
          class="room-id-input"
        >
          <template #prepend>直播间ID</template>
        </el-input>
        <div class="operation-buttons">
          <el-button
            v-if="!connected"
            type="primary"
            @click="connect"
            :loading="connecting"
            class="operation-button"
          >
            开始监控
          </el-button>
          <el-button
            v-else
            type="danger"
            @click="disconnect"
            :loading="disconnecting"
            class="operation-button"
          >
            停止监控
          </el-button>
          <el-tag v-if="connected" type="success" class="status-tag">已连接</el-tag>
          <el-tag v-else type="info" class="status-tag">未连接</el-tag>

          <!-- 观众数量统计 -->
          <div v-if="connected" class="viewer-stats">
            <div class="stats-item online-viewers">
              <el-icon><UserFilled /></el-icon>
              <span>在线: {{ currentViewers }}</span>
            </div>
            <div class="stats-item total-viewers">
              <el-icon><Histogram /></el-icon>
              <span>累计: {{ totalViewers }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right-controls">
        <el-button size="small" @click="clearCurrentTab">清空当前页</el-button>
        <el-button size="small" @click="clearAllLogs">清空所有日志</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, defineEmits } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UserFilled, Histogram } from '@element-plus/icons-vue';
import { useLivechatStore } from '@/stores/livechatStore';

const route = useRoute();
const router = useRouter();
const emit = defineEmits(['update:systemMessages', 'update:chatMessages', 'update:connected', 'update:roomId']);

// 定义选项卡
const tabs = [
  { name: 'system', label: '系统消息' },
  { name: 'chat', label: '弹幕内容' },
  { name: 'textReply', label: '文字回复' },
  { name: 'textControl', label: '文字控场' },
  { name: 'voiceAssistant', label: '语音助手' },
];

// 当前激活的选项卡
const activeTab = ref('chat');

// 直播间连接状态
const roomId = ref('');
const connected = ref(false);
const connecting = ref(false);
const disconnecting = ref(false);

// 各种消息和日志
const systemMessages = ref([]);
const chatMessages = ref([]);
const memberMessages = ref([]);
const giftMessages = ref([]);
const textReplyLogs = ref([]);
const textControlLogs = ref([]);
const voiceAssistantLogs = ref([]);

// 消息容器引用
const chatContainer = ref(null);
const memberContainer = ref(null);
const giftContainer = ref(null);

// 消息超时ID
const memberTimeouts = ref({});
const giftTimeouts = ref({});

// 直播间统计数据
const currentViewers = ref(0);
const totalViewers = ref(0);

// 控制台高度
const consoleHeight = ref(300);
const minHeight = 100;
const maxHeight = 800;
const isResizing = ref(false);

// 开始调整大小
const startResize = (e) => {
  isResizing.value = true;

  // 记录初始位置和高度
  const startY = e.clientY;
  const startHeight = consoleHeight.value;

  const handleMouseMove = (e) => {
    if (!isResizing.value) return;

    // 计算新高度 (向上拖动减少高度，所以用负数)
    const newHeight = startHeight - (e.clientY - startY);

    // 限制高度范围
    consoleHeight.value = Math.min(Math.max(newHeight, minHeight), maxHeight);
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // 保存高度到localStorage
    localStorage.setItem('console-height', consoleHeight.value);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// 生成头像URL
const generateAvatar = (username) => {
  // 根据用户名生成不同颜色的头像
  const hash = username.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const color = `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username.substr(0, 2))}&background=${color.replace('#', '')}&color=fff`;
};

// 连接到直播间
const connect = async () => {
  if (!roomId.value) {
    ElMessage.warning('请输入直播间ID');
    return;
  }

  connecting.value = true;
  try {
    // 清空之前的消息
    systemMessages.value = [];
    chatMessages.value = [];
    memberMessages.value = [];
    giftMessages.value = [];

    // 调用API开始监控直播间
    const result = await ipc.invoke(ipcApiRoute.livechat.startMonitoring, {
      liveId: roomId.value
    });

    if (result && result.status === 'success') {
      ElMessage.success(result.message || '成功开始监控');
      connected.value = true;
      addSystemMessage('system', '已成功连接到直播间');

      // 通知父组件状态变化
      emit('update:connected', connected.value);
      emit('update:roomId', roomId.value);
      
      // 导入 livechatStore 确保在这个作用域可用
      const livechatStore = useLivechatStore();
      
      // 更新 store 中的状态
      livechatStore.setRoomId(roomId.value);
      livechatStore.setConnected(true);
      console.log('已更新 livechatStore 状态:', { roomId: roomId.value, connected: true });

      // 设置IPC消息监听器
      setupIpcListeners();
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
      connected.value = false;

      // 通知父组件状态变化
      emit('update:connected', connected.value);
      
      // 更新 store 中的状态
      const livechatStore = useLivechatStore();
      livechatStore.setConnected(false);
      
      // 记录日志
      console.log('已更新 livechatStore 状态: 已断开连接');
      addSystemMessage('system', '已断开直播间连接');
      
      // 重置统计数据
      currentViewers.value = 0;
      totalViewers.value = 0;
    } else {
      ElMessage.error(result?.message || '停止监控失败');
    }
  } catch (error) {
    ElMessage.error(`断开连接错误: ${error.message || '未知错误'}`);
    // 出现错误时也要确保状态被重置
    connected.value = false;
    
    // 更新 store 中的状态
    const livechatStore = useLivechatStore();
    livechatStore.setConnected(false);
    
    emit('update:connected', connected.value);
  } finally {
    disconnecting.value = false;
  }
};

// 检查当前监控状态
const checkMonitoringStatus = async () => {
  try {
    const response = await ipc.invoke(ipcApiRoute.livechat.getMonitoringStatus, {});

    if (response && response.status === 'success' && response.rooms && response.rooms.length > 0) {
      const monitoringRoom = response.rooms[0];
      roomId.value = monitoringRoom.live_id;
      connected.value = true;

      // 通知父组件状态变化
      emit('update:connected', connected.value);
      emit('update:roomId', roomId.value);
      
      // 更新 store 中的状态
      const livechatStore = useLivechatStore();
      livechatStore.setRoomId(roomId.value);
      livechatStore.setConnected(true);
      console.log('已恢复并更新 livechatStore 状态:', { roomId: roomId.value, connected: true });

      addSystemMessage('system', `已恢复对直播间 ${roomId.value} 的监控状态`);
      
      // 设置IPC消息监听器
      setupIpcListeners();
    } else {
      // 如果没有正在监控的直播间，确保状态为未连接
      connected.value = false;
      
      // 更新 store 中的状态
      const livechatStore = useLivechatStore();
      livechatStore.setConnected(false);
      console.log('检查监控状态：未连接到任何直播间');
      
      // 通知父组件状态变化
      emit('update:connected', false);
    }
  } catch (error) {
    console.error('检查监控状态错误:', error);
    // 出错时也确保状态为未连接
    connected.value = false;
    const livechatStore = useLivechatStore();
    livechatStore.setConnected(false);
    emit('update:connected', false);
  }
};

// 清空当前选项卡内容
const clearCurrentTab = () => {
  switch (activeTab.value) {
    case 'system':
      systemMessages.value = [];
      emit('update:systemMessages', systemMessages.value);
      break;
    case 'chat':
      chatMessages.value = [];
      memberMessages.value = [];
      giftMessages.value = [];
      emit('update:chatMessages', chatMessages.value);
      break;
    case 'textReply':
      textReplyLogs.value = [];
      break;
    case 'textControl':
      textControlLogs.value = [];
      break;
    case 'voiceAssistant':
      voiceAssistantLogs.value = [];
      break;
  }
};

// 清空所有日志
const clearAllLogs = () => {
  systemMessages.value = [];
  chatMessages.value = [];
  memberMessages.value = [];
  giftMessages.value = [];
  textReplyLogs.value = [];
  textControlLogs.value = [];
  voiceAssistantLogs.value = [];

  emit('update:systemMessages', systemMessages.value);
  emit('update:chatMessages', chatMessages.value);
};

// 添加系统消息
const addSystemMessage = (type, message) => {
  const sysMsg = { type, message, timestamp: new Date().toISOString() };
  systemMessages.value.push(sysMsg);

  if (systemMessages.value.length > 100) {
    systemMessages.value = systemMessages.value.slice(-100);
  }

  emit('update:systemMessages', systemMessages.value);
};

// 添加聊天消息
const addChatMessage = (user, content) => {
  const chatMsg = { user, content, timestamp: new Date().toISOString() };
  chatMessages.value.push(chatMsg);

  if (chatMessages.value.length > 200) {
    chatMessages.value = chatMessages.value.slice(-200);
  }

  emit('update:chatMessages', chatMessages.value);
};

// 添加进入直播间消息
const addMemberMessage = (user, action) => {
  const id = Date.now() + Math.random().toString(36).substr(2, 5);
  const memberMsg = { id, user, action, timestamp: Date.now() };

  memberMessages.value.unshift(memberMsg);

  // 限制显示数量
  if (memberMessages.value.length > 10) {
    const oldestMember = memberMessages.value.pop();
    if (memberTimeouts.value[oldestMember.id]) {
      clearTimeout(memberTimeouts.value[oldestMember.id]);
      delete memberTimeouts.value[oldestMember.id];
    }
  }

  // 1.5秒后自动消失
  memberTimeouts.value[memberMsg.id] = setTimeout(() => {
    memberMessages.value = memberMessages.value.filter(m => m.id !== memberMsg.id);
    delete memberTimeouts.value[memberMsg.id];
  }, 1500);
};

// 添加礼物消息
const addGiftMessage = (user, giftName, count) => {
  const id = Date.now() + Math.random().toString(36).substr(2, 5);
  const giftMsg = { id, user, giftName, count, timestamp: Date.now() };

  giftMessages.value.unshift(giftMsg);

  // 限制显示数量
  if (giftMessages.value.length > 10) {
    const oldestGift = giftMessages.value.pop();
    if (giftTimeouts.value[oldestGift.id]) {
      clearTimeout(giftTimeouts.value[oldestGift.id]);
      delete giftTimeouts.value[oldestGift.id];
    }
  }

  // 15秒后自动消失
  giftTimeouts.value[giftMsg.id] = setTimeout(() => {
    giftMessages.value = giftMessages.value.filter(g => g.id !== giftMsg.id);
    delete giftTimeouts.value[giftMsg.id];
  }, 15000);
};

// 添加文字回复日志
const addTextReplyLog = (message) => {
  const timestamp = new Date();
  const timeStr = timestamp.toLocaleTimeString();

  textReplyLogs.value.push({
    time: timeStr,
    message,
    timestamp: timestamp.toISOString()
  });

  if (textReplyLogs.value.length > 100) {
    textReplyLogs.value = textReplyLogs.value.slice(-100);
  }
};

// 添加文字控场日志
const addTextControlLog = (message) => {
  const timestamp = new Date();
  const timeStr = timestamp.toLocaleTimeString();

  textControlLogs.value.push({
    time: timeStr,
    message,
    timestamp: timestamp.toISOString()
  });

  if (textControlLogs.value.length > 100) {
    textControlLogs.value = textControlLogs.value.slice(-100);
  }
};

// 添加语音助手日志
const addVoiceAssistantLog = (message) => {
  const timestamp = new Date();
  const timeStr = timestamp.toLocaleTimeString();

  voiceAssistantLogs.value.push({
    time: timeStr,
    message,
    timestamp: timestamp.toISOString()
  });

  if (voiceAssistantLogs.value.length > 100) {
    voiceAssistantLogs.value = voiceAssistantLogs.value.slice(-100);
  }
};

// 更新直播间统计
const updateRoomStats = (current, totalWithUnit) => {
  currentViewers.value = current;
  totalViewers.value = totalWithUnit;
};

// 设置IPC消息监听器
const setupIpcListeners = () => {
  // 监听来自主进程的消息
  ipc.on('livechat-message', (event, data) => {
    // console.log('收到弹幕消息:', data);
    const { type, message } = data;

    // 根据消息类型进行处理
    switch (type) {
      case 'chat':
        const match = message.match(/【聊天msg】\[([^\]]+)\]([^:]+): (.*)/);
        if (match) {
          const [_, userId, userName, content] = match;
          addChatMessage(userName.trim(), content);
        } else {
          addChatMessage('用户', message);
        }
        break;
      case 'gift':
        const giftMatch = message.match(/【礼物msg】([^ ]+) 送出了 ([^x]+)x(\d+)/);
        if (giftMatch) {
          const [_, userName, giftName, count] = giftMatch;
          addGiftMessage(userName, giftName, count);
        }
        break;
      case 'member':
        const memberMatch = message.match(/【进场msg】\[([^\]]+)\]\[[^\]]+\]([^ ]+) 进入了直播间/);
        if (memberMatch) {
          const [_, userId, userName] = memberMatch;
          addMemberMessage(userName, '进入了直播间');
        }
        break;
      case 'error':
        addSystemMessage('error', message);
        break;
      case 'system':
        addSystemMessage('system', message);
        break;
      case 'text_reply':
        addTextReplyLog(message);
        break;
      case 'text_control':
        addTextControlLog(message);
        break;
      case 'voice_assistant':
        addVoiceAssistantLog(message);
        break;
      case 'room_user_seq':
        const statsMatch = message.match(/【统计msg】当前观看人数: (\d+), 累计观看人数: (.+)/);
        if (statsMatch) {
          const [_, current, total] = statsMatch;
          updateRoomStats(parseInt(current), total);
        }
        break;
      case 'room_stats':
        // 处理直播间统计消息
        const roomStatsMatch = message.match(/【直播间统计msg】(\d+)在线观众/);
        if (roomStatsMatch) {
          const [_, viewerCount] = roomStatsMatch;
          currentViewers.value = parseInt(viewerCount);
        }
        break;
      default:
        // 其他类型的消息记录到系统日志中
        addSystemMessage('info', `${type}: ${message}`);
        break;
    }
  });
};

// 监听聊天列表变化，自动滚动到底部
watch(chatMessages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}, { deep: true });

// 监听进入消息列表变化，自动滚动到底部
watch(memberMessages, () => {
  nextTick(() => {
    if (memberContainer.value) {
      memberContainer.value.scrollTop = memberContainer.value.scrollHeight;
    }
  });
}, { deep: true });

// 监听礼物消息列表变化，自动滚动到底部
watch(giftMessages, () => {
  nextTick(() => {
    if (giftContainer.value) {
      giftContainer.value.scrollTop = giftContainer.value.scrollHeight;
    }
  });
}, { deep: true });

// 组件挂载时
onMounted(() => {
  // 从localStorage加载保存的高度
  const savedHeight = localStorage.getItem('console-height');
  if (savedHeight) {
    consoleHeight.value = parseInt(savedHeight);
  }

  // 检查监控状态
  checkMonitoringStatus();
});

// 组件卸载前
onBeforeUnmount(() => {
  // 移除IPC消息监听器，但不断开连接
  ipc.removeAllListeners('livechat-message');

  // 清除所有超时
  Object.values(memberTimeouts.value).forEach(timeout => clearTimeout(timeout));
  Object.values(giftTimeouts.value).forEach(timeout => clearTimeout(timeout));
  
  // 确保在组件卸载时重置连接状态
  const livechatStore = useLivechatStore();
  livechatStore.setConnected(false);
  console.log('组件卸载：重置连接状态');
});

// 导出方法给父组件使用
defineExpose({
  addSystemMessage,
  addChatMessage,
  addMemberMessage,
  addGiftMessage,
  addTextReplyLog,
  addTextControlLog,
  addVoiceAssistantLog,
  clearCurrentTab,
  clearAllLogs,
  connect,
  disconnect,
  roomId,
  connected
});
</script>

<style lang="less" scoped>
.live-chat-console {
  display: flex;
  flex-direction: column;
  height: 300px; // 默认高度，会被动态覆盖
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 5px;
  position: relative;

  .console-resizer {
    position: absolute;
    top: -5px;
    left: 0;
    right: 0;
    height: 10px;
    cursor: ns-resize;
    background: transparent;
    z-index: 100;

    &:hover {
      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 4px;
        height: 2px;
        background: #409eff;
      }
    }
  }

  .console-tabs {
    display: flex;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    height: 30px;

    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      color: #606266;
      border-right: 1px solid #e4e7ed;
      transition: all 0.2s;
      user-select: none;

      &:last-child {
        border-right: none;
      }

      &:hover {
        background-color: #ecf5ff;
        color: #409eff;
      }

      &.tab-active {
        background-color: #409eff;
        color: #fff;
      }
    }
  }

  .console-body {
    flex: 1;
    overflow: hidden;
    position: relative;
    background-color: #f9f9f9;
  }

  .console-content {
    height: 100%;
    overflow-y: auto;
    padding: 5px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    font-size: 12px;

    .chat-content-wrapper {
      display: flex;
      height: 100%;
      gap: 5px;

      .chat-message-area {
        flex: 3;
        height: 100%;
        overflow-y: auto;
        border: 1px solid #e4e7ed;
        border-radius: 3px;
        background-color: #fff;
      }

      .interaction-area {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 5px;
        height: 100%;

        .member-message-area,
        .gift-message-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 1px solid #e4e7ed;
          border-radius: 3px;
          background-color: #fff;
          min-height: 0;
          overflow: hidden;

          .area-title {
            padding: 4px 8px;
            background-color: #f5f7fa;
            border-bottom: 1px solid #e4e7ed;
            font-size: 12px;
            font-weight: bold;
            color: #606266;
            flex-shrink: 0;
          }

          .area-content {
            flex: 1;
            overflow-y: auto;
            padding: 5px;
            display: flex;
            flex-direction: column;
            min-height: 30px;
          }
        }
      }
    }

    &.system-messages {
      .system-item {
        margin-bottom: 3px;

        :deep(.el-alert) {
          padding: 5px 8px;

          .el-alert__content {
            padding: 0 8px 0 0;
          }

          .el-alert__title {
            font-size: 12px;
            line-height: 15px;
          }

          .el-alert__icon {
            font-size: 12px;
          }
        }
      }
    }

    .chat-item {
      margin-bottom: 5px;
      padding: 5px 8px;
      background-color: #f0f9eb;
      border-radius: 3px;
      word-break: break-all;
      text-align: left;
      line-height: 1.5;

      .user {
        font-weight: bold;
        color: #67c23a;
        margin-right: 3px;
      }

      .content {
        color: #333;
      }
    }

    .member-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      padding: 3px 5px;
      background-color: #f2f6fc;
      border-radius: 3px;

      .member-name {
        margin: 0 5px;
        font-weight: bold;
        color: #409eff;
        font-size: 11px;
      }

      .member-action {
        color: #606266;
        font-size: 11px;
      }
    }

    .gift-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding: 3px 5px;
      background-color: #fdf6ec;
      border-radius: 3px;

      .gift-sender {
        display: flex;
        align-items: center;

        span {
          margin-left: 5px;
          font-weight: bold;
          color: #e6a23c;
          font-size: 11px;
        }
      }

      .gift-info {
        display: flex;
        align-items: center;

        .gift-name {
          margin-right: 3px;
          color: #606266;
          font-size: 11px;
        }

        .gift-count {
          font-weight: bold;
          color: #f56c6c;
          font-size: 11px;
        }
      }
    }

    .log-item {
      padding: 3px;
      border-bottom: 1px solid #eee;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.3;
    }
  }

  .console-input-area {
    padding: 5px 8px;
    border-top: 1px solid #e4e7ed;
    background-color: #f5f7fa;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 5px;

    .left-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      flex: 1;
      min-width: 280px;

      .room-id-input {
        min-width: 150px;
        max-width: 300px;
        width: auto;
        flex-grow: 1;

        :deep(.el-input__wrapper) {
          margin-right: 0;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      .operation-buttons {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;

        .operation-button {
          width: auto;
          min-width: 90px;
          margin-left: 0;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        .status-tag {
          padding: 0 8px;
          height: 28px;
          line-height: 26px;
        }
      }
    }

    .right-controls {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;

      :deep(.el-button) {
        padding: 5px 8px;
        font-size: 12px;
        white-space: nowrap;
      }
    }
  }
}

// 头像大小调整
:deep(.el-avatar) {
  width: 20px;
  height: 20px;
  font-size: 12px;
}

// 过渡动画
.member-transition-enter-active,
.member-transition-leave-active {
  transition: all 0.5s ease;
}
.member-transition-enter-from {
  opacity: 0;
  transform: translateX(50%);
}
.member-transition-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.gift-transition-enter-active,
.gift-transition-leave-active {
  transition: all 0.6s ease;
}
.gift-transition-enter-from {
  opacity: 0;
  transform: translateX(50%);
}
.gift-transition-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.viewer-stats {
  display: flex;
  gap: 10px;
  margin-left: 10px;
  align-items: center;

  .stats-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    white-space: nowrap;

    .el-icon {
      margin-right: 3px;
      font-size: 14px;
    }

    &.online-viewers {
      .el-icon {
        color: #67c23a;
      }
    }

    &.total-viewers {
      .el-icon {
        color: #409eff;
      }
    }
  }
}
</style>
