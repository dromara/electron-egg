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
        <el-col :span="8">
          <div class="operation-area">
            <el-button
              v-if="!isConnected"
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
            <el-tag v-if="isConnected" type="success" class="status-tag">已连接</el-tag>
            <el-tag v-else type="info" class="status-tag">未连接</el-tag>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 左侧聊天区域 -->
      <div class="chat-panel">
        <div class="panel-header">
          <span>聊天消息</span>
          <el-button size="small" @click="clearMessages('chat')">清空聊天</el-button>
        </div>
        <div class="chat-container" ref="chatContainer">
          <div v-for="(message, index) in chatMessages" :key="'chat-'+index" class="chat-item">
            <span class="user">{{ message.user }}:</span>
            <span class="content">{{ message.content }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-panel">
        <!-- 直播间统计 -->
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

        <!-- 系统消息区域 -->
        <div class="system-panel">
          <div class="panel-header">
            <span>系统消息</span>
            <el-button size="small" @click="clearMessages('system')">清空</el-button>
          </div>
          <div class="system-container">
            <div v-for="(message, index) in systemMessages" :key="'system-'+index" class="system-item">
              <el-alert
                :title="message.message"
                :type="message.type === 'error' ? 'error' : 'info'"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </div>

        <!-- 观众进场区域 -->
        <div class="member-panel">
          <div class="panel-header">
            <span>观众互动</span>
          </div>
          <div class="member-container">
            <transition-group name="member-transition">
              <div v-for="item in displayMembers" :key="item.id" class="member-item">
                <el-avatar :size="24" :src="generateAvatar(item.user)"></el-avatar>
                <span class="member-name">{{ item.user }}</span>
                <span class="member-action">{{ item.action }}</span>
              </div>
            </transition-group>
          </div>
        </div>

        <!-- 礼物区域 -->
        <div class="gift-panel">
          <div class="panel-header">
            <span>礼物动态</span>
          </div>
          <div class="gift-container">
            <transition-group name="gift-transition">
              <div v-for="gift in displayGifts" :key="gift.id" class="gift-item">
                <div class="gift-sender">
                  <el-avatar :size="30" :src="generateAvatar(gift.user)"></el-avatar>
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';
import { UserFilled, Histogram } from '@element-plus/icons-vue';

// 状态变量
const roomId = ref('');
const isConnected = ref(false);
const connecting = ref(false);
const disconnecting = ref(false);
const messages = ref([]);
const chatContainer = ref(null);

// 定义消息最大长度限制
const MAX_CHAT_MESSAGES = 200;
const MAX_SYSTEM_MESSAGES = 50;
const MAX_MEMBER_MESSAGES = 100;
const MAX_GIFT_MESSAGES = 100;
const MAX_SOCIAL_MESSAGES = 50;
const MAX_LIKE_MESSAGES = 50;

// 定义清理间隔(毫秒)
const CLEANUP_INTERVAL = 60000; // 1分钟清理一次
let cleanupTimer = null;

// 直播间统计数据
const currentViewers = ref(0);
const totalViewers = ref(0);
const likeCount = ref(0);

// 分类消息
const chatMessages = ref([]);
const systemMessages = ref([]);
const memberMessages = ref([]);
const giftMessages = ref([]);
const socialMessages = ref([]);
const likeMessages = ref([]);

// 显示在界面上的进场和礼物消息（限制数量，自动消失）
const displayMembers = ref([]);
const displayGifts = ref([]);

// 自动消失的消息超时ID
const memberTimeouts = ref({});
const giftTimeouts = ref({});

// 监听聊天列表变化，自动滚动到底部
watch(chatMessages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}, { deep: true, immediate: true });

// 连接到直播间
const connect = async () => {
  if (!roomId.value) {
    ElMessage.warning('请输入直播间ID');
    return;
  }

  connecting.value = true;
  try {
    // 清空之前的消息
    clearAllMessages();

    // 调用API开始监控直播间
    const result = await ipc.invoke(ipcApiRoute.livechat.startMonitoring, {
      liveId: roomId.value
    });

    if (result && result.status === 'success') {
      ElMessage.success(result.message || '成功开始监控');
      isConnected.value = true;
      addSystemMessage('system', '已成功连接到直播间');

      // 启动定期清理定时器
      startCleanupTimer();
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

      // 停止定期清理定时器
      stopCleanupTimer();
    } else {
      ElMessage.error(result?.message || '停止监控失败');
    }
  } catch (error) {
    ElMessage.error(`断开连接错误: ${error.message || '未知错误'}`);
  } finally {
    disconnecting.value = false;
  }
};

