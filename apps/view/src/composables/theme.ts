import { watch } from 'vue'
import { useColorMode, useDark, usePreferredDark } from '@vueuse/core'

// 检测浏览器是否支持CSS过渡API
const supportsTransition = typeof document !== 'undefined' && 'startViewTransition' in document

// 颜色模式管理 - 使用VueUse的useDark处理暗色模式
export const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'color-schema',
})

// 直接创建一个显式的切换函数，确保classList正确更新
function toggle(forcedValue?: boolean): boolean {
  const newValue = forcedValue !== undefined ? forcedValue : !isDark.value
  isDark.value = newValue

  // 确保class被正确添加或移除
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', newValue)

    // 更新localStorage
    localStorage.setItem('color-schema', newValue ? 'dark' : 'light')
  }

  return newValue
}

/**
 * 切换暗色模式
 * @param forcedValue 指定切换的目标值，undefined则自动切换
 * @param event 鼠标事件，用于创建点击动画效果
 */
export function toggleDark(forcedValue?: boolean, event?: MouseEvent): void {
  // 如果传入了点击事件，则使用圆形扩散效果
  if (event && supportsTransition) {
    const x = event.clientX
    const y = event.clientY
    // 计算最大半径 - 从点击位置到最远角落的距离
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    // 启动过渡动画
    // @ts-expect-error - View Transition API不在所有类型定义中
    const transition = document.startViewTransition(async () => {
      toggle(forcedValue)
    })

    // 当准备好后开始动画
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  } else if (supportsTransition) {
    // 使用默认的滑动过渡效果
    // @ts-expect-error - View Transition API不在所有类型定义中
    document.startViewTransition(() => {
      toggle(forcedValue)
    })
  } else {
    // 降级方案 - 直接切换
    toggle(forcedValue)
  }
}

// 全局默认的蓝色主题
export const defaultBlueTheme = {
  primary: '#1677ff',
  secondary: '#40a9ff',
  light: '#e6f7ff',
  dark: '#0052d9',
}

// 应用默认蓝色主题到CSS变量
if (typeof document !== 'undefined') {
  // 提取RGB值用于透明度计算
  const primaryHex = defaultBlueTheme.primary.replace('#', '')
  const r = Number.parseInt(primaryHex.substring(0, 2), 16)
  const g = Number.parseInt(primaryHex.substring(2, 4), 16)
  const b = Number.parseInt(primaryHex.substring(4, 6), 16)

  document.documentElement.style.setProperty('--theme-color-primary', defaultBlueTheme.primary)
  document.documentElement.style.setProperty('--theme-color-secondary', defaultBlueTheme.secondary)
  document.documentElement.style.setProperty('--theme-color-light', defaultBlueTheme.light)
  document.documentElement.style.setProperty('--theme-color-dark', defaultBlueTheme.dark)
  document.documentElement.style.setProperty('--theme-color-primary-rgb', `${r}, ${g}, ${b}`)
}

// 初始化主题过渡效果样式 - 在浏览器环境下创建全局CSS动画和过渡规则
if (typeof document !== 'undefined') {
  // 仅在浏览器环境下执行
  const style = document.createElement('style')
  style.textContent = `
    /* 基础动画效果 */
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes slide-from-right {
      from { transform: translateX(30px); }
      to { transform: translateX(0); }
    }

    @keyframes slide-to-left {
      from { transform: translateX(0); }
      to { transform: translateX(-30px); }
    }

    /* 默认过渡效果 */
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    /* 控制暗色模式切换时的层级顺序 */
    ::view-transition-old(root) {
      z-index: 1;
    }

    ::view-transition-new(root) {
      z-index: 2147483646;
    }

    /* 暗色模式下调整层级顺序 */
    html.dark::view-transition-old(root) {
      z-index: 2147483646;
    }

    html.dark::view-transition-new(root) {
      z-index: 1;
    }
  `
  document.head.appendChild(style)

  // 初始化时应用当前暗色模式状态
  toggleDark(isDark.value)
}

// 暴露API检测功能 - 提供浏览器特性检测结果
export const features = {
  supportsTransition, // 是否支持视图过渡API
  prefersDark: usePreferredDark(), // 系统是否偏好暗色模式
}

/**
 * 主题管理API - 返回暗色模式相关的状态和函数
 * @returns 主题管理API对象
 */
export function useTheme() {
  return {
    isDark, // 暗色模式状态
    toggleDark, // 切换暗色模式的函数
    features, // 特性检测结果
  }
}

export default useTheme