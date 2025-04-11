<script setup>
import VersionBar from '~/components/chore/VersionBar.vue'
import { globalAuthStorage } from '~/modules/auth'
import { useDevMode } from '~/modules/develop'
import { calendarManager } from '~/modules/words'
import PersonalHeaderDisplay from './PersonalHeaderDisplay.vue'
import PersonalLayout from './PersonalLayout.vue'

const _router = useRouter()
const { _devModeEnabled, toggleDevMode } = useDevMode()

const clickCount = ref(0)
const lastClickTime = ref(0)

function _handleVersionClick() {
  const now = Date.now()

  // 如果两次点击间隔超过1.5秒，重置计数
  if (now - lastClickTime.value > 1500) {
    clickCount.value = 0
  }

  lastClickTime.value = now
  clickCount.value++

  // 连续点击7次后启用开发者模式
  if (clickCount.value === 7) {
    toggleDevMode(true)
    clickCount.value = 0
    // eslint-disable-next-line no-alert
    alert('开发者模式已启用')
  }
}

async function _handleClear() {
  calendarManager.clear()

  await useRequestAnimationFrame()

  // eslint-disable-next-line no-alert
  alert('已清除打卡数据')
}

// 当前VIP选择的索引
const currentVipIndex = ref(0)

// 处理触摸开始事件
const touchStartX = ref(0)

function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
}

// 处理触摸结束事件
function handleTouchEnd(event) {
  const touchEndX = event.changedTouches[0].clientX
  const diffX = touchEndX - touchStartX.value

  // 判断滑动方向
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      handleVipCardSwipe('right')
    } else {
      handleVipCardSwipe('left')
    }
  }
}

// 处理鼠标滚轮事件
function handleWheel(event) {
  if (event.deltaX > 50) {
    handleVipCardSwipe('left')
  } else if (event.deltaX < -50) {
    handleVipCardSwipe('right')
  }
}

// VIP会员版本
const vipPlans = ref([
  {
    id: 0,
    name: '免费版本',
    price: 0,
    color: '#8E9AAF',
    colorLight: '#B8C4DE',
    features: [
      '单笔记账不超过10万',
      '每日不超过30笔记账',
      '每周1次AI分析',
      '只能累计近1个月账单',
    ],
    description: '适合个人简单记账需求',
    icon: 'i-carbon:document',
  },
  {
    id: 1,
    name: '青春版本',
    price: 4.9,
    color: '#5762D5',
    colorLight: '#8892FF',
    features: [
      '无法添加固定资产',
      '无法进行大额投资理财分析',
      '每日1次AI分析',
      '只能累计近1年账单',
    ],
    description: '适合学生及轻度用户',
    icon: 'i-carbon:trending-up',
  },
  {
    id: 2,
    name: '团队版本',
    price: 19.9,
    color: '#0CA678',
    colorLight: '#20C997',
    features: [
      '最多支持10个人',
      '每日10次AI分析',
      '可以自动选择隐藏个人部分资产',
      '分为团队公共资产和个人私有资产',
    ],
    description: '适合小型团队和家庭使用',
    icon: 'i-carbon:group',
  },
  {
    id: 3,
    name: '专业版本',
    price: 199,
    color: '#E67700',
    colorLight: '#FF922B',
    features: [
      '最多支持100个人',
      '每日120次AI分析',
      '拥有团队版本所有功能',
      '教育版本仅需99元/月',
    ],
    description: '适合企业和大型团队',
    icon: 'i-carbon:enterprise',
    isAdvanced: true, // 标记为高级版本
  },
])

// 模拟财务数据
const financialData = ref({
  todayEarnings: 10.00,
  totalEarnings: 400.00,
  assets: 128000.00,
  vipLevel: 1,
  nextVipThreshold: 50000,
})

