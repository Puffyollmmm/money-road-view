<script setup lang="ts">
import { isDark, toggleDark } from '~/composables/theme'

// 处理暗色模式切换
function handleToggle(event: MouseEvent) {
  // 传递点击事件参数，启用圆形扩散效果
  toggleDark(undefined, event)
}

// 确保在挂载时应用正确的样式
onMounted(() => {
  // 强制刷新一下样式以确保正确显示
  const currentMode = isDark.value
  document.documentElement.classList.toggle('dark', currentMode)
})
</script>

<template>
  <div class="DarkModeSwitch flex items-center gap-2">
    <!-- 暗色模式切换 -->
    <ElTooltip :content="isDark ? '切换亮色模式' : '切换暗色模式'">
      <div
        class="switch-button flex cursor-pointer items-center rounded-md p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="handleToggle">
        <div i-carbon-moon v-if="isDark" />
        <div i-carbon-sun v-else />
      </div>
    </ElTooltip>
  </div>
</template>
