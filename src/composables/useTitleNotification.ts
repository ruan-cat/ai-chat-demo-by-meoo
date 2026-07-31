import { ref, onMounted } from 'vue'
import { useTitle } from '@vueuse/core'

const DEFAULT_TITLE = 'AI 智能助手'
const NOTIFICATION_TITLE = '【新消息】AI 回复已完成'

export function useTitleNotification() {
  const title = useTitle(DEFAULT_TITLE)
  const originalTitle = ref(DEFAULT_TITLE)
  const isNotifying = ref(false)
  let blinkInterval: number | null = null

  // 请求通知权限
  async function requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // 显示浏览器通知
  function showNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AI 智能助手', {
        body: message || '对话已完成，快来查看吧！',
        icon: '/favicon.ico',
      })
    }
  }

  // 开始标题闪烁
  function startBlinking() {
    if (isNotifying.value) return
    
    isNotifying.value = true
    originalTitle.value = document.title
    
    let showNotification = true
    blinkInterval = window.setInterval(() => {
      document.title = showNotification ? NOTIFICATION_TITLE : originalTitle.value
      showNotification = !showNotification
    }, 1000)
  }

  // 停止标题闪烁
  function stopBlinking() {
    if (!isNotifying.value) return
    
    if (blinkInterval) {
      clearInterval(blinkInterval)
      blinkInterval = null
    }
    
    document.title = originalTitle.value
    isNotifying.value = false
  }

  // 触发完整通知流程
  async function triggerNotification(message?: string) {
    await requestPermission()
    showNotification(message || '对话已完成，快来查看吧！')
    startBlinking()
    
    // 5秒后自动停止闪烁（用户点击页面时会立即停止）
    setTimeout(() => {
      stopBlinking()
    }, 5000)
  }

  // 监听页面可见性变化，当用户回到页面时停止闪烁
  onMounted(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        stopBlinking()
      }
    })
    
    // 点击页面时也停止闪烁
    document.addEventListener('click', stopBlinking)
  })

  return {
    title,
    isNotifying,
    requestPermission,
    triggerNotification,
    stopBlinking,
  }
}
