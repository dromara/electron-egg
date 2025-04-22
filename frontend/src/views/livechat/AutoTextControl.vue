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
              <span class="current-value" :class="{ 'warning': frequency.current < frequency.min }">
                {{ isControlEnabled ? frequency.current : '未启动' }}
              </span>
            </div>
          </div>

          <div class="checkbox-wrapper" style="margin-bottom: 10px;">
            <el-checkbox v-model="continuousSpeechEnabled" class="custom-checkbox">间歇发言模式</el-checkbox>
          </div>

          <div class="setting-item time-settings">
            <div class="combined-inputs">
              <div class="input-group">
                <span class="input-label">发言:</span>
                <el-input-number
                  v-model="continuousSpeechDuration"
                  :min="1"
                  :max="1440"
                  size="small"
                  controls-position="right"
                  :disabled="!continuousSpeechEnabled"
                />
                <span class="unit">分</span>
              </div>

              <div class="input-group">
                <span class="input-label">休息:</span>
                <el-input-number
                  v-model="restTime"
                  :min="0"
                  :max="1440"
                  size="small"
                  controls-position="right"
                  :disabled="!continuousSpeechEnabled"
                />
                <span class="unit">分</span>
              </div>
            </div>
          </div>

          <div class="radio-wrapper">
            <el-radio v-model="speakMode.type" label="random" class="custom-radio">随机发言</el-radio>
            <el-radio v-model="speakMode.type" label="sequential" class="custom-radio">顺序发言</el-radio>
          </div>

          <div class="checkbox-wrapper">
            <el-checkbox v-model="speakMode.randomSpace" class="custom-checkbox">随机空格</el-checkbox>
            <div class="emoji-checkbox-container">
              <el-checkbox v-model="speakMode.randomEmoji" class="custom-checkbox">随机添加表情</el-checkbox>
              <EmojiManager :disabled="!speakMode.randomEmoji" />
            </div>
          </div>

          <div class="tips-box">
            <div class="tip-line">友情提示：</div>
            <div class="tip-line">发言频率建议30-60秒短于26秒易被屏蔽</div>
            <div class="tip-line">发言太快易被封禁话术违规风险警示</div>
          </div>

          <div class="buttons-container">
            <el-button
              type="primary"
              @click="openDouyinWindow"
              class="control-button"
            >
              登录抖音
            </el-button>

            <el-button
              :type="isControlEnabled ? 'danger' : 'success'"
              @click="isControlEnabled ? disableControl() : startAutoControl()"
              :loading="loading"
              class="control-button"
            >
              {{ isControlEnabled ? '关闭自动场控' : '开启自动场控' }}
            </el-button>
          </div>
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
                <el-select
                  v-model="selectedTable"
                  placeholder="选择场控组"
                  size="small"
                  class="group-select"
                  @change="handleTableChange"
                >
                  <!-- 现有场控组选项 -->
                  <el-option
                    v-for="item in scriptTables"
                    :key="item.table_name"
                    :label="item.display_name"
                    :value="item.table_name"
                  >
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <!-- 非编辑状态显示表名 -->
                      <span v-if="!item.editing">{{ item.display_name }}</span>

                      <!-- 编辑状态显示输入框 -->
                      <el-input
                        v-else
                        v-model="item.editingName"
                        size="small"
                        style="width: 120px;"
                        @click.stop
                        @keyup.enter="confirmTableNameEdit(item)"
                      />

                      <!-- 操作按钮 -->
                      <div>
                        <!-- 非编辑状态显示编辑和删除按钮 -->
                        <span v-if="!item.editing" @click.stop="startEditTableName(item)" style="color: #409eff; cursor: pointer; margin-right: 5px;">
                          <el-icon><Edit /></el-icon>
                        </span>
                        <el-popconfirm
                          v-if="!item.editing"
                          :title="`确定要删除场控组 '${item.display_name}' 吗？所有关联的场控内容将被删除。`"
                          confirm-button-text="确定删除"
                          cancel-button-text="取消"
                          @confirm="handleDeleteScriptTable(item)"
                          width="250"
                          confirm-button-type="danger"
                        >
                          <template #reference>
                            <span @click.stop style="color: #f56c6c; cursor: pointer;">
                              <el-icon><Delete /></el-icon>
                            </span>
                          </template>
                        </el-popconfirm>

                        <!-- 编辑状态显示确认和取消按钮 -->
                        <template v-if="item.editing">
                          <span @click.stop="confirmTableNameEdit(item)" style="color: #67c23a; cursor: pointer; margin-right: 5px;">
                            <el-icon><Check /></el-icon>
                          </span>
                          <span @click.stop="cancelTableNameEdit(item)" style="color: #f56c6c; cursor: pointer;">
                            <el-icon><Close /></el-icon>
                          </span>
                        </template>
                      </div>
                    </div>
                  </el-option>

                  <!-- 新建表选项 -->
                  <el-divider style="margin: 5px 0;" />
                  <el-option
                    key="create-new"
                    label="+ 新建场控组"
                    value="create-new"
                  >
                    <div style="display: flex; align-items: center;">
                      <el-input
                        v-model="newTableName"
                        placeholder="输入表名"
                        size="small"
                        style="width: 150px; margin-right: 5px;"
                        @click.stop
                        @keyup.enter="createNewTable"
                      />
                      <el-button type="success" size="small" @click.stop="createNewTable">创建</el-button>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="right-controls">
              <el-button type="primary" size="small" @click="addScriptRow">添加内容</el-button>
              <el-button type="success" size="small" @click="exportTable">导出</el-button>
              <el-button type="warning" size="small" @click="importTable">导入</el-button>
            </div>
          </div>

          <!-- 控场话术表格 -->
          <el-table :data="controlScripts" border style="width: 100%" max-height="350" stripe size="small" :v-loading="tableLoading">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="content" label="内容">
              <template #default="scope">
                <el-input
                  v-if="scope.row.editing"
                  v-model="scope.row.content"
                  size="small"
                  class="script-content-input"
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
                  <el-button type="danger" size="small" circle @click="deleteRow(scope.$index, scope.row)" title="删除">
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
import { ipcApiRoute } from '@/api';
import { useLivechatStore } from '@/stores/livechatStore';
import { ipc } from '@/utils/ipcRenderer';
import EmojiManager from '@/components/EmojiManager.vue';
import { ref, reactive, computed, watch, onMounted, onActivated, inject, nextTick, onUnmounted } from 'vue';

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

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);

