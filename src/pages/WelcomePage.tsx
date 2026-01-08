import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { dialog, db } from '../services/ipc'
import * as configService from '../services/config'
import './WelcomePage.scss'

function WelcomePage() {
  const navigate = useNavigate()
  const { isDbConnected, setDbConnected, setLoading } = useAppStore()
  
  const [dbPath, setDbPath] = useState('')
  const [decryptKey, setDecryptKey] = useState('')
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  // 选择数据库目录
  const handleSelectPath = async () => {
    try {
      const result = await dialog.openFile({
        title: '选择解密后的数据库文件',
        filters: [{ name: '数据库文件', extensions: ['db'] }],
        properties: ['openFile']
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        setDbPath(result.filePaths[0])
        setError('')
      }
    } catch (e) {
      setError('选择文件失败')
    }
  }

  // 连接数据库
  const handleConnect = async () => {
    if (!dbPath) {
      setError('请先选择数据库文件')
      return
    }

    setIsConnecting(true)
    setError('')
    setLoading(true, '正在连接数据库...')

    try {
      const success = await db.open(dbPath, decryptKey || undefined)
      
      if (success) {
        // 保存配置
        await configService.setDbPath(dbPath)
        
        // 更新状态
        setDbConnected(true, dbPath)
        setLoading(false)
        
        // 跳转到聊天页
        navigate('/chat')
      } else {
        setError('数据库连接失败，请检查文件是否正确')
        setLoading(false)
      }
    } catch (e) {
      setError(`连接失败: ${e}`)
      setLoading(false)
    } finally {
      setIsConnecting(false)
    }
  }

  // 如果已连接，显示已连接状态
  if (isDbConnected) {
    return (
      <div className="welcome-page">
        <div className="welcome-content">
          <h1 className="title">密语</h1>
          <p className="subtitle">数据库已连接</p>
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>
            进入聊天记录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1 className="title">密语</h1>
        <p className="subtitle">探索你的微信数字足迹</p>

        <div className="config-card">
          <div className="config-section">
            <label className="config-label">数据库文件</label>
            <div className="input-group">
              <input
                type="text"
                className="config-input"
                placeholder="选择解密后的数据库文件 (.db)"
                value={dbPath}
                onChange={(e) => setDbPath(e.target.value)}
                readOnly
              />
              <button className="btn btn-secondary" onClick={handleSelectPath}>
                选择
              </button>
            </div>
          </div>

          <div className="config-section">
            <label className="config-label">
              解密密钥 <span className="optional">(可选)</span>
            </label>
            <input
              type="text"
              className="config-input"
              placeholder="如果数据库已解密，可留空"
              value={decryptKey}
              onChange={(e) => setDecryptKey(e.target.value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="btn btn-primary btn-connect"
            onClick={handleConnect}
            disabled={isConnecting || !dbPath}
          >
            {isConnecting ? '连接中...' : '连接数据库'}
          </button>
        </div>

        <div className="disclaimer">
          <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>本工具仅用于个人数据备份查看，请确保拥有合法使用权</span>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
