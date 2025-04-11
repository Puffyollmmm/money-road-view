<script setup lang="ts">
import WithPage from '~/components/page/WithPage.vue'
</script>

<template>
  <WithPage class="PlanLayout">
    <template #bg>
      <div class="PlanLayout-Header transition-cubic" />
    </template>

    <div class="PlanLayout-Main">
      <slot />
    </div>
  </WithPage>
</template>

<style lang="scss">
.PlanLayout-Main {
  position: relative;

  width: 100%;
  height: 100%;

  top: 1rem;

  overflow-y: scroll;
}

.PlanLayout {
  &-Header {
    z-index: 1;
    display: flex;

    top: 0;
    height: calc(var(--header-height) + 1rem);

    justify-content: space-between;
    background-color: var(--theme-color);
  }
  position: relative;

  background-color: var(--el-bg-color);
}
</style>
