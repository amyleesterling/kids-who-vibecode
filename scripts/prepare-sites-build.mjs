import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverDirectory = resolve(root, 'dist', 'server')

await mkdir(serverDirectory, { recursive: true })
await copyFile(
  resolve(root, 'dist', 'vibe_code_club_kids', 'index.js'),
  resolve(serverDirectory, 'index.js'),
)
