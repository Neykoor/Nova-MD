export default {
  command: ['register', 'registrar'],
  description: 'Regístrate en el sistema de economía del bot. Uso: .register Nombre',
  category: 'rpg',
  handler: async ({ m, args, db }) => {
    const user = db.getUser(m.sender)
    if (user.registered) return m.reply('✅ Ya estás registrado.')

    const name = args.join(' ')
    if (!name) return m.reply('⚠️ Uso: .register <tu nombre>')

    db.saveUser(m.sender, { registered: true, name, balance: 100 })
    await m.reply(`🎉 ¡Registro exitoso! Bienvenido/a *${name}*.\nSe te dieron 100 monedas de regalo.`)
  },
}
