import { fileURLToPath } from 'url'
import path from 'path'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  // Número(s) del owner/dueño del bot, formato: '521234567890'
  owner: ['000000000000'],

  // Nombre del bot, se usa en el menú y mensajes
  botName: 'Nova MD',

  // Prefijo(s) de comandos. Puedes poner varios: ['.', '!', '/']
  prefix: ['.', '!', '#'],

  // Método de login por defecto: 'qr' o 'code'. Si no usas --qr/--code al iniciar,
  // el bot te preguntará por consola la primera vez (o si borras la carpeta "session").
  loginMethod: process.argv.includes('--code') ? 'code' : 'qr',

  // Número para el código de emparejamiento. Solo se usa si eliges "code" y no
  // lo escribes cuando el bot te lo pregunte por consola.
  phoneNumber: '521234567890',

  // Zona horaria para saludos/fecha
  timezone: 'America/Mexico_City',

  // Auto leer mensajes
  autoRead: false,

  // Rechazar llamadas automáticamente
  rejectCalls: true,
}
