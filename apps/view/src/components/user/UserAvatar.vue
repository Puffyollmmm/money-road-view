<script setup lang="ts">
import { UseImage } from '@vueuse/components'
import { globalAuthStorage } from '~/modules/auth';

const props = defineProps<{
  src?: string
}>()

const defaultAvatar = 'http://q.qlogo.cn/headimg_dl?dst_uin=3535693649&spec=640&img_type=jpg' || '/avatar.jpg'

const avatar = computed(() => {
  return props.src || (globalAuthStorage.value.user.userAvatar) || defaultAvatar
})
</script>

<template>
  <UseImage :src="avatar" class="UserAvatar">
    <template #placeholder>
      <Loading />
    </template>

    <template #error>
      <img :src="defaultAvatar" />
    </template>
  </UseImage>
</template>

<style lang="scss" scoped>
</style>