// Pinia store
const livechatStore = useLivechatStore();

// 直播间连接状态
const roomId = ref('');
const connected = ref(false);
const isConnected = ref(false); // 自动场控服务的连接状态

// 初始化场控状态
const isControlEnabled = ref(livechatStore.isAutoControlEnabled || false);
const loading = ref(false);
const consoleRef = ref(sharedState?.consoleRef || null);
const tableLoading = ref(false);

// 脚本表相关
const scriptTables = ref([]);
const selectedTable = ref(livechatStore.selectedControlTable || '');
const controlScripts = ref([]);
const newTableName = ref('');

// 频率设置 - 从localStorage中获取保存的值或使用默认值
const frequency = ref({
  min: Number(localStorage.getItem('autoControl_frequency_min')) || 30,
  max: Number(localStorage.getItem('autoControl_frequency_max')) || 60,
  current: null  // 由后端随机生成
});

// 监听频率设置变化并保存到localStorage
watch(() => frequency.value.min, (newVal) => {
  localStorage.setItem('autoControl_frequency_min', newVal);
});

watch(() => frequency.value.max, (newVal) => {
  localStorage.setItem('autoControl_frequency_max', newVal);
});

// 连续发言功能开关 - 从localStorage获取
const continuousSpeechEnabled = ref(localStorage.getItem('autoControl_continuousSpeechEnabled') === 'true');

// 连续发言时长（分钟）- 从localStorage获取
const continuousSpeechDuration = ref(Number(localStorage.getItem('autoControl_continuousSpeechDuration')) || 15);

// 休息时间（分钟）- 从localStorage获取
const restTime = ref(Number(localStorage.getItem('autoControl_restTime')) || 5);

// 发言模式 - 从localStorage获取
const speakMode = ref({
  type: localStorage.getItem('autoControl_speakMode_type') || 'random', // 'random' 或 'sequential'
  randomSpace: localStorage.getItem('autoControl_speakMode_randomSpace') !== 'false', // 默认为true
  randomEmoji: localStorage.getItem('autoControl_speakMode_randomEmoji') !== 'false'  // 默认为true
});

