const { appExit, appRelaunch, choiceFile, choiceFolder } = require('../apis/base')
const { answerRenderer } = require('./index')

/**
 * 退出app
 */
answerRenderer('system.exit', appExit)

/**
 * 重启app
 */
answerRenderer('system.relaunch', appRelaunch)

/**
 * 选择系统文件夹
 */
answerRenderer('system.choiceFolder', choiceFolder)

/**
 * 选择文件文件
 */
answerRenderer('system.choiceFile', choiceFile)
