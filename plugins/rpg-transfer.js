export default {
  command: ['transfer', 'transferir', 'dar'],
  description: 'Transfiere monedas a otro usuario. Uso: responde o menciona + cantidad',
  category: 'rpg',
  handler: async ({ m, args, db }) => {
    const user = db.getUser(m.sender)
    if (!user.registered) return m.reply('⚠️ Primero regístrate con .register <nombre>')

    const target = m.quoted?.sender || m.mentionedJid[0]
    if (!target) return m.reply('⚠️ Menciona o responde al usuario al que quieres transferir monedas.')
    if (target === m.sender) return m.reply('⚠️ No puedes transferirte monedas a ti mismo.')

    const amount = parseInt(args.find((a) => /^\d+$/.test(a)))
    if (!amount || amount <= 0) return m.reply('⚠️ Especifica una cantidad válida. Ej: .transfer 100 (respondiendo al usuario)')
    if (user.balance < amount) return m.reply('⚠️ No tienes suficientes monedas.')

    const targetUser = db.getUser(target)
    db.saveUser(m.sender, { balance: user.balance - amount })
    db.saveUser(target, { balance: targetUser.balance + amount })

    await m.reply(`✅ Transferiste *${amount}* monedas a @${target.split('@')[0]}.`, { mentions: [target] })
  },
}
