export default {
  command: ['kick', 'expulsar'],
  description: 'Expulsa a un usuario del grupo (responde o menciona)',
  category: 'grupo',
  group: true,
  admin: true,
  handler: async ({ sock, m }) => {
    const target = m.quoted?.sender || m.mentionedJid[0]
    if (!target) return m.reply('⚠️ Menciona o responde al mensaje del usuario que quieres expulsar.')

    try {
      await sock.groupParticipantsUpdate(m.chat, [target], 'remove')
      await m.reply(`✅ @${target.split('@')[0]} fue expulsado del grupo.`, { mentions: [target] })
    } catch (e) {
      await m.reply('❌ No pude expulsar al usuario. ¿Soy administrador del grupo?')
    }
  },
}
