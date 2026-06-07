import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs')

// 中文到英文的映射表（根据文件内容中的 title 或 permalink 生成）
const nameMap = {
  // 00.文档/010.开始
  '001.重磅更新.md': '001.major-update.md',
  '010.简介.md': '010.introduction.md',
  '020.electron-egg是什么.md': '020.what-is-electron-egg.md',
  '030.安装.md': '030.installation.md',
  '040.快速开始.md': '040.quick-start.md',
  // 00.文档/010.开始/050.配置
  '01.开发配置.md': '01.dev-config.md',
  '02.基础配置.md': '02.base-config.md',
  '03.打包配置.md': '03.build-config.md',
  // 00.文档/020.基础功能
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
  // 00.文档/020.基础功能/014.前端模块
  '01.介绍.md': '01.introduction.md',
  // 00.文档/020.基础功能/040.通信
  '010.通信介绍.md': '010.communication-intro.md',
  '020.通信ipcRender.md': '020.ipc-render.md',
  // 00.文档/020.基础功能/050.数据库
  '020.sqlite数据库.md': '020.sqlite-database.md',
  // 00.文档/020.基础功能/060.任务
  '010.Jobs说明.md': '010.jobs-intro.md',
  '020.ChildJob.md': '020.child-job.md',
  '030.ChildPoolJob.md': '030.child-pool-job.md',
  // 00.文档/030.生成软件
  '010.构建.md': '010.build.md',
  '020.代码加密.md': '020.code-encryption.md',
  '030.图标修改.md': '030.icon-modification.md',
  // 00.文档/040.升级
  '010.框架升级.md': '010.framework-upgrade.md',
  '020.软件全量更新.md': '020.full-update.md',
  '030.软件增量更新.md': '030.incremental-update.md',
  // 00.文档/045.跨语言支持
  '010.介绍.md': '010.introduction.md',
  // 00.文档/045.跨语言支持/020.go
  '01.开始.md': '01.getting-started.md',
  '02.配置.md': '02.configuration.md',
  '03.开发.md': '03.development.md',
  '04.构建.md': '04.build.md',
  '05.日志.md': '05.logging.md',
  '08.数据.md': '08.data.md',
  '09.main.md': '09.main.md',
  '10.路由.md': '10.routing.md',
  '11.业务层.md': '11.business-layer.md',
  '12.API.md': '12.api.md',
  // 00.文档/045.跨语言支持/030.java
  '01.开始.md': '01.getting-started.md',
  '02.开发.md': '02.development.md',
  // 00.文档/045.跨语言支持/040.python
  '01.开始.md': '01.getting-started.md',
  '03.开发.md': '03.development.md',
  // 00.文档 根目录
  '049.从v4升级v5.md': '049.upgrade.md',
  '050.更新记录.md': '050.changelog.md',
  '060.常见问题.md': '060.faq.md',
  
  // 04.其它
  '011.交流.md': '011.communication.md',
  '020.案例精选01.md': '020.case-study-01.md',
  '022.案例精选02.md': '022.case-study-02.md',
  '030.案例java.md': '030.case-java.md',
  '040.案例go.md': '040.case-go.md',
  
  // 05.知识点
  '010.nvm.md': '010.nvm.md',
  // 05.知识点/015.electron
  '03.打包与错误汇总.md': '03.build-and-errors.md',
  // 05.知识点/020.macos
  '010.安装python.md': '010.install-python.md',
  '020.Mac显示Library库.md': '020.show-library.md',
  // 05.知识点/030.https
  '010.ssl证书.md': '010.ssl-certificate.md',
  
  // 06.支持
  '018.个人赞助.md': '018.personal-sponsor.md',
  '020.成为赞助商.md': '020.become-sponsor.md',
  
  // 07.功能
  '01.demo.md': '01.demo.md',
  
  // 08.插件
  '01.介绍.md': '01.introduction.md',
  '02.增量更新.md': '02.incremental-update.md',
  
  // 09.api/001.教程
  '001.使用说明.md': '001.usage-guide.md',
  // 09.api/002.ee-bin
  '010.bin.md': '010.bin.md',
  // 09.api/003.ee-core
  '010.app.md': '010.app.md',
  '015.config.md': '015.config.md',
  '020.const.md': '020.const.md',
  '030.controller.md': '030.controller.md',
  '035.core.md': '035.core.md',
  '036.cross.md': '036.cross.md',
  '045.electron.md': '045.electron.md',
  '046.electron-app.md': '046.electron-app.md',
  '047.electron-window.md': '047.electron-window.md',
  '050.exception.md': '050.exception.md',
  '060.jobs.md': '060.jobs.md',
  '061.jobs-childjob.md': '061.jobs-childjob.md',
  '063.jobs-childpooljob.md': '063.jobs-childpooljob.md',
  '070.loader.md': '070.loader.md',
  '075.log.md': '075.log.md',
  '080.message.md': '080.message.md',
  '081.message-childmessage.md': '081.message-childmessage.md',
  '085.ps.md': '085.ps.md',
  '095.socket.md': '095.socket.md',
  '100.storage.md': '100.storage.md',
  '102.storage-sqlitedb.md': '102.storage-sqlitedb.md',
  '110.utils.md': '110.utils.md',
  '111.utils-helper.md': '111.utils-helper.md',
  '112.utils-is.md': '112.utils-is.md',
  '113.utils-json.md': '113.utils-json.md',
  '115.utils-ip.md': '115.utils-ip.md',
  '116.utils-port.md': '116.utils-port.md',
  // 09.api/004.ee-go
  '010.eapp.md': '010.eapp.md',
  '015.eboot.md': '015.eboot.md',
  '020.econfig.md': '020.econfig.md',
  '025.eerror.md': '025.eerror.md',
  '030.ehelper.md': '030.ehelper.md',
  '035.ehttp.md': '035.ehttp.md',
  '036.erouter.md': '036.erouter.md',
  '040.elog.md': '040.elog.md',
  '045.eos.md': '045.eos.md',
  '050.eruntime.md': '050.eruntime.md',
  '055.estatic.md': '055.estatic.md',
  '060.eutil.md': '060.eutil.md',
  '065.etask.md': '065.etask.md',
}

// 需要处理重复键的情况（不同目录下有相同文件名）
// 使用完整路径作为键
const fullPathMap = {}

function buildFullPathMap(dir, baseDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = baseDir ? `${baseDir}/${entry.name}` : entry.name
    
    if (entry.isDirectory()) {
      buildFullPathMap(fullPath, relPath)
    } else if (entry.name.endsWith('.md')) {
      // 检查文件名是否包含中文
      if (/[\u4e00-\u9fa5]/.test(entry.name)) {
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
  
  console.log(`找到 ${Object.keys(fullPathMap).length} 个需要重命名的文件`)
  
  // 按路径深度排序，先处理深层目录
  const sortedPaths = Object.keys(fullPathMap).sort((a, b) => b.split('/').length - a.split('/').length)
  
  for (const oldRelPath of sortedPaths) {
    const newRelPath = fullPathMap[oldRelPath]
    const oldPath = path.join(DOCS, oldRelPath)
    const newPath = path.join(DOCS, newRelPath)
    
    // 确保目标目录存在
    const newDir = path.dirname(newPath)
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true })
    }
    
    fs.renameSync(oldPath, newPath)
    console.log(`重命名: ${oldRelPath} -> ${newRelPath}`)
  }
  
  console.log('重命名完成!')
}

renameFiles()
