import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs')

// 中文文件夹名到英文的映射（只包含纯中文或含中文的文件夹名）
const dirMap = {
  // 一级目录
  '00.文档': '00.docs',
  '04.其它': '04.others',
  '05.知识点': '05.tips',
  '06.支持': '06.support',
  '07.功能': '07.features',
  '08.插件': '08.plugins',
  '09.api': '09.api',
  
  // 00.文档 下的二级目录
  '010.开始': '010.getting-started',
  '020.基础功能': '020.basic-features',
  '030.生成软件': '030.build-software',
  '040.升级': '040.upgrade',
  '045.跨语言支持': '045.cross-language',
  
  // 020.基础功能 下的三级目录
  '014.前端模块': '014.frontend-module',
  '040.通信': '040.communication',
  '050.数据库': '050.database',
  '060.任务': '060.tasks',
  
  // 045.跨语言支持 下的三级目录
  '020.go': '020.go',
  '030.java': '030.java',
  '040.python': '040.python',
  
  // 04.其它 下的（没有纯中文子目录）
  
  // 05.知识点 下的二级目录
  '015.electron': '015.electron',
  '020.macos': '020.macos',
  '030.https': '030.https',
  '040.版本关系': '040.version-relation',
  
  // 06.支持 下的（没有纯中文子目录）
  
  // 07.功能 下的（没有纯中文子目录）
  
  // 08.插件 下的（没有纯中文子目录）
  
  // 09.api 下的二级目录
  '001.教程': '001.tutorial',
  '002.ee-bin': '002.ee-bin',
  '003.ee-core': '003.ee-core',
  '004.ee-go': '004.ee-go',
  
  // en 目录下的一级目录
  '00.v4': '00.v4',
  
  // en/00.v4 下的二级目录（和中文目录结构相同）
  '010.快速入门': '010.getting-started',
  '020.基础功能': '020.basic-features',
  '030.生成软件': '030.build-software',
  '040.升级': '040.upgrade',
  '045.跨语言支持': '045.cross-language',
}

function renameDirs(dir, baseDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  // 先处理子目录（深度优先）
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name)
      renameDirs(fullPath, baseDir ? `${baseDir}/${entry.name}` : entry.name)
    }
  }
  
  // 再处理当前目录下的文件夹
  const currentEntries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of currentEntries) {
    if (entry.isDirectory()) {
      const newName = dirMap[entry.name]
      if (newName && newName !== entry.name) {
        const oldPath = path.join(dir, entry.name)
        const newPath = path.join(dir, newName)
        fs.renameSync(oldPath, newPath)
        console.log(`重命名文件夹: ${baseDir ? baseDir + '/' : ''}${entry.name} -> ${newName}`)
      }
    }
  }
}

console.log('开始重命名文件夹...')
renameDirs(DOCS)
console.log('文件夹重命名完成!')
