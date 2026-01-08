import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { DatabaseService } from './services/database'
import { DecryptService } from './services/decrypt'
import { ConfigService } from './services/config'
import { wxKeyService } from './services/wxKeyService'
import { dbPathService } from './services/dbPathService'
import { wcdbService } from './services/wcdbService'
import { dataManagementService } from './services/dataManagementService'
import { imageDecryptService } from './services/imageDecryptService'
import { imageKeyService } from './services/imageKeyService'
import { chatService } from './services/chatService'
import { analyticsService } from './services/analyticsService'
import { groupAnalyticsService } from './services/groupAnalyticsService'
import { annualReportService } from './services/annualReportService'
import { exportService, ExportOptions } from './services/exportService'
import { activationService } from './services/activationService'

// 配置自动更新
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.disableDifferentialDownload = true  // 禁用差分更新，强制全量下载

// 单例服务
let dbService: DatabaseService | null = null
let decryptService: DecryptService | null = null
let configService: ConfigService | null = null

// 聊天窗口实例
let chatWindow: BrowserWindow | null = null
// 群聊分析窗口实例
let groupAnalyticsWindow: BrowserWindow | null = null
// 年度报告窗口实例
let annualReportWindow: BrowserWindow | null = null
// 协议窗口实例
let agreementWindow: BrowserWindow | null = null
// 购买窗口实例
let purchaseWindow: BrowserWindow | null = null

function createWindow() {
  // 获取图标路径 - 打包后在 resources 目录
  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? join(__dirname, '../public/icon.ico')
    : join(process.resourcesPath, 'icon.ico')

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#1a1a1a',
      height: 40
    },
    show: false
  })

  // 初始化服务
  configService = new ConfigService()
  dbService = new DatabaseService()
  decryptService = new DecryptService()

  // 窗口准备好后显示
  win.once('ready-to-show', () => {
    win.show()
  })

  // 开发环境加载 vite 服务器
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    
    // 开发环境下按 F12 或 Ctrl+Shift+I 打开开发者工具
    win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools()
        } else {
          win.webContents.openDevTools()
        }
        event.preventDefault()
      }
    })
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }

  return win
}

/**
 * 创建独立的聊天窗口（仿微信风格）
 */
function createChatWindow() {
  // 如果已存在，聚焦到现有窗口
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.focus()
    return chatWindow
  }

  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? join(__dirname, '../public/icon.ico')
    : join(process.resourcesPath, 'icon.ico')

  chatWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#666666',
      height: 32
    },
    show: false,
    backgroundColor: '#F0F0F0'
  })

  chatWindow.once('ready-to-show', () => {
    chatWindow?.show()
  })

  // 加载聊天页面
  if (process.env.VITE_DEV_SERVER_URL) {
    chatWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/chat-window`)
    
    chatWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
        if (chatWindow?.webContents.isDevToolsOpened()) {
          chatWindow.webContents.closeDevTools()
        } else {
          chatWindow?.webContents.openDevTools()
        }
        event.preventDefault()
      }
    })
  } else {
    chatWindow.loadFile(join(__dirname, '../dist/index.html'), { hash: '/chat-window' })
  }

  chatWindow.on('closed', () => {
    chatWindow = null
  })

  return chatWindow
}

/**
 * 创建独立的群聊分析窗口
 */
function createGroupAnalyticsWindow() {
  // 如果已存在，聚焦到现有窗口
  if (groupAnalyticsWindow && !groupAnalyticsWindow.isDestroyed()) {
    groupAnalyticsWindow.focus()
    return groupAnalyticsWindow
  }

  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? join(__dirname, '../public/icon.ico')
    : join(process.resourcesPath, 'icon.ico')

  groupAnalyticsWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#666666',
      height: 32
    },
    show: false,
    backgroundColor: '#F0F0F0'
  })

  groupAnalyticsWindow.once('ready-to-show', () => {
    groupAnalyticsWindow?.show()
  })

  // 加载群聊分析页面
  if (process.env.VITE_DEV_SERVER_URL) {
    groupAnalyticsWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/group-analytics-window`)
    
    groupAnalyticsWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
        if (groupAnalyticsWindow?.webContents.isDevToolsOpened()) {
          groupAnalyticsWindow.webContents.closeDevTools()
        } else {
          groupAnalyticsWindow?.webContents.openDevTools()
        }
        event.preventDefault()
      }
    })
  } else {
    groupAnalyticsWindow.loadFile(join(__dirname, '../dist/index.html'), { hash: '/group-analytics-window' })
  }

  groupAnalyticsWindow.on('closed', () => {
    groupAnalyticsWindow = null
  })

  return groupAnalyticsWindow
}

