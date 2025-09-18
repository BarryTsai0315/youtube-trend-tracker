import { useState, useEffect, useCallback } from 'react'
import { youtubeAPI } from '../services/api.js'

// 自定義 Hook 用於管理 YouTube 資料
export const useYouTubeData = () => {
  const [videos, setVideos] = useState([])
  const [trends, setTrends] = useState([])
  const [hashtags, setHashtags] = useState([])
  const [channels, setChannels] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  })
  const [loading, setLoading] = useState({
    videos: false,
    trends: false,
    hashtags: false,
    channels: false
  })
  const [error, setError] = useState(null)

  // 設定載入狀態
  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }

  // 計算統計資料
  const calculateStats = useCallback((videoData) => {
    if (!videoData || videoData.length === 0) {
      return {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
      }
    }

    return {
      totalVideos: videoData.length,
      totalViews: videoData.reduce((sum, video) => sum + (parseInt(video.viewCount) || 0), 0),
      totalLikes: videoData.reduce((sum, video) => sum + (parseInt(video.likeCount) || 0), 0),
      totalComments: videoData.reduce((sum, video) => sum + (parseInt(video.commentCount) || 0), 0)
    }
  }, [])

  // 獲取影片資料
  const fetchVideos = useCallback(async (filters = {}) => {
    setLoadingState('videos', true)
    setError(null)
    
    try {
      const response = await youtubeAPI.getVideos({
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      })
      
      setVideos(response.data || [])
      setPagination(prev => ({
        ...prev,
        currentPage: response.page || 1,
        totalPages: response.totalPages || 1,
        totalItems: response.total || 0
      }))
      
      // 計算統計資料
      const statsData = calculateStats(response.data)
      setStats(statsData)
      
    } catch (err) {
      setError(err.message)
      console.error('Error fetching videos:', err)
    } finally {
      setLoadingState('videos', false)
    }
  }, [pagination.currentPage, pagination.itemsPerPage, calculateStats])

  // 獲取趨勢資料
  const fetchTrends = useCallback(async (filters = {}) => {
    setLoadingState('trends', true)
    
    try {
      const response = await youtubeAPI.getTrends(filters)
      setTrends(response.trends || [])
    } catch (err) {
      console.error('Error fetching trends:', err)
    } finally {
      setLoadingState('trends', false)
    }
  }, [])

  // 獲取熱門 Hashtag
  const fetchHashtags = useCallback(async (filters = {}) => {
    setLoadingState('hashtags', true)
    
    try {
      const response = await youtubeAPI.getHashtags(filters)
      setHashtags(response.hashtags || [])
    } catch (err) {
      console.error('Error fetching hashtags:', err)
    } finally {
      setLoadingState('hashtags', false)
    }
  }, [])

  // 獲取熱門頻道
  const fetchChannels = useCallback(async (filters = {}) => {
    setLoadingState('channels', true)
    
    try {
      const response = await youtubeAPI.getChannels(filters)
      setChannels(response.channels || [])
    } catch (err) {
      console.error('Error fetching channels:', err)
    } finally {
      setLoadingState('channels', false)
    }
  }, [])

  // 獲取所有資料
  const fetchAllData = useCallback(async (filters = {}) => {
    await Promise.all([
      fetchVideos(filters),
      fetchTrends(filters),
      fetchHashtags(filters),
      fetchChannels(filters)
    ])
  }, [fetchVideos, fetchTrends, fetchHashtags, fetchChannels])

  // 更新分頁
  const updatePagination = useCallback((updates) => {
    setPagination(prev => ({ ...prev, ...updates }))
  }, [])

  // 重置資料
  const resetData = useCallback(() => {
    setVideos([])
    setTrends([])
    setHashtags([])
    setChannels([])
    setStats({})
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    })
    setError(null)
  }, [])

  return {
    // 資料
    videos,
    trends,
    hashtags,
    channels,
    stats,
    pagination,
    loading,
    error,
    
    // 方法
    fetchVideos,
    fetchTrends,
    fetchHashtags,
    fetchChannels,
    fetchAllData,
    updatePagination,
    resetData
  }
}

export default useYouTubeData

