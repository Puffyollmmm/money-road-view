<script lang="ts" setup>
import { useFooterNav } from '.'

const router = useRouter()

const { active, activeNav, navs } = useFooterNav()
</script>

<template>
  <nav
    :class="{ shrink: !active }"
    class="Application-Footer transition-cubic" inline-flex gap-2 text-xl
  >
    <ul w-full flex justify-between>
      <li
        v-for="(nav, ind) in navs" :id="`footer-nav-item-${ind + 1}`" :key="nav.path" flex flex-col items-center
        :class="{ active: activeNav?.path === nav.path }" @click="router.push(nav.path)"
      >
        <div class="transition-cubic nav-icon">
          <template v-if="nav.icon.startsWith('i-')">
            <div :class="nav.icon" />
          </template>
          <template v-else>
            <div class="scale-[0.75]" v-html="nav.icon" />
          </template>
        </div>
        <p class="transition-cubic title">
          {{ nav.name }}
        </p>
      </li>
    </ul>

    <div hidden>
      <div i-carbon-explore />
      <div i-carbon-add-alt />
      <div i-carbon:user-avatar-filled-alt />
    </div>
  </nav>
</template>

<style lang="scss">
.Application-Footer ul li {
  &.active {
    opacity: 1;
    color: var(--theme-color);
  }

  .title {
    font-size: 14px;
  }

  .nav-icon {
    position: relative;
    display: flex;

    width: 24px;
    height: 24px;

    flex-shrink: 0;
    font-size: 24px;

    align-items: center;
    justify-content: center;
  }

  position: relative;
  padding: 0 1rem;

  // width: 64px;
  height: 100%;

  // gap: 0.25rem;
  opacity: 0.75;
  font-size: 30px;
  font-weight: 600;
  align-items: center;
  justify-content: center;

  color: var(--el-text-color-secondary);
}

.Application-Footer {
  &.shrink {
    transform: translateY(80px);
  }

  z-index: 1;
  position: absolute;
  padding: 0.25rem 2rem;

  width: 100%;
  bottom: 0;

  height: 64px;

  flex: 1 0 64px;
  // border-top: 1px solid var(--el-border-color);

  // --fake-opacity: 0.85;
  // backdrop-filter: blur(18px) saturate(180%) brightness(120%);
}
</style>
