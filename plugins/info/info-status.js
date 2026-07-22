import os from 'os'

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const mnt = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${d}d ${h}h ${mnt}m ${s}s`
}

export default {
  command: ['status', 'estado', 'runtime'],
  description: 'Muestra el estado del servidor y del bot',
  category: 'info',
  handler: async ({ m, config }) => {
    const used = process.memoryUsage().rss / 1024 / 1024
    const total = os.totalmem() / 1024 / 1024
    const text = `╭─❍ *ESTADO DEL BOT* ❍
│ 🤖 Nombre: ${config.botName}
│ ⏱️ Uptime: ${formatUptime(process.uptime())}
│ 💾 RAM usada: ${used.toFixed(2)} MB
│ 💽 RAM total: ${total.toFixed(0)} MB
│ 🖥️ Plataforma: ${os.platform()} (${os.arch()})
│ 🧠 CPUs: ${os.cpus().length}
╰────────────`
    await m.reply(text)
  },
}
