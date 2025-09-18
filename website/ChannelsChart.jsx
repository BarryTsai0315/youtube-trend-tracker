import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { useState } from 'react'
import { Users, Eye, ThumbsUp, Video, ExternalLink } from 'lucide-react'

const ChannelsChart = ({ channels, loading, onChannelClick }) => {
  const [chartType, setChartType] = useState('bar')
  const [metric, setMetric] = useState('totalViews')
  const [sortBy, setSortBy] = useState('totalViews')

  // 顏色配置
  const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  // 格式化數字
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

  // 準備圖表資料
  const chartData = channels
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, 10) // 只顯示前10個
    .map((channel, index) => ({
      ...channel,
      color: COLORS[index % COLORS.length],
      displayName: channel.channelTitle.length > 20 
        ? channel.channelTitle.substring(0, 20) + '...' 
        : channel.channelTitle
    }))

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold mb-2">{data.channelTitle}</p>
          <div className="space-y-1 text-sm">
            <p>影片數: {data.videoCount}</p>
            <p>總觀看數: {formatNumber(data.totalViews)}</p>
            <p>總按讚數: {formatNumber(data.totalLikes)}</p>
            <p>平均觀看數: {formatNumber(data.avgViews)}</p>
          </div>
        </div>
      )
    }
    return null
  }

  // 獲取指標配置
  const getMetricConfig = () => {
    const configs = {
      totalViews: {
        name: '總觀看次數',
        color: '#3b82f6',
        icon: Eye
      },
      totalLikes: {
        name: '總按讚數',
        color: '#ef4444',
        icon: ThumbsUp
      },
      videoCount: {
        name: '影片數量',
        color: '#10b981',
        icon: Video
      },
      avgViews: {
        name: '平均觀看數',
        color: '#f59e0b',
        icon: Eye
      }
    }
    return configs[metric] || configs.totalViews
  }

  const metricConfig = getMetricConfig()
  const MetricIcon = metricConfig.icon

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            熱門頻道
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">載入頻道資料中...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!channels || channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            熱門頻道
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">沒有頻道資料可顯示</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            熱門頻道
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* 排序方式 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalViews">總觀看次數</SelectItem>
                <SelectItem value="totalLikes">總按讚數</SelectItem>
                <SelectItem value="videoCount">影片數量</SelectItem>
                <SelectItem value="avgViews">平均觀看數</SelectItem>
              </SelectContent>
            </Select>

            {/* 指標選擇 */}
            <div className="flex items-center gap-2">
              <MetricIcon className="w-4 h-4" />
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalViews">總觀看次數</SelectItem>
                  <SelectItem value="totalLikes">總按讚數</SelectItem>
                  <SelectItem value="videoCount">影片數量</SelectItem>
                  <SelectItem value="avgViews">平均觀看數</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 圖表類型 */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">長條圖</SelectItem>
                <SelectItem value="pie">圓餅圖</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  type="number"
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category"
                  dataKey="displayName"
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={metric}
                  fill={metricConfig.color}
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer hover:opacity-80"
                  onClick={(data) => onChannelClick && onChannelClick(data.channelTitle)}
                />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey={metric}
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => onChannelClick && onChannelClick(entry.channelTitle)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {entry.payload.displayName}
                    </span>
                  )}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 頻道列表 */}
        <div className="mt-4 pt-4 border-t">
          <div className="space-y-3">
            {chartData.slice(0, 5).map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    {channel.channelTitle}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {channel.videoCount} 影片
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(channel.totalViews)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatNumber(channel.totalLikes)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChannelClick && onChannelClick(channel.channelTitle)}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 統計摘要 */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{channels.length}</div>
              <div className="text-muted-foreground">總頻道數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {channels.reduce((sum, item) => sum + item.videoCount, 0)}
              </div>
              <div className="text-muted-foreground">總影片數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatNumber(channels.reduce((sum, item) => sum + item.totalViews, 0))}
              </div>
              <div className="text-muted-foreground">總觀看次數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatNumber(channels.reduce((sum, item) => sum + item.totalLikes, 0))}
              </div>
              <div className="text-muted-foreground">總按讚數</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChannelsChart

