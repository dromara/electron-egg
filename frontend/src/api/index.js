/**
 * Definition of communication channel between main process and rendering process
 * separator: "/" | "." ; (Please check the config file properties: channelSeparator)
 * format：controller/filename/method | controller.filename.method
 * Definition of communication channels between main process and rendering process
 */
const ipcApiRoute = {
    livesave: {
        startRecorder: 'controller/livesave/startRecorder',
        stopRecorder: 'controller/livesave/stopRecorder',
        getLatestConfig: 'controller/livesave/getLatestConfig',
        configUpdate: 'controller/livesave/configUpdate',
        addLiveUrl: 'controller/livesave/addLiveUrl',
        updateQuality: 'controller/livesave/updateQuality',
        removeStream: 'controller/livesave/removeStream',
        toggleStreamMonitoring: 'controller/livesave/toggleStreamMonitoring',
        openDownloadsFolder: 'controller/livesave/openDownloadsFolder',
    },
    framework: {
        checkForUpdater: 'controller/framework/checkForUpdater',
        downloadApp: 'controller/framework/downloadApp',
        getAppVersion: 'controller/framework/getAppVersion',
        jsondbOperation: 'controller/framework/jsondbOperation',
        sqlitedbOperation: 'controller/framework/sqlitedbOperation',
        uploadFile: 'controller/framework/uploadFile',
        checkHttpServer: 'controller/framework/checkHttpServer',
        doHttpRequest: 'controller/framework/doHttpRequest',
        doSocketRequest: 'controller/framework/doSocketRequest',
        ipcInvokeMsg: 'controller/framework/ipcInvokeMsg',
        ipcSendSyncMsg: 'controller/framework/ipcSendSyncMsg',
        ipcSendMsg: 'controller/framework/ipcSendMsg',
        startJavaServer: 'controller/framework/startJavaServer',
        closeJavaServer: 'controller/framework/closeJavaServer',
        someJob: 'controller/framework/someJob',
        timerJobProgress: 'controller/framework/timerJobProgress',
        createPool: 'controller/framework/createPool',
        createPoolNotice: 'controller/framework/createPoolNotice',
        someJobByPool: 'controller/framework/someJobByPool',
        hello: 'controller/framework/hello',
        openSoftware: 'controller/framework/openSoftware',
    },

    // os
    os: {
        messageShow: 'controller/os/messageShow',
        messageShowConfirm: 'controller/os/messageShowConfirm',
        selectFolder: 'controller/os/selectFolder',
        selectPic: 'controller/os/selectPic',
        openDirectory: 'controller/os/openDirectory',
        loadViewContent: 'controller/os/loadViewContent',
        removeViewContent: 'controller/os/removeViewContent',
        createWindow: 'controller/os/createWindow',
        getWCid: 'controller/os/getWCid',
        sendNotification: 'controller/os/sendNotification',
        initPowerMonitor: 'controller/os/initPowerMonitor',
        getScreen: 'controller/os/getScreen',
        autoLaunch: 'controller/os/autoLaunch',
        setTheme: 'controller/os/setTheme',
        getTheme: 'controller/os/getTheme',
        window1ToWindow2: 'controller/os/window1ToWindow2',
        window2ToWindow1: 'controller/os/window2ToWindow1',
    },

    // effect
    effect: {
        selectFile: 'controller/effect/selectFile',
        loginWindow: 'controller/effect/loginWindow',
        restoreWindow: 'controller/effect/restoreWindow',
        verifyActivation: 'controller/effect/verifyActivation',
        checkActivation: 'controller/effect/checkActivation',
        generateDeviceFingerprint: 'controller/effect/generateDeviceFingerprint',
    },

    // cross
    cross: {
        crossInfo: 'controller/cross/info',
        getCrossUrl: 'controller/cross/getUrl',
        killCrossServer: 'controller/cross/killServer',
        createCrossServer: 'controller/cross/createServer',
        requestApi: 'controller/cross/requestApi',
    },

    // livechat
    livechat: {
        getRoomStatus: 'controller/livechat/getRoomStatus',
        startMonitoring: 'controller/livechat/startMonitoring',
        stopMonitoring: 'controller/livechat/stopMonitoring',
        getEventsUrl: 'controller/livechat/getEventsUrl',
        getMonitoringStatus: 'controller/livechat/getMonitoringStatus',
    },

    // 自动场控和自动回复
    livechatAutoControl: {
        connectToLiveRoom: 'controller/livechatAutoControl/connectToLiveRoom',
        disconnectFromLiveRoom: 'controller/livechatAutoControl/disconnectFromLiveRoom',
        sendMessage: 'controller/livechatAutoControl/sendMessage',
        getConnectionStatus: 'controller/livechatAutoControl/getConnectionStatus',
        startAutoControl: 'controller/livechatAutoControl/startAutoControl',
        stopAutoControl: 'controller/livechatAutoControl/stopAutoControl',
        getAutoControlStatus: 'controller/livechatAutoControl/getAutoControlStatus',
        startAutoReply: 'controller/livechatAutoControl/startAutoReply',
        stopAutoReply: 'controller/livechatAutoControl/stopAutoReply',
        getAutoReplyStatus: 'controller/livechatAutoControl/getAutoReplyStatus',
        getEmojis: 'controller/livechatAutoControl/getEmojis',
        saveEmojis: 'controller/livechatAutoControl/saveEmojis'
    },

    // 语音助手相关
    voiceAssistant: {
        getAudioGroups: 'controller/voiceAssistant/getAudioGroups',
        getAudioFiles: 'controller/voiceAssistant/getAudioFiles',
        startVoiceAssistant: 'controller/voiceAssistant/startVoiceAssistant',
        stopVoiceAssistant: 'controller/voiceAssistant/stopVoiceAssistant',
        getVoiceAssistantStatus: 'controller/voiceAssistant/getVoiceAssistantStatus',
        playAudioFile: 'controller/voiceAssistant/playAudioFile'
    },

    // 数据库相关API
    scriptdb: {
        // 控场话术相关
        getScriptTables: 'controller/scriptdb/getScriptTables',
        getScripts: 'controller/scriptdb/getScripts',
        addScript: 'controller/scriptdb/addScript',
        updateScript: 'controller/scriptdb/updateScript',
        deleteScript: 'controller/scriptdb/deleteScript',
        createScriptTable: 'controller/scriptdb/createScriptTable',
        updateScriptTable: 'controller/scriptdb/updateScriptTable',
        deleteScriptTable: 'controller/scriptdb/deleteScriptTable',
        checkAndFixDefaultTable: 'controller/scriptdb/checkAndFixDefaultTable',
        exportScriptTable: 'controller/scriptdb/exportScriptTable',
        importScriptTable: 'controller/scriptdb/importScriptTable',

        // 文字回复相关
        getReplyTables: 'controller/scriptdb/getReplyTables',
        getReplies: 'controller/scriptdb/getReplies',
        addReply: 'controller/scriptdb/addReply',
        updateReply: 'controller/scriptdb/updateReply',
        deleteReply: 'controller/scriptdb/deleteReply',
        createReplyTable: 'controller/scriptdb/createReplyTable',
        updateReplyTable: 'controller/scriptdb/updateReplyTable',
        deleteReplyTable: 'controller/scriptdb/deleteReplyTable',
        checkAndFixDefaultReplyTable: 'controller/scriptdb/checkAndFixDefaultReplyTable',
        exportReplyTable: 'controller/scriptdb/exportReplyTable',
        importReplyTable: 'controller/scriptdb/importReplyTable',
    },
}

/**
 * Customize Channel
 * Format: Custom (recommended to add a prefix)
 */
const specialIpcRoute = {
    appUpdater: 'custom/app/updater', // updater channel
}

export {
    ipcApiRoute,
    specialIpcRoute
}