// 监听所有设置变化并保存到localStorage
watch(() => continuousSpeechEnabled.value, (newVal) => {
  localStorage.setItem('autoControl_continuousSpeechEnabled', newVal);
});

watch(() => continuousSpeechDuration.value, (newVal) => {
  localStorage.setItem('autoControl_continuousSpeechDuration', newVal);
});

watch(() => restTime.value, (newVal) => {
  localStorage.setItem('autoControl_restTime', newVal);
});

watch(() => speakMode.value.type, (newVal) => {
  localStorage.setItem('autoControl_speakMode_type', newVal);
});

watch(() => speakMode.value.randomSpace, (newVal) => {
  localStorage.setItem('autoControl_speakMode_randomSpace', newVal);
});

watch(() => speakMode.value.randomEmoji, (newVal) => {
  localStorage.setItem('autoControl_speakMode_randomEmoji', newVal);
});

// 添加一个变量记录上一次选中的表
const lastSelectedTable = ref('');

// 加载脚本表列表
const loadScriptTables = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.scriptdb.getScriptTables);
    if (result && result.status === 'success') {
      // 为每个表添加编辑状态属性
      scriptTables.value = (result.tables || []).map(table => ({
        ...table,
        editing: false,
        editingName: table.display_name
      }));

      // 如果没有任何表，显示提示
      if (scriptTables.value.length === 0) {
        showMessage('未找到任何场控组，请创建一个新的场控组', 'warning');
        return;
      }

      // 如果有表但没有选择，则选择第一个
      if (scriptTables.value.length > 0 && !selectedTable.value) {
        selectedTable.value = scriptTables.value[0].table_name;
        loadScripts(selectedTable.value);
      } else if (selectedTable.value) {
        // 检查当前选中的表是否存在于列表中
        const existingTable = scriptTables.value.find(t => t.table_name === selectedTable.value);
        if (!existingTable) {
          // 如果不存在，则切换到第一个表
          if (scriptTables.value.length > 0) {
            selectedTable.value = scriptTables.value[0].table_name;
            loadScripts(selectedTable.value);
            showMessage('已切换到可用的场控组', 'info');
          } else {
            selectedTable.value = '';
          }
        } else {
          // 表存在且已选中，加载该表的数据
          loadScripts(selectedTable.value);
        }
      }
    } else {
      showMessage(result?.message || '获取场控组失败', 'error');
    }
  } catch (error) {
    showMessage(`加载场控组失败: ${error.message || '未知错误'}`, 'error');
  }
};

// 加载脚本数据
const loadScripts = async (tableName) => {
  if (!tableName) return;

  tableLoading.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.scriptdb.getScripts, { tableName });
    if (result && result.status === 'success') {
      // 转换数据结构，添加编辑状态
      controlScripts.value = (result.scripts || []).map(script => ({
        ...script,
        editing: false
      }));
    } else {
      showMessage(result?.message || '获取话术失败', 'error');
    }
  } catch (error) {
    showMessage(`加载话术失败: ${error.message || '未知错误'}`, 'error');
  } finally {
    tableLoading.value = false;
  }
};

// 处理表切换
const handleTableChange = (value) => {
  // 如果选择了新建表选项，不做处理，保持上一个选中值
  if (value === 'create-new') {
    // 恢复之前的选择
    nextTick(() => {
      if (scriptTables.value.length > 0) {
        selectedTable.value = lastSelectedTable.value || scriptTables.value[0].table_name;
      } else {
        selectedTable.value = '';
      }
    });
    return;
  }

  // 记住当前选择
  lastSelectedTable.value = value;

  // 更新Pinia store中的选择
  livechatStore.setSelectedControlTable(value);

  // 加载选定表的脚本
  loadScripts(value);
};

