import { copyFile, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverDirectory = resolve(root, 'dist', 'server')
const adminDirectory = resolve(root, 'dist', 'client', 'clubhouse-admin')

await mkdir(serverDirectory, { recursive: true })
await mkdir(adminDirectory, { recursive: true })
await copyFile(
  resolve(root, 'dist', 'vibe_code_club_kids', 'index.js'),
  resolve(serverDirectory, 'index.js'),
)
await copyFile(
  resolve(root, 'dist', 'client', 'index.html'),
  resolve(adminDirectory, 'index.html'),
)

await rm(resolve(root, 'dist', 'vibe_code_club_kids', '.dev.vars'), { force: true })
