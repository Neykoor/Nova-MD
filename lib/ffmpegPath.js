import { execSync } from 'child_process'
import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export function resolveFfmpegPath() {
  const isTermux = !!process.env.PREFIX && process.env.PREFIX.includes('com.termux')

  if (!isTermux) {
    try {
      const ffmpegStatic = require('ffmpeg-static')
      if (ffmpegStatic && fs.existsSync(ffmpegStatic)) return ffmpegStatic
    } catch {
    }
  }

  try {
    const systemPath = execSync(process.platform === 'win32' ? 'where ffmpeg' : 'which ffmpeg')
      .toString()
      .trim()
      .split('\n')[0]
    if (systemPath) return systemPath
  } catch {
  }

  console.warn(
    '[FFMPEG] No se encontró ffmpeg. Instálalo con "pkg install ffmpeg" (Termux) o "apt install ffmpeg" (Linux).'
  )
  return 'ffmpeg' // deja que fluent-ffmpeg falle con un error claro si no existe
}
