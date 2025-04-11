<script setup lang="ts">
import { showDialog, showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from "vue-router"
import TouchDialog from '~/components/dialog/TouchDialog.vue'
import BillAddPanel from './components/BillAddPanel.vue'
import BillHeader from './components/BillHeader.vue'
import BillList from './components/BillList.vue'
import DataOverview from './components/DataOverview.vue'

defineOptions({
  name: 'BillPage',
  meta: {
    transition: 'nav',
  },
})

// 账单数据类型定义
interface BillItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}

// 分类数据
const expenseCategories = [
  { name: '餐饮', icon: 'i-carbon:cafe', color: ['#02D9B2', '#01BDB4'] },
  { name: '购物', icon: 'i-carbon:shopping-cart', color: ['#B392F2', '#8A69F6'] },
  { name: '交通', icon: 'i-carbon:bus', color: ['#20DF9F', '#13D77F'] },
  { name: '娱乐', icon: 'i-carbon:game-console', color: ['#FFA9E8', '#FD82D0'] },
  { name: '居家', icon: 'i-carbon:home', color: ['#FEAA06', '#FF7C01'] },
  { name: '医疗', icon: 'i-carbon:medicine', color: ['#FE4794', '#FF4B50'] },
  { name: '教育', icon: 'i-carbon:book', color: ['#0DB2B3', '#0B7B8A'] },
  { name: '旅行', icon: 'i-carbon:airport-01', color: ['#FE0000', '#F30102'] },
  { name: '社交', icon: 'i-carbon:group', color: ['#0FDEFE', '#00B4FE'] },
  { name: '其他', icon: 'i-carbon:asterisk', color: ['#FBDC03', '#FEB601'] },
];

const incomeCategories = [
  { name: '工资', icon: 'i-carbon:money', color: ['#02D9B2', '#01BDB4'] },
  { name: '奖金', icon: 'i-carbon:gift', color: ['#B392F2', '#8A69F6'] },
  { name: '兼职', icon: 'i-carbon:time', color: ['#20DF9F', '#13D77F'] },
  { name: '投资', icon: 'i-carbon:chart-line', color: ['#FFA9E8', '#FD82D0'] },
  { name: '其他', icon: 'i-carbon:add-alt', color: ['#FEAA06', '#FF7C01'] },
];

// 账单状态管理
const bills = ref<BillItem[]>([]);
const currentDate = ref(new Date().toISOString().split('T')[0]);
const selectedMonth = ref(new Date().toISOString().substring(0, 7));
const showAddPanel = ref(false);
const showDataOverview = ref(false);
const showAiAssistant = ref(false);
const aiSuggestion = ref('');

// 计算属性：本月收入总额
const monthlyIncome = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'income' && bill.date.startsWith(selectedMonth.value))
    .reduce((sum, bill) => sum + bill.amount, 0);
});

// 计算属性：本月支出总额
const monthlyExpense = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'expense' && bill.date.startsWith(selectedMonth.value))
    .reduce((sum, bill) => sum + bill.amount, 0);
});

// 计算属性：本月余额
const monthlyBalance = computed(() => {
  return monthlyIncome.value - monthlyExpense.value;
});

// 计算属性：按月筛选的账单
const filteredBills = computed(() => {
  return bills.value
    .filter(bill => bill.date.startsWith(selectedMonth.value))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 分组账单，按日期
const groupedBills = computed(() => {
  const groups: Record<string, BillItem[]> = {};

  for (const bill of filteredBills.value) {
    if (!groups[bill.date]) {
      groups[bill.date] = [];
    }
    groups[bill.date].push(bill);
  }

  return Object.entries(groups).sort((a, b) =>
    new Date(b[0]).getTime() - new Date(a[0]).getTime(),
  );
});

// 获取分类信息
function getCategoryInfo(categoryName: string, type: 'income' | 'expense') {
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  return categories.find(cat => cat.name === categoryName) || categories[categories.length - 1];
}

// 添加新账单
function addBill(billData: { type: 'income' | 'expense'; category: string; amount: number; date: string; note: string }) {
  const newBill: BillItem = {
    id: Date.now().toString(),
    ...billData,
  };

  bills.value.push(newBill);
  saveBills();
  showToast('添加成功');
}

// 删除账单
function deleteBill(id: string) {
  showDialog({
    title: '确认删除',
    message: '确定要删除这条账单记录吗？',
    showCancelButton: true,
  }).then(() => {
    bills.value = bills.value.filter(bill => bill.id !== id);
    saveBills();
    showToast('删除成功');
  });
}

// 保存账单数据到本地存储
function saveBills() {
  localStorage.setItem('bills', JSON.stringify(bills.value));
}

// 从本地存储加载账单数据
function loadBills() {
  const savedBills = localStorage.getItem('bills');
  if (savedBills) {
    bills.value = JSON.parse(savedBills);
  }
}

// 切换月份
function changeMonth(delta: number) {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  let newMonth = month + delta;
  let newYear = year;

  if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  }

  selectedMonth.value = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
}

// 生成AI消费建议
function generateAiSuggestions() {
  // 这里可以接入实际的AI接口，现在用模拟数据
  const categories = filteredBills.value
    .filter(bill => bill.type === 'expense')
    .reduce((acc, bill) => {
      if (!acc[bill.category]) {
        acc[bill.category] = 0;
      }
      acc[bill.category] += bill.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    const topCategory = sortedCategories[0][0];
    const topAmount = sortedCategories[0][1];

    aiSuggestion.value = `本月您在"${topCategory}"上花费最多，共计¥${topAmount.toFixed(2)}。建议适当控制该类支出，每月可节省约¥${(topAmount * 0.2).toFixed(2)}。`;
  } else {
    aiSuggestion.value = '暂无足够数据生成消费建议，请继续记录您的支出。';
  }

  showAiAssistant.value = true;
}

// 页面加载时从本地存储中获取数据
onMounted(() => {
  loadBills();
});

// 路由实例 - 预留供后续使用
const _router = useRouter();

// 底部导航栏配置
const tabbarItems = [
  { name: '账单', icon: 'i-carbon-document', active: true },
  { name: '理财', icon: 'i-carbon-chart-evaluation' },
  { name: '我的', icon: 'i-carbon-user-avatar' },
];
</script>

<template>
  <WithPage class="bill-container">
    <!-- 头部统计区域 -->
    <BillHeader
      :selectedMonth="selectedMonth"
      :monthlyIncome="monthlyIncome"
      :monthlyExpense="monthlyExpense"
      :monthlyBalance="monthlyBalance"
      @changeMonth="changeMonth"
      @openDataOverview="showDataOverview = true"
    />

    <!-- 账单列表 -->
    <BillList
      :groupedBills="groupedBills"
      :getCategoryInfo="getCategoryInfo"
      @deleteBill="deleteBill"
    />

    <!-- 功能按钮区 -->
    <div class="function-buttons">
      <div class="function-button stats" @click="showDataOverview = true">
        <div i-carbon-chart-line></div>
      </div>
      <div class="function-button add" @click="showAddPanel = true">
        <div i-carbon-add></div>
      </div>
      <div class="function-button ai" @click="generateAiSuggestions()">
        <div i-carbon-ai-status></div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="tabbar">
      <div v-for="(tab, index) in tabbarItems" :key="index" class="tab-item" :class="{ active: tab.active }">
        <div :class="tab.icon"></div>
        <div class="tab-name">{{ tab.name }}</div>
      </div>
    </div>

    <!-- 添加账单面板 -->
    <BillAddPanel
      v-model:visible="showAddPanel"
      :currentDate="currentDate"
      :expenseCategories="expenseCategories"
      :incomeCategories="incomeCategories"
      @addBill="addBill"
    />

    <!-- 数据总览面板 -->
    <DataOverview
      v-model:visible="showDataOverview"
      :bills="filteredBills"
      :selectedMonth="selectedMonth"
      :monthlyIncome="monthlyIncome"
      :monthlyExpense="monthlyExpense"
    />

    <!-- AI助手弹窗 -->
    <TouchDialog v-model="showAiAssistant" title="智能理财助手">
      <template #Main>
        <div class="ai-assistant">
          <div class="ai-icon">
            <div i-carbon-ai-status class="pulse"></div>
          </div>
          <div class="ai-message">
            {{ aiSuggestion }}
          </div>
          <div class="ai-actions">
            <button class="ai-button" @click="showAiAssistant = false">知道了</button>
          </div>
        </div>
      </template>
    </TouchDialog>
  </WithPage>
</template>

<style lang="scss">
.bill-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: var(--el-bg-color-page, #f5f5f5);
  color: var(--el-text-color-primary);
}

.function-buttons {
  position: fixed;
  bottom: 70px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;

  .function-button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(0);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:active {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    &.add {
      background-image: linear-gradient(135deg, #13d77f, #02d9b2);
      font-size: 24px;
    }

    &.stats {
      background-image: linear-gradient(135deg, #ffa9e8, #fd82d0);
      font-size: 18px;
    }

    &.ai {
      background-image: linear-gradient(135deg, #b392f2, #8a69f6);
    }
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  z-index: 9;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
    font-size: 22px;

    .tab-name {
      font-size: 12px;
      margin-top: 2px;
    }

    &.active {
      color: var(--el-color-primary);
    }
  }
}

.ai-assistant {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .ai-icon {
    font-size: 48px;
    color: #8a69f6;
    margin-bottom: 16px;

    .pulse {
      animation: pulse 2s infinite;
    }
  }

  .ai-message {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 24px;
    color: var(--el-text-color-primary);
  }

  .ai-actions {
    margin-top: 16px;

    .ai-button {
      background-image: linear-gradient(135deg, #b392f2, #8a69f6);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 24px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(138, 105, 246, 0.3);
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

<route lang="yaml">
meta:
  transition: nav
</route>
