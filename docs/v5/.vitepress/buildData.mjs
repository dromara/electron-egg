import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs')

// Top-level content dirs, in display order (numeric prefix drives sort anyway).
const INCLUDE_DIRS = ['00.docs', '08.plugins', '09.api', '07.features', '06.support', '04.others']

function getDisplayName(name) {
  const stripped = name.replace(/^\d+\./, '')
  return displayNameMap[stripped] || stripped
}
const numPrefix = (name) => {
  const m = name.match(/^(\d+)\.?/)
  return m ? parseInt(m[1], 10) : 9999
}

// 英文目录名到中文显示名的映射
const displayNameMap = {
  // 一级目录
  'docs': '文档',
  'plugins': '插件',
  'features': '功能',
  'support': '支持',
  'others': '其它',
  // 二级目录
  'getting-started': '开始',
  'basic-features': '基础功能',
  'build-software': '生成软件',
  'upgrade': '升级',
  'cross-language': '跨语言支持',
  'tips': '知识点',
  // 三级目录
  'frontend-module': '前端模块',
  'communication': '通信',
  'database': '数据库',
  'tasks': '任务',
  'tutorial': '教程',
  'version-relation': '版本关系',
  'config': '配置',
}

// Read a file's title from frontmatter.
function readMeta(absFile) {
  const { data } = matter(fs.readFileSync(absFile, 'utf8'))
  return { title: data.title != null ? String(data.title) : path.basename(absFile, '.md') }
}

// Sorted dir entries: directories and .md files, by numeric prefix.
function sortedEntries(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() || (e.isFile() && e.name.endsWith('.md')))
    .sort((a, b) => numPrefix(a.name) - numPrefix(b.name) || a.name.localeCompare(b.name))
}

// Convert file path to VitePress route path
// e.g. 00.文档/010.开始/010.简介.md -> /00.文档/010.开始/010.简介
function fileToRoute(relPath) {
  // Remove .md extension and ensure leading slash
  return '/' + relPath.replace(/\.md$/, '')
}

// Recursively build a VitePress sidebar group from a directory.
function buildGroup(absDir, relDir, collapsed = true) {
  const items = []
  for (const entry of sortedEntries(absDir)) {
    const abs = path.join(absDir, entry.name)
    const rel = relDir ? `${relDir}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      const children = buildGroup(abs, rel, collapsed)
      if (children.length) items.push({ text: getDisplayName(entry.name), collapsed, items: children })
    } else {
      const { title } = readMeta(abs)
      items.push({ text: title, link: fileToRoute(rel) })
    }
  }
  return items
}

function buildSidebar() {
  const sidebar = []
  let isFirst = true
  for (const dir of INCLUDE_DIRS) {
    const abs = path.join(DOCS, dir)
    if (!fs.existsSync(abs)) continue
    const items = buildGroup(abs, dir)
    if (items.length) {
      sidebar.push({ text: getDisplayName(dir), collapsed: !isFirst, items })
      isFirst = false
    }
  }
  return sidebar
}

export const sidebarZh = buildSidebar()
export const sidebarEn = sidebarZh // same structure; link targets shared
