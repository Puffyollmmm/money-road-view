<script setup lang="ts">
import { useRequest } from 'alova/client'
import WithPage from '~/components/page/WithPage.vue'
import Apis from '~/composables/api/clients'
import { globalAuthStorage } from '.'

// const { send, loading } = useRequest(() => Apis.userController.userLoginTokenUsingPOST({
//   data: {
//     userAccount: 'auto_login',
//     userPassword: 'auto_login',
//   },
//   meta: {
//     authRole: 'login',
//   },
// }), {
//   immediate: false,
// })

async function handleAuth(event: Event) {
  event.preventDefault()

  globalAuthStorage.value.isLogin = true
}
</script>

<template>
  <WithPage v-loading="loading" class="AuthMain h-full w-full">
    <div class="login-container">
      <div class="logo-container">
        <div class="logo">
          <Logo />
        </div>
        <h2 class="app-name">塔聚风 - 记账消费</h2>
      </div>

      <div mt-auto w-full>
        <button v-wave type="submit" class="submit-btn" @click="handleAuth">
          登录
        </button>

        <div class="agreement-text">
          <p>未注册账号会自动注册</p>
          <p>登录即代表你同意 <a href="https://protocol.quotawish.com" class="agreement-link">用户协议</a></p>
        </div>
      </div>
    </div>
  </WithPage>
</template>

<style lang="scss" scoped>
.AuthMain {
  --auth-primary: #1976d2;
  --auth-primary-dark: #0d47a1;
  --auth-secondary: #2f80ed;
  --auth-bg-light: #e3f2fd;

  @media (prefers-color-scheme: dark) {
    --auth-primary: #2196f3;
    --auth-primary-dark: #1976d2;
    --auth-secondary: #42a5f5;
    --auth-bg-light: #0a2744;
  }

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--auth-bg-light) 0%, var(--auth-primary) 100%);
    opacity: 0.9;
    z-index: -2;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
    opacity: 0.2;
    z-index: -1;
    animation: moveGradient 15s ease infinite;
  }
}

@keyframes moveGradient {
  0% {
    transform: translate(0%, 0%) rotate(0deg);
  }
  50% {
    transform: translate(10%, 10%) rotate(180deg);
  }
  100% {
    transform: translate(0%, 0%) rotate(360deg);
  }
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 3rem;
  width: 100%;
}

.logo-container {
  margin-top: 20%;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 80px;
  height: 80px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--auth-primary);
  font-size: 10rem;
  font-weight: bold;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.app-name {
  font-size: 1.5rem;
  color: white;
  font-weight: 600;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--auth-primary);
  background: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: auto;
  margin-bottom: 0.5rem;

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
}

.agreement-text {
  margin-top: auto;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  text-align: center;

  p {
    margin: 5px 0;
  }
}

.agreement-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);

  &:hover {
    border-bottom-color: white;
  }
}
</style>
