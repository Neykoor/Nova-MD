import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} from 'baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import readline from 'readline'
import chalk from 'chalk'
import qrcodeTerminal from 'qrcode-terminal'
import path from 'path'

import config, { __dirname } from '../config.js'
import { serialize } from './serialize.js'
import { plugins, loadPlugins, watchPlugins } from './pluginLoader.js'
import db from './database.js'

const logger = pino({ level: 'silent' })
const SESSION_DIR = path.join(__dirname, 'session')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

export async function startBot() {
  await loadPlugins()
  watchPlugins()

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  let loginMethod = config.loginMethod
  let phoneNumber = config.phoneNumber

  if (!state.creds.registered) {
    const forced = process.argv.includes('--code') ? 'code' : process.argv.includes('--qr') ? 'qr' : null

    if (forced) {
      loginMethod = forced
    } else {
      console.log(chalk.cyan('\n[NOVA MD] ¿Cómo quieres vincular el bot?'))
      console.log(chalk.cyan('  1. Código QR'))
      console.log(chalk.cyan('  2. Código de emparejamiento'))
      const choice = (await question(chalk.yellow('Elige una opción (1/2): '))).trim()
      loginMethod = choice === '2' ? 'code' : 'qr'
    }

    if (loginMethod === 'code') {
      const answer = (await question(chalk.yellow('\n[NOVA MD] Escribe tu número de WhatsApp con lada, sin "+" (ej. 521234567890): '))).trim()
      phoneNumber = answer.replace(/[^0-9]/g, '') || config.phoneNumber
    }
  }

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: [config.botName, 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
  })

  if (loginMethod === 'code' && !sock.authState.creds.registered) {
    const phone = phoneNumber.replace(/[^0-9]/g, '')
    setTimeout(async () => {
      const code = await sock.requestPairingCode(phone)
      console.log(chalk.green(`\n[NOVA MD] Tu código de emparejamiento es: ${chalk.bold(code)}\n`))
    }, 3000)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr && loginMethod === 'qr') {
      console.log(chalk.cyan('\n[NOVA MD] Escanea este código QR con WhatsApp:\n'))
      qrcodeTerminal.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log(chalk.red(`[CONEXIÓN] Cerrada. Código: ${statusCode}. Reconectando: ${shouldReconnect}`))
      if (shouldReconnect) startBot()
      else console.log(chalk.red('[CONEXIÓN] Sesión cerrada (logged out). Borra la carpeta "session" e inicia de nuevo.'))
    } else if (connection === 'open') {
      console.log(chalk.green(`[NOVA MD] Conectado correctamente como ${sock.user?.id}`))
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('call', async (calls) => {
    if (!config.rejectCalls) return
    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from)
      }
    }
  })

  sock.ev.on('group-participants.update', async (event) => {
    try {
      const chatConf = db.getChat(event.id)
      if (!chatConf.welcome) return
      const metadata = await sock.groupMetadata(event.id)
      for (const participant of event.participants) {
        const name = participant.split('@')[0]
        if (event.action === 'add') {
          await sock.sendMessage(event.id, {
            text: `👋 ¡Bienvenido/a @${name} a *${metadata.subject}*!\n\nSomos ${metadata.participants.length} miembros ahora.`,
            mentions: [participant],
          })
        } else if (event.action === 'remove') {
          await sock.sendMessage(event.id, {
            text: `👋 @${name} salió del grupo. ¡Hasta pronto!`,
            mentions: [participant],
          })
        }
      }
    } catch (e) {
      console.error('[GROUP-EVENT] Error:', e.message)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const rawMsg of messages) {
      try {
        if (!rawMsg.message) continue
        if (rawMsg.key.remoteJid === 'status@broadcast') continue

        const m = await serialize(sock, rawMsg)
        if (!m) continue

        if (config.autoRead) await sock.readMessages([m.key])

        await handleMessage(sock, m)
      } catch (e) {
        console.error(chalk.red('[HANDLER] Error procesando mensaje:'), e)
      }
    }
  })

  return sock
}

async function handleMessage(sock, m) {
  const user = db.getUser(m.sender)
  if (user.banned && !config.owner.includes(m.sender.split('@')[0])) return

  if (m.isGroup && m.body) {
    const chatConf = db.getChat(m.chat)
    const linkRegex = /(chat\.whatsapp\.com\/[A-Za-z0-9]+)/i
    if (chatConf.antilink && linkRegex.test(m.body)) {
      try {
        const metadata = await sock.groupMetadata(m.chat)
        const participant = metadata.participants.find((p) => jidNormalizedUser(p.id) === m.sender)
        const isAdmin = participant?.admin
        if (!isAdmin) {
          await sock.sendMessage(m.chat, { delete: m.key })
          await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
          await sock.sendMessage(m.chat, { text: `🚫 @${m.sender.split('@')[0]} fue eliminado por enviar un enlace de grupo.`, mentions: [m.sender] })
          return
        }
      } catch (e) {
        console.error('[ANTILINK] Error:', e.message)
      }
    }
  }

  if (!m.body || !m.body.startsWith) return

  const prefixUsed = config.prefix.find((p) => m.body.startsWith(p))
  if (!prefixUsed) return

  const withoutPrefix = m.body.slice(prefixUsed.length).trim()
  const [cmdRaw, ...args] = withoutPrefix.split(/\s+/)
  const cmd = (cmdRaw || '').toLowerCase()
  if (!cmd) return

  const plugin = plugins.get(cmd)
  if (!plugin) return

  const isOwner = config.owner.includes(m.sender.split('@')[0])
  if (plugin.owner && !isOwner) {
    return m.reply('🔒 Este comando es exclusivo para el owner del bot.')
  }
  if (plugin.group && !m.isGroup) {
    return m.reply('⚠️ Este comando solo funciona dentro de grupos.')
  }

  if (plugin.admin && m.isGroup) {
    try {
      const metadata = await sock.groupMetadata(m.chat)
      const participant = metadata.participants.find((p) => jidNormalizedUser(p.id) === m.sender)
      if (!participant?.admin && !isOwner) {
        return m.reply('⚠️ Este comando solo lo pueden usar administradores del grupo.')
      }
    } catch {}
  }

  try {
    await plugin.handler({
      sock,
      m,
      args,
      text: args.join(' '),
      command: cmd,
      db,
      config,
      isOwner,
    })
  } catch (e) {
    console.error(chalk.red(`[CMD:${cmd}] Error:`), e)
    m.reply(`❌ Ocurrió un error al ejecutar el comando:\n\`\`\`${e.message}\`\`\``)
  }
}
  
