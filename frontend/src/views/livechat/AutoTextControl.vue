<template>
  <div class="auto-text-control-container">
    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧场控参数设置区 -->
      <div class="left-panel">
        <div class="panel-section">
          <div class="setting-item">
            <div class="setting-label">发言频率</div>
            <div class="time-inputs">
              <el-input-number v-model="frequency.min" :min="0" :max="100" size="small" controls-position="right" />
              <span class="separator">—</span>
              <el-input-number v-model="frequency.max" :min="0" :max="200" size="small" controls-position="right" />
              <span class="unit">秒</span>
              <span class="current-value" :class="{ 'warning': frequency.current < frequency.min }">{{ frequency.current }}</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">连续发言</div>
            <div class="time-inputs">
              <el-input-number v-model="continuousSpeech.start" :min="0" :max="100" size="small" controls-position="right" />
              <span class="separator">—</span>
              <el-input-number v-model="continuousSpeech.end" :min="0" :max="100" size="small" controls-position="right" />
              <span class="unit">分</span>
              <span class="current-value">{{ continuousSpeech.start * continuousSpeech.end }}</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">休息时间</div>
            <div class="time-inputs">
              <el-input-number v-model="restTime.start" :min="0" :max="100" size="small" controls-position="right" disabled />
              <span class="separator">—</span>
              <el-input-number v-model="restTime.end" :min="0" :max="100" size="small" controls-position="right" disabled />
              <span class="unit">分</span>
              <span class="current-value disabled">{{ restTime.start * restTime.end }}</span>
            </div>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="speakMode.random" class="custom-checkbox">随机发言</el-checkbox>
            <el-checkbox v-model="speakMode.sequential" class="custom-checkbox">顺序发言</el-checkbox>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="speakMode.randomSpace" class="custom-checkbox">随机空格</el-checkbox>
            <el-checkbox v-model="speakMode.randomEmoji" class="custom-checkbox">随机添加表情</el-checkbox>
          </div>

          <div class="tips-box">
            <div class="tip-line">友情提示：</div>
            <div class="tip-line">发言频率建议30-60秒短于26秒易被屏蔽</div>
            <div class="tip-line">发言太快易被封禁话术违规风险警示</div>
          </div>

          <el-button
            type="danger"
            @click="isControlEnabled ? disableControl() : enableControl()"
            :loading="loading"
            class="control-button"
          >
            {{ isControlEnabled ? '关闭自动场控' : '开启自动场控' }}
          </el-button>
        </div>
      </div>

      <!-- 右侧话术列表区 -->
      <div class="right-panel">
        <div class="panel-section">
          <!-- 表格上方的操作区域 -->
          <div class="table-header">
            <div class="left-controls">
              <div class="group-selector">
                <span class="selector-label">场控组:</span>
                <el-select v-model="selectedGroup" placeholder="选择场控组" size="small" class="group-select">
                  <el-option
                    v-for="item in controlGroups"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <div class="right-controls">
              <el-button type="primary" size="small" @click="addScriptRow">添加</el-button>
              <el-button type="success" size="small">新建</el-button>
            </div>
          </div>

          <!-- 控场话术表格 -->
          <el-table :data="controlScripts" border style="width: 100%" max-height="350" stripe size="small">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="content" label="内容">
              <template #default="scope">
                <el-input
                  v-if="scope.row.editing"
                  v-model="scope.row.content"
                  size="small"
                  @blur="confirmEdit(scope.row)"
                  @keyup.enter="confirmEdit(scope.row)"
                />
                <div v-else>{{ scope.row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button v-if="!scope.row.editing" type="primary" size="small" circle @click="editRow(scope.row)" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button v-else type="success" size="small" circle @click="confirmEdit(scope.row)" title="确认">
                    <el-icon><Check /></el-icon>
                  </el-button>
                  <el-button type="danger" size="small" circle @click="deleteRow(scope.$index)" title="删除">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, Check } from '@element-plus/icons-vue';

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);

// 状态变量
const roomId = ref(sharedState?.roomId || '');
const connected = ref(sharedState?.connected || false);
const isControlEnabled = ref(false);
const loading = ref(false);
const consoleRef = ref(sharedState?.consoleRef || null);