// 脚本操作函数（添加、编辑、删除）
const scriptOperation = async (action, params = {}) => {
  if (!selectedTable.value) {
    showMessage('请先选择一个场控组', 'warning');
    return;
  }

  try {
    // 构建请求参数
    const requestParams = {
      tableName: selectedTable.value,
      ...params
    };

    // 执行对应的操作
    const result = await ipc.invoke(ipcApiRoute.scriptdb[action], requestParams);

    // 统一处理响应
    if (result && result.status === 'success') {
      // 根据操作类型处理成功响应
      switch (action) {
        case 'addScript':
          // 刷新整个列表
          loadScripts(selectedTable.value);

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextControlLog(`已添加新脚本: "${params.content}"`);
          }

          showMessage('添加成功');
          break;

        case 'updateScript':
          // 更新行编辑状态
          if (params.row) {
            params.row.editing = false;
          }

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextControlLog(`已更新脚本: "${params.content}"`);
          }

          showMessage('更新成功');
          break;

        case 'deleteScript':
          // 从本地数组移除
          if (typeof params.index === 'number') {
            controlScripts.value.splice(params.index, 1);
          }

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextControlLog('已删除一条控场脚本');
          }

          showMessage('删除成功');
          break;

        case 'createScriptTable':
          // 刷新表列表
          await loadScriptTables();

          // 选择新创建的表
          selectedTable.value = result.tableName;
          loadScripts(selectedTable.value);

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addSystemMessage('system', `已创建新控场组: "${params.displayName}"`);
          }

          showMessage(`已创建控场组: ${params.displayName}`);
          break;

        case 'updateScriptTable':
          // 刷新表列表
          await loadScriptTables();

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addSystemMessage('system', `已修改控场组名称: "${params.oldDisplayName}" -> "${params.newDisplayName}"`);
          }

          showMessage('修改成功');
          break;

        default:
          showMessage(result.message || '操作成功');
      }
    } else {
      // 统一处理错误
      showMessage(result?.message || `${getActionName(action)}失败`, 'error');

      // 如果是更新操作，恢复原始内容
      if (action === 'updateScript' && params.row && params.originalContent !== undefined) {
        params.row.content = params.originalContent;
        params.row.editing = false;
      }

      // 如果是删除失败，刷新列表
      if (action === 'deleteScript') {
        loadScripts(selectedTable.value);
      }
    }
  } catch (error) {
    showMessage(`操作失败: ${error.message || '未知错误'}`, 'error');

    // 如果是更新操作，恢复原始内容
    if (action === 'updateScript' && params.row) {
      params.row.content = params.originalContent || '';
      params.row.editing = false;
    }
  }
};

// 获取操作名称（用于错误提示）
const getActionName = (action) => {
  const actionMap = {
    addScript: '添加脚本',
    updateScript: '更新脚本',
    deleteScript: '删除脚本',
    createScriptTable: '创建控场组',
    updateScriptTable: '修改控场组'
  };

  return actionMap[action] || '操作';
};

// 添加脚本行
const addScriptRow = () => {
  if (!selectedTable.value) {
    showMessage('请先选择一个场控组', 'warning');
    return;
  }

  const newRow = {
    content: '',
    editing: true,
    isNew: true // 标记为新行
  };

  controlScripts.value.push(newRow);

  // 聚焦新添加的行
  nextTick(() => {
    const inputs = document.querySelectorAll('.script-content-input');
    if (inputs && inputs.length > 0) {
      const lastInput = inputs[inputs.length - 1];
      lastInput.focus();
    }
  });

  if (sharedState?.consoleRef) {
    sharedState.consoleRef.addTextControlLog('添加了一条新控场脚本');
  }
};

// 编辑行
const editRow = (row) => {
  // 保存原内容，以便取消时恢复
  row.originalContent = row.content;
  row.editing = true;
};

