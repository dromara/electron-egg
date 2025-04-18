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
      <el-row :gutter="20">
        <el-col :span="3">
          <el-select v-model="selectedQuality" placeholder="选择清晰度" style="width: 100%;">
            <el-option
              v-for="item in qualityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="21">
          <el-input
            v-model="liveUrl"
            placeholder="请输入主播直播间网址（尽量使用PC网页端的直播间地址）"
            class="live-url-input"
          >
            <template #append>
              <el-button @click="addLiveUrl">添加链接</el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <div class="one-block-1">
      <span>WebSocket连接状态:
        <el-tag :type="wsConnected ? 'success' : 'info'">
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
      <el-table :data="combinedTableData" border stripe style="margin-top: 15px;">
        <el-table-column type="index" label="ID" width="60" />
        <el-table-column prop="streamerName" label="主播名" width="120" />
        <el-table-column prop="url" label="链接" />
        <el-table-column prop="quality" label="画质" width="120">
          <template #default="{ row, $index }">
            <el-select
              v-model="row.quality"
              placeholder="选择清晰度"
              size="small"
              style="width: 100%"
              @change="(val) => updateQuality(row, val, $index)"
            >
              <el-option
                v-for="item in qualityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="录制状态">
          <template #default="scope">
            <el-tag :type="scope.row.recordStatus ? 'success' : 'info'">
              {{ scope.row.recordStatus ? '录制中' : '未录制' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row, $index }">
            <el-space>
              <el-tooltip content="删除直播链接" placement="top">
                <el-button
                  size="small"
                  type="danger"
                  icon="Delete"
                  circle
                  @click="removeStream(row, $index)"
                />
              </el-tooltip>
              <el-tooltip :content="row.isDisabled ? '恢复监控' : '停止监控'" placement="top">
                <el-button
                  size="small"
                  :type="row.isDisabled ? 'success' : 'warning'"
                  :icon="row.isDisabled ? 'VideoPlay' : 'VideoPause'"
                  circle
                  @click="toggleMonitoring(row, $index)"
                />
              </el-tooltip>
            </el-space>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import 'element-plus/es/components/message/style/css';

// 配置全局默认值：限制只显示一个消息
ElMessage.closeAll(); // 初始化时关闭所有消息
const showMessage = (message, type = 'info') => {
  ElMessage.closeAll(); // 显示新消息前关闭所有消息
  return ElMessage({
    message,
    type,
    duration: 3000,
    showClose: true
  });
};

// 服务器URL和WebSocket连接
const serverUrl = ref('');
const wsConnected = ref(false);
let eventSource = null;
const recorderRunning = ref(false); // 新增：录制器运行状态

// 记录每个直播的开始时间
const recordingStartTimes = ref({});
// 定时器ID，用于定期更新录制时长
let durationUpdateTimer = null;

// 直播链接输入
const liveUrl = ref('');

// 画质选项
const qualityOptions = [
  { value: '原画', label: '原画' },
  { value: '超清', label: '超清' },
  { value: '高清', label: '高清' },
  { value: '标清', label: '标清' },
  { value: '流畅', label: '流畅' }
];
const selectedQuality = ref('原画'); // 默认选择原画

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
      (rec) => {
        // 尝试匹配URL或部分URL
        return stream.url && (
          (rec.url && rec.url.includes(stream.url)) ||
          (rec.name && stream.url.includes(rec.name))
        );
      }
    );

    // 查找匹配的录制记录
    const matchingRecordUrl = isRecording ?
      Object.keys(recordingStartTimes.value).find(recUrl =>
        recUrl.includes(stream.url) || stream.url.includes(recUrl.split(' ').pop() || '')
      ) : null;

    // 计算录制时长（如果正在录制）
    const recordDuration = matchingRecordUrl ?
      calculateDuration(recordingStartTimes.value[matchingRecordUrl]) : '';

    return {
      streamerName: stream.streamerName,
      url: stream.url,
      quality: stream.quality,
      recordStatus: isRecording,
      recordDuration: recordDuration, // 添加录制时长
      isDisabled: stream.isDisabled // 是否被禁用（通过#注释）
    };
  });

  return allStreams;
});

// 获取Python服务地址
function getUrl() {
  ipc.invoke(ipcApiRoute.cross.getCrossUrl, {name: 'pyapp'}).then(url => {
    serverUrl.value = url;
    showMessage(`服务地址: ${url}`, 'info');

    // 获取到地址后先检查录制器状态
    checkRecorderStatus();
    
    // 然后尝试连接WebSocket
    connectEventSource();
  });
}

