<script setup lang="ts">
import { computed, ref } from 'vue';

interface BillItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}

interface Tab {
  id: string;
  name: string;
  icon: string;
}

interface PropType {
  visible: boolean;
  bills: BillItem[];
  selectedMonth: string;
  monthlyIncome: number;
  monthlyExpense: number;
}

const props = defineProps<PropType>();
const emit = defineEmits(['update:visible']);

// 关闭面板
function closePanel() {
  emit('update:visible', false);
}

// TAB管理
const tabs = ref<Tab[]>([
  { id: 'consumption', name: '实时消费决策', icon: 'i-carbon-decision-tree' },
  { id: 'budget', name: '智能预算管理', icon: 'i-carbon-chart-combo' },
  { id: 'investment', name: '个性化投资建议', icon: 'i-carbon-growth' }
]);
const activeTab = ref('consumption');

// 账单分析数据
const categoryAnalysis = computed(() => {
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
      percentage: (amount / props.monthlyExpense * 100).toFixed(1)
    }));
});

// 消费趋势分析
const weeklyTrend = computed(() => {
  const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  props.bills.forEach(bill => {
    if (bill.type === 'expense') {
      const day = new Date(bill.date).getDate();
      const weekNum = Math.ceil(day / 7);
      if (weekNum >= 1 && weekNum <= 5) {
        weeks[weekNum] += bill.amount;
      }
    }
  });

  return Object.entries(weeks).map(([week, amount]) => ({
    week: `第${week}周`,
    amount: Number(amount.toFixed(2))
  }));
});

// 预算执行情况
const budgetExecution = computed(() => {
  // 模拟预算数据 - 实际应用中应从用户设置中获取
  const budgetTarget = props.monthlyIncome * 0.7;
  const currentSpending = props.monthlyExpense;
  const remainingBudget = budgetTarget - currentSpending;
  const executionRate = (currentSpending / budgetTarget * 100).toFixed(1);

  return {
    budgetTarget,
    currentSpending,
    remainingBudget,
    executionRate,
    status: currentSpending <= budgetTarget ? '良好' : '超支',
    statusColor: currentSpending <= budgetTarget ? '#20DF9F' : '#FE4794'
  };
});

// 投资组合建议
const investmentSuggestions = ref([
  { type: '货币基金', percentage: 30, risk: '低', expectedReturn: '3-4%', color: '#20DF9F' },
  { type: '债券型基金', percentage: 40, risk: '中低', expectedReturn: '4-6%', color: '#02D9B2' },
  { type: '混合型基金', percentage: 20, risk: '中', expectedReturn: '5-8%', color: '#B392F2' },
  { type: '股票型基金', percentage: 10, risk: '高', expectedReturn: '8-15%', color: '#FE4794' }
]);

// 消费决策建议
const consumptionAdvice = computed(() => {
  if (categoryAnalysis.value.length === 0) {
    return '暂无足够数据生成消费建议，请继续记录您的支出。';
  }

  const topCategory = categoryAnalysis.value[0];
  let advice = '';

  // 基于预算执行情况的建议
  if (budgetExecution.value.status === '超支') {
    advice = `【DeepSeek AI 分析】本月预算已超支，建议立即减少在"${topCategory.category}"类别的支出，该类别占总支出的${topCategory.percentage}%，是您主要的超支点。`;
  } else if (Number(budgetExecution.value.executionRate) > 80) {
    advice = `【DeepSeek AI 分析】本月预算执行率已达${budgetExecution.value.executionRate}%，趋于紧张。建议控制"${topCategory.category}"类别支出，该类别是您最大的支出项，占比${topCategory.percentage}%。`;
  } else {
    advice = `【DeepSeek AI 分析】您的预算执行情况良好，仍有¥${budgetExecution.value.remainingBudget.toFixed(2)}的可支配预算空间。"${topCategory.category}"是您的主要开支，建议合理规划这部分支出，保持良好消费习惯。`;
  }

  // 基于周趋势的建议
  const lastWeek = weeklyTrend.value[weeklyTrend.value.length - 1];
  const previousWeek = weeklyTrend.value[weeklyTrend.value.length - 2];

  if (lastWeek && previousWeek && lastWeek.amount > previousWeek.amount * 1.2) {
    advice += `近期支出有明显增加趋势，${lastWeek.week}支出比上周增长了${((lastWeek.amount/previousWeek.amount - 1) * 100).toFixed(0)}%，建议关注消费频率。`;
  }

  return advice;
});

