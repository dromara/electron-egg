<template>
  <div class="livechat-container">
    <div class="one-block-1">
      <span>直播间控场</span>
    </div>

    <!-- 控制区域 -->
    <div class="control-area">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-input
            v-model="roomId"
            placeholder="请输入抖音直播间ID"
            :disabled="connected"
            @keyup.enter="connect"
          >
            <template #prepend>直播间ID</template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <div class="operation-area">
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
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 统计信息 -->
      <div class="stats-panel">
        <div class="stats-item online-viewers">
          <el-icon><UserFilled /></el-icon>
          <span>在线观众: {{ currentViewers }}</span>
        </div>
        <div class="stats-item total-viewers">
          <el-icon><Histogram /></el-icon>
          <span>累计观众: {{ totalViewers }}</span>
        </div>
      </div>

      <!-- 互动区域 -->
      <div class="interactions-panel">
        <el-row :gutter="10">
          <el-col :span="12">
            <!-- 观众进场区域 -->
            <div class="member-panel">
              <div class="panel-header">
                <span>观众互动</span>
              </div>
              <div class="member-container">
                <transition-group name="member-transition">
                  <div v-for="item in displayMembers.slice(0, 1)" :key="item.id" class="member-item">
                    <el-avatar :size="24" :src="generateAvatar(item.user)"></el-avatar>
                    <span class="member-name">{{ item.user }}</span>
                    <span class="member-action">{{ item.action }}</span>
                  </div>
                </transition-group>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <!-- 礼物区域 -->
            <div class="gift-panel">
              <div class="panel-header">
                <span>礼物动态</span>
              </div>
              <div class="gift-container">
                <transition-group name="gift-transition">
                  <div v-for="gift in displayGifts.slice(0, 1)" :key="gift.id" class="gift-item">
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
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 控制台组件 -->
    <live-chat-console
      ref="consoleRef"
      v-model:systemMessages="systemMessages"
      v-model:chatMessages="chatMessages"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, inject } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';
import { UserFilled, Histogram } from '@element-plus/icons-vue';
import LiveChatConsole from '@/components/LiveChatConsole.vue';
import { useLivechatStore } from '@/stores/livechatStore';

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);

// Pinia store
const livechatStore = useLivechatStore();

// 状态变量
const roomId = ref(livechatStore.roomId || sharedState?.roomId || '');
const connected = ref(livechatStore.connected || sharedState?.connected || false);
const connecting = ref(false);
const disconnecting = ref(false);
const consoleRef = ref(null);

// 直播间统计数据
const currentViewers = ref(0);
const totalViewers = ref(0);

// 消息数据
const systemMessages = ref([]);
const chatMessages = ref([]);

// 显示在界面上的进场和礼物消息（限制数量，自动消失）
const displayMembers = ref([]);
const displayGifts = ref([]);

// 自动消失的消息超时ID
const memberTimeouts = ref({});
const giftTimeouts = ref({});

// 监听状态的变化
watch(() => connected.value, (newVal) => {
  if (sharedState) {
    sharedState.connected = newVal;
  }
  // 同步到Pinia
  livechatStore.setConnected(newVal);
});

watch(() => roomId.value, (newVal) => {
  if (sharedState) {
    sharedState.roomId = newVal;
  }
  // 同步到Pinia
  livechatStore.setRoomId(newVal);
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
    systemMessages.value = [];
    chatMessages.value = [];
    displayMembers.value = [];
    displayGifts.value = [];

    // 调用API开始监控直播间
    const result = await ipc.invoke(ipcApiRoute.livechat.startMonitoring, {
      liveId: roomId.value
    });

    if (result && result.status === 'success') {
      ElMessage.success(result.message || '成功开始监控');
      connected.value = true;
      if (consoleRef.value) {
        consoleRef.value.addSystemMessage('system', '已成功连接到直播间');
      }
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
    } else {
      ElMessage.error(result?.message || '停止监控失败');
    }
  } catch (error) {
    ElMessage.error(`断开连接错误: ${error.message || '未知错误'}`);
  } finally {
    disconnecting.value = false;
  }
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

// 添加成员消息
const addMemberMessage = (user, action) => {
  const id = Date.now() + Math.random().toString(36).substr(2, 5);
  const memberMsg = { id, user, action, timestamp: Date.now() };

  displayMembers.value.unshift(memberMsg);

  // 限制显示数量为5个
  if (displayMembers.value.length > 5) {
    const oldestMember = displayMembers.value.pop();
    if (memberTimeouts.value[oldestMember.id]) {
      clearTimeout(memberTimeouts.value[oldestMember.id]);
      delete memberTimeouts.value[oldestMember.id];
    }
  }

  // 10秒后自动消失
  memberTimeouts.value[memberMsg.id] = setTimeout(() => {
    displayMembers.value = displayMembers.value.filter(m => m.id !== memberMsg.id);
    delete memberTimeouts.value[memberMsg.id];
  }, 10000);
};

// 添加礼物消息
const addGiftMessage = (user, giftName, count) => {
  const id = Date.now() + Math.random().toString(36).substr(2, 5);
  const giftMsg = { id, user, giftName, count, timestamp: Date.now() };

  displayGifts.value.unshift(giftMsg);

  // 限制显示数量为3个
  if (displayGifts.value.length > 3) {
    const oldestGift = displayGifts.value.pop();
    if (giftTimeouts.value[oldestGift.id]) {
      clearTimeout(giftTimeouts.value[oldestGift.id]);
      delete giftTimeouts.value[oldestGift.id];
    }
  }

  // 15秒后自动消失
  giftTimeouts.value[giftMsg.id] = setTimeout(() => {
    displayGifts.value = displayGifts.value.filter(g => g.id !== giftMsg.id);
    delete giftTimeouts.value[giftMsg.id];
  }, 15000);
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
    console.log('收到弹幕消息:', data);
    const { type, message } = data;

    // 根据消息类型进行处理
    switch (type) {
      case 'chat':
        const match = message.match(/【聊天msg】\[([^\]]+)\]([^:]+): (.*)/);
        if (match && consoleRef.value) {
          const [_, userId, userName, content] = match;
          consoleRef.value.addChatMessage(userName.trim(), content);
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
      case 'error':
        if (consoleRef.value) {
          consoleRef.value.addSystemMessage('error', message);
        }
        break;
      case 'system':
        if (consoleRef.value) {
          consoleRef.value.addSystemMessage('system', message);
        }
        break;
      default:
        // 其他消息类型暂不处理
        console.log(`其他类型消息: ${type}`, message);
        break;
    }
  });
};