// 财务卡片
const financialCards = ref([
  {
    id: 1,
    title: '钱包余额',
    amount: 8526.38,
    trend: '+12%',
    icon: 'i-carbon:wallet',
    color: 'var(--theme-color-primary)',
    bgColor: 'rgba(var(--theme-color-rgb), 0.08)',
  },
  {
    id: 2,
    title: '投资总额',
    amount: 120352.60,
    trend: '+3.5%',
    icon: 'i-carbon:chart-line',
    color: '#06a77d',
    bgColor: 'rgba(6, 167, 125, 0.08)',
  },
  {
    id: 3,
    title: '本月支出',
    amount: 3842.75,
    trend: '-5.2%',
    icon: 'i-carbon:shopping-cart',
    color: '#f76707',
    bgColor: 'rgba(247, 103, 7, 0.08)',
  },
])

// 快速操作（暂时保留但在前端隐藏）
const _quickActions = ref([
  {
    name: '转账',
    icon: 'i-carbon-send-alt',
    color: '#5762D5',
    bgColor: 'rgba(87, 98, 213, 0.1)',
  },
  {
    name: '充值',
    icon: 'i-carbon-currency-dollar',
    color: '#0CA678',
    bgColor: 'rgba(12, 166, 120, 0.1)',
  },
  {
    name: '提现',
    icon: 'i-carbon-piggy-bank',
    color: '#E67700',
    bgColor: 'rgba(230, 119, 0, 0.1)',
  },
  {
    name: '账单',
    icon: 'i-carbon-document',
    color: '#F03E3E',
    bgColor: 'rgba(240, 62, 62, 0.1)',
  },
])

// AI功能入口
const aiFeatures = ref([
  {
    name: 'AI记账助手',
    icon: 'i-carbon:ai-status',
    color: '#7048e8',
    description: '智能识别票据，自动记录消费',
  },
  {
    name: 'AI消费分析',
    icon: 'i-carbon:model-alt',
    color: '#1c7ed6',
    description: '分析消费习惯，提供优化建议',
  },
  {
    name: 'AI预算规划',
    icon: 'i-carbon:chat-bot',
    color: '#0ca678',
    description: '智能规划月度预算，控制开支',
  },
  {
    name: 'AI投资顾问',
    icon: 'i-carbon:ibm-consulting-advantage-assistant',
    color: '#ae3ec9',
    description: '基于消费习惯推荐投资方案',
  },
])

// 常用功能
const commonFunctions = ref([
  {
    name: '信用卡',
    icon: 'i-carbon:chart-venn-diagram',
    color: 'var(--theme-color-primary)',
  },
  {
    name: '基金',
    icon: 'i-carbon-chart-line',
    color: '#06a77d',
  },
  {
    name: '保险',
    icon: 'i-carbon-favorite',
    color: '#f59f00',
  },
  {
    name: '理财',
    icon: 'i-carbon-growth',
    color: '#f76707',
  },
  {
    name: '贷款',
    icon: 'i-carbon-document-signed',
    color: 'var(--theme-color-primary)',
  },
  {
    name: '积分',
    icon: 'i-carbon-badge',
    color: '#06a77d',
  },
  {
    name: '优惠券',
    icon: 'i-carbon-ticket',
    color: '#f59f00',
  },
  {
    name: '设置',
    icon: 'i-carbon-settings',
    color: '#f76707',
  },
])

// 滑动VIP卡片
function handleVipCardSwipe(direction) {
  if (direction === 'left' && currentVipIndex.value < vipPlans.value.length - 1) {
    currentVipIndex.value++
  } else if (direction === 'right' && currentVipIndex.value > 0) {
    currentVipIndex.value--
  }
}

// 切换到指定的VIP卡片
function switchToVipPlan(index) {
  currentVipIndex.value = index
}

// 处理鼠标拖拽事件
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

function handleMouseDown(event) {
  isDragging.value = true
  startX.value = event.pageX - event.currentTarget.offsetLeft
  scrollLeft.value = event.currentTarget.scrollLeft
  event.currentTarget.style.cursor = 'grabbing'
}

function handleMouseMove(event) {
  if (!isDragging.value) {
    return
  }
  const x = event.pageX - event.currentTarget.offsetLeft
  const walk = (x - startX.value) * 2
  event.currentTarget.scrollLeft = scrollLeft.value - walk
}

