# AGENTS.md

## Dependencies
- **vue-element-plus-x**: AI-oriented Element Plus extension (Bubble, Thinking, Welcome components)
- **markstream-vue**: Streaming Markdown renderer with incremental DOM updates and virtual window support
- **@shikijs/stream**: Code block syntax highlighting via markstream-vue integration
- **element-plus**: UI component library for Vue 3
- **stream-markdown**: Markdown parsing engine used by markstream-vue

## Architecture
- Single-page chat interface with streaming AI responses
- Mock SSE simulation using setTimeout-based chunk delivery
- MarkStream component handles all Markdown rendering including code blocks

## What Didn't Work
- ❌ vue-element-plus-x named exports (ChatBubble, Typewriter, Message) — package only provides default export and individual component files under types/components/; switched to manual message layout with MarkStream for content rendering
