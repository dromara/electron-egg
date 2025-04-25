<template>
  <div class="auto-text-reply-container">
    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧设置区 -->
      <div class="left-panel">
        <div class="panel-section">
          <div class="setting-item">
            <div class="setting-label">播放间隔设置</div>
            <div class="time-inputs">
              <el-input v-model.number="audioSettings.minInterval" size="small" style="width: 60px" />
              <span class="separator">—</span>
              <el-input v-model.number="audioSettings.maxInterval" size="small" style="width: 60px" />
              <span class="unit">秒</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">播放模式</div>
            <div class="play-mode">
              <el-radio-group v-model="audioSettings.playMode" size="small">
                <el-radio :value="'random'" label="随机播放"></el-radio>
                <el-radio :value="'sequential'" label="顺序播放"></el-radio>
              </el-radio-group>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">输出设备</div>
            <div class="device-selector">
              <el-select v-model="selectedAudioDevice" placeholder="选择音频输出设备" style="width: 100%;" @change="updateAudioDevice">
                <el-option
                  v-for="device in audioDevices"
                  :key="device.index"
                  :label="device.name"
                  :value="device.index"
                />
              </el-select>
              <el-button size="small" @click="refreshAudioDevices" :loading="loadingAudioDevices" class="refresh-btn">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">播放音量</div>
            <div class="voice-slider">
              <el-slider v-model="audioSettings.volume" :min="0" :max="100" :step="1" :show-tooltip="false" />
              <span class="slider-value">{{ audioSettings.volume }}%</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">播放倍速</div>
            <div class="voice-slider">
              <el-slider v-model="audioSettings.playbackRate" :min="0.5" :max="2" :step="0.1" :show-tooltip="false" />
              <span class="slider-value">{{ audioSettings.playbackRate.toFixed(1) }}x</span>
            </div>
          </div>

          <div class="tips-box">
            <div class="tip-line">友情提示：</div>
            <div class="tip-line">• 播放间隔建议30-60秒</div>
            <div class="tip-line">• 音频文件放在extraResources/audio文件夹</div>
            <div class="tip-line">• 每个子文件夹代表一个音频组</div>
            <div class="tip-line">• 支持MP3, WAV等格式</div>
            <div class="tip-line">• 会从不同分组随机选择音频播放</div>
          </div>

          <el-button
            :type="isVoiceEnabled ? 'danger' : 'success'"
            @click="isVoiceEnabled ? disableVoiceAssistant() : enableVoiceAssistant()"
            :loading="loading"
            :disabled="!selectedAudioGroup"
            class="control-button"
          >
            {{ isVoiceEnabled ? '停止语音助手' : '启动语音助手' }}
          </el-button>
        </div>
      </div>

      <!-- 右侧音频文件列表区 -->
      <div class="right-panel">
        <div class="panel-section">
          <!-- 表格上方的操作区域 -->
          <div class="table-header">
            <div class="left-controls">
              <div class="group-selector">
                <span class="selector-label">音频组:</span>
                <el-select v-model="selectedAudioGroup" placeholder="选择音频组" size="small" class="group-select" @change="getAudioFiles(selectedAudioGroup)">
                  <el-option
                    v-for="group in audioGroups"
                    :key="group"
                    :label="group"
                    :value="group"
                  />
                </el-select>
                <el-button size="small" @click="refreshAudioGroups" :loading="loadingAudioGroups" class="refresh-btn">
                  <el-icon><Refresh /></el-icon>
                </el-button>
                <el-button size="small" @click="openAudioGroupFolder" class="folder-btn">
                  <el-icon><Folder /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 音频文件表格 -->
          <el-table
            :data="audioFiles"
            border
            style="width: 100%"
            max-height="350"
            stripe
            size="small"
            v-loading="loadingAudioFiles"
          >
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="name" label="文件名">
              <template #default="scope">
                <div class="file-name">{{ scope.row.name }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100">
              <template #default="scope">
                <div>{{ formatFileSize(scope.row.size) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button link size="small" @click="playAudioFile(scope.row)">播放</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject, onBeforeUnmount } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';
import { Refresh, Folder } from '@element-plus/icons-vue';
import { useLivechatStore } from '@/stores/livechatStore';
import axios from 'axios';

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);
const livechatStore = useLivechatStore();

// 状态变量
const roomId = ref(sharedState?.roomId || livechatStore.roomId || '');
const connected = ref(sharedState?.connected || livechatStore.connected || false);
const isVoiceEnabled = ref(false);
const loading = ref(false);
const pythonBaseUrl = ref('');

// 音频组
const audioGroups = ref([]);
const selectedAudioGroup = ref('');
const audioFiles = ref([]);
const loadingAudioGroups = ref(false);
const loadingAudioFiles = ref(false);

// 音频设备
const audioDevices = ref([]);
const selectedAudioDevice = ref(null);
const loadingAudioDevices = ref(false);

// 音频播放设置
const audioSettings = ref({
  volume: 80,
  playbackRate: 1.0,
  minInterval: 5,
  maxInterval: 10,
  playMode: 'random',
  deviceId: null // 用于存储选中的设备ID
});

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 获取Python服务的基础URL
const getPythonBaseUrl = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.cross.getCrossUrl, { name: 'AudioPlayer' });
    if (result) {
      pythonBaseUrl.value = result;
      console.log('Python服务基础URL:', pythonBaseUrl.value);
      return result;
    } else {
      console.error('获取Python服务基础URL失败');
      ElMessage.error('获取Python服务基础URL失败');
      return null;
    }
  } catch (error) {
    console.error('获取Python服务基础URL出错:', error);
    ElMessage.error('获取Python服务基础URL出错: ' + (error.message || '未知错误'));
    return null;
  }
};

