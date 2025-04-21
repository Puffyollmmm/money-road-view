<script setup lang="ts">
import { ref, watch } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface FilterOptions {
  categories: string[];
  dateRange: [string, string] | null;
  amountRange: [number, number] | null;
  type: 'all' | 'income' | 'expense';
}

const props = defineProps<{
  visible: boolean;
  expenseCategories: { name: string; icon: string; color: string[] }[];
  incomeCategories: { name: string; icon: string; color: string[] }[];
  activeFilters: FilterOptions;
  searchKeyword: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'update:searchKeyword', value: string): void;
  (e: 'update:activeFilters', value: FilterOptions): void;
  (e: 'executeSmartQuery', query: string): void;
}>();

// 内部状态
const localKeyword = ref(props.searchKeyword);
const localFilters = ref<FilterOptions>({ ...props.activeFilters });
const smartQueryHistory = ref<{
  query: string;
  timestamp: number;
}[]>([
  { query: '上个月消费最多的类别', timestamp: Date.now() - 86400000 },
  { query: '本月比上月多花了多少钱', timestamp: Date.now() - 172800000 },
  { query: '本月餐饮消费趋势', timestamp: Date.now() - 259200000 },
]);
const showAdvancedFilters = ref(false);
const queryProcessing = ref(false);

// 智能查询建议
const smartQuerySuggestions = [
  { query: '本月支出对比上月增长了多少?', icon: 'i-carbon-chart-line' },
  { query: '我的哪个类别消费最多?', icon: 'i-carbon-pie-chart' },
  { query: '本月有哪些异常消费?', icon: 'i-carbon-warning' },
  { query: '如何合理节省开支?', icon: 'i-carbon-idea' },
  { query: '制定下个月的预算', icon: 'i-carbon-calculator' },
];

// 同步外部与内部状态
watch(() => props.searchKeyword, (val) => {
  localKeyword.value = val;
});

watch(() => props.activeFilters, (val) => {
  localFilters.value = { ...val };
}, { deep: true });

// 执行基本搜索
function executeSearch() {
  emit('update:searchKeyword', localKeyword.value);
  emit('update:activeFilters', localFilters.value);
}

// 重置筛选条件
function resetFilters() {
  localFilters.value = {
    categories: [],
    dateRange: null,
    amountRange: null,
    type: 'all',
  };
  executeSearch();
}

// 更新筛选类型
function updateFilterType(type: 'all' | 'income' | 'expense') {
  localFilters.value.type = localFilters.value.type === type ? 'all' : type;
  executeSearch();
}

// 切换类别筛选
function toggleCategoryFilter(category: string) {
  const index = localFilters.value.categories.indexOf(category);
  if (index === -1) {
    localFilters.value.categories.push(category);
  } else {
    localFilters.value.categories.splice(index, 1);
  }
  executeSearch();
}

// 执行智能查询
function executeSmartQuery(query: string) {
  // 添加到历史记录
  if (!smartQueryHistory.value.some(item => item.query === query)) {
    smartQueryHistory.value.unshift({
      query,
      timestamp: Date.now(),
    });
    // 保持最多5条历史记录
    if (smartQueryHistory.value.length > 5) {
      smartQueryHistory.value.pop();
    }
  }

  // 显示处理状态
  queryProcessing.value = true;
  localKeyword.value = query;

  // 通知父组件执行智能查询
  emit('executeSmartQuery', query);

  // 模拟处理时间
  setTimeout(() => {
    queryProcessing.value = false;
    emit('update:visible', false);
  }, 1500);
}

// 格式化日期显示
function formatDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);

  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    return '今天';
  }

  // 如果是昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }

  // 否则显示完整日期
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}
</script>

<template>
  <TouchDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" active>
    <template #Main v-if="visible">
      <div class="search-panel">
        <div class="search-header">
          <button class="close-btn" @click="emit('update:visible', false)">
            <div i-carbon-close></div>
          </button>
          <div class="search-input-container">
            <div class="search-icon"
                 :class="queryProcessing ? 'i-carbon-ai-status rotating' : 'i-carbon-search'"></div>
            <input
              type="text"
              v-model="localKeyword"
              placeholder="搜索账单或输入智能查询"
              class="search-input"
              autofocus
              @keyup.enter="executeSearch"
            />
            <button v-if="localKeyword" class="clear-btn" @click="localKeyword = ''">
              <div i-carbon-close-filled></div>
            </button>
          </div>
        </div>

        <div class="quick-filters">
          <button
            class="filter-chip"
            :class="{ active: localFilters.type === 'expense' }"
            @click="updateFilterType('expense')"
          >
            仅支出
          </button>
          <button
            class="filter-chip"
            :class="{ active: localFilters.type === 'income' }"
            @click="updateFilterType('income')"
          >
            仅收入
          </button>
          <button
            class="filter-chip"
            :class="{ active: showAdvancedFilters }"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            高级筛选
            <div :class="showAdvancedFilters ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'" class="icon"></div>
          </button>
          <button
            class="filter-chip reset"
            @click="resetFilters"
          >
            清除筛选
          </button>
        </div>

        <!-- 高级筛选选项 -->
        <div class="advanced-filters" v-if="showAdvancedFilters">
          <div class="filter-section">
            <div class="filter-title">支出类别</div>
            <div class="filter-options">
              <button
                v-for="category in expenseCategories"
                :key="category.name"
                class="category-chip"
                :class="{ active: localFilters.categories.includes(category.name) }"
                @click="toggleCategoryFilter(category.name)"
              >
                <div :class="category.icon" class="category-icon" :style="{
                  backgroundImage: `linear-gradient(135deg, ${category.color[0]}, ${category.color[1]})`,
                }"></div>
                <span>{{ category.name }}</span>
              </button>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-title">收入类别</div>
            <div class="filter-options">
              <button
                v-for="category in incomeCategories"
                :key="category.name"
                class="category-chip"
                :class="{ active: localFilters.categories.includes(category.name) }"
                @click="toggleCategoryFilter(category.name)"
              >
                <div :class="category.icon" class="category-icon" :style="{
                  backgroundImage: `linear-gradient(135deg, ${category.color[0]}, ${category.color[1]})`,
                }"></div>
                <span>{{ category.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 历史智能查询 -->
        <div class="query-history" v-if="smartQueryHistory.length > 0">
          <div class="section-title">历史查询</div>
          <div class="history-items">
            <div
              v-for="(item, index) in smartQueryHistory"
              :key="index"
              class="history-item"
              @click="executeSmartQuery(item.query)"
            >
              <div i-carbon-recently-viewed class="history-icon"></div>
              <div class="history-content">
                <div class="history-query">{{ item.query }}</div>
                <div class="history-time">{{ formatDate(item.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 智能查询建议 -->
        <div class="smart-queries">
          <div class="section-title">智能查询</div>
          <div class="query-suggestions">
            <div
              v-for="(suggestion, index) in smartQuerySuggestions"
              :key="index"
              class="query-item"
              @click="executeSmartQuery(suggestion.query)"
            >
              <div :class="suggestion.icon" class="query-icon"></div>
              <span>{{ suggestion.query }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TouchDialog>
</template>

<style lang="scss" scoped>
.search-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search-header {
    padding: 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .close-btn {
      border: none;
      background: none;
      padding: 8px;
      margin-right: 8px;
      font-size: 16px;
      color: var(--el-text-color-secondary);
    }

    .search-input-container {
      flex: 1;
      display: flex;
      align-items: center;
      background-color: var(--el-fill-color-light);
      border-radius: 20px;
      padding: 8px 12px;

      .search-icon {
        color: var(--el-text-color-secondary);
        margin-right: 8px;

        &.rotating {
          color: #8a69f6;
          animation: spin 1.5s linear infinite;
        }
      }

      .search-input {
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        font-size: 14px;
      }

      .clear-btn {
        border: none;
        background: none;
        padding: 4px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .quick-filters {
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .filter-chip {
      border: 1px solid var(--el-border-color);
      background-color: var(--el-bg-color);
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      display: flex;
      align-items: center;

      .icon {
        margin-left: 4px;
        font-size: 10px;
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }

      &.reset {
        margin-left: auto;
        color: var(--el-color-danger);
        border-color: var(--el-color-danger-light-5);
      }
    }
  }

  .advanced-filters {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .filter-section {
      margin-bottom: 16px;

      .filter-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--el-text-color-primary);
      }

      .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .category-chip {
          display: flex;
          align-items: center;
          border: 1px solid var(--el-border-color);
          background-color: var(--el-bg-color);
          border-radius: 16px;
          padding: 6px 10px;
          font-size: 12px;

          .category-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            margin-right: 4px;
          }

          &.active {
            background-color: var(--el-color-primary-light-9);
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    padding: 0 16px;
    color: var(--el-text-color-secondary);
  }

  .query-history {
    padding-top: 16px;

    .history-items {
      padding: 0 16px 16px;

      .history-item {
        display: flex;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        background-color: var(--el-fill-color-light);
        border-radius: 8px;

        .history-icon {
          color: var(--el-color-info);
          margin-right: 10px;
          font-size: 18px;
        }

        .history-content {
          flex: 1;

          .history-query {
            font-size: 14px;
            color: var(--el-text-color-primary);
          }

          .history-time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 2px;
          }
        }
      }
    }
  }

  .smart-queries {
    padding-top: 8px;
    flex: 1;
    overflow-y: auto;

    .query-suggestions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 0 16px 16px;

      .query-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: var(--el-bg-color);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border-left: 3px solid #8a69f6;

        .query-icon {
          color: #8a69f6;
          margin-right: 12px;
          font-size: 18px;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
