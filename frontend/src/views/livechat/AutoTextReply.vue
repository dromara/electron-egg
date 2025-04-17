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
                <el-select
                  v-model="selectedTable"
                  placeholder="选择关键词组"
                  size="small"
                  class="group-select"
                  @change="handleReplyTableChange"
                >
                  <!-- 现有关键词组选项 -->
                  <el-option
                    v-for="item in replyTables"
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
                        <!-- 非编辑状态显示编辑按钮 -->
                        <span v-if="!item.editing" @click.stop="startEditTableName(item)" style="color: #409eff; cursor: pointer;">
                          <el-icon><Edit /></el-icon>
                        </span>

                        <!-- 添加删除按钮 -->
                        <el-popconfirm
                          v-if="!item.editing"
                          :title="`确定要删除关键词组 '${item.display_name}' 吗？该操作不可恢复！`"
                          confirm-button-text="确定"
                          cancel-button-text="取消"
                          @confirm="handleDeleteTable(item)"
                          width="250"
                          confirm-button-type="danger"
                        >
                          <template #reference>
                            <span @click.stop style="color: #f56c6c; cursor: pointer; margin-left: 8px;">
                              <el-icon><Delete /></el-icon>
                            </span>
                          </template>
                        </el-popconfirm>

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
                    label="+ 新建关键词组"
                    value="create-new"
                  >
                    <div style="display: flex; align-items: center;">
                      <el-input
                        v-model="newTableName"
                        placeholder="输入表名"
                        size="small"
                        style="width: 150px; margin-right: 5px;"
                        @click.stop
                        @keyup.enter="createTable"
                      />
                      <el-button type="success" size="small" @click.stop="createTable">创建</el-button>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="right-controls">
              <el-button type="primary" size="small" @click="addKeywordRow">添加</el-button>
            </div>
          </div>

          <!-- 关键词表格 -->
          <el-table :data="keywordItems" border style="width: 100%" max-height="350" stripe size="small" :v-loading="tableLoading">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="keyword" label="关键词">
              <template #default="scope">
                <el-input
                  v-if="scope.row.editing"
                  v-model="scope.row.keyword"
                  size="small"
                  class="keyword-input"
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
                  <el-button type="danger" size="small" circle @click="handleDelete(scope.row)" title="删除">
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
import { ref, onMounted, inject, nextTick, watch } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, Check, Close } from '@element-plus/icons-vue';
import { useLivechatStore } from '@/stores/livechatStore';

// 使用共享状态 - 如果使用了 provide/inject 模式
const sharedState = inject('livechatState', null);

// Pinia store
const livechatStore = useLivechatStore();

// 状态变量
const roomId = ref(livechatStore.roomId || sharedState?.roomId || '');
const connected = ref(livechatStore.connected || sharedState?.connected || false);
const isAutoReplyEnabled = ref(false);
const loading = ref(false);
const consoleRef = ref(sharedState?.consoleRef || null);
const tableLoading = ref(false);

// 关键词和关键词组
const replyTables = ref([]);
const selectedTable = ref(livechatStore.selectedReplyTable || '');
const keywordItems = ref([]);
const newTableName = ref('');

// 添加一个变量记录上一次选中的表
const lastSelectedTable = ref('');

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

// 添加对话框相关变量
const dialogVisible = ref(false);
const formData = ref({
  id: null,
  keyword: '',
  reply: '',
  priority: 0,
  enabled: true
});

// 添加replies变量
const replies = ref([]);

