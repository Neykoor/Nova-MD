# Nova MD — Bot de WhatsApp

Bot multi-dispositivo para WhatsApp construido con `@neykoor/baileys` (importado como `baileys`), con sistema de plugins, economía tipo RPG, administración de grupos, stickers y descargas de YouTube.

## 🚀 Instalación

```bash
npm install
```

> Requiere Node.js 18 o superior.

### 📱 Instalación en Termux

Sí funciona en Termux. Solo instala Node y ffmpeg del sistema antes de `npm install`, porque el paquete `ffmpeg-static` no trae binario para Android/ARM (por eso quedó como dependencia opcional; si falla al instalarlo, ignóralo, el bot usa el ffmpeg del sistema automáticamente):

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git ffmpeg -y

git clone <tu-repo-o-descomprime-el-zip>
cd nova-md
npm install
npm start
```

Recomendaciones para Termux:
- Usa `termux-wake-lock` antes de iniciar el bot para que Android no lo mate en segundo plano.
- Si vas a dejarlo corriendo 24/7, considera `pkg install tmux` para mantener la sesión viva aunque cierres la app.
- Las descargas de video (`ytmp4`) pueden ser lentas o pesadas en un celular; `play` (solo audio) funciona mejor.
- Si `npm install` falla por `@distube/ytdl-core` u otro paquete nativo, corre `pkg install python make clang` (herramientas de compilación) y vuelve a intentar.

## ⚙️ Configuración

Edita `config.js`:

- `owner`: número(s) del dueño del bot (sin `+`, con lada).
- `botName`: nombre que se muestra en el menú.
- `prefix`: prefijos aceptados para comandos (por defecto `.`, `!`, `#`).
- `loginMethod`: `'qr'` o `'code'`.
- `phoneNumber`: tu número si usas login por código.

## ▶️ Iniciar el bot

```bash
# Con código QR (por defecto)
npm start

# Con código de emparejamiento
npm run code
```

La sesión se guarda en la carpeta `session/`. Si necesitas cerrar sesión, borra esa carpeta y vuelve a iniciar.

## 🧩 Estructura del proyecto

```
├── index.js              # Punto de entrada
├── config.js             # Configuración global
├── lib/
│   ├── connect.js        # Conexión a WhatsApp y despacho de eventos
│   ├── serialize.js       # Normaliza los mensajes entrantes
│   ├── pluginLoader.js     # Carga dinámica de plugins (hot-reload)
│   └── database.js        # Base de datos JSON simple
├── plugins/               # Un archivo = uno o más comandos
└── database/database.json # Persistencia de usuarios y chats
```

## ✍️ Crear un plugin nuevo

Cada archivo en `plugins/` exporta por defecto un objeto:

```js
export default {
  command: ['saludo', 'hola'],   // uno o varios alias
  description: 'Saluda al usuario',
  category: 'main',
  owner: false,   // true = solo el owner
  group: false,   // true = solo funciona en grupos
  admin: false,   // true = solo admins del grupo
  handler: async ({ sock, m, args, text, command, db, config, isOwner }) => {
    await m.reply('¡Hola!')
  },
}
```

El bot detecta automáticamente los cambios en `plugins/` y recarga sin reiniciar.

## 📦 Comandos incluidos

- **Principal:** menu, ping, status
- **Grupo:** kick, promote, demote, add, tagall, groupinfo
- **Config:** antilink on/off, welcome on/off
- **Stickers:** sticker (imagen/video → sticker), toimg (sticker → imagen)
- **RPG/Economía:** register, daily, work, balance, transfer
- **Descargas:** play (audio de YouTube), ytmp4 (video de YouTube)
- **Owner:** bc (broadcast), ban/unban

## ⚠️ Nota

Este bot no incluye plugins de contenido sexual explícito ni comandos que simulen violencia sexual contra otros usuarios — ese tipo de comandos no forman parte de este proyecto por diseño.
