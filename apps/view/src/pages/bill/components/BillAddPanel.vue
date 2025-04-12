<script setup lang="ts">
import { showToast } from 'vant';
import { ref, watch } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface CategoryItem {
  name: string;
  icon: string;
  color: string[];
}

const props = defineProps<{
  visible: boolean;
  currentDate: string;
  expenseCategories: CategoryItem[];
  incomeCategories: CategoryItem[];
}>();

const emit = defineEmits(['update:visible', 'addBill', 'openImportPanel']);

const currentType = ref<'income' | 'expense'>('expense');
const currentCategory = ref('');
const currentAmount = ref('');
const currentNote = ref('');
const showDatePicker = ref(false);
const showAiSuggestion = ref(false);
const aiSuggestion = ref('');
const showAiAnalysisPanel = ref(false);
const isImageUploading = ref(false);

// 监听金额变化，自动切换类型
watch(currentAmount, (newVal) => {
  if (newVal.startsWith('-')) {
    // 移除负号并自动切换到支出
    currentAmount.value = newVal.substring(1);
    currentType.value = 'expense';
  }
});

// 选择分类
function selectCategory(category: string): void {
  currentCategory.value = category;
}

// 添加账单
function submitBill(): void {
  if (!currentCategory.value) {
    showToast('请选择分类');
    return;
  }

  const amount = Number.parseFloat(currentAmount.value);
  if (!currentAmount.value || amount <= 0) {
    showToast('请输入有效金额');
    return;
  }

  emit('addBill', {
    type: currentType.value,
    category: currentCategory.value,
    amount,
    date: props.currentDate,
    note: currentNote.value,
  });

  // 重置表单
  resetForm();
  closePanel();
}

// 重置表单
function resetForm(): void {
  currentCategory.value = '';
  currentAmount.value = '';
  currentNote.value = '';
  currentType.value = 'expense';
  showAiSuggestion.value = false;
  aiSuggestion.value = '';
  showAiAnalysisPanel.value = false;
}

// 关闭面板
function closePanel(): void {
  emit('update:visible', false);
}

// 扫码或上传图片添加
function uploadImage(): void {
  isImageUploading.value = true;

  // 模拟上传和处理过程
  setTimeout(() => {
    isImageUploading.value = false;
    showAiSuggestion.value = true;
    aiSuggestion.value = 'AI已识别小票内容: 星巴克咖啡 ¥38.00，已为您自动填写';
    currentAmount.value = '38.00';
    currentCategory.value = '餐饮';
    currentNote.value = '星巴克咖啡';
  }, 1500);
}

// 打开文件选择器
function openFilePicker(): void {
  showToast('选择图片功能即将上线');
  // 这里应调用文件选择器
}

// 扫码添加
function scanQRCode(): void {
  // 修改为第三方导入功能
  showToast('正在打开第三方导入...');
  emit('openImportPanel');
}

// AI智能识别
function useAiSuggestion(): void {
  showAiSuggestion.value = true;
  aiSuggestion.value = '正在分析消费类型...';

  // 模拟AI分析过程
  setTimeout(() => {
    if (currentAmount.value) {
      const amount = Number.parseFloat(currentAmount.value);

      // 根据金额简单推断可能的消费类型
      if (amount <= 50) {
        aiSuggestion.value = 'AI推荐：该笔消费可能为餐饮消费，已为您自动选择。';
        currentCategory.value = '餐饮';
      } else if (amount > 50 && amount <= 200) {
        aiSuggestion.value = 'AI推荐：该笔消费可能为日常购物，已为您自动选择。';
        currentCategory.value = '购物';
      } else if (amount > 200 && amount <= 1000) {
        aiSuggestion.value = 'AI推荐：该笔消费可能为娱乐支出，已为您自动选择。';
        currentCategory.value = '娱乐';
      } else {
        aiSuggestion.value = 'AI推荐：该笔消费可能为大额支出，请选择合适的分类。';
      }
    } else {
      aiSuggestion.value = 'AI提示：请先输入消费金额，以便我提供更准确的分类建议。';
    }
  }, 1000);
}