// 加载关键词组列表
const loadReplyTables = async () => {
  try {
    console.log('正在获取回复表列表...');
    const result = await ipc.invoke(ipcApiRoute.scriptdb.getReplyTables);
    console.log('获取回复表结果:', result);

    if (result && result.status === 'success') {
      // 为每个表添加编辑状态属性
      replyTables.value = (result.tables || []).map(table => ({
        ...table,
        editing: false,
        editingName: table.display_name
      }));

      console.log('已加载表格列表:', replyTables.value);

      // 如果有表但没有选择，则选择第一个
      if (replyTables.value.length > 0 && !selectedTable.value) {
        selectedTable.value = replyTables.value[0].table_name;
        loadReplies(selectedTable.value);
      } else if (selectedTable.value) {
        // 检查当前选中的表是否存在于列表中
        const existingTable = replyTables.value.find(t => t.table_name === selectedTable.value);
        if (!existingTable) {
          // 如果不存在，则切换到第一个表
          if (replyTables.value.length > 0) {
            selectedTable.value = replyTables.value[0].table_name;
            loadReplies(selectedTable.value);
            ElMessage.info('已切换到可用的关键词组');
          } else {
            selectedTable.value = '';
            keywordItems.value = [];
          }
        } else {
          // 表格存在且已选中，加载该表格的数据
          loadReplies(selectedTable.value);
        }
      }
    } else {
      ElMessage.error(result?.message || '获取关键词组列表失败');
    }
  } catch (error) {
    console.error('加载表格失败:', error);
    ElMessage.error(`获取关键词组列表失败: ${error.message || '未知错误'}`);
  }
};

// 加载回复列表
const loadReplies = async (tableName) => {
  if (!tableName) return;

  tableLoading.value = true;
  try {
    console.log('加载表格内容:', tableName);
    const result = await ipc.invoke(ipcApiRoute.scriptdb.getReplies, { tableName });
    console.log('获取回复列表结果:', result);

    if (result && result.status === 'success') {
      keywordItems.value = (result.replies || []).map(reply => ({
        ...reply,
        editing: false
      }));
      console.log('已加载关键词条目:', keywordItems.value);
    } else {
      ElMessage.error(result?.message || '加载回复列表失败');
    }
  } catch (error) {
    console.error('加载回复列表失败:', error);
    ElMessage.error(`加载回复列表失败: ${error.message || '未知错误'}`);
  } finally {
    tableLoading.value = false;
  }
};

// 处理回复表切换
const handleReplyTableChange = async (tableName) => {
  // 如果选择了创建新表选项，不进行加载
  if (tableName === 'create-new') {
    // 恢复之前的选择
    nextTick(() => {
      selectedTable.value = lastSelectedTable.value || '';
    });
    return;
  }

  // 保存当前选择
  lastSelectedTable.value = tableName;
  selectedTable.value = tableName;
  
  // 更新Pinia store中的选择
  livechatStore.setSelectedReplyTable(tableName);
  
  await loadReplies(tableName);
};

