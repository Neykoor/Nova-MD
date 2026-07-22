export default {
  command: ['ban', 'unban'],
  description: 'Banea o desbanea a un usuario del uso del bot (solo owner)',
  category: 'owner',
  owner: true,
  handler: async ({ m, command, db }) => {
    const target = m.quoted?.sender || m.mentionedJid[0]
    if (!target) return m.reply('⚠️ Menciona o responde al usuario.')

    const banned = command === 'ban'
    db.saveUser(target, { banned })
    await m.reply(`${banned ? '🚫' : '✅'} @${target.split('@')[0]} fue ${banned ? 'baneado' : 'desbaneado'} del bot.`, {
      mentions: [target],
    })
  },
}
