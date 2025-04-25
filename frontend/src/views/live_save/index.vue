<template>
  <div class="live-save-container">
    <div class="one-block-1">
      <span>直播录制服务</span>
    </div>
    <div class="one-block-2">
      <el-space>
        <el-button type="primary" @click="startRecorder()" :disabled="recorderRunning">启动服务</el-button>
        <el-button type="danger" @click="kill()" :disabled="!recorderRunning">停止服务</el-button>
        <el-button type="success" @click="openDownloadsFolder()">打开录制目录</el-button>
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
      <span>录制器状态:
        <el-tag :type="recorderRunning ? 'success' : 'info'">
          {{ recorderRunning ? '运行中' : '未运行' }}
        </el-tag>
      </span>
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
            <el-tag :type="getRecordStatusType(scope.row)">
              {{ getRecordStatusText(scope.row) }}
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
import { ipcApiRoute } from '@/api';
import path from 'path';

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

// 服务器URL
const serverUrl = ref('');
const recorderRunning = ref(false); // 录制器运行状态

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
const statusData = ref({});

// 添加配置数据
const configData = ref({
  streams: [],
  timestamp: ''
});

// 计算属性：合并表格数据
const combinedTableData = computed(() => {
  // 从配置数据获取所有直播流
  const allStreams = configData.value.streams.map((stream) => {
    return {
      streamerName: stream.streamerName,
      url: stream.url,
      quality: stream.quality,
      isDisabled: stream.isDisabled, // 是否被禁用（通过#注释）
      recordStatus: stream.recordStatus
    };
  });

  return allStreams;
});

// 启动录制服务
function startRecorder() {
  ipc.invoke(ipcApiRoute.livesave.startRecorder, { program: 'python' }).then(res => {
    if (res.success) {
      showMessage('服务启动成功', 'success');
      // 获取服务地址
      getServerUrl();
      // 更新所有直播流的录制状态
      if (configData.value.streams) {
        configData.value.streams.forEach(stream => {
          stream.recordStatus = true;
        });
      }
    } else {
      showMessage('服务启动失败: ' + (res.message || '未知错误'), 'error');
    }
  }).catch(err => {
    showMessage('服务启动错误: ' + err.message, 'error');
  });
}

// 停止录制服务
function kill() {
  ipc.invoke(ipcApiRoute.livesave.stopRecorder, { program: 'python' }).then(res => {
    if (res.success) {
      showMessage('服务停止成功', 'success');
      recorderRunning.value = false;
      // 更新所有直播流的录制状态
      if (configData.value.streams) {
        configData.value.streams.forEach(stream => {
          stream.recordStatus = false;
        });
      }
    } else {
      showMessage('服务停止失败: ' + (res.message || '未知错误'), 'error');
    }
  }).catch(err => {
    showMessage('服务停止错误: ' + err.message, 'error');
  });
}

// 获取服务地址并标记录制器状态
function getServerUrl() {
  ipc.invoke(ipcApiRoute.cross.getCrossUrl, {name: 'DouyinLiveRecorder'}).then(url => {
    if (url) {
      serverUrl.value = url;
      showMessage(`已获取服务地址: ${url}`, 'info');
      // 标记录制器为运行状态
      recorderRunning.value = true;
    } else {
      showMessage('无法获取服务地址', 'warning');
    }
  }).catch(err => {
    showMessage('获取服务地址失败: ' + err.message, 'error');
  });
}

// 添加直播链接
function addLiveUrl() {
  if (!liveUrl.value) {
    showMessage('请输入直播链接或直播间号', 'warning');
    return;
  }

  // 获取当前的画质和链接
  const quality = selectedQuality.value;
  let url = liveUrl.value.trim();

  // 判断输入是否为纯数字（直播间号）
  if (/^\d+$/.test(url)) {
    url = `https://live.douyin.com/${url}`;
  } else if (!url.startsWith('http')) {
    showMessage('请输入有效的URL（以http开头）或直播间号（纯数字）', 'warning');
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
  ipc.invoke(ipcApiRoute.livesave.getLatestConfig, {}).then(res => {
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

// 打开录制文件保存目录
function openDownloadsFolder() {
  ipc.invoke(ipcApiRoute.livesave.openDownloadsFolder, {})
    .then(res => {
      if (res.success) {
        showMessage(res.message, 'success');
      } else {
        showMessage(res.message || '打开录制文件目录失败', 'error');
      }
    })
    .catch(err => {
      showMessage(`打开目录失败: ${err}`, 'error');
    });
}

// 获取录制状态标签类型
function getRecordStatusType(row) {
  if (row.isDisabled) {
    return 'warning'; // 暂停状态显示黄色
  }
  return row.recordStatus ? 'success' : 'info';
}

// 获取录制状态文本
function getRecordStatusText(row) {
  if (row.isDisabled) {
    return '录制暂停';
  }
  return row.recordStatus ? '录制中' : '未录制';
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
