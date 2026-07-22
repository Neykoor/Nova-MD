export default {
  command: ['groupinfo', 'infogrupo'],
  description: 'Muestra información del grupo actual',
  category: 'grupo',
  group: true,
  handler: async ({ sock, m }) => {
    const metadata = await sock.groupMetadata(m.chat)
    const admins = metadata.participants.filter((p) => p.admin).length

    const text = `╭─❍ *${metadata.subject}* ❍
│ 🆔 ID: ${metadata.id}
│ 👥 Miembros: ${metadata.participants.length}
│ 👑 Administradores: ${admins}
│ 📝 Descripción: ${metadata.desc || 'Sin descripción'}
│ 📅 Creado: ${new Date(metadata.creation * 1000).toLocaleDateString()}
╰────────────`
    await m.reply(text)
  },
}
