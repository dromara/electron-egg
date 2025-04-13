<template>
  <div class="voice-assistant-container">
    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧设置区 -->
      <div class="left-panel">
        <div class="panel-section">
          <div class="setting-item">
            <div class="setting-label">声音调节</div>
            <div class="voice-slider">
              <el-slider v-model="voiceSettings.volume" :min="0" :max="100" :step="1" :show-tooltip="false" />
              <span class="slider-value">{{ voiceSettings.volume }}%</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">语音引擎</div>
            <el-select v-model="voiceSettings.engine" placeholder="选择引擎" size="small" class="engine-select">
              <el-option
                v-for="item in voiceEngines"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="setting-item">
            <div class="setting-label">语速</div>
            <div class="voice-slider">
              <el-slider v-model="voiceSettings.speed" :min="0.5" :max="2" :step="0.1" :show-tooltip="false" />
              <span class="slider-value">{{ voiceSettings.speed.toFixed(1) }}x</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">音调</div>
            <div class="voice-slider">
              <el-slider v-model="voiceSettings.pitch" :min="-10" :max="10" :step="1" :show-tooltip="false" />
              <span class="slider-value">{{ voiceSettings.pitch > 0 ? '+' + voiceSettings.pitch : voiceSettings.pitch }}</span>
            </div>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="voiceSettings.autoRead" class="custom-checkbox">自动朗读</el-checkbox>
            <el-checkbox v-model="voiceSettings.skipUser" class="custom-checkbox">跳过用户名</el-checkbox>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="voiceSettings.readGifts" class="custom-checkbox">朗读礼物</el-checkbox>
            <el-checkbox v-model="voiceSettings.readFans" class="custom-checkbox">朗读粉丝关注</el-checkbox>
          </div>

          <div class="filter-settings">
            <div class="filter-header">筛选条件 <el-switch v-model="filterEnabled" class="filter-switch" /></div>
            <div class="filter-form" v-if="filterEnabled">
              <div class="filter-row">
                <span class="row-label">用户等级</span>
                <div class="input-group">
                  <span>≥</span>
                  <el-input-number v-model="filter.userLevel" :min="0" :max="60" :step="1" size="small" controls-position="right" />
                </div>
              </div>
              <div class="filter-row">
                <span class="row-label">贡献值</span>
                <div class="input-group">
                  <span>≥</span>
                  <el-input-number v-model="filter.contribution" :min="0" :max="10000" :step="100" size="small" controls-position="right" />
                </div>
              </div>
              <div class="filter-row">
                <span class="row-label">发言字数</span>
                <div class="input-group">
                  <span>≥</span>
                  <el-input-number v-model="filter.textLength" :min="0" :max="100" :step="1" size="small" controls-position="right" />
                </div>
              </div>
            </div>
          </div>

          <el-button
            type="primary"
            @click="isVoiceEnabled ? disableVoiceAssistant() : enableVoiceAssistant()"
            :loading="loading"
            class="control-button"
          >
            {{ isVoiceEnabled ? '停止语音助手' : '启动语音助手' }}
          </el-button>
        </div>
      </div>

      <!-- 右侧话术列表区 -->
      <div class="right-panel">
        <div class="panel-section">
          <div class="test-voice-area">
            <div class="test-title">语音测试</div>
            <div class="test-content">
              <el-input
                v-model="testText"
                type="textarea"
                :rows="4"
                placeholder="在此输入测试文本..."
                resize="none"
              />
              <div class="test-buttons">
                <el-button type="primary" size="small" @click="testVoice">测试朗读</el-button>
                <el-button size="small" @click="stopVoice">停止朗读</el-button>
              </div>
            </div>
          </div>

          <div class="custom-templates">
            <div class="templates-title">自定义语音模板</div>
            <el-table :data="voiceTemplates" border style="width: 100%" max-height="160" stripe size="small">
              <el-table-column type="index" label="序号" width="50" align="center" />
              <el-table-column prop="type" label="类型" width="80">
                <template #default="scope">
                  <el-tag :type="getTagType(scope.row.type)" size="small">{{ scope.row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="template" label="模板内容">
                <template #default="scope">
                  <div>{{ scope.row.template }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope">
                  <el-button type="text" size="small" @click="editTemplate(scope.row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
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

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);

// 状态变量
const roomId = ref(sharedState?.roomId || '');
const connected = ref(sharedState?.connected || false);
const isVoiceEnabled = ref(false);
const loading = ref(false);
const testText = ref('这是一段测试语音，用来检测语音助手的效果。您可以调整音量、语速和音调来获得最佳体验。');

// 语音引擎选项
const voiceEngines = ref([
  { label: '微软语音', value: 'microsoft' },
  { label: '讯飞语音', value: 'xunfei' },
  { label: '百度语音', value: 'baidu' },
  { label: '系统语音', value: 'system' },
]);

// 语音设置
const voiceSettings = ref({
  volume: 75,
  engine: 'microsoft',
  speed: 1.0,
  pitch: 0,
  autoRead: true,
  skipUser: false,
  readGifts: true,
  readFans: true,
});

// 筛选设置
const filterEnabled = ref(false);
const filter = ref({
  userLevel: 1,
  contribution: 0,
  textLength: 5,
});

// 语音模板
const voiceTemplates = ref([
  { type: '弹幕', template: '{username}说：{content}' },
  { type: '礼物', template: '感谢{username}送出{gift_name}，共{gift_count}个！' },
  { type: '关注', template: '感谢{username}关注了主播！' },
  { type: '进入', template: '欢迎{username}进入直播间！' },
  { type: '点赞', template: '感谢{username}的点赞支持！' },
]);

// 获取标签类型
const getTagType = (type) => {
  const typeMap = {
    '弹幕': '',
    '礼物': 'success',
    '关注': 'warning',
    '进入': 'info',
    '点赞': 'danger',
  };
  return typeMap[type] || '';
};

// 启用语音助手
const enableVoiceAssistant = async () => {
  if (!connected.value) {
    ElMessage.warning('请先连接到直播间');
    return;
  }

  loading.value = true;
  try {
    // 这里应该调用后端API启用语音助手
    // 模拟成功响应
    setTimeout(() => {
      isVoiceEnabled.value = true;
      loading.value = false;

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', '语音助手已启用');
      }

      ElMessage.success('已启动语音助手');
    }, 1000);
  } catch (error) {
    ElMessage.error(`启动语音助手失败: ${error.message || '未知错误'}`);
    loading.value = false;
  }
};

// 停止语音助手
const disableVoiceAssistant = async () => {
  loading.value = true;
  try {
    // 这里应该调用后端API停用语音助手
    // 模拟成功响应
    setTimeout(() => {
      isVoiceEnabled.value = false;
      loading.value = false;

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', '语音助手已停用');
      }

      ElMessage.success('已停止语音助手');
    }, 1000);
  } catch (error) {
    ElMessage.error(`停止语音助手失败: ${error.message || '未知错误'}`);
    loading.value = false;
  }
};

