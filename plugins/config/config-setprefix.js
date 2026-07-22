export default {
  command: ['setprefix'],
  description: 'Cambia el prefijo de comandos para este chat. Uso: .setprefix $ | .setprefix reset',
  category: 'config',
  admin: true,
  handler: async ({ m, args, db, isOwner }) => {
    if (!m.isGroup && !isOwner) {
      return m.reply('🔒 En chat privado, este comando es solo para el owner del bot.')
    }

    const nuevo = args[0]

    if (!nuevo) {
      return m.reply('⚠️ Uso: .setprefix <nuevoPrefijo>\nEjemplo: .setprefix $\nPara volver al prefijo por defecto: .setprefix reset')
    }

    if (nuevo.toLowerCase() === 'reset') {
      db.saveChat(m.chat, { prefix: null })
      return m.reply('✅ Prefijo restablecido al valor por defecto.')
    }

    if (nuevo.length > 5 || /\s/.test(nuevo)) {
      return m.reply('⚠️ El prefijo debe ser corto y sin espacios.')
    }

    db.saveChat(m.chat, { prefix: nuevo })
    await m.reply(`✅ Prefijo actualizado a: ${nuevo}\nAhora los comandos se usan así: ${nuevo}menu`)
  },
}
