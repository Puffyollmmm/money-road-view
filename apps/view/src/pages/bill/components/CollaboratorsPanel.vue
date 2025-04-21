<script setup lang="ts">
import { showDialog, showToast } from 'vant';
import { computed, ref } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface CollaboratorItem {
  id: string;
  name: string;
  avatar?: string;
  permission: 'read' | 'write' | 'admin';
  joinedAt: string;
}

interface BookItem {
  id: string;
  name: string;
  description?: string;
  color: string[];
  icon: string;
  ownerId: string;
  collaborators: CollaboratorItem[];
  createdAt: string;
}

const props = defineProps<{
  visible: boolean;
  book: BookItem | null;
  currentUser: { id: string; name: string; avatar: string };
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'addCollaborator', collaborator: Omit<CollaboratorItem, 'joinedAt'>): void;
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

// 新协作者表单
const showAddForm = ref(false);
const newCollaboratorName = ref('');
const newCollaboratorId = ref('');
const selectedPermission = ref<'read' | 'write' | 'admin'>('read');

// 关闭面板
function closePanel() {
  emit('update:visible', false);
}

// 打开添加表单
function openAddForm() {
  showAddForm.value = true;
}

// 关闭添加表单
function closeAddForm() {
  showAddForm.value = false;
  resetForm();
}

// 重置表单
function resetForm() {
  newCollaboratorName.value = '';
  newCollaboratorId.value = '';
  selectedPermission.value = 'read';
}

// 添加协作者
function addCollaborator() {
  if (!newCollaboratorName.value.trim() || !newCollaboratorId.value.trim()) {
    showDialog({
      title: '提示',
      message: '请输入完整的协作者信息',
    });
    return;
  }

  // 检查ID是否已存在
  if (props.book?.collaborators.some(c => c.id === newCollaboratorId.value)) {
    showToast('该用户已是协作者');
    return;
  }

  // 检查是否是自己
  if (newCollaboratorId.value === props.currentUser.id) {
    showToast('不能添加自己为协作者');
    return;
  }

  const collaborator = {
    id: newCollaboratorId.value.trim(),
    name: newCollaboratorName.value.trim(),
    permission: selectedPermission.value,
  };

  emit('addCollaborator', collaborator);
  closeAddForm();
}

// 权限显示文本
const permissionText = {
  read: '只读权限',
  write: '编辑权限',
  admin: '管理权限',
};

// 权限描述
const permissionDesc = {
  read: '仅可查看账本内容，不可修改',
  write: '可添加和编辑账单，但不能管理协作者',
  admin: '完全控制权限，可管理账本和协作者',
};

// 可选的权限类型
const permissionOptions = ['read', 'write', 'admin'] as const;
type PermissionType = typeof permissionOptions[number];

// 是否是账本所有者
const isOwner = computed(() => {
  return props.book?.ownerId === props.currentUser.id;
});

// 设置权限
function setPermission(perm: PermissionType) {
  selectedPermission.value = perm;
}
</script>

