#!/usr/bin/env node
/**
 * Headless-ish smoke: starts the packaged main process with a mock Qwen client.
 * Never calls DashScope. Requires a display on Linux (Xvfb / existing DISPLAY).
 */
const { spawn } = require('node:child_process')
const { mkdtempSync, readFileSync, existsSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')

const electron = require('electron')
const userData = mkdtempSync(join(tmpdir(), 'momo-smoke-'))
const resultPath = join(userData, 'smoke-result.json')

const child = spawn(
  electron,
  ['.', `--user-data-dir=${userData}`],
  {
    cwd: join(__dirname, '..'),
    env: {
      ...process.env,
      MOMO_SMOKE_TEST: '1',
      MOMO_MOCK_QWEN: '1',
      MOMO_NO_SANDBOX: '1',
      MOMO_SMOKE_OUT: resultPath,
      DISPLAY: process.env.DISPLAY || ':1'
    },
    stdio: 'inherit'
  }
)

const timeout = setTimeout(() => {
  child.kill('SIGKILL')
  console.error('smoke timed out')
  process.exit(1)
}, 45000)

child.on('exit', (code) => {
  clearTimeout(timeout)
  if (!existsSync(resultPath)) {
    console.error('smoke-result.json was not written')
    process.exit(code ?? 1)
  }
  const payload = JSON.parse(readFileSync(resultPath, 'utf8'))
  console.log('smoke result:', JSON.stringify(payload, null, 2))
  process.exit(payload.ok && code === 0 ? 0 : 1)
})
