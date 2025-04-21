<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface BillItem {
  id: string;
  bookId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
  createdBy?: string;
  lastModified?: string;
}

interface AiInsight {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
}

const props = defineProps<{
  visible: boolean;
  bills: BillItem[];
  selectedMonth: string;
  monthlyIncome: number;
  monthlyExpense: number;
  aiInsights: AiInsight[];
  aiAnalysisStatus: 'idle' | 'analyzing' | 'ready';
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'generateReport', options: { period: string; type: string }): void;
  (e: 'shareInsight', insightId: number): void;
  (e: 'executeQuery', query: string): void;
}>();

// 对话状态
const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  },
});

// AI助手状态
const aiThinking = computed(() => props.aiAnalysisStatus === 'analyzing');
const aiReady = computed(() => props.aiAnalysisStatus === 'ready');

// 用户提问
const userQuery = ref('');
const queryHistory = ref<{
  id: number;
  query: string;
  response?: string;
  loading?: boolean;
  time: string;
}[]>([]);

// AI建议的问题
const suggestedQueries = [
  '分析我的消费习惯',
  '比较本月和上月的支出',
  '哪个类别开支最大',
  '如何优化我的预算',
  '未来消费趋势预测',
  '帮我制定储蓄计划',
];

// 分析报告周期选项
const reportPeriod = ref('month');
const reportType = ref('expense');

// 生成分析报告
function generateReport() {
  emit('generateReport', {
    period: reportPeriod.value,
    type: reportType.value,
  });
}

// 处理用户提问
function handleQuery() {
  if (!userQuery.value.trim()) {
    return;
  }

  const queryId = Date.now();
  queryHistory.value.unshift({
    id: queryId,
    query: userQuery.value,
    loading: true,
    time: new Date().toLocaleTimeString(),
  });

  // 发送到父组件处理
  emit('executeQuery', userQuery.value);
  userQuery.value = '';

  // 模拟AI响应
  setTimeout(() => {
    const index = queryHistory.value.findIndex(q => q.id === queryId);
    if (index !== -1) {
      queryHistory.value[index].loading = false;

      // 生成相关回答
      const query = queryHistory.value[index].query.toLowerCase();
      let response = '';

      if (query.includes('消费习惯')) {
        response = `根据MuRAG分析，您的主要支出集中在${getTopCategory()}类别，占总支出的${getTopCategoryPercentage()}%。与同龄人相比，您在该类别的支出${getComparisonText()}。`;
      } else if (query.includes('比较') || query.includes('上月')) {
        response = `本月总支出${getMonthlyComparison()}。其中，${getTopCategory()}类别${getCategoryComparison()}，${getSecondCategory()}类别${getSecondCategoryComparison()}。`;
      } else if (query.includes('最大') || query.includes('类别')) {
        response = `本月开支最大的类别是${getTopCategory()}，共支出${getTopCategoryAmount()}元，占比${getTopCategoryPercentage()}%。主要原因可能是${getTopCategoryReason()}。`;
      } else if (query.includes('优化') || query.includes('预算')) {
        response = `建议您在${getTopCategory()}方面控制支出，可以尝试${getBudgetSuggestion()}。此外，可以增加${getLowCategory()}支出，这有助于提高生活质量和长期财务健康。`;
      } else if (query.includes('趋势') || query.includes('预测')) {
        response = `基于MCP模型分析，预计未来三个月您的${getTopCategory()}支出将${getTrendPrediction()}。整体消费趋势将${getOverallTrend()}。建议您${getFutureSuggestion()}。`;
      } else if (query.includes('储蓄') || query.includes('计划')) {
        response = `根据您的收支情况，建议您每月储蓄收入的${getSavingRate()}%。可以采用${getSavingMethod()}方法。以您目前的收入水平，${getSavingGoalPrediction()}。`;
      } else {
        response = `我分析了您的账单数据，发现您在${getTopCategory()}方面的支出较多。与往月相比，本月总支出${getMonthlyComparison()}。建议您关注${getBudgetFocus()}方面的支出控制。`;
      }

      queryHistory.value[index].response = response;
    }
  }, 1500);
}

// 选择建议问题
function selectSuggestedQuery(query: string) {
  userQuery.value = query;
  handleQuery();
}

// 分享洞察
function shareInsight(index: number) {
  emit('shareInsight', index);
}

// ===== 辅助函数，模拟AI分析结果 =====

// 获取最大支出类别
function getTopCategory(): string {
  const categories = ['餐饮', '购物', '交通', '娱乐', '居家'];
  return categories[Math.floor(Math.random() * 5)];
}

// 获取第二大支出类别
function getSecondCategory(): string {
  const categories = ['社交', '医疗', '教育', '旅行'];
  return categories[Math.floor(Math.random() * 4)];
}

