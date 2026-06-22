import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs/zh/v4')

// Chinese/numeric directory names to English equivalents
// Applied to v4 archive content under docs/zh/v4/
const dirMap = {
  // Top-level directories
  '04.其它': '04.others',
  '05.知识点': '05.tips',
  '06.支持': '06.support',
  '07.功能': '07.features',
  '08.插件': '08.plugins',

  // 00.v4 subdirectories
  '010.快速入门': '010.getting-started',
  '020.基础功能': '020.basic-features',
  '030.生成软件': '030.build-software',
  '040.升级': '040.upgrade',
  '045.跨语言支持': '045.cross-language',

  // 020.基础功能 subdirectories
  '014.前端模块': '014.frontend-module',
  '040.通信': '040.communication',
  '050.数据库': '050.database',
  '060.任务': '060.tasks',

  // 045.跨语言支持 subdirectories
  '020.go': '020.go',
  '030.java': '030.java',
  '040.python': '040.python',

  // 05.知识点 subdirectories
  '015.electron': '015.electron',
  '020.macos': '020.macos',
  '030.https': '030.https',
  '040.版本关系': '040.version-relation',

  // 03.api subdirectories (v3 API)
  '001.教程': '001.tutorial',
  '002.ee-bin': '002.ee-bin',
  '003.ee-core': '003.ee-core',
  '004.ee-go': '004.ee-go',
  '005.addon': '005.addon',
  '106.this-app': '106.this-app',

  // 09.api-v4 subdirectories (v4 API)
  '001.教程': '001.tutorial',
  '002.ee-bin': '002.ee-bin',
  '003.ee-core': '003.ee-core',
  '004.ee-go': '004.ee-go',
}

function renameDirs(dir, baseDir = '') {
  if (!fs.existsSync(dir)) return

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  // Process subdirectories first (depth-first)
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name)
      renameDirs(fullPath, baseDir ? `${baseDir}/${entry.name}` : entry.name)
    }
  }

  // Then rename current-level directories
  const currentEntries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of currentEntries) {
    if (entry.isDirectory()) {
      const newName = dirMap[entry.name]
      if (newName && newName !== entry.name) {
        const oldPath = path.join(dir, entry.name)
        const newPath = path.join(dir, newName)
        if (!fs.existsSync(newPath)) {
          fs.renameSync(oldPath, newPath)
          console.log(`重命名文件夹: ${baseDir ? baseDir + '/' : ''}${entry.name} -> ${newName}`)
        } else {
          console.warn(`跳过: ${baseDir ? baseDir + '/' : ''}${entry.name} -> ${newName} (目标已存在)`)
        }
      }
    }
  }
}

console.log('开始重命名 v4 归档文件夹...')
renameDirs(DOCS)
console.log('文件夹重命名完成!')
