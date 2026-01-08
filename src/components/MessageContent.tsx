import React from 'react'
import { linkifyText } from '../utils/linkify'
import { parseWechatEmoji } from '../utils/wechatEmoji'

interface MessageContentProps {
  content: string
  className?: string
}

/**
 * 消息内容渲染组件
 * 处理：微信表情、链接识别
 */
function MessageContent({ content, className }: MessageContentProps) {
  if (!content) return null

  // 先处理链接，再处理表情
  const processContent = (text: string | React.ReactNode): React.ReactNode => {
    if (typeof text !== 'string') return text
    
    // 处理链接
    const linkedContent = linkifyText(text)
    
    // 如果链接处理返回了数组，需要对每个字符串部分处理表情
    if (Array.isArray(linkedContent)) {
      return linkedContent.map((part, index) => {
        if (typeof part === 'string') {
          return <React.Fragment key={index}>{parseWechatEmoji(part)}</React.Fragment>
        }
        return part
      })
    }
    
    // 如果是字符串，处理表情
    if (typeof linkedContent === 'string') {
      return parseWechatEmoji(linkedContent)
    }
    
    return linkedContent
  }

  return (
    <span className={className}>
      {processContent(content)}
    </span>
  )
}

export default MessageContent
