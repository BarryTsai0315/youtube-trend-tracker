import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart3, TrendingUp, Hash, Users, RefreshCw, Settings } from 'lucide-react'

import VideoCard from './components/VideoCard.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import StatsCards from './components/StatsCards.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import Pagination from './components/Pagination.jsx'
import TrendsChart from './components/TrendsChart.jsx'
import HashtagsChart from './components/HashtagsChart.jsx'
import ChannelsChart from './components/ChannelsChart.jsx'
import { useYouTubeData } from './hooks/useYouTubeData.js'
import './App.css'

function App() {
  const {
    videos,
    trends,
    hashtags,
    channels,
    stats,
    pagination,
    loading,
    error,
    fetchVideos,
    fetchAllData,
    updatePagination
  } = useYouTubeData()

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    region: '',
    type: '',
    channel: '',
    hashtag: '',
    minViews: '',
    sortBy: 'viewCount',
    sortOrder: 'desc'
  })

  const [activeTab, setActiveTab] = useState('videos')
  const [apiConfigured, setApiConfigured] = useState(false)

  // 檢查 API 是否已配置
  useEffect(() => {
    const checkApiConfig = () => {
      // 檢查 API URL 是否已設定
      const apiUrl = localStorage.getItem('youtube_api_url')
      if (apiUrl && apiUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        setApiConfigured(true)
      } else {
        // 如果沒有設定 API，使用模擬資料模式
        setApiConfigured(true)
      }
    }
    
    checkApiConfig()
  }, [])

  // 初始載入資料
  useEffect(() => {
    if (apiConfigured) {
      fetchAllData(filters)
    }
  }, [apiConfigured])

  // 處理篩選器變更
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  // 套用篩選器
  const handleApplyFilters = () => {
    updatePagination({ currentPage: 1 })
    fetchAllData(filters)
  }

  // 清除篩選器
  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      region: '',
      type: '',
      channel: '',
      hashtag: '',
      minViews: '',
      sortBy: 'viewCount',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    updatePagination({ currentPage: 1 })
    fetchAllData(clearedFilters)
  }

  // 處理分頁變更
  const handlePageChange = (page) => {
    updatePagination({ currentPage: page })
    fetchVideos({ ...filters, page })
  }

  // 處理每頁顯示數量變更
  const handleItemsPerPageChange = (itemsPerPage) => {
    updatePagination({ currentPage: 1, itemsPerPage })
    fetchVideos({ ...filters, page: 1, limit: itemsPerPage })
  }

  // 重新整理資料
  const handleRefresh = () => {
    fetchAllData(filters)
  }

  // API 配置
  const handleApiConfig = () => {
    const url = prompt('請輸入您的 Google Apps Script Web 應用程式 URL (留空使用模擬資料):')
    if (url !== null) { // 使用者點擊確定（包括空字串）
      if (url.trim() === '') {
        // 清除 API URL，使用模擬資料
        localStorage.removeItem('youtube_api_url')
      } else {
        localStorage.setItem('youtube_api_url', url)
      }
      // 重新載入頁面以套用新的 API URL
      window.location.reload()
    }
  }

  // 檢查是否使用模擬資料
  const isUsingMockData = () => {
    const apiUrl = localStorage.getItem('youtube_api_url')
    return !apiUrl || apiUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">YouTube 影片分析儀表板</h1>
              {isUsingMockData() && (
                <Badge variant="secondary" className="text-xs">
                  模擬資料
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新整理
              </Button>
              <Button variant="outline" size="sm" onClick={handleApiConfig}>
                <Settings className="w-4 h-4 mr-2" />
                API 設定
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 錯誤提示 */}
        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertDescription>
              載入資料時發生錯誤: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 統計卡片 */}
        <StatsCards stats={stats} />

        {/* 篩選面板 */}
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* 主要內容區域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              影片列表
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              趨勢分析
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              熱門標籤
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              熱門頻道
            </TabsTrigger>
          </TabsList>

          {/* 影片列表 */}
          <TabsContent value="videos" className="space-y-6">
            {loading.videos ? (
              <LoadingSpinner text="載入影片資料中..." />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((video, index) => (
                    <VideoCard key={`${video.videoId}-${index}`} video={video} />
                  ))}
                </div>
                
                {videos.length === 0 && !loading.videos && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">沒有找到符合條件的影片</p>
                  </div>
                )}

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </>
            )}
          </TabsContent>

          {/* 趨勢分析 */}
          <TabsContent value="trends">
            <TrendsChart trends={trends} loading={loading.trends} />
          </TabsContent>

          {/* 熱門標籤 */}
          <TabsContent value="hashtags">
            <HashtagsChart 
              hashtags={hashtags} 
              loading={loading.hashtags}
              onHashtagClick={(hashtag) => {
                const newFilters = { ...filters, hashtag }
                setFilters(newFilters)
                setActiveTab('videos')
                fetchAllData(newFilters)
              }}
            />
          </TabsContent>

          {/* 熱門頻道 */}
          <TabsContent value="channels">
            <ChannelsChart 
              channels={channels} 
              loading={loading.channels}
              onChannelClick={(channel) => {
                const newFilters = { ...filters, channel }
                setFilters(newFilters)
                setActiveTab('videos')
                fetchAllData(newFilters)
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

