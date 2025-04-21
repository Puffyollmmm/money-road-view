<script setup lang="ts">
import { showDialog } from 'vant';
import { computed, ref, watch } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface BookItem {
  id: string;
  name: string;
  description?: string;
  color: string[];
  icon: string;
  ownerId: string;
  collaborators: any[];
  createdAt: string;
  tags?: string[];
  tagColors?: string[][];
  budget?: number;
  period?: 'month' | 'week' | 'year';
  note?: string;
}

const props = defineProps<{
  visible: boolean;
  books: BookItem[];
  currentBookId: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'switchBook', bookId: string): void;
  (e: 'createBook', bookData: {
    name: string;
    description?: string;
    color: string[];
    icon: string;
    tags?: string[];
    tagColors?: string[][];
    budget?: number;
    period?: 'month' | 'week' | 'year';
    note?: string;
  }): void;
  (e: 'updateBook', bookData: {
    id: string;
    note?: string;
  }): void;
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

// 新账本表单
const showCreateForm = ref(false);
const newBookName = ref('');
const newBookDescription = ref('');
const selectedColor = ref(['#02D9B2', '#01BDB4']);
const selectedIcon = ref('i-carbon:notebook');
const newBookTags = ref<string[]>([]);
const newTagInput = ref('');
const newBookBudget = ref<number | null>(null);
const selectedPeriod = ref<'month' | 'week' | 'year'>('month');
const newBookNote = ref('');

// 预设颜色
const presetColors = [
  ['#02D9B2', '#01BDB4'],
  ['#B392F2', '#8A69F6'],
  ['#20DF9F', '#13D77F'],
  ['#FFA9E8', '#FD82D0'],
  ['#FEAA06', '#FF7C01'],
  ['#FE4794', '#FF4B50'],
  ['#0DB2B3', '#0B7B8A'],
  ['#FE0000', '#F30102'],
  ['#0FDEFE', '#00B4FE'],
  ['#FBDC03', '#FEB601'],
];

// 预设图标
const presetIcons = [
  'i-carbon:notebook',
  'i-carbon:book',
  'i-carbon:home',
  'i-carbon:wallet',
  'i-carbon:shopping-cart',
  'i-carbon:restaurant',
  'i-carbon:car',
  'i-carbon:airplane',
  'i-carbon:task',
  'i-carbon:currency',
];

// 标签色彩
const tagColors = [
  ['#8A69F6', '#B392F2'],
  ['#13D77F', '#20DF9F'],
  ['#FF7C01', '#FEAA06'],
  ['#FD82D0', '#FFA9E8'],
  ['#01BDB4', '#02D9B2'],
];

// 当前显示的账本备注编辑状态
const editingBookNote = ref<string | null>(null);
const editingNoteContent = ref('');

// 计算当前账本
const _currentBook = computed(() => {
  return props.books.find(book => book.id === props.currentBookId);
});

// 关闭面板
function closePanel() {
  emit('update:visible', false);
}

// 切换账本
function handleSwitchBook(bookId: string) {
  emit('switchBook', bookId);
}

// 打开创建表单
function openCreateForm() {
  showCreateForm.value = true;
}

// 关闭创建表单
function closeCreateForm() {
  showCreateForm.value = false;
  resetForm();
}

// 重置表单
function resetForm() {
  newBookName.value = '';
  newBookDescription.value = '';
  selectedColor.value = ['#02D9B2', '#01BDB4'];
  selectedIcon.value = 'i-carbon:notebook';
  newBookTags.value = [];
  newTagInput.value = '';
  newBookBudget.value = null;
  selectedPeriod.value = 'month';
  newBookNote.value = '';
}

// 添加标签
function addTag() {
  const tag = newTagInput.value.trim();
  if (tag && !newBookTags.value.includes(tag)) {
    newBookTags.value.push(tag);
    newTagInput.value = '';
  }
}

// 删除标签
function removeTag(index: number) {
  newBookTags.value.splice(index, 1);
}

// 创建新账本
function createBook() {
  if (!newBookName.value.trim()) {
    showDialog({
      title: '提示',
      message: '请输入账本名称',
    });
    return;
  }

  // 生成标签颜色
  const tagColorArray = newBookTags.value.map((_, index) =>
    tagColors[index % tagColors.length],
  );

  const bookData = {
    name: newBookName.value.trim(),
    description: newBookDescription.value.trim() || undefined,
    color: selectedColor.value,
    icon: selectedIcon.value,
    tags: newBookTags.value.length > 0 ? newBookTags.value : undefined,
    tagColors: tagColorArray.length > 0 ? tagColorArray : undefined,
    budget: newBookBudget.value || undefined,
    period: selectedPeriod.value,
    note: newBookNote.value,
  };

  emit('createBook', bookData);
  closeCreateForm();
}

// 开始编辑账本备注
function startEditNote(bookId: string, note?: string) {
  editingBookNote.value = bookId;
  editingNoteContent.value = note || '';
}

// 保存账本备注
function saveBookNote(bookId: string) {
  const bookIndex = props.books.findIndex(book => book.id === bookId);
  if (bookIndex >= 0) {
    // 这里通过事件通知父组件更新备注
    // 实际应用中需要实现一个updateBook事件
    // 此处仅演示，真实场景中应该由父组件处理
    emit('updateBook', {
      id: bookId,
      note: editingNoteContent.value,
    });
    editingBookNote.value = null;
  }
}

// 取消编辑备注
function cancelEditNote() {
  editingBookNote.value = null;
}

// 监听可见性变化
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    // 关闭创建表单
    showCreateForm.value = false;
  }
});

// 计算排序后的账本列表
const sortedBooks = computed(() => {
  return [...props.books].sort((a, b) => {
    // 当前账本置顶
    if (a.id === props.currentBookId) {
      return -1;
    }
    if (b.id === props.currentBookId) {
      return 1;
    }
    // 按创建时间降序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

// 预算周期文本
const periodText = {
  month: '每月',
  week: '每周',
  year: '每年',
};
</script>

<template>
  <TouchDialog
    :modelValue="dialogVisible"
    @update:modelValue="dialogVisible = $event"
    position="bottom"
    :closeOnClickOverlay="true"
    @close="closePanel"
  >
    <div class="book-switch-panel">
      <div class="panel-header">
        <div class="header-title">我的账本</div>
        <div class="header-action" @click="openCreateForm">
          <div i-carbon-add></div>
          <span>新建</span>
        </div>
      </div>

      <div class="book-list">
        <div
          v-for="book in sortedBooks"
          :key="book.id"
          class="book-item"
          :class="{ active: book.id === currentBookId }"
          @click="handleSwitchBook(book.id)"
        >
          <div class="book-icon" :class="book.icon" :style="{
            backgroundImage: `linear-gradient(135deg, ${book.color[0]}, ${book.color[1]})`,
          }"></div>
          <div class="book-info">
            <div class="book-name">{{ book.name }}</div>

            <div class="book-meta">
              <div class="book-desc" v-if="book.description">{{ book.description }}</div>

              <div class="book-budget" v-if="book.budget">
                <div i-carbon-money></div>
                <span>{{ periodText[book.period || 'month'] }}预算: ¥{{ book.budget }}</span>
              </div>
            </div>

            <div class="book-tags" v-if="book.tags && book.tags.length > 0">
              <span
                v-for="(tag, idx) in book.tags"
                :key="idx"
                class="book-tag"
                :style="{
                  backgroundColor: book.tagColors?.[idx]?.[0] || '#eaeaea',
                  color: '#fff',
                }"
              >
                {{ tag }}
              </span>
            </div>

            <div class="book-note" v-if="book.note && editingBookNote !== book.id">
              <span class="note-content">{{ book.note }}</span>
              <button class="edit-note-btn" @click.stop="startEditNote(book.id, book.note)">
                <div i-carbon:edit></div>
              </button>
            </div>

            <div class="edit-note-form" v-if="editingBookNote === book.id" @click.stop>
              <input
                type="text"
                v-model="editingNoteContent"
                placeholder="输入账本备注..."
                @keyup.enter="saveBookNote(book.id)"
              />
              <div class="note-actions">
                <button class="save-note-btn" @click="saveBookNote(book.id)">
                  <div i-carbon:checkmark></div>
                </button>
                <button class="cancel-note-btn" @click="cancelEditNote">
                  <div i-carbon:close></div>
                </button>
              </div>
            </div>

            <div class="add-note" v-if="!book.note && editingBookNote !== book.id">
              <button class="add-note-btn" @click.stop="startEditNote(book.id)">
                <div i-carbon:add></div>
                <span>添加备注</span>
              </button>
            </div>
          </div>

          <div class="book-collaborators" v-if="book.collaborators && book.collaborators.length > 0">
            <div class="collaborator-count">
              <div i-carbon-group></div>
              <span>{{ book.collaborators.length }}</span>
            </div>
          </div>

          <div class="book-indicator" v-if="book.id === currentBookId">
            <div i-carbon-checkmark></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新账本表单 -->
    <TouchDialog
      :modelValue="showCreateForm"
      @update:modelValue="showCreateForm = $event"
      position="bottom"
      :closeOnClickOverlay="true"
      @close="closeCreateForm"
    >
      <div class="create-book-form">
        <div class="form-header">
          <div class="form-title">创建新账本</div>
          <div class="form-close" @click="closeCreateForm">
            <div i-carbon-close></div>
          </div>
        </div>

        <div class="form-preview">
          <div class="preview-icon" :class="selectedIcon" :style="{
            backgroundImage: `linear-gradient(135deg, ${selectedColor[0]}, ${selectedColor[1]})`,
          }"></div>
          <div class="preview-name">{{ newBookName || '新账本' }}</div>

          <div class="preview-tags" v-if="newBookTags.length > 0">
            <span
              v-for="(tag, idx) in newBookTags.slice(0, 3)"
              :key="idx"
              class="preview-tag"
              :style="{
                backgroundColor: tagColors[idx % tagColors.length][0],
              }"
            >
              {{ tag }}
            </span>
            <span
              v-if="newBookTags.length > 3"
              class="preview-tag more"
            >
              +{{ newBookTags.length - 3 }}
            </span>
          </div>
        </div>

        <div class="form-content">
          <div class="form-group">
            <label class="form-label">账本名称</label>
            <input type="text" v-model="newBookName" placeholder="请输入账本名称" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">账本描述</label>
            <input type="text" v-model="newBookDescription" placeholder="可选，添加账本描述" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">备注</label>
            <input type="text" v-model="newBookNote" placeholder="账本备注（可选）" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">预算设置</label>
            <div class="budget-setting">
              <input
                type="number"
                v-model="newBookBudget"
                placeholder="设置预算金额"
                class="form-input budget-input"
              />
              <select v-model="selectedPeriod" class="period-select">
                <option value="month">每月</option>
                <option value="week">每周</option>
                <option value="year">每年</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tag-input-container">
              <input
                type="text"
                v-model="newTagInput"
                placeholder="添加标签（最多5个）"
                class="form-input tag-input"
                @keyup.enter="addTag"
                :disabled="newBookTags.length >= 5"
              />
              <button
                class="tag-add-btn"
                @click="addTag"
                :disabled="newBookTags.length >= 5 || !newTagInput.trim()"
              >
                <div i-carbon-add></div>
              </button>
            </div>

            <div class="tag-list" v-if="newBookTags.length > 0">
              <div
                v-for="(tag, idx) in newBookTags"
                :key="idx"
                class="tag-item"
                :style="{
                  backgroundColor: tagColors[idx % tagColors.length][0],
                }"
              >
                <span>{{ tag }}</span>
                <button @click="removeTag(idx)" class="tag-remove-btn">
                  <div i-carbon-close></div>
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">账本颜色</label>
            <div class="color-options">
              <div
                v-for="(color, index) in presetColors"
                :key="index"
                class="color-option"
                :class="{ active: color[0] === selectedColor[0] && color[1] === selectedColor[1] }"
                :style="{ backgroundImage: `linear-gradient(135deg, ${color[0]}, ${color[1]})` }"
                @click="selectedColor = color"
              ></div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">账本图标</label>
            <div class="icon-options">
              <div
                v-for="(icon, index) in presetIcons"
                :key="index"
                class="icon-option"
                :class="{ active: icon === selectedIcon }"
                @click="selectedIcon = icon"
              >
                <div :class="icon" class="icon" :style="{
                  backgroundImage: `linear-gradient(135deg, ${selectedColor[0]}, ${selectedColor[1]})`,
                }"></div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="closeCreateForm">取消</button>
            <button class="create-btn" @click="createBook">创建</button>
          </div>
        </div>
      </div>
    </TouchDialog>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.book-switch-panel {
  padding: 16px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-title {
      font-size: 18px;
      font-weight: 600;
    }

    .header-action {
      display: flex;
      align-items: center;
      color: var(--el-color-primary);
      font-size: 14px;

      div {
        margin-right: 4px;
      }
    }
  }

  .book-list {
    margin-bottom: 20px;

    .book-item {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 12px;
      background-color: var(--el-bg-color);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      position: relative;

      &.active {
        background-color: var(--el-color-primary-light-9);
        border-left: 3px solid var(--el-color-primary);
      }

      .book-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .book-info {
        flex: 1;
        min-width: 0;

        .book-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--el-text-color-primary);
        }

        .book-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 6px;

          .book-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-right: 10px;
            flex-shrink: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
          }

          .book-budget {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: var(--el-text-color-secondary);
            background-color: var(--el-fill-color-light);
            padding: 2px 6px;
            border-radius: 10px;

            div {
              margin-right: 4px;
              font-size: 12px;
            }
          }
        }

        .book-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          .book-tag {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            white-space: nowrap;
          }
        }

        .book-note {
          display: flex;
          align-items: center;
          margin-top: 4px;
          padding: 4px 8px;
          background-color: var(--el-fill-color-light);
          border-radius: 6px;

          .note-content {
            flex: 1;
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }

          .edit-note-btn {
            background: none;
            border: none;
            padding: 2px;
            color: var(--el-text-color-secondary);
            cursor: pointer;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }

        .edit-note-form {
          display: flex;
          margin-top: 4px;

          input {
            flex: 1;
            padding: 6px 8px;
            border: 1px solid var(--el-border-color);
            border-radius: 6px;
            font-size: 12px;
            outline: none;

            &:focus {
              border-color: var(--el-color-primary);
            }
          }

          .note-actions {
            display: flex;
            gap: 4px;
            margin-left: 4px;

            button {
              background: none;
              border: none;
              padding: 4px;
              cursor: pointer;

              &.save-note-btn {
                color: var(--el-color-success);
              }

              &.cancel-note-btn {
                color: var(--el-color-danger);
              }
            }
          }
        }

        .add-note {
          margin-top: 4px;

          .add-note-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 6px;
            border: none;
            background: none;
            color: var(--el-text-color-secondary);
            font-size: 12px;
            cursor: pointer;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
      }

      .book-collaborators {
        margin-right: 10px;

        .collaborator-count {
          display: flex;
          align-items: center;
          background-color: var(--el-fill-color-light);
          padding: 4px 6px;
          border-radius: 10px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          div {
            margin-right: 4px;
          }
        }
      }

      .book-indicator {
        color: var(--el-color-primary);
        margin-left: 10px;
      }
    }
  }
}

.create-book-form {
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .form-title {
      font-size: 18px;
      font-weight: 600;
    }

    .form-close {
      padding: 4px;
    }
  }

  .form-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    margin-bottom: 16px;
    background-color: var(--el-fill-color-light);

    .preview-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-bottom: 10px;
      font-size: 24px;
    }

    .preview-name {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .preview-tags {
      display: flex;
      gap: 6px;

      .preview-tag {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        color: white;

        &.more {
          background-color: var(--el-fill-color);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .form-content {
    padding: 0 16px 16px;

    .form-group {
      margin-bottom: 16px;

      .form-label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--el-text-color-primary);
      }

      .form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        background-color: var(--el-bg-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: var(--el-color-primary);
        }
      }

      .budget-setting {
        display: flex;
        gap: 10px;

        .budget-input {
          flex: 1;
        }

        .period-select {
          width: 100px;
          padding: 10px 12px;
          border: 1px solid var(--el-border-color);
          border-radius: 8px;
          background-color: var(--el-bg-color);
          font-size: 14px;
          outline: none;
        }
      }

      .tag-input-container {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;

        .tag-input {
          flex: 1;
        }

        .tag-add-btn {
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--el-color-primary);
          color: white;
          border: none;
          border-radius: 8px;

          &:disabled {
            background-color: var(--el-fill-color);
            color: var(--el-text-color-placeholder);
          }
        }
      }

      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          color: white;
          font-size: 12px;

          .tag-remove-btn {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.3);
            border: none;
            border-radius: 50%;
            padding: 0;
            color: white;
            font-size: 10px;
          }
        }
      }

      .color-options {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .color-option {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease;
          position: relative;

          &.active::after {
            content: '';
            position: absolute;
            top: -3px;
            right: -3px;
            bottom: -3px;
            left: -3px;
            border: 2px solid var(--el-color-primary);
            border-radius: 50%;
          }

          &:hover {
            transform: scale(1.1);
          }
        }
      }

      .icon-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .icon-option {
          position: relative;
          cursor: pointer;

          &.active::after {
            content: '';
            position: absolute;
            top: -3px;
            right: -3px;
            bottom: -3px;
            left: -3px;
            border: 2px solid var(--el-color-primary);
            border-radius: 8px;
          }

          .icon {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            transition: transform 0.2s ease;
          }

          &:hover .icon {
            transform: scale(1.1);
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      gap: 12px;

      button {
        padding: 8px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        border: none;
        cursor: pointer;
      }

      .cancel-btn {
        background-color: var(--el-fill-color);
        color: var(--el-text-color-secondary);
      }

      .create-btn {
        background-color: var(--el-color-primary);
        color: #fff;
      }
    }
  }
}
</style>