/**
 * 创建独立的年度报告窗口
 */
function createAnnualReportWindow(year: number) {
  // 如果已存在，关闭旧窗口
  if (annualReportWindow && !annualReportWindow.isDestroyed()) {
    annualReportWindow.close()
    annualReportWindow = null
  }

  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? join(__dirname, '../public/icon.ico')
    : join(process.resourcesPath, 'icon.ico')

  const isDark = nativeTheme.shouldUseDarkColors

  annualReportWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: isDark ? '#FFFFFF' : '#333333',
      height: 32
    },
    show: false,
    backgroundColor: isDark ? '#1A1A1A' : '#F9F8F6'
  })

  annualReportWindow.once('ready-to-show', () => {
    annualReportWindow?.show()
  })

  // 加载年度报告页面，带年份参数
  if (process.env.VITE_DEV_SERVER_URL) {
    annualReportWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/annual-report-window?year=${year}`)
    
    annualReportWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
        if (annualReportWindow?.webContents.isDevToolsOpened()) {
          annualReportWindow.webContents.closeDevTools()
        } else {
          annualReportWindow?.webContents.openDevTools()
        }
        event.preventDefault()
      }
    })
  } else {
    annualReportWindow.loadFile(join(__dirname, '../dist/index.html'), { hash: `/annual-report-window?year=${year}` })
  }

  annualReportWindow.on('closed', () => {
    annualReportWindow = null
  })

  return annualReportWindow
}

/**
 * 创建用户协议窗口
 */
function createAgreementWindow() {
  // 如果已存在，聚焦
  if (agreementWindow && !agreementWindow.isDestroyed()) {
    agreementWindow.focus()
    return agreementWindow
  }

  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? join(__dirname, '../public/icon.ico')
    : join(process.resourcesPath, 'icon.ico')

  const isDark = nativeTheme.shouldUseDarkColors

  agreementWindow = new BrowserWindow({
    width: 800,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: isDark ? '#FFFFFF' : '#333333',
      height: 32
    },
    show: false,
    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF'
  })

  agreementWindow.once('ready-to-show', () => {
    agreementWindow?.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    agreementWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/agreement-window`)
  } else {
    agreementWindow.loadFile(join(__dirname, '../dist/index.html'), { hash: '/agreement-window' })
  }

  agreementWindow.on('closed', () => {
    agreementWindow = null
  })

  return agreementWindow
}

/**
 * 创建购买窗口
 */
function createPurchaseWindow() {
  // 如果已存在，聚焦
  if (purchaseWindow && !purchaseWindow.isDestroyed()) {
    purchaseWindow.focus()
    return purchaseWindow
  }

  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? join(__dirname, '../public/icon.ico')
    : join(process.resourcesPath, 'icon.ico')

  purchaseWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    },
    title: '获取激活码 - 密语',
    show: false,
    backgroundColor: '#FFFFFF',
    autoHideMenuBar: true
  })

  purchaseWindow.once('ready-to-show', () => {
    purchaseWindow?.show()
  })

  // 加载购买页面
  purchaseWindow.loadURL('https://pay.ldxp.cn/shop/aiqiji')

  purchaseWindow.on('closed', () => {
    purchaseWindow = null
  })

  return purchaseWindow
}

