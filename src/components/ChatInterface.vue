<script setup lang="ts">
import { ref, nextTick } from 'vue'
import MarkStream from 'markstream-vue'
import { requestLLMStream } from '../services/ai'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([])
const inputValue = ref('')
const isLoading = ref(false)

function scrollToBottom() {
  const container = document.querySelector('.chat-messages')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

async function handleSend() {
  if (!inputValue.value.trim() || isLoading.value) return

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: inputValue.value
  }
  messages.value.push(userMsg)
  inputValue.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  // Create assistant message placeholder
  const assistantMsg: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: ''
  }
  messages.value.push(assistantMsg)

  try {
    // Build messages array for API
    const apiMessages = messages.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // Call real AI API with streaming
    await requestLLMStream(
      apiMessages,
      (chunk) => {
        assistantMsg.content += chunk
      },
      { model: 'deepseek-v3.2' }
    )
  } catch (error) {
    console.error('AI request failed:', error)
    assistantMsg.content = `❌ 请求失败: ${error instanceof Error ? error.message : '未知错误'}`
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>🤖 AI 智能助手</h2>
      <span class="model-badge">DeepSeek V3.2</span>
    </div>
    
    <div class="chat-messages">
      <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.role">
        <div class="avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <MarkStream
            v-if="msg.role === 'assistant'"
            :content="msg.content"
            :max-live-nodes="50"
          />
          <span v-else>{{ msg.content }}</span>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-indicator">
        <span>AI 正在思考...</span>
      </div>
    </div>

    <div class="input-area">
      <el-input
        v-model="inputValue"
        placeholder="输入消息..."
        @keyup.enter="handleSend"
        :disabled="isLoading"
        clearable
      >
        <template #append>
          <el-button @click="handleSend" type="primary" :loading="isLoading">
            {{ isLoading ? '发送中...' : '发送' }}
          </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--el-fill-color-lighter);
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.model-badge {
  padding: 4px 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--el-fill-color-light);
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  line-height: 1.6;
}

.message-item.user .message-content {
  text-align: right;
}

.loading-indicator {
  text-align: center;
  padding: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}
</style>
