import { useEffect, useState, type JSX } from 'react'
import {
  BUBBLE_INTERVAL_PRESETS,
  DEFAULT_ALWAYS_ON_TOP,
  DEFAULT_PET_RENDERER,
  DEFAULT_PROACTIVE_BUBBLES_ENABLED,
  DEFAULT_PROACTIVE_INTERVAL_MS,
  normalizePetRenderer,
  type PetRenderer
} from '../../../shared/petLife'
import {
  BASE_URL_PRESETS,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  MODEL_PRESETS,
  type PublicSettings
} from '../../../shared/types'

interface SettingsPanelProps {
  settings: PublicSettings | null
  onSaved: (settings: PublicSettings) => void
  onBack: () => void
}

export default function SettingsPanel({
  settings,
  onSaved,
  onBack
}: SettingsPanelProps): JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState(DEFAULT_BASE_URL)
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [alwaysOnTop, setAlwaysOnTop] = useState(DEFAULT_ALWAYS_ON_TOP)
  const [proactiveBubblesEnabled, setProactiveBubblesEnabled] = useState(
    DEFAULT_PROACTIVE_BUBBLES_ENABLED
  )
  const [proactiveBubbleIntervalMs, setProactiveBubbleIntervalMs] = useState(
    DEFAULT_PROACTIVE_INTERVAL_MS
  )
  const [petRenderer, setPetRenderer] = useState<PetRenderer>(DEFAULT_PET_RENDERER)
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!settings) {
      return
    }
    setApiKey(settings.apiKey)
    setBaseURL(settings.baseURL)
    setModel(settings.model)
    setAlwaysOnTop(settings.alwaysOnTop)
    setProactiveBubblesEnabled(settings.proactiveBubblesEnabled)
    setProactiveBubbleIntervalMs(settings.proactiveBubbleIntervalMs)
    setPetRenderer(normalizePetRenderer(settings.petRenderer))
  }, [settings])

  const presetId =
    BASE_URL_PRESETS.find((item) => item.url === baseURL)?.id ?? 'custom'

  const save = async (): Promise<void> => {
    setSaving(true)
    setSaved(false)
    const next = await window.momo.saveSettings({
      apiKey,
      baseURL,
      model,
      alwaysOnTop,
      proactiveBubblesEnabled,
      proactiveBubbleIntervalMs,
      petRenderer
    })
    setSaving(false)
    setSaved(true)
    onSaved(next)
  }

  return (
    <div className="settings-panel">
      <h2>设置</h2>
      <p className="hint">
        在阿里云百炼控制台创建 API Key。密钥只保存在本机用户目录，不会写入代码仓库。保存操作<b>不会</b>请求
        DashScope。也可以把密钥放到项目根目录的 <code>.env</code>（参考 <code>.env.example</code>）。
      </p>
      {settings?.mockMode ? (
        <p className="mock-banner">模拟模式已开启：聊天走本地假回复，保存密钥也不会联网。</p>
      ) : null}

      <div className="field">
        <label htmlFor="api-key">DashScope API Key</label>
        <div className="row">
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-…"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <button type="button" className="icon-btn" onClick={() => setShowKey((value) => !value)}>
            {showKey ? '隐' : '显'}
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="base-url-preset">接口地域 / Base URL</label>
        <select
          id="base-url-preset"
          value={presetId}
          onChange={(event) => {
            const preset = BASE_URL_PRESETS.find((item) => item.id === event.target.value)
            if (preset) {
              setBaseURL(preset.url)
            }
          }}
        >
          {BASE_URL_PRESETS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
          <option value="custom">自定义</option>
        </select>
        <input
          className="url-input"
          aria-label="Base URL"
          title={baseURL}
          value={baseURL}
          onChange={(event) => setBaseURL(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="model">模型</label>
        <select
          id="model"
          value={(MODEL_PRESETS as readonly string[]).includes(model) ? model : 'custom'}
          onChange={(event) => {
            if (event.target.value !== 'custom') {
              setModel(event.target.value)
            }
          }}
        >
          {MODEL_PRESETS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value="custom">自定义</option>
        </select>
        <input
          aria-label="模型名称"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        />
      </div>

      <h3>桌面宠物</h3>
      <div className="field">
        <label htmlFor="pet-renderer">外形</label>
        <select
          id="pet-renderer"
          value={petRenderer}
          onChange={(event) => setPetRenderer(normalizePetRenderer(event.target.value))}
        >
          <option value="3d">3D宠物（视觉原型）</option>
          <option value="2d">2D图片</option>
        </select>
      </div>
      <label className="field-check">
        <input
          type="checkbox"
          checked={alwaysOnTop}
          onChange={(event) => setAlwaysOnTop(event.target.checked)}
        />
        <span>始终置顶（默认开启）</span>
      </label>
      <label className="field-check">
        <input
          type="checkbox"
          checked={proactiveBubblesEnabled}
          onChange={(event) => setProactiveBubblesEnabled(event.target.checked)}
        />
        <span>允许小猫主动说话（想你了、饿饿、休息提醒等）</span>
      </label>
      <div className="field">
        <label htmlFor="bubble-interval">主动说话间隔</label>
        <select
          id="bubble-interval"
          value={
            BUBBLE_INTERVAL_PRESETS.some((item) => item.ms === proactiveBubbleIntervalMs)
              ? String(proactiveBubbleIntervalMs)
              : String(DEFAULT_PROACTIVE_INTERVAL_MS)
          }
          disabled={!proactiveBubblesEnabled}
          onChange={(event) => setProactiveBubbleIntervalMs(Number(event.target.value))}
        >
          {BUBBLE_INTERVAL_PRESETS.map((item) => (
            <option key={item.ms} value={item.ms}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <p className="hint">3D 是看感觉的原型，不是最终毛发。可随时切回 2D 图片对比。不会随 Windows 开机启动。托盘菜单也可以开关置顶、主动说话，以及让小猫睡觉（隐藏）。</p>

      <button className="save-btn" type="button" disabled={saving} onClick={() => void save()}>
        {saving ? '保存中…' : '保存'}
      </button>
      <button className="ghost-btn" type="button" onClick={onBack}>
        返回聊天
      </button>
      {saved ? <p className="status-ok">已保存到本机。</p> : null}
      {settings?.hasApiKey ? (
        <p className="hint">当前已检测到可用密钥（设置或环境变量）。</p>
      ) : (
        <p className="hint">还没有密钥：保存后才能让通义千问回复。</p>
      )}
    </div>
  )
}
