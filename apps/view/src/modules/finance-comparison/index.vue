<script setup lang="ts">
import FinanceLayout from './FinanceLayout.vue'

// 财务服务优势数据
const advantages = [
  {
    id: 1,
    category: '个性化建议',
    traditional: {
      title: '传统财务工具',
      points: [
        '基于通用模板，缺乏针对性',
        '无法根据用户实际情况调整',
        '无法持续跟踪和优化',
      ],
    },
    ours: {
      title: '我们的财务服务',
      points: [
        '不是简单的模板化建议',
        '完全基于用户实际情况',
        '持续跟踪调整优化方案',
      ],
    },
    icon: 'i-carbon-user-profile',
    color: '#3b82f6',
  },
  {
    id: 2,
    category: '可执行性',
    traditional: {
      title: '传统财务工具',
      points: [
        '提供笼统的建议，缺乏具体步骤',
        '目标设定模糊，难以执行',
      ],
    },
    ours: {
      title: '我们的财务服务',
      points: [
        '提供具体的行动步骤',
        '设置合理的执行目标',
        '配套必要的工具支持',
      ],
    },
    icon: 'i-carbon-task',
    color: '#10b981',
  },
  {
    id: 3,
    category: '服务闭环',
    traditional: {
      title: '传统财务工具',
      points: [
        '仅提供表面的数据分析',
        '缺乏持续性和深度',
      ],
    },
    ours: {
      title: '我们的财务服务',
      points: [
        '从诊断到执行再到优化',
        '覆盖财务管理的全流程',
        '形成持续改进的正循环',
      ],
    },
    icon: 'i-carbon-loop',
    color: '#6366f1',
  },
]

// 技术支柱数据
const techPillars = [
  {
    id: 1,
    title: '智能数据聚合引擎',
    description: '实时收集和整合多渠道财务数据，提供全面、准确的资产视图',
    icon: 'i-carbon-data-vis-1',
    color: 'rgb(59, 130, 246)',
    animation: 'animate-float-slow',
  },
  {
    id: 2,
    title: '深度行为分析模型',
    description: '通过AI算法分析用户财务行为模式，识别风险点和优化机会',
    icon: 'i-carbon-model-alt',
    color: 'rgb(16, 185, 129)',
    animation: 'animate-float-medium',
  },
  {
    id: 3,
    title: '个性化推荐系统',
    description: '基于用户个人情况提供定制化财务建议和投资策略',
    icon: 'i-carbon-chart-custom',
    color: 'rgb(99, 102, 241)',
    animation: 'animate-float-fast',
  },
]

// 模拟AI生成的财务建议
const aiInsights = ref([
  {
    id: 1,
    title: '收入分配优化',
    description: '根据您的消费习惯，建议调整每月储蓄比例从15%提升至20%，以加速实现您的退休目标。',
    category: '储蓄策略',
    confidence: 0.89,
  },
  {
    id: 2,
    title: '投资组合分析',
    description: '您的投资过于集中在科技股，建议增加10%的价值型股票配置，以降低波动风险。',
    category: '风险管理',
    confidence: 0.92,
  },
  {
    id: 3,
    title: '税务规划建议',
    description: '利用税收递延账户可为您每年节省约¥8,500税金，同时提升长期投资收益。',
    category: '税务优化',
    confidence: 0.87,
  },
])

// 模拟渐进式加载效果
const isLoading = ref(true)
const showPillars = ref(false)
const showComparison = ref(false)
const showInsights = ref(false)

// 模拟AI分析进行中的效果
setTimeout(() => {
  isLoading.value = false
  showPillars.value = true

  setTimeout(() => {
    showComparison.value = true

    setTimeout(() => {
      showInsights.value = true
    }, 500)
  }, 300)
}, 800)
</script>

