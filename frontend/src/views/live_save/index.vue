<template>
  <div class="live-save-container">
    <div class="one-block-1">
      <span>直播录制WebSocket监控</span>
    </div>
    <div class="one-block-2">
      <a-space>
        <a-button type="primary" @click="create()">启动服务</a-button>
        <a-button @click="getUrl()">获取地址</a-button>
        <a-button danger @click="kill()">停止服务</a-button>
      </a-space>
    </div>

    <div class="one-block-1">
      <span>WebSocket连接状态: 
        <a-tag :color="wsConnected ? 'success' : 'error'">
          {{ wsConnected ? '已连接' : '未连接' }}
        </a-tag>
      </span>
    </div>

    <div class="one-block-2">
      <div class="status-overview">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card title="监测直播数" :bordered="false">
              <p class="card-value">{{ statusData.monitoring_count || 0 }}</p>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card title="网络线程数" :bordered="false">
              <p class="card-value">{{ statusData.max_request || 0 }}</p>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card title="瞬时错误数" :bordered="false">
              <p class="card-value">{{ statusData.error_count || 0 }}</p>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card title="当前时间" :bordered="false">
              <p class="card-value">{{ statusData.current_time || '--:--:--' }}</p>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>

    <div class="one-block-1">
      <span>录制列表</span>
    </div>
    <div class="one-block-2">
      <a-table :dataSource="recordingData" :columns="recordingColumns" bordered>
        <template #emptyText>
          <span>暂无录制任务</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { message } from 'ant-design-vue';

// 服务器URL和WebSocket连接
const serverUrl = ref('');
const wsConnected = ref(false);
let socket = null;

// 状态数据
const statusData = ref({
  monitoring_count: 0,
  max_request: 0,
  use_proxy: false,
  split_video: {
    enabled: false,
    time: null
  },
  create_time_file: false,
  video_quality: '--',
  video_format: '--',
  error_count: 0,
  current_time: '--:--:--',
  recording: []
});

// 表格列定义
const recordingColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '画质', dataIndex: 'quality', key: 'quality' },
  { title: '已录制时长', dataIndex: 'duration', key: 'duration' }
];

// 计算属性：录制中的直播列表
const recordingData = computed(() => {
  return statusData.value.recording.map((item, index) => ({
    key: index,
    name: item.name,
    quality: item.quality,
    duration: item.duration
  }));
});

// 获取Python服务地址
function getUrl() {
  ipc.invoke(ipcApiRoute.cross.getCrossUrl, {name: 'pyapp'}).then(url => {
    serverUrl.value = url;
    message.info(`服务地址: ${url}`);
    
    // 获取到地址后尝试连接WebSocket
    connectWebSocket();
  });
}

// 停止Python服务
function kill() {
  disconnectWebSocket();
  ipc.invoke(ipcApiRoute.cross.killCrossServer, {type: 'one', name: 'pyapp'}).then(() => {
    message.success('服务已停止');
  });
}

// 启动Python服务
function create() {
  ipc.invoke(ipcApiRoute.cross.createCrossServer, { program: 'python' }).then(() => {
    message.success('服务启动中...');
    // 短暂延迟后获取URL并连接
    setTimeout(() => {
      getUrl();
    }, 2000);
  });
}

// 连接WebSocket
function connectWebSocket() {
  if (!serverUrl.value) {
    message.warning('请先获取服务地址');
    return;
  }
  
  // 获取WebSocket地址
  const wsUrl = serverUrl.value.replace('http://', 'ws://') + '/ws/status';
  
  // 关闭已有连接
  disconnectWebSocket();
  
  // 创建新连接
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    wsConnected.value = true;
    message.success('WebSocket连接成功');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      statusData.value = data;
    } catch (e) {
      console.error('解析WebSocket数据失败:', e);
    }
  };
  
  socket.onclose = () => {
    wsConnected.value = false;
    message.warning('WebSocket连接已关闭');
  };
  
  socket.onerror = (error) => {
    wsConnected.value = false;
    console.error('WebSocket错误:', error);
    message.error('WebSocket连接失败');
  };
}

// 断开WebSocket连接
function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
    wsConnected.value = false;
  }
}

// 组件挂载时
onMounted(() => {
  console.log('Live_save页面已加载');
});

// 组件卸载时
onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style lang="less" scoped>
.live-save-container {
  padding: 20px;
  text-align: left;
  
  .one-block-1 {
    font-size: 16px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .one-block-2 {
    margin-bottom: 20px;
  }
  
  .status-overview {
    margin-top: 10px;
    margin-bottom: 20px;
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin: 0;
    }
  }
}
</style>
