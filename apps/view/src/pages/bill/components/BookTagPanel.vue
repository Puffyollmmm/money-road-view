<script setup lang="ts">
import { showDialog, showToast } from 'vant';
import { computed, ref, watch } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface BookItem {
  id: string;
  name: string;
  description?: string;
  color: string[];
  icon: string;
  ownerId: string;
  tags?: string[];
  tagColors?: string[][];
}

const props = defineProps<{
  visible: boolean;
  book: BookItem | null;
  currentUser: { id: string; name: string; avatar: string };
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'updateTags', bookId: string, tags: string[], tagColors: string[][]): void;
}>();

// 计算属性处理v-model
const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  },
});

// 标签管理
const bookTags = ref<string[]>([]);
const bookTagColors = ref<string[][]>([]);
const newTagInput = ref('');

// 默认标签颜色集
const tagColorSets = [
  ['#8A69F6', '#B392F2'], // 紫色
  ['#13D77F', '#20DF9F'], // 绿色
  ['#FF7C01', '#FEAA06'], // 橙色
  ['#FD82D0', '#FFA9E8'], // 粉色
  ['#01BDB4', '#02D9B2'], // 青色
  ['#FF4B50', '#FE4794'], // 红色
  ['#0B7B8A', '#0DB2B3'], // 深青色
  ['#F30102', '#FE0000'], // 深红色
  ['#00B4FE', '#0FDEFE'], // 蓝色
  ['#FEB601', '#FBDC03'], // 黄色
];

// 在组件加载时初始化标签数据
function initTagData() {
  if (props.book) {
    bookTags.value = [...(props.book.tags || [])];
    bookTagColors.value = [...(props.book.tagColors || [])];
  } else {
    bookTags.value = [];
    bookTagColors.value = [];
  }
}

// 添加新标签
function addTag() {
  if (!newTagInput.value.trim()) {
    return;
  }

  if (bookTags.value.includes(newTagInput.value.trim())) {
    showToast('该标签已存在');
    return;
  }

  bookTags.value.push(newTagInput.value.trim());

  // 为新标签分配颜色
  const colorIndex = bookTags.value.length - 1;
  bookTagColors.value.push(tagColorSets[colorIndex % tagColorSets.length]);

  newTagInput.value = '';
}

// 删除标签
function removeTag(index: number) {
  bookTags.value.splice(index, 1);
  bookTagColors.value.splice(index, 1);
}

// 保存标签
function saveTags() {
  if (!props.book) {
    return;
  }

  emit('updateTags', props.book.id, bookTags.value, bookTagColors.value);
  showToast('标签更新成功');
  dialogVisible.value = false;
}

// 关闭面板
function closePanel() {
  dialogVisible.value = false;
}

// 监听visible变化，初始化数据
watch(() => props.visible, (newValue) => {
  if (newValue) {
    initTagData();
  }
});

// 监听book变化，重新初始化数据
watch(() => props.book, () => {
  initTagData();
});
</script>

<template>
  <TouchDialog
    :modelValue="dialogVisible"
    @update:modelValue="dialogVisible = $event"
    position="bottom"
    :closeOnClickOverlay="true"
    @close="closePanel"
  >
    <div class="book-tag-panel">
      <div class="panel-header">
        <div class="header-title">账本标签</div>
        <div class="header-action" @click="closePanel">
          <div i-carbon-close></div>
        </div>
      </div>

      <div v-if="book" class="book-info">
        <div class="book-icon" :class="book.icon" :style="{
          backgroundImage: `linear-gradient(135deg, ${book.color[0]}, ${book.color[1]})`,
        }"></div>
        <div class="book-name">{{ book.name }}</div>
      </div>

      <div class="tag-content">
        <div class="tag-input-area">
          <input
            type="text"
            v-model="newTagInput"
            placeholder="添加新标签"
            class="tag-input"
            @keyup.enter="addTag"
            maxlength="10"
          />
          <button class="add-tag-btn" @click="addTag">添加</button>
        </div>

        <div class="tag-list">
          <div v-if="bookTags.length === 0" class="no-tags">
            <div i-carbon-tag class="empty-icon"></div>
            <div class="empty-text">暂无标签，添加一个吧</div>
          </div>

          <div v-for="(tag, index) in bookTags" :key="index" class="tag-item">
            <div class="tag-label" :style="{
              backgroundColor: bookTagColors[index] ? bookTagColors[index][0] : '#ddd',
            }">
              {{ tag }}
            </div>
            <div class="tag-action" @click="removeTag(index)">
              <div i-carbon-close></div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="cancel-btn" @click="closePanel">取消</button>
        <button class="save-btn" @click="saveTags">保存</button>
      </div>
    </div>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.book-tag-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-title {
      font-size: 18px;
      font-weight: 500;
    }

    .header-action {
      color: var(--el-text-color-secondary);
      font-size: 20px;
    }
  }

  .book-info {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: var(--el-bg-color-page);
    border-radius: 12px;
    margin-bottom: 16px;

    .book-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }

    .book-name {
      margin-left: 12px;
      font-weight: 500;
      font-size: 15px;
    }
  }

  .tag-content {
    flex: 1;
    overflow-y: auto;

    .tag-input-area {
      display: flex;
      margin-bottom: 16px;

      .tag-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px 0 0 8px;
        outline: none;
        font-size: 14px;
      }

      .add-tag-btn {
        background-color: var(--el-color-primary);
        color: white;
        border: none;
        padding: 0 16px;
        border-radius: 0 8px 8px 0;
        font-size: 14px;
      }
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .no-tags {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px 0;
        color: var(--el-text-color-secondary);

        .empty-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .empty-text {
          font-size: 14px;
        }
      }

      .tag-item {
        display: flex;
        align-items: center;

        .tag-label {
          padding: 6px 12px;
          border-radius: 16px 0 0 16px;
          color: white;
          font-size: 13px;
          display: flex;
          align-items: center;
        }

        .tag-action {
          background-color: rgba(0, 0, 0, 0.1);
          width: 24px;
          height: 24px;
          border-radius: 0 12px 12px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
      }
    }
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);

    .cancel-btn, .save-btn {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      font-size: 15px;
      border: none;
    }

    .cancel-btn {
      background-color: var(--el-fill-color-lighter);
      color: var(--el-text-color-regular);
      margin-right: 10px;
    }

    .save-btn {
      background-color: var(--el-color-primary);
      color: white;
    }
  }
}
</style>
