<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { showDialog, showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from "vue-router"
import TouchDialog from '~/components/dialog/TouchDialog.vue'
import AiAssistantPanel from './components/AiAssistantPanel.vue'
import AiToolPanel from './components/AiToolPanel.vue'
import BillAddPanel from './components/BillAddPanel.vue'
import BillHeader from './components/BillHeader.vue'
import BillImportPanel from './components/BillImportPanel.vue'
import BillList from './components/BillList.vue'
import BookSwitchPanel from './components/BookSwitchPanel.vue'
import BookTagPanel from './components/BookTagPanel.vue'
import CollaboratorsPanel from './components/CollaboratorsPanel.vue'
import DataOverview from './components/DataOverview.vue'
import SearchPanel from './components/SearchPanel.vue'
import UserManagementPanel from './components/UserManagementPanel.vue'

defineOptions({
  name: 'BillPage',
  meta: {
    transition: 'nav',
  },
})

// 账单数据类型定义
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

// 定义账本接口
interface BookItem {
  id: string;
  name: string;
  description?: string;
  color: string[];
  icon: string;
  ownerId: string;
  collaborators: Array<{
    id: string;
    name: string;
    avatar?: string;
    permission: 'read' | 'write' | 'admin';
    joinedAt: string;
  }>;
  createdAt: string;
  tags?: string[];
  tagColors?: string[][];
  budget?: number;
  period?: 'month' | 'week' | 'year';
  note?: string;
}

// 协作者数据类型定义
interface CollaboratorItem {
  id: string;
  name: string;
  avatar?: string;
  permission: 'read' | 'write' | 'admin';
  joinedAt: string;
}

// 分类数据
const expenseCategories = [
  { name: '餐饮', icon: 'i-carbon:cafe', color: ['#02D9B2', '#01BDB4'] },
  { name: '购物', icon: 'i-carbon:shopping-cart', color: ['#B392F2', '#8A69F6'] },
  { name: '交通', icon: 'i-carbon:bus', color: ['#20DF9F', '#13D77F'] },
  { name: '娱乐', icon: 'i-carbon:game-console', color: ['#FFA9E8', '#FD82D0'] },
  { name: '居家', icon: 'i-carbon:home', color: ['#FEAA06', '#FF7C01'] },
  { name: '医疗', icon: 'i-carbon:health-cross', color: ['#FE4794', '#FF4B50'] },
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

// 路由实例
const route = useRoute();
const router = useRouter();

// 账单状态管理
const bills = ref<BillItem[]>([]);
const currentDate = ref(new Date().toISOString().split('T')[0]);
const selectedMonth = ref(new Date().toISOString().substring(0, 7));
const showAddPanel = ref(false);
const showImportPanel = ref(false);
const showDataOverview = ref(false);
const showAiAssistant = ref(false);
const showBookSwitchPanel = ref(false);
const showCollaboratorsPanel = ref(false);
const showSearchPanel = ref(false);
const showBookTagPanel = ref(false);
const showUserManagementPanel = ref(false);
const searchKeyword = ref('');
const activeFilters = ref<{
  categories: string[];
  dateRange: [string, string] | null;
  amountRange: [number, number] | null;
  type: 'all' | 'income' | 'expense';
}>({
  categories: [],
  dateRange: null,
  amountRange: null,
  type: 'all',
});
const syncStatus = ref<'synced' | 'syncing' | 'offline'>('synced');
const showNotifications = ref(false);
const notifications = ref<{
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  createdAt: string;
  read: boolean;
}[]>([]);

// 关键数据洞察
const keyInsights = ref<{
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  changePercentage: number;
}[]>([]);

// 账本管理
const books = ref<BookItem[]>([]);
const currentBookId = ref<string>('');
const currentUser = ref({
  id: 'user1',
  name: '当前用户',
  avatar: '',
});

// AI状态和建议
const aiAnalysisStatus = ref<'idle' | 'analyzing' | 'ready'>('idle');
const aiSuggestions = ref<string[]>([]);
const aiInsights = ref<{
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
}[]>([]);

// 账本加载状态
const loadingBooks = ref(false);

// 计算属性：当前账本
const currentBook = computed(() => {
  return books.value.find(book => book.id === currentBookId.value) || null;
});

// 计算属性：当前账本的账单
const currentBookBills = computed(() => {
  return bills.value.filter(bill => bill.bookId === currentBookId.value);
});

// 计算属性：本月收入总额
const monthlyIncome = computed(() => {
  return currentBookBills.value
    .filter(bill => bill.type === 'income' && bill.date.startsWith(selectedMonth.value))
    .reduce((sum, bill) => sum + bill.amount, 0);
});

// 计算属性：本月支出总额
const monthlyExpense = computed(() => {
  return currentBookBills.value
    .filter(bill => bill.type === 'expense' && bill.date.startsWith(selectedMonth.value))
    .reduce((sum, bill) => sum + bill.amount, 0);
});

// 计算属性：本月余额
const monthlyBalance = computed(() => {
  return monthlyIncome.value - monthlyExpense.value;
});

// 计算属性：过滤后的账单
const filteredBills = computed(() => {
  let result = currentBookBills.value
    .filter(bill => bill.date.startsWith(selectedMonth.value));

  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(bill =>
      bill.category.toLowerCase().includes(keyword) ||
      bill.note.toLowerCase().includes(keyword),
    );
  }

  // 根据过滤条件进行过滤
  if (activeFilters.value.type !== 'all') {
    result = result.filter(bill => bill.type === activeFilters.value.type);
  }

  if (activeFilters.value.categories.length > 0) {
    result = result.filter(bill => activeFilters.value.categories.includes(bill.category));
  }

  if (activeFilters.value.dateRange) {
    const [start, end] = activeFilters.value.dateRange;
    result = result.filter(bill => bill.date >= start && bill.date <= end);
  }

  if (activeFilters.value.amountRange) {
    const [min, max] = activeFilters.value.amountRange;
    result = result.filter(bill => bill.amount >= min && bill.amount <= max);
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 计算支出分类数据
const expenseByCategory = computed(() => {
  const categories = filteredBills.value
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
      percentage: (amount / monthlyExpense.value * 100).toFixed(1),
    }));
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
    bookId: currentBookId.value,
    ...billData,
    createdBy: currentUser.value.id,
    lastModified: new Date().toISOString(),
  };

  bills.value.push(newBill);
  saveBills();
  showToast('添加成功');

  // 触发AI分析
  if (aiAnalysisStatus.value === 'idle') {
    analyzeExpensePattern();
  }
}

// 导入账单
function importBills(importedBills: Array<{ type: 'income' | 'expense'; category: string; amount: number; date: string; note: string; source: string }>) {
  // 将每个导入的账单添加到账单列表
  for (const billData of importedBills) {
    const newBill: BillItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 10),
      bookId: currentBookId.value,
      type: billData.type,
      category: billData.category,
      amount: billData.amount,
      date: billData.date,
      note: billData.note ? `${billData.note} (来自${billData.source})` : `来自${billData.source}`,
      createdBy: currentUser.value.id,
      lastModified: new Date().toISOString(),
    };

    bills.value.push(newBill);
  }

  saveBills();

  // 触发AI分析
  analyzeExpensePattern();
}