// 清空所有消息
const clearAllMessages = () => {
  messages.value = [];
  chatMessages.value = [];
  systemMessages.value = [];
  memberMessages.value = [];
  giftMessages.value = [];
  socialMessages.value = [];
  likeMessages.value = [];
  displayMembers.value = [];
  displayGifts.value = [];

  // 清除所有超时
  Object.values(memberTimeouts.value).forEach(timeout => clearTimeout(timeout));
  Object.values(giftTimeouts.value).forEach(timeout => clearTimeout(timeout));
  memberTimeouts.value = {};
  giftTimeouts.value = {};

  // 重置统计
  currentViewers.value = 0;
  totalViewers.value = 0;
  likeCount.value = 0;
};

// 清空特定类型的消息
const clearMessages = (type) => {
  switch(type) {
    case 'chat':
      chatMessages.value = [];
      break;
    case 'system':
      systemMessages.value = [];
      break;
    case 'member':
      memberMessages.value = [];
      displayMembers.value = [];
      Object.values(memberTimeouts.value).forEach(timeout => clearTimeout(timeout));
      memberTimeouts.value = {};
      break;
    case 'gift':
      giftMessages.value = [];
      displayGifts.value = [];
      Object.values(giftTimeouts.value).forEach(timeout => clearTimeout(timeout));
      giftTimeouts.value = {};
      break;
    default:
      clearAllMessages();
      break;
  }
};

// 添加系统消息
const addSystemMessage = (type, message) => {
  const sysMsg = { type, message };
  systemMessages.value.push(sysMsg);

  // 限制消息数量
  if (systemMessages.value.length > MAX_SYSTEM_MESSAGES) {
    systemMessages.value = systemMessages.value.slice(-MAX_SYSTEM_MESSAGES);
  }
};

// 添加聊天消息
const addChatMessage = (user, content) => {
  const chatMsg = { user, content };
  chatMessages.value.push(chatMsg);

  // 限制消息数量
  if (chatMessages.value.length > MAX_CHAT_MESSAGES) {
    chatMessages.value = chatMessages.value.slice(-MAX_CHAT_MESSAGES);
  }
};

// 添加进场消息，并设置自动消失
const addMemberMessage = (user, action) => {
  const id = Date.now() + Math.random().toString(36).substr(2, 5);
  const memberMsg = { id, user, action, timestamp: Date.now() };

  memberMessages.value.push(memberMsg);
  displayMembers.value.unshift(memberMsg);

  // 限制总消息数量
  if (memberMessages.value.length > MAX_MEMBER_MESSAGES) {
    memberMessages.value = memberMessages.value.slice(-MAX_MEMBER_MESSAGES);
  }

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

// 添加礼物消息，并设置自动消失
const addGiftMessage = (user, giftName, count) => {
  const id = Date.now() + Math.random().toString(36).substr(2, 5);
  const giftMsg = { id, user, giftName, count, timestamp: Date.now() };

  giftMessages.value.push(giftMsg);
  displayGifts.value.unshift(giftMsg);

  // 限制总消息数量
  if (giftMessages.value.length > MAX_GIFT_MESSAGES) {
    giftMessages.value = giftMessages.value.slice(-MAX_GIFT_MESSAGES);
  }

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

// 添加点赞消息
const addLikeMessage = (user, count) => {
  likeMessages.value.push({ user, count, timestamp: Date.now() });
  likeCount.value += parseInt(count || 1);

  // 限制消息数量
  if (likeMessages.value.length > MAX_LIKE_MESSAGES) {
    likeMessages.value = likeMessages.value.slice(-MAX_LIKE_MESSAGES);
  }
};

// 添加关注消息
const addSocialMessage = (user) => {
  socialMessages.value.push({ user, timestamp: Date.now() });
  addMemberMessage(user, '关注了主播');

  // 限制消息数量
  if (socialMessages.value.length > MAX_SOCIAL_MESSAGES) {
    socialMessages.value = socialMessages.value.slice(-MAX_SOCIAL_MESSAGES);
  }
};

// 更新直播间统计
const updateRoomStats = (current, totalWithUnit) => {
  currentViewers.value = current;
  totalViewers.value = totalWithUnit;
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
      case 'like':
        const likeMatch = message.match(/【点赞msg】([^ ]+) 点了(\d+)个赞/);
        if (likeMatch) {
          const [_, userName, count] = likeMatch;
          addLikeMessage(userName, count);
        }
        break;
      case 'social':
        const socialMatch = message.match(/【关注msg】\[([^\]]+)\]([^ ]+) 关注了主播/);
        if (socialMatch) {
          const [_, userId, userName] = socialMatch;
          addSocialMessage(userName);
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
          // 更新在线观众数
          currentViewers.value = parseInt(viewerCount);
          // console.log(`更新在线观众数: ${currentViewers.value}`);
        }
        break;
      case 'error':
        addSystemMessage('error', message);
        break;
      case 'system':
        addSystemMessage('system', message);
        break;
      default:
        // 其他消息类型暂不处理
        console.log(`其他类型消息: ${type}`, message);
        break;
    }
  });
};

