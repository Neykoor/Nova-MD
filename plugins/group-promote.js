export default {
  command: ['promote', 'promover'],
  description: 'Convierte a un usuario en administrador',
  category: 'grupo',
  group: true,
  admin: true,
  handler: async ({ sock, m }) => {
    const target = m.quoted?.sender || m.mentionedJid[0]
    if (!target) return m.reply('⚠️ Menciona o responde al mensaje del usuario que quieres promover.')

    try {
      await sock.groupParticipantsUpdate(m.chat, [target], 'promote')
      await m.reply(`⭐ @${target.split('@')[0]} ahora es administrador.`, { mentions: [target] })
    } catch (e) {
      await m.reply('❌ No pude promover al usuario.')
    }
  },
}
