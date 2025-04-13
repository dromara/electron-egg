<template>
  <div class="auto-text-reply-container">
    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧关键词设置区 -->
      <div class="left-panel">
        <div class="panel-section">
          <div class="setting-item">
            <div class="setting-label">等待时间</div>
            <div class="time-inputs">
              <el-input-number v-model="replyDelay.min" :min="0" :max="100" size="small" controls-position="right" />
              <span class="separator">—</span>
              <el-input-number v-model="replyDelay.max" :min="0" :max="100" size="small" controls-position="right" />
              <span class="unit">秒</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">相似度</div>
            <div class="similarity-slider">
              <el-slider v-model="similarity" :min="0" :max="100" :step="1" :show-tooltip="false" />
              <span class="slider-value">{{ similarity }}%</span>
            </div>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="replyMode.exact" class="custom-checkbox">精确匹配</el-checkbox>
            <el-checkbox v-model="replyMode.semantic" class="custom-checkbox">语义匹配</el-checkbox>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="replyMode.randomSpace" class="custom-checkbox">随机空格</el-checkbox>
            <el-checkbox v-model="replyMode.randomEmoji" class="custom-checkbox">随机表情</el-checkbox>
          </div>

          <div class="whitelist-settings">
            <div class="whitelist-header">回复白名单 <el-switch v-model="whitelistEnabled" class="whitelist-switch" /></div>
            <div class="whitelist-form" v-if="whitelistEnabled">
              <div class="whitelist-row">
                <span class="row-label">用户等级</span>
                <div class="input-group">
                  <span>≥</span>
                  <el-input-number v-model="whitelist.userLevel" :min="0" :max="60" :step="1" size="small" controls-position="right" />
                </div>
              </div>
              <div class="whitelist-row">
                <span class="row-label">贡献值</span>
                <div class="input-group">
                  <span>≥</span>
                  <el-input-number v-model="whitelist.contribution" :min="0" :max="10000" :step="100" size="small" controls-position="right" />
                </div>
              </div>
            </div>
          </div>

          <el-button
            type="danger"
            @click="isAutoReplyEnabled ? disableAutoReply() : enableAutoReply()"
            :loading="loading"
            class="control-button"
          >
            {{ isAutoReplyEnabled ? '关闭自动回复' : '开启自动回复' }}
          </el-button>
        </div>
      </div>

      <!-- 右侧关键词列表区 -->
      <div class="right-panel">
        <div class="panel-section">
          <!-- 表格上方的操作区域 -->
          <div class="table-header">
            <div class="left-controls">
              <div class="group-selector">
                <span class="selector-label">关键词组:</span>
                <el-select v-model="selectedGroup" placeholder="选择关键词组" size="small" class="group-select">
                  <el-option
                    v-for="item in keywordGroups"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <div class="right-controls">
              <el-button type="primary" size="small" @click="addKeywordRow">添加</el-button>
              <el-button type="success" size="small">新建</el-button>
            </div>
          </div>

          <!-- 关键词表格 -->
          <el-table :data="keywordItems" border style="width: 100%" max-height="350" stripe size="small">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="keyword" label="关键词">
              <template #default="scope">
                <el-input
                  v-if="scope.row.editing"
                  v-model="scope.row.keyword"
                  size="small"
                  @blur="confirmEdit(scope.row)"
                  @keyup.enter="confirmEdit(scope.row)"
                />
                <div v-else>{{ scope.row.keyword }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="reply" label="回复内容">
              <template #default="scope">
                <el-input
                  v-if="scope.row.editing"
                  v-model="scope.row.reply"
                  size="small"
                  @blur="confirmEdit(scope.row)"
                  @keyup.enter="confirmEdit(scope.row)"
                />
                <div v-else>{{ scope.row.reply }}</div>
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
const isAutoReplyEnabled = ref(false);
const loading = ref(false);
const consoleRef = ref(sharedState?.consoleRef || null);

// 关键词和关键词组
const selectedGroup = ref('关键词组1.txt');
const keywordGroups = ref([
  { label: '关键词组1.txt', value: '关键词组1.txt' },
  { label: '常见问题.txt', value: '常见问题.txt' },
  { label: '商品说明.txt', value: '商品说明.txt' },
]);

// 回复延迟设置
const replyDelay = ref({
  min: 2,
  max: 5
});

// 相似度设置
const similarity = ref(90);

// 回复模式
const replyMode = ref({
  exact: true,
  semantic: false,
  randomSpace: false,
  randomEmoji: true
});

// 白名单设置
const whitelistEnabled = ref(false);
const whitelist = ref({
  userLevel: 1,
  contribution: 0
});

// 选定内容
const selectedContent = ref('');

// 关键词项目
const keywordItems = ref([
  { keyword: '好看', reply: '谢谢支持，记得下单哦！', editing: false },
  { keyword: '价格', reply: '59.9一件，买二送一，活动马上结束啦！', editing: false },
  { keyword: '尺码', reply: '都是均码，适合80-130斤，高矮都能穿！', editing: false },
  { keyword: '质量', reply: '面料超级舒服，亲肤不起球，洗了也不变形！', editing: false },
  { keyword: '发货', reply: '当天下单，第二天发出，48小时必达！', editing: false },
]);

// 添加关键词行
const addKeywordRow = () => {
  keywordItems.value.push({
    keyword: '',
    reply: '',
    editing: true
  });
  if (sharedState?.consoleRef) {
    sharedState.consoleRef.addTextReplyLog('添加了一条新关键词');
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
    sharedState.consoleRef.addTextReplyLog(`已编辑关键词: "${row.keyword}" 对应回复: "${row.reply}"`);
  }
};

// 删除行
const deleteRow = (index) => {
  ElMessageBox.confirm('确认删除此条关键词?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    keywordItems.value.splice(index, 1);
    if (sharedState?.consoleRef) {
      sharedState.consoleRef.addTextReplyLog('已删除一条关键词');
    }
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 保存选定内容
const saveSelectedContent = () => {
  if (!selectedContent.value) {
    ElMessage.warning('请选择一个内容分类');
    return;
  }

  // 模拟基于所选分类添加预设关键词回复
  const presets = {
    '常见问题': [
      { keyword: '怎么下单', reply: '点击商品下方的购买按钮，按提示操作即可完成下单~' },
      { keyword: '如何退货', reply: '收到商品后7天内，可申请无理由退货，请联系客服处理~' }
    ],
    '价格相关': [
      { keyword: '最低多少钱', reply: '当前活动价格是最优惠的，下单立减，先到先得哦~' },
      { keyword: '能便宜点吗', reply: '已经是活动特价了哦，多买还有更多优惠~' }
    ]
  };

  if (presets[selectedContent.value]) {
    keywordItems.value = [...keywordItems.value, ...presets[selectedContent.value]];
    ElMessage.success(`已添加${presets[selectedContent.value].length}条${selectedContent.value}相关的关键词回复`);

    if (sharedState?.consoleRef) {
      sharedState.consoleRef.addTextReplyLog(`导入了${presets[selectedContent.value].length}条${selectedContent.value}关键词回复`);
    }
  } else {
    ElMessage.info('该分类暂无预设内容');
  }
};

// 导入关键词
const importKeywords = () => {
  ElMessageBox.prompt('请输入要导入的关键词内容 (JSON格式)', '导入关键词', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputType: 'textarea',
  }).then(({ value }) => {
    try {
      const importedData = JSON.parse(value);
      if (Array.isArray(importedData)) {
        // 简单验证格式
        const isValid = importedData.every(item =>
          typeof item === 'object' && 'keyword' in item && 'reply' in item
        );

        if (isValid) {
          keywordItems.value = importedData;
          ElMessage.success(`成功导入${importedData.length}条关键词回复`);

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextReplyLog(`成功导入${importedData.length}条关键词回复`);
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

// 导出关键词
const exportKeywords = () => {
  try {
    const exportData = JSON.stringify(keywordItems.value, null, 2);

    // 在实际应用中，这里可以实现下载功能
    ElMessageBox.alert(exportData, '导出关键词 (复制以下内容)', {
      confirmButtonText: '确认',
    });

    if (sharedState?.consoleRef) {
      sharedState.consoleRef.addTextReplyLog(`已导出${keywordItems.value.length}条关键词回复`);
    }
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`);
  }
};

// 启用自动回复
const enableAutoReply = async () => {
  if (!connected.value) {
    ElMessage.warning('请先连接到直播间');
    return;
  }

  loading.value = true;
  try {
    // 这里应该调用后端API启用自动回复
    // 模拟成功响应
    setTimeout(() => {
      isAutoReplyEnabled.value = true;
      loading.value = false;

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextReplyLog('自动文字回复已启用');
      }

      ElMessage.success('已开启自动回复');
    }, 1000);
  } catch (error) {
    ElMessage.error(`开启自动回复失败: ${error.message || '未知错误'}`);
    loading.value = false;
  }
};

// 停止自动回复
const disableAutoReply = async () => {
  loading.value = true;
  try {
    // 这里应该调用后端API停用自动回复
    // 模拟成功响应
    setTimeout(() => {
      isAutoReplyEnabled.value = false;
      loading.value = false;

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextReplyLog('自动文字回复已停用');
      }

      ElMessage.success('已停止自动回复');
    }, 1000);
  } catch (error) {
    ElMessage.error(`停止自动回复失败: ${error.message || '未知错误'}`);
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
        }

        .similarity-slider {
          display: flex;
          align-items: center;
          flex: 1;

          :deep(.el-slider) {
            flex: 1;
            margin-right: 5px;

            .el-slider__runway {
              height: 4px;
              margin: 8px 0;
            }

            .el-slider__bar {
              height: 4px;
            }

            .el-slider__button-wrapper {
              height: 16px;
              width: 16px;
              top: -6px;
            }

            .el-slider__button {
              height: 12px;
              width: 12px;
            }
          }

          .slider-value {
            font-size: 12px;
            font-weight: bold;
            color: #409eff;
            width: 34px;
            text-align: right;
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

      .whitelist-settings {
        margin-top: 3px;
        border: 1px solid #e4e7ed;
        border-radius: 3px;
        padding: 3px;

        .whitelist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: bold;
          color: #606266;
          margin-bottom: 3px;

          .whitelist-switch {
            transform: scale(0.7);
          }
        }

        .whitelist-form {
          display: flex;
          flex-direction: column;
          gap: 5px;

          .whitelist-row {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .row-label {
              font-size: 11px;
              color: #606266;
            }

            .input-group {
              display: flex;
              align-items: center;

              span {
                font-size: 12px;
                margin-right: 3px;
                color: #606266;
              }

              :deep(.el-input-number) {
                width: 60px;
                height: 22px;

                .el-input__wrapper {
                  padding: 0 5px;
                }

                .el-input__inner {
                  padding: 0;
                  text-align: center;
                  height: 22px;
                  font-size: 11px;
                }

                .el-input-number__decrease,
                .el-input-number__increase {
                  display: none;
                }
              }
            }
          }
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
            min-width: 80px; /* 关键词列 */
          }
          .el-table__header th:nth-child(3) {
            min-width: 150px; /* 回复内容列 */
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
