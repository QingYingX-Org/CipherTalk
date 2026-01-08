import { useState, useEffect } from 'react'
import { Database, Check, Circle, Unlock, RefreshCw, Image, RefreshCcw } from 'lucide-react'
import './DataManagementPage.scss'

interface DatabaseFile {
  fileName: string
  filePath: string
  fileSize: number
  wxid: string
  isDecrypted: boolean
  decryptedPath?: string
  needsUpdate?: boolean
}

function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<'database' | 'image'>('database')
  const [databases, setDatabases] = useState<DatabaseFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null)
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    loadDatabases()

    // 监听进度
    const removeListener = window.electronAPI.dataManagement.onProgress((data) => {
      // 解密/更新进度 - 显示弹窗
      if (data.type === 'decrypt' || data.type === 'update') {
        setProgress(data)
        return
      }
      
      // 完成/错误 - 清除弹窗
      if (data.type === 'complete' || data.type === 'error') {
        setProgress(null)
      }
    })

    return () => removeListener()
  }, [])


  const showMessage = (text: string, success: boolean) => {
    setMessage({ text, success })
    setTimeout(() => setMessage(null), 3000)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const loadDatabases = async () => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI.dataManagement.scanDatabases()
      if (result.success) {
        setDatabases(result.databases || [])
      } else {
        showMessage(result.error || '扫描数据库失败', false)
      }
    } catch (e) {
      showMessage(`扫描失败: ${e}`, false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecryptAll = async () => {
    // 检查聊天窗口是否打开
    const isChatOpen = await window.electronAPI.window.isChatWindowOpen()
    if (isChatOpen) {
      showMessage('请先关闭聊天窗口再进行解密操作', false)
      return
    }

    const pendingFiles = databases.filter(db => !db.isDecrypted)
    if (pendingFiles.length === 0) {
      showMessage('所有数据库都已解密', true)
      return
    }

    setIsDecrypting(true)
    try {
      const result = await window.electronAPI.dataManagement.decryptAll()
      if (result.success) {
        showMessage(`解密完成！成功: ${result.successCount}, 失败: ${result.failCount}`, result.failCount === 0)
        await loadDatabases()
      } else {
        showMessage(result.error || '解密失败', false)
      }
    } catch (e) {
      showMessage(`解密失败: ${e}`, false)
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleIncrementalUpdate = async () => {
    // 检查聊天窗口是否打开
    const isChatOpen = await window.electronAPI.window.isChatWindowOpen()
    if (isChatOpen) {
      showMessage('请先关闭聊天窗口再进行增量更新', false)
      return
    }

    const filesToUpdate = databases.filter(db => db.needsUpdate)
    if (filesToUpdate.length === 0) {
      showMessage('没有需要更新的数据库', true)
      return
    }

    setIsDecrypting(true)
    try {
      const result = await window.electronAPI.dataManagement.incrementalUpdate()
      if (result.success) {
        showMessage(`增量更新完成！成功: ${result.successCount}, 失败: ${result.failCount}`, result.failCount === 0)
        await loadDatabases()
      } else {
        showMessage(result.error || '增量更新失败', false)
      }
    } catch (e) {
      showMessage(`增量更新失败: ${e}`, false)
    } finally {
      setIsDecrypting(false)
    }
  }

  const pendingCount = databases.filter(db => !db.isDecrypted).length
  const decryptedCount = databases.filter(db => db.isDecrypted).length
  const needsUpdateCount = databases.filter(db => db.needsUpdate).length


  return (
    <>
      {message && (
        <div className={`message-toast ${message.success ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {progress && (progress.type === 'decrypt' || progress.type === 'update') && (
        <div className="decrypt-progress-overlay">
          <div className="progress-card">
            <h3>
              {progress.type === 'decrypt' ? '正在解密数据库' : '正在增量更新'}
            </h3>
            <p className="progress-file">{progress.fileName}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.fileProgress || 0}%` }}
              />
            </div>
            <p className="progress-text">
              文件 {(progress.current || 0) + 1} / {progress.total || 0} · {progress.fileProgress || 0}%
            </p>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>数据管理</h1>
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={16} />
            数据库
          </button>
          <button 
            className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            <Image size={16} />
            图片
          </button>
        </div>
      </div>

      <div className="page-scroll">
        {activeTab === 'database' && (
          <section className="page-section">
            <div className="section-header">
              <div>
                <h2>数据库解密</h2>
                <p className="section-desc">
                  {isLoading ? '正在扫描...' : `已找到 ${databases.length} 个数据库，${decryptedCount} 个已解密，${pendingCount} 个待解密`}
                </p>
              </div>
              <div className="section-actions">
                <button className="btn btn-secondary" onClick={loadDatabases} disabled={isLoading}>
                  <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                  刷新
                </button>
                {needsUpdateCount > 0 && (
                  <button 
                    className="btn btn-warning"
                    onClick={handleIncrementalUpdate}
                    disabled={isDecrypting}
                  >
                    <RefreshCcw size={16} />
                    增量更新 ({needsUpdateCount})
                  </button>
                )}
                <button 
                  className="btn btn-primary"
                  onClick={handleDecryptAll}
                  disabled={isDecrypting || pendingCount === 0}
                >
                  <Unlock size={16} />
                  {isDecrypting ? '解密中...' : '批量解密'}
                </button>
              </div>
            </div>

            <div className="database-list">
              {databases.map((db, index) => (
                <div key={index} className={`database-item ${db.isDecrypted ? (db.needsUpdate ? 'needs-update' : 'decrypted') : 'pending'}`}>
                  <div className={`status-icon ${db.isDecrypted ? (db.needsUpdate ? 'needs-update' : 'decrypted') : 'pending'}`}>
                    {db.isDecrypted ? <Check size={16} /> : <Circle size={16} />}
                  </div>
                  <div className="db-info">
                    <div className="db-name">{db.fileName}</div>
                    <div className="db-meta">
                      <span>{db.wxid}</span>
                      <span>•</span>
                      <span>{formatFileSize(db.fileSize)}</span>
                    </div>
                  </div>
                  <div className={`db-status ${db.isDecrypted ? (db.needsUpdate ? 'needs-update' : 'decrypted') : 'pending'}`}>
                    {db.isDecrypted ? (db.needsUpdate ? '需更新' : '已解密') : '待解密'}
                  </div>
                </div>
              ))}

              {!isLoading && databases.length === 0 && (
                <div className="empty-state">
                  <Database size={48} strokeWidth={1} />
                  <p>未找到数据库文件</p>
                  <p className="hint">请先在设置页面配置数据库路径</p>
                </div>
              )}
            </div>
          </section>
        )}


        {activeTab === 'image' && (
          <section className="page-section">
            <div className="section-header">
              <div>
                <h2>图片解密</h2>
                <p className="section-desc">此功能由于微信加密方式原因，暂不可用</p>
              </div>
            </div>

            <div className="unavailable-state">
              <Image size={64} strokeWidth={1} />
              <p>图片解密功能暂不可用</p>
              <p className="hint">由于微信更新了图片加密方式，该功能正在适配中</p>
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default DataManagementPage
