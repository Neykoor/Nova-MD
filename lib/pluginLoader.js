import fs from 'fs'
import path from 'path'
import url from 'url'
import chalk from 'chalk'
import { __dirname } from '../config.js'

const PLUGINS_DIR = path.join(__dirname, 'plugins')

export const plugins = new Map()

export async function loadPlugins() {
  plugins.clear()
  const files = fs.readdirSync(PLUGINS_DIR).filter((f) => f.endsWith('.js'))

  for (const file of files) {
    try {
      const fullPath = path.join(PLUGINS_DIR, file)
      const fileUrl = url.pathToFileURL(fullPath).href + `?update=${Date.now()}`
      const mod = await import(fileUrl)
      const plugin = mod.default
      if (!plugin || !plugin.command) {
        console.log(chalk.yellow(`[PLUGINS] "${file}" no exporta un comando válido, se omite.`))
        continue
      }
      const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
      for (const cmd of commands) {
        plugins.set(cmd.toLowerCase(), { ...plugin, file })
      }
    } catch (e) {
      console.error(chalk.red(`[PLUGINS] Error cargando ${file}:`), e)
    }
  }
  console.log(chalk.green(`[PLUGINS] ${plugins.size} comandos cargados desde ${files.length} archivos.`))
}

export function watchPlugins() {
  fs.watch(PLUGINS_DIR, { persistent: true }, (event, filename) => {
    if (filename && filename.endsWith('.js')) {
      console.log(chalk.cyan(`[PLUGINS] Cambio detectado en ${filename}, recargando...`))
      loadPlugins()
    }
  })
}

export function getAllPluginsUnique() {
  const seen = new Set()
  const result = []
  for (const p of plugins.values()) {
    if (!seen.has(p.file)) {
      seen.add(p.file)
      result.push(p)
    }
  }
  return result
}