// 检查录制器状态
function checkRecorderStatus() {
  if (!serverUrl.value) return;
  
  fetch(`${serverUrl.value}/api/recorder/status`)
    .then(response => response.json())
    .then(data => {
      recorderRunning.value = data.running;
      
      // 如果录制器未运行，自动启动
      if (!recorderRunning.value) {
        startRecorder();
      }
    })
    .catch(error => {
      console.error('获取录制器状态失败:', error);
    });
}

// 启动录制器
function startRecorder() {
  if (!serverUrl.value) return;
  
  fetch(`${serverUrl.value}/api/recorder/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        recorderRunning.value = true;
        showMessage('录制器已启动', 'success');
      } else {
        showMessage('启动录制器失败', 'error');
      }
    })
    .catch(error => {
      console.error('启动录制器失败:', error);
      showMessage(`启动录制器失败: ${error}`, 'error');
    });
}

// 停止Python服务
function kill() {
  disconnectEventSource();
  ipc.invoke(ipcApiRoute.cross.killCrossServer, {type: 'one', name: 'pyapp'}).then(() => {
    recorderRunning.value = false;
    showMessage('服务已停止', 'success');
  });
}

// 启动Python服务
function create() {
  ipc.invoke(ipcApiRoute.cross.createCrossServer, { program: 'python' }).then(() => {
    showMessage('服务启动中...', 'success');
    // 短暂延迟后获取URL并连接
    setTimeout(() => {
      getUrl();
    }, 2000);
  });
}

// 连接到服务器事件流(SSE)
function connectEventSource() {
  if (!serverUrl.value) {
    showMessage('请先获取服务地址', 'warning');
    return;
  }

  // 获取SSE地址
  const sseUrl = serverUrl.value + '/api/sse/recorder/status';

  // 关闭已有连接
  disconnectEventSource();

  // 创建新连接
  eventSource = new EventSource(sseUrl);

  eventSource.onopen = () => {
    wsConnected.value = true;
    showMessage('服务器事件流连接成功', 'success');
    // 开始定时更新录制时长
    startDurationTimer();
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // 处理状态更新数据
      statusData.value = data;

      // 更新录制开始时间记录
      if (data.recording && data.recording.length > 0) {
        data.recording.forEach(rec => {
          // 保存每个直播流的开始时间
          recordingStartTimes.value[rec.url] = rec.start_time;
        });

        // 检查是否有已停止录制的直播，从记录中移除
        Object.keys(recordingStartTimes.value).forEach(url => {
          const stillRecording = data.recording.some(rec => rec.url === url);
          if (!stillRecording) {
            delete recordingStartTimes.value[url];
          }
        });
      } else if (data.recording && data.recording.length === 0) {
        // 所有录制已停止
        recordingStartTimes.value = {};
      }
    } catch (e) {
      console.error('解析服务器事件数据失败:', e);
    }
  };

  eventSource.onerror = () => {
    wsConnected.value = false;
    showMessage('服务器事件流连接失败或已关闭', 'warning');
    // 停止定时器
    stopDurationTimer();

    // 自动尝试重连
    setTimeout(() => {
      if (!wsConnected.value) {
        connectEventSource();
      }
    }, 5000);
  };
}

// 启动定时更新录制时长的计时器
function startDurationTimer() {
  stopDurationTimer(); // 先停止可能存在的旧计时器
  durationUpdateTimer = setInterval(() => {
    // 强制更新计算属性
    combinedTableData.value = [...combinedTableData.value];
  }, 1000); // 每秒更新一次
}

// 停止定时更新录制时长的计时器
function stopDurationTimer() {
  if (durationUpdateTimer) {
    clearInterval(durationUpdateTimer);
    durationUpdateTimer = null;
  }
}

// 断开SSE连接
function disconnectEventSource() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    wsConnected.value = false;
    stopDurationTimer();
  }
}

// 替换原有的WebSocket连接/断开函数
const connectWebSocket = connectEventSource;
const disconnectWebSocket = disconnectEventSource;

// 计算录制持续时间的函数
function calculateDuration(startTimeStr) {
  if (!startTimeStr) return '';

  const startTime = new Date(startTimeStr);
  const now = new Date();
  const diff = Math.floor((now - startTime) / 1000); // 秒数差

  // 格式化为 小时:分钟:秒
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 添加直播链接
function addLiveUrl() {
  if (!liveUrl.value) {
    showMessage('请输入直播链接', 'warning');
    return;
  }

  // 获取当前的画质和链接
  const quality = selectedQuality.value;
  const url = liveUrl.value.trim();

  if (!url.startsWith('http')) {
    showMessage('请输入有效的URL，必须以http或https开头', 'warning');
    return;
  }

  // 构建参数对象
  const params = {
    quality: quality,
    url: url
  };

  // 使用IPC调用来添加链接
  ipc.invoke(ipcApiRoute.livesave.addLiveUrl, params).then(res => {
    if (res.success) {
      showMessage(res.message, 'success');

      // 清空输入框
      liveUrl.value = '';
      // 重置为默认画质
      selectedQuality.value = '原画';

      // 刷新配置列表
      getLatestConfig();
    } else {
      showMessage(res.message || '添加链接失败', 'error');
    }
  }).catch(err => {
    showMessage(`添加链接失败: ${err}`, 'error');
  });
}

// 更新直播流画质
function updateQuality(row, newQuality, index) {
  // 确保行数据有效
  if (!row || !row.url) {
    return;
  }

  // 构建参数对象 - 添加行索引
  const params = {
    lineIndex: index,  // 行号（0-based）
    url: row.url,
    newQuality: newQuality
  };

  // 直接更新本地数据，给用户即时反馈
  row.quality = newQuality;

  // 使用IPC调用来更新画质，并处理返回的消息
  ipc.invoke(ipcApiRoute.livesave.updateQuality, params)
    .then(res => {
      if (res.success) {
        // 使用服务层返回的成功消息
        showMessage(res.message || `已将画质更新为: ${newQuality}`, 'success');
      }

    })
}

// 删除直播流
function removeStream(row, index) {
  // 确保行数据有效
  if (!row || !row.url) {
    showMessage('无效的直播流数据', 'error');
    return;
  }

  console.log(`尝试删除第 ${index} 行（0-based索引）`);

  // 构建参数对象 - 使用行索引
  const params = {
    lineIndex: index,  // 行号（0-based）
    url: row.url,
    quality: row.quality
  };

  // 使用IPC调用来删除链接
  ipc.invoke(ipcApiRoute.livesave.removeStream, params).then(res => {
    if (res.success) {
      showMessage('已删除直播链接', 'success');
      // 刷新配置列表
      getLatestConfig();
    } else {
      showMessage('删除直播链接失败', 'error');
    }
  }).catch(err => {
    showMessage('删除直播链接失败', 'error');
  });
}

// 监听配置更新消息
function listenConfigUpdate() {
  // 定义监听通道 - 必须与后端发送消息的通道一致
  const channel = 'controller/live_monitor/configUpdate';

  // 确保只监听一次
  ipc.removeAllListeners(channel);
  ipc.on(channel, (event, data) => {
    if (data && data.type === 'live_config_update') {
      configData.value = data;
      console.log('[IPC] 收到配置更新:', data);
      // 不每次配置更新都显示提示，减少提示数量
      // showMessage(`配置已更新，共${data.streams ? data.streams.length : 0}条直播信息`, 'success');
    } else if (data && data.type === 'error') {
      showMessage(`配置更新错误: ${data.message}`, 'error');
    }
  });
}

// 获取最新配置
function getLatestConfig() {
  ipc.invoke(ipcApiRoute.livesave.getLatestConfig).then(res => {
    if (res.success) {
      // 不显示获取配置成功的提示，减少提示数量
      // showMessage(res.message, 'success');
    } else {
      showMessage(res.message, 'error');
    }
  });
}

// 切换直播监控状态（启用/禁用）
function toggleMonitoring(row, index) {
  // 确保行数据有效
  if (!row || !row.url) {
    showMessage('无效的直播流数据', 'error');
    return;
  }

  // 构建参数对象
  const params = {
    lineIndex: index,  // 行号（0-based）
    url: row.url,
    quality: row.quality,
    disable: !row.isDisabled  // 切换状态
  };

  // 使用IPC调用来切换监控状态
  ipc.invoke(ipcApiRoute.livesave.toggleStreamMonitoring, params).then(res => {
    if (res.success) {
      showMessage(res.message || `已${params.disable ? '停止' : '恢复'}监控`, 'success');
      // 刷新配置列表
      getLatestConfig();
    } else {
      showMessage(res.message || '切换监控状态失败', 'error');
    }
  }).catch(err => {
    showMessage(`切换监控状态失败: ${err}`, 'error');
  });
}

// 组件挂载时
onMounted(() => {
  console.log('Live_save页面已加载');
  // 初始化监听
  initListeners();

  // 主动获取一次最新配置
  getLatestConfig();
});

// 初始化所有事件监听器
function initListeners() {
  // 定义监听通道 - 必须与后端发送消息的通道一致
  const channel = 'controller/live_monitor/configUpdate';

  // 清除可能存在的旧监听器
  ipc.removeAllListeners(channel);

  // 设置配置更新监听
  listenConfigUpdate();
}

// 组件卸载时
onUnmounted(() => {
  disconnectEventSource();
  stopDurationTimer();

  // 定义监听通道 - 必须与后端发送消息的通道一致
  const channel = 'controller/live_monitor/configUpdate';
  ipc.removeAllListeners(channel);
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

.status-tag-container {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-tag {
  transition: all 0.3s;
  min-width: 64px;
  text-align: center;
}
</style>