// 预算管理建议
const budgetManagementAdvice = computed(() => {
  if (props.bills.length < 5) {
    return '数据量不足，继续记录您的收支以获取更准确的预算建议。';
  }

  let advice = `【DeepSeek AI 智能预算】基于您的历史数据，推荐将月收入¥${props.monthlyIncome.toFixed(2)}按以下比例分配：`;

  // 计算各类别的预算比例
  const totalCategories = categoryAnalysis.value.slice(0, 5);
  let budgetPlan = '';

  if (totalCategories.length > 0) {
    // 调整各类别预算比例，实际应用中应使用更复杂的算法
    totalCategories.forEach(cat => {
      const recommendedPercentage = Math.min(Number(cat.percentage), 25);
      budgetPlan += `\n• ${cat.category}：${recommendedPercentage.toFixed(0)}%（¥${(props.monthlyIncome * recommendedPercentage / 100).toFixed(2)}）`;
    });

    advice += budgetPlan;

    // 储蓄建议
    const savingPercentage = 15;
    advice += `\n• 储蓄：${savingPercentage}%（¥${(props.monthlyIncome * savingPercentage / 100).toFixed(2)}）`;
  } else {
    advice = '暂无足够数据生成详细预算方案，建议记录更多收支数据。';
  }

  return advice;
});

// 投资建议
const investmentAdvice = computed(() => {
  // 基于收入和支出情况的投资建议
  const monthlySavings = props.monthlyIncome - props.monthlyExpense;
  const savingsRate = (monthlySavings / props.monthlyIncome * 100).toFixed(1);

  let advice = `【DeepSeek AI 投资顾问】`;

  if (monthlySavings <= 0) {
    advice += `当前月度收支为负，建议先调整支出结构，确保有稳定的月度盈余后再考虑投资。`;
    return advice;
  }

  advice += `您当前的月度盈余为¥${monthlySavings.toFixed(2)}，储蓄率${savingsRate}%。`;

  if (Number(savingsRate) < 10) {
    advice += `储蓄率偏低，建议优先建立3-6个月的应急储备金，再考虑投资。`;
  } else if (Number(savingsRate) >= 10 && Number(savingsRate) < 20) {
    advice += `储蓄情况适中，建议按低风险偏好配置资产：\n• 60%货币基金/存款\n• 30%债券型基金\n• 10%指数基金`;
  } else {
    advice += `储蓄率良好，建议按平衡型组合配置资产：\n• 40%货币基金/存款\n• 30%债券型基金\n• 20%混合型基金\n• 10%股票型基金/指数基金`;
  }

  return advice;
});
</script>

