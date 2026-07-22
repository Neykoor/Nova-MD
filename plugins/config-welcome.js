export default {
  command: ['welcome', 'bienvenida'],
  description: 'Activa o desactiva los mensajes de bienvenida/despedida. Uso: .welcome on/off',
  category: 'config',
  group: true,
  admin: true,
  handler: async ({ m, args, db }) => {
    const opt = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(opt)) return m.reply('⚠️ Uso: .welcome on | .welcome off')

    db.saveChat(m.chat, { welcome: opt === 'on' })
    await m.reply(`✅ Bienvenida/despedida ${opt === 'on' ? 'activada' : 'desactivada'} en este grupo.`)
  },
}
