import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
// import path from 'path'
import log from 'electron-log'
// import { isNil, debounce } from 'lodash'

export default function checkForUpdates(mainWindow): void {
    log.info('checkFormUpdates::')
    autoUpdater.logger = log
    log.transports.file.level = 'debug'
    autoUpdater.logger.info('Auto-updater initialized')
    autoUpdater.autoDownload = true

    const { logger } = autoUpdater

    autoUpdater.setFeedURL({
        provider: 'generic',
        url: 'http://127.0.0.1:9009/auto-updates',
    })

    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment) {
        // 强制在开发环境进行更新检查
        autoUpdater.forceDevUpdateConfig = true
    }

    // 检查更新
    autoUpdater.checkForUpdatesAndNotify()

    //监听'error'事件
    autoUpdater.on('error', err => {
        logger.info('出错:' + err.message)
    })

    //监听'update-available'事件，发现有新版本时触发
    autoUpdater.on('update-available', () => {
        logger.info('found new version')
        mainWindow.webContents.send('update_available')
        autoUpdater.downloadUpdate()
    })

    //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
    // autoUpdater.on('download-progress', progressObj => {
    //     console.log(`Download speed: ${progressObj.bytesPerSecond}`)
    //     console.log(`Downloaded ${progressObj.percent}%`)
    //     console.log(`Transferred ${progressObj.transferred}/${progressObj.total}`)
    // })

    autoUpdater.on('download-progress', progress => {
        logger.info('当前下载进度' + JSON.stringify(progress))
        // 计算下载百分比
        const downloadPercent = Math.round(progress.percent * 100) / 100
        // 实时同步下载进度到渲染进程，以便于渲染进程显示下载进度
        mainWindow.webContents.send('download-progress', downloadPercent)
    })

    // 监听'update-downloaded'事件，新版本下载完成时触发
    autoUpdater.on('update-downloaded', () => {
        logger.info('新版本下载完成，询问用户是否立即更新？')

        dialog
            .showMessageBox({
                type: 'info',
                title: '应用更新',
                message: '发现新版本，是否更新？',
                buttons: ['是', '否'],
            })
            .then(buttonIndex => {
                if (buttonIndex.response == 0) {
                    // 确保退出前释放所有资源
                    mainWindow.webContents.session.clearCache(() => {})
                    //选择是，则退出程序，安装新版本
                    autoUpdater.autoRunAppAfterInstall = true
                    autoUpdater.quitAndInstall()
                    // app.quit()
                }
            })
    })
}
// export function checkForUpdates(mainWindow, ipcMain): void {
// autoUpdater.logger = log
// log.transports.file.level = 'debug'
// autoUpdater.autoDownload = false

// log.info('checkFormUpdates::')

// autoUpdater.setFeedURL('http://127.0.0.1:9009/auto-updates') //设置要检测更新url

// // 未打包时是开发环境
// // 用于本地调试
// if (!app.isPackaged) {
//     Object.defineProperty(app, 'isPackaged', {
//         get: () => true,
//     })
//     autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml')
// }

// function sendUpdateMsg(statusObj): void {
//     mainWindow.webContents.send('updateStatus', statusObj)
// }

// autoUpdater.once('error', error => {
//     const errMsg = isNil(error) ? 'unknown' : (error.stack || error).toString()
//     sendUpdateMsg({
//         status: 'error',
//         msg: errMsg,
//     })
// })

// // 没有更新时触发
// autoUpdater.once('update-not-available', () => {
//     sendUpdateMsg({
//         status: 'latest',
//         msg: '已是最新版本',
//     })
// })

// // 有更新时触发
// autoUpdater.once('update-available', () => {
//     sendUpdateMsg({
//         status: 'update-available',
//         msg: '有新版本可更新，是否现在更新?',
//     })
// })

// // 下载完成
// autoUpdater.once('update-downloaded', () => {
//     sendUpdateMsg({
//         status: 'completed',
//         msg: '下载完成，重启更新',
//     })
// })

// //监听开始检测更新事件
// autoUpdater.once('checking-for-update', function () {
//     sendUpdateMsg({
//         status: 'checking',
//         msg: '监听开始检测更新事件',
//     })
// })

// // 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
// autoUpdater.once(
//     'download-progress',
//     debounce(function (progress) {
//         sendUpdateMsg({
//             status: 'downloading',
//             msg: progress,
//         })
//     }, 3000)
// )

// ipcMain.once('downloadUpdate', () => {
//     autoUpdater.downloadUpdate()
// })

// ipcMain.once('quitAndInstall', () => {
//     autoUpdater.quitAndInstall()
// })

// autoUpdater.checkForUpdates()
// }
