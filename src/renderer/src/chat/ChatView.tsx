import { useEffect, useRef, useState, type JSX } from 'react'
import { appendDelta, completeTurn, startTurn, type UiMessage } from '../../../chat/conversation'
import type { PublicSettings } from '../../../shared/types'
import SettingsPanel from './SettingsPanel'

export default function ChatView(): JSX.Element {
  const [panel, setPanel] = useState<'chat' | 'settings'>('chat')
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [draft, setDraft] = useState('')
  const [waiting, setWaiting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void window.momo.getSettings().then(setSettings)
    const stopShow = window.momo.onShowSettings(() => setPanel('settings'))
    const stopSettings = window.momo.onSettingsChanged(setSettings)
    return () => {
      stopShow()
      stopSettings()
    }
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

    const started = startTurn(messages, text)
    setDraft('')
    setWaiting(true)
    setMessages(started.messages)

    const stop = window.momo.onChatChunk((chunk) => {
      if (chunk.type === 'delta' && chunk.text) {
        setMessages((prev) => appendDelta(prev, started.assistantId, chunk.text as string))
      }
    })

    const result = await window.momo.sendChat(started.history)
    stop()
    setWaiting(false)
    setMessages((prev) => completeTurn(prev, started.assistantId, result))
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
            <p>
              {waiting
                ? '正在输入…'
                : settings?.mockMode
                  ? '模拟回复（未调用千问）'
                  : '和通义千问聊天'}
            </p>
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
            <div className="messages" ref={listRef} data-testid="chat-messages">
              {settings?.mockMode ? (
                <div className="mock-banner">当前为模拟模式：发送消息不会请求 DashScope，也不会消耗额度。</div>
              ) : null}
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
                  <div key={item.id} className={`bubble ${item.role}`} data-testid={`bubble-${item.role}`}>
                    {item.content}
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
                data-testid="chat-input"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void send()
                  }
                }}
              />
              <button className="send-btn" type="submit" disabled={waiting || !draft.trim()} data-testid="chat-send">
                发送
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