<template>
  <FinanceLayout>
    <div class="px-4 pt-3 pb-20">
      <!-- 标题区域 -->
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          AI财务资产分析系统
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          智能·个性化·全流程财务管理
        </p>
      </div>

      <!-- 加载动画 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">
          AI引擎分析中...
        </p>
      </div>

      <!-- 三大技术支柱 -->
      <div v-if="showPillars" class="mb-8 transition-all duration-500 transform translate-y-0 opacity-100"
           :class="{ 'translate-y-10 opacity-0': !showPillars }">
        <h2 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          <div class="i-carbon-ai-status mr-2 text-primary"></div>
          三大技术支柱
        </h2>

        <div class="grid gap-4">
          <div v-for="pillar in techPillars" :key="pillar.id"
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md"
              :class="pillar.animation">

            <!-- AI元素装饰 -->
            <div class="absolute -right-4 -bottom-4 w-20 h-20 opacity-10" :style="`color: ${pillar.color}`">
              <div :class="pillar.icon" class="text-5xl"></div>
            </div>

            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                   :style="`background-color: ${pillar.color}20`">
                <div :class="pillar.icon" class="text-xl" :style="`color: ${pillar.color}`"></div>
              </div>
              <h3 class="font-bold text-gray-800 dark:text-white">{{ pillar.title }}</h3>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-300 pl-13">
              {{ pillar.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 财务优势对比表 -->
      <div v-if="showComparison" class="mb-8 transition-all duration-500 transform translate-y-0 opacity-100"
           :class="{'translate-y-10 opacity-0': !showComparison}">
        <h2 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          <div class="i-carbon-chart-comparison mr-2 text-primary"></div>
          财务优势对比
        </h2>

        <div v-for="advantage in advantages" :key="advantage.id" class="mb-6 last:mb-0">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                 :style="`background-color: ${advantage.color}20`">
              <div :class="advantage.icon" :style="`color: ${advantage.color}`"></div>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">{{ advantage.category }}</h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- 传统财务工具 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h4 class="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                {{ advantage.traditional.title }}
              </h4>
              <ul class="space-y-2">
                <li v-for="(point, idx) in advantage.traditional.points" :key="idx"
                    class="flex items-start text-xs text-gray-600 dark:text-gray-400">
                  <div class="i-carbon-close-filled text-red-500 mr-2 flex-shrink-0 mt-0.5"></div>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>

            <!-- 我们的财务服务 -->
            <div class="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 rounded-xl p-4 shadow-sm relative overflow-hidden border border-primary/10">
              <div class="absolute top-0 right-0 w-6 h-6 bg-primary/10 flex items-center justify-center rounded-bl-lg">
                <div class="i-carbon-ai-status text-primary text-xs"></div>
              </div>

              <h4 class="text-sm font-bold mb-3 text-primary">
                {{ advantage.ours.title }}
              </h4>
              <ul class="space-y-2">
                <li v-for="(point, idx) in advantage.ours.points" :key="idx"
                    class="flex items-start text-xs text-gray-700 dark:text-gray-200">
                  <div class="i-carbon-checkmark-filled text-green-500 mr-2 flex-shrink-0 mt-0.5"></div>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- AI个性化洞察示例 -->
      <div v-if="showInsights" class="transition-all duration-500 transform translate-y-0 opacity-100"
           :class="{'translate-y-10 opacity-0': !showInsights}">
        <h2 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          <div class="i-carbon-machine-learning-model mr-2 text-primary"></div>
          AI个性化洞察示例
        </h2>

        <div class="space-y-4">
          <div v-for="insight in aiInsights" :key="insight.id"
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-primary">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-gray-800 dark:text-white">{{ insight.title }}</h3>
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <div class="i-carbon-ai-status mr-1 text-primary"></div>
                可信度: {{ (insight.confidence * 100).toFixed(0) }}%
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {{ insight.description }}
            </p>

            <div class="flex items-center justify-between">
              <div class="text-xs py-1 px-2 bg-primary/10 text-primary rounded-full">
                {{ insight.category }}
              </div>
              <button class="text-xs text-primary flex items-center">
                <span>查看详情</span>
                <div class="i-carbon-arrow-right ml-1"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 服务平台介绍 -->
      <div class="mt-8 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl p-4 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-40 h-40 opacity-10">
          <div class="i-carbon-data-vis-4 text-primary text-9xl"></div>
        </div>

        <h2 class="text-lg font-bold mb-2 text-gray-800 dark:text-white">AI个人财务管理平台</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
          在数字化时代，我们的AI平台通过集成自动化记账、智能预算和个性化投资建议，为您提供高效、安全且透明的财务管理服务。
        </p>

        <div class="flex justify-between items-center">
          <div class="flex space-x-1">
            <div class="i-carbon-security text-primary"></div>
            <div class="i-carbon-certificate text-primary"></div>
            <div class="i-carbon-privacy text-primary"></div>
          </div>
          <button class="bg-primary text-white text-sm px-4 py-2 rounded-full flex items-center">
            <span>立即体验</span>
            <div class="i-carbon-arrow-right ml-1"></div>
          </button>
        </div>
      </div>
    </div>
  </FinanceLayout>
</template>

<style>
.animate-float-slow {
  animation: float 6s ease-in-out infinite;
}

.animate-float-medium {
  animation: float 5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.animate-float-fast {
  animation: float 4s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.text-primary {
  color: var(--theme-color);
}

.bg-primary {
  background-color: var(--theme-color);
}

.border-primary {
  border-color: var(--theme-color);
}
</style>
