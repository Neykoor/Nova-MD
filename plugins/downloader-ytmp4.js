import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

export default {
  command: ['ytmp4', 'video'],
  description: 'Busca y descarga video de YouTube (calidad baja/media). Uso: .ytmp4 <búsqueda o URL>',
  category: 'descargas',
  handler: async ({ sock, m, text }) => {
    if (!text) return m.reply('⚠️ Uso: .ytmp4 <nombre del video o URL>')

    await m.react('🔎')
    let url = text
    let title = 'video'

    if (!ytdl.validateURL(text)) {
      const { videos } = await yts(text)
      if (!videos.length) return m.reply('❌ No encontré resultados.')
      url = videos[0].url
      title = videos[0].title
    }

    await m.reply(`🎬 Descargando: *${title}*...`)

    try {
      const stream = ytdl(url, { filter: (f) => f.container === 'mp4' && f.hasVideo && f.hasAudio, quality: 'highest' })
      const chunks = []
      for await (const chunk of stream) chunks.push(chunk)
      const buffer = Buffer.concat(chunks)

      await sock.sendMessage(m.chat, { video: buffer, caption: `🎬 *${title}*`, mimetype: 'video/mp4' }, { quoted: m.raw })
      await m.react('✅')
    } catch (e) {
      console.error(e)
      await m.reply('❌ No pude descargar el video. Puede ser muy pesado o restringido.')
    }
  },
}