// 确认编辑
const confirmEdit = (row) => {
  if (!row.content || row.content.trim() === '') {
    showMessage('内容不能为空', 'warning');
    return;
  }

  // 如果是新行，调用添加API
  if (row.isNew) {
    ipc.invoke(ipcApiRoute.scriptdb.addScript, {
      tableName: selectedTable.value,
      content: row.content
    }).then(result => {
      if (result && result.status === 'success') {
        // 添加成功，更新行状态
        row.id = result.id;
        row.isNew = false;
        row.editing = false;
        showMessage('添加成功');

        // 刷新列表以获取正确的ID和顺序
        loadScripts(selectedTable.value);

        if (sharedState?.consoleRef) {
          sharedState.consoleRef.addTextControlLog(`已添加新脚本: "${row.content}"`);
        }
      } else {
        // 添加失败，显示错误信息并从列表中移除
        showMessage(result?.message || '添加失败', 'error');
        const index = controlScripts.value.indexOf(row);
        if (index !== -1) {
          controlScripts.value.splice(index, 1);
        }
      }
    }).catch(error => {
      // 添加失败，显示错误信息并从列表中移除
      showMessage(`添加失败: ${error.message || '未知错误'}`, 'error');
      const index = controlScripts.value.indexOf(row);
      if (index !== -1) {
        controlScripts.value.splice(index, 1);
      }
    });
    return;
  }

  // 如果是现有行，调用更新API
  ipc.invoke(ipcApiRoute.scriptdb.updateScript, {
    tableName: selectedTable.value,
    id: row.id,
    content: row.content
  }).then(result => {
    if (result && result.status === 'success') {
      // 更新成功
      row.editing = false;
      showMessage('保存成功');

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextControlLog(`已更新脚本: "${row.content}"`);
      }
    } else {
      // 更新失败，显示错误信息
      showMessage(result?.message || '保存失败', 'error');
      // 如果有原始内容，则恢复
      if (row.originalContent !== undefined) {
        row.content = row.originalContent;
      }
    }
  }).catch(error => {
    showMessage(`保存失败: ${error.message || '未知错误'}`, 'error');
    // 如果有原始内容，则恢复
    if (row.originalContent !== undefined) {
      row.content = row.originalContent;
    }
  }).finally(() => {
    row.editing = false;
  });
};

// 删除行
const deleteRow = (index, row) => {
  console.log('删除行', index, row);

  // 直接调用API删除
  ipc.invoke(ipcApiRoute.scriptdb.deleteScript, {
    tableName: selectedTable.value,
    id: row.id
  }).then(result => {
    if (result && result.status === 'success') {
      // 从本地数组中移除该行
      controlScripts.value.splice(index, 1);

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextControlLog('已删除一条控场脚本');
      }

      showMessage('删除成功');
    } else {
      showMessage(result?.message || '删除脚本失败', 'error');
      // 刷新列表
      loadScripts(selectedTable.value);
    }
  }).catch(error => {
    showMessage(`删除失败: ${error.message || '未知错误'}`, 'error');
    // 刷新列表
    loadScripts(selectedTable.value);
  });
};

// 创建新表
const createNewTable = () => {
  if (!newTableName.value || newTableName.value.trim() === '') {
    showMessage('请输入表名', 'warning');
    return;
  }

  // 使用输入框中的值创建表
  scriptOperation('createScriptTable', { displayName: newTableName.value });

  // 创建成功后清空输入框
  newTableName.value = '';
};

// 开始编辑表名
const startEditTableName = (table) => {
  // 先重置其他所有表的编辑状态
  scriptTables.value.forEach(t => {
    if (t !== table) {
      t.editing = false;
    }
  });

  // 设置当前表为编辑状态
  table.editing = true;
  table.editingName = table.display_name;
};

// 确认表名编辑
const confirmTableNameEdit = (table) => {
  if (!table.editingName || table.editingName.trim() === '') {
    showMessage('表名不能为空', 'warning');
    return;
  }

  // 如果名称没有变化，直接取消编辑
  if (table.editingName === table.display_name) {
    table.editing = false;
    return;
  }

  // 调用更新API
  scriptOperation('updateScriptTable', {
    tableName: table.table_name,
    newDisplayName: table.editingName,
    oldDisplayName: table.display_name
  });

  // 退出编辑状态
  table.editing = false;
};

// 取消表名编辑
const cancelTableNameEdit = (table) => {
  table.editing = false;
};

// 处理删除场控组
const handleDeleteScriptTable = (table) => {
  // 用户已通过气泡确认框确认删除，直接调用API
  ipc.invoke(ipcApiRoute.scriptdb.deleteScriptTable, {
    tableName: table.table_name
  }).then(result => {
    if (result && result.status === 'success') {
      showMessage(`已删除场控组: ${table.display_name}`);

      // 移除已删除的表
      const index = scriptTables.value.findIndex(t => t.table_name === table.table_name);
      if (index !== -1) {
        scriptTables.value.splice(index, 1);
      }

      // 如果当前选择的表被删除，切换到新的表或清空选择
      if (selectedTable.value === table.table_name) {
        if (scriptTables.value.length > 0) {
          selectedTable.value = scriptTables.value[0].table_name;
          loadScripts(selectedTable.value);
        } else {
          selectedTable.value = '';
          controlScripts.value = [];
        }
      }

      // 记录到控制台
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', `已删除控场组: "${table.display_name}"`);
      }
    } else {
      // 删除失败
      showMessage(result?.message || '删除场控组失败', 'error');
    }
  }).catch(error => {
    showMessage(`删除场控组失败: ${error.message || '未知错误'}`, 'error');
  });
};

