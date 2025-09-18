# YouTube 影片分析儀表板 - 完整指南

## 專案概述

這是一個功能完整的 YouTube 影片分析儀表板，可以透過 Google Apps Script 讀取 Google Sheet 中的影片資料，並提供豐富的視覺化分析功能。

### 主要功能

1. **影片列表顯示**
   - YouTube 影片縮圖自動載入
   - 影片標題、頻道、發布日期等詳細資訊
   - 觀看次數、按讚數、留言數統計
   - Hashtag 標籤顯示
   - 點擊可直接跳轉到 YouTube

2. **強大的篩選功能**
   - 日期範圍篩選
   - 地區和類型篩選
   - 頻道名稱搜尋
   - Hashtag 搜尋
   - 最小觀看次數篩選
   - 多種排序方式

3. **趨勢分析圖表**
   - 七天內觀看次數、按讚數、留言數變化趨勢
   - 折線圖和長條圖切換
   - 互動式圖表，支援懸停顯示詳細資訊

4. **熱門 Hashtag 統計**
   - 圓餅圖和長條圖顯示
   - 按使用次數或觀看次數排序
   - 點擊標籤可快速篩選相關影片

5. **熱門頻道分析**
   - 頻道排行榜
   - 多種指標比較（總觀看數、影片數量、平均觀看數等）
   - 點擊頻道可快速篩選該頻道影片

6. **響應式設計**
   - 支援桌面和行動裝置
   - 現代化的 UI 設計
   - 流暢的動畫效果

## 部署指南

### 第一步：設定 Google Apps Script

1. **建立 Google Apps Script 專案**
   - 前往 [Google Apps Script](https://script.google.com/)
   - 點擊「新專案」
   - 將專案重新命名為「YouTube影片分析API」

2. **貼入程式碼**
   - 刪除預設的 `myFunction()` 函數
   - 將 `google_apps_script.js` 檔案中的所有程式碼複製並貼入
   - 修改第12行的 `SHEET_ID` 變數，替換為你的 Google Sheet ID

3. **設定權限**
   - 點擊「執行」按鈕測試程式碼
   - 系統會要求授權，按照提示完成授權流程

4. **部署為 Web 應用程式**
   - 點擊右上角的「部署」→「新增部署作業」
   - 選擇「網路應用程式」類型
   - 設定執行身分為「我」，存取權限為「任何人」
   - 點擊「部署」並複製 Web 應用程式 URL

### 第二步：使用網站

1. **開啟網站**
   - 網站已部署並可直接使用
   - 首次使用會顯示模擬資料

2. **設定 API 連接**
   - 點擊右上角的「API 設定」按鈕
   - 輸入你的 Google Apps Script Web 應用程式 URL
   - 如果留空，將繼續使用模擬資料進行展示

3. **開始使用**
   - 瀏覽影片列表
   - 使用篩選器尋找特定影片
   - 查看趨勢分析和統計圖表
   - 探索熱門標籤和頻道

## 資料格式說明

你的 Google Sheet 應包含以下欄位：

```
rank,videoId,title,channelTitle,publishedAt,region,type,recordDate,url,viewCount,likeCount,commentCount,hashtags,durationSeconds
```

### 欄位說明

- `rank`: 排名
- `videoId`: YouTube 影片 ID
- `title`: 影片標題
- `channelTitle`: 頻道名稱
- `publishedAt`: 發布日期 (ISO 8601 格式)
- `region`: 地區代碼 (如 TW, US, JP)
- `type`: 類型 (如 videos, shorts)
- `recordDate`: 記錄日期 (YYYY-MM-DD)
- `url`: YouTube 影片網址
- `viewCount`: 觀看次數
- `likeCount`: 按讚數
- `commentCount`: 留言數
- `hashtags`: 標籤 (用逗號分隔)
- `durationSeconds`: 影片長度 (秒)

## API 端點說明

Google Apps Script 提供以下 API 端點：

### 獲取影片資料
```
GET [API_URL]?action=getData&page=1&limit=20&sortBy=viewCount&sortOrder=desc
```

### 獲取趨勢資料
```
GET [API_URL]?action=getTrends
```

### 獲取熱門 Hashtag
```
GET [API_URL]?action=getHashtags
```

### 獲取熱門頻道
```
GET [API_URL]?action=getChannels
```

### 篩選參數
- `startDate`: 開始日期 (YYYY-MM-DD)
- `endDate`: 結束日期 (YYYY-MM-DD)
- `region`: 地區代碼
- `type`: 類型
- `channel`: 頻道名稱 (部分匹配)
- `hashtag`: Hashtag (部分匹配)
- `minViews`: 最小觀看次數

## 技術架構

### 前端技術
- **React 18**: 現代化的前端框架
- **Vite**: 快速的建置工具
- **Tailwind CSS**: 實用優先的 CSS 框架
- **shadcn/ui**: 高品質的 UI 元件庫
- **Recharts**: 強大的圖表庫
- **Lucide Icons**: 美觀的圖示庫

### 後端技術
- **Google Apps Script**: 無伺服器的後端服務
- **Google Sheets**: 資料儲存

### 特色功能
- **響應式設計**: 適應各種螢幕尺寸
- **模擬資料模式**: 無需設定即可體驗功能
- **即時篩選**: 快速找到所需影片
- **互動式圖表**: 豐富的視覺化體驗
- **一鍵部署**: 簡單的部署流程

## 常見問題

### Q: 如何找到 Google Sheet ID？
A: 開啟你的 Google Sheet，從網址列複製 ID：
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit#gid=0
```

### Q: 為什麼看不到我的資料？
A: 請確認：
1. Google Apps Script 中的 SHEET_ID 設定正確
2. Google Sheet 的欄位名稱與格式正確
3. Google Apps Script 已正確部署為 Web 應用程式
4. 網站中的 API URL 設定正確

### Q: 可以自訂圖表樣式嗎？
A: 可以，你可以修改原始碼中的圖表配置來自訂顏色、樣式等。

### Q: 支援多少筆資料？
A: Google Apps Script 有執行時間限制（6分鐘），建議單次處理不超過 10,000 筆資料。

## 進階自訂

### 修改圖表顏色
編輯 `src/components/TrendsChart.jsx` 等檔案中的顏色配置。

### 新增篩選條件
在 `src/components/FilterPanel.jsx` 中新增篩選欄位，並在 Google Apps Script 中對應處理。

### 自訂統計指標
修改 `src/components/StatsCards.jsx` 來顯示不同的統計資訊。

## 支援與維護

這個專案提供完整的原始碼，你可以根據需求進行修改和擴展。建議定期備份 Google Apps Script 程式碼和 Google Sheet 資料。

---

**注意事項**：
- Google Apps Script 有每日配額限制
- 大量請求可能會被限制
- 建議實作快取機制以提升效能
- 定期更新依賴套件以確保安全性

