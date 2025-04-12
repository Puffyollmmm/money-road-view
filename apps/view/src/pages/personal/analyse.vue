<script setup lang="ts">
import { ref } from 'vue'
import PageNavHolder from '~/components/page/holder/PageNavHolder.vue'
import { useLeafEventBus } from '~/composables/event'
import { ElMessage } from 'element-plus'

const eventBus = useLeafEventBus()

interface AnalysisMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingRate: number;
  monthOverMonthChange: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
  }>;
}

interface FinancialInsight {
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info';
  actionable: boolean;
  suggestion: string;
}

const messages = ref<AnalysisMessage[]>([
  {
    id: '1',
    type: 'assistant',
    content: '你好，我是你的个人财务分析助手。我可以帮你分析消费情况、提供财务建议，或者回答你关于个人财务的问题。你想了解什么？',
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: '2',
    type: 'user',
    content: '我想看看我这个月的消费情况',
    timestamp: new Date(Date.now() - 1000 * 60 * 4)
  },
  {
    id: '3',
    type: 'assistant',
    content: '我已为你分析了本月的消费数据。你的总支出为5,320元，相比上月降低了8.5%。主要支出集中在餐饮(33.8%)和购物(22.6%)类别。需要查看详细分析报告吗？',
    timestamp: new Date(Date.now() - 1000 * 60 * 3)
  },
  {
    id: '4',
    type: 'user',
    content: '是的，请给我详细分析',
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: '5',
    type: 'assistant',
    content: '根据你的消费数据，我为你生成了详细的财务分析报告。餐饮支出比上月增加了12%，这是你最大的消费增长点。购物类别中，电子产品占比最高(45%)。你的储蓄率为37.4%，高于同龄人群平均水平。要继续了解如何优化你的支出结构吗？',
    timestamp: new Date(Date.now() - 1000 * 60)
  }
]);

const inputMessage = ref('');
const loading = ref(false);
const showSummary = ref(true);
const financialSummary = ref<FinancialSummary>({
  totalIncome: 8500,
  totalExpense: 5320,
  balance: 3180,
  savingRate: 37.4,
  monthOverMonthChange: -8.5,
  topCategories: [
    { category: '餐饮', amount: 1800, percentage: 33.8, trend: 'up', changePercentage: 12.0 },
    { category: '购物', amount: 1200, percentage: 22.6, trend: 'down', changePercentage: -5.2 },
    { category: '交通', amount: 800, percentage: 15.0, trend: 'stable', changePercentage: 0.8 },
    { category: '住房', amount: 750, percentage: 14.1, trend: 'down', changePercentage: -2.3 },
    { category: '娱乐', amount: 500, percentage: 9.4, trend: 'up', changePercentage: 4.7 }
  ]
});

