<script setup lang="ts">
// 账单数据类型定义
interface BillItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}

interface CategoryInfo {
  name: string;
  icon: string;
  color: string[];
}

defineProps<{
  groupedBills: [string, BillItem[]][];
  getCategoryInfo: (categoryName: string, type: 'income' | 'expense') => CategoryInfo;
}>();

defineEmits(['deleteBill']);

// 格式化日期显示
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  return `${month}月${day}日 星期${weekday}`;
}

// 计算日期总额
function calculateDailyTotal(bills: BillItem[]): string {
  const income = bills.filter(b => b.type === 'income').reduce((sum, b) => sum + (b.amount || 0), 0);
  const expense = bills.filter(b => b.type === 'expense').reduce((sum, b) => sum + (b.amount || 0), 0);

  if (income > 0 && expense > 0) {
    return `收入: ${income.toFixed(2)} 支出: ${expense.toFixed(2)}`;
  }

  if (income > 0) {
    return `收入: ${income.toFixed(2)}`;
  }

  return `支出: ${expense.toFixed(2)}`;
}
</script>

<template>
  <div class="bill-content">
    <div v-if="groupedBills.length === 0" class="empty-state">
      <div i-carbon-document-blank class="empty-icon"></div>
      <div class="empty-text">暂无记录，点击下方"+"添加</div>
    </div>

    <div v-else class="bill-list">
      <div v-for="[date, dayBills] in groupedBills" :key="date" class="bill-date-group">
        <div class="date-header">
          <div class="date">{{ formatDate(date) }}</div>
          <div class="daily-total">{{ calculateDailyTotal(dayBills) }}</div>
        </div>

        <div v-for="bill in dayBills" :key="bill.id" class="bill-item" @click="$emit('deleteBill', bill.id)">
          <div class="left">
            <div class="category-icon"
                 :style="`--c1: ${getCategoryInfo(bill.category, bill.type).color[0]}; --c2: ${getCategoryInfo(bill.category, bill.type).color[1]}`">
              <div :class="getCategoryInfo(bill.category, bill.type).icon"></div>
            </div>
            <div class="bill-info">
              <div class="category">{{ bill.category }}</div>
              <div class="note" v-if="bill.note">{{ bill.note }}</div>
            </div>
          </div>
          <div class="amount" :class="bill.type">
            {{ bill.type === 'income' ? '+' : '-' }}{{ (bill.amount || 0).toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bill-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0 64px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  text-align: center;
  background-color: var(--el-bg-color);
  margin-top: 12px;

  .empty-icon {
    font-size: 48px;
    color: var(--el-text-color-secondary);
    opacity: 0.5;
    margin-bottom: 12px;
  }

  .empty-text {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.bill-list {
  .bill-date-group {
    margin-bottom: 10px;
    background-color: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .date-header {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      background-color: var(--el-fill-color-light);

      .date {
        font-size: 13px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }

      .daily-total {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .bill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: var(--el-fill-color-light);
      }

      .left {
        display: flex;
        align-items: center;

        .category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          margin-right: 12px;
          color: #fff;
          font-size: 18px;
          background-image: linear-gradient(135deg, var(--c1), var(--c2));
        }

        .bill-info {
          .category {
            font-size: 15px;
            margin-bottom: 2px;
          }

          .note {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .amount {
        font-size: 16px;
        font-weight: 500;

        &.income {
          color: var(--el-color-success);
        }

        &.expense {
          color: var(--el-color-danger);
        }
      }
    }
  }
}
</style>
