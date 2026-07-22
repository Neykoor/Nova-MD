import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'
import { resolveFfmpegPath } from '../lib/ffmpegPath.js'

ffmpeg.setFfmpegPath(resolveFfmpegPath())

export default {
  command: ['toimg', 'aimagen'],
  description: 'Convierte un sticker (responde a uno) en imagen',
  category: 'sticker',
  handler: async ({ m }) => {
    const target = m.quoted?.mtype === 'stickerMessage' ? m.quoted : m.mtype === 'stickerMessage' ? m : null
    if (!target) return m.reply('⚠️ Responde a un sticker con .toimg')

    const buffer = await target.download()
    const tmpIn = path.join(os.tmpdir(), `${randomUUID()}.webp`)
    const tmpOut = path.join(os.tmpdir(), `${randomUUID()}.png`)
    fs.writeFileSync(tmpIn, buffer)

    await new Promise((resolve, reject) => {
      ffmpeg(tmpIn).toFormat('png').save(tmpOut).on('end', resolve).on('error', reject)
    })

    await m.sendImage(fs.readFileSync(tmpOut), '✅ Aquí está tu imagen')
    fs.unlinkSync(tmpIn)
    fs.unlinkSync(tmpOut)
  },
}
