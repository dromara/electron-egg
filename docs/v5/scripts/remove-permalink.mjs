import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs')

function removePermalink(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      removePermalink(fullPath)
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      
      // 删除 permalink 行
      const original = content
      content = content.replace(/^permalink:\s*.*\/?\n/m, '')
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content)
        console.log(`已删除 permalink: ${fullPath.replace(DOCS + '/', '')}`)
      }
    }
  }
}

console.log('开始删除 permalink...')
removePermalink(DOCS)
console.log('完成!')