// 回复操作函数（添加、编辑、删除）
const replyOperation = async (action, params = {}) => {
  if (!selectedTable.value) {
    ElMessage.warning('请先选择一个关键词组');
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
        case 'addReply':
          // 刷新整个列表
          loadReplies(selectedTable.value);

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextReplyLog(`已添加新关键词: "${params.keyword}" -> "${params.reply}"`);
          }

          ElMessage.success('添加成功');
          break;

        case 'updateReply':
          // 更新行编辑状态
          if (params.row) {
            params.row.editing = false;
          }

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextReplyLog(`已更新关键词: "${params.keyword}" -> "${params.reply}"`);
          }

          ElMessage.success('更新成功');
          break;

        case 'deleteReply':
          // 从本地数组移除
          if (typeof params.index === 'number') {
            keywordItems.value.splice(params.index, 1);
          }

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addTextReplyLog('已删除一条关键词');
          }

          ElMessage.success('删除成功');
          break;

        case 'createReplyTable':
          // 刷新表列表
          await loadReplyTables();

          // 选择新创建的表
          selectedTable.value = result.tableName;
          loadReplies(selectedTable.value);

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addSystemMessage('system', `已创建新关键词组: "${params.displayName}"`);
          }

          ElMessage.success(`已创建关键词组: ${params.displayName}`);
          break;

        case 'updateReplyTable':
          // 刷新表列表
          await loadReplyTables();

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addSystemMessage('system', `已修改关键词组名称: "${params.oldDisplayName}" -> "${params.newDisplayName}"`);
          }

          ElMessage.success('修改成功');
          break;

        case 'deleteReplyTable':
          // 刷新表列表
          await loadReplyTables();

          if (sharedState?.consoleRef) {
            sharedState.consoleRef.addSystemMessage('system', `已删除关键词组: "${params.displayName}"`);
          }

          ElMessage.success(`已删除关键词组: ${params.displayName}`);
          break;

        default:
          ElMessage.success(result.message || '操作成功');
      }
    } else {
      // 统一处理错误
      ElMessage.error(result?.message || `${getActionName(action)}失败`);

      // 如果是更新操作，恢复原始内容
      if (action === 'updateReply' && params.row) {
        params.row.keyword = params.originalKeyword || '';
        params.row.reply = params.originalReply || '';
        params.row.editing = false;
      }

      // 如果是删除失败，刷新列表
      if (action === 'deleteReply') {
        loadReplies(selectedTable.value);
      }
    }
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message || '未知错误'}`);

    // 如果是更新操作，恢复原始内容
    if (action === 'updateReply' && params.row) {
      params.row.keyword = params.originalKeyword || '';
      params.row.reply = params.originalReply || '';
      params.row.editing = false;
    }
  }
};

// 获取操作名称（用于错误提示）
const getActionName = (action) => {
  const actionMap = {
    addReply: '添加关键词',
    updateReply: '更新关键词',
    deleteReply: '删除关键词',
    createReplyTable: '创建关键词组',
    updateReplyTable: '修改关键词组',
    deleteReplyTable: '删除关键词组'
  };

  return actionMap[action] || '操作';
};

// 添加关键词行
const addKeywordRow = () => {
  if (!selectedTable.value) {
    ElMessage.warning('请先选择一个关键词组');
    return;
  }

  console.log('添加新行');
  const newRow = {
    keyword: '',
    reply: '',
    editing: true,
    isNew: true // 标记为新行
  };

  keywordItems.value.push(newRow);

  // 聚焦新添加的行
  nextTick(() => {
    const inputs = document.querySelectorAll('.keyword-input');
    if (inputs && inputs.length > 0) {
      const lastInput = inputs[inputs.length - 1];
      lastInput.focus();
    }
  });

  if (sharedState?.consoleRef) {
    sharedState.consoleRef.addTextReplyLog('添加了一条新关键词');
  }
};

// 编辑行
const editRow = (row) => {
  console.log('编辑行:', row);
  // 保存原内容，以便取消时恢复
  row.originalKeyword = row.keyword;
  row.originalReply = row.reply;
  row.editing = true;
};

// 确认编辑
const confirmEdit = (row) => {
  console.log('确认编辑:', row);
  if (!row.keyword || row.keyword.trim() === '') {
    ElMessage.warning('关键词不能为空');
    return;
  }

  if (!row.reply || row.reply.trim() === '') {
    ElMessage.warning('回复内容不能为空');
    return;
  }

  // 如果是新行，调用添加API
  if (row.isNew) {
    ipc.invoke(ipcApiRoute.scriptdb.addReply, {
      tableName: selectedTable.value,
      keyword: row.keyword,
      reply: row.reply
    }).then(result => {
      console.log('添加结果:', result);
      if (result && result.status === 'success') {
        // 添加成功，更新行状态
        row.id = result.id;
        row.isNew = false;
        row.editing = false;
        ElMessage.success('添加成功');

        // 刷新列表以获取正确的ID和顺序
        loadReplies(selectedTable.value);

        if (sharedState?.consoleRef) {
          sharedState.consoleRef.addTextReplyLog(`已添加新关键词: "${row.keyword}" -> "${row.reply}"`);
        }
      } else {
        // 添加失败，显示错误信息并从列表中移除
        ElMessage.error(result?.message || '添加失败');
        const index = keywordItems.value.indexOf(row);
        if (index !== -1) {
          keywordItems.value.splice(index, 1);
        }
      }
    }).catch(error => {
      console.error('添加失败:', error);
      // 添加失败，显示错误信息并从列表中移除
      ElMessage.error(`添加失败: ${error.message || '未知错误'}`);
      const index = keywordItems.value.indexOf(row);
      if (index !== -1) {
        keywordItems.value.splice(index, 1);
      }
    });
    return;
  }

  // 如果是现有行，调用更新API
  ipc.invoke(ipcApiRoute.scriptdb.updateReply, {
    tableName: selectedTable.value,
    id: row.id,
    keyword: row.keyword,
    reply: row.reply
  }).then(result => {
    console.log('更新结果:', result);
    if (result && result.status === 'success') {
      // 更新成功
      row.editing = false;
      ElMessage.success('保存成功');

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addTextReplyLog(`已更新关键词: "${row.keyword}" -> "${row.reply}"`);
      }
    } else {
      // 更新失败，显示错误信息
      ElMessage.error(result?.message || '保存失败');
      // 如果有原始内容，则恢复
      if (row.originalKeyword !== undefined) {
        row.keyword = row.originalKeyword;
      }
      if (row.originalReply !== undefined) {
        row.reply = row.originalReply;
      }
    }
  }).catch(error => {
    console.error('更新失败:', error);
    ElMessage.error(`保存失败: ${error.message || '未知错误'}`);
    // 如果有原始内容，则恢复
    if (row.originalKeyword !== undefined) {
      row.keyword = row.originalKeyword;
    }
    if (row.originalReply !== undefined) {
      row.reply = row.originalReply;
    }
  }).finally(() => {
    row.editing = false;
  });
};

// 删除回复
const deleteReply = (row) => {
  if (!selectedTable.value) {
    console.error('删除失败: 未选择表');
    return;
  }

  console.log('删除行数据:', row);
  console.log('行ID:', row.id);

  // 直接调用删除API
  ipc.invoke(ipcApiRoute.scriptdb.deleteReply, {
    tableName: selectedTable.value,
    id: row.id
  })
  .then(result => {
    console.log('删除API返回:', result);
    if (result.status === 'success') {
      // 刷新列表
      loadReplies(selectedTable.value);
      ElMessage.success('删除成功');
    } else {
      console.error('删除失败:', result);
      ElMessage.error('删除失败');
    }
  })
  .catch(err => {
    console.error('删除API错误:', err);
    ElMessage.error('删除失败');
  });
};

// 创建新表
const createTable = async () => {
  if (!newTableName.value) {
    ElMessage.warning('请输入关键词组名称');
    return;
  }

  try {
    console.log('创建表格:', newTableName.value);
    const result = await ipc.invoke(ipcApiRoute.scriptdb.createReplyTable, {
      displayName: newTableName.value
    });
    console.log('创建表格结果:', result);

    if (result && result.status === 'success') {
      ElMessage.success(`已创建关键词组: ${newTableName.value}`);

      // 清空输入框
      newTableName.value = '';

      // 刷新表列表
      await loadReplyTables();

      // 选择新创建的表
      if (result.tableName) {
        selectedTable.value = result.tableName;
        await loadReplies(selectedTable.value);
      }

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', `已创建新关键词组: "${newTableName.value}"`);
      }
    } else {
      ElMessage.error(result?.message || '创建关键词组失败');
    }
  } catch (error) {
    console.error('创建表格失败:', error);
    ElMessage.error(`创建失败: ${error.message || '未知错误'}`);
  }
};

// 更新表名
const updateTableName = async (table) => {
  if (!table.editingName || table.editingName.trim() === '') {
    ElMessage.warning('关键词组名称不能为空');
    return;
  }

  if (table.editingName === table.display_name) {
    // 名称没有变化，直接退出编辑状态
    table.editing = false;
    return;
  }

  try {
    const result = await ipc.invoke(ipcApiRoute.scriptdb.updateReplyTable, {
      tableName: table.table_name,
      newDisplayName: table.editingName
    });

    if (result && result.status === 'success') {
      // 刷新表列表
      await loadReplyTables();

      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', `已修改关键词组名称: "${table.display_name}" -> "${table.editingName}"`);
      }

      ElMessage.success('修改成功');
    } else {
      ElMessage.error(result?.message || '修改关键词组名称失败');
      // 恢复原始名称
      table.editingName = table.display_name;
    }
  } catch (error) {
    ElMessage.error(`修改失败: ${error.message || '未知错误'}`);
    // 恢复原始名称
    table.editingName = table.display_name;
  } finally {
    table.editing = false;
  }
};

// 开始编辑表名
const startEditTableName = (table) => {
  // 先重置其他所有表的编辑状态
  replyTables.value.forEach(t => {
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
  updateTableName(table);
};

// 取消表名编辑
const cancelTableNameEdit = (table) => {
  table.editing = false;
};

// 处理删除关键词组
const handleDeleteTable = (table) => {
  // 执行删除操作
  ipc.invoke(ipcApiRoute.scriptdb.deleteReplyTable, {
    tableName: table.table_name
  }).then(result => {
    if (result && result.status === 'success') {
      ElMessage.success(`已删除关键词组: ${table.display_name}`);

      // 移除已删除的表
      const index = replyTables.value.findIndex(t => t.table_name === table.table_name);
      if (index !== -1) {
        replyTables.value.splice(index, 1);
      }

      // 如果删除的是当前选中的表，则选择第一个表或清空选择
      if (selectedTable.value === table.table_name) {
        if (replyTables.value.length > 0) {
          selectedTable.value = replyTables.value[0].table_name;
          loadReplies(selectedTable.value);
        } else {
          selectedTable.value = '';
          keywordItems.value = [];
        }
      }

      // 添加控制台日志
      if (sharedState?.consoleRef) {
        sharedState.consoleRef.addSystemMessage('system', `已删除关键词组: "${table.display_name}"`);
      }
    } else {
      // 删除失败
      ElMessage.error(result?.message || '删除关键词组失败');
    }
  }).catch(error => {
    ElMessage.error(`删除关键词组失败: ${error.message || '未知错误'}`);
  });
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
onMounted(async () => {
  // 如果存在共享状态，将其同步到当前组件
  if (sharedState) {
    connected.value = sharedState.connected;
    roomId.value = sharedState.roomId;
  }
  
  // 同步Pinia中的直播间状态到共享状态
  if (livechatStore.roomId) {
    roomId.value = livechatStore.roomId;
    if (sharedState) sharedState.roomId = livechatStore.roomId;
  }
  
  if (livechatStore.connected) {
    connected.value = livechatStore.connected;
    if (sharedState) sharedState.connected = livechatStore.connected;
  }

  console.log('组件已挂载，开始加载数据...');

  // 初始化关键词表
  try {
    // 首先尝试检查并修复默认表
    await ipc.invoke(ipcApiRoute.scriptdb.checkAndFixDefaultReplyTable);
  } catch (error) {
    console.error('检查默认表失败:', error);
  }

  // 加载表格列表
  await loadReplyTables();

  // 如果有选中的表格，加载对应的数据
  if (selectedTable.value) {
    await loadReplies(selectedTable.value);
  }
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

// 处理回复状态变更
const handleReplyStatusChange = async (row) => {
  try {
    const result = await ipc.invoke(ipcApiRoute.scriptdb.updateReply, {
      tableName: selectedTable.value,
      id: row.id,
      keyword: row.keyword,
      reply: row.reply,
      enabled: row.enabled
    });

    if (result && result.status === 'success') {
      ElMessage.success('状态更新成功');
    } else {
      ElMessage.error(result?.message || '状态更新失败');
      // 恢复状态
      row.enabled = !row.enabled;
    }
  } catch (error) {
    ElMessage.error(`状态更新失败: ${error.message || '未知错误'}`);
    // 恢复状态
    row.enabled = !row.enabled;
  }
};

// 新增的handleDelete函数
const handleDelete = (row) => {
  console.log('删除行数据:', row);
  console.log('行ID:', row.id);

  // 调用删除API
  ipc.invoke(ipcApiRoute.scriptdb.deleteReply, {
    tableName: selectedTable.value,
    id: row.id
  })
  .then(result => {
    console.log('删除API返回:', result);
    if (result.status === 'success') {
      // 刷新列表
      loadReplies(selectedTable.value);
      ElMessage.success('删除成功');
    } else {
      console.error('删除失败:', result);
      ElMessage.error('删除失败');
    }
  })
  .catch(err => {
    console.error('删除API错误:', err);
    ElMessage.error('删除失败');
  });
};
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
