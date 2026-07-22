const COOLDOWN = 30 * 60 * 1000
const JOBS = [
  'repartiste pizzas',
  'programaste una app',
  'lavaste autos',
  'diste clases de matemáticas',
  'vendiste tacos',
  'paseaste perros',
]

export default {
  command: ['work', 'trabajar'],
  description: 'Trabaja para ganar monedas (cooldown de 30 min)',
  category: 'rpg',
  handler: async ({ m, db }) => {
    const user = db.getUser(m.sender)
    if (!user.registered) return m.reply('⚠️ Primero regístrate con .register <nombre>')

    const now = Date.now()
    const remaining = COOLDOWN - (now - user.lastWork)
    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60_000)
      return m.reply(`⏳ Estás cansado. Puedes trabajar de nuevo en ${minutes} minutos.`)
    }

    const earned = Math.floor(Math.random() * 150) + 50
    const job = JOBS[Math.floor(Math.random() * JOBS.length)]

    db.saveUser(m.sender, { balance: user.balance + earned, lastWork: now })
    await m.reply(`💼 Hoy ${job} y ganaste *${earned}* monedas.`)
  },
}
