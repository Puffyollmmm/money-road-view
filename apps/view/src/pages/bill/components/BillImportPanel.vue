<script setup lang="ts">
import { showToast } from 'vant';
import { ref } from 'vue';
import TouchDialog from '~/components/dialog/TouchDialog.vue';

interface ImportedBill {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
  source: string;
}

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'importBill']);

const isImporting = ref(false);
const selectedPlatform = ref<string | null>(null);

// 平台列表
const platforms = [
  { id: 'wechat', name: '微信', icon: 'i-carbon-logo-wechat', color: '#07C160' },
  { id: 'alipay', name: '支付宝', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE --><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20.893 16.578A9.96 9.96 0 0 0 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10a9.98 9.98 0 0 0 7.794-3.735l-.725-.362a258 258 0 0 1-3.192-1.484c-.805-.379-1.522-.716-2.18-1.013a8.6 8.6 0 0 1-.927 1.114C11.648 17.64 10.52 18 9.5 18C7.632 18 6 16.82 6 15c0-1.684 1.48-3 3-3c1.268 0 2.494.334 3.887.884q.318-.609.647-1.384H9a1 1 0 1 1 0-2h2V9H8a1 1 0 0 1 0-2h3V6a1 1 0 1 1 2 0v1h3a1 1 0 1 1 0 2h-3v.5h2a1 1 0 0 1 .94 1.342a25 25 0 0 1-1.212 2.835q.941.432 2.06.96c.938.442 1.975.93 3.126 1.453l.033.016z"/><path fill="currentColor" d="M9 14c.827 0 1.687.194 2.797.608a6 6 0 0 1-.442.497C10.602 15.86 9.98 16 9.5 16C8.368 16 8 15.38 8 15c0-.516.52-1 1-1"/></g></svg>', color: '#1677FF' },
  { id: 'unionpay', name: '云闪付', icon: 'i-carbon-currency-yen', color: '#D9242A' },
  { id: 'bank', name: '银行卡', icon: 'i-carbon:chart-venn-diagram', color: '#F58220' },
];

// 模拟导入过程
function importFromPlatform(platformId: string): void {
  selectedPlatform.value = platformId;
  isImporting.value = true;

  // 模拟请求延迟
  setTimeout(() => {
    isImporting.value = false;

    // 根据不同平台生成不同的模拟账单数据
    const mockBills: ImportedBill[] = [];

    if (platformId === 'wechat') {
      mockBills.push(
        {
          type: 'expense',
          category: '餐饮',
          amount: 15.5,
          date: new Date().toISOString().split('T')[0],
          note: '麦当劳',
          source: '微信',
        },
        {
          type: 'expense',
          category: '娱乐',
          amount: 48,
          date: new Date().toISOString().split('T')[0],
          note: '电影票',
          source: '微信',
        },
      );
    } else if (platformId === 'alipay') {
      mockBills.push(
        {
          type: 'expense',
          category: '购物',
          amount: 99.9,
          date: new Date().toISOString().split('T')[0],
          note: '淘宝订单',
          source: '支付宝',
        },
        {
          type: 'income',
          category: '转账',
          amount: 200,
          date: new Date().toISOString().split('T')[0],
          note: '好友转账',
          source: '支付宝',
        },
      );
    } else if (platformId === 'unionpay') {
      mockBills.push(
        {
          type: 'expense',
          category: '日用',
          amount: 75.8,
          date: new Date().toISOString().split('T')[0],
          note: '超市购物',
          source: '云闪付',
        },
      );
    } else if (platformId === 'bank') {
      mockBills.push(
        {
          type: 'income',
          category: '工资',
          amount: 8000,
          date: new Date().toISOString().split('T')[0],
          note: '月薪',
          source: '银行卡',
        },
      );
    }

    // 发送导入的账单数据
    emit('importBill', mockBills);
    showToast(`成功从${getPlatformName(platformId)}导入${mockBills.length}笔账单`);
    closePanel();
  }, 1500);
}

// 获取平台名称
function getPlatformName(platformId: string): string {
  const platform = platforms.find(p => p.id === platformId);
  return platform ? platform.name : '未知平台';
}

// 关闭面板
function closePanel(): void {
  selectedPlatform.value = null;
  emit('update:visible', false);
}
</script>

<template>
  <TouchDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" active>
    <template #Main>
      <div class="flex flex-col h-full bg-white">
        <!-- 头部区域 -->
        <div class="relative flex items-center justify-center h-14 px-4 border-b border-gray-100">
          <h3 class="text-lg font-medium">选择导入渠道</h3>

          <!-- 关闭按钮 -->
          <button
            @click="closePanel"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <div i-carbon-close class="text-lg"></div>
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-auto p-4">
          <p class="text-sm text-gray-500 mb-4">请选择要从哪个平台导入账单数据：</p>

          <!-- 平台列表 -->
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="platform in platforms"
              :key="platform.id"
              @click="importFromPlatform(platform.id)"
              class="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div
                class="w-14 h-14 rounded-full mb-2 flex items-center justify-center text-white text-xl"
                :style="`background-color: ${platform.color}`"
              >
                <template v-if="platform.icon.startsWith('<svg')">
                  <div v-html="platform.icon"></div>
                </template>
                <template v-else>
                  <div :class="platform.icon"></div>
                </template>
              </div>
              <span class="text-sm font-medium">{{ platform.name }}</span>
            </div>
          </div>

          <!-- 说明信息 -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-start">
              <div i-carbon-information class="text-blue-500 mr-2 text-lg flex-shrink-0"></div>
              <div class="text-sm text-gray-600">
                <p>导入账单功能可以自动同步您在其他平台的消费记录，使记账更轻松。</p>
                <p class="mt-2">目前导入功能处于公测阶段，我们会不断完善功能体验。</p>
              </div>
            </div>
          </div>

          <!-- 导入中状态 -->
          <div
            v-if="isImporting"
            class="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50"
          >
            <div class="w-12 h-12 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-4"></div>
            <div class="text-white text-base">正在从{{ getPlatformName(selectedPlatform || '') }}导入账单数据...</div>
          </div>
        </div>
      </div>
    </template>
  </TouchDialog>
</template>

<style>
.animate-spin {
  animation: spin 1s linear infinite;
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
