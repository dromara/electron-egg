import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(ROOT, '../v4/docs')
const DEST = path.resolve(ROOT, 'docs')
const PUBLIC_SRC = path.join(SRC, '.vuepress/public')
const PUBLIC_DEST = path.join(DEST, 'public')

// Directories worth migrating (excludes backup/, 03.api/, @pages/)
const INCLUDE_DIRS = ['00.v4', '04.其它', '05.知识点', '06.支持', '07.功能', '08.插件', '09.api-v4']

// Convert a vdoing markdown file into a VitePress-friendly one:
// keep title + permalink, drop date/article, rewrite $withBase().
function transformContent(raw) {
  const parsed = matter(raw)
  const fm = {}
  if (parsed.data.title != null) fm.title = String(parsed.data.title)
  if (parsed.data.permalink != null) fm.permalink = String(parsed.data.permalink)

  let body = parsed.content
  body = body.replace(/:src="\$withBase\(\s*'([^']+)'\s*\)"/g, 'src="$1"')
  body = body.replace(/:src="\$withBase\(\s*"([^"]+)"\s*\)"/g, 'src="$1"')
  body = body.replace(/\$withBase\(\s*'([^']+)'\s*\)/g, "'$1'")

  return matter.stringify(body, fm)
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

function migrateMarkdown() {
  const files = fg.sync(
    INCLUDE_DIRS.map((d) => `${d}/**/*.md`),
    { cwd: SRC, dot: false }
  )
  let zhCount = 0
  for (const rel of files) {
    const raw = fs.readFileSync(path.join(SRC, rel), 'utf8')
    const out = transformContent(raw)
    // zh (root locale)
    const zhPath = path.join(DEST, rel)
    fs.mkdirSync(path.dirname(zhPath), { recursive: true })
    fs.writeFileSync(zhPath, out)
    // en placeholder (same content, to be translated later)
    const enPath = path.join(DEST, 'en', rel)
    fs.mkdirSync(path.dirname(enPath), { recursive: true })
    fs.writeFileSync(enPath, out)
    zhCount++
  }
  return zhCount
}

function run() {
  fs.mkdirSync(DEST, { recursive: true })
  const count = migrateMarkdown()
  console.log(`Migrated ${count} markdown files (zh + en placeholder).`)

  if (fs.existsSync(PUBLIC_SRC)) {
    copyDir(PUBLIC_SRC, PUBLIC_DEST)
    console.log('Copied public assets ->', path.relative(ROOT, PUBLIC_DEST))
  } else {
    console.warn('WARN: public source not found at', PUBLIC_SRC)
  }
}

run()

