import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(ROOT, '../v4/docs')
const DEST = path.resolve(ROOT, 'docs/zh/v4')

// Directories to migrate (exclude .vuepress, @pages, backup)
const INCLUDE_DIRS = ['00.v4', '03.api', '04.其它', '05.知识点', '06.支持', '07.功能', '08.插件', '09.api-v4']

// Frontmatter fields to remove (vdoing-specific)
const REMOVE_FM_KEYS = ['permalink', 'date', 'article', 'home', 'heroImage', 'heroText', 'tagline', 'actionText', 'actionLink', 'bannerBg', 'defaultMode', 'postList', 'features', 'notices', 'archivesPage']

// Convert a vdoing markdown file into a VitePress-friendly one:
// - Remove vdoing frontmatter fields
// - Rewrite $withBase() image references
// - Remove ::: cardList containers
function transformContent(raw) {
  const parsed = matter(raw)
  const fm = {}
  for (const [key, val] of Object.entries(parsed.data)) {
    if (REMOVE_FM_KEYS.includes(key)) continue
    if (val != null) fm[key] = val
  }

  let body = parsed.content

  // Replace $withBase() image references
  body = body.replace(/:src="\$withBase\(\s*'([^']+)'\s*\)"/g, 'src="$1"')
  body = body.replace(/:src="\$withBase\(\s*"([^"]+)"\s*\)"/g, 'src="$1"')
  body = body.replace(/\$withBase\(\s*'([^']+)'\s*\)/g, "'$1'")

  // Remove ::: cardList containers (vdoing-specific)
  // Pattern: ::: cardList <columns>  ... yaml data ...  :::
  body = body.replace(/:::\s*cardList\s+\d+\s*\n([\s\S]*?):::\s*\n/g, '')

  // Remove vdoing Vue component references in comments
  // e.g. <!-- <Notice :data="$frontmatter.notices"/> -->
  body = body.replace(/<!--[\s\S]*?-->\s*\n/g, (match) => {
    // Keep comments that don't contain vdoing-specific references
    if (match.includes('$frontmatter') || match.includes('Notice') || match.includes('cardList')) return ''
    return match
  })

  return matter.stringify(body, fm)
}

function migrateMarkdown() {
  const patterns = INCLUDE_DIRS.map((d) => `${d}/**/*.md`)
  const files = fg.sync(patterns, { cwd: SRC, dot: false })

  let count = 0
  for (const rel of files) {
    const raw = fs.readFileSync(path.join(SRC, rel), 'utf8')
    const out = transformContent(raw)
    const outPath = path.join(DEST, rel)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, out)
    count++
  }
  return count
}

function copyPublicAssets() {
  // Only copy images that don't already exist in v5 public
  const srcPublic = path.join(SRC, '.vuepress/public')
  const destPublic = path.resolve(ROOT, 'docs/public')

  if (!fs.existsSync(srcPublic)) {
    console.warn('WARN: v4 public directory not found at', srcPublic)
    return 0
  }

  const srcImgs = fg.sync('img/**/*', { cwd: srcPublic, dot: false })
  let copied = 0
  for (const rel of srcImgs) {
    const srcFile = path.join(srcPublic, rel)
    const destFile = path.join(destPublic, rel)
    if (!fs.existsSync(destFile)) {
      fs.mkdirSync(path.dirname(destFile), { recursive: true })
      fs.copyFileSync(srcFile, destFile)
      copied++
    }
  }
  return copied
}

function run() {
  fs.mkdirSync(DEST, { recursive: true })

  const mdCount = migrateMarkdown()
  console.log(`Migrated ${mdCount} markdown files to docs/zh/v4/`)

  const imgCount = copyPublicAssets()
  if (imgCount > 0) {
    console.log(`Copied ${imgCount} new public assets`)
  } else {
    console.log('No new public assets needed (v5 already has them)')
  }
}

run()