// 测试语音
const testVoice = () => {
  if (!testText.value) {
    ElMessage.warning('请输入测试文本');
    return;
  }

  if (sharedState?.consoleRef) {
    sharedState.consoleRef.addSystemMessage('system', `测试朗读: "${testText.value}"`);
  }

  ElMessage.success('开始测试朗读');
  // 这里应调用语音合成API
};

// 停止语音
const stopVoice = () => {
  // 这里应调用停止语音API
  ElMessage.info('已停止朗读');
};

// 编辑模板
const editTemplate = (template) => {
  ElMessageBox.prompt('请编辑模板内容', `编辑${template.type}模板`, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: template.template,
  }).then(({ value }) => {
    if (value) {
      // 更新模板内容
      template.template = value;

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', `已更新${template.type}模板`);
      }

      ElMessage.success(`已更新${template.type}模板`);
    }
  }).catch(() => {});
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
.voice-assistant-container {
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

          .voice-slider {
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

          .engine-select {
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

        .filter-settings {
          margin-top: 3px;
          border: 1px solid #e4e7ed;
          border-radius: 3px;
          padding: 5px;

          .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            font-weight: bold;
            color: #606266;
            margin-bottom: 4px;

            .filter-switch {
              transform: scale(0.7);
            }
          }

          .filter-form {
            display: flex;
            flex-direction: column;
            gap: 5px;

            .filter-row {
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
        height: 100%;
        gap: 10px;

        .test-voice-area, .custom-templates {
          .test-title, .templates-title {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 6px;
            color: #303133;
          }
        }

        .test-content {
          :deep(.el-textarea__inner) {
            font-size: 12px;
            padding: 6px 8px;
          }

          .test-buttons {
            display: flex;
            gap: 8px;
            margin-top: 6px;
            flex-wrap: wrap; /* 允许按钮换行 */

            :deep(.el-button) {
              padding: 5px 10px;
              font-size: 12px;
            }
          }
        }

        .custom-templates {
          margin-top: 0;
          flex: 1;
          display: flex;
          flex-direction: column;

          :deep(.el-table) {
            flex: 1;
            font-size: 12px;

            .el-table__body-wrapper {
              overflow-x: auto; /* 允许表格水平滚动 */
            }

            // 设置列宽比例
            .el-table__header th:nth-child(1) {
              width: 50px; /* 序号列 */
            }
            .el-table__header th:nth-child(2) {
              width: 80px; /* 类型列 */
            }
            .el-table__header th:nth-child(3) {
              min-width: 150px; /* 模板内容列 */
            }
            .el-table__header th:nth-child(4) {
              width: 80px; /* 操作列 */
            }
          }
        }
      }
    }
  }
}
</style>
