export default {
  command: ['tagall', 'mencionartodos'],
  description: 'Menciona a todos los miembros del grupo',
  category: 'grupo',
  group: true,
  admin: true,
  handler: async ({ sock, m, text }) => {
    const metadata = await sock.groupMetadata(m.chat)
    const participants = metadata.participants.map((p) => p.id)

    let msg = `📢 *${text || 'Mención general'}*\n\n`
    for (const jid of participants) msg += `↺ @${jid.split('@')[0]}\n`

    await sock.sendMessage(m.chat, { text: msg, mentions: participants })
  },
}
