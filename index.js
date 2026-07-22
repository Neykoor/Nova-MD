import chalk from 'chalk'
import cfonts from 'cfonts'
import { startBot } from './lib/connect.js'

cfonts.say('Nova MD', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'magenta'],
})

console.log(chalk.cyanBright('  Bot de WhatsApp Multi-Dispositivo — powered by @neykoor/baileys\n'))

process.on('uncaughtException', (err) => console.error(chalk.red('[UNCAUGHT]'), err))
process.on('unhandledRejection', (err) => console.error(chalk.red('[UNHANDLED]'), err))

startBot()
