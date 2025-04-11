<script setup lang="ts">
import { computed } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface BillItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}

const props = defineProps<{
  visible: boolean;
  bills: BillItem[];
  selectedMonth: string;
  monthlyIncome: number;
  monthlyExpense: number;
}>();

const emit = defineEmits(['update:visible']);

// 计算支出分类数据
const expenseByCategory = computed(() => {
  const categories = props.bills
    .filter(bill => bill.type === 'expense')
    .reduce((acc, bill) => {
      if (!acc[bill.category]) {
        acc[bill.category] = 0;
      }
      acc[bill.category] += bill.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / props.monthlyExpense * 100).toFixed(1),
    }));
});

// 计算收入分类数据
const incomeByCategory = computed(() => {
  const categories = props.bills
    .filter(bill => bill.type === 'income')
    .reduce((acc, bill) => {
      if (!acc[bill.category]) {
        acc[bill.category] = 0;
      }
      acc[bill.category] += bill.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / props.monthlyIncome * 100).toFixed(1),
    }));
});

// 支出趋势（按日期）
const expenseByDay = computed(() => {
  const dailyExpenses: Record<string, number> = {};
  const days = new Date(`${props.selectedMonth}-01`).getMonth() === new Date().getMonth()
    ? new Date().getDate()
    : new Date(new Date(`${props.selectedMonth}-01`).getFullYear(), new Date(`${props.selectedMonth}-01`).getMonth() + 1, 0).getDate();

  // 初始化每一天
  for (let i = 1; i <= days; i++) {
    const day = i.toString().padStart(2, '0');
    dailyExpenses[day] = 0;
  }

  // 统计每天支出
  for (const bill of props.bills.filter(bill => bill.type === 'expense')) {
    const day = bill.date.split('-')[2];
    dailyExpenses[day] = (dailyExpenses[day] || 0) + bill.amount;
  }

  return {
    days: Object.keys(dailyExpenses).sort((a, b) => Number(a) - Number(b)),
    values: Object.values(dailyExpenses),
    maxValue: Math.max(...Object.values(dailyExpenses)),
  };
});

// 关闭面板
function closePanel(): void {
  emit('update:visible', false);
}
</script>

<template>
  <TouchDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" active>
    <template #Main>
      <div class="overview-header">
        <button class="close-btn" @click="closePanel">
          <div i-carbon-close></div>
        </button>
        <div class="title">{{ selectedMonth }}月账单分析</div>
      </div>

      <div class="overview-content">
        <div class="overview-summary">
          <div class="summary-item income">
            <div class="label">收入</div>
            <div class="value">¥{{ monthlyIncome.toFixed(2) }}</div>
          </div>
          <div class="summary-item expense">
            <div class="label">支出</div>
            <div class="value">¥{{ monthlyExpense.toFixed(2) }}</div>
          </div>
          <div class="summary-item balance">
            <div class="label">结余</div>
            <div class="value" :class="monthlyIncome - monthlyExpense >= 0 ? 'positive' : 'negative'">
              ¥{{ (monthlyIncome - monthlyExpense).toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div i-carbon-chart-pie></div>
            <h3>支出分布</h3>
          </div>

          <div v-if="expenseByCategory.length === 0" class="empty-data">暂无支出数据</div>

          <div v-else class="category-stats">
            <div v-for="(item, index) in expenseByCategory" :key="index" class="category-stat-item">
              <div class="category-name">{{ item.category }}</div>
              <div class="category-progress">
                <div class="progress-bar" :style="`width: ${item.percentage}%;`"></div>
              </div>
              <div class="category-details">
                <div class="amount">¥{{ item.amount.toFixed(2) }}</div>
                <div class="percentage">{{ item.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div i-carbon-chart-line></div>
            <h3>每日支出趋势</h3>
          </div>

          <div v-if="expenseByDay.maxValue === 0" class="empty-data">暂无趋势数据</div>

          <div v-else class="chart-container">
            <div class="expense-chart">
              <div v-for="(value, index) in expenseByDay.values" :key="index" class="chart-bar"
                   :style="`height: ${expenseByDay.maxValue ? (value / expenseByDay.maxValue) * 150 : 0}px;`">
                <div class="bar-tooltip">¥{{ value.toFixed(0) }}</div>
              </div>
            </div>
            <div class="chart-labels">
              <div v-for="(day, index) in expenseByDay.days" :key="index" class="chart-label">
                {{ day }}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div i-carbon-money></div>
            <h3>收入来源</h3>
          </div>

          <div v-if="incomeByCategory.length === 0" class="empty-data">暂无收入数据</div>

          <div v-else class="income-stats">
            <div v-for="(item, index) in incomeByCategory" :key="index" class="income-stat-item">
              <div class="income-dot"></div>
              <div class="income-name">{{ item.category }}</div>
              <div class="income-amount">¥{{ item.amount.toFixed(2) }}</div>
              <div class="income-percentage">{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.overview-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;

  .close-btn {
    border: none;
    background: none;
    padding: 8px;
    font-size: 16px;
    color: var(--el-text-color-secondary);
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  .title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
  }
}

.overview-content {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

.overview-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;

  .summary-item {
    flex: 1;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    background-color: var(--el-fill-color-light);

    &:not(:last-child) {
      margin-right: 10px;
    }

    .label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .value {
      font-size: 18px;
      font-weight: 600;

      &.positive {
        color: var(--el-color-success);
      }

      &.negative {
        color: var(--el-color-danger);
      }
    }

    &.income .value {
      color: var(--el-color-success);
    }

    &.expense .value {
      color: var(--el-color-danger);
    }
  }
}

.section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 0 8px;
    }
  }

  .empty-data {
    padding: 20px;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.category-stats {
  .category-stat-item {
    margin-bottom: 12px;

    .category-name {
      font-size: 14px;
      margin-bottom: 4px;
    }

    .category-progress {
      height: 8px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;

      .progress-bar {
        height: 100%;
        background-image: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3));
      }
    }

    .category-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;

      .amount {
        color: var(--el-text-color-regular);
      }

      .percentage {
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.chart-container {
  .expense-chart {
    height: 150px;
    display: flex;
    align-items: flex-end;
    padding: 16px 0;
    margin-bottom: 8px;

    .chart-bar {
      flex: 1;
      background-image: linear-gradient(to top, var(--el-color-primary-light-5), var(--el-color-primary));
      margin: 0 2px;
      border-radius: 4px 4px 0 0;
      min-height: 2px;
      position: relative;
      transition: all 0.3s;

      &:hover {
        background-image: linear-gradient(to top, var(--el-color-primary-light-3), var(--el-color-primary));

        .bar-tooltip {
          opacity: 1;
          transform: translateY(-8px);
        }
      }

      .bar-tooltip {
        position: absolute;
        top: -24px;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        background-color: var(--el-color-primary-dark-2);
        color: white;
        padding: 4px 6px;
        border-radius: 4px;
        font-size: 10px;
        opacity: 0;
        transition: all 0.2s;
        white-space: nowrap;

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid var(--el-color-primary-dark-2);
        }
      }
    }
  }

  .chart-labels {
    display: flex;
    justify-content: space-around;

    .chart-label {
      flex: 1;
      text-align: center;
      font-size: 10px;
      color: var(--el-text-color-secondary);
    }
  }
}

.income-stats {
  .income-stat-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .income-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--el-color-success);
      margin-right: 8px;
    }

    .income-name {
      flex: 1;
      font-size: 14px;
    }

    .income-amount {
      margin-right: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-color-success);
    }

    .income-percentage {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      width: 50px;
      text-align: right;
    }
  }
}
</style>