const financialInsights = ref<FinancialInsight[]>([
  {
    title: '餐饮支出增长显著',
    description: '你的餐饮支出比上月增加了12%，已占总支出的33.8%',
    type: 'warning',
    actionable: true,
    suggestion: '考虑增加自己做饭频率或选择性价比更高的餐厅'
  },
  {
    title: '储蓄率优于同龄人',
    description: '你的储蓄率为37.4%，高于同龄人平均水平(25.3%)',
    type: 'success',
    actionable: false,
    suggestion: '继续保持良好的储蓄习惯'
  },
  {
    title: '购物支出结构不均衡',
    description: '电子产品支出占购物总支出的45%，可能是非必需消费',
    type: 'info',
    actionable: true,
    suggestion: '制定大额购物计划，避免冲动消费'
  }
]);

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function sendMessage(): void {
  if (!inputMessage.value.trim()) return;

  const userMessage: AnalysisMessage = {
    id: generateId(),
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  };

  messages.value.push(userMessage);

  // 清空输入
  inputMessage.value = '';

  // 模拟AI响应
  loading.value = true;

  setTimeout(() => {
    let responseContent = '';

    if (userMessage.content.includes('消费分析') || userMessage.content.includes('财务报告') || userMessage.content.includes('支出情况')) {
      responseContent = '根据你近期的消费数据分析，我发现以下几个关键点：\n\n1. 你的餐饮支出占比33.8%，比上月增加12%，这是最值得关注的变化\n2. 购物类别支出虽然有所下降(-5.2%)，但电子产品消费占比仍然较高\n3. 总体而言，你的月度支出比上月降低了8.5%，这是一个积极的变化\n\n基于这些数据，建议关注餐饮支出的上升趋势，可能需要调整相关预算。';
      showSummary.value = true;
    } else if (userMessage.content.includes('省钱') || userMessage.content.includes('建议') || userMessage.content.includes('如何优化')) {
      responseContent = '基于你的消费模式分析，我有以下省钱建议：\n\n1. 餐饮支出：每周增加2-3次在家做饭的频率，可节省约400元/月\n2. 购物支出：对于电子产品，建立"想要"vs"需要"清单，延迟大额购买决定至少7天\n3. 交通支出：可考虑拼车服务，每月可节省约100元\n4. 订阅服务：检查未使用的订阅服务，取消不必要的付费项目\n\n实施这些策略，预计每月可以额外节省600-800元。';
    } else if (userMessage.content.includes('预算') || userMessage.content.includes('计划') || userMessage.content.includes('怎么规划')) {
      responseContent = '根据你的收入和消费模式，这是我为你制定的下月预算计划：\n\n• 基本生活支出(50%)：4250元\n  - 住房：1700元 (20%)\n  - 餐饮：1450元 (17%，比当前减少350元)\n  - 交通：700元 (8.2%)\n  - 日用品：400元 (4.7%)\n\n• 储蓄/投资(30%)：2550元\n  - 紧急备用金：850元 (10%)\n  - 长期投资：1700元 (20%)\n\n• 自由支配(20%)：1700元\n  - 购物：850元 (10%)\n  - 娱乐：425元 (5%)\n  - 学习：425元 (5%)\n\n这个计划保持了37.4%的高储蓄率，同时优化了餐饮和购物支出。需要调整吗？';
    } else if (userMessage.content.includes('投资') || userMessage.content.includes('理财')) {
      responseContent = '基于你的财务状况和37.4%的储蓄率，我推荐以下投资配置方案：\n\n1. 应急基金(30%)：易于获取的活期储蓄或货币基金\n2. 低风险投资(40%)：\n   - 定期存款：15%\n   - 国债/政府债券：15%\n   - 低风险理财产品：10%\n3. 中等风险投资(25%)：\n   - 指数基金：15%\n   - 混合型基金：10%\n4. 高风险投资(5%)：个股或行业ETF\n\n这种配置方案平衡了安全性和收益性，适合你当前的财务状况。要了解更详细的投资产品建议吗？';
    } else if (userMessage.content.includes('收入') || userMessage.content.includes('增加收入') || userMessage.content.includes('赚钱')) {
      responseContent = '根据你的技能背景分析，以下是增加收入的几种可能途径：\n\n1. 主业优化：了解行业薪资标准，评估加薪可能性或寻找更高薪职位\n2. 副业发展：利用专业技能接自由职业项目，预估每月可增加收入1000-2000元\n3. 技能投资：学习市场需求高的新技能，如数据分析或特定软件认证\n4. 被动收入：考虑将部分储蓄用于发展被动收入，如创建数字产品或内容\n\n选择最适合你时间和能力的方案，建议从单一渠道开始，避免精力过度分散。';
    } else if (userMessage.content.includes('比较') || userMessage.content.includes('同龄人') || userMessage.content.includes('平均水平')) {
      responseContent = '与同龄同收入群体相比，你的财务状况分析如下：\n\n• 优势指标：\n  - 储蓄率：37.4% (高于平均水平25.3%)\n  - 总支出：收入的62.6% (低于平均水平74.7%)\n  - 投资配置多样性：超过65%的同龄人\n\n• 需改进指标：\n  - 餐饮支出：收入的21.2% (高于平均水平16.8%)\n  - 购物支出：收入的14.1% (高于平均水平12.3%)\n\n总体而言，你的财务健康状况优于70%的同龄人，重点应放在优化餐饮和购物支出上。';
    } else {
      responseContent = '我分析了你最近三个月的消费数据，发现以下财务洞察：\n\n1. 消费模式：周末消费占总支出的42%，其中餐饮和娱乐是主要类别\n2. 异常支出：本月在电子产品上的支出比平均水平高出215%\n3. 订阅服务：你有6项每月订阅服务，总计238元，其中2项使用频率较低\n4. 季节性支出：即将进入你历史上消费较高的季度，建议提前规划预算\n\n需要我在某个具体方面提供更深入的分析吗？';
    }

    const assistantMessage: AnalysisMessage = {
      id: generateId(),
      type: 'assistant',
      content: responseContent,
      timestamp: new Date()
    };

    messages.value.push(assistantMessage);
    loading.value = false;

    // 自动滚动到底部
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }, 1500);
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function toggleSummary(): void {
  showSummary.value = !showSummary.value;
}

// 转换趋势为图标
function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'up': return '↑';
    case 'down': return '↓';
    case 'stable': return '→';
    default: return '';
  }
}

// 获取趋势颜色类
function getTrendClass(trend: string): string {
  switch (trend) {
    case 'up': return 'text-red-500';
    case 'down': return 'text-green-500';
    case 'stable': return 'text-gray-500';
    default: return '';
  }
}
</script>

