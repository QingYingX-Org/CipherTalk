import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, FileText, BarChart3, Sparkles, Download, CheckCircle, XCircle, User } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import './HomePage.scss'

interface UserInfo {
  connected: boolean
  wxid: string
  nickName: string
  alias: string
  avatarUrl: string
}

function HomePage() {
  const navigate = useNavigate()
  const { isDbConnected } = useAppStore()
  const [userInfo, setUserInfo] = useState<UserInfo>({
    connected: false,
    wxid: '',
    nickName: '',
    alias: '',
    avatarUrl: ''
  })

  useEffect(() => {
    loadUserInfo()
  }, [isDbConnected])

  const loadUserInfo = async () => {
    if (!isDbConnected) {
      setUserInfo({
        connected: false,
        wxid: '',
        nickName: '',
        alias: '',
        avatarUrl: ''
      })
      return
    }

    try {
      const result = await window.electronAPI.chat.getMyUserInfo()
      if (result.success && result.userInfo) {
        setUserInfo({
          connected: true,
          wxid: result.userInfo.wxid,
          nickName: result.userInfo.nickName,
          alias: result.userInfo.alias,
          avatarUrl: result.userInfo.avatarUrl
        })
      } else {
        setUserInfo({
          connected: true,
          wxid: '',
          nickName: '',
          alias: '',
          avatarUrl: ''
        })
      }
    } catch (e) {
      console.error('加载用户信息失败:', e)
    }
  }

  const openChatWindow = async () => {
    try {
      await window.electronAPI.window.openChatWindow()
    } catch (e) {
      console.error('打开聊天窗口失败:', e)
    }
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <img src="./logo.png" alt="密语" className="app-logo" />
        <h1 className="app-name">密语</h1>
        <p className="app-desc">微信聊天记录查看工具</p>
      </div>

      {/* 用户状态卡片 */}
      <div className="user-status-card">
        {userInfo.connected ? (
          <div className="user-info">
            <div className="user-avatar">
              {userInfo.avatarUrl ? (
                <img src={userInfo.avatarUrl} alt="" />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{userInfo.nickName || userInfo.wxid}</div>
              {userInfo.alias && <div className="user-alias">微信号: {userInfo.alias}</div>}
              <div className="user-status">
                <CheckCircle size={12} />
                <span>已连接</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="disconnected-info">
            <div className="status-icon">
              <XCircle size={20} />
            </div>
            <div className="status-text">
              <span className="title">未连接数据库</span>
              <span className="desc">请先配置解密密钥</span>
            </div>
            <button className="config-btn" onClick={() => navigate('/settings?tab=database')}>
              去配置
            </button>
          </div>
        )}
      </div>

      {/* 快捷功能入口 */}
      <div className="shortcuts">
        <div className="shortcut-card" onClick={openChatWindow}>
          <div className="shortcut-icon" style={{ backgroundColor: '#07c160' }}>
            <MessageSquare size={24} />
          </div>
          <span className="shortcut-label">聊天记录</span>
        </div>
        <div className="shortcut-card" onClick={() => navigate('/analytics')}>
          <div className="shortcut-icon" style={{ backgroundColor: '#1989fa' }}>
            <BarChart3 size={24} />
          </div>
          <span className="shortcut-label">私聊分析</span>
        </div>
        <div className="shortcut-card" onClick={() => navigate('/annual-report')}>
          <div className="shortcut-icon" style={{ backgroundColor: '#ee0a24' }}>
            <Sparkles size={24} />
          </div>
          <span className="shortcut-label">年度报告</span>
        </div>
        <div className="shortcut-card" onClick={() => navigate('/export')}>
          <div className="shortcut-icon" style={{ backgroundColor: '#7232dd' }}>
            <Download size={24} />
          </div>
          <span className="shortcut-label">导出</span>
        </div>
      </div>

      <div className="tips">
        <h3><FileText size={16} /> 使用提示</h3>
        <ul>
          <li>首次使用请先在「设置」中获取解密密钥</li>
          <li>自动获取时会提示退出重新登陆</li>
          <li>测试链接成功后，到「数据管理」界面解密数据库</li>
          <li>数据仅在本地处理，不会上传到任何服务器</li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage
