export default {
  command: ['demote', 'degradar'],
  description: 'Quita el rol de administrador a un usuario',
  category: 'grupo',
  group: true,
  admin: true,
  handler: async ({ sock, m }) => {
    const target = m.quoted?.sender || m.mentionedJid[0]
    if (!target) return m.reply('⚠️ Menciona o responde al mensaje del usuario que quieres degradar.')

    try {
      await sock.groupParticipantsUpdate(m.chat, [target], 'demote')
      await m.reply(`⬇️ @${target.split('@')[0]} ya no es administrador.`, { mentions: [target] })
    } catch (e) {
      await m.reply('❌ No pude degradar al usuario.')
    }
  },
}