// 打开AI高级分析面板
function openAiAnalysisPanel(): void {
  if (!currentAmount.value) {
    showToast('请先输入金额');
    return;
  }

  showAiAnalysisPanel.value = true;
}

// 应用AI建议
function applyAiSuggestion(category: string): void {
  currentCategory.value = category;
  showAiAnalysisPanel.value = false;
  showAiSuggestion.value = true;
  aiSuggestion.value = `AI已为您选择【${category}】分类`;
}
</script>

<template>
  <TouchDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" active>
    <template #Main>
      <div class="flex flex-col h-full bg-white">
        <!-- 头部区域 -->
        <div class="relative flex items-center justify-center h-14 px-4 border-b border-gray-100">
          <!-- 类型切换 -->
          <div class="flex rounded-full bg-gray-100 p-1">
            <button
              class="px-6 py-1.5 text-sm rounded-full transition-colors"
              :class="currentType === 'expense' ? 'bg-blue-500 text-white' : 'text-gray-500'"
              @click="currentType = 'expense'"
            >
              支出
            </button>
            <button
              class="px-6 py-1.5 text-sm rounded-full transition-colors"
              :class="currentType === 'income' ? 'bg-blue-500 text-white' : 'text-gray-500'"
              @click="currentType = 'income'"
            >
              收入
            </button>
          </div>

          <!-- 关闭按钮 -->
          <button
            @click="closePanel"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <div i-carbon-close class="text-lg"></div>
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-auto">
          <!-- 金额输入 -->
          <div class="flex items-center px-6 py-8 border-b border-gray-100">
            <div class="text-xl text-gray-500 mr-2">¥</div>
            <input
              type="text"
              v-model="currentAmount"
              placeholder="0.00"
              inputmode="decimal"
              step="0.01"
              class="text-3xl w-full bg-transparent border-none outline-none font-light"
            />
            <button
              @click="useAiSuggestion"
              title="AI智能推荐"
              class="text-blue-500 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div i-carbon-ai-status class="text-xl"></div>
            </button>
          </div>

          <!-- AI智能建议 -->
          <div
            v-if="showAiSuggestion"
            class="mx-4 mt-4 flex items-center p-3 bg-blue-50 rounded-lg"
          >
            <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
              AI
            </div>
            <div class="text-sm text-gray-600 leading-normal">{{ aiSuggestion }}</div>
          </div>

          <!-- 日期和备注 -->
          <div class="px-6">
            <div class="flex justify-between items-center h-14 border-b border-gray-100">
              <div class="text-gray-500">日期</div>
              <div @click="showDatePicker = true" class="text-gray-700">{{ currentDate }}</div>
            </div>
            <div class="flex justify-between items-center h-14 border-b border-gray-100">
              <div class="text-gray-500">备注</div>
              <input
                type="text"
                v-model="currentNote"
                placeholder="添加备注..."
                class="text-right bg-transparent border-none outline-none text-sm w-2/3 text-gray-700"
              />
            </div>
          </div>

          <!-- 选择分类 -->
          <div class="px-6 mt-6">
            <div class="flex justify-between items-center mb-4">
              <div class="text-gray-800 font-medium">选择分类</div>
              <div class="flex items-center space-x-2">
                <button
                  @click="openAiAnalysisPanel"
                  class="flex items-center px-2.5 py-1 border border-blue-200 rounded-full text-blue-500 text-xs"
                >
                  <div i-carbon-machine-learning-model class="mr-1"></div>
                  <span>AI分析</span>
                </button>
                <button
                  @click="useAiSuggestion"
                  class="flex items-center px-2.5 py-1 bg-blue-500 rounded-full text-white text-xs"
                >
                  <div i-carbon-ai-status class="mr-1 animate-pulse-opacity"></div>
                  <span>识别</span>
                </button>
              </div>
            </div>

            <!-- 类别选择 -->
            <div class="grid grid-cols-5 gap-2">
              <div
                v-for="category in (currentType === 'income' ? incomeCategories : expenseCategories)"
                :key="category.name"
                @click="selectCategory(category.name)"
                class="flex flex-col items-center py-2"
              >
                <div
                  class="w-11 h-11 rounded-full mb-1.5 flex items-center justify-center text-white text-lg transition-all"
                  :class="[
                    currentCategory === category.name ? 'ring-2 ring-offset-2 ring-blue-500 transform scale-110' : '',
                  ]"
                  :style="`background-image: linear-gradient(135deg, ${category.color[0]}, ${category.color[1]});`"
                >
                  <div :class="category.icon"></div>
                </div>
                <div
                  class="text-xs"
                  :class="currentCategory === category.name ? 'text-blue-500 font-medium' : 'text-gray-500'"
                >
                  {{ category.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- AI高级分析面板 -->
          <div
            v-if="showAiAnalysisPanel"
            class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40"
          >
            <div class="bg-white rounded-lg w-4/5 max-w-md p-4 shadow-lg mx-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div i-carbon-ai-results class="text-lg text-blue-500 mr-2"></div>
                  <h3 class="text-base font-medium text-gray-800">AI智能分析</h3>
                </div>
                <button @click="showAiAnalysisPanel = false" class="text-gray-400">
                  <div i-carbon-close class="text-lg"></div>
                </button>
              </div>

              <p class="text-sm text-gray-600 mb-3">根据您的历史记录和当前金额 ¥{{ currentAmount }}，AI推荐以下可能的分类：</p>

              <div class="space-y-2 max-h-60 overflow-auto">
                <div
                  v-for="(category, index) in [
                    { name: '餐饮', probability: '85%', icon: 'i-carbon-cafe' },
                    { name: '购物', probability: '45%', icon: 'i-carbon-shopping-cart' },
                    { name: '娱乐', probability: '20%', icon: 'i-carbon-game-console' },
                  ]"
                  :key="index"
                  class="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="applyAiSuggestion(category.name)"
                >
                  <div class="flex items-center">
                    <div :class="category.icon" class="text-lg text-blue-500 mr-2"></div>
                    <span class="text-gray-700">{{ category.name }}</span>
                  </div>
                  <div class="flex items-center text-xs text-gray-500">
                    匹配度 {{ category.probability }}
                    <div i-carbon-arrow-right class="ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片上传预览 -->
        <div
          v-if="isImageUploading"
          class="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50"
        >
          <div class="w-12 h-12 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"></div>
          <div class="text-white text-base">正在识别小票内容...</div>
        </div>

        <!-- 底部操作区 -->
        <div class="border-t border-gray-100">
          <div class="grid grid-cols-3 px-4 py-2">
            <button
              @click="openFilePicker"
              class="flex flex-col items-center py-2 text-gray-400"
            >
              <div i-carbon-image class="text-xl mb-1"></div>
              <span class="text-xs">相册</span>
            </button>
            <button
              @click="uploadImage"
              class="flex flex-col items-center py-2 text-gray-400"
            >
              <div i-carbon-camera class="text-xl mb-1"></div>
              <span class="text-xs">拍照</span>
            </button>
            <button
              @click="scanQRCode"
              class="flex flex-col items-center py-2 text-gray-400"
            >
              <div i-carbon-add-large class="text-xl mb-1"></div>
              <span class="text-xs">导入</span>
            </button>
          </div>
          <div class="px-4 pb-4">
            <button
              @click="submitBill"
              class="w-full py-3 bg-blue-500 text-white text-base font-medium rounded-lg"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </template>
  </TouchDialog>
</template>

<style>
@keyframes pulse-opacity {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.animate-pulse-opacity {
  animation: pulse-opacity 2s infinite;
}
</style>
