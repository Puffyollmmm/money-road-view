<script setup lang="ts">
import { showDialog, showToast } from 'vant';
import { computed, ref } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface UserItem {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  role: 'admin' | 'user';
}

// 属性定义
const props = defineProps<{
  visible: boolean;
  currentUser: { id: string; name: string; avatar: string };
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'inviteUser', email: string): void;
  (e: 'updateUserStatus', userId: string, status: 'active' | 'inactive'): void;
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

// 模拟用户数据
const users = ref<UserItem[]>([
  {
    id: 'user1',
    name: '当前用户',
    avatar: '',
    email: 'user1@example.com',
    phone: '13800138000',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    role: 'admin',
  },
  {
    id: 'collaborator1',
    name: '张三',
    avatar: '',
    email: 'zhang@example.com',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'user',
  },
  {
    id: 'collaborator2',
    name: '李四',
    avatar: '',
    email: 'li@example.com',
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'user',
  },
  {
    id: 'collaborator3',
    name: '王五',
    avatar: '',
    email: 'wang@example.com',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'user',
  },
  {
    id: 'pending1',
    name: '待接受用户',
    avatar: '',
    email: 'pending@example.com',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'user',
  },
]);

// 邀请表单
const showInviteForm = ref(false);
const inviteEmail = ref('');
const inviteMessage = ref('');

// 用户详情
const showUserDetail = ref(false);
const selectedUser = ref<UserItem | null>(null);

// 活跃标签页
const activeTab = ref<'all' | 'pending'>('all');

// 关闭面板
function closePanel() {
  dialogVisible.value = false;
}

// 打开邀请表单
function openInviteForm() {
  showInviteForm.value = true;
  inviteEmail.value = '';
  inviteMessage.value = '您好，我想邀请您加入我的记账应用。';
}

// 关闭邀请表单
function closeInviteForm() {
  showInviteForm.value = false;
}

// 发送邀请
function sendInvite() {
  if (!inviteEmail.value.trim() || !inviteEmail.value.includes('@')) {
    showToast('请输入有效的邮箱地址');
    return;
  }

  // 检查是否已邀请过
  const existingUser = users.value.find(u => u.email === inviteEmail.value.trim());
  if (existingUser) {
    showToast('该邮箱已被邀请或注册');
    return;
  }

  // 模拟发送邀请
  emit('inviteUser', inviteEmail.value.trim());

  // 添加到待接受列表
  users.value.push({
    id: `pending_${Date.now()}`,
    name: '待接受用户',
    email: inviteEmail.value.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    role: 'user',
  });

  showToast('邀请已发送');
  closeInviteForm();
}

// 查看用户详情
function viewUserDetail(user: UserItem) {
  selectedUser.value = user;
  showUserDetail.value = true;
}

// 关闭用户详情
function closeUserDetail() {
  showUserDetail.value = false;
  selectedUser.value = null;
}

// 更新用户状态
function updateUserStatus(userId: string, newStatus: 'active' | 'inactive') {
  const index = users.value.findIndex(u => u.id === userId);
  if (index >= 0) {
    users.value[index].status = newStatus;
    emit('updateUserStatus', userId, newStatus);

    if (selectedUser.value && selectedUser.value.id === userId) {
      selectedUser.value.status = newStatus;
    }

    showToast(`用户状态已更新为${newStatus === 'active' ? '启用' : '禁用'}`);
  }
}

// 删除邀请
function deleteInvite(userId: string) {
  showDialog({
    title: '确认删除邀请',
    message: '确定要删除这个邀请吗？',
    showCancelButton: true,
  }).then(() => {
    const index = users.value.findIndex(u => u.id === userId);
    if (index >= 0) {
      users.value.splice(index, 1);

      if (showUserDetail.value && selectedUser.value && selectedUser.value.id === userId) {
        closeUserDetail();
      }

      showToast('邀请已删除');
    }
  });
}

// 重新发送邀请
function resendInvite(user: UserItem) {
  showToast(`邀请已重新发送至 ${user.email}`);
}

// 计算过滤后的用户列表
const filteredUsers = computed(() => {
  if (activeTab.value === 'all') {
    return users.value;
  } else {
    return users.value.filter(user => user.status === 'pending');
  }
});

// 获取用户头像背景色
function getUserColor(userId: string): string {
  const colors = [
    '#8A69F6', // 紫色
    '#13D77F', // 绿色
    '#FF7C01', // 橙色
    '#FD82D0', // 粉色
    '#01BDB4', // 青色
  ];

  // 根据用户ID的哈希值选择一个颜色
  const hashCode = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return colors[hashCode % colors.length];
}