function handleMouseUp(event) {
  isDragging.value = false
  event.currentTarget.style.cursor = 'grab'
}

function handleMouseLeave(event) {
  if (isDragging.value) {
    isDragging.value = false
    event.currentTarget.style.cursor = 'grab'
  }
}

// 修复鼠标点击切换卡片功能
function handleCardClick(index) {
  if (!isDragging.value) {
    switchToVipPlan(index)
  }
}
</script>

<template>
  <PersonalLayout>
    <template #header>
      <PersonalHeaderDisplay>
        <div mt-4 v-if="globalAuthStorage.user" h-full w-full flex px-2 items-center justify-between
          class="header-container">
          <div flex items-center gap-4 class="header-main">
            <div class="header-img" rounded-full>
              <UserAvatar />
            </div>
            <div flex flex-col justify-center class="header-content">
              <p font-size-5 font-bold class="name">
                聚风聚财
                <!-- {{ globalAuthStorage.user.userName || globalAuthStorage.user.id }} -->
              </p>
              <p class="indent-[2px]" font-size-4 op-60>
                个人财务中心
              </p>
            </div>
          </div>

          <div flex justify-end font-size-6 class="header-line">
            <div i-carbon:notification class="notification-icon cursor-pointer mr-4" rounded-full />
            <div i-carbon:settings class="settings-icon cursor-pointer" rounded-full />
          </div>
        </div>
      </PersonalHeaderDisplay>
    </template>
    <template #main>
      <div w-full flex flex-1 flex-col items-center justify-center class="main-container">
        <!-- VIP会员卡滑动区域 -->
        <div class="vip-slider-container">
          <div class="vip-slider-header">
            <span class="vip-slider-title">会员版本</span>
            <div class="vip-indicator">
              <div v-for="(plan, index) in vipPlans" :key="plan.id" class="vip-indicator-dot"
                :class="{ active: index === currentVipIndex }" @click="handleCardClick(index)"></div>
            </div>
          </div>

          <div class="vip-cards-slider"
               @touchstart="handleTouchStart"
               @touchend="handleTouchEnd"
               @wheel="handleWheel"
               @mousedown="handleMouseDown"
               @mousemove="handleMouseMove"
               @mouseup="handleMouseUp"
               @mouseleave="handleMouseLeave">
            <div class="vip-cards-wrapper" :style="`transform: translateX(calc(-${currentVipIndex * 85}% + ${currentVipIndex > 0 ? '12px' : '0px'}))`">
              <div v-for="(plan, index) in vipPlans" :key="plan.id" class="vip-card"
                :class="{ 'active': index === currentVipIndex, 'advanced-card': plan.isAdvanced }"
                :style="`--vip-color: ${plan.color}; --vip-color-light: ${plan.colorLight}`"
                @click="handleCardClick(index)">
                <div class="vip-card-header">
                  <div class="vip-plan-icon rounded-full" :class="plan.icon"></div>
                  <div class="vip-plan-name">{{ plan.name }}</div>
                  <div class="vip-plan-price rounded-full">
                    {{ plan.price > 0 ? `¥${plan.price}/月` : '免费' }}
                  </div>
                </div>
                <div class="vip-card-body">
                  <div class="vip-plan-description">{{ plan.description }}</div>
                  <div class="vip-features">
                    <div v-for="(feature, fIndex) in plan.features" :key="fIndex" class="vip-feature-item">
                      <div class="vip-feature-icon" i-carbon:checkmark-filled></div>
                      <div class="vip-feature-text">{{ feature }}</div>
                    </div>
                  </div>
                </div>
                <div class="vip-card-footer">
                  <button class="vip-action-button rounded-full">
                    {{ index <= financialData.vipLevel ? '当前版本' : '升级' }} </button>
                </div>
                <div v-if="plan.isAdvanced" class="advanced-effects">
                  <div class="glow-effect"></div>
                  <div class="particles"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 财务卡片 -->
        <div class="finance-cards-container">
          <div v-for="card in financialCards" :key="card.id" class="finance-card"
            :style="`--card-color: ${card.color}`" rounded-xl>
            <div class="finance-card-icon" :style="`background-color: ${card.bgColor}`" rounded-lg>
              <div :class="card.icon"></div>
            </div>
            <div class="finance-card-content">
              <div class="finance-card-title">{{ card.title }}</div>
              <div class="finance-card-amount">{{ card.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
              </div>
              <div class="finance-card-trend"
                :class="{ 'trend-up': card.trend.startsWith('+'), 'trend-down': card.trend.startsWith('-') }">
                {{ card.trend }}
              </div>
            </div>
          </div>
        </div>

        <!-- AI功能入口 - 更炫酷的设计 -->
        <div class="section-container ai-features-container" rounded-xl>
          <div class="section-header">
            <div class="section-title">AI智能助手</div>
            <div class="section-more">全部 ></div>
          </div>
          <div class="ai-features-grid">
            <div v-for="(feature, index) in aiFeatures" :key="index" class="ai-feature-item"
              :style="`--feature-color: ${feature.color}`">
              <div class="ai-feature-bg-glow"></div>
              <div class="ai-feature-content">
                <div class="ai-feature-name">{{ feature.name }}</div>
                <div class="ai-feature-description">{{ feature.description }}</div>
              </div>
              <div class="ai-feature-icon-wrapper">
                <div class="ai-feature-icon" :class="feature.icon"></div>
                <div class="ai-feature-shine"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 (已隐藏) -->
        <!-- <div class="section-container" rounded-xl v-if="false">
          <div class="section-header">
            <div class="section-title">快速操作</div>
          </div>
          <div class="quick-actions-grid">
            <div v-for="(action, index) in quickActions" :key="index" class="quick-action-item"
              :style="`--action-color: ${action.color}; --action-bg-color: ${action.bgColor}`">
              <div class="quick-action-icon" :class="action.icon" rounded-xl></div>
              <div class="quick-action-name">{{ action.name }}</div>
            </div>
          </div>
        </div> -->

        <!-- 常用功能 -->
        <div class="section-container" rounded-xl>
          <div class="section-header">
            <div class="section-title">常用功能</div>
            <div class="section-more">全部 ></div>
          </div>
          <div class="functions-grid">
            <div v-for="(func, index) in commonFunctions" :key="index" class="function-item"
              :style="`--func-color: ${func.color}`">
              <div class="function-icon-wrapper" rounded-xl>
                <div class="function-icon" :class="func.icon"></div>
              </div>
              <div class="function-name">{{ func.name }}</div>
            </div>
          </div>
        </div>

        <!-- 财富小贴士 -->
        <div class="tips-container" rounded-xl>
          <div class="tips-header">
            <div class="tips-icon" i-carbon:idea></div>
            <div class="tips-title">财富小贴士</div>
          </div>
          <div class="tips-content">
            <p>投资有风险，理财需谨慎。合理规划个人资产，享受稳健收益。了解更多理财知识，提升财商。</p>
          </div>
        </div>
      </div>
    </template>
  </PersonalLayout>
</template>

<style lang="scss">
.header-container {
  position: relative;
  overflow: hidden;
}

.background-logo {
  position: absolute;
  top: 50%;
  right: 30%;
  transform: translateY(-50%);
  width: 120px;
  height: 120px;
  background-image: url('/assets/images/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.06;
  z-index: 0;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: translateY(-50%) rotate(0deg);
  }

  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

/* 防止文本选择和复制 */
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.header-img {
  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-text-color-primary);
  z-index: 1;

  .light & {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }
}

.header-line {
  z-index: 1;
}

.notification-icon,
.settings-icon {
  position: relative;
  font-size: 24px;
  transition: color 0.2s;

  &:active {
    transform: scale(0.95);
  }
}

.main-container {
  padding: 0 16px 32px;
  background-color: #f8f9fa;

  .dark & {
    background-color: #121212;
  }
}

// VIP滑动容器
.vip-slider-container {
  width: 100%;
  margin: 16px 0 24px;
  position: relative;
}

.vip-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.vip-slider-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  .dark & {
    color: #fff;
  }
}

.vip-indicator {
  display: flex;
  gap: 6px;
}

.vip-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s;

  .dark & {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    width: 20px;
    border-radius: 4px;
    background-color: var(--theme-color-primary);
  }
}