<template>
  <TouchDialog
    :modelValue="dialogVisible"
    @update:modelValue="dialogVisible = $event"
    position="bottom"
    :closeOnClickOverlay="true"
    @close="closePanel"
  >
    <div class="collaborators-panel">
      <div class="panel-header">
        <div class="header-title">协作者管理</div>
        <div v-if="isOwner" class="header-action" @click="openAddForm">
          <div i-carbon-user-follow></div>
          <span>添加</span>
        </div>
      </div>

      <div v-if="book" class="book-info">
        <div class="book-icon" :class="book.icon" :style="{
          backgroundImage: `linear-gradient(135deg, ${book.color[0]}, ${book.color[1]})`,
        }"></div>
        <div class="book-name">{{ book.name }}</div>
      </div>

      <div class="collaborators-list">
        <!-- 所有者 -->
        <div class="collaborator-item owner">
          <div class="collaborator-avatar">
            {{ book?.ownerId === currentUser.id ? currentUser.name.substr(0, 1) : '主' }}
          </div>
          <div class="collaborator-info">
            <div class="collaborator-name">
              {{ book?.ownerId === currentUser.id ? `${currentUser.name} (我)` : '账本所有者' }}
            </div>
            <div class="collaborator-permission">所有者</div>
          </div>
          <div class="collaborator-status">
            <div i-carbon-user-admin></div>
          </div>
        </div>

        <!-- 协作者列表 -->
        <div v-for="collaborator in book?.collaborators" :key="collaborator.id" class="collaborator-item">
          <div class="collaborator-avatar">
            {{ collaborator.name.substr(0, 1) }}
          </div>
          <div class="collaborator-info">
            <div class="collaborator-name">
              {{ collaborator.name }}
              <span v-if="collaborator.id === currentUser.id" class="is-me">(我)</span>
            </div>
            <div class="collaborator-permission">{{ permissionText[collaborator.permission] }}</div>
          </div>
          <div class="collaborator-status">
            <div i-carbon-time v-if="new Date(collaborator.joinedAt).toLocaleDateString() === new Date().toLocaleDateString()" class="new-tag">新</div>
          </div>
        </div>

        <!-- 没有协作者时显示 -->
        <div v-if="!book?.collaborators?.length" class="no-collaborators">
          <div i-carbon-user-multiple class="empty-icon"></div>
          <div class="empty-text">暂无协作者</div>
          <div v-if="isOwner" class="empty-action" @click="openAddForm">添加协作者</div>
        </div>
      </div>

      <div v-if="isOwner" class="collaborator-tips">
        <div class="tip-title">
          <div i-carbon-information></div>
          协作者权限说明
        </div>
        <div class="tip-content">
          <div v-for="perm in permissionOptions" :key="perm" class="tip-item">
            <span class="perm-name">{{ permissionText[perm] }}：</span>{{ permissionDesc[perm] }}
          </div>
        </div>
      </div>
    </div>

    <!-- 添加协作者表单 -->
    <TouchDialog
      :modelValue="showAddForm"
      @update:modelValue="showAddForm = $event"
      position="bottom"
      :closeOnClickOverlay="true"
      @close="closeAddForm"
    >
      <div class="add-collaborator-form">
        <div class="form-header">
          <div class="form-title">添加协作者</div>
          <div class="form-close" @click="closeAddForm">
            <div i-carbon-close></div>
          </div>
        </div>

        <div class="form-content">
          <div class="form-item">
            <div class="item-label">用户昵称</div>
            <input
              type="text"
              v-model="newCollaboratorName"
              placeholder="请输入协作者昵称"
              class="form-input"
              maxlength="20"
            />
          </div>

          <div class="form-item">
            <div class="item-label">用户ID</div>
            <input
              type="text"
              v-model="newCollaboratorId"
              placeholder="请输入协作者ID"
              class="form-input"
              maxlength="20"
            />
          </div>

          <div class="form-item">
            <div class="item-label">权限设置</div>
            <div class="permission-selector">
              <div
                v-for="perm in permissionOptions"
                :key="perm"
                class="permission-item"
                :class="{ selected: selectedPermission === perm }"
                @click="setPermission(perm)"
              >
                <div class="perm-name">{{ permissionText[perm] }}</div>
                <div class="perm-desc">{{ permissionDesc[perm] }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" @click="closeAddForm">取消</button>
          <button class="submit-btn" @click="addCollaborator">添加</button>
        </div>
      </div>
    </TouchDialog>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.collaborators-panel {
  padding: 20px;

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
      display: flex;
      align-items: center;
      color: var(--el-color-primary);
      font-size: 14px;

      div {
        margin-right: 4px;
      }
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

  .collaborators-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;

    .collaborator-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background-color: var(--el-bg-color-page);
      border-radius: 12px;

      &.owner {
        background-color: rgba(var(--el-color-primary-rgb), 0.1);

        .collaborator-avatar {
          background-color: var(--el-color-primary);
        }
      }

      .collaborator-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--el-color-info);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .collaborator-info {
        flex: 1;
        margin-left: 12px;

        .collaborator-name {
          font-weight: 500;
          font-size: 15px;

          .is-me {
            font-size: 12px;
            color: var(--el-color-primary);
            margin-left: 4px;
          }
        }

        .collaborator-permission {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }

      .collaborator-status {
        color: var(--el-color-primary);

        .new-tag {
          color: var(--el-color-danger);
        }
      }
    }

    .no-collaborators {
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
        margin-bottom: 16px;
      }

      .empty-action {
        color: var(--el-color-primary);
        padding: 6px 16px;
        border: 1px solid var(--el-color-primary);
        border-radius: 16px;
        font-size: 14px;
      }
    }
  }

  .collaborator-tips {
    background-color: rgba(var(--el-color-info-rgb), 0.1);
    border-radius: 10px;
    padding: 12px;

    .tip-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;

      div {
        margin-right: 4px;
        color: var(--el-color-info);
      }
    }

    .tip-content {
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .tip-item {
        margin-bottom: 4px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }

        .perm-name {
          color: var(--el-text-color-primary);
          font-weight: 500;
        }
      }
    }
  }
}

.add-collaborator-form {
  padding: 20px;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .form-title {
      font-size: 18px;
      font-weight: 500;
    }

    .form-close {
      font-size: 18px;
      color: var(--el-text-color-secondary);
    }
  }

  .form-content {
    .form-item {
      margin-bottom: 16px;

      .item-label {
        font-size: 14px;
        margin-bottom: 8px;
        color: var(--el-text-color-secondary);
      }

      .form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.3s;

        &:focus {
          border-color: var(--el-color-primary);
        }
      }

      .permission-selector {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .permission-item {
          padding: 12px;
          border: 1px solid var(--el-border-color);
          border-radius: 8px;
          transition: all 0.3s;
          cursor: pointer;

          &.selected {
            border-color: var(--el-color-primary);
            background-color: rgba(var(--el-color-primary-rgb), 0.05);
          }

          .perm-name {
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 4px;
          }

          .perm-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;

    button {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      border: none;
      font-size: 15px;
      font-weight: 500;
    }

    .cancel-btn {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }

    .submit-btn {
      background-color: var(--el-color-primary);
      color: white;
    }
  }
}
</style>