// 获取最小支出类别
function getLowCategory(): string {
  const categories = ['教育投资', '健康管理', '技能提升', '长期规划'];
  return categories[Math.floor(Math.random() * 4)];
}

// 获取最大类别支出金额
function getTopCategoryAmount(): string {
  return (Math.random() * 2000 + 1000).toFixed(2);
}

// 获取最大类别支出占比
function getTopCategoryPercentage(): string {
  return (Math.random() * 40 + 20).toFixed(1);
}

// 获取与同龄人的比较结果
function getComparisonText(): string {
  const comparisons = ['偏高', '适中', '略低', '明显高于平均水平'];
  return comparisons[Math.floor(Math.random() * 4)];
}

// 获取月度比较结果
function getMonthlyComparison(): string {
  const change = (Math.random() * 30 - 15).toFixed(1);
  return Number(change) > 0
    ? `增加了${change}%`
    : `减少了${Math.abs(Number(change))}%`;
}

// 获取类别比较结果
function getCategoryComparison(): string {
  const change = (Math.random() * 40 - 20).toFixed(1);
  return Number(change) > 0
    ? `增加了${change}%`
    : `减少了${Math.abs(Number(change))}%`;
}

// 获取第二类别比较结果
function getSecondCategoryComparison(): string {
  const change = (Math.random() * 35 - 15).toFixed(1);
  return Number(change) > 0
    ? `增加了${change}%`
    : `减少了${Math.abs(Number(change))}%`;
}

// 获取最大类别原因分析
function getTopCategoryReason(): string {
  const reasons = [
    '季节性消费增加',
    '生活必需品价格上涨',
    '特殊场合消费',
    '工作需要',
    '计划内的大额支出',
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// 获取预算建议
function getBudgetSuggestion(): string {
  const suggestions = [
    '设置每周消费上限',
    '使用打折券或会员优惠',
    '比价后再购买',
    '推迟非必要消费',
    '寻找替代品',
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// 获取预算重点
function getBudgetFocus(): string {
  const focuses = [
    '日常餐饮',
    '冲动性购物',
    '闲置订阅服务',
    '高频低价消费',
    '隐性消费',
  ];
  return focuses[Math.floor(Math.random() * focuses.length)];
}

// 获取趋势预测
function getTrendPrediction(): string {
  const trends = [
    '保持稳定',
    '有小幅上升',
    '略有下降',
    '明显上升',
    '持续减少',
  ];
  return trends[Math.floor(Math.random() * trends.length)];
}

// 获取整体趋势
function getOverallTrend(): string {
  const trends = [
    '趋于稳定',
    '呈现波动上升状态',
    '逐渐下降',
    '季节性波动',
    '保持健康水平',
  ];
  return trends[Math.floor(Math.random() * trends.length)];
}

// 获取未来建议
function getFutureSuggestion(): string {
  const suggestions = [
    '提前规划大额支出',
    '增加必要储备金',
    '调整消费预算分配',
    '关注季节性消费变化',
    '建立应急消费基金',
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// 获取储蓄率建议
function getSavingRate(): string {
  return (Math.random() * 15 + 10).toFixed(0);
}

// 获取储蓄方法
function getSavingMethod(): string {
  const methods = [
    '自动转账固定金额',
    '"先存后花"法则',
    '分层储蓄法',
    '递增储蓄法',
    '目标驱动储蓄法',
  ];
  return methods[Math.floor(Math.random() * methods.length)];
}

// 获取储蓄目标预测
function getSavingGoalPrediction(): string {
  const predictions = [
    '一年内可积累3-6个月的生活费用',
    '两年内可达成短期理财目标',
    '三年内可累积一笔可观的应急基金',
    '五年内可为重大目标做准备',
    '长期坚持将大幅改善财务状况',
  ];
  return predictions[Math.floor(Math.random() * predictions.length)];
}
</script>

<template>
  <TouchDialog
    :modelValue="dialogVisible"
    @update:modelValue="dialogVisible = $event"
    position="bottom"
    :heightPercentage="85"
    :closeOnClickOverlay="true"
  >
    <div class="ai-tool-panel">
      <div class="panel-header">
        <div class="header-title">AI 财务助手</div>
        <div class="header-subtitle">由 MuRAG + MCP 技术支持</div>
        <button class="close-btn" @click="dialogVisible = false">
          <div i-carbon-close></div>
        </button>
      </div>

      <div class="panel-content">
        <!-- AI状态区域 -->
        <div class="ai-status-section" v-if="aiThinking">
          <div class="ai-thinking">
            <div i-carbon-ai-status class="icon-pulse"></div>
            <div class="status-text">AI 正在分析您的数据...</div>
            <div class="status-subtext">这可能需要几秒钟时间</div>
          </div>
        </div>

        <!-- AI洞察区域 -->
        <div class="ai-insights-section" v-if="aiReady && aiInsights.length > 0">
          <div class="section-title">
            <div i-carbon-idea class="section-icon"></div>
            <span>智能洞察</span>
          </div>

          <div class="insights-cards">
            <div
              v-for="(insight, idx) in aiInsights"
              :key="idx"
              class="insight-card"
              :class="insight.type"
            >
              <div class="insight-header">
                <div class="insight-title">{{ insight.title }}</div>
                <button class="share-btn" @click="shareInsight(idx)">
                  <div i-carbon-share></div>
                </button>
              </div>
              <div class="insight-content">{{ insight.content }}</div>
            </div>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="ai-chat-section">
          <div class="section-title">
            <div i-carbon-chat class="section-icon"></div>
            <span>智能问答</span>
          </div>

          <div class="chat-history" v-if="queryHistory.length > 0">
            <div
              v-for="query in queryHistory"
              :key="query.id"
              class="chat-item"
            >
              <div class="user-query">
                <div i-carbon-user-avatar class="user-icon"></div>
                <div class="query-content">
                  <div class="query-text">{{ query.query }}</div>
                  <div class="query-time">{{ query.time }}</div>
                </div>
              </div>

              <div class="ai-response" v-if="query.response || query.loading">
                <div i-carbon-ai-status class="ai-icon" :class="{ loading: query.loading }"></div>
                <div class="response-content">
                  <div class="response-text" v-if="query.response">{{ query.response }}</div>
                  <div class="response-loading" v-else>AI 正在思考...</div>
                </div>
              </div>
            </div>
          </div>

          <div class="suggested-queries" v-if="queryHistory.length === 0">
            <div class="suggestion-label">您可以问我:</div>
            <div class="suggestion-chips">
              <button
                v-for="(query, idx) in suggestedQueries"
                :key="idx"
                class="chip-btn"
                @click="selectSuggestedQuery(query)"
              >
                {{ query }}
              </button>
            </div>
          </div>

          <div class="chat-input-area">
            <input
              type="text"
              v-model="userQuery"
              placeholder="输入您的问题..."
              @keyup.enter="handleQuery"
            />
            <button class="send-btn" @click="handleQuery" :disabled="!userQuery.trim()">
              <div i-carbon-send></div>
            </button>
          </div>
        </div>

        <!-- 分析工具区域 -->
        <div class="analysis-tools-section">
          <div class="section-title">
            <div i-carbon-chart-area class="section-icon"></div>
            <span>分析工具</span>
          </div>

          <div class="tool-cards">
            <div class="tool-card">
              <div class="tool-header">
                <div i-carbon-report class="tool-icon"></div>
                <div class="tool-title">生成分析报告</div>
              </div>
              <div class="tool-options">
                <div class="option-row">
                  <div class="option-label">周期:</div>
                  <div class="option-select">
                    <select v-model="reportPeriod">
                      <option value="week">本周</option>
                      <option value="month">本月</option>
                      <option value="year">本年</option>
                      <option value="custom">自定义</option>
                    </select>
                  </div>
                </div>
                <div class="option-row">
                  <div class="option-label">类型:</div>
                  <div class="option-select">
                    <select v-model="reportType">
                      <option value="expense">支出分析</option>
                      <option value="income">收入分析</option>
                      <option value="balance">收支平衡</option>
                      <option value="trend">趋势分析</option>
                    </select>
                  </div>
                </div>
              </div>
              <button class="tool-action-btn" @click="generateReport">
                生成报告
              </button>
            </div>

            <div class="tool-card">
              <div class="tool-header">
                <div i-carbon-machine-learning-model class="tool-icon"></div>
                <div class="tool-title">智能预测</div>
              </div>
              <div class="tool-description">
                基于MCP技术，预测您未来的消费模式和财务状况
              </div>
              <button class="tool-action-btn outlined" @click="selectSuggestedQuery('未来消费趋势预测')">
                启动预测
              </button>
            </div>

            <div class="tool-card">
              <div class="tool-header">
                <div i-carbon-development class="tool-icon"></div>
                <div class="tool-title">多方协同</div>
              </div>
              <div class="tool-description">
                实时同步决策，与家人、理财顾问共同分析财务状况
              </div>
              <button class="tool-action-btn outlined" @click="selectSuggestedQuery('建议如何与家人共同理财')">
                启动协同
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.ai-tool-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  border-radius: 16px 16px 0 0;
  overflow: hidden;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    position: relative;
    text-align: center;

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .header-subtitle {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }

    .close-btn {
      position: absolute;
      right: 16px;
      top: 16px;
      background: none;
      border: none;
      padding: 4px;
      color: var(--el-text-color-regular);
      font-size: 16px;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--el-text-color-primary);

      .section-icon {
        margin-right: 8px;
        color: var(--el-color-primary);
      }
    }

    .ai-status-section {
      .ai-thinking {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 16px;
        background-color: var(--el-fill-color-light);
        border-radius: 12px;

        .icon-pulse {
          font-size: 48px;
          color: var(--el-color-primary);
          animation: pulse 1.5s infinite;
        }

        .status-text {
          margin-top: 16px;
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .status-subtext {
          margin-top: 8px;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .ai-insights-section {
      .insights-cards {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .insight-card {
          padding: 14px;
          border-radius: 10px;
          background-color: var(--el-fill-color-light);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          border-left: 3px solid var(--el-color-primary);

          &.info {
            border-left-color: var(--el-color-primary);
          }

          &.warning {
            border-left-color: var(--el-color-warning);
          }

          &.success {
            border-left-color: var(--el-color-success);
          }

          .insight-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .insight-title {
              font-weight: 500;
              font-size: 14px;
              color: var(--el-text-color-primary);
            }

            .share-btn {
              background: none;
              border: none;
              color: var(--el-text-color-secondary);
              padding: 2px;
              font-size: 14px;
            }
          }

          .insight-content {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
          }
        }
      }
    }

    .ai-chat-section {
      .chat-history {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 16px;

        .chat-item {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .user-query {
            display: flex;
            align-self: flex-end;
            max-width: 85%;

            .user-icon {
              display: none;
            }

            .query-content {
              background-color: var(--el-color-primary-light-8);
              border-radius: 16px 4px 16px 16px;
              padding: 10px 14px;

              .query-text {
                font-size: 14px;
                color: var(--el-text-color-primary);
                word-break: break-word;
              }

              .query-time {
                font-size: 10px;
                color: var(--el-text-color-secondary);
                margin-top: 4px;
                text-align: right;
              }
            }
          }

          .ai-response {
            display: flex;
            align-self: flex-start;
            max-width: 85%;

            .ai-icon {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background-color: var(--el-color-primary);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 8px;
              flex-shrink: 0;

              &.loading {
                animation: pulse 1.5s infinite;
              }
            }

            .response-content {
              background-color: var(--el-fill-color-light);
              border-radius: 4px 16px 16px 16px;
              padding: 12px 16px;

              .response-text {
                font-size: 14px;
                color: var(--el-text-color-primary);
                line-height: 1.4;
                word-break: break-word;
              }

              .response-loading {
                font-size: 14px;
                color: var(--el-text-color-secondary);
                font-style: italic;
              }
            }
          }
        }
      }

      .suggested-queries {
        margin-bottom: 16px;

        .suggestion-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }

        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .chip-btn {
            background-color: var(--el-fill-color-light);
            border: 1px solid var(--el-border-color-lighter);
            border-radius: 16px;
            padding: 6px 12px;
            font-size: 12px;
            color: var(--el-text-color-primary);
            transition: all 0.2s ease;

            &:hover,
            &:active {
              background-color: var(--el-color-primary-light-9);
              border-color: var(--el-color-primary-light-5);
              color: var(--el-color-primary);
            }
          }
        }
      }

      .chat-input-area {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;

        input {
          flex: 1;
          height: 40px;
          border-radius: 20px;
          border: 1px solid var(--el-border-color);
          background-color: var(--el-fill-color-blank);
          padding: 0 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;

          &:focus {
            border-color: var(--el-color-primary);
          }
        }

        .send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background-color: var(--el-color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;

          &:disabled {
            background-color: var(--el-fill-color);
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }

    .analysis-tools-section {
      .tool-cards {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .tool-card {
          padding: 16px;
          border-radius: 12px;
          background-color: var(--el-fill-color-light);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

          .tool-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            .tool-icon {
              width: 24px;
              height: 24px;
              border-radius: 6px;
              background-color: var(--el-color-primary-light-8);
              color: var(--el-color-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 10px;
            }

            .tool-title {
              font-weight: 500;
              font-size: 15px;
              color: var(--el-text-color-primary);
            }
          }

          .tool-description {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            margin-bottom: 12px;
            line-height: 1.4;
          }

          .tool-options {
            margin-bottom: 12px;

            .option-row {
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              .option-label {
                width: 60px;
                font-size: 13px;
                color: var(--el-text-color-regular);
              }

              .option-select {
                flex: 1;

                select {
                  width: 100%;
                  padding: 6px 10px;
                  border: 1px solid var(--el-border-color);
                  border-radius: 6px;
                  background-color: var(--el-fill-color-blank);
                  font-size: 13px;
                  outline: none;
                }
              }
            }
          }

          .tool-action-btn {
            width: 100%;
            padding: 8px 0;
            border-radius: 6px;
            border: none;
            background-color: var(--el-color-primary);
            color: white;
            font-size: 14px;
            font-weight: 500;

            &.outlined {
              background-color: transparent;
              border: 1px solid var(--el-color-primary);
              color: var(--el-color-primary);
            }
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}
</style>
