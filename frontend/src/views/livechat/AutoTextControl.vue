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
                        <span v-if="!item.editing" @click.stop="deleteScriptTable(item)" style="color: #f56c6c; cursor: pointer;">
                          <el-icon><Delete /></el-icon>
                        </span>

                        <!-- 编辑状态显示确认和取消按钮 -->
                        <template v-else>
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
import { ref, onMounted, inject, nextTick } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, Check, Close } from '@element-plus/icons-vue';

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);

// 状态变量
const roomId = ref(sharedState?.roomId || '');
const connected = ref(sharedState?.connected || false);
const isControlEnabled = ref(false);
const loading = ref(false);
const consoleRef = ref(sharedState?.consoleRef || null);
const tableLoading = ref(false);

// 脚本表相关
const scriptTables = ref([]);
const selectedTable = ref('');
const controlScripts = ref([]);
const newTableName = ref('');

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
        ElMessage.warning('未找到任何场控组，请创建一个新的场控组');
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
            ElMessage.info('已切换到可用的场控组');
          } else {
            selectedTable.value = '';
          }
        }
      }
    } else {
      ElMessage.error(result?.message || '获取场控组失败');
    }
  } catch (error) {
    ElMessage.error(`加载场控组失败: ${error.message || '未知错误'}`);
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
      ElMessage.error(result?.message || '获取话术失败');
    }
  } catch (error) {
    ElMessage.error(`加载话术失败: ${error.message || '未知错误'}`);
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

  // 加载选定表的脚本
  loadScripts(value);
};

// 脚本操作函数（添加、编辑、删除）
const scriptOperation = async (action, params = {}) => {
  if (!selectedTable.value) {
    ElMessage.warning('请先选择一个场控组');
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

          ElMessage.success('添加成功');
          break;

        case 'updateScript':
          // 更新行编辑状态
          if (params.row) {
            params.row.editing = false;
          }

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextControlLog(`已更新脚本: "${params.content}"`);
          }

          ElMessage.success('更新成功');
          break;

        case 'deleteScript':
          // 从本地数组移除
          if (typeof params.index === 'number') {
            controlScripts.value.splice(params.index, 1);
          }

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextControlLog('已删除一条控场脚本');
          }

          ElMessage.success('删除成功');
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

          ElMessage.success(`已创建控场组: ${params.displayName}`);
          break;

        case 'updateScriptTable':
          // 刷新表列表
          await loadScriptTables();

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addSystemMessage('system', `已修改控场组名称: "${params.oldDisplayName}" -> "${params.newDisplayName}"`);
          }

          ElMessage.success('修改成功');
          break;

        default:
          ElMessage.success(result.message || '操作成功');
      }
    } else {
      // 统一处理错误
      ElMessage.error(result?.message || `${getActionName(action)}失败`);

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
    ElMessage.error(`操作失败: ${error.message || '未知错误'}`);

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
    ElMessage.warning('请先选择一个场控组');
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
    ElMessage.warning('内容不能为空');
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
        ElMessage.success('添加成功');

        // 刷新列表以获取正确的ID和顺序
        loadScripts(selectedTable.value);

        if (sharedState?.consoleRef) {
          sharedState.consoleRef.addTextControlLog(`已添加新脚本: "${row.content}"`);
        }
      } else {
        // 添加失败，显示错误信息并从列表中移除
        ElMessage.error(result?.message || '添加失败');
        const index = controlScripts.value.indexOf(row);
        if (index !== -1) {
          controlScripts.value.splice(index, 1);
        }
      }
    }).catch(error => {
      // 添加失败，显示错误信息并从列表中移除
      ElMessage.error(`添加失败: ${error.message || '未知错误'}`);
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
      ElMessage.success('保存成功');

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextControlLog(`已更新脚本: "${row.content}"`);
      }
    } else {
      // 更新失败，显示错误信息
      ElMessage.error(result?.message || '保存失败');
      // 如果有原始内容，则恢复
      if (row.originalContent !== undefined) {
        row.content = row.originalContent;
      }
    }
  }).catch(error => {
    ElMessage.error(`保存失败: ${error.message || '未知错误'}`);
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

      ElMessage.success('删除成功');
    } else {
      ElMessage.error(result?.message || '删除脚本失败');
      // 刷新列表
      loadScripts(selectedTable.value);
    }
  }).catch(error => {
    ElMessage.error(`删除失败: ${error.message || '未知错误'}`);
    // 刷新列表
    loadScripts(selectedTable.value);
  });
};

// 创建新表
const createNewTable = () => {
  if (!newTableName.value || newTableName.value.trim() === '') {
    ElMessage.warning('请输入表名');
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
    ElMessage.warning('表名不能为空');
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

// 删除场控组
const deleteScriptTable = (table) => {
  // 确认删除
  ElMessageBox.confirm(
    `确定要删除场控组 "${table.display_name}" 吗？所有关联的场控内容将被删除。`,
    '删除场控组',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 用户确认删除，调用API
    ipc.invoke(ipcApiRoute.scriptdb.deleteScriptTable, {
      tableName: table.table_name
    }).then(result => {
      if (result && result.status === 'success') {
        ElMessage.success(`已删除场控组: ${table.display_name}`);

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
        ElMessage.error(result?.message || '删除场控组失败');
      }
    }).catch(error => {
      ElMessage.error(`删除场控组失败: ${error.message || '未知错误'}`);
    });
  }).catch(() => {
    // 用户取消删除
    ElMessage.info('已取消删除');
  });
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

  // 直接加载表格，不再尝试修复默认表
  loadScriptTables();
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
