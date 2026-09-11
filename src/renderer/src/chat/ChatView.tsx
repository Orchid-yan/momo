import { useEffect, useRef, useState, type JSX } from 'react'
import type { ChatMessage, PublicSettings } from '../../../shared/types'
import SettingsPanel from './SettingsPanel'

interface UiMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
}

export default function ChatView(): JSX.Element {
  const [panel, setPanel] = useState<'chat' | 'settings'>('chat')
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [draft, setDraft] = useState('')
  const [waiting, setWaiting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void window.momo.getSettings().then(setSettings)
    return window.momo.onShowSettings(() => setPanel('settings'))
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, waiting, panel])

  const send = async (): Promise<void> => {
    const text = draft.trim()
    if (!text || waiting) {
      return
    }
    if (settings && !settings.hasApiKey) {
      setPanel('settings')
      return
    }

    const userMessage: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text
    }
    const assistantId = `a-${Date.now()}`
    setDraft('')
    setWaiting(true)
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'assistant', content: '' }])

    const history: ChatMessage[] = [...messages, userMessage]
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .map((item) => ({ role: item.role as 'user' | 'assistant', content: item.content }))
      .filter((item) => item.content.trim().length > 0)

    const stop = window.momo.onChatChunk((chunk) => {
      if (chunk.type === 'delta' && chunk.text) {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId ? { ...item, content: item.content + chunk.text } : item
          )
        )
      }
    })

    const result = await window.momo.sendChat(history)
    stop()
    setWaiting(false)

    if (result.ok && result.content) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId && item.content.trim() === ''
            ? { ...item, content: result.content as string }
            : item
        )
      )
    }

    if (!result.ok) {
      setMessages((prev) => {
        const withoutEmpty = prev.filter(
          (item) => !(item.id === assistantId && item.content.trim() === '')
        )
        return [
          ...withoutEmpty,
          {
            id: `e-${Date.now()}`,
            role: 'error',
            content: result.error || '发送失败，请稍后重试。'
          }
        ]
      })
    }
  }

  return (
    <div className="chat-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div className="chat-avatar" aria-hidden>
            🐱
          </div>
          <div className="chat-title">
            <h1>Momo</h1>
            <p>{waiting ? '正在输入…' : '和通义千问聊天'}</p>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="设置"
            onClick={() => setPanel(panel === 'settings' ? 'chat' : 'settings')}
          >
            ⚙
          </button>
          <button type="button" className="icon-btn" aria-label="关闭聊天" onClick={() => window.momo.closeChat()}>
            ✕
          </button>
        </header>

        {panel === 'settings' ? (
          <SettingsPanel
            settings={settings}
            onSaved={(next) => {
              setSettings(next)
              setPanel('chat')
            }}
            onBack={() => setPanel('chat')}
          />
        ) : (
          <>
            <div className="messages" ref={listRef}>
              {messages.length === 0 ? (
                <div className="empty-state">
                  你好，我是 Momo。
                  <br />
                  {settings && !settings.hasApiKey
                    ? '还没有 API Key，点右上角齿轮去设置吧。'
                    : '在下面跟我说说话吧～'}
                </div>
              ) : (
                messages.map((item) => (
                  <div key={item.id} className={`bubble ${item.role}`}>
                    {item.content || (waiting && item.role === 'assistant' ? '' : item.content)}
                    {waiting && item.role === 'assistant' && item.content === '' ? (
                      <span className="typing">
                        <span className="typing-dots" aria-hidden>
                          <span />
                          <span />
                          <span />
                        </span>
                        Momo 正在想…
                      </span>
                    ) : null}
                  </div>
                ))
              )}
              {waiting && messages[messages.length - 1]?.role !== 'assistant' ? (
                <div className="bubble assistant">
                  <span className="typing">
                    <span className="typing-dots" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </span>
                    Momo 正在想…
                  </span>
                </div>
              ) : null}
            </div>
            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault()
                void send()
              }}
            >
              <textarea
                value={draft}
                placeholder="跟 Momo 说点什么…"
                rows={2}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void send()
                  }
                }}
              />
              <button className="send-btn" type="submit" disabled={waiting || !draft.trim()}>
                发送
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
