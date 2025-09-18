import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useState } from 'react'
import { Hash, TrendingUp } from 'lucide-react'

const HashtagsChart = ({ hashtags, loading, onHashtagClick }) => {
  const [chartType, setChartType] = useState('pie')
  const [sortBy, setSortBy] = useState('count')

  // 顏色配置
  const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  // 格式化數字
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num?.toString() || '0'
  }

  // 準備圖表資料
  const chartData = hashtags
    .sort((a, b) => {
      if (sortBy === 'count') {
        return b.count - a.count
      } else {
        return b.totalViews - a.totalViews
      }
    })
    .slice(0, 10) // 只顯示前10個
    .map((hashtag, index) => ({
      ...hashtag,
      color: COLORS[index % COLORS.length],
      displayName: hashtag.hashtag.length > 15 
        ? hashtag.hashtag.substring(0, 15) + '...' 
        : hashtag.hashtag
    }))

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.hashtag}</p>
          <p className="text-sm">使用次數: {data.count}</p>
          <p className="text-sm">總觀看數: {formatNumber(data.totalViews)}</p>
        </div>
      )
    }
    return null
  }

  // 自定義標籤
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null // 不顯示小於5%的標籤
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            熱門 Hashtag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">載入標籤資料中...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hashtags || hashtags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            熱門 Hashtag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">沒有標籤資料可顯示</div>
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
            <Hash className="w-5 h-5" />
            熱門 Hashtag
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* 排序方式 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">使用次數</SelectItem>
                <SelectItem value="totalViews">觀看次數</SelectItem>
              </SelectContent>
            </Select>
            
            {/* 圖表類型 */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">圓餅圖</SelectItem>
                <SelectItem value="bar">長條圖</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey={sortBy === 'count' ? 'count' : 'totalViews'}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => onHashtagClick && onHashtagClick(entry.hashtag)}
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
            ) : (
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
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={sortBy === 'count' ? 'count' : 'totalViews'}
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer hover:opacity-80"
                  onClick={(data) => onHashtagClick && onHashtagClick(data.hashtag)}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 標籤列表 */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {chartData.slice(0, 15).map((hashtag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onHashtagClick && onHashtagClick(hashtag.hashtag)}
              >
                {hashtag.hashtag}
                <span className="ml-1 text-xs opacity-70">
                  ({hashtag.count})
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* 統計摘要 */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{hashtags.length}</div>
              <div className="text-muted-foreground">總標籤數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {hashtags.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-muted-foreground">總使用次數</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatNumber(hashtags.reduce((sum, item) => sum + item.totalViews, 0))}
              </div>
              <div className="text-muted-foreground">總觀看次數</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HashtagsChart

