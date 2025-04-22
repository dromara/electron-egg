<template>
  <div>
    <!-- 表情编辑按钮 -->
    <el-button
      type="primary"
      size="small"
      circle
      class="emoji-edit-button"
      @click="showEmojiDialog"
      :disabled="disabled"
    >
      <el-icon><Edit /></el-icon>
    </el-button>

    <!-- 表情管理对话框 -->
    <el-dialog
      v-model="emojiDialogVisible"
      title="表情管理"
      width="500px"
      destroy-on-close
    >
      <div class="emoji-dialog-content">
        <div class="emoji-tags">
          <el-tag
            v-for="(emoji, index) in emojis"
            :key="index"
            closable
            class="emoji-tag"
            @close="removeEmojiAndSave(index)"
          >
            {{ formatEmojiDisplay(emoji) }}
          </el-tag>

          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="newEmoji"
            class="emoji-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-emoji" size="small" @click="showInput">
            + 新表情
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ElMessage } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

// 表情相关
const emojiDialogVisible = ref(false);
const emojis = ref([]);
const newEmoji = ref('');
const inputVisible = ref(false);
const InputRef = ref(null);

// 显示表情编辑对话框
const showEmojiDialog = async () => {
  try {
    // 从后端获取表情列表
    const result = await ipc.invoke(ipcApiRoute.livechatAutoControl.getEmojis);
    if (result && result.status === 'success') {
      emojis.value = result.data || [];
    }
    emojiDialogVisible.value = true;
  } catch (error) {
    console.error('获取表情列表失败:', error);
    showMessage(`获取表情列表失败: ${error.message || '未知错误'}`, 'error');
    emojis.value = [];
    emojiDialogVisible.value = true;
  }
};

// 格式化表情显示 - 移除方括号
const formatEmojiDisplay = (emoji) => {
  return emoji.replace(/^\[|\]$/g, '');
};

// 显示输入框
const showInput = () => {
  inputVisible.value = true;
  // 使用nextTick确保输入框渲染后再聚焦
  nextTick(() => {
    InputRef.value.input.focus();
  });
};

// 处理输入确认
const handleInputConfirm = async () => {
  if (newEmoji.value.trim()) {
    // 添加方括号（如果没有）
    let formattedEmoji = newEmoji.value.trim();
    if (!formattedEmoji.startsWith('[')) {
      formattedEmoji = '[' + formattedEmoji;
    }
    if (!formattedEmoji.endsWith(']')) {
      formattedEmoji = formattedEmoji + ']';
    }

    // 添加到列表
    emojis.value.push(formattedEmoji);

    // 自动保存到数据库
    await saveEmojisToDatabase();
  }

  // 重置输入状态
  inputVisible.value = false;
  newEmoji.value = '';
};

// 移除表情并保存
const removeEmojiAndSave = async (index) => {
  emojis.value.splice(index, 1);
  // 自动保存到数据库
  await saveEmojisToDatabase();
};

// 保存表情列表到数据库
const saveEmojisToDatabase = async () => {
  try {
    // 将响应式数组转换为普通数组，避免序列化问题
    const emojisArray = Array.from(emojis.value);
    const result = await ipc.invoke(ipcApiRoute.livechatAutoControl.saveEmojis, { emojis: emojisArray });
    if (result && result.status === 'success') {
      showMessage('表情已保存', 'success');
    } else {
      showMessage(result?.message || '保存表情列表失败', 'error');
    }
  } catch (error) {
    console.error('保存表情列表失败:', error);
    showMessage(`保存失败: ${error.message || '未知错误'}`, 'error');
  }
};

// 统一消息提示
const showMessage = (message, type = 'info') => {
  ElMessage({
    message,
    type,
    duration: 2000
  });
};
</script>

<style lang="less" scoped>
.emoji-edit-button {
  margin-left: 5px;
  font-size: 12px;
  width: 24px;
  height: 24px;
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
