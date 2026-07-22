import fs from 'fs'
import path from 'path'
import url from 'url'
import chalk from 'chalk'
import { __dirname } from '../config.js'

const PLUGINS_DIR = path.join(__dirname, 'plugins')

export const plugins = new Map()

function walkPluginFiles(dir) {
  let results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(walkPluginFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath)
    }
  }
  return results
}

export async function loadPlugins() {
  plugins.clear()
  const files = walkPluginFiles(PLUGINS_DIR)

  for (const fullPath of files) {
    const relFile = path.relative(PLUGINS_DIR, fullPath)
    try {
      const fileUrl = url.pathToFileURL(fullPath).href + `?update=${Date.now()}`
      const mod = await import(fileUrl)
      const plugin = mod.default
      if (!plugin || !plugin.command) {
        console.log(chalk.yellow(`[PLUGINS] "${relFile}" no exporta un comando válido, se omite.`))
        continue
      }
      const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
      for (const cmd of commands) {
        plugins.set(cmd.toLowerCase(), { ...plugin, file: relFile })
      }
    } catch (e) {
      console.error(chalk.red(`[PLUGINS] Error cargando ${relFile}:`), e)
    }
  }
  console.log(chalk.green(`[PLUGINS] ${plugins.size} comandos cargados desde ${files.length} archivos.`))
}

function watchDirRecursive(dir, onChange) {
  try {
    fs.watch(dir, { persistent: true, recursive: true }, onChange)
    return
  } catch (e) {}

  fs.watch(dir, { persistent: true }, onChange)
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      watchDirRecursive(path.join(dir, entry.name), onChange)
    }
  }
}

export function watchPlugins() {
  watchDirRecursive(PLUGINS_DIR, (event, filename) => {
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