// 关键词和控场组
const selectedGroup = ref('场控组1.txt');
const controlGroups = ref([
  { label: '场控组1.txt', value: '场控组1.txt' },
  { label: '场控组2.txt', value: '场控组2.txt' },
  { label: '常用回复.txt', value: '常用回复.txt' },
]);

// 频率设置
const frequency = ref({
  min: 40,
  max: 60,
  current: 26
});

// 连续发言设置
const continuousSpeech = ref({
  start: 15,
  end: 15
});

// 休息时间设置
const restTime = ref({
  start: 0,
  end: 0
});

// 发言模式
const speakMode = ref({
  random: true,
  sequential: false,
  randomSpace: true,
  randomEmoji: true
});

// 话术内容
const selectedContent = ref('内容1');

// 控场话术
const controlScripts = ref([
  { content: '微胖宝子/肉感女子适合款，显高显德', editing: false },
  { content: '都是尺码表发货的，喜欢的姐姐直接拍拍，早上早发货!', editing: false },
  { content: '主播穿的在1号，还没拍的姐姐们抓紧下了!', editing: false },
  { content: '马上下播了，没有拍的姐姐们抓紧时间了，明天价更到199元的价格', editing: false },
  { content: '没有付款的姐姐们抓紧时间了。马上就要封单下架了', editing: false },
  { content: '还有最后5单了，没有拍的姐姐抓紧时间了，主播马上就要下播了。', editing: false },
  { content: '还有最后3单了姐姐，没付款的姐姐抓紧了！', editing: false },
]);

// 添加脚本行
const addScriptRow = () => {
  controlScripts.value.push({
    pattern: '',
    content: '',
    editing: true
  });
  if (sharedState?.consoleRef) {
    sharedState.consoleRef.addTextControlLog('添加了一条新控场脚本');
  }
};

// 编辑行
const editRow = (row) => {
  row.editing = true;
};

// 确认编辑
const confirmEdit = (row) => {
  row.editing = false;
  if (sharedState?.consoleRef) {
    sharedState.consoleRef.addTextControlLog(`已编辑脚本: "${row.pattern}" => "${row.content}"`);
  }
};

// 删除行
const deleteRow = (index) => {
  console.log('删除行索引:', index);
  ElMessageBox.confirm('确认删除此脚本?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    controlScripts.value.splice(index, 1);
    if (sharedState?.consoleRef) {
      sharedState.consoleRef.addTextControlLog('已删除一条控场脚本');
    }
    ElMessage.success('删除成功');
  }).catch((err) => {
    console.log('取消删除或错误:', err);
  });
};

// 保存选定内容
const saveSelectedContent = () => {
  if (!selectedContent.value) {
    ElMessage.warning('请选择一个内容');
    return;
  }

  controlScripts.value.push({
    content: selectedContent.value
  });

  ElMessage.success('内容已添加到话术列表');
  if (consoleRef.value) {
    consoleRef.value.addTextControlLog(`已添加内容: "${selectedContent.value}"`);
  }
};

// 导入话术
const importScripts = () => {
  ElMessageBox.prompt('请输入要导入的话术内容 (JSON格式)', '导入话术', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputType: 'textarea',
  }).then(({ value }) => {
    try {
      const importedData = JSON.parse(value);
      if (Array.isArray(importedData)) {
        // 简单验证格式
        const isValid = importedData.every(item =>
          typeof item === 'object' && 'content' in item
        );

        if (isValid) {
          controlScripts.value = importedData;
          ElMessage.success(`成功导入${importedData.length}条话术`);

          if (consoleRef.value) {
            consoleRef.value.addTextControlLog(`成功导入${importedData.length}条控场话术`);
          }
        } else {
          ElMessage.error('导入数据格式不正确');
        }
      } else {
        ElMessage.error('导入数据必须是数组格式');
      }
    } catch (error) {
      ElMessage.error(`导入失败: ${error.message}`);
    }
  }).catch(() => {});
};

