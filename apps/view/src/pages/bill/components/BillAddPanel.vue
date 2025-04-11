<script setup lang="ts">
import { showToast } from 'vant';
import { ref } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface CategoryItem {
  name: string;
  icon: string;
  color: string[];
}

const props = defineProps<{
  visible: boolean;
  currentDate: string;
  expenseCategories: CategoryItem[];
  incomeCategories: CategoryItem[];
}>();

const emit = defineEmits(['update:visible', 'addBill']);

const currentType = ref<'income' | 'expense'>('expense');
const currentCategory = ref('');
const currentAmount = ref('');
const currentNote = ref('');
const showDatePicker = ref(false);

// 选择分类
function selectCategory(category: string): void {
  currentCategory.value = category;
}

// 添加账单
function submitBill(): void {
  if (!currentCategory.value) {
    showToast('请选择分类');
    return;
  }

  const amount = Number.parseFloat(currentAmount.value);
  if (!currentAmount.value || amount <= 0) {
    showToast('请输入有效金额');
    return;
  }

  emit('addBill', {
    type: currentType.value,
    category: currentCategory.value,
    amount,
    date: props.currentDate,
    note: currentNote.value,
  });

  // 重置表单
  resetForm();
  closePanel();
}

// 重置表单
function resetForm(): void {
  currentCategory.value = '';
  currentAmount.value = '';
  currentNote.value = '';
  currentType.value = 'expense';
}

// 关闭面板
function closePanel(): void {
  emit('update:visible', false);
}
</script>

<template>
  <TouchDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" active>
    <template #Main>
      <div class="panel-header">
        <button @click="closePanel">取消</button>
        <div class="type-selector">
          <button :class="{ active: currentType === 'expense' }" @click="currentType = 'expense'">支出</button>
          <button :class="{ active: currentType === 'income' }" @click="currentType = 'income'">收入</button>
        </div>
        <button @click="submitBill">保存</button>
      </div>

      <div class="TouchDialog-Content">
        <div class="amount-input">
          <div class="currency">¥</div>
          <input type="number" v-model="currentAmount" placeholder="0.00" inputmode="decimal" step="0.01" />
        </div>

        <div class="date-selector" @click="showDatePicker = true">
          <div>日期</div>
          <div>{{ currentDate }}</div>
        </div>

        <div class="note-input">
          <input type="text" v-model="currentNote" placeholder="添加备注..." />
        </div>

        <div class="category-selector">
          <h3>选择分类</h3>
          <div class="category-grid">
            <div v-for="category in (currentType === 'income' ? incomeCategories : expenseCategories)"
                 :key="category.name" class="category-item" :class="{ active: currentCategory === category.name }"
                 @click="selectCategory(category.name)" :style="`--c1: ${category.color[0]}; --c2: ${category.color[1]}`">
              <div class="category-icon">
                <div :class="category.icon"></div>
              </div>
              <div class="category-name">{{ category.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.panel-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);

  button {
    border: none;
    background: none;
    padding: 6px;
    font-size: 15px;
    color: var(--el-text-color-regular);

    &.active {
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }

  .type-selector {
    display: flex;
    background-color: var(--el-fill-color-light);
    border-radius: 20px;
    overflow: hidden;

    button {
      margin: 0;
      padding: 8px 20px;
      font-weight: 500;
      transition: all 0.3s ease;

      &.active {
        background-image: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3));
        color: #fff;
        box-shadow: 0 2px 6px rgba(0, 120, 250, 0.3);
      }
    }
  }
}

.TouchDialog-Content {
  padding: 16px;

  .amount-input {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding-bottom: 16px;

    .currency {
      font-size: 28px;
      margin-right: 8px;
    }

    input {
      border: none;
      outline: none;
      font-size: 32px;
      width: 100%;
      background-color: transparent;
    }
  }

  .date-selector,
  .note-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    input {
      border: none;
      outline: none;
      width: 100%;
      text-align: right;
      font-size: 15px;
      background-color: transparent;
    }
  }

  .category-selector {
    margin-top: 20px;

    h3 {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px 8px;

      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        &.active {
          .category-icon {
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .category-name {
            color: var(--el-color-primary);
            font-weight: 500;
          }
        }

        .category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-bottom: 6px;
          color: #fff;
          font-size: 20px;
          background-image: linear-gradient(135deg, var(--c1), var(--c2));
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .category-name {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}
</style>
