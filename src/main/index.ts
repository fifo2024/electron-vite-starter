import { app, shell, BrowserWindow, ipcMain, protocol, IpcMainEvent } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Fastify, { FastifyInstance, FastifyRequest, InjectOptions } from 'fastify'
import log from 'electron-log'
import si from 'systeminformation'
import icon from '../../resources/icon.png?asset'
import checkForUpdates from './updater'
import { getAppVersion } from './version'
import { eLog, LogParams } from './common/log'
// 创建一个 Fastify 实例
const fastify: FastifyInstance = Fastify({ logger: true })

fastify.get('/data', async (request: FastifyRequest) => {
    // console.log(12, request.url)
    const userAgent = request.headers['user-agent']
    console.log(`User-Agent: ${userAgent}`)
    return { hello: 'world' + Math.random() + JSON.stringify(request.query) }
})

fastify.get('/get_system_info', async (request: FastifyRequest) => {
    eLog.info(request.url)
    const cpu = await si.cpu()
    // console.log('CPU信息：')
    // console.log(`- 制造商：${cpu.manufacturer}`)
    // console.log(`- 品牌：${cpu.brand}`)
    // console.log(`- 速度：${cpu.speed}GHz`)
    // console.log(`- 核心数：${cpu.cores}`)
    // console.log(`- 物理核心数：${cpu.physicalCores}`)

    return { cpu }
})

// 自定义协议名称
const CUSTOM_PROTOCOL = 'myapp'

// 注册自定义协议
protocol.registerSchemesAsPrivileged([
    {
        scheme: CUSTOM_PROTOCOL,
        privileges: {
            secure: true,
            standard: true,
            bypassCSP: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
])

let mainWindow: BrowserWindow | null = null

function createWindow(): BrowserWindow {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
        },
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    // 必须准备好fastify
    await fastify.ready()
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // 协议监听函数
    protocol.handle(CUSTOM_PROTOCOL, async (request: GlobalRequest) => {
        let url = request.url.replace(`${CUSTOM_PROTOCOL}://`, '/')
        if (url.endsWith('/')) {
            url = url.slice(0, -1)
        }
        const queryIndex = url.indexOf('?')
        const path = url.slice(0, queryIndex > -1 ? queryIndex - 1 : url.length)
        const search = url.slice(queryIndex > -1 ? queryIndex : url.length, url.length)

        console.log(97, queryIndex, url, path, search, request)
        const options: InjectOptions = {
            method: 'GET',
            url: path,
            query: search,
            headers: request.headers,
            // body: request.body,
            // query: request.json,
        }

        console.log('protocol::handle', options)
        const { payload, statusCode } = await fastify.inject(options)
        console.log(107, statusCode, payload)
        return new Response(payload, {
            status: statusCode,
        })
    })

    mainWindow = createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow()
        }
    })
})

app.on('ready', () => {
    // 每次启动程序，就检查更新
    setTimeout(() => {
        checkForUpdates(mainWindow)
    }, 3000)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// IPC test
ipcMain.on('ping', () => console.log('pong'))

// 检查更新
ipcMain.on('checkUpdate', () => {
    console.log('check for updates')
    log.info('checkFormUpdates::')
    checkForUpdates(mainWindow)
})

// 获取应用版本
ipcMain.handle('getAppVersion', (): string => {
    return getAppVersion()
})

// 日志
ipcMain.on('eLog', (event: IpcMainEvent, arg: LogParams) => {
    const { type, value, from } = arg
    switch (type) {
        case 'info':
            eLog.info(`[${from || 'render'}]`, value)
            break
        case 'error':
            eLog.error(`[${from || 'render'}]`, value)
            break
        case 'warn':
            eLog.warn(`[${from || 'render'}]`, value)
            break
        case 'debug':
            eLog.debug(`[${from || 'render'}]`, value)
            break
        default:
            console.log('Unknown log type:', type, ...value)
            break
    }
})
