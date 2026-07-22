export default {
  command: ['antilink'],
  description: 'Activa o desactiva la eliminación automática de enlaces de grupo. Uso: .antilink on/off',
  category: 'config',
  group: true,
  admin: true,
  handler: async ({ m, args, db }) => {
    const opt = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(opt)) return m.reply('⚠️ Uso: .antilink on | .antilink off')

    db.saveChat(m.chat, { antilink: opt === 'on' })
    await m.reply(`✅ Antilink ${opt === 'on' ? 'activado' : 'desactivado'} en este grupo.`)
  },
}
