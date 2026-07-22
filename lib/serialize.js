import { downloadContentFromMessage, jidNormalizedUser, getContentType } from 'baileys'

export function smartMessage(msg, type) {
  return {
    ...msg,
    msg: msg[type],
    mediaKey: msg[type]?.mediaKey,
  }
}

export async function downloadMedia(message, type) {
  const stream = await downloadContentFromMessage(message, type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export function extractText(message) {
  if (!message) return ''
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.templateButtonReplyMessage?.selectedId ||
    ''
  )
}

export async function serialize(sock, msg) {
  if (!msg.message) return null

  const m = {}
  m.key = msg.key
  m.id = msg.key.id
  m.chat = msg.key.remoteJid
  m.isGroup = m.chat?.endsWith('@g.us')
  m.sender = m.isGroup ? jidNormalizedUser(msg.key.participant || msg.participant) : jidNormalizedUser(m.chat)
  m.fromMe = msg.key.fromMe
  m.pushName = msg.pushName || 'Usuario'

  const type = getContentType(msg.message) || ''
  m.mtype = type
  m.message = msg.message
  m.body = extractText(msg.message)

  const contextInfo =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message[type]?.contextInfo ||
    null

  if (contextInfo?.quotedMessage) {
    const qType = getContentType(contextInfo.quotedMessage)
    m.quoted = {
      key: {
        remoteJid: m.chat,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant,
        fromMe: contextInfo.participant === sock.user?.id,
      },
      message: contextInfo.quotedMessage,
      mtype: qType,
      text: extractText(contextInfo.quotedMessage),
      sender: jidNormalizedUser(contextInfo.participant),
      download: () => downloadMedia(contextInfo.quotedMessage[qType], qType.replace('Message', '')),
    }
  } else {
    m.quoted = null
  }

  m.mentionedJid = contextInfo?.mentionedJid || []

  m.isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)
  if (m.isMedia) {
    m.download = () => downloadMedia(msg.message[type], type.replace('Message', ''))
  }

  m.reply = (text, opts = {}) =>
    sock.sendMessage(m.chat, { text, ...opts }, { quoted: msg })

  m.react = (emoji) =>
    sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

  m.sendImage = (buffer, caption = '') =>
    sock.sendMessage(m.chat, { image: buffer, caption }, { quoted: msg })

  m.sendSticker = (buffer) =>
    sock.sendMessage(m.chat, { sticker: buffer }, { quoted: msg })

  m.raw = msg
  return m
}
