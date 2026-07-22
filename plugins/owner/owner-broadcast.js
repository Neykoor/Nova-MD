export default {
  command: ['bc', 'broadcast'],
  description: 'Envía un mensaje a todos los chats del bot (solo owner)',
  category: 'owner',
  owner: true,
  handler: async ({ sock, m, text, db }) => {
    if (!text) return m.reply('⚠️ Uso: .bc <mensaje>')

    const chats = Object.keys(db.data.chats)
    let sent = 0
    for (const chat of chats) {
      try {
        await sock.sendMessage(chat, { text: `📢 *ANUNCIO*\n\n${text}` })
        sent++
        await new Promise((r) => setTimeout(r, 500))
      } catch {}
    }
    await m.reply(`✅ Anuncio enviado a ${sent}/${chats.length} chats.`)
  },
}
