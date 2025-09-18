import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Eye, ThumbsUp, MessageCircle, Video, TrendingUp } from 'lucide-react'

const StatsCards = ({ stats }) => {
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B'
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num?.toString() || '0'
  }

  const statsData = [
    {
      title: '總影片數',
      value: stats?.totalVideos || 0,
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: stats?.videoChange || 0
    },
    {
      title: '總觀看次數',
      value: formatNumber(stats?.totalViews || 0),
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: stats?.viewsChange || 0
    },
    {
      title: '總按讚數',
      value: formatNumber(stats?.totalLikes || 0),
      icon: ThumbsUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: stats?.likesChange || 0
    },
    {
      title: '總留言數',
      value: formatNumber(stats?.totalComments || 0),
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: stats?.commentsChange || 0
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change > 0
        const isNegative = stat.change < 0
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center text-sm ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 mr-1 ${
                      isNegative ? 'rotate-180' : ''
                    }`} />
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                與上期相比
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default StatsCards

