<script setup lang="ts">
// import { UniEventAtBackButton, uniEventBus } from '~/composables/adapter/uniapp';

withDefaults(defineProps<{
  adapt?: boolean
  loading?: boolean
}>(), {
  adapt: true,
  loading: false
})

// const visible = ref(!false)

// onActivated(() => {
//   nextTick(() => {
//     visible.value = true
//   })
// })

// onDeactivated(() => {
//   visible.value = false
// })
// const router = useRouter()
// const handleBackButton = (event: any) => {
//   if (event !== UniEventAtBackButton) return

//   console.log('handleBackButton')

//   router.back()
// }

// onMounted(() => {
//   uniEventBus.on(handleBackButton)
// })

// onBeforeUnmount(() => {
//   uniEventBus.off(handleBackButton)
// })
</script>

<template>
  <!-- :class="{ visible }" -->
  <WithPage :adapt="adapt" :class="{ pageLoading: loading }" class="RoutePage transition-cubic absolute-layout flex flex-col">
    <div class="RoutePage-Header">
      <slot name="header" />
    </div>
    <div class="RoutePage-Main relative w-full flex-1 overflow-hidden">
      <slot />

      <div
        class="transition-cubic RoutePage-Loading absolute-layout z-1 h-full w-full flex flex-col items-center justify-center gap-4 p-4">
        <Loading />
      </div>
    </div>

    <template #bg>
      <slot name="bg" />
    </template>
  </WithPage>
</template>

<style lang="scss" scoped>
.RoutePage-Loading {
  .RoutePage.pageLoading & {
    opacity: 1;
    pointer-events: all;
  }

  opacity: 0;
  pointer-events: none;
  background-color: var(--el-fill-color);
}

.RoutePage {
  z-index: 1;

  // border-radius: 18px;
  // transform: translateX(120%);
  background-color: var(--el-fill-color);

  &-Header {
    :deep(.van-nav-bar) {

      .van-icon,
      .van-nav-bar__text {
        color: var(--theme-color-primary, var(--theme-color));
      }

      &::after {
        border-bottom: none !important;
      }

      // padding-top: 0.5rem;
    }
  }

  // &.visible {
  //   border-radius: 0;
  //   transform: translateX(0);
  // }
}
</style>
