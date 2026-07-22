import fs from 'fs'
import path from 'path'
import { __dirname } from '../config.js'

const DB_PATH = path.join(__dirname, 'database', 'database.json')

function loadRaw() {
  try {
    if (!fs.existsSync(DB_PATH)) return { users: {}, chats: {}, settings: {} }
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('[DB] Error al cargar la base de datos, se crea una nueva:', e.message)
    return { users: {}, chats: {}, settings: {} }
  }
}

class Database {
  constructor() {
    this.data = loadRaw()
    this._dirty = false
    setInterval(() => this.saveIfDirty(), 10_000)
  }

  save() {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2))
    this._dirty = false
  }

  saveIfDirty() {
    if (this._dirty) this.save()
  }

  markDirty() {
    this._dirty = true
  }

  getUser(jid) {
    if (!this.data.users[jid]) {
      this.data.users[jid] = {
        name: '',
        registered: false,
        balance: 0,
        bank: 0,
        exp: 0,
        level: 1,
        lastDaily: 0,
        lastWork: 0,
        banned: false,
        premium: false,
        warns: 0,
      }
      this.markDirty()
    }
    return this.data.users[jid]
  }

  saveUser(jid, patch) {
    const user = this.getUser(jid)
    Object.assign(user, patch)
    this.markDirty()
    return user
  }

  getChat(jid) {
    if (!this.data.chats[jid]) {
      this.data.chats[jid] = {
        welcome: true,
        antilink: false,
        antilink2: false,
        soloAdmins: false,
        detectAll: false,
        muted: false,
      }
      this.markDirty()
    }
    return this.data.chats[jid]
  }

  saveChat(jid, patch) {
    const chat = this.getChat(jid)
    Object.assign(chat, patch)
    this.markDirty()
    return chat
  }
}

export const db = new Database()
export default db