// 获取音频设备列表 - 使用Python服务
const getAudioDevices = async () => {
  loadingAudioDevices.value = true;
  try {
    const baseUrl = pythonBaseUrl.value || await getPythonBaseUrl();
    if (!baseUrl) {
      throw new Error('无法获取Python服务地址');
    }

    const response = await axios.get(`${baseUrl}/api/devices`);

    if (response.data && response.data.code === 0) {
      audioDevices.value = response.data.data;
      console.log('获取到音频输出设备列表:', audioDevices.value);

      // 首先尝试加载保存的设备设置
      const savedSettings = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
        action: 'get',
        table: 'settings',
        key: 'audioDevice'
      });

      if (savedSettings && savedSettings.status === 'success' && savedSettings.data) {
        const savedDeviceId = savedSettings.data.deviceId;
        // 检查保存的设备是否在当前设备列表中
        const deviceExists = audioDevices.value.some(d => d.index === savedDeviceId);

        if (deviceExists) {
          selectedAudioDevice.value = savedDeviceId;
          audioSettings.value.deviceId = savedDeviceId;
          console.log('已恢复设备设置:', savedDeviceId);
          return;  // 已找到保存的设备，不需要默认选择第一个设备
        } else {
          console.log('保存的设备不在当前设备列表中');
        }
      }

      // 如果没有保存的设备设置或设备不存在，则选择第一个设备
      if (audioDevices.value.length > 0 && !selectedAudioDevice.value) {
        selectedAudioDevice.value = audioDevices.value[0].index;
        audioSettings.value.deviceId = selectedAudioDevice.value;
        // 保存第一个设备作为默认设备
        saveDeviceSetting(selectedAudioDevice.value);
      }
    } else {
      throw new Error(response.data?.message || '获取设备列表失败');
    }
  } catch (error) {
    console.error('获取音频设备列表出错:', error);
    ElMessage.error('获取音频设备列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingAudioDevices.value = false;
  }
};

// 刷新音频设备列表
const refreshAudioDevices = async () => {
  await getAudioDevices();
};

