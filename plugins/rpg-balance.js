export default {
  command: ['balance', 'saldo', 'monedas'],
  description: 'Consulta tu saldo de monedas',
  category: 'rpg',
  handler: async ({ m, db }) => {
    const user = db.getUser(m.sender)
    if (!user.registered) return m.reply('⚠️ Primero regístrate con .register <nombre>')

    await m.reply(`💰 *${user.name}*\n👛 Cartera: ${user.balance} monedas\n🏦 Banco: ${user.bank} monedas`)
  },
}
