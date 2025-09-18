import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Eye, ThumbsUp, MessageCircle, Calendar, Clock } from 'lucide-react'

const VideoCard = ({ video }) => {
  // 生成YouTube縮圖URL
  const getThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }

  // 格式化數字
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num?.toString() || '0'
  }

  // 格式化時間
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  // 解析hashtags
  const parseHashtags = (hashtagString) => {
    if (!hashtagString) return []
    return hashtagString.split(',').map(tag => tag.trim()).filter(tag => tag)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        {/* 影片縮圖 */}
        <div className="relative overflow-hidden rounded-t-lg">
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={getThumbnailUrl(video.videoId)}
              alt={video.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* 影片時長 */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(video.durationSeconds)}
            </div>
          </a>
        </div>

        {/* 影片資訊 */}
        <div className="p-4">
          {/* 標題 */}
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </a>

          {/* 頻道名稱 */}
          <p className="text-muted-foreground text-sm mb-3">
            {video.channelTitle}
          </p>

          {/* 統計數據 */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(video.viewCount)}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {formatNumber(video.likeCount)}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(video.commentCount)}
            </div>
          </div>

          {/* 發布日期 */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            {formatDate(video.publishedAt)}
          </div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1">
            {parseHashtags(video.hashtags).slice(0, 3).map((hashtag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {hashtag}
              </Badge>
            ))}
            {parseHashtags(video.hashtags).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{parseHashtags(video.hashtags).length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VideoCard