// 更新选中的音频设备
const updateAudioDevice = (deviceId) => {
  audioSettings.value.deviceId = deviceId;
  // 保存设备ID到设置中，后续会通过API传递给后端
  console.log('已选择音频设备:', deviceId);
  // 查找设备名称，用于显示
  const device = audioDevices.value.find(d => d.index === deviceId);
  if (device) {
    ElMessage.success(`已选择输出设备: ${device.name || '默认设备'}`);
    // 保存设备设置到本地存储
    saveDeviceSetting(deviceId);
  }
};

// 保存设备设置到本地存储
const saveDeviceSetting = async (deviceId) => {
  try {
    // 使用jsondb保存设备设置
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'set',
      table: 'settings',
      key: 'audioDevice',
      value: {
        deviceId: deviceId,
        timestamp: new Date().getTime()
      }
    });

    if (result && result.status === 'success') {
      console.log('设备设置已保存');
    } else {
      console.error('保存设备设置失败:', result?.message);
    }
  } catch (error) {
    console.error('保存设备设置出错:', error);
  }
};

// 加载保存的设备设置
const loadDeviceSetting = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.framework.jsondbOperation, {
      action: 'get',
      table: 'settings',
      key: 'audioDevice'
    });

    if (result && result.status === 'success' && result.data) {
      const savedDevice = result.data;
      console.log('加载到保存的设备设置:', savedDevice);

      // 如果设备列表已加载，检查设备是否存在
      if (audioDevices.value.length > 0) {
        const deviceExists = audioDevices.value.some(d => d.index === savedDevice.deviceId);
        if (deviceExists) {
          selectedAudioDevice.value = savedDevice.deviceId;
          audioSettings.value.deviceId = savedDevice.deviceId;
          console.log('已恢复设备设置:', savedDevice.deviceId);
        } else {
          console.log('保存的设备不存在于当前设备列表中');
        }
      } else {
        // 设备列表尚未加载，先保存设置，等设备列表加载后再检查
        const tempDeviceId = savedDevice.deviceId;
        // 在getAudioDevices函数完成后会检查这个临时设备ID
        // 见下面对getAudioDevices函数的修改
      }
    }
  } catch (error) {
    console.error('加载设备设置出错:', error);
  }
};

// 获取音频组列表
const getAudioGroups = async () => {
  loadingAudioGroups.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getAudioGroups);
    if (result && result.status === 'success' && result.data) {
      audioGroups.value = result.data;
      console.log('获取到音频组列表:', audioGroups.value);

      // 如果当前选中的音频组不在列表中，重置选择
      if (selectedAudioGroup.value && !audioGroups.value.includes(selectedAudioGroup.value)) {
        selectedAudioGroup.value = audioGroups.value.length > 0 ? audioGroups.value[0] : '';
      } else if (!selectedAudioGroup.value && audioGroups.value.length > 0) {
        selectedAudioGroup.value = audioGroups.value[0];
      }
    } else {
      console.error('获取音频组列表失败:', result?.message);
      ElMessage.warning('获取音频组列表失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取音频组列表出错:', error);
    ElMessage.error('获取音频组列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingAudioGroups.value = false;
  }
};

// 刷新音频组列表
const refreshAudioGroups = async () => {
  await getAudioGroups();
};

// 获取音频文件列表
const getAudioFiles = async (groupName) => {
  if (!groupName) return;

  loadingAudioFiles.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getAudioFiles, { groupName });
    if (result && result.status === 'success' && result.data) {
      audioFiles.value = result.data;
      console.log('获取到音频文件列表:', audioFiles.value);
    } else {
      console.error('获取音频文件列表失败:', result?.message);
      audioFiles.value = [];
      ElMessage.warning('获取音频文件列表失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取音频文件列表出错:', error);
    audioFiles.value = [];
    ElMessage.error('获取音频文件列表出错: ' + (error.message || '未知错误'));
  } finally {
    loadingAudioFiles.value = false;
  }
};