// 检查场控服务连接状态
const checkConnectionStatus = async () => {
  try {
    // 调用后端API检查场控服务连接状态
    const result = await ipc.invoke(ipcApiRoute.livechatAutoControl.getConnectionStatus);

    if (result && result.status === 'success') {
      // 更新场控服务连接状态
      isConnected.value = result.data?.connected || false;

      console.log('场控服务状态检查结果:', {
        isConnected: isConnected.value,
        livechatStore: {
          connected: livechatStore.connected,
          roomId: livechatStore.roomId
        }
      });
    }
  } catch (error) {
    console.error('检查场控服务连接状态失败:', error);
    isConnected.value = false;
  }
};

/**
 * 启动自动场控
 */
const startAutoControl = async () => {
  // 检查store中的连接状态
  const isStoreConnected = livechatStore.connected;
  const storeRoomId = livechatStore.roomId;

  if (!isStoreConnected || !storeRoomId) {
    showMessage('请先连接到直播间', 'warning');
    return;
  }

  if (!selectedTable.value) {
    showMessage('请先选择一个场控组', 'warning');
    return;
  }

  // 检查场控组中的脚本数量
  if (!controlScripts.value || controlScripts.value.length === 0) {
    showMessage('当前场控组中没有任何脚本，请先添加脚本', 'warning');
    return;
  }

  loading.value = true;

  try {
    // 首先检查连接状态，避免重复连接
    const connectionStatus = await ipc.invoke(ipcApiRoute.livechatAutoControl.getConnectionStatus);
    console.log('当前连接状态:', connectionStatus);

    let connectionResult = { status: 'success' };

    // 只有当实际未连接时才进行连接
    if (!connectionStatus.data?.connected) {
      console.log('尝试连接自动场控服务...');
      connectionResult = await ipc.invoke(ipcApiRoute.livechatAutoControl.connectToLiveRoom, {
        roomId: storeRoomId
      });

      if (!connectionResult.status || connectionResult.status !== 'success') {
        throw new Error('无法连接到自动场控服务: ' + (connectionResult.message || '未知错误'));
      }

      if (connectionResult && connectionResult.status === 'success') {
        isConnected.value = true;
      }
    } else {
      console.log('已连接到直播间，无需重新连接');
      isConnected.value = true;
    }

    // 构建脚本数据
    const scripts = controlScripts.value.map(script => ({
      id: script.id,
      content: script.content,
      enabled: script.enabled !== false
    }));

    // 构建场控设置
    const settings = {
      frequency: {
        min: Number(frequency.value.min),
        max: Number(frequency.value.max)
      },
      continuousSpeechEnabled: Boolean(continuousSpeechEnabled.value),
      continuousSpeechDuration: Number(continuousSpeechDuration.value),
      restTime: Number(restTime.value),
      random: speakMode.value.type === 'random',
      sequential: speakMode.value.type === 'sequential',
      randomSpace: Boolean(speakMode.value.randomSpace),
      randomEmoji: Boolean(speakMode.value.randomEmoji)
    };

    // 调用后端启动自动场控
    const result = await ipc.invoke(ipcApiRoute.livechatAutoControl.startAutoControl, {
      tableName: selectedTable.value,
      scripts: scripts,
      settings: settings
    });

    if (result && result.status === 'success') {
      isControlEnabled.value = true;
      // 更新Pinia store中的状态
      livechatStore.setAutoControlEnabled(true);

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextControlLog('自动场控已启用');
        sharedState.consoleRef.addTextControlLog(`使用场控组: ${selectedTable.value}，${scripts.length}条脚本`);
      }
      showMessage('已开启自动场控', 'success');
    } else {
      showMessage(result?.message || '启动自动场控失败', 'error');
    }
  } catch (error) {
    console.error('启动自动场控出错:', error);
    showMessage('启动自动场控失败: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
};

// 更新关闭自动控场功能
const disableControl = async () => {
  loading.value = true;
  try {
    const result = await ipc.invoke(ipcApiRoute.livechatAutoControl.stopAutoControl);

    if (result && result.status === 'success') {
      isControlEnabled.value = false;

      if (consoleRef.value) {
        consoleRef.value.addTextControlLog('自动文字控场已停用');
      }

      showMessage('已关闭自动场控');
    } else {
      showMessage(result?.message || '关闭自动场控失败', 'error');
    }
  } catch (error) {
    console.error('关闭自动场控出错:', error);
    showMessage(`关闭自动场控失败: ${error.message || '未知错误'}`, 'error');
  } finally {
    loading.value = false;
  }
};

// 页面挂载时同步状态
onMounted(async () => {
  // 先加载数据
  console.log('AutoTextControl组件已挂载，开始加载数据...');

  // 添加倒计时消息监听
  ipc.on('livechat-countdown', (event, data) => {
    if (data && data.seconds) {
      frequency.value.current = data.seconds;
    }
  });

  // 先从Pinia中获取初始状态
  isControlEnabled.value = livechatStore.isAutoControlEnabled;

  // 同步Pinia中的直播间状态
  connected.value = livechatStore.connected;
  roomId.value = livechatStore.roomId;

  // 初始化默认表
  try {
    // 首先尝试检查并修复默认表
    await ipc.invoke(ipcApiRoute.scriptdb.checkAndFixDefaultTable)
      .then(() => {
  // 加载表格
        loadScriptTables();
      })
      .catch((error) => {
        console.error('检查默认表失败', error);
        // 继续加载可用的表
        loadScriptTables();
      });
  } catch (error) {
    console.error('检查默认表异常', error);
    // 出错后仍然尝试加载表
    loadScriptTables();
  }

  // 然后检查实际的自动场控状态，确保按钮状态与实际状态同步
  await checkAutoControlStatus();
  console.log('自动场控状态同步完成，当前状态:', isControlEnabled.value);
});

// 页面激活时检查状态
onActivated(async () => {
  console.log('AutoTextControl组件被激活，检查状态...');
  // 每次页面激活时，重新检查自动场控状态
  await checkAutoControlStatus();
});

// 监听连接状态和房间ID的变化，同步到Pinia
watch(() => connected.value, (newVal) => {
  livechatStore.setConnected(newVal);
  if (sharedState) {
    sharedState.connected = newVal;
  }
});

watch(() => roomId.value, (newVal) => {
  livechatStore.setRoomId(newVal);
  if (sharedState) {
    sharedState.roomId = newVal;
  }
});

// 检查默认表是否存在 - 已不再使用
const checkDefaultTable = async () => {
  try {
    if (!ipcApiRoute.scriptdb.checkAndFixDefaultTable) {
      console.error('checkAndFixDefaultTable路由未定义');
      loadScriptTables();
      return;
    }

    // 先检查表是否存在于管理表中
    await ipc.invoke(ipcApiRoute.scriptdb.checkAndFixDefaultTable)
      .then(() => {
        // 无论结果如何，都重新加载表格
        loadScriptTables();
      })
      .catch((error) => {
        console.error('检查默认表失败', error);
        // 继续加载可用的表
        loadScriptTables();
      });
  } catch (error) {
    console.error('检查默认表异常', error);
    // 出错后仍然尝试加载表
    loadScriptTables();
  }
};

// 导出表格数据
const exportTable = async () => {
  if (!selectedTable.value) {
    showMessage('请先选择一个场控组', 'warning');
    return;
  }

  try {
    // 调用后端API导出表格
    const result = await ipc.invoke(ipcApiRoute.scriptdb.exportScriptTable, {
      tableName: selectedTable.value
    });

    if (result && result.status === 'success') {
      showMessage(`导出成功: ${result.filePath}`, 'success');

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextControlLog(`已导出场控组: ${selectedTable.value}`);
      }
    } else {
      showMessage(result?.message || '导出失败', 'error');
    }
  } catch (error) {
    showMessage(`导出失败: ${error.message || '未知错误'}`, 'error');
  }
};

