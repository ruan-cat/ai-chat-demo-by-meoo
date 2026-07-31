<script setup lang="ts">
import { ref, nextTick } from 'vue'
import MarkStream from 'markstream-vue'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([])
const inputValue = ref('')

// Mock SSE stream simulation
async function simulateStreamResponse(userMessage: string) {
  const assistantMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'assistant',
    content: ''
  }
  messages.value.push(assistantMsg)

  // Simulate streaming chunks
  const mockResponse = `你好！我是AI助手。

## 关于你的问题

你提到了 **${userMessage}**，这是一个很好的话题。

### 技术要点

\`\`\`typescript
// 示例代码
function hello() {
  console.log("Hello World")
}
\`\`\`

- 第一点：流式渲染
- 第二点：Markdown 解析
- 第三点：代码高亮

希望这对你有帮助！`

  const chunks = mockResponse.split('')
  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 20))
    assistantMsg.content += chunks[i]
  }

  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  const container = document.querySelector('.chat-messages')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

async function handleSend() {
  if (!inputValue.value.trim()) return

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: inputValue.value
  }
  messages.value.push(userMsg)
  const userInput = inputValue.value
  inputValue.value = ''

  await nextTick()
  scrollToBottom()

  // Simulate AI response with streaming
  await simulateStreamResponse(userInput)
}
</script>

<template>
  <div class="chat-container">
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
    </div>

    <div class="input-area">
      <el-input
        v-model="inputValue"
        placeholder="输入消息..."
        @keyup.enter="handleSend"
        clearable
      >
        <template #append>
          <el-button @click="handleSend" type="primary">发送</el-button>
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

.input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}
</style>