// 播放单个音频文件（测试用） - 使用Python服务
const playAudioFile = async (file) => {
  try {
    console.log('请求播放音频文件:', file.path);

    if (!selectedAudioDevice.value) {
      ElMessage.warning('请先选择音频输出设备');
      return;
    }

    const baseUrl = pythonBaseUrl.value || await getPythonBaseUrl();
    if (!baseUrl) {
      throw new Error('无法获取Python服务地址');
    }

    // 使用Python服务API播放音频
    const response = await axios.post(`${baseUrl}/api/play`, {
      file_path: file.path,
      device_id: selectedAudioDevice.value,
      playback_speed: audioSettings.value.playbackRate
    });

    if (response.data && response.data.code === 0) {
      ElMessage.success('播放音频文件完成');

      // 计算随机等待时间（秒）
      const minInterval = audioSettings.value.minInterval;
      const maxInterval = audioSettings.value.maxInterval;
      const randomWaitTime = Math.floor(minInterval + Math.random() * (maxInterval - minInterval));

      // 显示等待时间
      ElMessage.info(`等待 ${randomWaitTime} 秒后播放下一个音频`);

      // 等待随机时间
      await new Promise(resolve => setTimeout(resolve, randomWaitTime * 1000));

      // 如果语音助手仍在运行，继续播放下一个音频
      if (isVoiceEnabled.value) {
        // 根据播放模式选择下一个音频
        let nextFile;
        if (audioSettings.value.playMode === 'random') {
          const randomIndex = Math.floor(Math.random() * audioFiles.value.length);
          nextFile = audioFiles.value[randomIndex];
        } else {
          // 顺序播放模式
          const currentIndex = audioFiles.value.findIndex(f => f.path === file.path);
          const nextIndex = (currentIndex + 1) % audioFiles.value.length;
          nextFile = audioFiles.value[nextIndex];
        }

        // 播放下一个音频
        await playAudioFile(nextFile);
      }
    } else {
      ElMessage.error(response.data?.message || '播放音频失败');
    }
  } catch (error) {
    console.error('播放音频请求出错:', error);
    ElMessage.error('播放音频请求出错: ' + (error.message || '未知错误'));
  }
};

// 停止当前音频播放
const stopAudioPlayback = async () => {
  try {
    const baseUrl = pythonBaseUrl.value || await getPythonBaseUrl();
    if (!baseUrl) {
      throw new Error('无法获取Python服务地址');
    }

    // 使用Python服务API停止播放
    const response = await axios.post(`${baseUrl}/api/stop`);

    if (response.data && response.data.code === 0) {
      console.log('已停止音频播放');
    } else {
      console.error('停止音频播放失败:', response.data?.message);
    }
  } catch (error) {
    console.error('停止音频播放出错:', error);
  }
};

