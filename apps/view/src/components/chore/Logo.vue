<script setup lang="ts">
</script>

<template>
  <div class="LogoContainer">
    <img src="/logo.png">
  </div>
</template>

<style lang="scss" scoped>
.LogoContainer {
  img {
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }
  position: relative;
  margin: 0 10px;
  display: flex;

  font-weight: 600;
  align-items: center;
  justify-content: center;

  width: 1em;
  height: 1em;

  border-radius: 12px;
  // box-shadow: 0 0 11px 2px #3ab8fd;
  // background-color: #3ab8fd;
}
</style>
