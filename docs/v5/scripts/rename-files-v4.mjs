import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs/zh/v4')

// Chinese-to-English filename mapping for v4 archive docs
// Based on the existing rename-files.mjs nameMap plus additional v4-specific entries
const nameMap = {
  // 00.v4/010.getting-started
  '010.简介.md': '010.introduction.md',
  '020.electron-egg是什么.md': '020.what-is-electron-egg.md',
  '030.安装.md': '030.installation.md',
  '040.快速开始.md': '040.quick-start.md',

  // 00.v4/010.getting-started/050.config (if exists)
  '01.开发配置.md': '01.dev-config.md',
  '02.基础配置.md': '02.base-config.md',
  '03.打包配置.md': '03.build-config.md',

  // 00.v4/020.basic-features
  '010.目录结构.md': '010.directory-structure.md',
  '012.生命周期.md': '012.lifecycle.md',
  '016.控制器.md': '016.controller.md',
  '018.服务层.md': '018.service-layer.md',
  '020.预加载层.md': '020.preload-layer.md',
  '072.日志.md': '072.logging.md',
  '074.额外资源目录.md': '074.extra-resources.md',
  '076.调试.md': '076.debugging.md',
  '078.脚本工具.md': '078.script-tools.md',
  '081.dll使用.md': '081.dll-usage.md',
  '082.调用第三方程序.md': '082.call-third-party.md',
  '090.远程模式.md': '090.remote-mode.md',

  // 00.v4/020.basic-features/014.frontend-module
  '01.介绍.md': '01.introduction.md',

  // 00.v4/020.basic-features/040.communication
  '010.通信介绍.md': '010.communication-intro.md',
  '020.通信ipcRender.md': '020.ipc-render.md',

  // 00.v4/020.basic-features/050.database
  '020.sqlite数据库.md': '020.sqlite-database.md',

  // 00.v4/020.basic-features/060.tasks
  '010.Jobs说明.md': '010.jobs-intro.md',

  // 00.v4/030.build-software
  '010.构建.md': '010.build.md',
  '020.代码加密.md': '020.code-encryption.md',
  '030.图标修改.md': '030.icon-modification.md',

  // 00.v4/040.upgrade
  '010.框架升级.md': '010.framework-upgrade.md',
  '020.软件全量更新.md': '020.full-update.md',
  '030.软件增量更新.md': '030.incremental-update.md',

  // 00.v4/045.cross-language
  '010.介绍.md': '010.introduction.md',

  // 00.v4/045.cross-language/020.go
  '01.开始.md': '01.getting-started.md',
  '02.配置.md': '02.configuration.md',
  '03.开发.md': '03.development.md',
  '04.构建.md': '04.build.md',
  '05.日志.md': '05.logging.md',
  '08.数据.md': '08.data.md',
  '10.路由.md': '10.routing.md',
  '11.业务层.md': '11.business-layer.md',

  // 00.v4/045.cross-language/030.java
  '01.开始.md': '01.getting-started.md',
  '02.开发.md': '02.development.md',

  // 00.v4/045.cross-language/040.python
  '01.开始.md': '01.getting-started.md',
  '03.开发.md': '03.development.md',

  // 00.v4 root files
  '049.从v3升级v4.md': '049.upgrade-v3-to-v4.md',
  '050.更新记录.md': '050.changelog.md',
  '060.常见问题.md': '060.faq.md',

  // 04.others
  '011.交流.md': '011.communication.md',
  '020.案例精选01.md': '020.case-study-01.md',
  '022.案例精选02.md': '022.case-study-02.md',
  '030.案例java.md': '030.case-java.md',
  '040.案例go.md': '040.case-go.md',

  // 05.tips
  '010.nvm.md': '010.nvm.md',

  // 05.tips/015.electron
  '03.打包与错误汇总.md': '03.build-and-errors.md',

  // 05.tips/020.macos
  '010.安装python.md': '010.install-python.md',
  '020.Mac显示Library库.md': '020.show-library.md',

  // 05.tips/030.https
  '010.ssl证书.md': '010.ssl-certificate.md',

  // 06.support
  '018.个人赞助.md': '018.personal-sponsor.md',
  '020.成为赞助商.md': '020.become-sponsor.md',

  // 08.plugins
  '01.介绍.md': '01.introduction.md',
  '02.增量更新.md': '02.incremental-update.md',

  // 03.api/001.tutorial
  '001.使用说明.md': '001.usage-guide.md',

  // 03.api/005.addon (if exists)
  '002.第三方使用.md': '002.third-party-usage.md',

  // 09.api-v4/001.tutorial
  '001.使用说明.md': '001.usage-guide.md',
}

// Build a full-path map to handle duplicate filenames in different directories
const fullPathMap = {}

function buildFullPathMap(dir, baseDir = '') {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = baseDir ? `${baseDir}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      buildFullPathMap(fullPath, relPath)
    } else if (entry.name.endsWith('.md')) {
      // Check if filename contains Chinese characters
      if (/[一-龥]/.test(entry.name)) {
        const newName = nameMap[entry.name]
        if (newName) {
          fullPathMap[relPath] = relPath.replace(entry.name, newName)
        } else {
          console.warn(`警告: 未找到映射 ${relPath}`)
        }
      }
    }
  }
}

function renameFiles() {
  console.log('开始构建文件映射...')
  buildFullPathMap(DOCS)

  const count = Object.keys(fullPathMap).length
  console.log(`找到 ${count} 个需要重命名的文件`)

  // Sort by path depth (deepest first to avoid conflicts)
  const sortedPaths = Object.keys(fullPathMap).sort((a, b) => b.split('/').length - a.split('/').length)

  for (const oldRelPath of sortedPaths) {
    const newRelPath = fullPathMap[oldRelPath]
    const oldPath = path.join(DOCS, oldRelPath)
    const newPath = path.join(DOCS, newRelPath)

    // Ensure target directory exists
    const newDir = path.dirname(newPath)
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true })
    }

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath)
      console.log(`重命名: ${oldRelPath} -> ${newRelPath}`)
    } else {
      console.warn(`跳过: ${oldRelPath} (文件不存在)`)
    }
  }

  console.log('重命名完成!')
}

renameFiles()
