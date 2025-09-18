# 快速開始指南

**專案**: YouTube 影片流量分析網站
**日期**: 2025-09-18

## 概述

此指南將幫助您在 10 分鐘內設定並運行 YouTube 影片流量分析網站，包括 Google Apps Script 後端和 React 前端的完整部署。

## 前置需求

### 必要工具
- Node.js 18+ 和 npm
- Google 帳號
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

### 技能需求
- 基本的 JavaScript/TypeScript 知識
- Google Sheets 使用經驗

## 第一步：準備 Google Sheets 資料

### 1. 建立 Google Sheets
1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新的試算表，命名為「YouTube Analytics Data」
3. 建立以下工作表：
   - `Videos`：影片資料
   - `Channels`：頻道資料
   - `Hashtags`：標籤資料

### 2. 設定資料結構

**Videos 工作表欄位** (A1:L1)：
```
ID | Title | ChannelName | PublishedAt | ViewCount | LikeCount | CommentCount | Tags | Category | Region | ThumbnailURL | Duration
```

**範例資料** (A2)：
```
vid001 | 如何學習程式設計 | TechChannel | 2025-09-15 | 15420 | 342 | 28 | 程式設計,教學,入門 | Education | TW | https://img.youtube.com/vi/vid001/maxresdefault.jpg | 1200
```

### 3. 取得 Sheets ID
從 URL 複製 Sheets ID：
```
https://docs.google.com/spreadsheets/d/{SHEETS_ID}/edit
```

## 第二步：部署 Google Apps Script 後端

