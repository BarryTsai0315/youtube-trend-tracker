// API 服務層
import { createMockApiResponse } from './mockData.js'

class YouTubeAnalyticsAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.useMockData = !baseUrl || baseUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
  }

  // 建構查詢參數
  buildQueryParams(params) {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })
    
    return queryParams.toString()
  }

  // 發送請求
  async makeRequest(action, params = {}) {
    try {
      // 如果使用模擬資料
      if (this.useMockData) {
        console.log('使用模擬資料:', action, params)
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 500))
        return createMockApiResponse(action, params)
      }

      const queryParams = this.buildQueryParams({ action, ...params })
      const url = `${this.baseUrl}?${queryParams}`
      
      console.log('API Request:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // 獲取影片資料
  async getVideos(filters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortBy: filters.sortBy || 'viewCount',
      sortOrder: filters.sortOrder || 'desc',
      startDate: filters.startDate,
      endDate: filters.endDate,
      region: filters.region,
      type: filters.type,
      channel: filters.channel,
      hashtag: filters.hashtag,
      minViews: filters.minViews
    }

    return await this.makeRequest('getData', params)
  }

  // 獲取趨勢資料
  async getTrends(filters = {}) {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      region: filters.region,
      type: filters.type
    }

    return await this.makeRequest('getTrends', params)
  }

  // 獲取熱門 Hashtag
  async getHashtags(filters = {}) {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      region: filters.region,
      type: filters.type
    }

    return await this.makeRequest('getHashtags', params)
  }

  // 獲取熱門頻道
  async getChannels(filters = {}) {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      region: filters.region,
      type: filters.type
    }

    return await this.makeRequest('getChannels', params)
  }
}

// 建立 API 實例
// 從 localStorage 讀取 API URL，如果沒有則使用預設值
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('youtube_api_url') || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
  }
  return 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
}

export const youtubeAPI = new YouTubeAnalyticsAPI(getApiUrl())

// 更新 API URL 的函數
export const updateApiUrl = (newUrl) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('youtube_api_url', newUrl)
  }
  // 重新建立 API 實例
  const updatedAPI = new YouTubeAnalyticsAPI(newUrl)
  Object.setPrototypeOf(youtubeAPI, updatedAPI)
  Object.assign(youtubeAPI, updatedAPI)
}

// 導出 API 類別以便測試或建立其他實例
export default YouTubeAnalyticsAPI