// 启用语音助手
const enableVoiceAssistant = async () => {
  if (!selectedAudioGroup.value) {
    ElMessage.warning('请先选择一个音频组');
    return;
  }

  if (!selectedAudioDevice.value) {
    ElMessage.warning('请先选择音频输出设备');
    return;
  }

  loading.value = true;
  try {
    // 创建一个只包含简单数据类型的设置对象
    const simpleSettings = {
      volume: Number(audioSettings.value.volume),
      playbackRate: Number(audioSettings.value.playbackRate),
      minInterval: Number(audioSettings.value.minInterval),
      maxInterval: Number(audioSettings.value.maxInterval),
      deviceId: Number(selectedAudioDevice.value) // 添加设备ID
    };

    // 调用后端API启用语音助手，后端会通过Python API来实现
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.startVoiceAssistant, {
      groupName: selectedAudioGroup.value,
      settings: simpleSettings
    });

    if (result && result.status === 'success') {
      isVoiceEnabled.value = true;
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addVoiceAssistantLog(`语音助手已启用，使用音频组: ${selectedAudioGroup.value}`);
      }
      ElMessage.success('已启动语音助手');
    } else {
      ElMessage.error(result?.message || '启动语音助手失败');
    }
  } catch (error) {
    console.error('启动语音助手出错:', error);
    ElMessage.error(`启动语音助手失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

// 停止语音助手
const disableVoiceAssistant = async () => {
  loading.value = true;
  try {
    // 首先停止当前音频播放
    await stopAudioPlayback();

    // 调用后端API停用语音助手
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.stopVoiceAssistant);

    if (result && result.status === 'success') {
      isVoiceEnabled.value = false;
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addVoiceAssistantLog('语音助手已停用');
      }
      ElMessage.success('已停止语音助手');
    } else {
      ElMessage.error(result?.message || '停止语音助手失败');
    }
  } catch (error) {
    console.error('停止语音助手出错:', error);
    ElMessage.error(`停止语音助手失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

// 检查语音助手状态
const checkVoiceAssistantStatus = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.getVoiceAssistantStatus);
    if (result && result.status === 'success' && result.data) {
      const { isEnabled, currentGroup, settings } = result.data;
      isVoiceEnabled.value = isEnabled;

      if (isEnabled && currentGroup) {
        selectedAudioGroup.value = currentGroup;

        // 更新设置
        if (settings) {
          audioSettings.value = { ...audioSettings.value, ...settings };
          if (settings.deviceId) {
            selectedAudioDevice.value = settings.deviceId;
          }
        }

        console.log('语音助手已启用，使用音频组:', currentGroup);
      }
    }
  } catch (error) {
    console.error('检查语音助手状态出错:', error);
  }
};

// 监听选中的音频组变化
watch(selectedAudioGroup, (newGroup) => {
  if (newGroup) {
    getAudioFiles(newGroup);
  } else {
    audioFiles.value = [];
  }
});

// 监听共享状态中的连接状态变化
watch([() => sharedState?.connected, () => livechatStore.connected], ([newSharedConnected, newStoreConnected]) => {
  const newConnected = newSharedConnected !== undefined ? newSharedConnected : newStoreConnected;
  if (connected.value !== newConnected) {
    connected.value = newConnected;
    console.log('连接状态变化:', connected.value);
  }
}, { immediate: true });

// 监听共享状态中的房间ID变化
watch([() => sharedState?.roomId, () => livechatStore.roomId], ([newSharedRoomId, newStoreRoomId]) => {
  const newRoomId = newSharedRoomId || newStoreRoomId;
  if (roomId.value !== newRoomId) {
    roomId.value = newRoomId;
    console.log('房间ID变化:', roomId.value);
  }
}, { immediate: true });

// 打开音频组文件夹
const openAudioGroupFolder = async () => {
  if (!selectedAudioGroup.value) {
    ElMessage.warning('请先选择一个音频组');
    return;
  }

  try {
    const result = await ipc.invoke(ipcApiRoute.voiceAssistant.openAudioGroupFolder, {
      groupName: selectedAudioGroup.value
    });

    if (result && result.status === 'success') {
      ElMessage.success('已打开音频组文件夹');
    } else {
      ElMessage.error(result?.message || '打开文件夹失败');
    }
  } catch (error) {
    console.error('打开文件夹出错:', error);
    ElMessage.error('打开文件夹出错: ' + (error.message || '未知错误'));
  }
};

// 组件挂载时
onMounted(async () => {
  // 如果存在共享状态，同步到当前组件
  if (sharedState) {
    connected.value = sharedState.connected;
    roomId.value = sharedState.roomId;
  } else {
    // 否则使用Pinia Store中的状态
    connected.value = livechatStore.connected;
    roomId.value = livechatStore.roomId;
  }

  // 初始化
  await getPythonBaseUrl(); // 先获取Python服务地址
  // 尝试加载保存的设备设置
  await loadDeviceSetting();
  await getAudioDevices(); // 获取音频设备
  await getAudioGroups();
  await checkVoiceAssistantStatus();
});

