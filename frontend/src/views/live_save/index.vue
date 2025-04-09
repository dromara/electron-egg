<template>
  <div class="live-save-container">
    <div class="one-block-1">
      <span>直播录制WebSocket监控</span>
    </div>
    <div class="one-block-2">
      <el-space>
        <el-button type="primary" @click="create()">启动服务</el-button>
        <el-button @click="getUrl()">获取地址</el-button>
        <el-button type="danger" @click="kill()">停止服务</el-button>
      </el-space>
    </div>

    <div class="one-block-1">
      <span>添加直播链接</span>
    </div>
    <div class="one-block-2">
      <el-input 
        v-model="liveUrl" 
        placeholder="请输入主播直播间网址（尽量使用PC网页端的直播间地址）" 
        class="live-url-input"
      >
        <template #append>
          <el-button @click="addLiveUrl">添加链接</el-button>
        </template>
      </el-input>
    </div>

    <div class="one-block-1">
      <span>WebSocket连接状态: 
        <el-tag :type="wsConnected ? 'success' : 'danger'">
          {{ wsConnected ? '已连接' : '未连接' }}
        </el-tag>
      </span>
    </div>

    <div class="one-block-2">
      <div class="status-overview">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">监测直播数</div>
              </template>
              <p class="card-value">{{ statusData.monitoring_count || 0 }}</p>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">网络线程数</div>
              </template>
              <p class="card-value">{{ statusData.max_request || 0 }}</p>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">瞬时错误数</div>
              </template>
              <p class="card-value">{{ statusData.error_count || 0 }}</p>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">当前时间</div>
              </template>
              <p class="card-value">{{ statusData.current_time || '--:--:--' }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="one-block-1">
      <span>直播监控列表</span>
    </div>
    <div class="one-block-2">
      <el-space>
        <el-button type="primary" @click="startMonitoring">启动配置监控</el-button>
        <el-button @click="getLatestConfig">获取最新配置</el-button>
        <el-button type="danger" @click="stopMonitoring">停止配置监控</el-button>
      </el-space>
      <el-table :data="combinedTableData" border stripe style="margin-top: 15px;">
        <el-table-column prop="streamerName" label="主播名" />
        <el-table-column prop="url" label="链接" />
        <el-table-column prop="quality" label="画质" />
        <el-table-column prop="recordStatus" label="录制状态">
          <template #default="scope">
            <el-tag :type="scope.row.recordStatus ? 'success' : 'info'">
              {{ scope.row.recordStatus ? '录制中' : '未录制' }}
            </el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无直播配置数据" />
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';

// 服务器URL和WebSocket连接
const serverUrl = ref('');
const wsConnected = ref(false);
let socket = null;

// 直播链接输入
const liveUrl = ref('');

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

// 添加配置数据
const configData = ref({
  streams: [],
  timestamp: ''
});

// 计算属性：合并表格数据
const combinedTableData = computed(() => {
  // 从配置数据获取所有直播流
  const allStreams = configData.value.streams.map((stream) => {
    // 检查是否正在录制中
    const isRecording = statusData.value.recording.some(
      (rec) => rec.url && stream.url && rec.url.includes(stream.url)
    );
    
    return {
      streamerName: stream.streamerName,
      url: stream.url,
      quality: stream.quality,
      recordStatus: isRecording
    };
  });
  
  return allStreams;
});

// 获取Python服务地址
function getUrl() {
  ipc.invoke(ipcApiRoute.cross.getCrossUrl, {name: 'pyapp'}).then(url => {
    serverUrl.value = url;
    ElMessage.info(`服务地址: ${url}`);
    
    // 获取到地址后尝试连接WebSocket
    connectWebSocket();
  });
}

// 停止Python服务
function kill() {
  disconnectWebSocket();
  ipc.invoke(ipcApiRoute.cross.killCrossServer, {type: 'one', name: 'pyapp'}).then(() => {
    ElMessage.success('服务已停止');
  });
}

// 启动Python服务
function create() {
  ipc.invoke(ipcApiRoute.cross.createCrossServer, { program: 'python' }).then(() => {
    ElMessage.success('服务启动中...');
    // 短暂延迟后获取URL并连接
    setTimeout(() => {
      getUrl();
    }, 2000);
  });
}

// 连接WebSocket
function connectWebSocket() {
  if (!serverUrl.value) {
    ElMessage.warning('请先获取服务地址');
    return;
  }
  
  // 获取WebSocket地址 - 更新为新的路径格式
  const wsUrl = serverUrl.value.replace('http://', 'ws://') + '/ws/recorder/status';
  
  // 关闭已有连接
  disconnectWebSocket();
  
  // 创建新连接
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    wsConnected.value = true;
    ElMessage.success('WebSocket连接成功');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // 处理url/add的响应
      if (data.type === 'url/add/response') {
        if (data.success) {
          ElMessage.success(data.message);
          liveUrl.value = ''; // 清空输入框
        } else {
          ElMessage.error(data.message);
        }
        return;
      }
      
      // 处理状态更新数据
      statusData.value = data;
    } catch (e) {
      console.error('解析WebSocket数据失败:', e);
    }
  };
  
  socket.onclose = () => {
    wsConnected.value = false;
    ElMessage.warning('WebSocket连接已关闭');
  };
  
  socket.onerror = (error) => {
    wsConnected.value = false;
    console.error('WebSocket错误:', error);
    ElMessage.error('WebSocket连接失败');
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

// 添加直播链接
function addLiveUrl() {
  if (!liveUrl.value) {
    ElMessage.warning('请输入直播链接');
    return; 
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    ElMessage.warning('WebSocket未连接,请先启动服务');
    return;
  }

  // 通过WebSocket发送添加URL的消息
  socket.send(JSON.stringify({
    type: 'url/add',
    url: liveUrl.value
  }));
  
  // 短暂延迟后刷新配置数据
  setTimeout(() => {
    getLatestConfig();
  }, 1000);
}

// 监听配置更新消息
function listenConfigUpdate() {
  ipc.on('controller/live_monitor/configUpdate', (data) => {
    configData.value = data;
    ElMessage.success('配置已更新');
  });
}

// 启动监控
// function startMonitoring() {
//   ipc.invoke(ipcApiRoute.live_monitor.startMonitoring).then(res => {
//     if (res.success) {
//       ElMessage.success(res.message);
//     } else {
//       ElMessage.error(res.message);
//     }
//   });
// }

function startMonitoring() {
  ipc.invoke(ipcApiRoute.live_monitor.test).then(res => {
    console.log('r:', res);
    ElMessage.success(res.message);
  });
}

// 停止监控
function stopMonitoring() {
  ipc.invoke(ipcApiRoute.live_monitor.stopMonitoring).then(res => {
    if (res.success) {
      ElMessage.success(res.message);
    } else {
      ElMessage.error(res.message);
    }
  });
}

// 获取最新配置
function getLatestConfig() {
  ipc.invoke(ipcApiRoute.live_monitor.getLatestConfig).then(res => {
    if (res.success) {
      ElMessage.success(res.message);
    } else {
      ElMessage.error(res.message);
    }
  });
}

// 组件挂载时
onMounted(() => {
  console.log('Live_save页面已加载');
  listenConfigUpdate();
});

// 组件卸载时
onUnmounted(() => {
  disconnectWebSocket();
  ipc.removeAllListeners('controller/live_monitor/configUpdate');
});
</script>

<style lang="less" scoped>
.live-save-container {
  padding: 10px 20px;
  text-align: left;
  
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
  
  .live-url-input {
    width: 100%;
  }
  
  .status-overview {
    margin-top: 10px;
    margin-bottom: 20px;
    
    .card-header {
      font-size: 14px;
      font-weight: bold;
    }
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin: 0;
    }
  }
}
</style>