// 检查当前监控状态
const checkMonitoringStatus = async (id = null) => {
  try {
    // 首先尝试获取所有正在监控的直播间
    const response = await ipc.invoke(ipcApiRoute.livechat.getMonitoringStatus, {});

    if (response && response.status === 'success' && response.rooms && response.rooms.length > 0) {
      // 如果有正在监控的直播间，使用第一个
      const monitoringRoom = response.rooms[0];
      roomId.value = monitoringRoom.live_id;
      isConnected.value = true;

      // 启动定期清理定时器
      startCleanupTimer();
      addSystemMessage('system', `已恢复对直播间 ${roomId.value} 的监控状态`);
      return;
    }

    // 如果没有活跃的监控，则检查指定ID
    const checkId = id || roomId.value;

    if (checkId) {
      roomId.value = checkId; // 确保roomId被设置

      const result = await ipc.invoke(ipcApiRoute.livechat.getMonitoringStatus, {
        liveId: checkId
      });

      if (result && result.status === 'success') {
        isConnected.value = result.isMonitoring;
        if (isConnected.value) {
          // 如果正在监控，启动清理定时器
          startCleanupTimer();
          addSystemMessage('system', '已恢复直播间监控状态');
        }
      }
    }
  } catch (error) {
    console.error('检查监控状态错误:', error);
  }
};

// 定期清理过期消息
const startCleanupTimer = () => {
  // 清除现有的定时器
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }

  // 创建新的定时器
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const ONE_HOUR = 3600000; // 1小时的毫秒数

    // 清理超过1小时的成员消息
    if (memberMessages.value.length > 0) {
      memberMessages.value = memberMessages.value.filter(msg => {
        return (now - msg.timestamp) < ONE_HOUR;
      });
    }

    // 清理超过1小时的礼物消息
    if (giftMessages.value.length > 0) {
      giftMessages.value = giftMessages.value.filter(msg => {
        return (now - msg.timestamp) < ONE_HOUR;
      });
    }

    // 清理超过1小时的点赞消息
    if (likeMessages.value.length > 0) {
      likeMessages.value = likeMessages.value.filter(msg => {
        return (now - msg.timestamp) < ONE_HOUR;
      });
    }

    // 清理超过1小时的关注消息
    if (socialMessages.value.length > 0) {
      socialMessages.value = socialMessages.value.filter(msg => {
        return (now - msg.timestamp) < ONE_HOUR;
      });
    }

    console.log('已清理过期消息');
  }, CLEANUP_INTERVAL);
};

// 停止定期清理
const stopCleanupTimer = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
};

// 页面挂载时
onMounted(() => {
  // 设置IPC消息监听器
  setupIpcListeners();

  // 获取URL参数中的liveId
  const urlParams = new URLSearchParams(window.location.search);
  const liveIdParam = urlParams.get('liveId');

  // 检查当前监控状态
  checkMonitoringStatus(liveIdParam);
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
    display: flex;
    gap: 20px;
    margin-top: 20px;
    height: 710px;
  }

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

  // 聊天区域
  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;

    .chat-container {
      flex: 1;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 0 0 4px 4px;
      padding: 10px;
      background-color: #f9f9f9;
      text-align: left;
      min-height: 580px;

      .chat-item {
        margin-bottom: 8px;
        padding: 6px 10px;
        background-color: #f0f9eb;
        border-radius: 4px;
        word-break: break-all;
        text-align: left;

        .user {
          font-weight: bold;
          color: #67c23a;
          margin-right: 5px;
        }

        .content {
          color: #333;
        }
      }
    }
  }

  // 右侧面板
  .right-panel {
    width: 350px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;

    // 统计信息
    .stats-panel {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;

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

    // 系统消息
    .system-panel {
      .system-container {
        height: 100px;
        overflow-y: auto;
        border: 1px solid #e4e7ed;
        border-radius: 0 0 4px 4px;
        padding: 10px;
        background-color: #f9f9f9;

        .system-item {
          margin-bottom: 5px;
        }
      }
    }

    // 进场消息
    .member-panel {
      .member-container {
        height: 150px;
        overflow: hidden;
        border: 1px solid #e4e7ed;
        border-radius: 0 0 4px 4px;
        padding: 10px;
        background-color: #f9f9f9;

        .member-item {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          margin-bottom: 5px;
          background-color: #ecf5ff;
          border-radius: 4px;
          transition: all 0.3s ease;

          .member-name {
            margin: 0 8px;
            font-weight: bold;
            color: #409eff;
          }

          .member-action {
            color: #606266;
          }
        }
      }
    }

    // 礼物消息
    .gift-panel {
      .gift-container {
        height: 200px;
        overflow: hidden;
        border: 1px solid #e4e7ed;
        border-radius: 0 0 4px 4px;
        padding: 10px;
        background-color: #f9f9f9;

        .gift-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          margin-bottom: 8px;
          background-color: #fdf6ec;
          border-radius: 4px;
          transition: all 0.3s ease;

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