// 组件卸载前
onBeforeUnmount(() => {
  // 如果正在播放，停止播放
  if (isVoiceEnabled.value) {
    disableVoiceAssistant();
  } else {
    stopAudioPlayback();
  }
});
</script>

<style lang="less" scoped>
.auto-text-reply-container {
  padding: 5px 10px;

  .main-content {
    display: flex;
    margin-bottom: 10px;
    gap: 12px;
    height: 420px;
    min-width: 600px; /* 确保有最小宽度 */
    overflow-x: auto; /* 当宽度小于最小宽度时允许水平滚动 */

    .left-panel, .right-panel {
      border: 1px solid #e4e7ed;
      border-radius: 3px;
      background-color: #fff;
    }

    .left-panel {
      width: 28%;
      min-width: 200px; /* 确保左面板有最小宽度 */
      max-width: 300px; /* 限制最大宽度 */
      overflow: auto; /* 允许滚动 */
      padding: 8px;

      .panel-section {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .setting-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .setting-label {
            width: 80px;
            color: #606266;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 0;
            white-space: nowrap;
          }

          .time-inputs {
            display: flex;
            align-items: center;
            flex: 1;

            :deep(.el-input) {
              width: 60px;
              height: 24px;
              text-align: center;
            }

            .separator {
              margin: 0 5px;
              color: #606266;
            }

            .unit {
              margin: 0 3px;
              font-size: 12px;
              color: #606266;
            }
          }

          .voice-slider {
            display: flex;
            align-items: center;
            flex: 1;

            :deep(.el-slider) {
              flex: 1;
              margin-right: 10px;
            }

            .slider-value {
              min-width: 40px;
              font-size: 12px;
              color: #606266;
            }
          }

          .play-mode {
            flex: 1;

            :deep(.el-radio-group) {
              width: 100%;
              display: flex;
              justify-content: space-between;

              .el-radio {
                margin-right: 0;
                font-size: 12px;
              }
            }
          }

          .device-selector {
            flex: 1;
            display: flex;
            align-items: center;

            :deep(.el-select) {
              flex: 1;
              margin-right: 5px;
            }
          }
        }
      }

      .tips-box {
        background-color: #fdf6ec;
        border: 1px solid #faecd8;
        border-radius: 2px;
        padding: 4px 8px;
        margin: 8px 0;
        text-align: left;

        .tip-line {
          color: #e6a23c;
          font-size: 11px;
          line-height: 1.4;
          text-align: left;
        }
      }

      .control-button {
        margin-top: 4px;
        width: 100%;
        height: 26px;
        font-size: 12px;
        padding: 3px 8px;
      }
    }

    .right-panel {
      flex: 1;
      min-width: 350px; /* 确保右面板有最小宽度 */
      overflow: hidden; /* 隐藏溢出内容 */
      padding: 8px;
      display: flex;
      flex-direction: column;

      .panel-section {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;

        // 表格上方的操作区域样式
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .left-controls {
            display: flex;
            align-items: center;

            .group-selector {
              display: flex;
              align-items: center;

              .selector-label {
                margin-right: 5px;
                font-size: 12px;
                white-space: nowrap;
              }

              .group-select {
                width: 150px;
              }

              .refresh-btn {
                margin-left: 5px;
                padding: 3px 6px;
              }

              .folder-btn {
                margin-left: 5px;
                padding: 3px 6px;
              }
            }
          }
        }

        .el-table {
          // 允许表格内容滚动
          .el-table__body-wrapper {
            overflow-x: auto;
          }
        }

        .file-name {
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.select-with-button {
  display: flex;
  align-items: center;
  width: 100%;
}

.group-select {
  flex: 1;
}

.refresh-btn {
  padding: 2px 6px;
  line-height: 1;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
