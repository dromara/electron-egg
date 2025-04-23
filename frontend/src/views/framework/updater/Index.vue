<template>
  <div id="app-updater">
    <div class="update-container">
      <div class="version-tag">
        <el-tag type="success" effect="plain">当前版本: {{ currentVersion }}</el-tag>
      </div>

      <h1 class="update-title">系统更新</h1>

      <div class="status-display" v-if="status !== 0">
        <el-tag :type="getStatusTagType(status)" size="large" effect="plain">{{ getStatusText(status) }}</el-tag>
      </div>

      <div class="version-details" v-if="status === 1">
        <div class="version-item">
          <p><strong>新版本:</strong> {{ newVersion }}</p>
          <p v-if="releaseDate"><strong>发布日期:</strong> {{ formatDate(releaseDate) }}</p>
        </div>
      </div>

      <div class="action-area">
        <el-button
          type="primary"
          @click="checkForUpdater()"
          round
          size="large"
          :icon="Search"
          class="action-button"
        >检查更新</el-button>

        <el-button
          type="success"
          @click="download()"
          :disabled="status !== 1"
          round
          size="large"
          :icon="Download"
          class="action-button"
        >下载并安装</el-button>
      </div>

      <div class="progress-area" v-if="status == 3 || percentNumber > 0">
        <el-progress
          :percentage="percentNumber"
          :status="percentNumber === 100 ? 'success' : ''"
          :stroke-width="20"
          text-inside
          :format="percentFormat"
          class="update-progress"
        />
        <div class="progress-text">{{ progress }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute, specialIpcRoute } from '@/api';
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Download } from '@element-plus/icons-vue';

const status = ref(0);
const progress = ref('');
const percentNumber = ref(0);
const currentVersion = ref('');
const newVersion = ref('');
const releaseDate = ref('');

onMounted(() => {
  init()
  // 获取当前应用版本
  getCurrentVersion()
})

function init() {
  ipc.removeAllListeners(specialIpcRoute.appUpdater);
  ipc.on(specialIpcRoute.appUpdater, (event, result) => {
    try {
      result = JSON.parse(result);
      status.value = result.status;
      
      // 获取当前版本信息
      if (result.oldVersion) {
        currentVersion.value = result.oldVersion;
      }
      
      if (result.status == 1) { // 有新版本
        newVersion.value = result.version || '';
        releaseDate.value = result.releaseDate || '';
        ElMessage.success(`发现新版本: ${newVersion.value}`);
      } else if (result.status == 2) { // 无新版本
        if (result.version) {
          currentVersion.value = result.version;
        }
        ElMessage.info(result.desc);
      } else if (result.status == 3) { // 下载中
        progress.value = result.desc;
        percentNumber.value = result.percentNumber || 0;
      } else if (result.status == -1) { // 错误
        ElMessage.error(result.desc || '更新检查失败');
      } else if (result.status == 5) { // 检查中
        // 不显示消息，状态栏已经有提示
      } else if (result.status == 4) { // 下载完成
        ElMessage.success(result.desc || '更新下载完成');
      } else if (result.desc) { // 其他状态，但有消息
        ElMessage.info(result.desc);
      }
    } catch (error) {
      console.error('处理更新消息出错:', error);
    }
  })
}

// 获取当前应用版本
function getCurrentVersion() {
  ipc.invoke(ipcApiRoute.framework.getAppVersion).then(result => {
    if (result && result.status === 'success') {
      currentVersion.value = result.data || '';
      console.log('当前应用版本:', currentVersion.value);
    }
  }).catch(error => {
    console.error('获取应用版本失败:', error);
  });
}

function checkForUpdater () {
  ipc.invoke(ipcApiRoute.framework.checkForUpdater).then(r => {
    console.log(r);
  })
}

function download () {
  if (status.value !== 1) {
    ElMessage.info('没有可用版本');
    return
  }
  ipc.invoke(ipcApiRoute.framework.downloadApp).then(r => {
    console.log(r);
  })
}

function getStatusTagType(status) {
  const types = {
    '-1': 'danger',
    '1': 'success',
    '2': 'info',
    '3': 'warning',
    '4': 'success',
    '5': 'info'
  };
  return types[status] || 'info';
}

function getStatusText(status) {
  const texts = {
    '-1': '更新失败',
    '1': '发现新版本',
    '2': '已是最新版本',
    '3': '下载更新中',
    '4': '更新已下载完成',
    '5': '正在检查更新'
  };
  return texts[status] || '未知状态';
}

// 格式化进度条百分比显示
function percentFormat(percentage) {
  return `${percentage}%`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}
</script>

<style lang="less" scoped>
#app-updater {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;

  .update-container {
    max-width: 600px;
    width: 100%;
    padding: 40px;
    text-align: center;
    position: relative;
  }

  .update-title {
    font-size: 28px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 30px;
    letter-spacing: 1px;
  }

  .version-tag {
    position: absolute;
    top: 0;
    right: 0;

    .el-tag {
      font-size: 14px;
    }
  }

  .status-display {
    margin-bottom: 30px;

    .el-tag {
      padding: 8px 16px;
      font-size: 16px;
    }
  }

  .version-details {
    margin-bottom: 30px;

    .version-item {
      margin-bottom: 10px;

      p {
        margin: 5px 0;
      }
    }
  }

  .action-area {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;

    .action-button {
      padding: 12px 30px;
      font-size: 16px;
    }
  }

  .progress-area {
    padding: 0 20px;

    .update-progress {
      margin-bottom: 20px;
    }

    .progress-text {
      font-size: 15px;
      color: #606266;
      margin-top: 10px;
    }
  }
}
</style>