// 导入表格数据
const importTable = async () => {
  if (!selectedTable.value) {
    showMessage('请先选择一个要导入到的场控组', 'warning');
    return;
  }

  try {
    // 调用后端API导入表格
    const result = await ipc.invoke(ipcApiRoute.scriptdb.importScriptTable, {
      tableName: selectedTable.value
    });

    if (result && result.status === 'success') {
      // 刷新表格数据
      loadScripts(selectedTable.value);
      showMessage(`导入成功: 共导入 ${result.importedCount || 0} 条记录`, 'success');

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextControlLog(`已导入数据到场控组: ${selectedTable.value}`);
      }
    } else {
      showMessage(result?.message || '导入失败', 'error');
    }
  } catch (error) {
    showMessage(`导入失败: ${error.message || '未知错误'}`, 'error');
  }
};

// 打开抖音窗口
const openDouyinWindow = () => {
  const windowConfig = {
    type: 'web',
    content: 'https://www.douyin.com/',
    windowName: 'window-douyin',
    windowTitle: '抖音',
    userDataDir: 'douyin_user_data', // 数据持久化目录，会保存在extraResources下
    persist: true // 启用数据持久化
  };
  ipc.invoke(ipcApiRoute.os.createWindow, windowConfig);
};

// 检查自动场控状态
const checkAutoControlStatus = async () => {
  try {
    // 调用后端API检查自动场控状态
    const result = await ipc.invoke(ipcApiRoute.livechatAutoControl.getAutoControlStatus);
    console.log('检查自动场控状态结果:', JSON.stringify(result));

    if (result && result.status === 'success') {
      // 正确处理不同的返回数据结构
      let enabled = false;

      if (result.data && result.data.hasOwnProperty('enabled')) {
        // 新的返回结构 { status, data: { enabled } }
        enabled = !!result.data.enabled;
      } else if (result.hasOwnProperty('enabled')) {
        // 旧的返回结构 { status, enabled }
        enabled = !!result.enabled;
      }

      console.log(`解析后的自动场控状态: ${enabled ? '已启用' : '未启用'}`);

      isControlEnabled.value = enabled;
      // 更新Pinia store中的状态
      livechatStore.setAutoControlEnabled(enabled);
    }
  } catch (error) {
    console.error('检查自动场控状态失败:', error);
  }
};