.vip-cards-slider {
  width: 100%;
  overflow: visible;
  position: relative;
  padding: 8px 0;
  cursor: grab;
}

.vip-cards-wrapper {
  display: flex;
  transition: transform 0.3s ease;
  width: 100%;
  gap: 12px;
}

.vip-card {
  min-width: 85%;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--vip-color), var(--vip-color-light));
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: scale(0.95);
  opacity: 0.8;
  transition:
    transform 0.3s,
    opacity 0.3s;
  height: 230px;

  &.active {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  }

  &::before {
    content: '';
    position: absolute;
    top: -15%;
    right: -5%;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: 10%;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  // 高级卡片特效
  &.advanced-card {
    background: linear-gradient(135deg, #ff7e5f, #feb47b);
    position: relative;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(255, 126, 95, 0.25);

    &::before {
      content: '';
      position: absolute;
      top: -15%;
      right: -5%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -15%;
      left: 5%;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
    }

    .vip-plan-icon {
      background: rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }

    .vip-plan-price {
      background: rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .vip-action-button {
      background: rgba(255, 255, 255, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
    }

    &.active {
      transform: scale(1.02);
    }
  }
}

// 高级卡片特效
.advanced-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 25%);
  opacity: 0.2;
  animation: glow 3s infinite alternate;
}

@keyframes glow {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  100% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 0.5%),
    radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 0.5%),
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 0.5%),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 0.5%),
    radial-gradient(circle at 90% 40%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 0.5%);
  animation: float 10s infinite linear;
}