// 格式化日期为相对时间
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString();
  } else if (diffDay > 0) {
    return `${diffDay}天前`;
  } else if (diffHour > 0) {
    return `${diffHour}小时前`;
  } else if (diffMin > 0) {
    return `${diffMin}分钟前`;
  } else {
    return '刚刚';
  }
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
    <div class="user-management-panel">
      <div class="panel-header">
        <div class="header-title">用户管理</div>
        <div class="header-action" @click="openInviteForm">
          <div i-carbon-user-follow></div>
          <span>邀请</span>
        </div>
      </div>

      <div class="tab-navigation">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          所有用户 ({{ users.length }})
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待接受 ({{ users.filter(u => u.status === 'pending').length }})
        </div>
      </div>

      <div class="user-list">
        <div v-for="user in filteredUsers" :key="user.id"
             class="user-item"
             :class="{ 'current-user': user.id === currentUser.id, 'pending': user.status === 'pending' }"
             @click="viewUserDetail(user)">
          <div class="user-avatar" :style="{ backgroundColor: getUserColor(user.id) }">
            {{ user.name.charAt(0) }}
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ user.name }}
              <span v-if="user.id === currentUser.id" class="is-me">(我)</span>
              <span v-if="user.role === 'admin'" class="is-admin">管理员</span>
            </div>
            <div class="user-email">{{ user.email || '未设置邮箱' }}</div>
          </div>
          <div class="user-status">
            <div v-if="user.status === 'active'" i-carbon-checkmark-outline class="status-active"></div>
            <div v-if="user.status === 'inactive'" i-carbon-close-outline class="status-inactive"></div>
            <div v-if="user.status === 'pending'" i-carbon-time class="status-pending"></div>
          </div>
        </div>

        <div v-if="filteredUsers.length === 0" class="no-users">
          <div i-carbon-user-multiple class="empty-icon"></div>
          <div class="empty-text">暂无{{ activeTab === 'pending' ? '待接受邀请' : '用户' }}</div>
          <div v-if="activeTab === 'all'" class="empty-action" @click="openInviteForm">邀请用户</div>
        </div>
      </div>
    </div>

    <!-- 邀请表单 -->
    <TouchDialog
      :modelValue="showInviteForm"
      @update:modelValue="showInviteForm = $event"
      position="bottom"
      :closeOnClickOverlay="true"
      @close="closeInviteForm"
    >
      <div class="invite-form">
        <div class="form-header">
          <div class="form-title">邀请用户</div>
          <div class="form-close" @click="closeInviteForm">
            <div i-carbon-close></div>
          </div>
        </div>

        <div class="form-content">
          <div class="form-item">
            <div class="item-label">邮箱地址</div>
            <input
              type="email"
              v-model="inviteEmail"
              placeholder="请输入邮箱地址"
              class="form-input"
            />
          </div>

          <div class="form-item">
            <div class="item-label">邀请信息（可选）</div>
            <textarea
              v-model="inviteMessage"
              placeholder="添加个性化邀请信息"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" @click="closeInviteForm">取消</button>
          <button class="submit-btn" @click="sendInvite">发送邀请</button>
        </div>
      </div>
    </TouchDialog>

    <!-- 用户详情 -->
    <TouchDialog
      :modelValue="showUserDetail"
      @update:modelValue="showUserDetail = $event"
      position="bottom"
      :closeOnClickOverlay="true"
      @close="closeUserDetail"
    >
      <div class="user-detail" v-if="selectedUser">
        <div class="detail-header">
          <div class="detail-title">用户详情</div>
          <div class="detail-close" @click="closeUserDetail">
            <div i-carbon-close></div>
          </div>
        </div>

        <div class="user-profile">
          <div class="user-avatar large" :style="{ backgroundColor: getUserColor(selectedUser.id) }">
            {{ selectedUser.name.charAt(0) }}
          </div>
          <div class="user-name large">
            {{ selectedUser.name }}
            <span v-if="selectedUser.id === currentUser.id" class="is-me">(我)</span>
          </div>
          <div class="user-role">
            {{ selectedUser.role === 'admin' ? '管理员' : '普通用户' }}
          </div>
          <div class="user-joined">
            加入于 {{ new Date(selectedUser.createdAt).toLocaleDateString() }}
          </div>
        </div>

        <div class="user-details">
          <div class="detail-item">
            <div class="detail-label">邮箱</div>
            <div class="detail-value">{{ selectedUser.email || '未设置' }}</div>
          </div>
          <div class="detail-item" v-if="selectedUser.phone">
            <div class="detail-label">手机</div>
            <div class="detail-value">{{ selectedUser.phone }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">状态</div>
            <div class="detail-value">
              <span :class="`status-${selectedUser.status}`">
                {{ selectedUser.status === 'active' ? '已启用' :
                   selectedUser.status === 'inactive' ? '已禁用' : '待接受' }}
              </span>
            </div>
          </div>
          <div class="detail-item" v-if="selectedUser.lastLogin">
            <div class="detail-label">最近登录</div>
            <div class="detail-value">{{ formatRelativeTime(selectedUser.lastLogin) }}</div>
          </div>
        </div>

        <div class="user-actions" v-if="selectedUser.id !== currentUser.id">
          <div v-if="selectedUser.status === 'pending'">
            <button class="action-btn primary" @click="resendInvite(selectedUser)">
              <div i-carbon-send></div>
              重新发送邀请
            </button>
            <button class="action-btn danger" @click="deleteInvite(selectedUser.id)">
              <div i-carbon-trash-can></div>
              删除邀请
            </button>
          </div>
          <div v-else>
            <button
              class="action-btn"
              :class="selectedUser.status === 'active' ? 'warning' : 'success'"
              @click="updateUserStatus(selectedUser.id, selectedUser.status === 'active' ? 'inactive' : 'active')"
            >
              <div :class="selectedUser.status === 'active' ? 'i-carbon-close-outline' : 'i-carbon-checkmark-outline'"></div>
              {{ selectedUser.status === 'active' ? '禁用用户' : '启用用户' }}
            </button>
          </div>
        </div>
      </div>
    </TouchDialog>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.user-management-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;

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

  .tab-navigation {
    display: flex;
    margin-bottom: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 4px;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 8px;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s ease;

      &.active {
        background-color: var(--el-color-primary);
        color: white;
        font-weight: 500;
      }
    }
  }

  .user-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .user-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background-color: var(--el-bg-color-page);
      border-radius: 12px;
      position: relative;

      &.current-user {
        background-color: rgba(var(--el-color-primary-rgb), 0.1);

        .user-avatar {
          background-color: var(--el-color-primary);
        }
      }

      &.pending {
        background-color: rgba(var(--el-color-warning-rgb), 0.05);
        border: 1px dashed var(--el-color-warning);
      }

      .user-avatar {
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

      .user-info {
        flex: 1;
        margin-left: 12px;

        .user-name {
          font-weight: 500;
          font-size: 15px;
          display: flex;
          align-items: center;

          .is-me {
            font-size: 12px;
            color: var(--el-color-primary);
            margin-left: 4px;
          }

          .is-admin {
            font-size: 11px;
            background-color: var(--el-color-danger);
            color: white;
            padding: 1px 4px;
            border-radius: 4px;
            margin-left: 5px;
          }
        }

        .user-email {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }

      .user-status {
        font-size: 16px;

        .status-active {
          color: var(--el-color-success);
        }

        .status-inactive {
          color: var(--el-color-danger);
        }

        .status-pending {
          color: var(--el-color-warning);
        }
      }
    }

    .no-users {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
}

.invite-form, .user-detail {
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-height: 80vh;

  .form-header, .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .form-title, .detail-title {
      font-size: 18px;
      font-weight: 500;
    }

    .form-close, .detail-close {
      color: var(--el-text-color-secondary);
      font-size: 20px;
    }
  }

  .form-content {
    flex: 1;
    overflow-y: auto;

    .form-item {
      margin-bottom: 16px;

      .item-label {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .form-input, .form-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        outline: none;
        font-size: 14px;
      }

      .form-textarea {
        resize: none;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);

    .cancel-btn, .submit-btn {
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

    .submit-btn {
      background-color: var(--el-color-primary);
      color: white;
    }
  }

  .user-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;

    .user-avatar.large {
      width: 80px;
      height: 80px;
      font-size: 32px;
      margin-bottom: 12px;
    }

    .user-name.large {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .user-role {
      color: var(--el-text-color-secondary);
      font-size: 14px;
      margin-bottom: 2px;
    }

    .user-joined {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .user-details {
    background-color: var(--el-bg-color-page);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;

    .detail-item {
      display: flex;
      margin-bottom: 12px;
      align-items: center;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        flex: 1;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }

      .detail-value {
        flex: 2;
        font-size: 14px;

        .status-active {
          color: var(--el-color-success);
        }

        .status-inactive {
          color: var(--el-color-danger);
        }

        .status-pending {
          color: var(--el-color-warning);
        }
      }
    }
  }

  .user-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      border: none;

      div {
        margin-right: 8px;
      }

      &.primary {
        background-color: var(--el-color-primary);
        color: white;
      }

      &.danger {
        background-color: var(--el-color-danger);
        color: white;
      }

      &.warning {
        background-color: var(--el-color-warning);
        color: white;
      }

      &.success {
        background-color: var(--el-color-success);
        color: white;
      }
    }
  }
}
</style>