<template>
  <div class="ai-assistant-panel" :class="{ visible: props.visible }">
    <div class="panel-header">
      <div class="panel-title">
        <div class="ai-logo">
          <div i-carbon-ai-status class="pulse"></div>
          <span>DeepSeek AI 财务助手</span>
        </div>
        <div class="close-button" @click="closePanel">
          <div i-carbon-close></div>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="tab-nav">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <div :class="tab.icon"></div>
          <span>{{ tab.name }}</span>
        </div>
      </div>
    </div>

    <div class="panel-content">
      <!-- 实时消费决策 -->
      <div v-if="activeTab === 'consumption'" class="tab-content consumption-tab">
        <div class="ai-card insight-card">
          <div class="card-title">
            <div i-carbon-task-complete></div>
            <span>消费执行状况</span>
          </div>
          <div class="budget-status">
            <div class="budget-progress">
              <div
                class="progress-bar"
                :style="{width: `${Math.min(Number(budgetExecution.executionRate), 100)}%`}"
                :class="{ warning: Number(budgetExecution.executionRate) > 80 && Number(budgetExecution.executionRate) <= 100, danger: Number(budgetExecution.executionRate) > 100 }"
              ></div>
            </div>
            <div class="budget-info">
              <div class="budget-label">预算执行率</div>
              <div class="budget-value">{{ budgetExecution.executionRate }}%</div>
            </div>
            <div class="budget-summary">
              <div class="budget-item">
                <div class="item-label">预算目标</div>
                <div class="item-value">¥{{ budgetExecution.budgetTarget.toFixed(2) }}</div>
              </div>
              <div class="budget-item">
                <div class="item-label">当前支出</div>
                <div class="item-value">¥{{ budgetExecution.currentSpending.toFixed(2) }}</div>
              </div>
              <div class="budget-item">
                <div class="item-label">状态</div>
                <div class="item-value" :style="{color: budgetExecution.statusColor}">{{ budgetExecution.status }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-card advice-card">
          <div class="card-title">
            <div i-carbon-idea></div>
            <span>AI 消费建议</span>
          </div>
          <div class="ai-message">
            {{ consumptionAdvice }}
          </div>

          <div class="category-analysis">
            <div class="analysis-title">主要支出类别</div>
            <div class="category-list">
              <div
                v-for="(category, index) in categoryAnalysis.slice(0, 3)"
                :key="index"
                class="category-item"
              >
                <div class="category-name">{{ category.category }}</div>
                <div class="category-bar">
                  <div class="bar-fill" :style="{width: `${category.percentage}%`}"></div>
                </div>
                <div class="category-stats">
                  <span class="category-amount">¥{{ category.amount.toFixed(2) }}</span>
                  <span class="category-percentage">{{ category.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-button">详细分析</button>
          <button class="action-button primary">应用建议</button>
        </div>
      </div>

      <!-- 智能预算管理 -->
      <div v-if="activeTab === 'budget'" class="tab-content budget-tab">
        <div class="ai-card insight-card">
          <div class="card-title">
            <div i-carbon-chart-combo></div>
            <span>预算执行趋势</span>
          </div>
          <div class="trend-chart">
            <div class="trend-bars">
              <div
                v-for="(week, index) in weeklyTrend"
                :key="index"
                class="trend-bar-container"
              >
                <div class="trend-bar" :style="{height: `${Math.min(week.amount / (props.monthlyIncome * 0.25) * 100, 100)}%`}"></div>
                <div class="trend-label">{{ week.week }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-card advice-card">
          <div class="card-title">
            <div i-carbon-finance></div>
            <span>AI 预算建议</span>
          </div>
          <div class="ai-message">
            {{ budgetManagementAdvice }}
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-button">自定义预算</button>
          <button class="action-button primary">应用预算方案</button>
        </div>
      </div>

      <!-- 个性化投资建议 -->
      <div v-if="activeTab === 'investment'" class="tab-content investment-tab">
        <div class="ai-card insight-card">
          <div class="card-title">
            <div i-carbon-portfolio></div>
            <span>推荐投资组合</span>
          </div>
          <div class="investment-portfolio">
            <div class="portfolio-chart">
              <div
                v-for="(item, index) in investmentSuggestions"
                :key="index"
                class="portfolio-item"
                :style="{
                  backgroundColor: item.color,
                  width: `${item.percentage}%`
                }"
              ></div>
            </div>
            <div class="portfolio-legend">
              <div
                v-for="(item, index) in investmentSuggestions"
                :key="index"
                class="legend-item"
              >
                <div class="legend-color" :style="{backgroundColor: item.color}"></div>
                <div class="legend-info">
                  <div class="legend-name">{{ item.type }} ({{ item.percentage }}%)</div>
                  <div class="legend-details">风险: {{ item.risk }} | 预期收益: {{ item.expectedReturn }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-card advice-card">
          <div class="card-title">
            <div i-carbon-growth></div>
            <span>AI 投资建议</span>
          </div>
          <div class="ai-message">
            {{ investmentAdvice }}
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-button">风险评估</button>
          <button class="action-button primary">制定投资计划</button>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <div class="ai-powered-by">
        <span>Powered by</span>
        <div class="power-logo">DeepSeek AI</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-assistant-panel {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 90%;
  background-color: var(--el-bg-color);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: bottom 0.3s ease-in-out;
  display: flex;
  flex-direction: column;

  &.visible {
    bottom: 0;
  }
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);

  .panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .ai-logo {
      display: flex;
      align-items: center;
      color: #8a69f6;
      font-size: 18px;
      font-weight: 600;

      .pulse {
        font-size: 24px;
        margin-right: 8px;
        animation: pulse 2s infinite;
      }
    }

    .close-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--el-border-color-extra-light);
      color: var(--el-text-color-secondary);
      cursor: pointer;

      &:active {
        background-color: var(--el-border-color-light);
      }
    }
  }

  .tab-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;

    .tab-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      white-space: nowrap;
      color: var(--el-text-color-secondary);
      background-color: var(--el-fill-color-light);
      transition: all 0.2s ease;

      &.active {
        background-color: #8a69f6;
        color: white;
      }

      div[class^="i-"] {
        margin-right: 6px;
        font-size: 16px;
      }
    }
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ai-card {
    background-color: var(--el-bg-color-overlay);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    padding: 16px;

    .card-title {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      div[class^="i-"] {
        margin-right: 8px;
        font-size: 18px;
        color: #8a69f6;
      }
    }
  }

  .ai-message {
    font-size: 15px;
    line-height: 1.5;
    color: var(--el-text-color-primary);
    white-space: pre-line;
  }

  .budget-status {
    .budget-progress {
      height: 12px;
      background-color: var(--el-fill-color);
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        background-image: linear-gradient(90deg, #20DF9F, #02D9B2);
        border-radius: 6px;
        transition: width 0.5s ease;

        &.warning {
          background-image: linear-gradient(90deg, #FEAA06, #FF7C01);
        }

        &.danger {
          background-image: linear-gradient(90deg, #FE4794, #FF4B50);
        }
      }
    }

    .budget-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .budget-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }

      .budget-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .budget-summary {
      display: flex;
      justify-content: space-between;

      .budget-item {
        text-align: center;

        .item-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }

        .item-value {
          font-size: 15px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .category-analysis {
    margin-top: 16px;

    .analysis-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--el-text-color-primary);
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .category-item {
        .category-name {
          font-size: 14px;
          margin-bottom: 4px;
          color: var(--el-text-color-primary);
        }

        .category-bar {
          height: 8px;
          background-color: var(--el-fill-color);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;

          .bar-fill {
            height: 100%;
            background-image: linear-gradient(90deg, #B392F2, #8A69F6);
            border-radius: 4px;
          }
        }

        .category-stats {
          display: flex;
          justify-content: space-between;
          font-size: 13px;

          .category-amount {
            color: var(--el-text-color-primary);
          }

          .category-percentage {
            color: #8A69F6;
            font-weight: 500;
          }
        }
      }
    }
  }

  .trend-chart {
    height: 160px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .trend-bars {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 120px;

      .trend-bar-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 18%;

        .trend-bar {
          width: 100%;
          background-image: linear-gradient(180deg, #B392F2, #8A69F6);
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }

        .trend-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 6px;
        }
      }
    }
  }

  .investment-portfolio {
    .portfolio-chart {
      height: 24px;
      display: flex;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;

      .portfolio-item {
        height: 100%;
      }
    }

    .portfolio-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .legend-item {
        display: flex;
        align-items: center;

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-right: 8px;
        }

        .legend-info {
          .legend-name {
            font-size: 14px;
            color: var(--el-text-color-primary);
          }

          .legend-details {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;

  .action-button {
    flex: 1;
    padding: 10px 0;
    border-radius: 8px;
    font-size: 15px;
    border: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color-overlay);
    color: var(--el-text-color-primary);

    &.primary {
      background-image: linear-gradient(135deg, #B392F2, #8A69F6);
      color: white;
      border: none;
    }
  }
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--el-border-color-light);

  .ai-powered-by {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .power-logo {
      margin-left: 6px;
      font-weight: 600;
      background: linear-gradient(90deg, #B392F2, #8A69F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}
</style>
