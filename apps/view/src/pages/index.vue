<script setup lang="ts" generic="T extends any, O extends any">
import Plan from '~/modules/plan/index.vue'

defineOptions({
  name: 'IndexPage',
})
</script>

<template>
  <Plan>
  </Plan>
</template>

<style lang="scss">
.IndexPage-Card {
  &::before {
    z-index: 1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    pointer-events: none;
    border-radius: 25px;
    background-color: var(--theme-color);
    transform: scale(1);

    transition: 0.25s 0.05s;
  }

  p.title {
    margin: 0 0 1rem;

    color: var(--el-text-color-placeholder);
    font-size: 24px;
    font-weight: 600;
  }

  position: relative;
  padding: 0.5rem 0;

  top: 0%;
}
</style>

<route lang="yaml">
meta:
  transition: nav
</route>
