<script lang="ts" setup>
import OutCome from './dynamic/OutCome.vue'
import InCome from './dynamic/InCome.vue'
</script>

<template>
  <div class="splash-dynamic-island">
    <div class="splash-dynamic-island-content">
      <!-- <div class="splash-dynamic-island-title absolute">
        <span>AI</span>
      </div> -->

      <!-- <slot /> -->
      <!-- <OutCome :amount="100" category="餐饮" :date="new Date()" /> -->
      <InCome :amount="7120" category="工资" :date="new Date()" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.splash-dynamic-island {
  z-index: 100;
  position: absolute;

  top: 12px;
  left: 50%;
  transform: translateX(-50%);

  height: 220px;
  width: 90%;

  border-radius: 50px;
  box-shadow: var(--el-box-shadow);
  background-color: #000;
}

.splash-dynamic-island-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.splash-dynamic-island-title {
  font-size: 20px;
  font-weight: bold;

  transform: translate(-50%, -50%);
}
</style>
