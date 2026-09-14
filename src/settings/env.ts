import { existsSync, readFileSync } from 'fs'

export function loadEnvFile(filePath: string, env: NodeJS.Dict<string> = process.env): void {
  if (!existsSync(filePath)) {
    return
  }
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eq = trimmed.indexOf('=')
    if (eq <= 0) {
      continue
    }
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (env[key] === undefined) {
      env[key] = value
    }
  }
}
