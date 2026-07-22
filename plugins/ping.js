export default {
  command: 'ping',
  description: 'Verifica la velocidad de respuesta del bot',
  category: 'main',
  handler: async ({ m }) => {
    const start = Date.now()
    const sent = await m.reply('🏓 Calculando...')
    const latency = Date.now() - start
    await m.reply(`🏓 *Pong!*\n⏱️ ${latency}ms`)
  },
}
