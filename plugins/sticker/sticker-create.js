import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'
import { resolveFfmpegPath } from '../../lib/ffmpegPath.js'

ffmpeg.setFfmpegPath(resolveFfmpegPath())

function convertToWebp(inputPath, isVideo) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.tmpdir(), `${randomUUID()}.webp`)
    const command = ffmpeg(inputPath)
      .outputOptions([
        '-vcodec', 'libwebp',
        '-vf', "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0",
        '-loop', '0',
        '-preset', 'default',
        '-an',
        '-vsync', '0',
        isVideo ? '-t' : '-frames:v', isVideo ? '6' : '1',
      ])
      .toFormat('webp')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
  })
}

export default {
  command: ['sticker', 's', 'figurina'],
  description: 'Convierte una imagen o video corto (responde a uno) en sticker',
  category: 'sticker',
  handler: async ({ m }) => {
    const target = m.quoted?.mtype ? m.quoted : m.isMedia ? m : null
    if (!target) return m.reply('⚠️ Responde a una imagen o video corto con .sticker (o envíalo con el comando en el caption).')

    const isVideo = target.mtype === 'videoMessage'
    const isImage = target.mtype === 'imageMessage'
    if (!isVideo && !isImage) return m.reply('⚠️ Solo se admiten imágenes o videos cortos.')

    await m.react('⏳')
    const buffer = await target.download()
    const tmpIn = path.join(os.tmpdir(), `${randomUUID()}.${isVideo ? 'mp4' : 'jpg'}`)
    fs.writeFileSync(tmpIn, buffer)

    try {
      const outPath = await convertToWebp(tmpIn, isVideo)
      const stickerBuffer = fs.readFileSync(outPath)
      await m.sendSticker(stickerBuffer)
      await m.react('✅')
      fs.unlinkSync(outPath)
    } catch (e) {
      console.error(e)
      await m.reply('❌ No pude convertir el archivo a sticker.')
    } finally {
      fs.unlinkSync(tmpIn)
    }
  },
}
