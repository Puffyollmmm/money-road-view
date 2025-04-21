<script setup lang="ts">
import WithPage from '~/components/page/WithPage.vue'
</script>

<template>
  <WithPage class="FinanceLayout">
    <template #bg>
      <div class="FinanceLayout-Header transition-cubic" />
    </template>

    <div class="FinanceLayout-Main">
      <slot />
    </div>
  </WithPage>
</template>

<style lang="scss">
.FinanceLayout-Main {
  position: relative;
  width: 100%;
  height: 100%;
  top: 1rem;
  overflow-y: scroll;
}

.FinanceLayout {
  &-Header {
    z-index: 1;
    display: flex;
    top: 0;
    height: calc(var(--header-height) + 1rem);
    justify-content: space-between;
    background: linear-gradient(135deg, var(--theme-color), rgba(var(--theme-color-rgb), 0.7));
  }
  position: relative;
  background-color: var(--el-bg-color);
}
</style>