@keyframes float {
  0% {
    background-position:
      0% 0%,
      0% 0%,
      0% 0%,
      0% 0%,
      0% 0%;
  }
  100% {
    background-position:
      20% 100%,
      -30% 70%,
      100% 30%,
      60% -30%,
      100% 100%;
  }
}

.vip-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  z-index: 1;
}

.vip-plan-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  color: #fff;
  font-size: 20px;
}

.vip-plan-name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  flex: 1;
}

.vip-plan-price {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 14px;
  border-radius: 24px;
}

.vip-card-body {
  flex: 1;
  z-index: 1;
}

.vip-plan-description {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 14px;
}

.vip-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vip-feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.vip-feature-icon {
  color: #fff;
  font-size: 14px;
}

.vip-feature-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
}

.vip-card-footer {
  margin-top: 20px;
  z-index: 1;
}

.vip-action-button {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 10px 18px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;

  &:active {
    transform: translateY(0);
  }
}

// 财务卡片
.finance-cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  margin-bottom: 20px;
}

.finance-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  .dark & {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.finance-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--card-color);
  font-size: 16px;
}

.finance-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.finance-card-title {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 6px;

  .dark & {
    color: rgba(255, 255, 255, 0.6);
  }
}

.finance-card-amount {
  font-size: 17px;
  font-weight: 600;
  color: var(--card-color);
  margin-bottom: 4px;
}

.finance-card-trend {
  font-size: 12px;
  font-weight: 500;

  &.trend-up {
    color: #06a77d;
  }

  &.trend-down {
    color: #f76707;
  }
}

