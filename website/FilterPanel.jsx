import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Filter, X, Search } from 'lucide-react'

const FilterPanel = ({ filters, onFiltersChange, onApplyFilters, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== '' && value !== 'all'
    ).length
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            篩選器
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展開'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 日期範圍 */}
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">結束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* 地區 */}
            <div className="space-y-2">
              <Label>地區</Label>
              <Select
                value={filters.region || 'all'}
                onValueChange={(value) => handleFilterChange('region', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇地區" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部地區</SelectItem>
                  <SelectItem value="TW">台灣</SelectItem>
                  <SelectItem value="US">美國</SelectItem>
                  <SelectItem value="JP">日本</SelectItem>
                  <SelectItem value="KR">韓國</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 類型 */}
            <div className="space-y-2">
              <Label>類型</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  <SelectItem value="videos">影片</SelectItem>
                  <SelectItem value="shorts">短影片</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 頻道搜尋 */}
            <div className="space-y-2">
              <Label htmlFor="channel">頻道名稱</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="channel"
                  placeholder="搜尋頻道..."
                  value={filters.channel || ''}
                  onChange={(e) => handleFilterChange('channel', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Hashtag搜尋 */}
            <div className="space-y-2">
              <Label htmlFor="hashtag">Hashtag</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="hashtag"
                  placeholder="搜尋hashtag..."
                  value={filters.hashtag || ''}
                  onChange={(e) => handleFilterChange('hashtag', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 最小觀看次數 */}
            <div className="space-y-2">
              <Label htmlFor="minViews">最小觀看次數</Label>
              <Input
                id="minViews"
                type="number"
                placeholder="例如: 10000"
                value={filters.minViews || ''}
                onChange={(e) => handleFilterChange('minViews', e.target.value)}
              />
            </div>

            {/* 排序方式 */}
            <div className="space-y-2">
              <Label>排序方式</Label>
              <Select
                value={filters.sortBy || 'viewCount'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewCount">觀看次數</SelectItem>
                  <SelectItem value="likeCount">按讚數</SelectItem>
                  <SelectItem value="commentCount">留言數</SelectItem>
                  <SelectItem value="publishedAt">發布日期</SelectItem>
                  <SelectItem value="recordDate">記錄日期</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 排序順序 */}
            <div className="space-y-2">
              <Label>排序順序</Label>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">由高到低</SelectItem>
                  <SelectItem value="asc">由低到高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={onApplyFilters} className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              套用篩選
            </Button>
            <Button variant="outline" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              清除
            </Button>
          </div>

          {/* 顯示已套用的篩選 */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">已套用的篩選:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.startDate && (
                  <Badge variant="secondary">
                    開始: {filters.startDate}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('startDate', '')}
                    />
                  </Badge>
                )}
                {filters.endDate && (
                  <Badge variant="secondary">
                    結束: {filters.endDate}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('endDate', '')}
                    />
                  </Badge>
                )}
                {filters.region && (
                  <Badge variant="secondary">
                    地區: {filters.region}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('region', '')}
                    />
                  </Badge>
                )}
                {filters.channel && (
                  <Badge variant="secondary">
                    頻道: {filters.channel}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('channel', '')}
                    />
                  </Badge>
                )}
                {filters.hashtag && (
                  <Badge variant="secondary">
                    標籤: {filters.hashtag}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange('hashtag', '')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default FilterPanel