// 监听来自Pinia的自动场控状态变化
watch(() => livechatStore.isAutoControlEnabled, (newValue) => {
  console.log('Pinia中自动场控状态变化:', newValue);
  if (newValue !== isControlEnabled.value) {
    isControlEnabled.value = newValue;
  }
});

// 在组件卸载时清理
onUnmounted(() => {
  // 移除倒计时监听
  ipc.removeAllListeners('livechat-countdown');
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
    overflow-x: hidden; /* 修改为hidden，防止水平滚动 */

    .left-panel, .right-panel {
      border: 1px solid #e4e7ed;
      border-radius: 3px;
      background-color: #fff;
    }

    .left-panel {
      width: 28%;
      min-width: 200px; /* 确保左面板有最小宽度 */
      max-width: 300px; /* 限制最大宽度 */
      overflow: hidden; /* 修改为hidden，防止水平滚动 */
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

          .combined-inputs {
            display: flex;
            flex: 1;
            align-items: center;
            flex-wrap: nowrap;

            .input-label {
              font-size: 12px;
              color: #606266;
              margin-right: 4px;
              white-space: nowrap;
            }
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

        .radio-wrapper {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;

          :deep(.el-radio) {
            margin-right: 0;
            height: 24px;

            .el-radio__label {
              font-size: 12px;
              padding-left: 4px;
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

        .buttons-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin-top: 10px;

          .control-button {
            width: 90%;
            margin: 5px 0;
          }
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

.time-settings {
  padding: 0 2px;
  width: 100%;

  .combined-inputs {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .input-group {
      display: flex;
      align-items: center;

      .input-label {
        font-size: 12px;
        color: #606266;
        margin-right: 4px;
        white-space: nowrap;
      }

      .el-input-number {
        width: 70px;
      }

      .unit {
        margin-left: 2px;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}

.emoji-checkbox-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.emoji-edit-button {
  margin-left: 5px;
  font-size: 12px;
  width: 18px;
  height: 18px;
  padding: 0;
}

.emoji-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.emoji-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  align-items: center;
}

.emoji-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.emoji-input {
  width: 100px;
  margin-left: 5px;
  vertical-align: bottom;
}

.button-new-emoji {
  margin-left: 5px;
  height: 28px;
  line-height: 26px;
  padding: 0 10px;
  font-size: 12px;
}
</style>
