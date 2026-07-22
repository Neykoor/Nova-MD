import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

export default {
  command: ['play', 'reproducir'],
  description: 'Busca y descarga audio de YouTube. Uso: .play <nombre de la canción>',
  category: 'descargas',
  handler: async ({ sock, m, text }) => {
    if (!text) return m.reply('⚠️ Uso: .play <nombre de la canción>')

    await m.react('🔎')
    const { videos } = await yts(text)
    if (!videos.length) return m.reply('❌ No encontré resultados.')

    const video = videos[0]
    await m.reply(`🎵 *${video.title}*\n⏱️ Duración: ${video.timestamp}\n👀 Vistas: ${video.views.toLocaleString()}\n\nDescargando audio...`)

    try {
      const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' })
      const chunks = []
      for await (const chunk of stream) chunks.push(chunk)
      const buffer = Buffer.concat(chunks)

      await sock.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`,
        },
        { quoted: m.raw }
      )
      await m.react('✅')
    } catch (e) {
      console.error(e)
      await m.reply('❌ No pude descargar el audio. Intenta con otra canción.')
    }
  },
}