// 打开导入面板
function openImportPanel(): void {
  showAddPanel.value = false;
  showImportPanel.value = true;
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

// 保存账本数据到本地存储
function saveBooks() {
  localStorage.setItem('books', JSON.stringify(books.value));
}

// 从本地存储加载账单数据
function loadBills() {
  const savedBills = localStorage.getItem('bills');
  if (savedBills) {
    bills.value = JSON.parse(savedBills);
  }
}

// 从本地存储加载账本数据
function loadBooks() {
  const savedBooks = localStorage.getItem('books');
  if (savedBooks) {
    books.value = JSON.parse(savedBooks);
  } else {
    // 默认创建一个账本
    createDefaultBook();
  }
}

// 创建默认账本
function createDefaultBook() {
  const defaultBook: BookItem = {
    id: 'default',
    name: '默认账本',
    description: '自动创建的默认账本',
    color: ['#02D9B2', '#01BDB4'],
    icon: 'i-carbon:notebook',
    ownerId: currentUser.value.id,
    collaborators: [
      {
        id: 'collaborator1',
        name: '张三',
        avatar: '',
        permission: 'write',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'collaborator2',
        name: '李四',
        avatar: '',
        permission: 'read',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'collaborator3',
        name: '王五',
        avatar: '',
        permission: 'admin',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'collaborator4',
        name: '赵六',
        avatar: '',
        permission: 'read',
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    tags: ['日常', '个人'],
    tagColors: [['#8A69F6', '#B392F2'], ['#13D77F', '#20DF9F']],
    budget: 5000,
    period: 'month',
  };

  books.value.push(defaultBook);
  currentBookId.value = defaultBook.id;
  saveBooks();
}

// 切换账本
function switchBook(bookId: string) {
  currentBookId.value = bookId;
  showBookSwitchPanel.value = false;

  // 更新URL参数
  router.replace({ query: { ...route.query, bookId } });

  // 重置AI分析状态
  aiAnalysisStatus.value = 'idle';
  aiSuggestions.value = [];
  aiInsights.value = [];
}

// 处理更新账本信息
async function handleUpdateBook(bookData: { id: string; note?: string }): Promise<void> {
  try {
    // 更新本地数据
    const bookIndex = books.value.findIndex(book => book.id === bookData.id);
    if (bookIndex !== -1) {
      books.value[bookIndex] = { ...books.value[bookIndex], ...bookData };
      saveBooks(); // 保存到本地存储
    }

    // 显示成功消息
    ElMessage.success('账本信息已更新');
  } catch (error) {
    ElMessage.error('更新账本信息失败');
    console.error('更新账本信息失败:', error);
  }
}

// 处理创建账本
function createBook(bookData: {
  name: string;
  description?: string;
  color: string[];
  icon: string;
  tags?: string[];
  tagColors?: string[][];
  budget?: number;
  period?: 'month' | 'week' | 'year';
  note?: string;
}): void {
  loadingBooks.value = true;

  try {
    // 本地模拟创建账本
    const newBook = {
      id: `book_${Date.now()}`,
      ...bookData,
      ownerId: currentUser.value.id,
      collaborators: [
        {
          id: 'collaborator1',
          name: '张三',
          avatar: '',
          permission: 'write',
          joinedAt: new Date().toISOString(),
        },
        {
          id: 'collaborator2',
          name: '李四',
          avatar: '',
          permission: 'read',
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    books.value.push(newBook);
    currentBookId.value = newBook.id;
    saveBooks(); // 保存到本地存储

    ElMessage.success('账本创建成功');
  } catch (error) {
    ElMessage.error('创建账本失败');
    console.error('创建账本失败:', error);
  } finally {
    loadingBooks.value = false;
  }
}

// 添加协作者
function addCollaborator(collaborator: Omit<CollaboratorItem, 'joinedAt'>) {
  if (!currentBook.value) {
    return;
  }

  const newCollaborator: CollaboratorItem = {
    ...collaborator,
    joinedAt: new Date().toISOString(),
  };

  const bookIndex = books.value.findIndex(book => book.id === currentBookId.value);
  if (bookIndex >= 0) {
    books.value[bookIndex].collaborators.push(newCollaborator);
    saveBooks();
    showToast('协作者添加成功');
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

// 分析消费模式 (MuRAG技术模拟)
function analyzeExpensePattern() {
  aiAnalysisStatus.value = 'analyzing';

  // 模拟AI分析过程
  setTimeout(() => {
    // 生成AI洞察
    generateAiInsights();
    aiAnalysisStatus.value = 'ready';
  }, 2000);
}

// 生成AI洞察 (基于MuRAG和MCP)
function generateAiInsights() {
  // 模拟AI生成的洞察
  if (filteredBills.value.length > 0) {
    // 分析消费类别
    const expenseCategories = filteredBills.value
      .filter(bill => bill.type === 'expense')
      .reduce((acc, bill) => {
        acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
        return acc;
      }, {} as Record<string, number>);

    // 找出最大消费类别
    const sortedCategories = Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const percentage = Math.round((topAmount / monthlyExpense.value) * 100);

      aiInsights.value = [
        {
          title: '消费模式分析',
          content: `本月${topCategory}支出占比${percentage}%，是最主要的支出类别。`,
          type: 'info',
        },
      ];

      // 生成建议
      if (percentage > 50) {
        aiInsights.value.push({
          title: '优化建议',
          content: `${topCategory}支出占比过高，建议适当控制此类支出。`,
          type: 'warning',
        });
      }

      // 根据收支比例生成建议
      const incomeExpenseRatio = monthlyIncome.value / (monthlyExpense.value || 1);
      if (incomeExpenseRatio < 1.2) {
        aiInsights.value.push({
          title: '收支平衡警告',
          content: '本月收支比例偏低，建议控制支出或增加收入来源。',
          type: 'warning',
        });
      } else if (incomeExpenseRatio > 2) {
        aiInsights.value.push({
          title: '资产配置建议',
          content: '本月有较多结余，可考虑适当理财增值。',
          type: 'success',
        });
      }
    }
  } else {
    aiInsights.value = [
      {
        title: '数据不足',
        content: '当前月份无账单数据，无法生成分析。',
        type: 'info',
      },
    ];
  }
}

// 生成AI消费建议
function _generateAiSuggestions() {
  // 直接打开AI助手面板
  showAiAssistant.value = true;

  // 如果还没有分析，先进行分析
  if (aiAnalysisStatus.value === 'idle') {
    analyzeExpensePattern();
  }
}

// 生成关键数据洞察
function generateKeyInsights() {
  // 获取上个月的数据进行对比
  const currentMonthParts = selectedMonth.value.split('-');
  const currentMonthInt = Number.parseInt(currentMonthParts[1], 10);
  const currentYearInt = Number.parseInt(currentMonthParts[0], 10);

  let prevMonth = currentMonthInt - 1;
  let prevYear = currentYearInt;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const prevMonthStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;

  // 计算上个月的收支情况
  const prevMonthExpense = currentBookBills.value
    .filter(bill => bill.type === 'expense' && bill.date.startsWith(prevMonthStr))
    .reduce((sum, bill) => sum + bill.amount, 0);

  const prevMonthIncome = currentBookBills.value
    .filter(bill => bill.type === 'income' && bill.date.startsWith(prevMonthStr))
    .reduce((sum, bill) => sum + bill.amount, 0);

  // 计算变化百分比
  const expenseChange = prevMonthExpense > 0
    ? ((monthlyExpense.value - prevMonthExpense) / prevMonthExpense * 100)
    : 0;

  const incomeChange = prevMonthIncome > 0
    ? ((monthlyIncome.value - prevMonthIncome) / prevMonthIncome * 100)
    : 0;

  // 生成关键洞察
  keyInsights.value = [
    {
      title: '月度支出',
      value: monthlyExpense.value.toFixed(2),
      trend: expenseChange > 0 ? 'up' : expenseChange < 0 ? 'down' : 'neutral',
      changePercentage: Math.abs(expenseChange),
    },
    {
      title: '月度收入',
      value: monthlyIncome.value.toFixed(2),
      trend: incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'neutral',
      changePercentage: Math.abs(incomeChange),
    },
    {
      title: '最大支出',
      value: expenseByCategory.value.length > 0 ? expenseByCategory.value[0].category : '无',
      trend: 'neutral',
      changePercentage: expenseByCategory.value.length > 0
        ? Number(expenseByCategory.value[0].percentage)
        : 0,
    },
  ];
}

// 多用户协同状态更新
function handleCollaborationUpdate(update: { userId: string; action: string; data: any }) {
  // 更新消息通知
  notifications.value.unshift({
    id: Date.now().toString(),
    type: 'info',
    message: `${update.userId} ${update.action}`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  // 更新界面同步状态
  syncStatus.value = 'syncing';

  // 模拟同步完成
  setTimeout(() => {
    syncStatus.value = 'synced';
  }, 1000);
}

// 初始化消息通知
function initNotifications() {
  // 示例通知
  notifications.value = [
    {
      id: '1',
      type: 'info',
      message: '账本数据已同步',
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'success',
      message: '协作者张三已加入账本',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
  ];
}

// 监听路由参数变化
watch(() => route.query.bookId, (newBookId) => {
  if (newBookId && typeof newBookId === 'string') {
    const bookExists = books.value.some(book => book.id === newBookId);
    if (bookExists) {
      currentBookId.value = newBookId;
    }
  }
}, { immediate: true });

// 页面加载时从本地存储中获取数据
onMounted(() => {
  loadBooks();
  loadBills();

  // 如果URL中有bookId参数，使用该参数
  const bookIdFromUrl = route.query.bookId;
  if (bookIdFromUrl && typeof bookIdFromUrl === 'string') {
    const bookExists = books.value.some(book => book.id === bookIdFromUrl);
    if (bookExists) {
      currentBookId.value = bookIdFromUrl;
    }
  } else if (books.value.length > 0 && !currentBookId.value) {
    // 否则使用第一个账本
    currentBookId.value = books.value[0].id;
  }

  // 初始化通知
  initNotifications();

  // 生成关键指标
  generateKeyInsights();

  // 定期更新同步状态，模拟实时协作
  setInterval(() => {
    if (Math.random() > 0.7) {
      handleCollaborationUpdate({
        userId: ['用户A', '用户B', '用户C'][Math.floor(Math.random() * 3)],
        action: ['添加了账单', '修改了账单', '删除了账单'][Math.floor(Math.random() * 3)],
        data: {},
      });
    }
  }, 30000);
});

// 监听账单数据变化，更新关键指标
watch([monthlyIncome, monthlyExpense], () => {
  generateKeyInsights();
});

// 底部导航栏配置
const tabbarItems = [
  { name: '账单', icon: 'i-carbon-document', active: true, path: '/bill' },
  { name: '理财', icon: 'i-carbon-chart-evaluation', active: false, path: '/finance' },
  { name: '报告', icon: 'i-carbon-report-data', active: false, path: '/report' },
  { name: '我的', icon: 'i-carbon-user-avatar', active: false, path: '/profile' },
];

// 处理智能查询
function handleSmartQuery(query: string) {
  // 简单处理一些预设的查询
  if (query.includes('消费最多的类别')) {
    const topCategory = expenseByCategory.value.length > 0 ? expenseByCategory.value[0] : null;

    if (topCategory) {
      showToast(`${selectedMonth.value}月消费最多的是${topCategory.category}，共支出${topCategory.amount.toFixed(2)}元，占比${topCategory.percentage}%`);
    } else {
      showToast('当前没有足够的消费数据');
    }
  }
  else if (query.includes('比上月多花了多少')) {
    // 获取上个月
    const currentMonthParts = selectedMonth.value.split('-');
    const currentMonthInt = Number.parseInt(currentMonthParts[1], 10);
    const currentYearInt = Number.parseInt(currentMonthParts[0], 10);

    let prevMonth = currentMonthInt - 1;
    let prevYear = currentYearInt;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const prevMonthStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;

    const prevMonthExpense = currentBookBills.value
      .filter(bill => bill.type === 'expense' && bill.date.startsWith(prevMonthStr))
      .reduce((sum, bill) => sum + bill.amount, 0);

    const diff = monthlyExpense.value - prevMonthExpense;
    const percentage = prevMonthExpense > 0 ? (diff / prevMonthExpense * 100).toFixed(1) : '∞';

    if (diff > 0) {
      showToast(`本月比上月多支出${diff.toFixed(2)}元，增长${percentage}%`);
    } else {
      showToast(`本月比上月少支出${Math.abs(diff).toFixed(2)}元，减少${Math.abs(Number(percentage))}%`);
    }
  }
  else if (query.includes('餐饮消费趋势')) {
    // 显示数据图表
    showDataOverview.value = true;
    showToast('已为您打开消费趋势分析');
  }
  // 可以扩展更多智能查询...
  else {
    // 未识别的查询，使用AI助手
    showAiAssistant.value = true;
    showToast('正在使用AI助手分析您的问题...');
  }
}

// 打开AI工具面板
function openAiTool() {
  showAiAssistant.value = true;

  // 如果还没有分析，先进行分析
  if (aiAnalysisStatus.value === 'idle') {
    analyzeExpensePattern();
  }
}

// 同步数据
function syncData() {
  syncStatus.value = 'syncing';

  // 模拟同步操作
  setTimeout(() => {
    syncStatus.value = 'synced';

    notifications.value.unshift({
      id: Date.now().toString(),
      type: 'success',
      message: '数据同步成功',
      createdAt: new Date().toISOString(),
      read: false,
    });

    showToast('数据同步成功');
  }, 1500);
}

// 处理生成报告
function handleGenerateReport(options: { period: string; type: string }) {
  showToast(`生成${options.period}${options.type}报告`);

  // 根据选项打开数据概览或执行特定分析
  if (options.type === 'trend') {
    // 打开趋势分析视图
    showDataOverview.value = true;
  } else {
    // 可以实现更多定制化报告功能
    analyzeExpensePattern();
  }
}

// 处理分享洞察
function handleShareInsight(insightIndex: number) {
  if (insightIndex >= 0 && insightIndex < aiInsights.value.length) {
    const insight = aiInsights.value[insightIndex];

    // 模拟分享操作
    showToast(`已分享: ${insight.title}`);

    // 添加通知
    notifications.value.unshift({
      id: Date.now().toString(),
      type: 'info',
      message: `您分享了"${insight.title}"给协作者`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
}

// 获取协作者头像背景色
function getCollaboratorColor(userId: string): string {
  const colors = [
    '#8A69F6', // 紫色
    '#13D77F', // 绿色
    '#FF7C01', // 橙色
    '#FD82D0', // 粉色
    '#01BDB4', // 青色
  ];

  // 根据用户ID的哈希值选择一个颜色
  const hashCode = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return colors[hashCode % colors.length];
}

// 处理更新账本标签
function handleUpdateBookTags(bookId: string, tags: string[], tagColors: string[][]): void {
  try {
    // 更新本地数据
    const bookIndex = books.value.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
      books.value[bookIndex].tags = tags;
      books.value[bookIndex].tagColors = tagColors;
      saveBooks(); // 保存到本地存储
    }

    // 显示成功消息
    ElMessage.success('账本标签已更新');
  } catch (error) {
    ElMessage.error('更新账本标签失败');
    console.error('更新账本标签失败:', error);
  }
}

// 处理用户邀请
function handleInviteUser(email: string): void {
  showToast(`已向 ${email} 发送邀请`);

  // 添加通知
  notifications.value.unshift({
    id: Date.now().toString(),
    type: 'info',
    message: `已向 ${email} 发送邀请`,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

// 处理更新用户状态
function handleUpdateUserStatus(userId: string, status: 'active' | 'inactive'): void {
  showToast(`用户 ${userId} 状态已更新为 ${status === 'active' ? '启用' : '禁用'}`);

  // 添加通知
  notifications.value.unshift({
    id: Date.now().toString(),
    type: status === 'active' ? 'success' : 'warning',
    message: `用户 ${userId} 已${status === 'active' ? '启用' : '禁用'}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
}
</script>

<template>
  <WithPage class="bill-container">
    <!-- 账本选择区域 -->
    <div class="book-selection">
      <div class="current-book" @click="showBookSwitchPanel = true">
        <div class="book-icon" :class="currentBook?.icon" :style="{
          backgroundImage: `linear-gradient(135deg, ${currentBook?.color[0] || '#ddd'}, ${currentBook?.color[1] || '#ccc'})`,
        }"></div>
        <div class="book-info">
          <div class="book-name">{{ currentBook?.name || '选择账本' }}</div>
          <div class="book-tags" v-if="currentBook?.tags && currentBook.tags.length > 0" @click.stop="showBookTagPanel = true">
            <span
              v-for="(tag, idx) in currentBook.tags.slice(0, 2)"
              :key="idx"
              class="book-tag"
              :style="{
                backgroundColor: currentBook.tagColors?.[idx]?.[0] || '#eaeaea',
                color: '#fff',
              }"
            >
              {{ tag }}
            </span>
            <span v-if="currentBook.tags.length > 2" class="book-tag more">+{{ currentBook.tags.length - 2 }}</span>
          </div>
        </div>
        <div class="book-arrow">
          <div i-carbon-chevron-down></div>
        </div>
      </div>

      <div class="book-collaborators" v-if="currentBook?.collaborators?.length" @click="showCollaboratorsPanel = true">
        <div class="collaborator-avatars">
          <div
            v-for="(collaborator, idx) in currentBook.collaborators.slice(0, 3)"
            :key="collaborator.id"
            class="collaborator-avatar"
            :style="{
              right: `${idx * 15}px`,
              zIndex: 10 - idx,
              transform: idx === 0 ? 'translateY(-2px)' : 'none',
              backgroundColor: getCollaboratorColor(collaborator.id),
            }"
          >
            {{ collaborator.name.charAt(0) }}
          </div>
          <div
            v-if="currentBook.collaborators.length > 3"
            class="collaborator-more"
            :style="{
              right: '45px',
              zIndex: 7,
            }"
          >
            +{{ currentBook.collaborators.length - 3 }}
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-box" @click="showSearchPanel = true">
        <div i-carbon-search class="search-icon"></div>
        <div class="search-placeholder">搜索账单、智能查询</div>
      </div>
      <div class="sync-status" :class="syncStatus">
        <div i-carbon-cloud-satellite-config v-if="syncStatus === 'synced'"></div>
        <div i-carbon-cloud-upload v-if="syncStatus === 'syncing'" class="rotating"></div>
        <div i-carbon-cloud-offline v-if="syncStatus === 'offline'"></div>
      </div>
      <div class="notification-badge" @click="showNotifications = true">
        <div i-carbon-notification></div>
        <div class="badge" v-if="notifications.filter(n => !n.read).length">
          {{ notifications.filter(n => !n.read).length }}
        </div>
      </div>
      <div class="user-management-badge" @click="showUserManagementPanel = true">
        <div i-carbon-user-admin></div>
      </div>
    </div>

    <!-- 账单头部 -->
    <BillHeader
      :selectedMonth="selectedMonth"
      :monthlyIncome="monthlyIncome"
      :monthlyExpense="monthlyExpense"
      :monthlyBalance="monthlyBalance"
      @changeMonth="changeMonth"
      @openDataOverview="showDataOverview = true"
    />

    <!-- AI洞察区域 -->
    <div v-if="aiAnalysisStatus === 'ready' && aiInsights.length > 0" class="ai-insights">
      <div class="ai-insight-header">
        <div i-carbon-ai-status class="insight-icon"></div>
        <div class="insight-title">智能洞察</div>
      </div>
      <div class="ai-insight-content">
        <div
          v-for="(insight, idx) in aiInsights.slice(0, 2)"
          :key="idx"
          class="insight-item"
          :class="insight.type"
          @click="showAiAssistant = true"
        >
          <div class="insight-item-title">{{ insight.title }}</div>
          <div class="insight-item-content">{{ insight.content }}</div>
        </div>
        <div class="insight-more" v-if="aiInsights.length > 2" @click="showAiAssistant = true">
          查看更多洞察 ({{ aiInsights.length - 2 }})
        </div>
      </div>
    </div>

    <!-- 关键数据洞察区域 -->
    <div class="key-insights" v-if="keyInsights.length > 0">
      <div class="key-insight-header">
        <div i-carbon-data-view class="insight-icon"></div>
        <div class="insight-title">关键数据洞察</div>
      </div>
      <div class="key-insight-content">
        <div v-for="(insight, idx) in keyInsights" :key="idx" class="insight-item" :class="insight.trend">
          <div class="insight-item-title">{{ insight.title }}</div>
          <div class="insight-item-value">{{ insight.value }}</div>
          <div class="insight-item-change" v-if="insight.changePercentage > 0">
            <span :class="insight.trend === 'up' ? 'increase' : 'decrease'">
              {{ insight.trend === 'up' ? '↑' : '↓' }} {{ insight.changePercentage.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

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
        <span class="tooltip">数据概览</span>
      </div>
      <div class="function-button add" @click="showAddPanel = true">
        <div i-carbon-add></div>
        <span class="tooltip">添加账单</span>
      </div>
      <div class="function-button ai" @click="openAiTool()">
        <div i-carbon-ai-status></div>
        <span class="tooltip">AI助手</span>
      </div>
      <div class="function-button sync" v-if="syncStatus !== 'synced'" @click="syncData()">
        <div i-carbon-sync :class="{ rotating: syncStatus === 'syncing' }"></div>
        <span class="tooltip">同步数据</span>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="tabbar">
      <div v-for="(tab, index) in tabbarItems" :key="index"
           class="tab-item" :class="{ active: tab.active }"
           @click="$router.push(tab.path)">
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
      @openImportPanel="openImportPanel"
    />

    <!-- 导入账单面板 -->
    <BillImportPanel
      v-model:visible="showImportPanel"
      @importBill="importBills"
    />

    <!-- 数据总览面板 -->
    <DataOverview
      v-model:visible="showDataOverview"
      :bills="filteredBills"
      :selectedMonth="selectedMonth"
      :monthlyIncome="monthlyIncome"
      :monthlyExpense="monthlyExpense"
    />

    <!-- AI工具面板 -->
    <AiToolPanel
      v-model:visible="showAiAssistant"
      :bills="filteredBills"
      :selectedMonth="selectedMonth"
      :monthlyIncome="monthlyIncome"
      :monthlyExpense="monthlyExpense"
      :aiInsights="aiInsights"
      :aiAnalysisStatus="aiAnalysisStatus"
      @generateReport="handleGenerateReport"
      @shareInsight="handleShareInsight"
      @executeQuery="handleSmartQuery"
    />

    <!-- 账本切换面板 -->
    <BookSwitchPanel
      v-model:visible="showBookSwitchPanel"
      :books="books"
      :currentBookId="currentBookId"
      @switchBook="switchBook"
      @createBook="createBook"
      @updateBook="handleUpdateBook"
    />

    <!-- 协作者管理面板 -->
    <CollaboratorsPanel
      v-model:visible="showCollaboratorsPanel"
      :book="currentBook"
      :currentUser="currentUser"
      @addCollaborator="addCollaborator"
    />

    <!-- 搜索面板 -->
    <SearchPanel
      v-model:visible="showSearchPanel"
      v-model:searchKeyword="searchKeyword"
      v-model:activeFilters="activeFilters"
      :expenseCategories="expenseCategories"
      :incomeCategories="incomeCategories"
      @executeSmartQuery="handleSmartQuery"
    />

    <!-- 通知面板 -->
    <TouchDialog :model-value="showNotifications" @update:model-value="showNotifications = $event" active>
      <template #Main v-if="showNotifications">
        <div class="notifications-panel">
          <div class="notifications-header">
            <button class="close-btn" @click="showNotifications = false">
              <div i-carbon-close></div>
            </button>
            <div class="title">通知中心</div>
            <button class="mark-read-btn" @click="notifications.forEach(n => n.read = true)">
              全部已读
            </button>
          </div>

          <div class="notifications-list">
            <div v-for="notification in notifications" :key="notification.id"
                 class="notification-item" :class="{ unread: !notification.read }">
              <div class="notification-icon" :class="notification.type">
                <div v-if="notification.type === 'info'" i-carbon-information></div>
                <div v-if="notification.type === 'success'" i-carbon-checkmark-filled></div>
                <div v-if="notification.type === 'warning'" i-carbon-warning></div>
                <div v-if="notification.type === 'error'" i-carbon-error></div>
              </div>
              <div class="notification-content">
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ new Date(notification.createdAt).toLocaleString() }}</div>
              </div>
            </div>

            <div v-if="notifications.length === 0" class="empty-notifications">
              暂无通知
            </div>
          </div>
        </div>
      </template>
    </TouchDialog>

    <!-- 账本标签管理面板 -->
    <BookTagPanel
      v-model:visible="showBookTagPanel"
      :book="currentBook"
      :currentUser="currentUser"
      @updateTags="handleUpdateBookTags"
    />

    <!-- 用户管理面板 -->
    <UserManagementPanel
      v-model:visible="showUserManagementPanel"
      :currentUser="currentUser"
      @inviteUser="handleInviteUser"
      @updateUserStatus="handleUpdateUserStatus"
    />
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

.book-selection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 8px;

  .current-book {
    display: flex;
    align-items: center;
    background-color: var(--el-bg-color);
    padding: 8px 12px;
    border-radius: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    max-width: 65%;

    .book-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .book-info {
      display: flex;
      flex-direction: column;
      max-width: calc(100% - 40px);
      overflow: hidden;

      .book-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .book-tags {
        display: flex;
        gap: 4px;
        margin-top: 4px;
        position: relative;
        z-index: 2;

        .book-tag {
          font-size: 9px;
          padding: 1px 5px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .book-tag.more {
          background-color: var(--el-color-primary);
          color: white;
        }
      }
    }

    .book-arrow {
      margin-left: 6px;
      font-size: 12px;
      opacity: 0.8;
      flex-shrink: 0;
    }
  }

  .book-collaborators {
    .collaborator-avatars {
      display: flex;
      align-items: center;
      position: relative;
      min-width: 60px;
      height: 34px;

      .collaborator-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        border: 2px solid var(--el-bg-color-page);
        position: absolute;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-3px) !important;
          z-index: 20 !important;
        }
      }

      .collaborator-more {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border: 2px solid var(--el-bg-color-page);
        position: absolute;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.search-container {
  display: flex;
  align-items: center;
  padding: 0 16px 10px;

  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: var(--el-bg-color);
    border-radius: 20px;
    padding: 8px 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

    .search-icon {
      color: var(--el-text-color-secondary);
      margin-right: 8px;
    }

    .search-placeholder {
      color: var(--el-text-color-placeholder);
      font-size: 14px;
    }
  }

  .sync-status {
    margin-left: 12px;
    font-size: 18px;

    &.synced {
      color: var(--el-color-success);
    }

    &.syncing {
      color: var(--el-color-warning);
    }

    &.offline {
      color: var(--el-color-danger);
    }

    .rotating {
      animation: spin 1.5s linear infinite;
    }
  }

  .notification-badge {
    margin-left: 12px;
    font-size: 18px;
    position: relative;

    .badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background-color: var(--el-color-danger);
      color: white;
      font-size: 10px;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .user-management-badge {
    margin-left: 12px;
    font-size: 18px;
    position: relative;
  }
}

.ai-insights {
  margin: 10px 16px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .ai-insight-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .insight-icon {
      color: #8a69f6;
      font-size: 18px;
      margin-right: 6px;
    }

    .insight-title {
      font-weight: 500;
      font-size: 14px;
    }
  }

  .ai-insight-content {
    .insight-item {
      margin-bottom: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.02);
      border-left: 3px solid #8a69f6;

      &.info {
        border-left-color: #8a69f6;
      }

      &.warning {
        border-left-color: #ff7c01;
      }

      &.success {
        border-left-color: #13d77f;
      }

      .insight-item-title {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .insight-item-content {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .insight-more {
      text-align: center;
      margin-top: 8px;
      color: var(--el-color-primary);
      cursor: pointer;
    }
  }
}

.key-insights {
  margin: 10px 16px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .key-insight-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .insight-icon {
      color: #8a69f6;
      font-size: 18px;
      margin-right: 6px;
    }

    .insight-title {
      font-weight: 500;
      font-size: 14px;
    }
  }

  .key-insight-content {
    display: flex;
    justify-content: space-between;

    .insight-item {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.02);
      text-align: center;
      margin: 0 4px;

      &.up {
        border-bottom: 3px solid #13d77f;
      }

      &.down {
        border-bottom: 3px solid #ff4b50;
      }

      &.neutral {
        border-bottom: 3px solid #8a69f6;
      }

      .insight-item-title {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .insight-item-value {
        font-size: 16px;
        font-weight: 600;
      }

      .insight-item-change {
        font-size: 11px;
        margin-top: 4px;

        .increase {
          color: var(--el-color-success);
        }

        .decrease {
          color: var(--el-color-danger);
        }
      }
    }
  }
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
    position: relative;

    &:active {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .tooltip {
      position: absolute;
      right: 60px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s ease;
      pointer-events: none;
    }

    &:hover .tooltip {
      opacity: 1;
      transform: translateX(0);
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

    &.sync {
      background-image: linear-gradient(135deg, #0fdefe, #00b4fe);
    }
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  z-index: 9;
  backdrop-filter: blur(10px);

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
    font-size: 22px;
    position: relative;
    transition: all 0.2s ease;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 0;
      height: 3px;
      background-image: linear-gradient(135deg, #8a69f6, #b392f2);
      border-radius: 0 0 3px 3px;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .tab-name {
      font-size: 12px;
      margin-top: 4px;
      transition: all 0.2s ease;
    }

    &.active {
      color: var(--el-color-primary);

      &::before {
        width: 20px;
      }

      .tab-name {
        font-weight: 500;
        transform: scale(1.1);
      }
    }

    &:active {
      transform: scale(0.9);
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

.search-panel {
  display: none;
}

.notifications-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .notifications-header {
    padding: 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .close-btn {
      border: none;
      background: none;
      padding: 8px;
      font-size: 16px;
      color: var(--el-text-color-secondary);
    }

    .title {
      flex: 1;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
    }

    .mark-read-btn {
      border: none;
      background: none;
      color: var(--el-color-primary);
      font-size: 12px;
    }
  }

  .notifications-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .notification-item {
      display: flex;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      background-color: var(--el-bg-color);

      &.unread {
        background-color: var(--el-color-primary-light-9);
      }

      .notification-icon {
        margin-right: 12px;
        font-size: 20px;

        &.info {
          color: var(--el-color-info);
        }

        &.success {
          color: var(--el-color-success);
        }

        &.warning {
          color: var(--el-color-warning);
        }

        &.error {
          color: var(--el-color-danger);
        }
      }

      .notification-content {
        flex: 1;

        .notification-message {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .empty-notifications {
      text-align: center;
      padding: 32px 16px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
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

<route lang="yaml">
meta:
  transition: nav
</route>