<template>
  <PageNavHolder :content-padding="false" class="h-full" title="Deep财务分析">
    <div class="h-full w-full flex flex-col bg-gray-50 relative">
      <!-- 消息列表 -->
      <div class="flex-1 overflow-y-auto px-4 py-3 scroll-smooth">
        <div v-for="message in messages" :key="message.id" class="mb-4">
          <div class="flex flex-col" :class="message.type === 'user' ? 'items-end' : 'items-start'">
            <div class="max-w-[85%] p-3 rounded-lg shadow-sm"
                :class="message.type === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'">
              <div class="whitespace-pre-line">{{ message.content }}</div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="loading" class="flex items-center ml-2 mt-2">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>

      <!-- 财务摘要卡片 -->
      <div v-if="showSummary" class="mx-4 my-3 p-4 bg-white rounded-lg shadow-md relative">
        <div class="absolute top-2 right-2">
          <button @click="toggleSummary" class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100">
            <i class="i-carbon-close text-gray-500"></i>
          </button>
        </div>

        <h3 class="text-lg font-semibold mb-3">本月财务摘要</h3>

        <!-- 财务指标卡片 -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="p-2 text-center rounded-md bg-green-50">
            <div class="text-green-600 font-bold text-xl">{{ financialSummary.totalIncome }}¥</div>
            <div class="text-sm text-gray-500">收入</div>
          </div>
          <div class="p-2 text-center rounded-md bg-red-50">
            <div class="text-red-600 font-bold text-xl">{{ financialSummary.totalExpense }}¥</div>
            <div class="text-sm text-gray-500">支出</div>
          </div>
          <div class="p-2 text-center rounded-md bg-blue-50">
            <div class="text-blue-600 font-bold text-xl">{{ financialSummary.balance }}¥</div>
            <div class="text-sm text-gray-500">结余</div>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-gray-50 mb-4">
          <div class="flex justify-between items-center mb-1">
            <div class="text-sm">月同比变化</div>
            <div :class="financialSummary.monthOverMonthChange < 0 ? 'text-green-500' : 'text-red-500'" class="font-medium">
              {{ financialSummary.monthOverMonthChange }}%
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm">储蓄率</div>
            <div class="text-blue-600 font-medium">{{ financialSummary.savingRate }}%</div>
          </div>
        </div>

        <h4 class="text-md font-medium mb-2">主要支出类别</h4>
        <div class="">
          <div v-for="(category, index) in financialSummary.topCategories" :key="index" class="mb-3">
            <div class="flex justify-between mb-1">
              <span>{{ category.category }}</span>
              <div class="flex items-center">
                <span class="font-medium mr-2">{{ category.amount }}¥ ({{ category.percentage }}%)</span>
                <span :class="getTrendClass(category.trend)" class="text-xs">
                  {{ getTrendIcon(category.trend) }} {{ category.changePercentage }}%
                </span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full" :style="`width: ${category.percentage}%`"
                :class="index === 0 ? 'bg-indigo-600' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-blue-400' :
                        index === 3 ? 'bg-blue-300' : 'bg-blue-200'"></div>
            </div>
          </div>
        </div>

        <!-- 财务洞察 -->
        <div class="mt-4">
          <h4 class="text-md font-medium mb-2">财务洞察</h4>
          <div v-for="(insight, index) in financialInsights" :key="index"
               class="p-3 rounded-lg mb-2 border-l-4"
               :class="insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                       insight.type === 'success' ? 'border-green-500 bg-green-50' :
                       'border-blue-500 bg-blue-50'">
            <div class="font-medium mb-1">{{ insight.title }}</div>
            <div class="text-sm text-gray-700">{{ insight.description }}</div>
            <div v-if="insight.actionable" class="text-sm font-medium mt-1 text-indigo-600">
              建议: {{ insight.suggestion }}
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="p-4 border-t border-gray-200 bg-white">
        <div class="flex rounded-lg border border-gray-300 overflow-hidden">
          <textarea
            v-model="inputMessage"
            class="flex-1 px-3 py-2 outline-none resize-none min-h-[44px] max-h-[120px]"
            placeholder="问我有关你的财务情况..."
            rows="1"
            @keydown="handleKeyDown"
          ></textarea>
          <button
            @click="sendMessage"
            class="bg-blue-500 text-white px-4 flex items-center justify-center"
            :disabled="!inputMessage.trim()"
            :class="!inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'"
          >
            <i class="i-carbon-send mr-1"></i>
            发送
          </button>
        </div>
        <div class="text-xs text-gray-500 mt-1 px-2">提示：尝试询问"我的消费分析"、"如何优化支出"、"制定预算计划"或"与同龄人比较"</div>
      </div>
    </div>
  </PageNavHolder>
</template>

<style>
/* 仅保留必要的自定义样式，其余由UnoCSS提供 */
.animate-bounce {
  animation: bounce 1.4s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
