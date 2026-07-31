import { getSupabaseUrl } from '../supabase/client'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function requestLLMStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options?: {
    model?: string
    signal?: AbortSignal
  }
) {
  const { model = 'deepseek-v3.2', signal } = options ?? {}
  
  const response = await fetch(
    `${getSupabaseUrl()}/functions/v1/ai-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model, stream: true }),
      signal,
    }
  )
  
  if (!response.ok) throw new Error(`请求失败: ${response.status}`)
  if (!response.body) throw new Error('当前环境不支持流式响应')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)
        if (payload === '[DONE]') return fullText

        try {
          const json = JSON.parse(payload)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            fullText += content
            onChunk(content)
          }
        } catch {
          // 忽略非法 JSON 行
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return fullText
    throw err
  }

  return fullText
}
