<script setup lang="ts">
import { ref } from 'vue';

interface OutcomeProps {
  amount: number;
  category: string;
  date: Date;
  note?: string;
  aiSuggestion?: string;
}

const props = withDefaults(defineProps<OutcomeProps>(), {
  amount: 0,
  category: '未分类',
  date: () => new Date(),
  note: '',
  aiSuggestion: '',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

const dateStr = ref(`${props.date.getMonth() + 1}月${props.date.getDate()}日 星期${'日一二三四五六'.charAt(props.date.getDay())}`);

function handleConfirm(): void {
  emit('confirm');
}

function handleCancel(): void {
  emit('cancel');
}
</script>

<template>
  <div class="outcome-container">
    <div class="outcome-island">
      <!-- 顶部信息区 -->
      <div class="outcome-header">
        <div class="outcome-dot"></div>
        <div class="outcome-category">{{ props.category }}<span class="outcome-date mx-2">{{ dateStr }}</span></div>
        <div class="outcome-amount">-{{ formatAmount(props.amount) }}</div>
      </div>

      <!-- AI 建议区域 -->
      <div class="outcome-ai" v-if="props.aiSuggestion">
        <div class="ai-icon">AI</div>
        <div class="ai-suggestion">{{ props.aiSuggestion }}</div>
      </div>

      <div class="outcome-theme op-50">
        <div class="theme-icon">
          <Logo class="scale-150" />
        </div>
        <div class="theme-text">聚风聚财 · 消费记录</div>
      </div>

      <!-- 操作按钮区 -->
      <div class="outcome-actions">
        <button class="action-btn confirm" @click="handleConfirm">记入支出</button>
        <button class="action-btn cancel" @click="handleCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.outcome-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}

.outcome-date {
  font-size: 12px;
  opacity: 0.8;
}

.outcome-island {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 40px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.outcome-header {
  display: flex;
  align-items: center;
  gap: 12px;

  .outcome-dot {
    width: 12px;
    height: 12px;
    background-color: #ff3b30;
    border-radius: 50%;
  }

  .outcome-category {
    font-size: 18px;
    font-weight: 600;
  }

  .outcome-amount {
    margin-left: auto;
    font-size: 22px;
    font-weight: bold;
    color: #ff3b30;
  }
}

.outcome-brief {
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 8px;

  .brief-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    align-items: center;
  }

  .brief-time {
    font-size: 16px;
    opacity: 0.85;
  }

  .brief-amount {
    font-size: 18px;
    font-weight: 600;
  }

  .brief-note {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 8px;
    line-height: 1.5;
  }
}

.outcome-ai {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: rgba(64, 156, 255, 0.18);
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 8px;

  .ai-icon {
    background-color: #0a84ff;
    color: white;
    font-size: 12px;
    font-weight: bold;
    padding: 3px 6px;
    border-radius: 6px;
  }

  .ai-suggestion {
    font-size: 14px;
    line-height: 1.6;
    flex: 1;
  }
}

.outcome-theme {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 5px 0;

  .theme-icon {
    font-size: 20px;
  }

  .theme-text {
    font-size: 16px;
    font-weight: 600;
    color: #ffd700;
    letter-spacing: 1px;
  }
}

.outcome-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;

  .action-btn {
    flex: 1;
    padding: 12px 0;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 60px;

    &.confirm {
      background-color: #34c759;
      color: white;
      box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);

      &:hover {
        background-color: darken(#34c759, 5%);
        transform: translateY(-2px);
      }
    }

    &.cancel {
      background-color: rgba(255, 255, 255, 0.15);
      color: white;

      &:hover {
        background-color: rgba(255, 255, 255, 0.25);
      }
    }
  }
}
</style>
