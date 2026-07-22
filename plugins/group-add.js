export default {
  command: ['add', 'agregar'],
  description: 'Agrega un número al grupo. Uso: .add 521234567890',
  category: 'grupo',
  group: true,
  admin: true,
  handler: async ({ sock, m, args }) => {
    const number = args[0]?.replace(/[^0-9]/g, '')
    if (!number) return m.reply('⚠️ Uso: .add 521234567890 (número con lada, sin +)')

    const jid = `${number}@s.whatsapp.net`
    try {
      const res = await sock.groupParticipantsUpdate(m.chat, [jid], 'add')
      const status = res?.[0]?.status
      if (status === '403') {
        return m.reply('⚠️ El usuario tiene la privacidad configurada para no ser agregado directamente. Se le puede enviar una invitación en su lugar.')
      }
      await m.reply(`✅ @${number} fue agregado al grupo.`, { mentions: [jid] })
    } catch (e) {
      await m.reply('❌ No pude agregar al usuario.')
    }
  },
}