// AI功能入口 - 完全重新设计
.ai-features-container {
  margin-bottom: 20px;
  background: rgba(245, 247, 250, 0.8);
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300%;
    height: 300%;
    background: radial-gradient(
      ellipse at center,
      rgba(var(--theme-color-rgb), 0.03) 0%,
      rgba(var(--theme-color-rgb), 0) 70%
    );
    animation: rotate 30s infinite linear;
    z-index: 0;
  }

  .dark & {
    background: rgba(30, 30, 40, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ai-features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  position: relative;
  z-index: 1;
  padding: 0 4px;
}

.ai-feature-item {
  position: relative;
  height: 140px;
  border-radius: 20px;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;

  &:nth-child(1) {
    background: linear-gradient(135deg, #f6f8ff, #f0f4ff);
  }

  &:nth-child(2) {
    background: linear-gradient(135deg, #f0f8ff, #e6f4ff);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, #f0fff4, #e6ffec);
  }

  &:nth-child(4) {
    background: linear-gradient(135deg, #fdf0ff, #f5e5ff);
  }

  &:active {
    transform: scale(0.98) translateY(2px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .dark & {
    background: rgba(40, 40, 50, 0.7);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

    &:nth-child(1) {
      background: linear-gradient(135deg, rgba(87, 98, 213, 0.2), rgba(87, 98, 213, 0.1));
    }

    &:nth-child(2) {
      background: linear-gradient(135deg, rgba(28, 126, 214, 0.2), rgba(28, 126, 214, 0.1));
    }

    &:nth-child(3) {
      background: linear-gradient(135deg, rgba(12, 166, 120, 0.2), rgba(12, 166, 120, 0.1));
    }

    &:nth-child(4) {
      background: linear-gradient(135deg, rgba(174, 62, 201, 0.2), rgba(174, 62, 201, 0.1));
    }
  }
}

.ai-feature-bg-glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--feature-color) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0.15;
  z-index: 0;
  filter: blur(15px);
  animation: pulse-slow 5s infinite alternate;
}

@keyframes pulse-slow {
  0% {
    opacity: 0.1;
    transform: scale(1);
  }
  100% {
    opacity: 0.25;
    transform: scale(1.2);
  }
}

.ai-feature-content {
  position: relative;
  z-index: 1;
  padding-right: 50px;
}

.ai-feature-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--feature-color);
  margin-bottom: 10px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -5px;
    width: 30px;
    height: 3px;
    background: var(--feature-color);
    border-radius: 2px;
    opacity: 0.5;
  }
}

.ai-feature-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;

  .dark & {
    color: rgba(255, 255, 255, 0.7);
  }
}

.ai-feature-icon-wrapper {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 50px;
  height: 50px;
  background: var(--feature-color);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 2;

  .dark & {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
}

.ai-feature-icon {
  color: #fff;
  font-size: 28px;
  position: relative;
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.ai-feature-shine {
  position: absolute;
  top: -50%;
  left: -100%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  animation: shine 4s infinite linear;
  z-index: 1;
}

@keyframes shine {
  0% {
    transform: rotate(30deg) translateX(-200%);
  }
  100% {
    transform: rotate(30deg) translateX(200%);
  }
}

// 区域容器
.section-container {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  .dark & {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    .dark & {
      color: #fff;
    }
  }

  .section-more {
    font-size: 13px;
    color: var(--theme-color-primary);
    cursor: pointer;
  }
}

// 常用功能
.functions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.function-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  background: rgba(var(--theme-color-rgb), 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--func-color), transparent 60%);
    opacity: 0.12;
  }

  .dark & {
    background: rgba(255, 255, 255, 0.08);
  }
}

.function-icon {
  color: var(--func-color);
  font-size: 20px;
  z-index: 1;
}

.function-name {
  font-size: 12px;
  color: var(--el-text-color-primary);

  .dark & {
    color: #fff;
  }
}

// 财富小贴士
.tips-container {
  width: 100%;
  background: linear-gradient(135deg, rgba(var(--theme-color-rgb), 0.05), rgba(var(--theme-color-rgb), 0.15));
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid var(--theme-color-primary);
  box-shadow: 0 4px 12px rgba(var(--theme-color-rgb), 0.1);

  .dark & {
    background: linear-gradient(135deg, rgba(var(--theme-color-rgb), 0.1), rgba(var(--theme-color-rgb), 0.2));
  }
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.tips-icon {
  color: var(--theme-color-primary);
  font-size: 18px;
  margin-right: 8px;
}

.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--theme-color-primary);
}

.tips-content {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;

  .dark & {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
