import { getAllPluginsUnique } from '../../lib/pluginLoader.js'

export default {
  command: ['menu', 'help', 'ayuda'],
  description: 'Muestra el menú de comandos disponibles',
  category: 'main',
  handler: async ({ m, config }) => {
    const all = getAllPluginsUnique()
    const categories = {}

    for (const p of all) {
      const cat = p.category || 'otros'
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(Array.isArray(p.command) ? p.command[0] : p.command)
    }

    const prefix = config.prefix[0]
    let text = `╭─❍ *${config.botName}* ❍\n`
    text += `│ 👤 Usuario: ${m.pushName}\n`
    text += `│ 🔣 Prefijo: ${config.prefix.join(' ')}\n`
    text += `│ 📦 Comandos: ${all.length}\n`
    text += `╰────────────\n\n`

    for (const [cat, cmds] of Object.entries(categories)) {
      text += `┌─「 *${cat.toUpperCase()}* 」\n`
      for (const c of cmds) text += `│ ${prefix}${c}\n`
      text += `└────────────\n\n`
    }

    text += `_Escribe ${prefix}help <comando> para más detalles._`

    await m.reply(text)
  },
}