// 检查当前监控状态
const checkMonitoringStatus = async () => {
  try {
    const response = await ipc.invoke(ipcApiRoute.livechat.getMonitoringStatus, {});

    if (response && response.status === 'success' && response.rooms && response.rooms.length > 0) {
      const monitoringRoom = response.rooms[0];
      roomId.value = monitoringRoom.live_id;
      connected.value = true;

      if (consoleRef.value) {
        consoleRef.value.addSystemMessage('system', `已恢复对直播间 ${roomId.value} 的监控状态`);
      }
    }
  } catch (error) {
    console.error('检查监控状态错误:', error);
  }
};

// 在组件挂载时从Pinia同步状态
onMounted(() => {
  // 同步Pinia中的直播间状态
  if (livechatStore.roomId) {
    roomId.value = livechatStore.roomId;
    if (sharedState) sharedState.roomId = livechatStore.roomId;
  }
  
  if (livechatStore.connected) {
    connected.value = livechatStore.connected;
    if (sharedState) sharedState.connected = livechatStore.connected;
  }
  
  // 设置控制台引用
  if (consoleRef.value && sharedState) {
    sharedState.consoleRef = consoleRef.value;
  }
  
  // 设置IPC消息监听器
  setupIpcListeners();

  // 获取监控状态
  checkMonitoringStatus();
});

// 组件卸载前
onBeforeUnmount(() => {
  // 移除IPC消息监听器，但不断开直播间连接
  ipc.removeAllListeners('livechat-message');

  // 清除所有超时
  Object.values(memberTimeouts.value).forEach(timeout => clearTimeout(timeout));
  Object.values(giftTimeouts.value).forEach(timeout => clearTimeout(timeout));
});
</script>

<style lang="less" scoped>
.livechat-container {
  padding: 10px 20px;

  .one-block-1 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .control-area {
    margin-bottom: 15px;

    .operation-area {
      display: flex;
      align-items: center;
      height: 100%;

      .operation-button {
        flex-shrink: 0;
        width: 110px;
      }

      .status-tag {
        margin-left: 10px;
        padding: 0 10px;
        height: 32px;
        line-height: 30px;
      }
    }
  }

  .content-area {
    margin-bottom: 15px;
  }

  // 统计面板
  .stats-panel {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 10px;

    .stats-item {
      display: flex;
      align-items: center;

      .el-icon {
        margin-right: 5px;
        font-size: 18px;
      }

      span {
        font-weight: bold;
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

  .interactions-panel {
    margin-bottom: 10px;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-bottom: none;
      border-radius: 4px 4px 0 0;

      span {
        font-weight: bold;
      }
    }

    .member-panel, .gift-panel {
      height: 65px;
      margin-bottom: 10px;

      .member-container, .gift-container {
        height: 30px;
        overflow: hidden;
        border: 1px solid #e4e7ed;
        border-top: none;
        border-radius: 0 0 4px 4px;
        padding: 5px 10px;
        background-color: #f9f9f9;
      }

      .member-item {
        display: flex;
        align-items: center;

        .member-name {
          margin: 0 8px;
          font-weight: bold;
          color: #409eff;
        }

        .member-action {
          color: #606266;
        }
      }

      .gift-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .gift-sender {
          display: flex;
          align-items: center;

          span {
            margin-left: 8px;
            font-weight: bold;
            color: #e6a23c;
          }
        }

        .gift-info {
          .gift-name {
            margin-right: 5px;
          }

          .gift-count {
            font-weight: bold;
            color: #f56c6c;
          }
        }
      }
    }
  }
}

// 过渡动画
.member-transition-enter-active,
.member-transition-leave-active {
  transition: all 0.5s ease;
}
.member-transition-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.member-transition-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.gift-transition-enter-active,
.gift-transition-leave-active {
  transition: all 0.6s ease;
}
.gift-transition-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.gift-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
