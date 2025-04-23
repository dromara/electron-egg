<template>
  <!-- 全局更新提示组件 -->
  <el-dialog
    v-model="updateDialogVisible"
    title="发现新版本"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="update-dialog"
  >
    <div class="update-dialog-content">
      <div class="version-info">
        <div class="version-compare">
          <el-tag size="large" type="info" class="version-tag current">当前版本: {{ currentVersion }}</el-tag>
          <div class="arrow">
            <i class="el-icon-right" />
          </div>
          <el-tag size="large" type="success" class="version-tag new">新版本: {{ newVersion }}</el-tag>
        </div>
        <div class="version-item">发布日期: {{ formatDate(releaseDate) }}</div>
        <div class="version-item">是否要下载并安装新版本?</div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">稍后提醒</el-button>
        <el-button type="primary" @click="downloadAndInstall">
          下载并安装
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute, specialIpcRoute } from '@/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const updateDialogVisible = ref(false);
const newVersion = ref('');
const currentVersion = ref('');
const releaseDate = ref('');

// 监听自动更新通知
onMounted(() => {
  // 获取当前版本
  getCurrentVersion();
  
  // 设置IPC监听器
  setupListeners();
});

// 清理监听器
onUnmounted(() => {
  cleanupListeners();
});

// 设置监听器
function setupListeners() {
  // 移除可能存在的旧监听器
  cleanupListeners();
  
  // 监听更新事件
  ipc.on(specialIpcRoute.appUpdater, (event, result) => {
    try {
      result = JSON.parse(result);
      console.log('收到更新消息:', result);
      
      if (result.status === 1) { // 有新版本
        newVersion.value = result.version || '';
        releaseDate.value = result.releaseDate || '';
        
        if (result.oldVersion) {
          currentVersion.value = result.oldVersion;
        }
        
        // 如果是自动检查，显示弹窗
        if (result.isAutoCheck) {
          console.log('是自动检查更新，显示弹窗');
          showUpdateDialog();
        }
      }
    } catch (error) {
      console.error('处理更新消息出错:', error);
    }
  });
  
  // 监听通知
  ipc.on('show-update-notification', (event, data) => {
    console.log('收到系统通知:', data);
    // 收到通知后显示弹窗
    if (data.version) {
      newVersion.value = data.version;
    }
    showUpdateDialog();
  });
}

// 清理监听器
function cleanupListeners() {
  ipc.removeAllListeners('show-update-notification');
  // 不要移除appUpdater监听器，因为可能有其他组件在使用
}

// 获取当前应用版本
function getCurrentVersion() {
  ipc.invoke(ipcApiRoute.framework.getAppVersion).then(result => {
    if (result && result.status === 'success') {
      currentVersion.value = result.data || '';
    }
  }).catch(error => {
    console.error('获取应用版本失败:', error);
  });
}

// 显示更新弹窗
function showUpdateDialog() {
  console.log('显示更新弹窗');
  updateDialogVisible.value = true;
}

// 关闭弹窗
function closeDialog() {
  updateDialogVisible.value = false;
}

// 下载并安装更新
function downloadAndInstall() {
  updateDialogVisible.value = false;
  
  // 跳转到更新页面
  router.push('/updater');
  
  // 调用下载API
  setTimeout(() => {
    ipc.invoke(ipcApiRoute.framework.downloadApp).then(r => {
      console.log('开始下载更新:', r);
    }).catch(error => {
      ElMessage.error('下载更新失败: ' + error.message);
    });
  }, 500);
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
</script>

<style lang="less" scoped>
/* 覆盖el-dialog样式 */
:deep(.el-dialog__header) {
  text-align: center;
  font-weight: bold;
  padding-bottom: 10px;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
  padding-bottom: 10px;
}

:deep(.el-dialog__footer) {
  padding-top: 10px;
  padding-bottom: 20px;
}

/* 更新弹窗样式 */
.update-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.version-info {
  width: 100%;
  text-align: center;
  
  .version-item {
    margin: 15px 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

.version-compare {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
  gap: 10px;
  
  .version-tag {
    padding: 6px 10px;
    font-weight: normal;
    
    &.current {
      background-color: #f4f4f5;
      color: #909399;
    }
    
    &.new {
      background-color: #f0f9eb;
      color: #67c23a;
    }
  }
  
  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 22px;
    margin: 0 5px;
    
    i {
      // Element Plus图标样式
      &::before {
        content: '→';
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
}
</style> 