import { app } from 'electron'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { sendChatMessage } from '../chat/service'
import { createQwenClient, isMockQwen } from '../qwen/factory'
import { looksLikeApiKey } from '../settings/keyFormat'
import { getChatWindow, getPetWindow, openChatFromPet } from '../ui/windows'
import { getSettingsStore } from './store-singleton'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runSmokeTest(): Promise<void> {
  const outPath = process.env.MOMO_SMOKE_OUT || join(app.getPath('userData'), 'smoke-result.json')
  try {
    const store = getSettingsStore()
    const saved = store.save({
      apiKey: 'sk-mocklocalkey99',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus'
    })

    const pet = getPetWindow()
    pet?.showInactive()
    await wait(300)

    let windowMoved = false
    if (pet && !pet.isDestroyed()) {
      const [sx, sy] = pet.getPosition()
      pet.setPosition(sx - 80, sy - 60)
      await wait(50)
      const [nx, ny] = pet.getPosition()
      windowMoved = nx !== sx || ny !== sy
    }

    openChatFromPet()
    await wait(300)

    const chat = getChatWindow()
    const chatOpened = Boolean(chat && !chat.isDestroyed() && chat.isVisible())
    const petVisible = Boolean(pet && !pet.isDestroyed() && pet.isVisible())

    const deltas: string[] = []
    const result = await sendChatMessage({
      messages: [{ role: 'user', content: '你好呀' }],
      settings: store.resolve(),
      client: createQwenClient(),
      onDelta: (text) => deltas.push(text)
    })

    const payload = {
      ok:
        result.ok === true &&
        chatOpened &&
        windowMoved &&
        looksLikeApiKey(saved.apiKey) &&
        Boolean(result.content?.includes('【模拟】')),
      chatOpened,
      windowMoved,
      petMovable: pet?.isMovable() ?? false,
      petVisible,
      mockMode: isMockQwen(),
      savedApiKeyLooksValid: looksLikeApiKey(saved.apiKey),
      reply: result.content ?? '',
      deltaCount: deltas.length,
      error: result.error ?? null
    }

    writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
    app.exit(payload.ok ? 0 : 1)
  } catch (error) {
    writeFileSync(
      outPath,
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2),
      'utf8'
    )
    app.exit(1)
  }
}