// 注册 IPC 处理器
function registerIpcHandlers() {
  // 配置相关
  ipcMain.handle('config:get', async (_, key: string) => {
    return configService?.get(key as any)
  })

  ipcMain.handle('config:set', async (_, key: string, value: any) => {
    return configService?.set(key as any, value)
  })

  // TLD 缓存相关
  ipcMain.handle('config:getTldCache', async () => {
    return configService?.getTldCache()
  })

  ipcMain.handle('config:setTldCache', async (_, tlds: string[]) => {
    return configService?.setTldCache(tlds)
  })

  // 数据库相关
  ipcMain.handle('db:open', async (_, dbPath: string) => {
    return dbService?.open(dbPath)
  })

  ipcMain.handle('db:query', async (_, sql: string, params?: any[]) => {
    return dbService?.query(sql, params)
  })

  ipcMain.handle('db:close', async () => {
    return dbService?.close()
  })

  // 解密相关
  ipcMain.handle('decrypt:database', async (_, sourcePath: string, key: string, outputPath: string) => {
    return decryptService?.decryptDatabase(sourcePath, key, outputPath)
  })

  ipcMain.handle('decrypt:image', async (_, imagePath: string) => {
    return decryptService?.decryptImage(imagePath)
  })

  // 文件对话框
  ipcMain.handle('dialog:openFile', async (_, options) => {
    const { dialog } = await import('electron')
    return dialog.showOpenDialog(options)
  })

  ipcMain.handle('dialog:saveFile', async (_, options) => {
    const { dialog } = await import('electron')
    return dialog.showSaveDialog(options)
  })

  ipcMain.handle('shell:openPath', async (_, path: string) => {
    const { shell } = await import('electron')
    return shell.openPath(path)
  })

  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    const { shell } = await import('electron')
    return shell.openExternal(url)
  })

  ipcMain.handle('app:getDownloadsPath', async () => {
    return app.getPath('downloads')
  })

  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion()
  })

  ipcMain.handle('app:checkForUpdates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      if (result && result.updateInfo) {
        const currentVersion = app.getVersion()
        const latestVersion = result.updateInfo.version
        if (latestVersion !== currentVersion) {
          return {
            hasUpdate: true,
            version: latestVersion,
            releaseNotes: result.updateInfo.releaseNotes as string || ''
          }
        }
      }
      return { hasUpdate: false }
    } catch (error) {
      console.error('检查更新失败:', error)
      return { hasUpdate: false }
    }
  })

  ipcMain.handle('app:downloadAndInstall', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    
    // 监听下载进度
    autoUpdater.on('download-progress', (progress) => {
      win?.webContents.send('app:downloadProgress', progress.percent)
    })

    // 下载完成后自动安装
    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall(false, true)
    })

    try {
      await autoUpdater.downloadUpdate()
    } catch (error) {
      console.error('下载更新失败:', error)
      throw error
    }
  })

  // 窗口控制
  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  // 更新窗口控件主题色
  ipcMain.on('window:setTitleBarOverlay', (event, options: { symbolColor: string }) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.setTitleBarOverlay({
        color: '#00000000',
        symbolColor: options.symbolColor,
        height: 40
      })
    }
  })

  // 密钥获取相关
  ipcMain.handle('wxkey:isWeChatRunning', async () => {
    return wxKeyService.isWeChatRunning()
  })

  ipcMain.handle('wxkey:getWeChatPid', async () => {
    return wxKeyService.getWeChatPid()
  })

  ipcMain.handle('wxkey:killWeChat', async () => {
    return wxKeyService.killWeChat()
  })

  ipcMain.handle('wxkey:launchWeChat', async () => {
    return wxKeyService.launchWeChat()
  })

  ipcMain.handle('wxkey:waitForWindow', async (_, maxWaitSeconds?: number) => {
    return wxKeyService.waitForWeChatWindow(maxWaitSeconds)
  })

  ipcMain.handle('wxkey:startGetKey', async (event) => {
    try {
      // 初始化 DLL
      const initSuccess = await wxKeyService.initialize()
      if (!initSuccess) {
        return { success: false, error: 'DLL 初始化失败' }
      }

      // 获取微信 PID
      const pid = wxKeyService.getWeChatPid()
      if (!pid) {
        return { success: false, error: '未找到微信进程' }
      }

      // 创建 Promise 等待密钥
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          wxKeyService.dispose()
          resolve({ success: false, error: '获取密钥超时' })
        }, 60000)

        const success = wxKeyService.installHook(
          pid,
          (key) => {
            clearTimeout(timeout)
            wxKeyService.dispose()
            resolve({ success: true, key })
          },
          (status, level) => {
            // 发送状态到渲染进程
            event.sender.send('wxkey:status', { status, level })
          }
        )

        if (!success) {
          clearTimeout(timeout)
          const error = wxKeyService.getLastError()
          wxKeyService.dispose()
          resolve({ success: false, error: `Hook 安装失败: ${error}` })
        }
      })
    } catch (e) {
      wxKeyService.dispose()
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('wxkey:cancel', async () => {
    wxKeyService.dispose()
    return true
  })

  // 数据库路径相关
  ipcMain.handle('dbpath:autoDetect', async () => {
    return dbPathService.autoDetect()
  })

  ipcMain.handle('dbpath:scanWxids', async (_, rootPath: string) => {
    return dbPathService.scanWxids(rootPath)
  })

  ipcMain.handle('dbpath:getDefault', async () => {
    return dbPathService.getDefaultPath()
  })

  // WCDB 数据库相关
  ipcMain.handle('wcdb:testConnection', async (_, dbPath: string, hexKey: string, wxid: string) => {
    return wcdbService.testConnection(dbPath, hexKey, wxid)
  })

  ipcMain.handle('wcdb:open', async (_, dbPath: string, hexKey: string, wxid: string) => {
    return wcdbService.open(dbPath, hexKey, wxid)
  })

  ipcMain.handle('wcdb:close', async () => {
    wcdbService.close()
    return true
  })

  // 数据管理相关
  ipcMain.handle('dataManagement:scanDatabases', async () => {
    return dataManagementService.scanDatabases()
  })

  ipcMain.handle('dataManagement:decryptAll', async () => {
    return dataManagementService.decryptAll()
  })

  ipcMain.handle('dataManagement:incrementalUpdate', async () => {
    return dataManagementService.incrementalUpdate()
  })

  ipcMain.handle('dataManagement:getCurrentCachePath', async () => {
    return dataManagementService.getCurrentCachePath()
  })

  ipcMain.handle('dataManagement:getDefaultCachePath', async () => {
    return dataManagementService.getDefaultCachePath()
  })

  ipcMain.handle('dataManagement:migrateCache', async (_, newCachePath: string) => {
    return dataManagementService.migrateCache(newCachePath)
  })

  ipcMain.handle('dataManagement:scanImages', async (_, dirPath: string) => {
    return dataManagementService.scanImages(dirPath)
  })

  ipcMain.handle('dataManagement:decryptImages', async (_, dirPath: string) => {
    return dataManagementService.decryptImages(dirPath)
  })

  ipcMain.handle('dataManagement:getImageDirectories', async () => {
    return dataManagementService.getImageDirectories()
  })

  ipcMain.handle('dataManagement:decryptSingleImage', async (_, filePath: string) => {
    return dataManagementService.decryptSingleImage(filePath)
  })

  // 图片解密相关
  ipcMain.handle('imageDecrypt:batchDetectXorKey', async (_, dirPath: string) => {
    try {
      const key = await imageDecryptService.batchDetectXorKey(dirPath)
      return { success: true, key }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('imageDecrypt:decryptImage', async (_, inputPath: string, outputPath: string, xorKey: number, aesKey?: string) => {
    try {
      const aesKeyBuffer = aesKey ? imageDecryptService.asciiKey16(aesKey) : undefined
      await imageDecryptService.decryptToFile(inputPath, outputPath, xorKey, aesKeyBuffer)
      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  // 图片密钥获取（从内存）
  ipcMain.handle('imageKey:getImageKeys', async (event, userDir: string) => {
    try {
      // 获取微信 PID
      const pid = wxKeyService.getWeChatPid()
      if (!pid) {
        return { success: false, error: '微信进程未运行，请先启动微信并登录' }
      }

      const result = await imageKeyService.getImageKeys(
        userDir,
        pid,
        (msg) => {
          event.sender.send('imageKey:progress', msg)
        }
      )

      return result
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  // 聊天相关
  ipcMain.handle('chat:connect', async () => {
    return chatService.connect()
  })

  ipcMain.handle('chat:getSessions', async () => {
    return chatService.getSessions()
  })

  ipcMain.handle('chat:getMessages', async (_, sessionId: string, offset?: number, limit?: number) => {
    return chatService.getMessages(sessionId, offset, limit)
  })

  ipcMain.handle('chat:getContact', async (_, username: string) => {
    return chatService.getContact(username)
  })

  ipcMain.handle('chat:getContactAvatar', async (_, username: string) => {
    return chatService.getContactAvatar(username)
  })

  ipcMain.handle('chat:getMyAvatarUrl', async () => {
    return chatService.getMyAvatarUrl()
  })

  ipcMain.handle('chat:getMyUserInfo', async () => {
    return chatService.getMyUserInfo()
  })

  ipcMain.handle('chat:downloadEmoji', async (_, cdnUrl: string, md5?: string) => {
    return chatService.downloadEmoji(cdnUrl, md5)
  })

  ipcMain.handle('chat:close', async () => {
    chatService.close()
    return true
  })

  ipcMain.handle('chat:refreshCache', async () => {
    chatService.refreshMessageDbCache()
    return true
  })

  ipcMain.handle('chat:getSessionDetail', async (_, sessionId: string) => {
    return chatService.getSessionDetail(sessionId)
  })

  // 导出相关
  ipcMain.handle('export:exportSessions', async (_, sessionIds: string[], outputDir: string, options: ExportOptions) => {
    return exportService.exportSessions(sessionIds, outputDir, options)
  })

  ipcMain.handle('export:exportSession', async (_, sessionId: string, outputPath: string, options: ExportOptions) => {
    return exportService.exportSessionToChatLab(sessionId, outputPath, options)
  })

  // 数据分析相关
  ipcMain.handle('analytics:getOverallStatistics', async () => {
    return analyticsService.getOverallStatistics()
  })

  ipcMain.handle('analytics:getContactRankings', async (_, limit?: number) => {
    return analyticsService.getContactRankings(limit)
  })

  ipcMain.handle('analytics:getTimeDistribution', async () => {
    return analyticsService.getTimeDistribution()
  })

  // 群聊分析相关
  ipcMain.handle('groupAnalytics:getGroupChats', async () => {
    return groupAnalyticsService.getGroupChats()
  })

  ipcMain.handle('groupAnalytics:getGroupMembers', async (_, chatroomId: string) => {
    return groupAnalyticsService.getGroupMembers(chatroomId)
  })

  ipcMain.handle('groupAnalytics:getGroupMessageRanking', async (_, chatroomId: string, limit?: number, startTime?: number, endTime?: number) => {
    return groupAnalyticsService.getGroupMessageRanking(chatroomId, limit, startTime, endTime)
  })

  ipcMain.handle('groupAnalytics:getGroupActiveHours', async (_, chatroomId: string, startTime?: number, endTime?: number) => {
    return groupAnalyticsService.getGroupActiveHours(chatroomId, startTime, endTime)
  })

  ipcMain.handle('groupAnalytics:getGroupMediaStats', async (_, chatroomId: string, startTime?: number, endTime?: number) => {
    return groupAnalyticsService.getGroupMediaStats(chatroomId, startTime, endTime)
  })

  // 打开独立聊天窗口
  ipcMain.handle('window:openChatWindow', async () => {
    createChatWindow()
    return true
  })

  // 打开群聊分析窗口
  ipcMain.handle('window:openGroupAnalyticsWindow', async () => {
    createGroupAnalyticsWindow()
    return true
  })

  // 打开年度报告窗口
  ipcMain.handle('window:openAnnualReportWindow', async (_, year: number) => {
    createAnnualReportWindow(year)
    return true
  })

  // 打开协议窗口
  ipcMain.handle('window:openAgreementWindow', async () => {
    createAgreementWindow()
    return true
  })

  // 打开购买窗口
  ipcMain.handle('window:openPurchaseWindow', async () => {
    createPurchaseWindow()
    return true
  })

  // 年度报告相关
  ipcMain.handle('annualReport:getAvailableYears', async () => {
    return annualReportService.getAvailableYears()
  })

  ipcMain.handle('annualReport:generateReport', async (_, year: number) => {
    return annualReportService.generateReport(year)
  })

  // 检查聊天窗口是否打开
  ipcMain.handle('window:isChatWindowOpen', async () => {
    return chatWindow !== null && !chatWindow.isDestroyed()
  })

  // 关闭聊天窗口
  ipcMain.handle('window:closeChatWindow', async () => {
    if (chatWindow && !chatWindow.isDestroyed()) {
      chatWindow.close()
      chatWindow = null
    }
    return true
  })

  // 激活相关
  ipcMain.handle('activation:getDeviceId', async () => {
    return activationService.getDeviceId()
  })

  ipcMain.handle('activation:verifyCode', async (_, code: string) => {
    return activationService.verifyCode(code)
  })

  ipcMain.handle('activation:activate', async (_, code: string) => {
    return activationService.activate(code)
  })

  ipcMain.handle('activation:checkStatus', async () => {
    return activationService.checkActivation()
  })

  ipcMain.handle('activation:getTypeDisplayName', async (_, type: string | null) => {
    return activationService.getTypeDisplayName(type)
  })

  ipcMain.handle('activation:clearCache', async () => {
    activationService.clearCache()
    return true
  })
}

// 主窗口引用
let mainWindow: BrowserWindow | null = null

// 启动时自动检测更新
function checkForUpdatesOnStartup() {
  // 开发环境不检测更新
  if (process.env.VITE_DEV_SERVER_URL) return

  // 延迟3秒检测，等待窗口完全加载
  setTimeout(async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      if (result && result.updateInfo) {
        const currentVersion = app.getVersion()
        const latestVersion = result.updateInfo.version
        if (latestVersion !== currentVersion && mainWindow) {
          // 通知渲染进程有新版本
          mainWindow.webContents.send('app:updateAvailable', {
            version: latestVersion,
            releaseNotes: result.updateInfo.releaseNotes || ''
          })
        }
      }
    } catch (error) {
      console.error('启动时检查更新失败:', error)
    }
  }, 3000)
}

app.whenReady().then(() => {
  registerIpcHandlers()
  mainWindow = createWindow()
  
  // 启动时检测更新
  checkForUpdatesOnStartup()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  // 关闭配置数据库连接
  configService?.close()
})