### 1. 建立 Apps Script 專案
1. 前往 [Google Apps Script](https://script.google.com)
2. 點擊「新專案」
3. 將專案命名為「YouTube Analytics API」

### 2. 新增程式碼
```javascript
// Code.gs
const SHEETS_ID = 'YOUR_SHEETS_ID_HERE'; // 替換為您的 Sheets ID

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;

    switch(action) {
      case 'getData':
        result = getVideoData(e.parameter);
        break;
      case 'getTrends':
        result = getTrendData(e.parameter);
        break;
      case 'getHashtags':
        result = getHashtagData(e.parameter);
        break;
      case 'getChannels':
        result = getChannelData(e.parameter);
        break;
      default:
        throw new Error('不支援的操作: ' + action);
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

function getVideoData(params) {
  const sheet = SpreadsheetApp.openById(SHEETS_ID).getSheetByName('Videos');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  let filteredRows = rows;

  // 日期篩選
  if (params.dateFrom || params.dateTo) {
    filteredRows = filteredRows.filter(row => {
      const publishedAt = new Date(row[3]);
      if (params.dateFrom && publishedAt < new Date(params.dateFrom)) return false;
      if (params.dateTo && publishedAt > new Date(params.dateTo)) return false;
      return true;
    });
  }

  // 頻道篩選
  if (params.channel) {
    filteredRows = filteredRows.filter(row =>
      row[2].toLowerCase().includes(params.channel.toLowerCase())
    );
  }

  // 最少觀看數篩選
  if (params.minViews) {
    const minViews = parseInt(params.minViews);
    filteredRows = filteredRows.filter(row => row[4] >= minViews);
  }

  // 轉換為物件格式
  const videos = filteredRows.map(row => ({
    id: row[0],
    title: row[1],
    channelName: row[2],
    publishedAt: row[3],
    viewCount: row[4],
    likeCount: row[5],
    commentCount: row[6],
    tags: row[7] ? row[7].split(',') : [],
    category: row[8],
    region: row[9],
    thumbnailUrl: row[10],
    duration: row[11]
  }));

  return {
    data: videos,
    total: videos.length,
    filtered: rows.length !== filteredRows.length
  };
}

function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      ...data
    }))
    .setMimeType(ContentService.MimeType.TEXT);
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: message
    }))
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### 3. 部署為 Web 應用程式
1. 點擊「部署」→「新增部署作業」
2. 類型選擇「Web 應用程式」
3. 說明填入「YouTube Analytics API v1.0」
4. 執行身分：選擇「我」
5. 存取權限：選擇「任何人」
6. 點擊「部署」
7. 複製「Web 應用程式」URL

## 第三步：建立 React 前端

### 1. 建立 React 專案
```bash
# 建立專案
npx create-react-app youtube-analytics --template typescript
cd youtube-analytics

# 安裝依賴
npm install recharts tailwindcss @headlessui/react lucide-react
```

### 2. 設定 Tailwind CSS
```bash
# 初始化 Tailwind
npx tailwindcss init -p

# 編輯 tailwind.config.js
```

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. 建立 API 服務
```typescript
// src/services/api.ts
const API_BASE_URL = 'YOUR_APPS_SCRIPT_URL_HERE'; // 替換為您的 Apps Script URL

export interface VideoData {
  id: string;
  title: string;
  channelName: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  category: string;
  region: string;
  thumbnailUrl: string;
  duration: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  total?: number;
  error?: string;
}

export const apiService = {
  async getVideos(params: {
    dateFrom?: string;
    dateTo?: string;
    channel?: string;
    minViews?: number;
  }): Promise<ApiResponse<VideoData[]>> {
    const queryParams = new URLSearchParams({
      action: 'getData',
      ...params
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    const text = await response.text();
    return JSON.parse(text);
  }
};
```

### 4. 建立主要組件
```typescript
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { apiService, VideoData } from '../services/api';

export const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVideos({});
      if (response.success && response.data) {
        setVideos(response.data);
      } else {
        setError(response.error || '載入資料失敗');
      }
    } catch (err) {
      setError('網路錯誤，請檢查連線');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">YouTube 影片分析</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">總影片數</h2>
          <p className="text-3xl font-bold text-blue-600">{videos.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">總觀看數</h2>
          <p className="text-3xl font-bold text-green-600">
            {videos.reduce((sum, v) => sum + v.viewCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">總按讚數</h2>
          <p className="text-3xl font-bold text-red-600">
            {videos.reduce((sum, v) => sum + v.likeCount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">標題</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">頻道</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">觀看數</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">按讚數</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">發布日期</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{video.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {video.channelName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {video.viewCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {video.likeCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(video.publishedAt).toLocaleDateString('zh-TW')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 5. 更新主應用程式
```typescript
// src/App.tsx
import React from 'react';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <Dashboard />
    </div>
  );
}

export default App;
```

## 第四步：測試和驗證

### 1. 啟動開發伺服器
```bash
npm start
```

### 2. 驗證功能
1. **資料載入**：確認影片資料正確顯示
2. **統計卡片**：檢查總計數字是否正確
3. **響應式設計**：在不同螢幕尺寸測試
4. **錯誤處理**：嘗試輸入錯誤的 API URL 測試錯誤訊息

### 3. 效能檢查
1. 首次載入時間應少於 3 秒
2. 大量資料（1000+ 筆）載入順暢
3. 行動裝置操作流暢

## 第五步：部署到生產環境

### 1. 建立生產版本
```bash
npm run build
```

### 2. 部署選項
- **Netlify**: 拖拽 `build` 資料夾到 Netlify
- **Vercel**: 連接 GitHub 儲存庫自動部署
- **GitHub Pages**: 使用 gh-pages 套件部署

## 故障排除

### 常見問題

**CORS 錯誤**
- 確認 Google Apps Script 使用 `ContentService.MimeType.TEXT`
- 檢查部署權限設定為「任何人」

**資料無法載入**
- 驗證 Sheets ID 正確
- 確認工作表名稱和欄位順序
- 檢查 Apps Script URL 是否正確

**效能問題**
- 大量資料考慮分頁載入
- 使用快取減少 API 呼叫
- 優化圖表渲染

## 下一步

完成快速開始後，您可以：
1. 新增圖表視覺化（趨勢圖、圓餅圖）
2. 實作進階篩選功能
3. 加入文字雲和標籤分析
4. 建立響應式行動版本
5. 新增資料匯出功能

## 支援

如有問題，請檢查：
1. Google Apps Script 執行記錄
2. 瀏覽器開發者工具控制台
3. 網路請求狀態

這個快速開始指南提供了完整的端到端設定流程，確保您能快速建立可運作的 YouTube 分析系統。