import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { useState } from 'react'
import { TrendingUp, Eye, ThumbsUp, MessageCircle } from 'lucide-react'

const TrendsChart = ({ trends, loading }) => {
  const [chartType, setChartType] = useState('line')
  const [metric, setMetric] = useState('totalViews')

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

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    })
  }

  // 準備圖表資料
  const chartData = trends.map(trend => ({
    ...trend,
    date: formatDate(trend.date),
    totalViews: parseInt(trend.totalViews) || 0,
    totalLikes: parseInt(trend.totalLikes) || 0,
    totalComments: parseInt(trend.totalComments) || 0,
    videoCount: parseInt(trend.videoCount) || 0
  }))

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
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
      totalComments: {
        name: '總留言數',
        color: '#8b5cf6',
        icon: MessageCircle
      },
      videoCount: {
        name: '影片數量',
        color: '#10b981',
        icon: TrendingUp
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
            <TrendingUp className="w-5 h-5" />
            趨勢分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">載入趨勢資料中...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            趨勢分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">沒有趨勢資料可顯示</div>
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
            <TrendingUp className="w-5 h-5" />
            趨勢分析
          </CardTitle>
          <div className="flex items-center gap-4">
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
                  <SelectItem value="totalComments">總留言數</SelectItem>
                  <SelectItem value="videoCount">影片數量</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 圖表類型選擇 */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">折線圖</SelectItem>
                <SelectItem value="bar">長條圖</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={metricConfig.color}
                  strokeWidth={2}
                  dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: metricConfig.color, strokeWidth: 2 }}
                  name={metricConfig.name}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey={metric}
                  fill={metricConfig.color}
                  name={metricConfig.name}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* 趨勢摘要 */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatNumber(chartData.reduce((sum, item) => sum + item.totalViews, 0))}
              </div>
              <div className="text-muted-foreground">總觀看次數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatNumber(chartData.reduce((sum, item) => sum + item.totalLikes, 0))}
              </div>
              <div className="text-muted-foreground">總按讚數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatNumber(chartData.reduce((sum, item) => sum + item.totalComments, 0))}
              </div>
              <div className="text-muted-foreground">總留言數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {chartData.reduce((sum, item) => sum + item.videoCount, 0)}
              </div>
              <div className="text-muted-foreground">總影片數</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrendsChart

