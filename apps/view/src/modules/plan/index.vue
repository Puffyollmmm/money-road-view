<script setup lang="ts">
import { useGlobalSplashState } from '~/modules/splash/index'
import PlanLayout from './PlanLayout.vue'

const router = useRouter()
const _router = router // 避免未使用变量的警告

// 定义主题色变量
const themeColor = "var(--el-color-primary)"

// 金融资产数据
const myAsset = ref("0.00")
const yesterdayProfit = ref("+0.00")

// 股指数据
const stockIndex = ref("3218.57")
const stockChange = ref("-0.16%")

// 金融产品类别
const financeCategories = [
  { icon: 'i-carbon-piggy-bank', name: '活期+' },
  { icon: 'i-carbon-chart-line', name: '稳健理财' },
  { icon: 'i-carbon-chart-area', name: '基金' },
  { icon: 'i-carbon-chart-candlestick', name: '股票' },
  { icon: 'i-carbon-diamond-outline', name: '黄金' },
  { icon: 'i-carbon-chart-high-low', name: '定期+' },
  { icon: 'i-carbon-umbrella', name: '储蓄保险' },
  { icon: 'i-carbon-group', name: '大家盘' },
  { icon: 'i-carbon-add-alt', name: '自选' },
  { icon: 'i-carbon-menu', name: '更多' },
]

// 天气预报
const weatherForecast = [
  { day: '3日', icon: 'i-carbon-sun', temp: '' },
  { day: '7日', icon: 'i-carbon-sun', temp: '' },
  { day: '8日', icon: 'i-carbon-cloud-rain', temp: '' },
  { day: '9日', icon: 'i-carbon-sun', temp: '' },
  { day: '10日', icon: 'i-carbon-sun', temp: '' },
]
</script>

<template>
  <PlanLayout>
    <div class="bg-header px-4 top-0 relative">
      <div class="sticky top-0 z-20 px-4 bg-header">
        <div class="flex items-center bg-white dark:bg-dark-300 rounded-full px-3 py-2">
          <div i-carbon-search class="text-gray-400 dark:text-gray-500 mr-2"></div>
          <span class="flex-1 text-sm text-gray-400 dark:text-gray-500">申购费1折起</span>
          <div class="text-sm font-bold text-primary">搜索</div>
        </div>
      </div>

      <div class="px-4 py-3">
        <div class="flex justify-between">
          <div>
            <div class="text-xs text-white/80 dark:text-white/70 mb-1">我的资产(元)</div>
            <div class="text-2xl font-bold text-white">{{ myAsset }}</div>
          </div>
          <div>
            <div class="text-xs text-white/80 dark:text-white/70 mb-1 text-right">昨日收益(元)</div>
            <div class="text-2xl font-bold text-white text-right">{{ yesterdayProfit }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 金融产品分类 -->
    <div class="grid grid-cols-5 px-4 py-3 bg-light dark:bg-dark-100">
      <div v-for="(category, index) in financeCategories" :key="index" class="flex flex-col items-center mb-4"
        v-show="index < 10">
        <div class="w-10 h-10 mb-2 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
          <div :class="[category.icon, 'text-xl text-primary']"></div>
        </div>
        <div class="text-xs text-text-primary dark:text-dark-text-primary">{{ category.name }}</div>
      </div>
    </div>

    <!-- 债市晴雨 -->
    <div class="mx-4 my-3 p-4 rounded-lg bg-white dark:bg-dark-200 shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <span class="font-bold text-text-primary dark:text-dark-text-primary">债市晴雨</span>
        <div i-carbon-chevron-right class="text-gray-400 dark:text-gray-500"></div>
      </div>
      <div class="flex justify-between">
        <div v-for="(weather, index) in weatherForecast" :key="index" class="flex flex-col items-center">
          <div :class="[weather.icon, 'text-xl text-warning mb-1']"></div>
          <div class="text-xs text-text-regular dark:text-dark-text-regular">{{ weather.day }}</div>
        </div>
      </div>
    </div>

    <!-- 股市行情 -->
    <div class="mx-4 my-3 p-4 rounded-lg bg-white dark:bg-dark-200 shadow-sm">
      <div class="flex justify-between items-center">
        <span class="font-bold text-text-primary dark:text-dark-text-primary">股市行情</span>
        <div class="flex-1 text-right mr-2">
          <span class="text-sm text-text-regular dark:text-dark-text-regular">上证指数</span>
          <span class="text-sm text-primary mx-1">{{ stockIndex }}</span>
          <span class="text-sm text-success">{{ stockChange }}</span>
        </div>
        <div i-carbon-chevron-right class="text-gray-400 dark:text-gray-500"></div>
      </div>
    </div>

    <!-- DeepSeek AI 助手 -->
    <div class="mx-4 my-3 p-4 rounded-lg bg-white dark:bg-dark-200 shadow-sm">
      <div class="mb-2 font-bold text-text-primary dark:text-dark-text-primary">问问DeepSeek</div>
      <div>
        <div class="text-sm mb-2 text-text-regular dark:text-dark-text-regular">
          问<span class="text-danger">DeepSeek+金融AI</span>，金融推理更专业
        </div>
        <div class="p-4 rounded-lg bg-primary/10 dark:bg-primary/15">
          <div class="text-center font-bold text-primary mb-3">DeepSeek + 金融AI助理</div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="flex items-center gap-2 bg-white dark:bg-dark-100 rounded-full px-3 py-2 text-sm">
              <div i-carbon-chart-candlestick class="text-primary"></div>
              <span class="text-text-primary dark:text-dark-text-primary">满仓R1</span>
            </div>
            <div class="flex items-center gap-2 bg-white dark:bg-dark-100 rounded-full px-3 py-2 text-sm">
              <div i-carbon-book class="text-primary"></div>
              <span class="text-text-primary dark:text-dark-text-primary">行情解读</span>
            </div>
            <div class="flex items-center gap-2 bg-white dark:bg-dark-100 rounded-full px-3 py-2 text-sm">
              <div i-carbon-search class="text-primary"></div>
              <span class="text-text-primary dark:text-dark-text-primary">基金扫雷</span>
            </div>
            <div class="flex items-center gap-2 bg-white dark:bg-dark-100 rounded-full px-3 py-2 text-sm">
              <div i-carbon-chart-line class="text-primary"></div>
              <span class="text-text-primary dark:text-dark-text-primary">股票分析</span>
            </div>
          </div>
          <button class="w-full text-center text-primary font-bold py-2">前往提问</button>
        </div>
      </div>
    </div>
  </PlanLayout>
</template>

<style>
:root {
  --bg-header: var(--theme-color);
}

.bg-header {
  background-color: var(--bg-header);
}

.text-primary {
  color: var(--theme-color);
}

.text-danger {
  color: var(--el-color-danger);
}

.text-success {
  color: var(--el-color-success);
}

.text-warning {
  color: var(--el-color-warning);
}

.text-text-primary {
  color: var(--el-text-color-primary);
}

.text-text-regular {
  color: var(--el-text-color-regular);
}

.dark .dark-text-primary {
  color: var(--el-text-color-primary);
}

.dark .dark-text-regular {
  color: var(--el-text-color-regular);
}

.bg-light {
  background-color: var(--el-bg-color-page);
}

.dark .bg-dark-100 {
  background-color: var(--el-bg-color);
}

.dark .bg-dark-200 {
  background-color: var(--el-bg-color-overlay);
}

.dark .bg-dark-300 {
  background-color: var(--el-fill-color-darker);
}
</style>
