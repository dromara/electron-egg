import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs')

// Top-level content dirs, in display order (numeric prefix drives sort anyway).
const INCLUDE_DIRS = ['00.v4', '08.插件', '09.api-v4', '07.功能', '06.支持', '05.知识点', '04.其它']

const stripPrefix = (name) => name.replace(/^\d+\./, '')
const numPrefix = (name) => {
  const m = name.match(/^(\d+)\./)
  return m ? parseInt(m[1], 10) : 9999
}

// Read a file's permalink + title from frontmatter.
function readMeta(absFile) {
  const { data } = matter(fs.readFileSync(absFile, 'utf8'))
  return { permalink: data.permalink ? String(data.permalink) : null, title: data.title != null ? String(data.title) : path.basename(absFile, '.md') }
}

// Sorted dir entries: directories and .md files, by numeric prefix.
function sortedEntries(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() || (e.isFile() && e.name.endsWith('.md')))
    .sort((a, b) => numPrefix(a.name) - numPrefix(b.name) || a.name.localeCompare(b.name))
}

// Recursively build a VitePress sidebar group from a directory.
// localePrefix is '' for zh root, '/en' for english (rewrites still use permalink).
function buildGroup(absDir, collapsed = true) {
  const items = []
  for (const entry of sortedEntries(absDir)) {
    const abs = path.join(absDir, entry.name)
    if (entry.isDirectory()) {
      const children = buildGroup(abs, collapsed)
      if (children.length) items.push({ text: stripPrefix(entry.name), collapsed, items: children })
    } else {
      const { permalink, title } = readMeta(abs)
      if (permalink) items.push({ text: title, link: permalink })
    }
  }
  return items
}

function buildSidebar() {
  const sidebar = []
  for (const dir of INCLUDE_DIRS) {
    const abs = path.join(DOCS, dir)
    if (!fs.existsSync(abs)) continue
    const items = buildGroup(abs)
    if (items.length) sidebar.push({ text: stripPrefix(dir), collapsed: false, items })
  }
  return sidebar
}

// Walk every migrated md file and map its source path -> pages/<hash>/index.md.
function buildRewrites() {
  const rewrites = {}
  const walk = (absDir, relDir) => {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name)
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(abs, rel)
      else if (entry.name.endsWith('.md')) {
        const { permalink } = readMeta(abs)
        if (!permalink) continue
        const slug = permalink.replace(/^\/|\/$/g, '') // pages/909757
        const enPrefix = rel.startsWith('en/') ? 'en/' : ''
        rewrites[rel] = `${enPrefix}${slug}/index.md`
      }
    }
  }
  for (const dir of [...INCLUDE_DIRS, 'en']) {
    const abs = path.join(DOCS, dir)
    if (fs.existsSync(abs)) walk(abs, dir)
  }
  return rewrites
}

export const rewrites = buildRewrites()
export const sidebarZh = buildSidebar()
export const sidebarEn = sidebarZh // same structure; link targets shared via rewrites