// 导出话术
const exportScripts = () => {
  try {
    const exportData = JSON.stringify(controlScripts.value, null, 2);

    // 在实际应用中，这里可以实现下载功能
    ElMessageBox.alert(exportData, '导出话术 (复制以下内容)', {
      confirmButtonText: '确认',
    });

    if (consoleRef.value) {
      consoleRef.value.addTextControlLog(`已导出${controlScripts.value.length}条控场话术`);
    }
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`);
  }
};

// 开启自动控场
const enableControl = async () => {
  if (!connected.value) {
    ElMessage.warning('请先连接到直播间');
    return;
  }

  loading.value = true;
  try {
    // 这里应该调用后端API启用自动控场
    // 模拟成功响应
    setTimeout(() => {
      isControlEnabled.value = true;
      loading.value = false;

      if (consoleRef.value) {
        consoleRef.value.addTextControlLog('自动文字控场已启用');
      }

      ElMessage.success('已开启自动控场');
    }, 1000);
  } catch (error) {
    ElMessage.error(`开启自动控场失败: ${error.message || '未知错误'}`);
    loading.value = false;
  }
};

// 停止自动控场
const disableControl = async () => {
  loading.value = true;
  try {
    // 这里应该调用后端API停用自动控场
    // 模拟成功响应
    setTimeout(() => {
      isControlEnabled.value = false;
      loading.value = false;

      if (consoleRef.value) {
        consoleRef.value.addTextControlLog('自动文字控场已停用');
      }

      ElMessage.success('已停止自动控场');
    }, 1000);
  } catch (error) {
    ElMessage.error(`停止自动控场失败: ${error.message || '未知错误'}`);
    loading.value = false;
  }
};

// 页面挂载时同步状态
onMounted(() => {
  // 如果存在共享状态，将其同步到当前组件
  if (sharedState) {
    connected.value = sharedState.connected;
    roomId.value = sharedState.roomId;
  }
});
</script>

<style lang="less" scoped>
.auto-text-control-container {
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
          margin-bottom: 5px;

          .setting-label {
            width: 65px;
            color: #606266;
            font-size: 12px;
            white-space: nowrap; /* 防止标签换行 */
          }

          .setting-content {
            flex: 1;
            display: flex;
            align-items: center;
          }
        }

        .time-inputs {
          display: flex;
          align-items: center;
          flex: 1;

          :deep(.el-input-number) {
            width: 40px;
            height: 24px;

            .el-input__wrapper {
              padding: 0 8px;
            }

            .el-input__inner {
              padding: 0;
              text-align: center;
              height: 24px;
            }

            .el-input-number__decrease,
            .el-input-number__increase {
              display: none;
            }
          }

          .separator {
            margin: 0 3px;
            color: #606266;
          }

          .unit {
            margin: 0 3px;
            font-size: 12px;
            color: #606266;
          }

          .current-value {
            margin-left: 5px;
            font-weight: bold;
            font-size: 12px;
            color: #409eff;

            &.disabled {
              color: #aaa;
            }

            &.warning {
              color: #f56c6c;
            }
          }
        }

        .group-select {
          flex: 1;

          :deep(.el-input__wrapper) {
            height: 24px;

            .el-input__inner {
              font-size: 12px;
            }
          }

          :deep(.el-select-dropdown__item) {
            font-size: 12px;
          }
        }

        .checkbox-wrapper {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;

          :deep(.el-checkbox) {
            margin-right: 0;
            height: 20px;

            .el-checkbox__input {
              margin-right: 2px;
            }

            .el-checkbox__label {
              font-size: 11px;
              padding-left: 4px;
            }
          }
        }

        .tips-box {
          background-color: #fdf6ec;
          border: 1px solid #faecd8;
          border-radius: 2px;
          padding: 4px 8px;
          margin: 8px 0;

          .tip-line {
            color: #e6a23c;
            font-size: 11px;
            line-height: 1.4;
          }
        }

        .control-button {
          margin-top: 8px;
          width: 100%;
          height: 28px;
          font-size: 12px;
          padding: 5px 8px;
        }
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
            }
          }

          .right-controls {
            display: flex;
            gap: 5px;
          }
        }

        .el-table {
          // 允许表格内容滚动
          .el-table__body-wrapper {
            overflow-x: auto;
          }

          // 设置列宽比例
          .el-table__header th:nth-child(1) {
            width: 50px; /* 序号列 */
          }
          .el-table__header th:nth-child(2) {
            min-width: 80px; /* 匹配规则列 */
          }
          .el-table__header th:nth-child(3) {
            min-width: 150px; /* 内容列 */
          }
          .el-table__header th:nth-child(4) {
            width: 80px; /* 操作列 */
          }
        }
      }
    }
  }
}

// 操作按钮样式优化，确保在小窗口下显示
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap; /* 允许按钮换行 */
}
</style>
