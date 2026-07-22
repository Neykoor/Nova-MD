const DAILY_AMOUNT = 500
const COOLDOWN = 24 * 60 * 60 * 1000

export default {
  command: ['daily', 'diario'],
  description: 'Reclama tu recompensa diaria de monedas',
  category: 'rpg',
  handler: async ({ m, db }) => {
    const user = db.getUser(m.sender)
    if (!user.registered) return m.reply('⚠️ Primero regístrate con .register <nombre>')

    const now = Date.now()
    const remaining = COOLDOWN - (now - user.lastDaily)
    if (remaining > 0) {
      const hours = Math.floor(remaining / 3_600_000)
      const minutes = Math.floor((remaining % 3_600_000) / 60_000)
      return m.reply(`⏳ Ya reclamaste tu recompensa hoy. Vuelve en ${hours}h ${minutes}m.`)
    }

    db.saveUser(m.sender, { balance: user.balance + DAILY_AMOUNT, lastDaily: now })
    await m.reply(`🎁 Reclamaste tu recompensa diaria de *${DAILY_AMOUNT}* monedas!`)
  },
}
