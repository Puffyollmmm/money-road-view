<script setup lang="ts">
defineProps<{
  selectedMonth: string;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
}>();

defineEmits<{
  (e: 'changeMonth', delta: number): void;
  (e: 'openDataOverview'): void;
}>();
</script>

<template>
  <div class="bill-header">
    <div class="month-selector">
      <div @click="$emit('changeMonth', -1)" class="month-btn">〈</div>
      <div class="current-month">{{ selectedMonth }}</div>
      <div @click="$emit('changeMonth', 1)" class="month-btn">〉</div>
    </div>

    <div class="bill-statistics" @click="$emit('openDataOverview')">
      <div class="stat-item">
        <div class="stat-label">收入</div>
        <div class="stat-value income">{{ monthlyIncome.toFixed(2) }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">支出</div>
        <div class="stat-value expense">{{ monthlyExpense.toFixed(2) }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">结余</div>
        <div class="stat-value" :class="monthlyBalance >= 0 ? 'income' : 'expense'">
          {{ monthlyBalance.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bill-header {
  background-color: var(--el-bg-color);
  padding: 16px;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;

  .month-selector {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    .current-month {
      font-size: 16px;
      font-weight: 500;
      margin: 0 12px;
    }

    .month-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--el-fill-color-light);
    }
  }

  .bill-statistics {
    display: flex;
    justify-content: space-around;
    position: relative;
    padding: 16px 0;

    &::after {
      content: "";
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.1), transparent);
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'%3E%3C/polyline%3E%3C/svg%3E");
      opacity: 0.5;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;

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
